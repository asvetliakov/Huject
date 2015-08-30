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
});