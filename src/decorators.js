/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
require('reflect-metadata');
/**
 * Decorator for class constructor injection
 */
function ConstructorInject(target) {
    Reflect.defineMetadata("inject:constructor", true, target);
}
exports.ConstructorInject = ConstructorInject;
/**
 * Decorator for class property injection
 */
function Inject(target, propertyKey) {
    // means use default value or take from definition
    var method = undefined;
    // Because @Inject() and @Inject will be different
    if (typeof target === "object") {
        if (!target.hasOwnProperty(propertyKey)) {
            // TS compiler do not output empty properties, so explicitly define it here
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
//# sourceMappingURL=decorators.js.map