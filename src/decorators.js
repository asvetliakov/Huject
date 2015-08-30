/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'reflect-metadata'], function (require, exports) {
    require('reflect-metadata');
    function ConstructorInject(target) {
        Reflect.defineMetadata("inject:constructor", true, target);
    }
    exports.ConstructorInject = ConstructorInject;
    function Inject(target, propertyKey) {
        var method = undefined;
        if (typeof target === "object") {
            if (!target.hasOwnProperty(propertyKey)) {
                Object.defineProperty(target, propertyKey, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: null
                });
            }
            Reflect.defineMetadata("inject:property", method, target, propertyKey);
        }
        else {
            method = target;
            return function (target, propertyKey) {
                if (!target.hasOwnProperty(propertyKey)) {
                    Object.defineProperty(target, propertyKey, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: null
                    });
                }
                Reflect.defineMetadata("inject:property", method, target, propertyKey);
            };
        }
    }
    exports.Inject = Inject;
});
//# sourceMappingURL=decorators.js.map