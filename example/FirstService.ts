"use strict";

import {ServiceInterface} from './ServiceInterface';

export class FirstService implements ServiceInterface {
    public say():string {
        return 'Hello from FirstService';
    }

}