/**
 * Exporting library here
 */
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './container', './definition', './decorators'], function (require, exports) {
    var container_1 = require('./container');
    var definition_1 = require('./definition');
    var decorators_1 = require('./decorators');
    exports.default = {
        Container: container_1.Container,
        FactoryMethod: definition_1.FactoryMethod,
        ConstructorInject: decorators_1.ConstructorInject,
        Inject: decorators_1.Inject
    };
});
//# sourceMappingURL=index.js.map