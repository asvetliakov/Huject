/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
require('es6-collections');
require('reflect-metadata');
var definition_1 = require('./definition');
/**
 * DI Container class
 */
var Container = (function () {
    /**
     * @constructor
     */
    function Container() {
        /**
         * If true allows to resolve unregistered definitions
         * @type {boolean}
         */
        this.allowUnregisteredResolve = false;
        this.definitions = new Map();
        this.singletonObjects = new WeakMap();
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
    Container.prototype.setAllowUnregisteredResolving = function (allow) {
        this.allowUnregisteredResolve = allow;
    };
    /**
     * Register implementation to interface object
     * @param definition
     * @param implementationOrConstructorArgs
     * @param constructorArgs
     */
    Container.prototype.register = function (definition, implementationOrConstructorArgs, constructorArgs) {
        var def;
        if (!implementationOrConstructorArgs) {
            // specific case: register(Class)
            if (typeof definition === "string") {
                throw new Error("Can't register just symbol");
            }
            def = new definition_1.Definition(definition, definition);
        }
        else {
            if (typeof definition === "function") {
                // Cases:
                //  1. register(Class, Class)
                //  2. register(Class, [constructorArgs])
                //  3. register(Class, Class, [constructorArgs])
                //  4. register(Class, object)
                if (implementationOrConstructorArgs instanceof Array) {
                    // Case 2.
                    def = new definition_1.Definition(definition, definition, implementationOrConstructorArgs);
                }
                else {
                    if (typeof implementationOrConstructorArgs == "object") {
                        // Case 4
                        def = new definition_1.Definition(definition, implementationOrConstructorArgs, null, definition_1.FactoryMethod.OBJECT);
                    }
                    else {
                        // Cases 1, 3
                        def = new definition_1.Definition(definition, implementationOrConstructorArgs, constructorArgs);
                    }
                }
            }
            else {
                // Cases:
                //  1. register('string', Class)
                //  2. register('string', Class, [constructorArgs])
                //  4. register('string', 'number|string|object|boolean')
                if (typeof implementationOrConstructorArgs === "function") {
                    // Case  1,2
                    def = new definition_1.Definition(definition, implementationOrConstructorArgs, constructorArgs);
                }
                else {
                    // Case 3
                    def = new definition_1.Definition(definition, implementationOrConstructorArgs, null, definition_1.FactoryMethod.OBJECT);
                }
            }
        }
        this.definitions.set(definition, def);
        return def;
    };
    /**
     * Register definition as callable. The callable will be invoked instead calling via new()
     */
    Container.prototype.registerCallable = function (definition, callable) {
        var def;
        def = new definition_1.Definition(definition, callable, null, definition_1.FactoryMethod.SINGLETON, definition_1.DefinitionObjectType.CALLABLE);
        this.definitions.set(definition, def);
        return def;
    };
    /**
     * Resolves definition
     * @param definition
     * @param method
     */
    Container.prototype.resolve = function (definition, method) {
        var internalDefinition = this.definitions.get(definition);
        if (!internalDefinition) {
            if (!this.allowUnregisteredResolve || typeof definition !== "function") {
                throw new Error("Unknown definition " + definition.toString());
            }
            else if (typeof definition === "function") {
                internalDefinition = this.register(definition);
            }
        }
        var constructor = this.resolveDefinition(internalDefinition);
        var resolveMethod = internalDefinition.method;
        if (typeof method !== 'undefined') {
            resolveMethod = method;
        }
        switch (resolveMethod) {
            case definition_1.FactoryMethod.SINGLETON:
                if (!this.singletonObjects.has(internalDefinition)) {
                    if (internalDefinition.definitionObjectType == definition_1.DefinitionObjectType.CALLABLE) {
                        this.singletonObjects.set(internalDefinition, constructor.call(this));
                    }
                    else {
                        var obj = new constructor();
                        this.resolveParameters(obj);
                        this.singletonObjects.set(internalDefinition, obj);
                    }
                }
                return this.singletonObjects.get(internalDefinition);
                break;
            case definition_1.FactoryMethod.FACTORY:
                if (internalDefinition.definitionObjectType == definition_1.DefinitionObjectType.CALLABLE) {
                    return constructor.call(this);
                }
                else {
                    var obj = new constructor();
                    this.resolveParameters(obj);
                    return obj;
                }
                break;
            case definition_1.FactoryMethod.OBJECT:
                return constructor;
                break;
        }
    };
    /**
     * Resolves definition
     * @private
     * @param definition
     */
    Container.prototype.resolveDefinition = function (definition) {
        if (definition.definitionObjectType == definition_1.DefinitionObjectType.CALLABLE || definition.method == definition_1.FactoryMethod.OBJECT) {
            return definition.definitionConstructor;
        }
        var constructor = this.resolveConstructor(definition);
        var constructorArguments = [];
        if (Reflect.hasOwnMetadata("inject:constructor", constructor)) {
            // Resolve constructor dependencies
            var dependencies = Reflect.getOwnMetadata("design:paramtypes", constructor);
            var resolvedDeps = [];
            if (dependencies) {
                for (var i = 0; i < dependencies.length; i++) {
                    var dep = dependencies[i];
                    var method = Reflect.getOwnMetadata('inject:constructor:param' + i + ':method', constructor);
                    // Use literal for resolving if specified
                    if (Reflect.hasOwnMetadata('inject:constructor:param' + i + ':literal', constructor)) {
                        dep = Reflect.getOwnMetadata('inject:constructor:param' + i + ':literal', constructor);
                    }
                    resolvedDeps.push(this.resolve(dep, method));
                }
            }
            constructorArguments = resolvedDeps;
        }
        else {
            // No constructor injection, lookup for constructor arguments in definition
            constructorArguments = this.resolveConstructorArguments(definition);
            if (!constructorArguments) {
                constructorArguments = [];
            }
        }
        var newConstructor = function () {
            constructor.apply(this, constructorArguments);
        };
        newConstructor.prototype = constructor.prototype;
        return newConstructor;
    };
    /**
     * Injects parameters into object
     * @param object
     */
    Container.prototype.resolveParameters = function (object) {
        var test = Reflect.getMetadataKeys(object);
        for (var key in object) {
            if (Reflect.hasMetadata("inject:property", object, key)) {
                var method = Reflect.getMetadata("inject:property", object, key);
                var paramDefinition = void 0;
                if (Reflect.hasMetadata('inject:property:literal', object, key)) {
                    // Resolve property by string literal
                    paramDefinition = Reflect.getMetadata('inject:property:literal', object, key);
                }
                else {
                    // Resolve property by typehint
                    paramDefinition = Reflect.getMetadata('design:type', object, key);
                }
                var resolvedObj = this.resolve(paramDefinition, method);
                object[key] = resolvedObj;
            }
        }
    };
    /**
     * Resolves constructor by looking in definition chain
     * @private
     * @param definition
     */
    Container.prototype.resolveConstructor = function (definition) {
        var constructor = definition.definitionConstructor;
        if (this.definitions.has(constructor) && constructor != definition.key) {
            constructor = this.resolveConstructor(this.definitions.get(constructor));
        }
        return constructor;
    };
    /**
     * Resolves constructor arguments from definition chain
     * @private
     * @param definition
     * @returns {Array<any>}
     */
    Container.prototype.resolveConstructorArguments = function (definition) {
        var constructorArgs = definition.constructorArgs;
        if (!constructorArgs && this.definitions.has(definition.definitionConstructor) && (definition.definitionConstructor != definition.key)) {
            constructorArgs = this.resolveConstructorArguments(this.definitions.get(definition.definitionConstructor));
        }
        return constructorArgs;
    };
    return Container;
})();
exports.Container = Container;
//# sourceMappingURL=container.js.map