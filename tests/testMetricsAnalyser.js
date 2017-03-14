'use strict';

var proxyquire = require('proxyquire');
// var metricsAnalyser = require('../lib/metricsAnalyser');
var assert = require('assert');

describe('Test metricsAnalyser', function () {

  it('should successfully scale up based on cpu load', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [451, 0, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale up based on cpu load 2', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [449, 0, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale down based on cpu load ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [449, 0, 10];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should not scale down past 1 pod', function (done) {

    var count = 1;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [0, 0, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 1, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale up based on memory load', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [0, 451, 1];
    metricsAnalyser.go(data, true);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale up based on memory load 2', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [0, 449, 1];
    metricsAnalyser.go(data, true);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale down based on memory load ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [0, 449, 10];
    metricsAnalyser.go(data, true);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should not scale down past 1 pod', function (done) {

    var count = 1;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      }
    });

    var data = [0, 0, 1];
    metricsAnalyser.go(data, true);

    setTimeout(function () {
      assert.equal(count, 1, 'Count is wrong');
      done();
    }, 500);
  });

});
