var scalePods = require('./scalePods');
var exec = require('exec');

var cpuMilliCoreLimit = 200;
var memoryLimit = 200;
var blocked = false;

exports.go = function (data) {
  var currentCPU = data[0];
  var currentMemory = data[1];
  var currentPods = data[2];

  // NOTE: these need to be in order, can not apply both.
  // The model should drive this

  checkCPUStatus(currentCPUAllPods, currentPods);
  checkMemoryStatus(currentMemoryAllPods, currentPods);
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
    if (diff < cpuMilliCoreLimit) {
      console.log('diff is less than limit so not doing anything');
    } else {

      pods = Math.floor(diff / cpuMilliCoreLimit);
      newTotalPods = Number(currentPods) - pods;

      console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

      spinDown(newTotalPods);
    }
  }
}

function checkMemoryStatus() {
  if (blocked) {
    console.log('currently block from sclaing up or down, returning');
    return;
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
  }, 60000);
}
