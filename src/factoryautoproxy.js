var definition_1 = require('./definition');
/**
 * Proxy class for auto-factories
 */
var FactoryAutoProxy = (function () {
    /**
     * @constructor
     * @param resolver
     * @param originalDefinition
     */
    function FactoryAutoProxy(resolver, originalDefinition) {
        this.resolver = resolver;
        this.originalDefinition = originalDefinition;
        for (var propertyName in originalDefinition.prototype) {
            if (typeof originalDefinition.prototype[propertyName] === "function" && propertyName !== 'constructor') {
                if (Reflect.hasMetadata("inject:factorymethod", originalDefinition.prototype, propertyName)) {
                    var returnType = Reflect.getMetadata("design:returntype", originalDefinition.prototype, propertyName);
                    if (typeof returnType !== "function") {
                        throw new Error("Invalid factory method: " + propertyName + " in " + originalDefinition.toString() + ", return type should be constructor function");
                    }
                    Object.defineProperty(this, propertyName, {
                        value: this.createFactoryMethod(returnType)
                    });
                }
            }
        }
    }
    /**
     * Creates factory method
     * @param createdObj
     * @returns {function(...[any]): *}
     */
    FactoryAutoProxy.prototype.createFactoryMethod = function (createdObj) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return _this.resolver.resolve(createdObj, definition_1.FactoryMethod.FACTORY, args, false);
        };
    };
    return FactoryAutoProxy;
})();
exports.FactoryAutoProxy = FactoryAutoProxy;
//# sourceMappingURL=factoryautoproxy.js.map