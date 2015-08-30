///<reference path="../typings/tsd.d.ts"/>
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai = require('sinon-chai');

import 'source-map-support/register';

interface MyGlobal extends NodeJS.Global {
    sinon: any;
    should: any;
}

declare var global: MyGlobal;

global.sinon = sinon;
global.should = chai.should();
chai.should();
chai.use(sinonChai);