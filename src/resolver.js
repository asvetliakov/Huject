require('es6-collections');
require('reflect-metadata');
var definition_1 = require("./definition");
var definition_2 = require('./definition');
var factoryautoproxy_1 = require("./factoryautoproxy");
var ContainerResolver = (function () {
    function ContainerResolver() {
        this.singletonObjects = new WeakMap();
        this.definitions = new Map();
    }
    /**
     * Add definition
     * @param key
     * @param def
     */
    ContainerResolver.prototype.addDefinition = function (key, def) {
        this.definitions.set(key, def);
    };
    /**
     * Obtain definition
     * @param key
     * @returns {Definition|V}
     */
    ContainerResolver.prototype.getDefinition = function (key) {
        return this.definitions.get(key);
    };
    /**
     * Has definition
     * @param key
     * @returns {boolean}
     */
    ContainerResolver.prototype.hasDefinition = function (key) {
        return this.definitions.has(key);
    };
    /**
     * Resolve definition
     * @param definition
     * @param method
     * @param constructorArgs
     * @param strict
     */
    ContainerResolver.prototype.resolve = function (definition, method, constructorArgs, strict) {
        if (strict === void 0) { strict = true; }
        var internalDefinition = null;
        // bind autofactories to factory auto proxy instance
        if (typeof definition === "function" && Reflect.hasOwnMetadata("inject:autofactory", definition)) {
            var factoryProxy = new factoryautoproxy_1.FactoryAutoProxy(this, definition);
            internalDefinition = new definition_1.Definition(definition, factoryProxy, null, definition_2.FactoryMethod.OBJECT);
        }
        else {
            internalDefinition = this.definitions.get(definition);
        }
        if (!internalDefinition) {
            if (strict || typeof definition === 'string') {
                throw new Error("Unknown definition: " + definition.toString());
            }
            else {
                internalDefinition = new definition_1.Definition(definition, definition);
            }
        }
        var constructor = this.resolveDefinition(internalDefinition);
        var constructorArguments = [];
        if (internalDefinition.definitionObjectType !== definition_2.DefinitionObjectType.CALLABLE && internalDefinition.method !== definition_2.FactoryMethod.OBJECT) {
            if (typeof constructorArgs !== 'undefined' && constructorArgs.length > 0) {
                constructorArguments = constructorArgs;
            }
            else {
                constructorArguments = this.resolveConstructorArguments(internalDefinition, constructor, strict);
            }
        }
        var resolveMethod = internalDefinition.method;
        if (typeof method !== "undefined" && internalDefinition.method != definition_2.FactoryMethod.OBJECT) {
            resolveMethod = method;
        }
        switch (resolveMethod) {
            case definition_2.FactoryMethod.SINGLETON:
                if (!this.singletonObjects.has(internalDefinition)) {
                    if (internalDefinition.definitionObjectType == definition_2.DefinitionObjectType.CALLABLE) {
                        this.singletonObjects.set(internalDefinition, constructor.call(this));
                    }
                    else {
                        var obj = new (constructor.bind.apply(constructor, [void 0].concat(constructorArguments)))();
                        this.resolveProperties(obj, strict);
                        this.singletonObjects.set(internalDefinition, obj);
                    }
                }
                return this.singletonObjects.get(internalDefinition);
                break;
            case definition_2.FactoryMethod.FACTORY:
                if (internalDefinition.definitionObjectType == definition_2.DefinitionObjectType.CALLABLE) {
                    return constructor.call(this);
                }
                else {
                    var obj = new (constructor.bind.apply(constructor, [void 0].concat(constructorArguments)))();
                    this.resolveProperties(obj, strict);
                    return obj;
                }
                break;
            case definition_2.FactoryMethod.OBJECT:
                return constructor;
                break;
        }
    };
    /**
     * Resolves definition
     * @private
     * @param definition
     */
    ContainerResolver.prototype.resolveDefinition = function (definition) {
        if (definition.definitionObjectType == definition_2.DefinitionObjectType.CALLABLE || definition.method == definition_2.FactoryMethod.OBJECT) {
            return definition.definitionConstructor;
        }
        return this.resolveConstructor(definition);
    };
    /**
     * Injects properties into object
     * @param object
     * @param strict
     */
    ContainerResolver.prototype.resolveProperties = function (object, strict) {
        if (strict === void 0) { strict = true; }
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
                var resolvedObj = void 0;
                try {
                    resolvedObj = this.resolve(paramDefinition, method, undefined, strict);
                    object[key] = resolvedObj;
                }
                catch (e) {
                    if (!Reflect.hasMetadata('inject:property:optional', object, key)) {
                        throw new Error("Unknown definition: " + paramDefinition.toString());
                    }
                }
            }
        }
    };
    /**
     * Resolves constructor by looking in definition chain
     * @private
     * @param definition
     */
    ContainerResolver.prototype.resolveConstructor = function (definition) {
        var constructor = definition.definitionConstructor;
        if (this.definitions.has(constructor) && constructor != definition.key) {
            constructor = this.resolveConstructor(this.definitions.get(constructor));
        }
        return constructor;
    };
    /**
     * Resolves constructor arguments from constructor injection or definition chain
     * @param definition
     * @param constructor
     * @param strict
     */
    ContainerResolver.prototype.resolveConstructorArguments = function (definition, constructor, strict) {
        if (strict === void 0) { strict = true; }
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
                    var resolvedDep = void 0;
                    try {
                        resolvedDep = this.resolve(dep, method, undefined, strict);
                    }
                    catch (e) {
                        if (Reflect.hasOwnMetadata('inject:constructor:param' + i + ':optional', constructor)) {
                            resolvedDep = null;
                        }
                        else {
                            throw e;
                        }
                    }
                    resolvedDeps.push(resolvedDep);
                }
            }
            constructorArguments = resolvedDeps;
        }
        else {
            // No constructor injection, lookup for constructor arguments in definition
            constructorArguments = this.resolveConstructorArgumentsFromDefinition(definition);
            if (!constructorArguments) {
                constructorArguments = [];
            }
        }
        return constructorArguments;
    };
    /**
     * Resolves constructor arguments from definition chain
     * @private
     * @param definition
     * @returns {Array<any>}
     */
    ContainerResolver.prototype.resolveConstructorArgumentsFromDefinition = function (definition) {
        var constructorArgs = definition.constructorArgs;
        if (!constructorArgs && this.definitions.has(definition.definitionConstructor) && (definition.definitionConstructor != definition.key)) {
            constructorArgs = this.resolveConstructorArgumentsFromDefinition(this.definitions.get(definition.definitionConstructor));
        }
        return constructorArgs;
    };
    return ContainerResolver;
})();
exports.ContainerResolver = ContainerResolver;
//# sourceMappingURL=resolver.js.map