# Typescript dependency injection for humans!
## Reason
I wasn't happy with any found DI container both for Typescript and Javascript. Each was missing some required feature: one had construction injection autowiring but didn't have property injection and ability to pass ordinary constructor parameters when instantiating, other had an ability to register or pass constructor params but didn't have typescript features, etc...

## Features
This DI container supports:
* Constructor injection
* Property injection
* Callable injection
* Service locator pattern (register and resolve primitive, object, class or callable by string definition)
* Property and constructor dependencies autowiring
* Simple API, just 3 methods to go

## API
This library is intended to use only with typescript **1.5+** and **--emitDecoratorMetadata** flag enabled. Do not use it with just Javascript

### Initialization
To use the the library you need to create new Container object. Do it in one place, perhaps in application bootstrap file
```typescript
/// <reference path="node_modules/huject/huject.d.ts" />
import {Container} from 'huject'
let container = new Container();
```
Do not to forgot to specify reference path

### container.register() method
```typescript
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

// Container will catch error if you're trying to register incorrect implementation with interface
container.register(MyInterface, WrongImplementation);  // error

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
registerCallable<T>(classDefinition: Instantiable<T>, callable: () => T): Definition;
/**
  * Bind callable function to string definition. Instead creating new object the function result will be used instead
  * @param symbolDefinition String definition
  * @param callable Callable
  */
registerCallable<T>(symbolDefinition: string, callable: () => T): Definition;
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
```

### container.resolve() method
Resolves definition. It will resolve any registered dependencies for instance too
```typescript
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
// Use before constructor argument. Resolves argument by string literal. Optionally takes the factory method
@ConstructorInject(string: literal, method?: FactoryMethod)
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

Another complex example:
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

Here you can have 2 ways to workaround this problem:

### Use class as interface
You can write class instead interface:
```typescript

// Just use class keyword
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

### Use new typescript 1.6 abstract classes
Since you can't instantiate abstract classes you can safely enable *container.setAllowUnregisteredResolving(true)*:

```typescript
abstract class ServiceInterface {
    public method1(): void {}; 
    public method2(num: number): string {}; 
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

container.setAllowUnregisteredResolving(true);
container.register(MyController); // forgot to bind ServiceInterface to MyService here

let controller = container.resolve(MyController); // Error here. Cann't instantiate abstract ServiceInterface class
```

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