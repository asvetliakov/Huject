
import {ContainerFactoryInterface} from "./containerfactoryinterface";
import {Container} from "./container";
import {ContainerResolver} from "./resolver";
import {FactoryMethod} from './definition';

/**
 * Container factory implementation
 */
export class ContainerFactory implements ContainerFactoryInterface {

    /**
     * Container instance
     */
    private resolver: ContainerResolver;

    /**
     * @constructor
     * @param resolver
     */
    public constructor(resolver: ContainerResolver) {
        this.resolver = resolver;
    }

    /**
     * Create object using the container. Will create new instance for each call
     * @param definition Class or string definition
     * @param constructorArgs Optional constructor arguments. Overrides constructor arguments in definition
     */
    public make(definition: Function|string, constructorArgs: Array<any>): any {
        if (typeof definition === "string" && !this.resolver.hasDefinition(definition)) {
            throw new Error(`Unknown definition: ${definition}`)
        }

        return this.resolver.resolve(definition, FactoryMethod.FACTORY, constructorArgs, false);
    }

}
