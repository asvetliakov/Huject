/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

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
            break;
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
            break;
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
            break;
    }
}

/**
 * Decorator for class property injection
 */
export function Inject(targetOrFactoryMethodOrLiteral: any, propertyKeyOrFactoryMethod?: string|symbol|FactoryMethod) {
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
            break;
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
            break;
    }
}