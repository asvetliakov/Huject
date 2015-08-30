declare module "huject" {
    interface ContainerStatic {
        new(): ContainerImpl;
    }

    interface ContainerImpl {
        /**
         * Register class definition
         * @param classDefinition Class definition
         * @param constructorArguments Optional array of constructor arguments. They will be passed to constructor when object will be instantiated
         */
        register<T>(classDefinition: Instantiable<T>, constructorArguments?: Array<any>): Definition;
        /**
         * Bind class to another class (interface)
         * @param interfaceDefinition An interface to bind to
         * @param implementationDefinition Class definition
         * @param constructorArguments Optional array of constructor arguments
         */
        register<T>(interfaceDefinition: Instantiable<T>, implementationDefinition: Instantiable<T>, constructorArguments?: Array<any>): Definition;
        /**
         * Bind pre-created object to class definition. The object will be used when defined class is instantiated
         * @param classDefinition Class definition
         * @param object Object
         */
        register<T>(classDefinition, object: Object): Definition;

        /**
         * Bind class definition to string. Object could be later instantiated by resolve('symbol');
         * @param symbolDefinition String
         * @param classDefinition Class definition
         * @param constructorArguments Optional array of constructor arguments
         */
        register<T>(symbolDefinition: string, classDefinition: Instantiable<T>, constructorArguments?: Array<any>): Definition;
        /**
         * Bind object to string definition
         * @param symbolDefinition String
         * @param Object Object
         */
        register(symbolDefinition: string, Object: any): Definition;

        /**
         * Bind callable function to class definition. Instead creating new object the function result will be used instead
         * @param classDefinition Class definition
         * @param callable Callable
         */
        registerCallable<T>(classDefinition: Instantiable<T>, callable: () => T): Definition;
        /**
         * Bind callable function to string definition. Instead creating new object the function result will be used instead
         * @param symbolDefinition String definition
         * @param callable Callable
         */
        registerCallable<T>(symbolDefinition: string, callable: () => T): Definition;

        /**
         * Resolve (instantiate) object from container. Will resolve all wired dependencies if they were specified by decorators
         * @param definition Class definition
         * @param method Factory method. Used to override definition method only for this instantiation
         */
        resolve<T>(definition: Instantiable<T>, method?: FactoryMethod): T;
        /**
         * Resolve {instantiate} object from container by string definition. Will resolve all wired dependencies if they were specified by decorators
         * @param definition Class definition
         * @param method Factory method. Used to override definition method only for this instantiation
         */
        resolve(definition: string, method?: FactoryMethod): any;
    }

    interface Instantiable<T> {
        new(...args: Array<any>): T;
    }

    interface Definition {
        /**
         * Change FactoryMethod type for definition
         * @param method Factory method type
         */
        as(method: FactoryMethod): Definition;
    }

    /**
     * Used to specify instantiate method
     */
    export const enum FactoryMethod {
        /** Singleton. Each instantiation will share same object */
        SINGLETON,
        /** Factory. Each instantiation will return new object */
        FACTORY,
        /** Object. Do not try to instantiate object and return original function or object */
        OBJECT
    }

    export var Container: ContainerStatic;

    /**
     * Property injection
     * @param method Specify to override factory method for registration
     */
    export function Inject(method: FactoryMethod);
    /**
     * Property injection. Will instantiate with default factory method or with registered method if dependency was already registered
     * @param target
     * @param propertyKey
     */
    export function Inject(target: Object, propertyKey: string|symbol): void;

    /**
     * Constructor injection. Do not mess constructor injection with ordinary (non-injected) params
     * @param target
     */
    export function ConstructorInject<TFunction extends Function>(target: TFunction): TFunction|void;
}