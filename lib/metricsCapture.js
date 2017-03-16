var async = require('async');
var request = require('request');
var metricsAnalyser = require('./metricsAnalyser');

exports.startMonitoring = function () {
  setInterval(function () {
    getMetrics(function (data) {
      analyiseMetrics(data);
      console.log('\n');
      console.log('************* Finished Metrics Capture and Analysis *************');
    });
  }, 7000);
};

function getMetrics(cb) {

  console.log('\n');
  console.log('************************************************************************************');
  console.log('************************************************************************************');
  console.log('************************************************************************************');
  console.log('\n');
  console.log('************* Starting Metrics Capture and Analysis *************');
  console.log('\n');

  async.parallel([getCPU, getMemory, getPods, getResponseTime], function (err, res) {
    // console.log('back from all calls');

    console.log('*** STEP 1: Capture Cluster Metrics: *** \n');
    console.log('Total CPU in millicores across all pods: ' + res[0]);
    console.log('Total Memory in MBs across all pods: ' + res[1]);
    console.log('Total Number of Active Pods: ' + res[2]);
    console.log('Average Response Time for http requests: ' + res[3]);
    console.log('\n');

    cb(res);
  });
}

function analyiseMetrics(data) {
  metricsAnalyser.go(data);
}

function getCPU(callback) {
  // This is the Prometheus Endpoint
  request.get({
      url: 'http://192.168.99.100:31049/api/v1/query?query=stats_parser_cpu_usage_milli_cores'
    },
    function (err, httpResponse, body) {
      // console.log('back from cpu call');

      if (err) {
        console.error('ERROR getCPU() :::: ' + JSON.stringify(err));
      }

      // console.log('body:::');
      // console.log(body);

      try {
        body = JSON.parse(body);
      } catch (e) {
        console.log('Error parsing cpu body');
        return callback(null, -1);
      }

      if (body && body.data && body.data.result && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for cpu, returning -1');
        callback(null, -1);
      }
    });
}

function getMemory(callback) {

  // This is the Prometheus Endpoint
  request.get({
      url: 'http://192.168.99.100:31049/api/v1/query?query=stats_parser_memory_usage_bytes'
    },
    function (err, httpResponse, body) {
      // console.log('back from memory call');

      if (err) {
        console.error('ERROR getMemory() :::: ' + JSON.stringify(err));
      }

      try {
        body = JSON.parse(body);
      } catch (e) {
        console.log('Error parsing memory body');
        return callback(null, -1);
      }

      if (body && body.data && body.data.result && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for memory, returning -1');
        callback(null, -1);
      }
    });
}

function getPods(callback) {
  // This is the Prometheus Endpoint
  request.get({
      url: 'http://192.168.99.100:31049/api/v1/query?query=stats_parser_num_active_pods'
    },
    function (err, httpResponse, body) {
      // console.log('back from num pods call');

      if (err) {
        console.error('ERROR getPods() :::: ' + JSON.stringify(err));
      }

      try {
        body = JSON.parse(body);
      } catch (e) {
        console.log('Error parsing pods');
        return callback(null, -1);
      }

      if (body && body.data && body.data.result && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for num pods, returning -1');
        callback(null, -1);
      }
    });
}

function getResponseTime(callback) {
  // This is the Prometheus Endpoint
  request.get({
      url: 'http://192.168.99.100:31049/api/v1/query?query=response_time'
    },
    function (err, httpResponse, body) {
      // console.log('back from num pods call');

      if (err) {
        console.error('ERROR getResponseTime() :::: ' + JSON.stringify(err));
      }

      try {
        body = JSON.parse(body);
      } catch (e) {
        console.log('Error parsing getResponseTime');
        return callback(null, -1);
      }

      if (body && body.data && body.data.result && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for responseTime, returning -1');
        callback(null, -1);
      }
    });
}

exports.startMonitoring();
