/// <reference path="../typings/tsd.d.ts" />

export enum FactoryMethod {
    SINGLETON,
    FACTORY,
    OBJECT
}

export enum DefinitionObjectType {
    CLASS,
    CALLABLE
}

export class Definition {

    /**
     * Definition key
     * @type {string|Function}
     */
    public key: string|Function;

    /**
     * Method to create objects. Factory by default
     * @type {FactoryMethod}
     */
    public method: FactoryMethod = FactoryMethod.FACTORY;

    /**
     * Constructor arguments to be passed when creating object
     * type {Array}
     */
    public constructorArgs: Array<any>;

    /**
     * Constructor function or callable
     * type {Function}
     */
    public definitionConstructor: any;

    /**
     * Object type
     * @type {DefinitionObjectType}
     */
    public definitionObjectType: DefinitionObjectType = DefinitionObjectType.CLASS;

    /**
     * @constructor
     * @param key
     * @param definitionConstructor
     * @param constructorArgs
     * @param factoryMethod
     * @param objectType
     */
    public constructor(key: string|Function, definitionConstructor: any, constructorArgs?: Array<any>, factoryMethod?: FactoryMethod, objectType?: DefinitionObjectType) {
        this.key = key;
        this.definitionConstructor = definitionConstructor;
        if (constructorArgs) {
            this.constructorArgs = constructorArgs;
        }
        if (factoryMethod) {
            this.method = factoryMethod;
        }
        if (objectType) {
            this.definitionObjectType = objectType;
        }
    }

    /**
     * Changes factory method
     * @param method
     * @return {Definition}
     */
    public as(method: FactoryMethod) {
        if (this.method == FactoryMethod.OBJECT) {
            throw new Error("You're trying to override factory method for object");
        }
        this.method = method;
        return this;
    }
}