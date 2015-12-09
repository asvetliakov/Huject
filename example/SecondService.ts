"use strict";

import {DeepService} from './DeepService';
import {Inject} from '../src/index'

export class SecondService {
    @Inject
    public deepService: DeepService;

    private serviceName: string = "I'm Default named second service";

    public constructor(name: string) {
        this.serviceName = name;
    }

    public say(): string {
        return `${this.serviceName} and my deep says: ${this.deepService.deepSay()}`;
    }

}