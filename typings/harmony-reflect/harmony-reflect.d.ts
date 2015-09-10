declare module "harmony-reflect" {

}

declare var Proxy: Reflect.Proxy;

declare namespace Reflect {
    interface Proxy {
        new<T>(target: T, handler: ProxyHandler): T;
    }

    interface ProxyHandler {
        get?: (target, name, receiver) => any;
        set?: (target, name, value, receiver) => any;
        has?: (target, name) => any;
        apply?: (target, receiver, args) => any;
        construct?: (target, args, newTarget) => any;
        getOwnPropertyDescriptor?: (target, name) => any;
        defineProperty?: (target, name, desc) => any;
        getPrototypeOf?: (target) => any;
        setPrototypeOf?: (target, newProto) => any;
        deleteProperty?: (target, name) => any;
        enumerate?: (target) => any;
        preventExtensions?: (target) => any;
        isExtensible?: (target) => any;
        ownKeys?: (target) => any;
    }
}
