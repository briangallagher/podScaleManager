var request = require('request');
var metricsCapture = require('./lib/metricsCapture');
var express = require('express');
var app = express();

metricsCapture.startMonitoring();

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
