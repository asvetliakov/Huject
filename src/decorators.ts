/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import 'reflect-metadata';

import {FactoryMethod} from './definition';

/**
 * Decorator for class constructor injection
 */
export function ConstructorInject(target) {
    Reflect.defineMetadata("inject:constructor", true, target);
}

/**
 * Decorator for class property injection
 */
export function Inject(target: any, propertyKey?: string) {
    // means use default value or take from definition
    let method: FactoryMethod = undefined;
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
    } else {
        method = target;
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
        }
    }
}