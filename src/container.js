/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
var definition_1 = require('./definition');
var resolver_1 = require("./resolver");
var containerfactoryinterface_1 = require("./containerfactoryinterface");
var containerfactory_1 = require("./containerfactory");
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
        this.resolver = new resolver_1.ContainerResolver();
        var containerFactory = new containerfactory_1.ContainerFactory(this.resolver);
        this.register(containerfactoryinterface_1.ContainerFactoryInterface, containerFactory);
    }
    /**
     * Sets if unregistered definitions are allowed to be resolved
     * This is useful to avoid many stub container.register(Class) class, but you need to be careful to not create
     * interface instead of implementation
     * @param allow true to allow, false to disallow
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
                //  3. register('string', 'number|string|object|boolean')
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
        this.resolver.addDefinition(definition, def);
        return def;
    };
    /**
     * Register definition as callable. The callable will be invoked instead calling via new()
     */
    Container.prototype.registerCallable = function (definition, callable) {
        var def;
        def = new definition_1.Definition(definition, callable, null, definition_1.FactoryMethod.SINGLETON, definition_1.DefinitionObjectType.CALLABLE);
        this.resolver.addDefinition(definition, def);
        return def;
    };
    /**
     * Resolves definition
     * @param definition
     * @param method
     */
    Container.prototype.resolve = function (definition, method) {
        return this.resolver.resolve(definition, method, undefined, !this.allowUnregisteredResolve);
    };
    return Container;
})();
exports.Container = Container;
//# sourceMappingURL=container.js.map