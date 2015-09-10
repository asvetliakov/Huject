require('./bootstrap');
var container_1 = require("../src/container");
var containerfactoryinterface_1 = require("../src/containerfactoryinterface");
var definition_1 = require('../src/definition');
var Model1 = (function () {
    function Model1() {
        this.num = 10;
    }
    return Model1;
})();
var ServiceSingleton = (function () {
    function ServiceSingleton() {
    }
    return ServiceSingleton;
})();
var Model2 = (function () {
    function Model2(test) {
        this.test = test;
    }
    return Model2;
})();
var Model3 = (function () {
    function Model3(num) {
        this.num = num;
    }
    return Model3;
})();
describe("Testing container factory", function () {
    var container;
    beforeEach(function () {
        container = new container_1.Container();
    });
    it("Container should be able resolve factory by interface", function () {
        var obj = container.resolve(containerfactoryinterface_1.ContainerFactoryInterface);
        global.should.exist(obj);
    });
    it("Factory should be singleton", function () {
        var obj1 = container.resolve(containerfactoryinterface_1.ContainerFactoryInterface);
        var obj2 = container.resolve(containerfactoryinterface_1.ContainerFactoryInterface);
        (obj1 === obj2).should.be.true;
    });
    describe("Using the factory interface", function () {
        var factoryInterface;
        beforeEach(function () {
            factoryInterface = container.resolve(containerfactoryinterface_1.ContainerFactoryInterface);
        });
        it("Should be able to instantiate new objects from container without registration", function () {
            var obj = factoryInterface.make(Model1);
            global.should.exist(obj);
            obj.num.should.be.equal(10);
        });
        it("Should instantiate objects only with FACTORY method", function () {
            container.register(ServiceSingleton).as(definition_1.FactoryMethod.SINGLETON);
            var obj1 = factoryInterface.make(ServiceSingleton);
            var obj2 = factoryInterface.make(ServiceSingleton);
            (obj1 === obj2).should.be.false;
        });
        it("Should throw error if resolving by string definition and it wasn't found", function () {
            var spy = sinon.spy(factoryInterface, 'make');
            try {
                var obj = factoryInterface.make('test');
            }
            catch (e) { }
            spy.should.have.been.thrown();
        });
        describe("Should able to provide constructor params", function () {
            it("Should pass constructor params when resolving", function () {
                var obj = factoryInterface.make(Model2, ['teststring']);
                obj.test.should.be.equal('teststring');
            });
            it("Should override constructor params in definition", function () {
                container.register(Model3, [25]);
                var obj = factoryInterface.make(Model3, [50]);
                obj.num.should.be.equal(50);
            });
        });
    });
});
//# sourceMappingURL=containerfactory.spec.js.map