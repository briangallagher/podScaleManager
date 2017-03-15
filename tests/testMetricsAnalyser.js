'use strict';

var proxyquire = require('proxyquire');
var assert = require('assert');

describe('Test metricsAnalyser', function () {

  it('should successfully scale up based on cpu load', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [451, 0, 1, 1];
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
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [451, 0, 2, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should not try to scale as we have sufficient pods', function (done) {

    var count = -1;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [451, 0, 4, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, -1, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down by 1, form 5 to 4', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [451, 0, 5, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down by 1, form 6 to 5', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [451, 0, 6, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 5, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down by 1, from 10 to 9', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [451, 0, 10, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 9, 'Count is wrong');
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
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, memoryOnlyModel);
        }
      }
    });

    var data = [0, 301, 1, 1];
    metricsAnalyser.go(data);

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
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, memoryOnlyModel);
        }
      }
    });

    var data = [0, 301, 2, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should not try to scale as we have sufficient pods for required memory ', function (done) {

    var count = -1;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, memoryOnlyModel);
        }
      }
    });

    var data = [0, 301, 4, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, -1, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down by 1, form 5 to 4 to meet memory needs', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, memoryOnlyModel);
        }
      }
    });

    var data = [0, 301, 5, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down by 1, form 6 to 5 to meet memory needs', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, memoryOnlyModel);
        }
      }
    });

    var data = [0, 301, 6, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 5, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down by 1, from 10 to 9  to meet memory needs', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuOnlyModel);
        }
      }
    });

    var data = [0, 301, 10, 1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 9, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale up based on io load', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, ioOnlyModel);
        }
      }
    });

    var data = [0, 0, 2, 2.1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should successfully scale up based on io load, test-2 ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, ioOnlyModel);
        }
      }
    });

    var data = [0, 0, 2, 10];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should not try to scale as io demand is being met ', function (done) {

    var count = -1;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, ioOnlyModel);
        }
      }
    });

    var data = [0, 0, 2, 1.5];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, -1, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down based on current io rate ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, ioOnlyModel);
        }
      }
    });

    var data = [0, 0, 4, 0.5];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale up when cpu is high and memory is low ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuAndMemoryModel);
        }
      }
    });

    var data = [451, 50, 2, 0];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale up when memory is high and cpu is low ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuAndMemoryModel);
        }
      }
    });

    var data = [50, 301, 2, 0];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 4, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down when memory is low and cpu is low ', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuAndMemoryModel);
        }
      }
    });

    var data = [10, 10, 4, 0];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale up when cpu and memory are low and io is high', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuMemoryAndIoModel);
        }
      }
    });

    var data = [10, 10, 2, 10];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 3, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale down when cpu, memory and io are low', function (done) {

    var count = 0;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuMemoryAndIoModel);
        }
      }
    });

    var data = [10, 10, 2, 0.5];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, 1, 'Count is wrong');
      done();
    }, 500);
  });

  it('should scale not scale up or down when all thresholds are within limits', function (done) {

    var count = -1;

    var metricsAnalyser = proxyquire('../lib/metricsAnalyser', {
      './scalePods': {
        scale: function (numPods) {
          count = numPods;
        }
      },
      './dataModel': {
        getModel: function (cb) {
          cb(null, cpuMemoryAndIoModel);
        }
      }
    });

    var data = [10, 10, 1, 1.1];
    metricsAnalyser.go(data);

    setTimeout(function () {
      assert.equal(count, -1, 'Count is wrong');
      done();
    }, 500);
  });

});

var cpuOnlyModel = {
  "default": {
    "cpuTresholdPercent": 50
  }
};

var memoryOnlyModel = {
  "default": {
    "memoryTresholdPercent": 50
  }
};

var ioOnlyModel = {
  "default": {
    "upperResponseTimeTresholdSeconds": 2,
    "lowerResponseTimeTresholdSeconds": 1
  }
};

var cpuAndMemoryModel = {
  "default": {
    "memoryTresholdPercent": 50,
    "cpuTresholdPercent": 50
  }
};

var cpuMemoryAndIoModel = {
  "default": {
    "memoryTresholdPercent": 50,
    "cpuTresholdPercent": 50,
    "upperResponseTimeTresholdSeconds": 2,
    "lowerResponseTimeTresholdSeconds": 1
  }
};

// var cpuOnlyModel = {
//   "default": {
//     "cpuTresholdPercent": 50, // percent of cpu limit applied
//     "memoryTresholdPercent": 50, // percent of memoryTresholdPercent limit applied
//     "upperResponseTimeTresholdSeconds": 2,
//     "lowerResponseTimeTresholdSeconds": 1,
//     "metricsAnalysisLevel": "high", // Should we spin down mulitple pods and how often should we check for changes
//   }
// }
