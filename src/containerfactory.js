var definition_1 = require('./definition');
/**
 * Container factory implementation
 */
var ContainerFactory = (function () {
    /**
     * @constructor
     * @param resolver
     */
    function ContainerFactory(resolver) {
        this.resolver = resolver;
    }
    /**
     * Create object using the container. Will create new instance for each call
     * @param definition Class or string definition
     * @param constructorArgs Optional constructor arguments. Overrides constructor arguments in definition
     */
    ContainerFactory.prototype.make = function (definition, constructorArgs) {
        if (typeof definition === "string" && !this.resolver.hasDefinition(definition)) {
            throw new Error("Unknown definition: " + definition);
        }
        return this.resolver.resolve(definition, definition_1.FactoryMethod.FACTORY, constructorArgs, false);
    };
    return ContainerFactory;
})();
exports.ContainerFactory = ContainerFactory;
//# sourceMappingURL=containerfactory.js.map