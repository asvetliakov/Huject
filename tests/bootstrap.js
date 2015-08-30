(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'chai', 'sinon', 'sinon-chai', 'source-map-support/register'], function (require, exports) {
    ///<reference path="../typings/tsd.d.ts"/>
    var chai = require('chai');
    var sinon = require('sinon');
    var sinonChai = require('sinon-chai');
    require('source-map-support/register');
    global.sinon = sinon;
    global.should = chai.should();
    chai.should();
    chai.use(sinonChai);
});
//# sourceMappingURL=bootstrap.js.map