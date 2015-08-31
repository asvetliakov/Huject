import './bootstrap';

import {ConstructorInject, Inject} from '../src/decorators';
import {Container} from '../src/container';
import {FactoryMethod} from '../src/definition';


class TestInterface {
    public testmethod() {};
}

class DeepService {

}

class AnotherService {
    @Inject
    public deepService: DeepService;

    public param: string = "coolparam";
}

class TestImplementationWithParamInject implements TestInterface {

    @Inject
    public service: AnotherService;
    public num: number = 5;

    public testmethod() {
    }
}

@ConstructorInject
class ServiceWitDeps {
    public service: AnotherService;
    public serviceInterface: TestInterface;
    public constructor(service: AnotherService, serviceInterface: TestInterface){
        this.service = service;
        this.serviceInterface = serviceInterface;
    }
}

@ConstructorInject
class TestController {
    public test: TestInterface;
    public test2: AnotherService;
    public constructor(test: TestInterface, test2: AnotherService) {
        this.test = test;
        this.test2 = test2;
    }
}

@ConstructorInject
class SecondController {
    controllerService: ServiceWitDeps;
    public constructor(controllerService: ServiceWitDeps) {
        this.controllerService = controllerService;
    }
}

class PropertyInjectionTest1 {

}

class PropertyInjectionTest2 {

}

class InjectWithStringDefinition {
    @Inject('coolnumber')
    public num: number;

    @Inject('coolstring')
    public str: string;

    @Inject('service', FactoryMethod.SINGLETON)
    public service: DeepService;
}

class InjectWithStringDefinitionWrong {
    @Inject('coolnumber')
    public num: number;

    @Inject('wrongstring')
    public str: string;
}

class ControllerWithPropertyInjection {
    @Inject(FactoryMethod.SINGLETON)
    public injection1: PropertyInjectionTest1;
    @Inject(FactoryMethod.SINGLETON)
    public injection2: PropertyInjectionTest2;
}

class SecondControllerWithPropertyInjection {
    @Inject(FactoryMethod.SINGLETON)
    public injection1: PropertyInjectionTest1;
    @Inject
    public injection2: PropertyInjectionTest2;
}

@ConstructorInject
class ConstructorInjectionWithLiterals {
    public service: AnotherService;

    public num: number;

    public str: string;

    public deep: DeepService;

    public constructor(
        service: AnotherService,
        @ConstructorInject('coolnumber') num: number,
        @ConstructorInject('coolstring') str: string,
        @ConstructorInject('deepservice', FactoryMethod.SINGLETON) deep: DeepService)
    {
        this.service = service;
        this.num = num;
        this.str = str;
        this.deep = deep;
    }
}

@ConstructorInject
class ConstructorInjectionWithFactory {
    public service1: AnotherService;
    public service2: DeepService;

    public constructor(
        @ConstructorInject(FactoryMethod.SINGLETON) service: AnotherService,
        @ConstructorInject(FactoryMethod.OBJECT) service2: DeepService
    ) {
        this.service1 = service;
        this.service2 = service2;
    }
}

describe("Testing container's autowiring by using decorators", function () {
    let container: Container;
    beforeEach(function () {
        container = new Container();
    });

    it("Should do constructor injection for any deps in chain", function () {
        container.register(SecondController);
        container.register(ServiceWitDeps);
        container.register(DeepService);
        container.register(AnotherService);
        container.register(TestInterface, TestImplementationWithParamInject);

        let controller = container.resolve(SecondController);
        global.should.exist(controller.controllerService);
        global.should.exist(controller.controllerService.service);
        controller.controllerService.service.param.should.be.equal('coolparam');
        controller.controllerService.serviceInterface.num.should.be.equal(5);

    });

    describe("When constructor arguments have any @ConstructorInject decorator", function () {
        beforeEach(function () {
            container.register(DeepService);
            container.register(AnotherService);
            container.register('coolnumber', 10);
            container.register('coolstring', 'test');
            container.registerCallable('deepservice', () => {
                return new DeepService();
            });
            container.register(ConstructorInjectionWithLiterals);
        });
        describe("When decorator has a string literal", function () {
            it("Should resolve this argument by string literal", function () {
                let impl: ConstructorInjectionWithLiterals = container.resolve(ConstructorInjectionWithLiterals);
                impl.num.should.be.equal(10);
                impl.str.should.be.equal('test');
                (impl.service instanceof AnotherService).should.be.true;
                impl.service.param.should.be.equal('coolparam');
                (impl.deep instanceof DeepService).should.be.true;
            });

            it("Should use factory method if it was specified", function () {
                let impl: ConstructorInjectionWithLiterals = container.resolve(ConstructorInjectionWithLiterals);
                let impl2: ConstructorInjectionWithLiterals = container.resolve(ConstructorInjectionWithLiterals);

                (impl.deep === impl2.deep).should.be.true;
            });
        });
        describe("When decorator has only factory method", function () {
            beforeEach(function () {
                container.register(ConstructorInjectionWithFactory);
            });
            it("Should use this factory method", function () {
                let impl: ConstructorInjectionWithFactory = container.resolve(ConstructorInjectionWithFactory);
                let impl2: ConstructorInjectionWithFactory = container.resolve(ConstructorInjectionWithFactory);
                (impl.service1 === impl2.service1).should.be.true;
                (typeof impl.service2 === 'function').should.be.true;
                (typeof impl2.service2 === 'function').should.be.true;
            });
        });
    });

    it("Should do property injection for any deps in chain", function () {
        container.register(TestInterface, TestImplementationWithParamInject);
        container.register(AnotherService);
        container.register(DeepService);

        let impl = container.resolve(TestInterface);
        global.should.exist(impl.service);
        global.should.exist(impl.service.deepService);
    });

    it("Should be able to mix constructor and property injections", function () {
        container.register(DeepService);
        container.register(AnotherService);
        container.register(TestInterface, TestImplementationWithParamInject);
        container.register(ServiceWitDeps);

        let impl = container.resolve(ServiceWitDeps);

        global.should.exist(impl.service);
        global.should.exist(impl.serviceInterface);
        global.should.exist(impl.service.deepService);

        (impl.service instanceof AnotherService).should.be.true;
        (impl.serviceInterface instanceof TestImplementationWithParamInject).should.be.true;
    });

    describe("When factory method is specified with property injection", function () {
        beforeEach(function () {
            container.register(PropertyInjectionTest1);
            container.register(PropertyInjectionTest2);
            container.register(ControllerWithPropertyInjection);
            container.register(SecondControllerWithPropertyInjection);
        });
        it("Should use this factory method for resolving", function () {

            let controller1 = container.resolve(ControllerWithPropertyInjection);
            let controller2 = container.resolve(SecondControllerWithPropertyInjection);

            (controller1.injection1 === controller2.injection1).should.be.true;
            (controller1.injection2 === controller2.injection2).should.not.be.true;
        });
    });

    describe("When inject decorator is specified with string symbol as first argument", function () {
        beforeEach(function () {
            container.register('coolnumber', 5);
            container.register('coolstring', 'teststring');
/*
            container.register('deepservice', () => {
                return new DeepService();
            });
*/
            container.register('service', DeepService);
            container.register(InjectWithStringDefinition);
        });
        it("Should resolve it to object registered with string definition", function () {
            let impl: InjectWithStringDefinition = container.resolve(InjectWithStringDefinition);
            impl.num.should.be.equal(5);
            impl.str.should.be.equal('teststring');
            impl.service.should.exist;
        });

        it("Should throw an error if string definition wasn't found", function () {
            container.register(InjectWithStringDefinitionWrong);
            let spy = sinon.spy(container, 'resolve');

            try {
                container.resolve(InjectWithStringDefinitionWrong);
            } catch(e) {}

            spy.should.have.been.throw;
        });

        it("Should take factory method if specified", function () {
            let impl1: InjectWithStringDefinition = container.resolve(InjectWithStringDefinition);
            let impl2: InjectWithStringDefinition = container.resolve(InjectWithStringDefinition);

            (impl1.service === impl2.service).should.be.true;
        });
    });
});