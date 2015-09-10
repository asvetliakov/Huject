/**
 * Interface for creating objects from container dynamically
 */
var ContainerFactoryInterface = (function () {
    function ContainerFactoryInterface() {
    }
    /**
     * Create object using the container. Will create new instance for each call
     * @param definition Class or string definition
     * @param constructorArgs Optional constructor arguments. Overrides constructor arguments in definition
     */
    ContainerFactoryInterface.prototype.make = function (definition, constructorArgs) { };
    ;
    return ContainerFactoryInterface;
})();
exports.ContainerFactoryInterface = ContainerFactoryInterface;
//# sourceMappingURL=containerfactoryinterface.js.map