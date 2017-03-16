var scalePods = require('./scalePods');
var exec = require('exec');
var dataModel = require('./dataModel');

// TODO: we can extend this to get directly from Kubernetes
var cpuAllocationMilliCores = 300;
var memoryAllocationMB = 200;
var blocked = false;
var stepCount = 3;

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

  console.log('*** STEP 2: Check if scaling possible: *** \n');
  if (blocked) {
    console.log('Scaling is currently active, analysis is futile');
    console.log('\n');
    return;
  } else {
    console.log('Scaling is not currently active, analysis can proceed');
    console.log('\n');
  }

  var currentCPUAllPods = Number(data[0]);
  var currentMemoryAllPods = Number(data[1]);
  var currentPods = Number(data[2]);
  var currentResponseTime = Number(data[3]);

  var cpuPodScale = null;
  var memoryPodScale = null;
  var ioPodScale = null;
  var model;

  console.log('*** STEP 3: Retrieve Scaling Rules Data Model: *** \n');
  getModel(function (model) {
    console.log('Scaling Data Model');
    console.log(JSON.stringify(model, null, 2));
    console.log('\n');

    if (model.cpuTresholdPercent) {
      stepCount++;
      console.log('*** STEP %s: Analyse CPU usage in cluster: *** \n', stepCount);
      cpuPodScale = checkCPUStatus(currentCPUAllPods, currentPods, getCPUThreshold(model.cpuTresholdPercent));
      console.log('\n');
    }
    if (model.memoryTresholdPercent) {
      stepCount++;
      console.log('*** STEP %s: Analyse Memory usage in cluster: *** \n', stepCount);
      memoryPodScale = checkMemoryStatus(currentMemoryAllPods, currentPods, getMemoryThreshold(model.memoryTresholdPercent));
      console.log('\n');
    }
    if (model.upperResponseTimeTresholdSeconds) {
      stepCount++;
      console.log('*** STEP %s: Analyse IO response times in cluster: *** \n', stepCount);
      ioPodScale = checkIOStatus(currentResponseTime, currentPods, model.upperResponseTimeTresholdSeconds, model.lowerResponseTimeTresholdSeconds);
      console.log('\n');
    }

    // First check if we need to spin up pods
    // If not check if we need to spin down
    stepCount++;
    console.log('*** STEP %s: Aggregate scale requirements *** \n', stepCount);
    console.log('Current Active Pods: ' + currentPods);

    var array = [cpuPodScale, memoryPodScale, ioPodScale];
    var total;
    var max = Math.max.apply(Math, array);
    var min = Math.min.apply(Math, array);

    if (max > 0) {

      total = currentPods + max;

      console.log('Extra Pods Required: ' + max);
      console.log('Requesting new Total Pods: ' + max);

      spinUp(total);

    } else if (min < 0) {
      if (min < 0) {
        total = currentPods + min;

        console.log('Reduction in Pods Required: ' + max);
        console.log('Requesting new Total Pods: ' + max);

        spinDown(total);
      }
    } else {
      console.log('Pods are at optimal level, no scaling up or down required');
    }
    console.log('\n');

  });
};

function checkCPUStatus(currentCPUAllPods, currentNumPods, cpuThresholdMilliCores) {

  // if (blocked) {
  //   console.log('Currently block from sclaing up or down, returning from checkCPUStatus');
  //   return;
  // }

  var diff, pods, newTotalPods, totalThreshold;
  totalThreshold = (cpuThresholdMilliCores * currentNumPods);

  console.log('Current number of pods %s', currentNumPods);
  console.log('Current treshold %s', cpuThresholdMilliCores);
  console.log('Current total treshold %s', totalThreshold);
  console.log('Current cpu usage across all pods %s \n', currentCPUAllPods);

  if (currentCPUAllPods > totalThreshold) {
    diff = currentCPUAllPods - totalThreshold;
    extraPods = Math.ceil(diff / cpuThresholdMilliCores);

    console.log('Current total CPU usage is greater than total threshold, extra %s pods required to meet CPU demand', extraPods);

    return extraPods;

  } else {

    diff = totalThreshold - currentCPUAllPods;
    if (diff <= cpuThresholdMilliCores) {
      console.log('Current total CPU usage is within threshold, no scaling adjustment required');
      return 0;
    } else {
      if (Number(currentNumPods) === 1) {
        console.log('Current total CPU usage is within threshold, no scaling adjustment required');
        return 0;
      } else {

        // minusPods = Math.floor(diff / cpuThresholdMilliCores);
        // newTotalPods = Number(currentNumPods) - pods;
        // console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentNumPods, diff, pods, newTotalPods);
        // spinDown(newTotalPods);

        // TODO: for now we can take the approach of spinning down 1 pod at a time as this is a more cautious approach
        // However this could be incorporated into the model

        console.log('Current total CPU usage is less than total threshold');
        console.log('Difference is greater than 1 pod threshold, cluster can scale down based on current CPU demand');

        return -1;
      }
    }
  }
}

function checkMemoryStatus(currentMemoryAllPods, currentNumPods, memoryThresholdMBs) {
  // if (blocked) {
  //   console.log('Currently block from sclaing up or down, returning from checkMemoryStatus');
  //   return;
  // }

  var diff, pods, newTotalPods, totalThreshold;
  totalThreshold = (memoryThresholdMBs * currentNumPods);

  console.log('Current number of pods %s', currentNumPods);
  console.log('Current treshold %s', memoryThresholdMBs);
  console.log('Current total treshold %s', totalThreshold);
  console.log('Current memory usage across all pods %s', currentMemoryAllPods);

  if (currentMemoryAllPods > totalThreshold) {
    diff = currentMemoryAllPods - totalThreshold;
    extraPods = Math.ceil(diff / memoryThresholdMBs);

    console.log('Current total Memory usage is greater than total threshold, extra %s pods required to meet Memory demand', extraPods);

    return extraPods;

  } else {

    diff = totalThreshold - currentMemoryAllPods;
    if (diff <= memoryThresholdMBs) {
      console.log('Current total Memory usage is within threshold, no scaling adjustment required');
      return 0;
    } else {

      if (Number(currentNumPods) === 1) {
        console.log('Current total Memory usage is within threshold, no scaling adjustment required');
        return 0;
      } else {

        // minusPods = Math.floor(diff / memoryThresholdMBs);
        // newTotalPods = Number(currentNumPods) - pods;
        // console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentNumPods, diff, pods, newTotalPods);
        // spinDown(newTotalPods);

        // TODO: for now we can take the approach of spinning down 1 pod at a time as this is a more cautious approach
        // However this could be incorporated into the model
        console.log('Current total Memory usage is less than total threshold');
        console.log('Difference is greater than 1 pod threshold, cluster can scale down based on current Memory demand');
        return -1;
      }
    }
  }
}

function checkIOStatus(currentResponseTime, currentPods, upperTreshold, lowerTreshold) {
  // if (blocked) {
  //   console.log('currently block from sclaing up or down, returning from checkIOStatus');
  //   return;
  // }

  var diff, pods, newTotalPods;

  console.log('Current number of pods %s', currentPods);
  console.log('Current upper response time treshold %s', upperTreshold);
  console.log('Current lower response time treshold %s', lowerTreshold);
  console.log('Current average response time across all pods %s', currentResponseTime);

  if (currentResponseTime > upperTreshold) {
    // newTotalPods = Number(currentPods) + 1;

    // diff = currentResponseTime - upperTreshold;
    // console.log('Current pods: %s, %s over treshold, adding pod, new total pods %s', currentPods, diff, newTotalPods);

    // spinUp(newTotalPods);

    console.log('Current average response time is greater than upper threshold, extra pod required to meet demand');

    return 1;

  } else {

    if (currentResponseTime < lowerTreshold && Number(currentPods) > 1) {

      // newTotalPods = Number(currentPods) - 1;

      // console.log('Current pods: %s, %s under treshold, spinning down %s pods, new total pods %s', currentPods, diff, pods, newTotalPods);

      // spinDown(newTotalPods);

      console.log('Current average response time is less than lower treshold, cluster can scale down');
      return -1;
    } else {
      console.log('Current response time is within threshold, no scaling adjustment required');
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
  }, 20000);
}
