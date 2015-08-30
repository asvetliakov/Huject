///<reference path="../typings/tsd.d.ts"/>
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
require('source-map-support/register');
global.sinon = sinon;
global.should = chai.should();
chai.should();
chai.use(sinonChai);
//# sourceMappingURL=bootstrap.js.map