var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require('./bootstrap');
var decorators_1 = require('../src/decorators');
var container_1 = require("../src/container");
var factoryautoproxy_1 = require('../src/factoryautoproxy');
var Model = (function () {
    function Model(test) {
        this.num = 10;
        if (test) {
            this.num = test;
        }
    }
    return Model;
})();
var TestFactory = (function () {
    function TestFactory() {
    }
    TestFactory.prototype.createObject = function () { return null; };
    TestFactory.prototype.nonFactoryMethod = function () { };
    ;
    __decorate([
        decorators_1.Factory, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Model)
    ], TestFactory.prototype, "createObject", null);
    TestFactory = __decorate([
        decorators_1.Factory, 
        __metadata('design:paramtypes', [])
    ], TestFactory);
    return TestFactory;
})();
var SecondFactory = (function (_super) {
    __extends(SecondFactory, _super);
    function SecondFactory() {
        _super.apply(this, arguments);
    }
    SecondFactory.prototype.createSecond = function (num) { return null; };
    __decorate([
        decorators_1.Factory, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Number]), 
        __metadata('design:returntype', Model)
    ], SecondFactory.prototype, "createSecond", null);
    SecondFactory = __decorate([
        decorators_1.Factory, 
        __metadata('design:paramtypes', [])
    ], SecondFactory);
    return SecondFactory;
})(TestFactory);
var InvalidFactory = (function () {
    function InvalidFactory() {
    }
    InvalidFactory.prototype.invalidMethod = function () { return null; };
    __decorate([
        decorators_1.Factory, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', String)
    ], InvalidFactory.prototype, "invalidMethod", null);
    InvalidFactory = __decorate([
        decorators_1.Factory, 
        __metadata('design:paramtypes', [])
    ], InvalidFactory);
    return InvalidFactory;
})();
var Service = (function () {
    function Service() {
    }
    __decorate([
        decorators_1.Inject, 
        __metadata('design:type', TestFactory)
    ], Service.prototype, "factory", void 0);
    __decorate([
        decorators_1.Inject, 
        __metadata('design:type', SecondFactory)
    ], Service.prototype, "second", void 0);
    return Service;
})();
var ErrorService = (function () {
    function ErrorService() {
    }
    __decorate([
        decorators_1.Inject, 
        __metadata('design:type', InvalidFactory)
    ], ErrorService.prototype, "factory", void 0);
    return ErrorService;
})();
describe("Testing auto-factories", function () {
    var container;
    beforeEach(function () {
        container = new container_1.Container();
    });
    it("They should be resolved regardless allowUnregisteredResolve setting", function () {
        container.register(Service);
        var service = container.resolve(Service);
        service.factory.should.exist;
    });
    it("They should be resolved to ContainerAutoFactory instance", function () {
        container.register(Service);
        var service = container.resolve(Service);
        service.factory.should.be.instanceOf(factoryautoproxy_1.FactoryAutoProxy);
    });
    it("Should throw an error if return type is not constructor function", function () {
        var spy = sinon.spy(container, 'resolve');
        try {
            container.register(ErrorService);
            var service = container.resolve(Service);
        }
        catch (e) {
        }
        spy.should.have.thrown();
    });
    describe("When calling method on factory", function () {
        var service;
        beforeEach(function () {
            container.register(Service);
            service = container.resolve(Service);
        });
        it("Should create object defined in return type", function () {
            var obj = service.factory.createObject();
            obj.should.be.instanceOf(Model);
            obj.num.should.be.equal(10);
        });
        it("Should be able to call method from inherited factory", function () {
            var obj = service.second.createObject();
            obj.should.be.instanceOf(Model);
            obj.num.should.be.equal(10);
        });
        it("Should be able to pass constructor arguments to factory", function () {
            var obj = service.second.createSecond(50);
            obj.num.should.be.equal(50);
        });
    });
});
//# sourceMappingURL=autofactory.js.map