/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
require('reflect-metadata');
/**
 * Decorator for class constructor injection
 */
function ConstructorInject(targetOrFactoryMethodOrLiteral, factoryMethod) {
    var method = undefined;
    switch (typeof targetOrFactoryMethodOrLiteral) {
        // Simple @ConstructorInject at the top of class
        case 'function':
            Reflect.defineMetadata('inject:constructor', true, targetOrFactoryMethodOrLiteral);
            return targetOrFactoryMethodOrLiteral;
            break;
        // constructor (@ConstructorInject(FactoryMethod) param1: class, ...);
        case 'number':
            if (typeof targetOrFactoryMethodOrLiteral === 'number') {
                method = targetOrFactoryMethodOrLiteral;
            }
            return function (target, propertyKey, parameterIndex) {
                // inject:constructor:param1:method
                var metadataName = 'inject:constructor:param' + parameterIndex + ':method';
                Reflect.defineMetadata(metadataName, method, target);
            };
            break;
        // constructor (@ConstructorInject('literal',FactoryMethod) param1: class, ...);
        case 'string':
            var literal = targetOrFactoryMethodOrLiteral;
            method = factoryMethod;
            return function (target, propertyKey, parameterIndex) {
                var metadataLiteralName = 'inject:constructor:param' + parameterIndex + ':literal';
                var metadataFactoryName = 'inject:constructor:param' + parameterIndex + ':method';
                Reflect.defineMetadata(metadataLiteralName, literal, target);
                Reflect.defineMetadata(metadataFactoryName, method, target);
            };
            break;
    }
}
exports.ConstructorInject = ConstructorInject;
/**
 * Decorator for class property injection
 */
function Inject(targetOrFactoryMethodOrLiteral, propertyKeyOrFactoryMethod) {
    // means use default value or take from definition
    var method = undefined;
    // Because @Inject() and @Inject will be different
    switch (typeof targetOrFactoryMethodOrLiteral) {
        // That's simple @Inject
        case 'object':
            if (typeof propertyKeyOrFactoryMethod === 'string') {
                var propertyKey = propertyKeyOrFactoryMethod;
                if (!targetOrFactoryMethodOrLiteral.hasOwnProperty(propertyKey)) {
                    // TS compiler do not output empty properties, so explicitly define it here
                    Object.defineProperty(targetOrFactoryMethodOrLiteral, propertyKey, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: null
                    });
                }
                Reflect.defineMetadata("inject:property", method, targetOrFactoryMethodOrLiteral, propertyKey);
            }
            break;
        // @Inject('literal')
        case 'string':
            var literal = targetOrFactoryMethodOrLiteral;
            if (typeof propertyKeyOrFactoryMethod === "number") {
                method = propertyKeyOrFactoryMethod;
            }
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
                Reflect.defineMetadata('inject:property:literal', literal, target, propertyKey);
            };
            break;
        // @Inject(FactoryMethod)
        case 'number':
            method = targetOrFactoryMethodOrLiteral;
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
            break;
    }
}
exports.Inject = Inject;
/**
 * Specifies optional resolution (Don't throw error if not found)
 * @param args
 * @constructor
 */
function Optional() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var target;
    switch (args.length) {
        // Property @Optional
        case 2:
            target = args[0];
            var propertyKey = args[1];
            Reflect.defineMetadata("inject:property:optional", true, target, propertyKey);
            break;
        // Constructor @Optional
        case 3:
            target = args[0];
            var parameterIndex = args[2];
            var metadataName = 'inject:constructor:param' + parameterIndex + ':optional';
            Reflect.defineMetadata(metadataName, true, target);
            break;
        default:
            throw new Error("@Optional decorator is not allowed here");
    }
}
exports.Optional = Optional;
/**
 * Decorator for creating auto-factories
 */
function Factory() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var target;
    switch (args.length) {
        case 1:
            target = args[0];
            Reflect.defineMetadata('inject:autofactory', true, target);
            return target;
            break;
        case 3:
            target = args[0];
            var propertyKey = args[1];
            Reflect.defineMetadata('inject:factorymethod', true, target, propertyKey);
            return args[2];
            break;
        default:
            throw new Error("@Factory decorator is not allowed here");
    }
}
exports.Factory = Factory;
//# sourceMappingURL=decorators.js.map