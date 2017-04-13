var async = require('async');
var request = require('request');
var metricsAnalyser = require('./metricsAnalyser');

var monitor;

var prometheusPath = process.env.PROMETHUS_IP + ':' + process.env.PROMETHUS_PORT;

var startMonitoring = function () {
  console.log('Starting the monitoring of resources \n');
  monitor = setInterval(function () {
    getMetrics(function (data) {
      analyiseMetrics(data);
      console.log('************* Finished Metrics Capture and Analysis %s *************', new Date());
      console.log('\n');
      console.log('\n');
      console.log('\n');
    });
  }, 7000);
};

var stopMonitoring = function () {
  console.log('************************************************************************************');
  console.log('************************************************************************************');
  console.log('************************************************************************************');

  console.log('Stoping the monitoring of resources \n');
  clearInterval(monitor);

  console.log('************************************************************************************');
  console.log('************************************************************************************');
  console.log('************************************************************************************');
};

function getMetrics(cb) {

  console.log('\n');
  console.log('************************************************************************************');
  console.log('************************************************************************************');
  console.log('************************************************************************************');
  console.log('\n');
  console.log('************* Starting Metrics Capture and Analysis %s *************', new Date());
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
  var url = 'http://' + prometheusPath + '/api/v1/query?query=stats_parser_cpu_usage_milli_cores';
  // console.log('prometheusPath: ' + url);

  request.get({
      url: url
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

      if (body && body.data && body.data.result && Array.isArray(body.data.result) && body.data.result[0] && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for cpu, returning -1');
        callback(null, -1);
      }
    });
}

function getMemory(callback) {
  var url = 'http://' + prometheusPath + '/api/v1/query?query=stats_parser_memory_usage_bytes';

  // This is the Prometheus Endpoint
  request.get({
      url: url
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

      if (body && body.data && body.data.result && Array.isArray(body.data.result) && body.data.result[0] && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for memory, returning -1');
        callback(null, -1);
      }
    });
}

function getPods(callback) {
  var url = 'http://' + prometheusPath + '/api/v1/query?query=stats_parser_num_active_pods';

  // This is the Prometheus Endpoint
  request.get({
      url: url
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

      if (body && body.data && body.data.result && Array.isArray(body.data.result) && body.data.result[0] && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for num pods, returning -1');
        callback(null, -1);
      }
    });
}

function getResponseTime(callback) {
  var url = 'http://' + prometheusPath + '/api/v1/query?query=response_time';

  console.log(url);
  console.log(url);
  console.log(url);
  console.log(url);
  console.log(url);
  console.log(url);

  // This is the Prometheus Endpoint
  request.get({
      url: url
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

      if (body && body.data && body.data.result && Array.isArray(body.data.result) && body.data.result[0] && body.data.result[0].value) {
        callback(err, body.data.result[0].value[1]);
      } else {
        console.log('no value for responseTime, returning -1');
        callback(null, -1);
      }
    });
}

exports.start = startMonitoring;
exports.stop = stopMonitoring;
