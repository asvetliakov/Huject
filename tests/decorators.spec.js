var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require('./bootstrap');
var decorators_1 = require('../src/decorators');
var container_1 = require('../src/container');
var definition_1 = require('../src/definition');
var TestInterface = (function () {
    function TestInterface() {
    }
    TestInterface.prototype.testmethod = function () { };
    ;
    return TestInterface;
})();
var DeepService = (function () {
    function DeepService() {
    }
    return DeepService;
})();
var AnotherService = (function () {
    function AnotherService() {
        this.param = "coolparam";
    }
    __decorate([
        decorators_1.Inject, 
        __metadata('design:type', DeepService)
    ], AnotherService.prototype, "deepService");
    return AnotherService;
})();
var TestImplementationWithParamInject = (function () {
    function TestImplementationWithParamInject() {
        this.num = 5;
    }
    TestImplementationWithParamInject.prototype.testmethod = function () {
    };
    __decorate([
        decorators_1.Inject, 
        __metadata('design:type', AnotherService)
    ], TestImplementationWithParamInject.prototype, "service");
    return TestImplementationWithParamInject;
})();
var ServiceWitDeps = (function () {
    function ServiceWitDeps(service, serviceInterface) {
        this.service = service;
        this.serviceInterface = serviceInterface;
    }
    ServiceWitDeps = __decorate([
        decorators_1.ConstructorInject, 
        __metadata('design:paramtypes', [AnotherService, TestInterface])
    ], ServiceWitDeps);
    return ServiceWitDeps;
})();
var TestController = (function () {
    function TestController(test, test2) {
        this.test = test;
        this.test2 = test2;
    }
    TestController = __decorate([
        decorators_1.ConstructorInject, 
        __metadata('design:paramtypes', [TestInterface, AnotherService])
    ], TestController);
    return TestController;
})();
var SecondController = (function () {
    function SecondController(controllerService) {
        this.controllerService = controllerService;
    }
    SecondController = __decorate([
        decorators_1.ConstructorInject, 
        __metadata('design:paramtypes', [ServiceWitDeps])
    ], SecondController);
    return SecondController;
})();
var PropertyInjectionTest1 = (function () {
    function PropertyInjectionTest1() {
    }
    return PropertyInjectionTest1;
})();
var PropertyInjectionTest2 = (function () {
    function PropertyInjectionTest2() {
    }
    return PropertyInjectionTest2;
})();
var ControllerWithPropertyInjection = (function () {
    function ControllerWithPropertyInjection() {
    }
    __decorate([
        decorators_1.Inject(definition_1.FactoryMethod.SINGLETON), 
        __metadata('design:type', PropertyInjectionTest1)
    ], ControllerWithPropertyInjection.prototype, "injection1");
    __decorate([
        decorators_1.Inject(definition_1.FactoryMethod.SINGLETON), 
        __metadata('design:type', PropertyInjectionTest2)
    ], ControllerWithPropertyInjection.prototype, "injection2");
    return ControllerWithPropertyInjection;
})();
var SecondControllerWithPropertyInjection = (function () {
    function SecondControllerWithPropertyInjection() {
    }
    __decorate([
        decorators_1.Inject(definition_1.FactoryMethod.SINGLETON), 
        __metadata('design:type', PropertyInjectionTest1)
    ], SecondControllerWithPropertyInjection.prototype, "injection1");
    __decorate([
        decorators_1.Inject, 
        __metadata('design:type', PropertyInjectionTest2)
    ], SecondControllerWithPropertyInjection.prototype, "injection2");
    return SecondControllerWithPropertyInjection;
})();
describe("Testing container's autowiring by using decorators", function () {
    var container;
    beforeEach(function () {
        container = new container_1.Container();
    });
    it("Should do constructor injection for any deps in chain", function () {
        container.register(SecondController);
        container.register(ServiceWitDeps);
        container.register(DeepService);
        container.register(AnotherService);
        container.register(TestInterface, TestImplementationWithParamInject);
        var controller = container.resolve(SecondController);
        global.should.exist(controller.controllerService);
        global.should.exist(controller.controllerService.service);
        controller.controllerService.service.param.should.be.equal('coolparam');
        controller.controllerService.serviceInterface.num.should.be.equal(5);
    });
    it("Should do property injection for any deps in chain", function () {
        container.register(TestInterface, TestImplementationWithParamInject);
        container.register(AnotherService);
        container.register(DeepService);
        var impl = container.resolve(TestInterface);
        global.should.exist(impl.service);
        global.should.exist(impl.service.deepService);
    });
    it("Should be able to mix constructor and property injections", function () {
        container.register(DeepService);
        container.register(AnotherService);
        container.register(TestInterface, TestImplementationWithParamInject);
        container.register(ServiceWitDeps);
        var impl = container.resolve(ServiceWitDeps);
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
            var controller1 = container.resolve(ControllerWithPropertyInjection);
            var controller2 = container.resolve(SecondControllerWithPropertyInjection);
            (controller1.injection1 === controller2.injection1).should.be.true;
            (controller1.injection2 === controller2.injection2).should.not.be.true;
        });
    });
});
//# sourceMappingURL=decorators.spec.js.map