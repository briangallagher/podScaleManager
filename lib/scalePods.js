var request = require('request');
var exec = require('exec');

exports.scale = function (numPods) {

  var cmd = 'kubectl scale deployment nodeloadtest --replicas=' + numPods;

  exec(cmd, function (err, out, code) {
    if (err instanceof Error)
      throw err;
    process.stderr.write(err);
    process.stdout.write(out);
    // process.exit(code);
  });
};
