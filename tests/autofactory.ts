import './bootstrap';
import {Factory, Inject} from '../src/decorators';
import {Container} from "../src/container";
import {FactoryAutoProxy} from '../src/factoryautoproxy';


class Model {
    public num: number = 10;

    public constructor(test?: number) {
        if (test) {
            this.num = test
        }
    }
}


@Factory
class TestFactory {
    @Factory
    public createObject(): Model { return null; }


    public nonFactoryMethod(): void {};
}

@Factory
class SecondFactory extends TestFactory {
    @Factory
    public createSecond(num?: number): Model {return null;}
}

@Factory
class InvalidFactory {
    @Factory
    public invalidMethod(): string {return null;}
}

class Service {

    @Inject
    public factory: TestFactory;

    @Inject
    public second: SecondFactory;
}

class ErrorService {
    @Inject
    public factory: InvalidFactory;
}

describe("Testing auto-factories", () => {
    let container: Container;
    beforeEach(() => {
        container = new Container();
    });

    it("They should be resolved regardless allowUnregisteredResolve setting", () => {
        container.register(Service);
        let service: Service = container.resolve(Service);
        service.factory.should.exist;
    });

    it("They should be resolved to ContainerAutoFactory instance", () => {
        container.register(Service);
        let service: Service = container.resolve(Service);
        service.factory.should.be.instanceOf(FactoryAutoProxy);
    });


    it("Should throw an error if return type is not constructor function", () => {
        let spy = sinon.spy(container, 'resolve');
        try {
            container.register(ErrorService);
            let service = container.resolve(Service);
        } catch (e) {
        }
        spy.should.have.thrown();
    });

    describe("When calling method on factory", () => {
        let service: Service;
        beforeEach(() => {
            container.register(Service);
            service = container.resolve(Service);
        });
        it ("Should create object defined in return type", () => {
            let obj: Model = service.factory.createObject();
            obj.should.be.instanceOf(Model);
            obj.num.should.be.equal(10);
        });

        it("Should be able to call method from inherited factory", () => {
            let obj: Model = service.second.createObject();
            obj.should.be.instanceOf(Model);
            obj.num.should.be.equal(10);
        });

        it("Should be able to pass constructor arguments to factory", () => {
            let obj: Model = service.second.createSecond(50);
            obj.num.should.be.equal(50);
        });

    });
});
