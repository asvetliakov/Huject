/// <reference path="../typings/tsd.d.ts" />
(function (FactoryMethod) {
    FactoryMethod[FactoryMethod["SINGLETON"] = 0] = "SINGLETON";
    FactoryMethod[FactoryMethod["FACTORY"] = 1] = "FACTORY";
    FactoryMethod[FactoryMethod["OBJECT"] = 2] = "OBJECT";
})(exports.FactoryMethod || (exports.FactoryMethod = {}));
var FactoryMethod = exports.FactoryMethod;
(function (DefinitionObjectType) {
    DefinitionObjectType[DefinitionObjectType["CLASS"] = 0] = "CLASS";
    DefinitionObjectType[DefinitionObjectType["CALLABLE"] = 1] = "CALLABLE";
})(exports.DefinitionObjectType || (exports.DefinitionObjectType = {}));
var DefinitionObjectType = exports.DefinitionObjectType;
var Definition = (function () {
    function Definition(key, definitionConstructor, constructorArgs, factoryMethod, objectType) {
        this.method = FactoryMethod.FACTORY;
        this.definitionObjectType = DefinitionObjectType.CLASS;
        this.key = key;
        this.definitionConstructor = definitionConstructor;
        if (constructorArgs) {
            this.constructorArgs = constructorArgs;
        }
        if (factoryMethod) {
            this.method = factoryMethod;
        }
        if (objectType) {
            this.definitionObjectType = objectType;
        }
    }
    Definition.prototype.as = function (method) {
        this.method = method;
        return this;
    };
    return Definition;
})();
exports.Definition = Definition;
//# sourceMappingURL=definition.js.map