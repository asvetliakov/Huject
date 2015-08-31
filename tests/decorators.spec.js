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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var InjectWithStringDefinition = (function () {
    function InjectWithStringDefinition() {
    }
    __decorate([
        decorators_1.Inject('coolnumber'), 
        __metadata('design:type', Number)
    ], InjectWithStringDefinition.prototype, "num");
    __decorate([
        decorators_1.Inject('coolstring'), 
        __metadata('design:type', String)
    ], InjectWithStringDefinition.prototype, "str");
    __decorate([
        decorators_1.Inject('service', definition_1.FactoryMethod.SINGLETON), 
        __metadata('design:type', DeepService)
    ], InjectWithStringDefinition.prototype, "service");
    return InjectWithStringDefinition;
})();
var InjectWithStringDefinitionWrong = (function () {
    function InjectWithStringDefinitionWrong() {
    }
    __decorate([
        decorators_1.Inject('coolnumber'), 
        __metadata('design:type', Number)
    ], InjectWithStringDefinitionWrong.prototype, "num");
    __decorate([
        decorators_1.Inject('wrongstring'), 
        __metadata('design:type', String)
    ], InjectWithStringDefinitionWrong.prototype, "str");
    return InjectWithStringDefinitionWrong;
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
var ConstructorInjectionWithLiterals = (function () {
    function ConstructorInjectionWithLiterals(service, num, str, deep) {
        this.service = service;
        this.num = num;
        this.str = str;
        this.deep = deep;
    }
    ConstructorInjectionWithLiterals = __decorate([
        decorators_1.ConstructorInject,
        __param(1, decorators_1.ConstructorInject('coolnumber')),
        __param(2, decorators_1.ConstructorInject('coolstring')),
        __param(3, decorators_1.ConstructorInject('deepservice', definition_1.FactoryMethod.SINGLETON)), 
        __metadata('design:paramtypes', [AnotherService, Number, String, DeepService])
    ], ConstructorInjectionWithLiterals);
    return ConstructorInjectionWithLiterals;
})();
var ConstructorInjectionWithFactory = (function () {
    function ConstructorInjectionWithFactory(service, service2) {
        this.service1 = service;
        this.service2 = service2;
    }
    ConstructorInjectionWithFactory = __decorate([
        decorators_1.ConstructorInject,
        __param(0, decorators_1.ConstructorInject(definition_1.FactoryMethod.SINGLETON)),
        __param(1, decorators_1.ConstructorInject(definition_1.FactoryMethod.OBJECT)), 
        __metadata('design:paramtypes', [AnotherService, DeepService])
    ], ConstructorInjectionWithFactory);
    return ConstructorInjectionWithFactory;
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
    describe("When constructor arguments have any @ConstructorInject decorator", function () {
        beforeEach(function () {
            container.register(DeepService);
            container.register(AnotherService);
            container.register('coolnumber', 10);
            container.register('coolstring', 'test');
            container.registerCallable('deepservice', function () {
                return new DeepService();
            });
            container.register(ConstructorInjectionWithLiterals);
        });
        describe("When decorator has a string literal", function () {
            it("Should resolve this argument by string literal", function () {
                var impl = container.resolve(ConstructorInjectionWithLiterals);
                impl.num.should.be.equal(10);
                impl.str.should.be.equal('test');
                (impl.service instanceof AnotherService).should.be.true;
                impl.service.param.should.be.equal('coolparam');
                (impl.deep instanceof DeepService).should.be.true;
            });
            it("Should use factory method if it was specified", function () {
                var impl = container.resolve(ConstructorInjectionWithLiterals);
                var impl2 = container.resolve(ConstructorInjectionWithLiterals);
                (impl.deep === impl2.deep).should.be.true;
            });
        });
        describe("When decorator has only factory method", function () {
            beforeEach(function () {
                container.register(ConstructorInjectionWithFactory);
            });
            it("Should use this factory method", function () {
                var impl = container.resolve(ConstructorInjectionWithFactory);
                var impl2 = container.resolve(ConstructorInjectionWithFactory);
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
            var impl = container.resolve(InjectWithStringDefinition);
            impl.num.should.be.equal(5);
            impl.str.should.be.equal('teststring');
            impl.service.should.exist;
        });
        it("Should throw an error if string definition wasn't found", function () {
            container.register(InjectWithStringDefinitionWrong);
            var spy = sinon.spy(container, 'resolve');
            try {
                container.resolve(InjectWithStringDefinitionWrong);
            }
            catch (e) { }
            spy.should.have.been.throw;
        });
        it("Should take factory method if specified", function () {
            var impl1 = container.resolve(InjectWithStringDefinition);
            var impl2 = container.resolve(InjectWithStringDefinition);
            (impl1.service === impl2.service).should.be.true;
        });
    });
});
//# sourceMappingURL=decorators.spec.js.map