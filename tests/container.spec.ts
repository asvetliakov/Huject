import './bootstrap';

import {Container} from '../src/container';
import {FactoryMethod} from '../src/definition';

class TestInterface {
    public testMethod() {};
    public num: number;
}

class TestInterfaceImplementation implements TestInterface
{
    public num: number = 4;

    public testMethod() {
    }

}

class TestServiceWithConstructorParams {
    constructor(public param1: string, public param2: number) {}
}

class TestImplementationWithParams implements TestInterface {
    public num: number = 15;

    public testMethod() {
    }

    public constructor(public param1: string, public param2: string) {}
}

class TestObjectAsInterface {
    num: number;
    str: string;
}

describe("Testing simple container's register/resolve", function () {
    let container: Container;
    beforeEach(function () {
        container = new Container();
    });

    describe("When registering", function () {
        it("Should allow to just register object without any parameters", function () {
            container.register(TestInterfaceImplementation);
            let impl = container.resolve(TestInterfaceImplementation);
            impl.num.should.be.equal(4);
        });

        it("Shouldn't allow to register just string without any params", function () {
            let spy = sinon.spy(container, 'register');
            try {
                container.register('test');
            } catch(e) {}
            spy.should.have.thrown();
        });

        it("Should allow to register and resolve interface to implementation", function () {
            container.register(TestInterface, TestInterfaceImplementation);
            let impl = container.resolve(TestInterface);
            impl.num.should.be.equal(4);
        });

        it("Should allow to register and resolve object with constructor parameters", function () {
            container.register(TestServiceWithConstructorParams, ['test1', 10]);
            let impl = container.resolve(TestServiceWithConstructorParams);
            impl.param1.should.be.equal('test1');
            impl.param2.should.be.equal(10);
        });

        it("Should allow to register and resolve interface to implementation with constructor paramters", function () {
            container.register(TestInterface, TestImplementationWithParams, ['justtesting', 'justparam2']);
            let impl = container.resolve(TestInterface);
            impl.num.should.be.equal(15);
            impl.param1.should.be.equal('justtesting');
            impl.param2.should.be.equal('justparam2');
        });


        it("Should allow to override previous registration", function () {
            container.register(TestInterface, TestInterfaceImplementation);
            container.register(TestInterface, TestImplementationWithParams);

            let impl = container.resolve(TestInterface);
            (impl instanceof TestInterfaceImplementation).should.be.false;
            (impl instanceof TestImplementationWithParams).should.be.true;

        });

        it("Should allow to register and resolve precreated object bound to interface class", function () {
            let precreated = new TestInterfaceImplementation();
            container.register(TestInterface, precreated);

            let impl = container.resolve(TestInterface);
            (impl === precreated).should.be.true;

            container.register(TestObjectAsInterface, {num: 50, str: 'testobject'});
            let impl2 = container.resolve(TestObjectAsInterface);
            impl2.num.should.be.equal(50);
            impl2.str.should.be.equal('testobject');
        });

        it("Should allow register class by string key", function () {
            container.register('testkey', TestInterfaceImplementation);

            let impl = container.resolve('testkey');
            impl.num.should.be.equal(4);
        });

        it("Should allow to register class with params by string key", function () {
            container.register('testkey', TestServiceWithConstructorParams, ['ololo1', 'ololo2']);
            let impl = container.resolve('testkey');
            impl.param1.should.be.equal('ololo1');
            impl.param2.should.be.equal('ololo2');
        });

        it("Should allow to register any object by string key", function () {
            container.register('key1', {test: 'test'});
            let impl = container.resolve('key1');
            impl.should.be.deep.equal({test: 'test'});

            container.register('key2', 'teststring');
            impl = container.resolve('key2');
            impl.should.be.equal('teststring');

            container.register('key3', true);
            impl = container.resolve('key3');
            impl.should.be.true;
        });
    });

    describe("When registering callable", function () {
        it("Should allow to register and resolve callable by string key", function () {
            container.registerCallable('testcallable', () => {
                return new TestImplementationWithParams('impl1','impl2');
            });
            let impl = container.resolve('testcallable');
            (impl instanceof TestImplementationWithParams).should.be.true;
            impl.param1.should.be.equal('impl1');
            impl.param2.should.be.equal('impl2');
        });

        it("Should allow to register and resolve callable by class function", function () {
            let precreated = new TestInterfaceImplementation();
            container.registerCallable(TestInterface, () => {return precreated});
            let impl = container.resolve(TestInterface);
            (impl === precreated).should.be.true;
        });
    });

    describe("When one object was already set in container and is being bound to another object", function () {
        beforeEach(function () {
            container.register(TestImplementationWithParams, ['coolparam1', 'coolparam2']);
        });
        it("Should remember constructor params and re-use it if object class bound to another later", function () {
            container.register(TestInterface, TestImplementationWithParams);

            let impl = container.resolve(TestInterface);
            impl.num.should.be.equal(15);
            impl.param1.should.be.equal('coolparam1');
            impl.param2.should.be.equal('coolparam2');
        });

        it("Should override constructor params if later registration is also overriding them", function () {
            container.register(TestInterface, TestImplementationWithParams, ['cooltest1']);

            let impl = container.resolve(TestInterface);
            impl.num.should.be.equal(15);
            impl.param1.should.be.equal('cooltest1');
            global.should.not.exist(impl.param2);
        });
    });

    describe("When registering and specifying factory method", function () {

        it("Should be factory by default", function () {
            let definition = container.register(TestInterfaceImplementation);
            definition.method.should.be.equal(FactoryMethod.FACTORY);
        });

        describe("When factory method is factory", function () {
            beforeEach(function () {
                container.register(TestInterfaceImplementation).as(FactoryMethod.FACTORY);

                container.registerCallable('testkey', () => {
                    return new TestImplementationWithParams('test1','test12');
                }).as(FactoryMethod.FACTORY);

            });
            it("Each resolve should return separate object", function () {
                let impl1 = container.resolve(TestInterfaceImplementation);
                let impl2 = container.resolve(TestInterfaceImplementation);

                (impl1 === impl2).should.be.false;

                impl1 = container.resolve('testkey');
                impl2 = container.resolve('testkey');
                (impl1 === impl2).should.not.be.true;
            });
        });

        describe("When factory method is singleton", function () {
            beforeEach(function () {
                container.register(TestInterfaceImplementation).as(FactoryMethod.SINGLETON);

                container.registerCallable('testkey', () => {
                    return new TestImplementationWithParams('test1','test12');
                }).as(FactoryMethod.SINGLETON);
            });
            it("Each resolve should return same object", function () {
                let impl1 = container.resolve(TestInterfaceImplementation);
                let impl2 = container.resolve(TestInterfaceImplementation);

                (impl1 === impl2).should.be.true;

                impl1 = container.resolve('testkey');
                impl2 = container.resolve('testkey');
                (impl1 === impl2).should.be.true;
            });
        });

        describe("When factory method is object", function () {
            beforeEach(function () {
                container.register(TestInterfaceImplementation).as(FactoryMethod.OBJECT);
            });
            it("Should return original value without calling new", function () {
                let impl = container.resolve(TestInterfaceImplementation);
                (typeof impl === "function").should.be.true;
            });
        });
    });

    describe("When resolving", function () {
        it("Should throw error if resolving unknown definition", function () {
            let spy = sinon.spy(container, 'resolve');
            try {
                container.resolve(TestImplementationWithParams);
            } catch (e) {}
            spy.should.have.been.thrown();
        });

        describe("When set allowUnregisteredResolving to true", function () {
            beforeEach(function () {
                container.setAllowUnregisteredResolving(true);
            });
            it("Should resolve unknown definition if it was function constructor", function () {
                let spy = sinon.spy(container, 'resolve');
                let impl;
                try {
                    impl = container.resolve(TestImplementationWithParams);
                } catch (e) {}
                spy.should.not.have.been.thrown();
                (impl instanceof TestImplementationWithParams).should.be.true;
            });

            it("Should throw error anyway for string definitions", function () {
                let spy = sinon.spy(container, 'resolve');
                try {
                    container.resolve('unknown');
                } catch (e) {}
                spy.should.have.been.thrown();
            });
        });
    });

    describe("When resolving and specifying resolve method", function () {
        beforeEach(function () {
            container.register(TestInterfaceImplementation).as(FactoryMethod.FACTORY);
        });
        it("Should override method for resolving", function () {
            let impl = container.resolve(TestInterfaceImplementation, FactoryMethod.SINGLETON);
            let impl2 = container.resolve(TestInterfaceImplementation, FactoryMethod.SINGLETON);

            (impl === impl2).should.be.true;
        });

        it("Should left original definition untouched", function () {
            let impl = container.resolve(TestInterfaceImplementation, FactoryMethod.SINGLETON);
            let impl2 = container.resolve(TestInterfaceImplementation);
            (impl === impl2).should.not.be.true;
        });
    })

});