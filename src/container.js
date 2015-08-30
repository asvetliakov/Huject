/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
require('es6-collections');
require('reflect-metadata');
var definition_1 = require('./definition');
var Container = (function () {
    function Container() {
        this.allowUnregisteredResolve = false;
        this.definitions = new Map();
        this.singletonObjects = new WeakMap();
    }
    Container.prototype.setAllowUnregisteredResolving = function (allow) {
        this.allowUnregisteredResolve = allow;
    };
    Container.prototype.register = function (definition, implementationOrConstructorArgs, constructorArgs) {
        var def;
        if (!implementationOrConstructorArgs) {
            if (typeof definition === "string") {
                throw new Error("Can't register just symbol");
            }
            def = new definition_1.Definition(definition, definition);
        }
        else {
            if (typeof definition === "function") {
                if (implementationOrConstructorArgs instanceof Array) {
                    def = new definition_1.Definition(definition, definition, implementationOrConstructorArgs);
                }
                else {
                    if (typeof implementationOrConstructorArgs == "object") {
                        def = new definition_1.Definition(definition, implementationOrConstructorArgs, null, definition_1.FactoryMethod.OBJECT);
                    }
                    else {
                        def = new definition_1.Definition(definition, implementationOrConstructorArgs, constructorArgs);
                    }
                }
            }
            else {
                if (typeof implementationOrConstructorArgs === "function") {
                    def = new definition_1.Definition(definition, implementationOrConstructorArgs, constructorArgs);
                }
                else {
                    def = new definition_1.Definition(definition, implementationOrConstructorArgs, null, definition_1.FactoryMethod.OBJECT);
                }
            }
        }
        this.definitions.set(definition, def);
        return def;
    };
    Container.prototype.registerCallable = function (definition, callable) {
        var def;
        def = new definition_1.Definition(definition, callable, null, definition_1.FactoryMethod.SINGLETON, definition_1.DefinitionObjectType.CALLABLE);
        this.definitions.set(definition, def);
        return def;
    };
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
    Container.prototype.resolveDefinition = function (definition) {
        if (definition.definitionObjectType == definition_1.DefinitionObjectType.CALLABLE || definition.method == definition_1.FactoryMethod.OBJECT) {
            return definition.definitionConstructor;
        }
        var constructor = this.resolveConstructor(definition);
        var constructorArguments = [];
        if (Reflect.hasOwnMetadata("inject:constructor", constructor)) {
            var dependencies = Reflect.getOwnMetadata("design:paramtypes", constructor);
            var resolvedDeps = [];
            if (dependencies) {
                for (var _i = 0; _i < dependencies.length; _i++) {
                    var dep = dependencies[_i];
                    resolvedDeps.push(this.resolve(dep));
                }
            }
            constructorArguments = resolvedDeps;
        }
        else {
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
    Container.prototype.resolveParameters = function (object) {
        var test = Reflect.getMetadataKeys(object);
        for (var key in object) {
            if (Reflect.hasMetadata("inject:property", object, key)) {
                var method = Reflect.getMetadata("inject:property", object, key);
                var paramType = Reflect.getMetadata("design:type", object, key);
                var resolvedObj = this.resolve(paramType, method);
                object[key] = resolvedObj;
            }
        }
    };
    Container.prototype.resolveConstructor = function (definition) {
        var constructor = definition.definitionConstructor;
        if (this.definitions.has(constructor) && constructor != definition.key) {
            constructor = this.resolveConstructor(this.definitions.get(constructor));
        }
        return constructor;
    };
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