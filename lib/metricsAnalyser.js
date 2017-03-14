var scalePods = require('./scalePods');
var exec = require('exec');

var cpuMilliCoreLimit = 150;
var memoryLimitMB = 100;
var blocked = false;

exports.go = function (data, skipCPU, skipMemory, skipIO) {
  var currentCPUAllPods = data[0];
  var currentMemoryAllPods = data[1];
  var currentPods = data[2];
  var currentResponseTime = data[3];

  // NOTE: these need to be in order, can not apply both.
  // The model should drive this

  if (!skipCPU) {
    checkCPUStatus(currentCPUAllPods, currentPods);
  }
  if (!skipMemory) {
    checkMemoryStatus(currentMemoryAllPods, currentPods);
  }
  if (!skipIO) {
    checkIOStatus(currentResponseTime, currentPods);
  }
};

function checkCPUStatus(currentCPUAllPods, currentPods) {

  if (blocked) {
    console.log('currently block from sclaing up or down, returning');
    return;
  }

  var currentTreshold = cpuMilliCoreLimit * currentPods;
  var diff, pods, newTotalPods;

  console.log('Current number of pods %s', currentPods);
  console.log('Current treshold %s', currentTreshold);
  console.log('Current cpu usage across all pods %s', currentCPUAllPods);

  if (currentCPUAllPods > currentTreshold) {
    diff = currentCPUAllPods - currentTreshold;
    pods = Math.ceil(diff / cpuMilliCoreLimit);
    newTotalPods = Number(currentPods) + pods;

    console.log('Current pods: %s, %s over treshold, adding %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

    spinUp(newTotalPods);

  } else {

    diff = currentTreshold - currentCPUAllPods;
    if (diff <= cpuMilliCoreLimit) {
      console.log('diff is less than or equal limit so not doing anything');
    } else {

      if (Number(currentPods) === 1) {
        console.log('Only 1 pod running so no change required');
      } else {

        pods = Math.floor(diff / cpuMilliCoreLimit);
        newTotalPods = Number(currentPods) - pods;

        console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

        spinDown(newTotalPods);
      }
    }
  }
}

function checkMemoryStatus(currentMemoryAllPods, currentPods) {
  if (blocked) {
    console.log('currently block from sclaing up or down, returning');
    return;
  }

  var currentTreshold = memoryLimitMB * currentPods;
  var diff, pods, newTotalPods;

  console.log('Checking Memory Status');
  console.log('Current number of pods %s', currentPods);
  console.log('Current treshold %s', currentTreshold);
  console.log('Current memory usage across all pods in MB %s', currentMemoryAllPods);

  if (currentMemoryAllPods > currentTreshold) {
    diff = currentMemoryAllPods - currentTreshold;
    pods = Math.ceil(diff / memoryLimitMB);
    newTotalPods = Number(currentPods) + pods;

    console.log('Current pods: %s, %s over treshold, adding %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

    spinUp(newTotalPods);

  } else {

    diff = currentTreshold - currentMemoryAllPods;
    if (diff < memoryLimitMB) {
      console.log('diff is less than limit so not doing anything');
    } else {

      if (Number(currentPods) === 1) {
        console.log('Only 1 pod running so no change required');
      } else {

        pods = Math.floor(diff / memoryLimitMB);
        newTotalPods = Number(currentPods) - pods;

        console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

        spinDown(newTotalPods);
      }
    }
  }
}

function checkIOStatus(currentResponseTime, currentPods) {
  if (blocked) {
    console.log('currently block from sclaing up or down, returning');
    return;
  }

  var upperTreshold = 2;
  var lowerTreshold = 1;
  var diff, pods, newTotalPods;

  console.log('Checking IO Status');
  console.log('Current number of pods %s', currentPods);
  console.log('Current upper treshold %s', upperTreshold);
  console.log('Current lower treshold %s', lowerTreshold);
  console.log('Current average response time across all pods %s', currentResponseTime);

  if (currentResponseTime > upperTreshold) {
    newTotalPods = Number(currentPods) + 1;

    diff = currentResponseTime - upperTreshold;
    console.log('Current pods: %s, %s over treshold, adding pod, new total pods %s', currentPods, diff, newTotalPods);

    spinUp(newTotalPods);

  } else {

    if (currentResponseTime < lowerTreshold && Number(currentPods) > 1) {

      newTotalPods = Number(currentPods) - 1;

      console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

      spinDown(newTotalPods);
    } else {
      console.log('No action required, inside tresholds');
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
