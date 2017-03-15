var scalePods = require('./scalePods');
var exec = require('exec');
var dataModel = require('./dataModel');

// TODO: we can extend this to get directly from Kubernetes
var cpuAllocationMilliCores = 300;
var memoryAllocationMB = 200;
var blocked = false;

// // psedo code
// // get model

// if cpu exists then cpuRelevant
// if memory exists then memoryRelevant
// if upperResponseTimeTresholdSeconds and lowerResponseTimeTresholdSeconds then ioRelevant

// cpu
// 200 and 100

// memory
// 200 and 100

// TODO: nice diagram to demostrate this
// Scale up if ANY item requires item
//   // example if CPU at 90% but memory low and io fast => still need to scale up

// Scale down if ALL items are eligible
//   // example if CPU at 90% but memory low and io fast => still need to scale up

// // Scale up by multiple pods at a time
// // But scale down by a single pod => more cautious

function getModel(cb) {
  dataModel.getModel(function (err, model) {
    if (err) {
      console.error('Error getting model');
    } else {
      // TODO: at this point we are just getting the default model but we
      // need to extend this to include overrides in the model
      cb(model.default);
    }
  });
}

function getCPUThreshold(percentThreshold) {
  return (cpuAllocationMilliCores / 100) * percentThreshold;
}

function getMemoryThreshold(percentThreshold) {
  return (memoryAllocationMB / 100) * percentThreshold;
}

exports.go = function (data) {
  var currentCPUAllPods = data[0];
  var currentMemoryAllPods = data[1];
  var currentPods = data[2];
  var currentResponseTime = data[3];

  var cpuPodScale = null;
  var memoryPodScale = null;
  var ioPodScale = null;
  var model;

  getModel(function (model) {
    if (model.cpuTresholdPercent) {
      cpuPodScale = checkCPUStatus(currentCPUAllPods, currentPods, getCPUThreshold(model.cpuTresholdPercent));
    }
    if (model.memoryTresholdPercent) {
      memoryPodScale = checkMemoryStatus(currentMemoryAllPods, currentPods, getMemoryThreshold(model.memoryTresholdPercent));
    }
    if (model.upperResponseTimeTresholdSeconds) {
      ioPodScale = checkIOStatus(currentResponseTime, currentPods, model.upperResponseTimeTresholdSeconds, model.lowerResponseTimeTresholdSeconds);
    }

    // First check if we need to spin up pods
    // If not check if we need to spin down
    var array = [cpuPodScale, memoryPodScale, ioPodScale];
    var largest = Math.max.apply(Math, array);
    if (largest > 0) {
      spinUp(currentPods + largest);
    } else {
      var min = Math.min.apply(Math, array);
      if (min < 0) {
        spinDown(currentPods + min);
      }
    }

  });
};

function checkCPUStatus(currentCPUAllPods, currentNumPods, cpuThresholdMilliCores) {

  if (blocked) {
    console.log('Currently block from sclaing up or down, returning from checkCPUStatus');
    return;
  }

  var diff, pods, newTotalPods, totalThreshold;
  totalThreshold = (cpuThresholdMilliCores * currentNumPods);

  console.log('Current number of pods %s', currentNumPods);
  console.log('Current treshold %s', cpuThresholdMilliCores);
  console.log('Current total treshold %s', totalThreshold);
  console.log('Current cpu usage across all pods %s', currentCPUAllPods);

  if (currentCPUAllPods > totalThreshold) {
    diff = currentCPUAllPods - totalThreshold;
    extraPods = Math.ceil(diff / cpuThresholdMilliCores);

    console.log('Current pods: %s, %s over treshold, adding %s pods', currentNumPods, diff, extraPods);

    return extraPods;

  } else {

    diff = totalThreshold - currentCPUAllPods;
    if (diff <= cpuThresholdMilliCores) {
      console.log('diff for cpu is less than or equal limit so not doing anything');
      return 0;
    } else {

      if (Number(currentNumPods) === 1) {
        console.log('Only 1 pod running so no change required based on CPU check');
        return 0;
      } else {

        // minusPods = Math.floor(diff / cpuThresholdMilliCores);
        // newTotalPods = Number(currentNumPods) - pods;
        // console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentNumPods, diff, pods, newTotalPods);
        // spinDown(newTotalPods);

        // TODO: for now we can take the approach of spinning down 1 pod at a time as this is a more cautious approach
        // However this could be incorporated into the model
        return -1;
      }
    }
  }
}

function checkMemoryStatus(currentMemoryAllPods, currentNumPods, memoryThresholdMBs) {
  if (blocked) {
    console.log('Currently block from sclaing up or down, returning from checkMemoryStatus');
    return;
  }

  var diff, pods, newTotalPods, totalThreshold;
  totalThreshold = (memoryThresholdMBs * currentNumPods);

  console.log('Current number of pods %s', currentNumPods);
  console.log('Current treshold %s', memoryThresholdMBs);
  console.log('Current total treshold %s', totalThreshold);
  console.log('Current memory usage across all pods %s', currentMemoryAllPods);

  if (currentMemoryAllPods > totalThreshold) {
    diff = currentMemoryAllPods - totalThreshold;
    extraPods = Math.ceil(diff / memoryThresholdMBs);

    console.log('Current pods: %s, %s over treshold, adding %s pods', currentNumPods, diff, extraPods);

    return extraPods;

  } else {

    diff = totalThreshold - currentMemoryAllPods;
    if (diff <= memoryThresholdMBs) {
      console.log('diff for memory is less than or equal limit so not doing anything');
      return 0;
    } else {

      if (Number(currentNumPods) === 1) {
        console.log('Only 1 pod running so no change required based on Memory check');
        return 0;
      } else {

        // minusPods = Math.floor(diff / memoryThresholdMBs);
        // newTotalPods = Number(currentNumPods) - pods;
        // console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentNumPods, diff, pods, newTotalPods);
        // spinDown(newTotalPods);

        // TODO: for now we can take the approach of spinning down 1 pod at a time as this is a more cautious approach
        // However this could be incorporated into the model
        return -1;
      }
    }
  }
}

function checkIOStatus(currentResponseTime, currentPods, upperTreshold, lowerTreshold) {
  if (blocked) {
    console.log('currently block from sclaing up or down, returning');
    return;
  }

  var diff, pods, newTotalPods;

  console.log('Checking IO Status');
  console.log('Current number of pods %s', currentPods);
  console.log('Current upper treshold %s', upperTreshold);
  console.log('Current lower treshold %s', lowerTreshold);
  console.log('Current average response time across all pods %s', currentResponseTime);

  if (currentResponseTime > upperTreshold) {
    // newTotalPods = Number(currentPods) + 1;

    // diff = currentResponseTime - upperTreshold;
    // console.log('Current pods: %s, %s over treshold, adding pod, new total pods %s', currentPods, diff, newTotalPods);

    // spinUp(newTotalPods);

    return 1;

  } else {

    if (currentResponseTime < lowerTreshold && Number(currentPods) > 1) {

      // newTotalPods = Number(currentPods) - 1;

      // console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

      // spinDown(newTotalPods);

      return -1;
    } else {
      console.log('No action required, inside tresholds');
      return 0;
    }
  }
}

function spinDown(numPods) {
  block();
  console.log('Spinning down to %s numPods', numPods);
  scalePods.scale(numPods);
}

function spinUp(numPods) {
  block();
  console.log('Spinning up to %s numPods', numPods);
  scalePods.scale(numPods);
}

function unblock() {
  blocked = false;
}

function block() {
  blocked = true;
  setTimeout(function () {
    unblock();
    // TODO: need to think about how to time these things
  }, 25000);
}
