# Typescript depedency injection for humans!
## Reason
I wasn't happy with any found DI container both for Typescript and Javascript. Each is missing some required feature: one has construction autowiring but doesn't have property injection and ability to register ordinary constructor parameters, other has an ability to register or pass constructor params but doesn't have typescript autowiring, etc...

## Features
This DI container supports:
* Constructor injection
* Property injection
* Callable injection
* Service locator pattern (register primitive, object, class or callable by string symbol)
* Autowiring
* Simple API, just 3 methods to go

## API
This library is intended to use only with typescript 1.5+ and --emitDecoratorMetadata flag enabled. Do not use with javascript

### Initializing
```typescript
import {Container} from 'huject'
let container = new Container();
```

### container.register() method
Each dependency should be registered, unless *container.setAllowUnregisteredResolving(true)* was called
```typescript
container.register(definition: string|Function, implementationOrConstructorArgs?: Object|Function|Array<any>, constructorArgs?: Array<any>): Definition;
```
* **definition** is class function or string symbol
* **implementationOrConstructorArgs**:
    * Object - Link any object with definition
    * Function - Link another class function with definition (interface to implementation)
    * Array - Link constructor arguments for definition (Useful to pass configuration to external services)
* **constructorArgs** - Array of construction arguments
**Returns** Definition object, used to set FactoryMethod for created definition

**Examples**
```typescript
// Just register class in container
container.register(MyClass);

// Register constructor arguments with class
container.register(MyInterfaceImplementation, ['param1', 'value1']);

// Register class to interface. Constructor arguments from previous registration will be passed when resolving MyInterface as well
container.register(MyInterface, MyInterfaceImplementation);

// Register interface to implementation with constructor arguments. Arguments will overwrite previous arguments registration for MyInterfaceImplementation
container.register(MyInterface, MyInterfaceImplementation, ['accesskey', 'accesstoken']);

// register interface (or class) with precreated object
let myService = new MyService();
container.register(MyServiceInterface, myService);

// register class by string
container.register(MyDBWrapper, ['host','username','password']);
container.register('db', MyDBWrapper);

// register class with constructer arguments by string
// same as previous declaration
container.register('db', MyDBWrapper, ['host','username','password']);

// Register any value by string
container.register('secretkey', 'qwerrty12345');
container.register('secretflag', true);
container.register('secreteoptions', { opt1: 'val1'});
```

### container.registerCallable() method
```typescript
container.registerCallable(definition: string|Function, callable: () => any): Definition
```
Registers callable (anonymous function or lambda function) with definition. The main difference with register() is that container is executing provided callable and returning result

**Examples**
```typescript
container.registerCallable(MyServiceInterface, () => {
    return new MyServiceImplementation();
});

container.registerCallable('db', () => {
return new DBWrapper(container.get('host'), container.get('username'), ...);
```

### container.resolve() method
```typescript
let implementation = container.resolve(definition: string|Function, method?: FactoryMethod): any 
```
Resolves definition by looking all dependency chains. You probably need to call this function only once (avoid using service locator pattern) and in bootstrap/main file
**method** allows to override definition factory method

**Examples**
```typescript
let implementation = container.resolve(MyInterfaceOrClass);
let implementation = container.resolve('db');
```

### FactoryMethod enum
By default resolve() resolves new instance each time as called. By setting FactoryMethod you can override this behavior
Container supports 3 methods:
* **FACTORY** - Default behavior. Returns new instance when requested
* **SINGLETON** - Returns same singleton object when requested
* **OBJECT** - Returns plain object or function method without trying to instantiate it via new()

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

## Autowiring
Autowiring is enabled by decorators, you can have property autowiring and constructor autowiring. You can combine these 2 methods
```typescript
import {Inject, ConstructorInject, FactoryMethod} from 'huject';

// Constructor injection autowiring is enabled by @ConstructorInject decorator

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
Here the service1 and service2 are wired by constructor injection and service3 and service4 are wired by property injection. You must have a public property to do property autowiring.
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
 
 You can change this param by setting container.setAllowUnregisteredResolving(true) so you don't need to do simple registration before:
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
but you need to have a reference to constructor function anyway, so i'll recommend avoid to depends on service directly and use interfaces


## Typescript interfaces and binding interfaces to implementation
In typescript interfaces are not real object in javascript realtime. I think initially you want to wrote something like this:
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
but you can't. There is no enough runtime information for interfaces so ServiceInterface will be just Object.

Here you can 2 ways to workaround:
### Use class as interface
You can write class instead of interface:
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
Nothing wrong here since interface is a shape, but class is a shape too. One problem you need to watch for you 'classed' interfaces to avoid creation this interface at runtime:
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

container.setAllowUnregisteredResolving(true);
container.register(MyController); // forgot to bind ServiceInterface to MyService here

let controller = container.resolve(MyController); // Ok, but controller.service will have an empty ServiceInterface object instead correctly MyService object
```
That's why i explicitly enabled strong function registration. Without *container.setAllowUnregisteredResolving(true)* the 
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

## Examples
See example/ directory. To build you need to have grunt first
```bash
npm install -g grunt-cli
npm install
grunt
```

to run tests run:
```bash
grunt test
```