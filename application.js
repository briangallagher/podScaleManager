var metricsCapture = require('./lib/metricsCapture');
var mbaasApi = require('fh-mbaas-api');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var express = require('express');

// list the endpoints which you want to make securable here
var securableEndpoints;
securableEndpoints = [];

var app = express();

// Enable CORS for all requests
app.use(cors());

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

app.use('/', require('./lib/route.js')());

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
process.env.FH_USE_LOCAL_DB = true;

app.listen(3000, host, function () {
  console.log("App started at: " + new Date() + " on port: " + port);

  // runner.start(function () {
  //   console.log('done!');
  // });

});
