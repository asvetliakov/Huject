import './bootstrap';
import {Container} from "../src/container";
import {ContainerFactoryInterface} from "../src/containerfactoryinterface";
import {FactoryMethod} from '../src/definition';

class Model1 {
    public num: number = 10;
}

class ServiceSingleton {

}

class Model2 {
    public test: string;

    public constructor(test: string) {
        this.test = test;
    }
}

class Model3 {
    public num: number;

    public constructor(num: number) {
        this.num = num;
    }
}

describe("Testing container factory", () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it("Container should be able resolve factory by interface", () => {
        let obj = container.resolve(ContainerFactoryInterface);
        global.should.exist(obj);
    });

    it("Factory should be singleton", () => {
        let obj1 = container.resolve(ContainerFactoryInterface);
        let obj2 = container.resolve(ContainerFactoryInterface);
        (obj1 === obj2).should.be.true;
    });

    describe("Using the factory interface", () => {
        let factoryInterface: ContainerFactoryInterface;
        beforeEach(() => {
            factoryInterface = container.resolve(ContainerFactoryInterface);
        });

        it("Should be able to instantiate new objects from container without registration", () => {
            let obj = factoryInterface.make(Model1);
            global.should.exist(obj);
            obj.num.should.be.equal(10);
        });

        it("Should instantiate objects only with FACTORY method", () => {
            container.register(ServiceSingleton).as(FactoryMethod.SINGLETON);

            let obj1 = factoryInterface.make(ServiceSingleton);
            let obj2 = factoryInterface.make(ServiceSingleton);

            (obj1 === obj2).should.be.false;
        });

        it("Should throw error if resolving by string definition and it wasn't found", () => {
            let spy = sinon.spy(factoryInterface, 'make');
            try {
                let obj = factoryInterface.make('test');
            } catch (e) {}
            spy.should.have.been.thrown();
        });

        describe("Should able to provide constructor params", () => {

            it("Should pass constructor params when resolving", () => {
                let obj: Model2 = factoryInterface.make(Model2, ['teststring']);
                obj.test.should.be.equal('teststring');
            });

            it("Should override constructor params in definition", () => {
                container.register(Model3, [25]);

                let obj: Model3 = factoryInterface.make(Model3, [50]);
                obj.num.should.be.equal(50);
            });
        });
    });

});