import 'es6-collections';
import 'reflect-metadata';
import {Definition} from "./definition";
import {FactoryMethod, DefinitionObjectType} from './definition';
import {FactoryAutoProxy} from "./factoryautoproxy";


export class ContainerResolver {

    /**
     * Definitions
     */
    private definitions: Map<string|Function, Definition>;


    /**
     * Singleton objects
     * @type {WeakMap<Definition, Object>}
     */
    private singletonObjects: WeakMap<Definition, Object>;


    public constructor() {
        this.singletonObjects = new WeakMap<Definition, Object>();
        this.definitions = new Map<string|Function, Definition>();
    }

    /**
     * Add definition
     * @param key
     * @param def
     */
    public addDefinition(key: string|Function, def: Definition) {
        this.definitions.set(key, def);
    }

    /**
     * Obtain definition
     * @param key
     * @returns {Definition|V}
     */
    public getDefinition(key): Definition {
        return this.definitions.get(key);
    }

    /**
     * Has definition
     * @param key
     * @returns {boolean}
     */
    public hasDefinition(key): Boolean {
        return this.definitions.has(key);
    }

    /**
     * Resolve definition
     * @param definition
     * @param method
     * @param constructorArgs
     * @param strict
     */
    public resolve(definition: string|Function, method?: FactoryMethod, constructorArgs?: Array<any>, strict = true): any {
        let internalDefinition: Definition = null;
        // bind autofactories to factory auto proxy instance
        if (typeof definition === "function" && Reflect.hasOwnMetadata("inject:autofactory", definition)) {
            let factoryProxy = new FactoryAutoProxy(this, definition);
            internalDefinition = new Definition(definition, factoryProxy, null, FactoryMethod.OBJECT);
        } else {
            internalDefinition = this.definitions.get(definition);
        }

        if (!internalDefinition) {
            if (strict || typeof definition === 'string') {
                throw new Error(`Unknown definition: ${definition.toString()}`);
            } else {
                internalDefinition = new Definition(definition, definition);
            }
        }

        let constructor = this.resolveDefinition(internalDefinition);
        let constructorArguments = [];

        if (internalDefinition.definitionObjectType !== DefinitionObjectType.CALLABLE && internalDefinition.method !== FactoryMethod.OBJECT) {
            if (typeof constructorArgs !== 'undefined' && constructorArgs.length > 0) {
                constructorArguments = constructorArgs;
            } else {
                constructorArguments = this.resolveConstructorArguments(internalDefinition, constructor, strict);
            }
        }


        let resolveMethod = internalDefinition.method;
        if (typeof method !== "undefined" && internalDefinition.method != FactoryMethod.OBJECT) {
            resolveMethod = method;
        }

        switch (resolveMethod) {
            case FactoryMethod.SINGLETON:
                if (!this.singletonObjects.has(internalDefinition)) {
                    if (internalDefinition.definitionObjectType == DefinitionObjectType.CALLABLE) {
                        this.singletonObjects.set(internalDefinition, constructor.call(this));
                    } else {
                        let obj = new constructor(...constructorArguments);
                        this.resolveProperties(obj, strict);
                        this.singletonObjects.set(internalDefinition, obj);
                    }
                }
                return this.singletonObjects.get(internalDefinition);
                break;
            case FactoryMethod.FACTORY:
                if (internalDefinition.definitionObjectType == DefinitionObjectType.CALLABLE) {
                    return constructor.call(this);
                } else {
                    let obj = new constructor(...constructorArguments);
                    this.resolveProperties(obj, strict);
                    return obj;
                }
                break;
            case FactoryMethod.OBJECT:
                return constructor;
                break;
        }
    }

    /**
     * Resolves definition
     * @private
     * @param definition
     */
    private resolveDefinition(definition: Definition): any {
        if (definition.definitionObjectType == DefinitionObjectType.CALLABLE || definition.method == FactoryMethod.OBJECT) {
            return definition.definitionConstructor;
        }
        return this.resolveConstructor(definition);
    }

    /**
     * Injects properties into object
     * @param object
     * @param strict
     */
    private resolveProperties(object: Object, strict = true) {
        let test = Reflect.getMetadataKeys(object);
        for (let key in object) {
            if (Reflect.hasMetadata("inject:property", object, key)) {
                let method: FactoryMethod = Reflect.getMetadata("inject:property", object, key);
                let paramDefinition: string|Function;
                if (Reflect.hasMetadata('inject:property:literal', object, key)) {
                    // Resolve property by string literal
                    paramDefinition = Reflect.getMetadata('inject:property:literal', object, key);
                } else {
                    // Resolve property by typehint
                    paramDefinition = Reflect.getMetadata('design:type', object, key);
                }
                let resolvedObj;
                try {
                    resolvedObj = this.resolve(paramDefinition, method, undefined, strict);
                    object[key] = resolvedObj;
                } catch (e) {
                    if (!Reflect.hasMetadata('inject:property:optional', object, key)) {
                        throw new Error(`Unknown definition: ${paramDefinition.toString()}`)
                    }
                }
            }
        }
    }

    /**
     * Resolves constructor by looking in definition chain
     * @private
     * @param definition
     */
    private resolveConstructor(definition: Definition) {
        let constructor = definition.definitionConstructor;

        if (this.definitions.has(constructor) && constructor != definition.key) {
            constructor = this.resolveConstructor(this.definitions.get(constructor));
        }
        return constructor;
    }

    /**
     * Resolves constructor arguments from constructor injection or definition chain
     * @param definition
     * @param constructor
     * @param strict
     */
    private resolveConstructorArguments(definition: Definition, constructor: Function, strict = true): Array<any> {
        let constructorArguments = [];
        if (Reflect.hasOwnMetadata("inject:constructor", constructor)) {
            // Resolve constructor dependencies
            let dependencies = Reflect.getOwnMetadata("design:paramtypes", constructor);
            let resolvedDeps = [];
            if (dependencies) {
                for (let i = 0; i < dependencies.length; i++) {
                    let dep = dependencies[i];
                    let method = Reflect.getOwnMetadata('inject:constructor:param' + i + ':method', constructor);
                    // Use literal for resolving if specified
                    if (Reflect.hasOwnMetadata('inject:constructor:param' + i + ':literal', constructor)) {
                        dep = Reflect.getOwnMetadata('inject:constructor:param' + i + ':literal', constructor);
                    }

                    let resolvedDep;
                    try {
                        resolvedDep = this.resolve(dep, method, undefined, strict);
                    } catch (e) {
                        if (Reflect.hasOwnMetadata('inject:constructor:param' + i + ':optional', constructor)) {
                            resolvedDep = null;
                        } else {
                            throw e;
                        }
                    }

                    resolvedDeps.push(resolvedDep);
                }
            }
            constructorArguments = resolvedDeps;
        } else {
            // No constructor injection, lookup for constructor arguments in definition
            constructorArguments = this.resolveConstructorArgumentsFromDefinition(definition);
            if (!constructorArguments) {
                constructorArguments = [];
            }
        }
        return constructorArguments;
    }

    /**
     * Resolves constructor arguments from definition chain
     * @private
     * @param definition
     * @returns {Array<any>}
     */
    private resolveConstructorArgumentsFromDefinition(definition: Definition): Array<any> {
        let constructorArgs = definition.constructorArgs;
        if (!constructorArgs && this.definitions.has(definition.definitionConstructor) && (definition.definitionConstructor != definition.key)) {
            constructorArgs = this.resolveConstructorArgumentsFromDefinition(this.definitions.get(definition.definitionConstructor));
        }
        return constructorArgs;
    }
}
