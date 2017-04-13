var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var metricsCapture = require('./metricsCapture');

function runRoute(responseTimeGauge) {
  var route = new express.Router();
  route.use(cors());
  route.use(bodyParser());

  // GET REST endpoint - query params may or may not be populated
  route.get('/start', function (req, res) {
    metricsCapture.start();
    res.status(200).send();
  });

  // GET REST endpoint - query params may or may not be populated
  route.get('/stop', function (req, res) {
    metricsCapture.stop();
    res.status(200).send();
  });

  return route;
}

module.exports = runRoute;
