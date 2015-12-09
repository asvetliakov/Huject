import {Definition, FactoryMethod, DefinitionObjectType} from './definition';
import {ContainerResolver} from "./resolver";
import {ContainerFactoryInterface} from "./containerfactoryinterface";
import {ContainerFactory} from "./containerfactory";

/**
 * DI Container class
 */
export class Container {

    /**
     * Resolver
     */
    private resolver: ContainerResolver;


    /**
     * If true allows to resolve unregistered definitions
     * @type {boolean}
     */
    private allowUnregisteredResolve: Boolean = false;

    /**
     * @constructor
     */
    public constructor() {
        this.resolver = new ContainerResolver();
        let containerFactory = new ContainerFactory(this.resolver);

        this.register(ContainerFactoryInterface, containerFactory);
    }

    /**
     * Sets if unregistered definitions are allowed to be resolved
     * This is useful to avoid many stub container.register(Class) class, but you need to be careful to not create
     * interface instead of implementation
     * @param allow true to allow, false to disallow
     */
    public setAllowUnregisteredResolving(allow: Boolean) {
        this.allowUnregisteredResolve = allow;
    }

    /**
     * Register implementation to interface object
     * @param definition
     * @param implementationOrConstructorArgs
     * @param constructorArgs
     */
    public register(definition: string|Function, implementationOrConstructorArgs?: Object|Function|Array<any>, constructorArgs?: Array<any>): Definition {
        let def: Definition;
        if (!implementationOrConstructorArgs) {
            // specific case: register(Class)
            if (typeof definition === "string") {
                throw new Error("Can't register just symbol");
            }
            def = new Definition(definition, definition);
        } else {
            if (typeof definition === "function") {
                // Cases:
                //  1. register(Class, Class)
                //  2. register(Class, [constructorArgs])
                //  3. register(Class, Class, [constructorArgs])
                //  4. register(Class, object)
                if (implementationOrConstructorArgs instanceof Array) {
                    // Case 2.
                    def = new Definition(definition, definition, implementationOrConstructorArgs);
                } else {
                    if (typeof implementationOrConstructorArgs == "object") {
                        // Case 4
                        def = new Definition(definition, implementationOrConstructorArgs, null, FactoryMethod.OBJECT);
                    } else {
                        // Cases 1, 3
                        def = new Definition(definition, implementationOrConstructorArgs, constructorArgs);
                    }
                }
            } else {
                // Cases:
                //  1. register('string', Class)
                //  2. register('string', Class, [constructorArgs])
                //  3. register('string', 'number|string|object|boolean')
                if (typeof  implementationOrConstructorArgs === "function") {
                    // Case  1,2
                    def = new Definition(definition, implementationOrConstructorArgs, constructorArgs);
                } else {
                    // Case 3
                    def = new Definition(definition, implementationOrConstructorArgs, null, FactoryMethod.OBJECT);
                }

            }
        }
        this.resolver.addDefinition(definition, def);
        return def;
    }

    /**
     * Register definition as callable. The callable will be invoked instead calling via new()
     */
    public registerCallable(definition: string|Function, callable: () => any): Definition {
        let def: Definition;
        def = new Definition(definition, callable, null, FactoryMethod.SINGLETON, DefinitionObjectType.CALLABLE);
        this.resolver.addDefinition(definition, def);
        return def;
    }

    /**
     * Resolves definition
     * @param definition
     * @param method
     */
    public resolve(definition: string|Function, method?: FactoryMethod): any {
        return this.resolver.resolve(definition, method, undefined, !this.allowUnregisteredResolve);
    }
}