var cpuMilliCoreLimit = 300;
var totalPodLimit = 6;
var async = require('async');
var request = require('request');
var metricsAnalyser = require('./metricsAnalyser');

exports.startMonitoring = function () {
  setInterval(function () {
    getMetrics(analyiseMetrics);
  }, 5000);
};

function getMetrics(cb) {
  async.parallel([getCPU, getMemory, getPods], function (err, res) {
    // console.log('back from all calls');
    console.log(JSON.stringify(res));
    cb(res);
  });
}

function analyiseMetrics(data) {
  console.log('Start analyse metrics');
  // metricsAnalyser.go(data);
}

function getCPU(callback) {
  request.get({
      url: 'http://192.168.99.100:30747/api/v1/query?query=stats_parser_cpu_usage_milli_cores'
    },
    function (err, httpResponse, body) {
      // console.log('back from cpu call');

      if (err) {
        console.error('ERROR getCPU() :::: ' + JSON.stringify(err));
      }

      console.log(body);

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
      url: 'http://192.168.99.100:30747/api/v1/query?query=stats_parser_memory_usage_bytes'
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
  request.get({
      url: 'http://192.168.99.100:30747/api/v1/query?query=stats_parser_num_active_pods'
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

exports.startMonitoring();
