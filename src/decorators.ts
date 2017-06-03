import 'reflect-metadata';

import {FactoryMethod} from './definition';

/**
 * Decorator for class constructor injection
 */
export function ConstructorInject(targetOrFactoryMethodOrLiteral: any, factoryMethod?: FactoryMethod)  {
    let method: FactoryMethod = undefined;

    switch (typeof targetOrFactoryMethodOrLiteral) {
        // Simple @ConstructorInject at the top of class
        case 'function':
            Reflect.defineMetadata('inject:constructor', true, targetOrFactoryMethodOrLiteral);
            return targetOrFactoryMethodOrLiteral;
        // constructor (@ConstructorInject(FactoryMethod) param1: class, ...);
        case 'number':
            if (typeof targetOrFactoryMethodOrLiteral === 'number') {
                method = targetOrFactoryMethodOrLiteral;
            }
            return function (target: Object, propertyKey: string|symbol, parameterIndex: number) {
                // inject:constructor:param1:method
                let metadataName = 'inject:constructor:param' + parameterIndex + ':method';
                Reflect.defineMetadata(metadataName, method, target);
            };
        // constructor (@ConstructorInject('literal',FactoryMethod) param1: class, ...);
        case 'string':
            let literal: string = targetOrFactoryMethodOrLiteral;
            method = factoryMethod;
            return function (target:Object, propertyKey:string|symbol, parameterIndex:number) {
                let metadataLiteralName = 'inject:constructor:param' + parameterIndex + ':literal';
                let metadataFactoryName = 'inject:constructor:param' + parameterIndex + ':method';

                Reflect.defineMetadata(metadataLiteralName, literal, target);
                Reflect.defineMetadata(metadataFactoryName, method, target);
            };
    }
}

/**
 * Decorator for class property injection
 */
export function Inject(targetOrFactoryMethodOrLiteral: any, propertyKeyOrFactoryMethod?: string|symbol|FactoryMethod): any {
    // means use default value or take from definition
    let method: FactoryMethod = undefined;
    // Because @Inject() and @Inject will be different

    switch (typeof targetOrFactoryMethodOrLiteral) {
        // That's simple @Inject
        case 'object':
            if (typeof propertyKeyOrFactoryMethod === 'string') {
                let propertyKey: string = propertyKeyOrFactoryMethod;
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
            let literal: string = targetOrFactoryMethodOrLiteral;
            if (typeof propertyKeyOrFactoryMethod === "number") {
                method = propertyKeyOrFactoryMethod;
            }
            return function (target:Object, propertyKey:string) {
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
        // @Inject(FactoryMethod)
        case 'number':
            method = targetOrFactoryMethodOrLiteral;
            return function (target: Object, propertyKey: string) {
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

/**
 * Specifies optional resolution (Don't throw error if not found)
 * @param args
 * @constructor
 */
export function Optional(...args: any[]): any {
    let target;
    switch (args.length) {
        // Property @Optional
        case 2:
            target = args[0];
            let propertyKey = args[1];
            Reflect.defineMetadata("inject:property:optional", true, target, propertyKey);
            break;
        // Constructor @Optional
        case 3:
            target = args[0];
            let parameterIndex = args[2];
            let metadataName = 'inject:constructor:param' + parameterIndex + ':optional';
            Reflect.defineMetadata(metadataName, true, target);
            break;
        default:
            throw new Error("@Optional decorator is not allowed here");
    }
}

/**
 * Decorator for creating auto-factories
 */
export function Factory(...args: any[]): any {
    let target;

    switch (args.length) {
        case 1:
            target = args[0];
            Reflect.defineMetadata('inject:autofactory', true, target);
            return target;
        case 3:
            target = args[0];
            let propertyKey = args[1];
            Reflect.defineMetadata('inject:factorymethod', true, target, propertyKey);
            return args[2];
        default:
            throw new Error("@Factory decorator is not allowed here");
    }
}
