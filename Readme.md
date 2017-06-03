# Typescript dependency injection for humans!
## Reason
I wasn't happy with any DI container found for both Typescript and Javascript. Each was missing some required feature: one had construction injection autowiring but didn't have property injection and ability to pass ordinary constructor parameters when instantiating, other had an ability to register or pass constructor params but didn't have typescript features, etc...

## Features
This DI container supports:
* Constructor injection
* Property injection
* Callable injection
* Service locator pattern (register and resolve primitive, object, class or callable by string definition)
* Property and constructor dependencies autowiring
* Simple API, just 3 methods and few decorators to go
* Optional injection (from version 1.2)
* Injecting container as factory (from 1.3 version)
* Auto-Creating object factories! (from 1.3 version)

## Todo
* Lazy injection

## Installation
```
npm install huject --save
```

### Install typescript definition
```
tsd link # will update your tsd.d.ts file
```

or directly include
```typescript
/// <reference path="node_modules/huject/huject.d.ts" />
```

## API
This library is intended to use only with typescript **1.5+** and **--emitDecoratorMetadata** flag enabled. Do not use it with just Javascript

### Initialization
To use the the library you need to create new Container object. Do it in one place, probably in application bootstrap file
```typescript
import {Container} from 'huject'
let container = new Container();
```

### container.register() method
```typescript
/**
  * Register class definition
  * @param classDefinition Class definition
  * @param constructorArguments Optional array of constructor arguments. They will be passed to constructor when object will be instantiated
  */
register(classDefinition: Function, constructorArguments?: Array<any>): Definition;
/**
  * Bind class to another class (interface)
  * @param interfaceDefinition An interface to bind to
  * @param implementationDefinition Class definition
  * @param constructorArguments Optional array of constructor arguments
  */
register(interfaceDefinition: Function, implementationDefinition: Function, constructorArguments?: Array<any>): Definition;
/**
  * Bind pre-created object to class definition. The object will be used when defined class is instantiated
  * @param classDefinition Class definition
  * @param object Object
  */
register(classDefinition: Function, object: Object): Definition;
/**
  * Bind class definition to string definition. Object could be later instantiated by resolve('symbol');
  * @param symbolDefinition String
  * @param classDefinition Class definition
  * @param constructorArguments Optional array of constructor arguments
  */
register(symbolDefinition: string, classDefinition: Function, constructorArguments?: Array<any>): Definition;
/**
  * Bind object to string definition
  * @param symbolDefinition String
  * @param Object Object
  */
register(symbolDefinition: string, Object: any): Definition;
```
Each function returns Definition object, which has following signature:
```typescript
    interface Definition {
        /**
         * Change FactoryMethod type for definition
         * @param method Factory method type
         */
        as(method: FactoryMethod): Definition;
    }
```

It may be used to override default factory method used when instantiating objects. By default all definitions have FACTORY method

**Examples**
```typescript
// Just register class in container
container.register(MyClass);

// Register constructor arguments with class. Useful when instantiating external library objects
container.register(MyInterfaceImplementation, ['param1', 'value1']);

// Register class to interface. Constructor arguments from previous registration will be passed when resolving MyInterface as well
container.register(MyInterface, MyInterfaceImplementation);

// Register interface to implementation with constructor arguments. Arguments will overwrite previous arguments registration for MyInterfaceImplementation
container.register(MyInterface, MyInterfaceImplementation, ['accesskey', 'accesstoken']);

// register interface (or class) with precreated object
let myService = new MyService();
container.register(MyServiceInterface, myService);

// Assign class to string definition (service locator pattern)
container.register(MyDBWrapper, ['host','username','password']);
container.register('db', MyDBWrapper);

// Assign class with constructor arguments to string definition
// same as previous declaration
container.register('db', MyDBWrapper, ['host','username','password']);

// Assign any value to string definition
container.register('secretkey', 'qwerrty12345');
container.register('secretflag', true);
container.register('secreteoptions', { opt1: 'val1'});
```

### container.registerCallable() method
Register callable with class or string definition. The main difference with just register() is that the container doesn't try to instantiate callable via new and returns callable value as resolve value
```typescript
/**
  * Bind callable function to class definition. Instead creating new object the function result will be used instead
  * @param classDefinition Class definition
  * @param callable Callable
  */
registerCallable(classDefinition: Function, callable: () => Object|Function): Definition;
/**
  * Bind callable function to string definition. Instead creating new object the function result will be used instead
  * @param symbolDefinition String definition
  * @param callable Callable
  */
registerCallable(symbolDefinition: string, callable: () => Object|Function): Definition;
```

**Examples**
```typescript
// Register implementation to interface
container.registerCallable(MyServiceInterface, () => {
    return new MyServiceImplementation();
});
// Assign class to string definition
container.registerCallable('db', () => {
    return new DBWrapper(container.get('host'), container.get('username'), ...);
);
```

### container.resolve() method
Resolves definition. It will resolve any registered dependencies for instance too
```typescript
/**
  * Resolve (instantiate) object from container. Will resolve all wired dependencies if they were specified by decorators
  * @param definition Class definition
  * @param method Factory method. Used to override definition method only for this instantiation
  */
resolve(definition: Function, method?: FactoryMethod): any;
/**
  * Resolve {instantiate} object from container by string definition. Will resolve all wired dependencies if they were specified by decorators
  * @param definition Class definition
  * @param method Factory method. Used to override definition method only for this instantiation
  */
resolve(definition: string, method?: FactoryMethod): any;
```

**Examples**
```typescript
let implementation = container.resolve(MyInterfaceOrClass);
let implementation = container.resolve('db');
```

### FactoryMethod enum
By default resolve() resolves new instance each time as called. By setting FactoryMethod either in register() or resolve() you can override this behavior

```typescript
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
```

**Examples**
```typescript
import {FactoryMethod} from 'huject';

container.register(MyClass).as(FactoryMethod.FACTORY);
let impl1 = container.resolve(MyClass);
let impl2 = container.resolve(MyClass);

(impl1 === impl2); // false

container.register(MyClass).as(FactoryMethod.SINGLETON);
let impl1 = container.resolve(MyClass);
let impl2 = container.resolve(MyClass);

(impl1 === impl2); // true

// Register MyClass as implementation for MyInterface with Singleton factory
container.register(MyInterface, MyClass).as(FactoryMethod.SINGLETON);

container.register(MyClass).as(FactoryMethod.OBJECT);
let impl = container.resolve(MyClass); // Original constructor function
(typeof impl === 'function'); //true
let obj = new impl();
```

## Decorators
You can specify dependencies by using decorators:

```typescript
// Use at top of class property. Resolves by using factory method in definition or default (FACTORY) one
@Inject
// Use at top of class property. Same as @Inject but specifies factory method to resolve
@Inject(method: FactoryMethod);
// Use at top of class property. Resolves by string definition. Optional pass the factory method
@Inject(literal: string, method?: FactoryMethod)
// Use at top of class definition. Takes dependencies from constructor arguments
@ConstructorInject
// Use before constructor argument. Override factory method for single argument
@ConstructorInject(method: FactoryMethod)
// Use before constructor argument. Resolves argument by string definition. Optionally takes the factory method
@ConstructorInject(literal: string, method?: FactoryMethod)
// Use before class property/constructor argument with either @Inject or @ConstructorInject. Specified optional (non-strict) resolution
// If dependency wasn't found then leave original value (for property injection) or pass null (for constructor injection)
@Optional()
// Used for creating auto factories (See below)
@Factory
```

*Note*: @Inject() and @Inject are not same

**Important**: You can combine both property and constructor style injection, but do not use ordinary constructor arguments (without @ConstructorInject('literal') when using constructor injection.

That will not work!
```typescript
@ConstructorInject
class Test {
    public constructor(service: MyService, param1: string, param2: number) {
        ....
    }
}
```
But that will:
```typescript
container.register(Test, ['string1',10]);
class Test {
    @Inject
    public service: MyService;
    
    public constructor(param1: string, param2: number) {
        ...
    }
}
```

Starting from version 1.1 you can use string literals for constructor injection too
```typescript
container.register('token', 'qwerty12345');
container.register('seed', Math.random());

@ConstructorInject
class Test {
    public constructor(service: MyService, @ConstructorInject('token') param1: string, @ConstructorInject('seed') param2: number) {
        ....
    }
}
```

Starting from version 1.2 you can specify @Optional dependencies. That means if dependency wasn't found then don't throw an error and pass null or leave default value instead:
```typescript
import {Optional} from 'huject';

@ConstructorInject
class Test {
    public constructor(
        service: MyService, 
        @Optional() @ConstructorInject('token') param1: string, 
        @Optional() @ConstructorInject('seed') param2: number)
    {
        if (param1 !== null) {
            ....
        }
        ....
    }
}
```

This is very useful for property injection and default configuration:
```typescript
import {Optional, Inject} from 'huject';

container.register('classToken', 'mytoken');

class Test {
    @Optional()
    @Inject('classToken')
    public classParam1: string = "default string";
    
    @Optional()
    @Inject('servicePort')
    public port: number = 80;
}
```
Here classParam1 will be replaced with 'classToken' but port will contain original value



**Examples**:

```typescript
import {Inject, ConstructorInject, FactoryMethod} from 'huject';

@ConstructorInject
class TestController1 {
    private service1: OneService;
    private service2: SecondService;
    
    @Inject
    public service3: ThirdService;
    @Inject(FactoryMethod.SINGLETON)
    public service4; QuatroService;
    
    public constructor(service1: OneService, service2: SecondService) {
        this.service1 = service1;
        this.service2 = service2;
    }
}
```
Here the service1 and service2 are being resolved by constructor injection and service3 and service4 are resolved by property injection. You must have a public property to do property injection.

Another a slight complex example:
```typescript
@ConstructorInject
class TestController2 {
    private service1: OneService;
    private service2: SecondService;
    private secret: string;
    
    @Inject(FactoryMethod.SINGLETON)
    public service3: ThirdService
    
    @Inject('db', FactoryMethod.SINGLETON)
    public db: DbWrapper;
    
    @Inject('controllerToken')
    public controllerToken: string;
    
    public constructor(
        service1: OneService,
        @ConstructorInject(FactoryMethod.SINGLETON) service2: SecondService,
        @ConstructorInject('secretkey') secret: string
    ) {
       this.service1 = service1;
       this.service2 = service2;
       this.secret = secret;
    }
}
```

The @Inject(FactoryMethod) syntax is used to override factory method for inject property. These objects will be equal:
```typescript
@Inject(FactoryMethod.SINGLETON)
public service5: FiveService;
@Inject(FactoryMethod.SINGLETON)
public service6: FiveService;
```
but these will be not:
```typescript
@Inject(FactoryMethod.FACTORY)
public service5: FiveService;
@Inject(FactoryMethod.FACTORY)
public service6: FiveService;
```

Also the service classes should be registered in container first. If any constructor params or implementation bindings were bound to these service, they will be applied automatically.
```typescript
 import {OneService} from 'FirstService';
 import {SecondService} from 'SecondService';
 container.register(OneService);
 container.register(SecondService, ['param1', 'param2', true]);
 ```
 
You can change this behavior by setting **container.setAllowUnregisteredResolving(true)** so you don't need to do simple container.register(class) registration:

 ```typescript
import {OneService} from 'FirstService';
import {SecondService} from 'SecondService';

class Controller {
....
@Inject
public service1: OneService;
@Inject
public service2: SecondService;
...
}
```
but you need to have a reference to constructor functions anyway, so i'd recommend avoid to depend on services directly and use interfaces (or class-like analogs)


## Factories
I'm pleased to introduce to you new feature starting from version 1.3: Auto-Factory and ContainerFactoryInterface

### ContainerFactoryInterface

You can now inject ContainerFactoryInterface into your service/controller and create object from container dynamically, by request:

```typescript
import {ContainerFactoryInterface} from 'huject';
import {Model} from './Model';

class MyController {
    @Inject
    public objectFactory: ContainerFactoryInterface;
    
    public method(): void {
       let myModel = this.objectFactory.make(Model, ['param1', '50, ...]);
       ...
    }
}
```

No need to pre-register ContainerFactoryInterface (unless you want to redefine it). Also objects created by this method will always have FACTORY scope (and it will return new object at each call). The object will be resolved by container so it will get all benefits from dependencies autowiring. You can also pass constructor arguments to make()

Interface is simple:

```typescript
    export class ContainerFactoryInterface {
        /**
         * Create object using the container. Will create new instance for each call
         * @param definition Class or string definition
         * @param constructorArgs Optional constructor arguments. Overrides constructor arguments in definition
         */
        public make(definition: Function, constructorArgs?: Array<any>): any;
        public make(definition: string, constructorArgs?: Array<any>): any;
    }
```


### Auto-Factories

By using decorators and typehints you can tell container to create factory for you:

```typescript
import {Factory} From 'huject'

class MyModel {
    public constructor(num?: number) {
        ....
    }
}

class AnotherModel {
}

// class name doesn't matter, don't forget to specify @Factory for both methods and class!
@Factory
class MyModelFactory {
    @Factory
    public createModel(num?: number): MyModel {return null;}  // Add something to function body to stop TS compiler complain about no function return
    @Factory    
    public createAnotherModel(): AnotherModel { throw new Error(); } // You can throw here to make sure too. That probably will never happen
}

// You can extend factories
@Factory
class CoolFactory extends MyModelFactory {
    @Factory
    public createCoolModel(): MyModel {return null;}
}

// Just inject factory to controller. No pre-registration needed

class Controller {
    @Inject
    public factory: CoolFactory;
    
    public method(): void {
        let myModel = this.factory.createModel(40);  // Call factory inherited method
        let anotherModel = this.factory.createAnotherModel();
        ...
    }
}

```
The return type annotation is required. Also it should be only constructor function. For others types it will throw an error. The return type will be resolved by container, so autowiring is possible (probably better to use property injection for that). You can also pass constructor arguments - just define them in factory and pass when calling factory method.

No need to pre-register neither factory or classes used to create instances by factories in container. 

**Note**: It'a bad practice generally to inject something into business models.


## Typescript interfaces and implementation->interface binding
In typescript the interfaces are not a real objects in javascript realtime. I'd suggest you initially were going to write something like it:
```typescript

interface ServiceInterface {
    public method1(): void;
    public method2(num: number): string;
}

class MyService implements ServiceInterface {
    public method1(): void {
        ...
    }
    public method2(num: number): string {
        ...
    }
}

class MyController {
// or similar constructor injection
    @Inject
    public service: ServiceInterface
}

container.register(ServiceInterface, MyService);
container.register(MyController);

let controller = container.resolve(MyController); //error
```
but you can't. There is no enough runtime information for interfaces so ServiceInterface will be just empty Object and resolve lookup will fail.

Here you can have only one way to workaround this problem:

### Use class or (abstract class) as interface
You can write class instead interface:
```typescript

// Just use class or abstract class keywords
class ServiceInterface {
    public method1(): void {}; // add empty method body
    public method2(num: number): string {}; // add empty method body
}

class MyService implements ServiceInterface {
    public method1(): void {
        ...
    }
    public method2(num: number): string {
        ...
    }
}

class MyController {
// or similar constructor injection
    @Inject
    public service: ServiceInterface
}

container.register(ServiceInterface, MyService); //Ok
container.register(MyController);

let controller = container.resolve(MyController); //OK
```

Nothing wrong here since interface is a shape, but class is a shape too. One problem you need to watch for you 'classed' interfaces and avoid creation these interfaces at runtime:

```typescript
class ServiceInterface {
    public method1(): void {}; // add empty method body
    public method2(num: number): string {}; // add empty method body
}

class MyService implements ServiceInterface {
    public method1(): void {
        ...
    }
    public method2(num: number): string {
        ...
    }
}

class MyController {
// or similar constructor injection
    @Inject
    public service: ServiceInterface
}

// allow to resolve unregistered definitions
container.setAllowUnregisteredResolving(true);
container.register(MyController); // forgot to bind ServiceInterface to MyService here

let controller = container.resolve(MyController); // Ok, but controller.service will have an empty ServiceInterface object instead correctly MyService object
```

That's why i explicitly enabled strong container registration. Without *container.setAllowUnregisteredResolving(true)* the 

```typescript
let controller = container.resolve(MyController);
```
would give you 'Undefined ServiceInterface error';

**Note**: Ordinary or abstract class doesn't matter from runtime perspective. As of version 1.6.0-beta typescript compiler doesn't emit any runtime checks to avoid creation abstract classes at runtime. That could be changed later though.

**Note**: Any abstract methods will be omitted when compiling to JS. I'd suggest you to use empty function body {} and avoid use abstract method(), if you're using abstract classes as interfaces but the choice is up to you. That doesn't impact any container functionality but impacts testing:

```typescript
abstract class ServiceInterface {
   public abstract method1(): void;
}

@ConstructorInject
class Controller {
   private service: ServiceInterface;
   public constructor(service: ServiceInterface) {
      this.service = service;
   }
   
   public test(): void {
       this.service.method1();
   }
}
// in test.ts

let myMock: ServiceInterface = <any> sinon.createStubInstance(ServiceInterface);
let controller = new Controller(myMock);
controller.test(); // Error
```

The compiler will omit method1() from compiled JS file if method was declared as abstract and your stub will not have correct method 
```typescript
abstract class ServiceInterface {
   public method1(): void {}; // empty function body instead of abstract
}

@ConstructorInject
class Controller {
   private service: ServiceInterface;
   public constructor(service: ServiceInterface) {
      this.service = service;
   }
   
   public test(): void {
       this.service.method1();
   }
}
// in test.ts

let myMock: ServiceInterface = <any> sinon.createStubInstance(ServiceInterface);
let controller = new Controller(myMock);
controller.test(); // OK since there was method1() emitted by compiler for service interface prototype
myMock.method1.should.have.been.called; // OK
```

This may looks weird though, so it's up to you which method to use. As i said it didn't affect any container functionality but might be useful for creating testing mocks/stubs.


## Example
In example/ directory you can see completely working DI example. To build you need to run grunt first
```bash
npm install -g grunt-cli
npm install
grunt
node example/main.js
```

## Tests
To run tests type:
```bash
grunt test
```