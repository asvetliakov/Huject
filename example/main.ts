"use strict";

import container from './bootstrap';
import {ServiceInterface} from './ServiceInterface';
import {SecondService} from './SecondService';
import {ConstructorInject} from '../src/index';

@ConstructorInject
class MainController {
    private serviceInterface: ServiceInterface;
    private secondService: SecondService;

    public constructor(serviceOne: ServiceInterface, serviceTwo: SecondService) {
        this.serviceInterface = serviceOne;
        this.secondService = serviceTwo;
    }

    public sayAll(): void {
        console.log(`Service interface says: ${this.serviceInterface.say()}`);
        console.log(`Second service says ${this.secondService.say()}`);
    }
}

container.register(MainController);

let controller = container.resolve(MainController);
controller.sayAll();

