/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import 'es6-collections';
import 'reflect-metadata';
import {Definition, FactoryMethod, DefinitionObjectType} from './definition';

/**
 * DI Container class
 */
export class Container {

    /**
     * Definition map
     * @type {Map}
     */
    private definitions: Map<string|Function, Definition>;

    /**
     * Singleton objects
     * @type {WeakMap<Definition, Object>}
     */
    private singletonObjects: WeakMap<Definition, Object>;

    /**
     * If true allows to resolve unregistered definitions
     * @type {boolean}
     */
    private allowUnregisteredResolve: Boolean = false;

    /**
     * @constructor
     */
    public constructor() {
        this.definitions = new Map<string|Function, Definition>();
        this.singletonObjects = new WeakMap<Definition, Object>();
    }

    /**
     * Sets if unregistered definitions are allowed to be resolved
     * This is useful to avoid many stub container.register(Class) class, but you need to be careful to not create
     * interface instead of implementation or use abstract classes (available from typescript 1.6) as interface classes
     * @param allow true to allow, false to disallow
     * @example
     *      import Service from './service'
     *
     *      @ConstructorInject
     *      class Controller {
     *          private service: Service;
     *          public constructor(myService: Service} {
     *              this.service = myService
     *          }
     *      }
     *
     *      let controller = container.resolve(Controller);
     */
    public setAllowUnregisteredResolving(allow: Boolean) {
        this.allowUnregisteredResolve = allow;
    }

    /**
     * Register implementation to interface object
     * @param definition
     * @param implementationOrConstructorArgs
     * @param constructorArgs
     */
    public register(definition: string|Function, implementationOrConstructorArgs?: Object|Function|Array<any>, constructorArgs?: Array<any>): Definition {
        let def: Definition;
        if (!implementationOrConstructorArgs) {
            // specific case: register(Class)
            if (typeof definition === "string") {
                throw new Error("Can't register just symbol");
            }
            def = new Definition(definition, definition);
        } else {
            if (typeof definition === "function") {
                // Cases:
                //  1. register(Class, Class)
                //  2. register(Class, [constructorArgs])
                //  3. register(Class, Class, [constructorArgs])
                //  4. register(Class, object)
                if (implementationOrConstructorArgs instanceof Array) {
                    // Case 2.
                    def = new Definition(definition, definition, implementationOrConstructorArgs);
                } else {
                    if (typeof implementationOrConstructorArgs == "object") {
                        // Case 4
                        def = new Definition(definition, implementationOrConstructorArgs, null, FactoryMethod.OBJECT);
                    } else {
                        // Cases 1, 3
                        def = new Definition(definition, implementationOrConstructorArgs, constructorArgs);
                    }
                }
            } else {
                // Cases:
                //  1. register('string', Class)
                //  2. register('string', Class, [constructorArgs])
                //  4. register('string', 'number|string|object|boolean')
                if (typeof  implementationOrConstructorArgs === "function") {
                    // Case  1,2
                    def = new Definition(definition, implementationOrConstructorArgs, constructorArgs);
                } else {
                    // Case 3
                    def = new Definition(definition, implementationOrConstructorArgs, null, FactoryMethod.OBJECT);
                }

            }
        }
        this.definitions.set(definition, def);
        return def;
    }

    /**
     * Register definition as callable. The callable will be invoked instead calling via new()
     */
    public registerCallable(definition: string|Function, callable: () => any): Definition {
        let def: Definition;
        def = new Definition(definition, callable, null, FactoryMethod.SINGLETON, DefinitionObjectType.CALLABLE);
        this.definitions.set(definition, def);
        return def;
    }

    /**
     * Resolves definition
     * @param definition
     * @param method
     */
    public resolve(definition: string|Function, method?: FactoryMethod): any {
        let internalDefinition = this.definitions.get(definition);
        if (!internalDefinition) {
            if (!this.allowUnregisteredResolve || typeof definition !== "function") {
                throw new Error(`Unknown definition ${definition.toString()}`);
            } else if (typeof definition === "function") {
                internalDefinition = this.register(definition);
            }
        }
        let constructor = this.resolveDefinition(internalDefinition);

        let resolveMethod = internalDefinition.method;
        if (typeof method !== 'undefined') {
            resolveMethod = method;
        }

        switch (resolveMethod) {
            case FactoryMethod.SINGLETON:
                if (!this.singletonObjects.has(internalDefinition)) {
                    if (internalDefinition.definitionObjectType == DefinitionObjectType.CALLABLE) {
                        this.singletonObjects.set(internalDefinition, constructor.call(this));
                    } else {
                        let obj = new constructor();
                        this.resolveParameters(obj);
                        this.singletonObjects.set(internalDefinition, obj);
                    }
                }
                return this.singletonObjects.get(internalDefinition);
                break;
            case FactoryMethod.FACTORY:
                if (internalDefinition.definitionObjectType == DefinitionObjectType.CALLABLE) {
                    return constructor.call(this);
                } else {
                    let obj = new constructor();
                    this.resolveParameters(obj);
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
        let constructor = this.resolveConstructor(definition);

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
                        resolvedDep = this.resolve(dep, method);
                    } catch (e) {
                        // Pass null if @Optional
                        if (Reflect.hasOwnMetadata('inject:constructor:param' + i + ':optional', constructor)) {
                            resolvedDep = null;
                        } else {
                            // Rethrow
                            throw e;
                        }
                    }

                    resolvedDeps.push(resolvedDep);
                }
            }
            constructorArguments = resolvedDeps;
        } else {
            // No constructor injection, lookup for constructor arguments in definition
            constructorArguments = this.resolveConstructorArguments(definition);
            if (!constructorArguments) {
                constructorArguments = [];
            }
        }

        let newConstructor = function () {
            constructor.apply(this, constructorArguments);
        };
        newConstructor.prototype = constructor.prototype;
        return newConstructor;
    }

    /**
     * Injects parameters into object
     * @param object
     */
    private resolveParameters(object: Object) {
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
                    resolvedObj = this.resolve(paramDefinition, method);
                    object[key] = resolvedObj;
                } catch (e) {
                    if (!Reflect.hasMetadata('inject:property:optional', object, key)) {
                        throw e;
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
     * Resolves constructor arguments from definition chain
     * @private
     * @param definition
     * @returns {Array<any>}
     */
    private resolveConstructorArguments(definition: Definition): Array<any> {
        let constructorArgs = definition.constructorArgs;
        if (!constructorArgs && this.definitions.has(definition.definitionConstructor) && (definition.definitionConstructor != definition.key)) {
            constructorArgs = this.resolveConstructorArguments(this.definitions.get(definition.definitionConstructor));
        }
        return constructorArgs;
    }
}