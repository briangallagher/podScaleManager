var model = {
  "default": {
    "cpuTresholdPercent": 50, // percent of cpu limit applied
    "memoryTresholdPercent": 50, // percent of memoryTresholdPercent limit applied
    "upperResponseTimeTresholdSeconds": 2,
    "lowerResponseTimeTresholdSeconds": 1,
    "metricsAnalysisLevel": "high", // Should we spin down mulitple pods and how often should we check for changes
  },
  "overrides": [{
    "days": ["Mon", "Tues"],
    "timeFrom": "18:00",
    "timeTo": "23:59",
    "cpuTresholdPercent": 80,
    "memoryTresholdPercent": 500, // percent or max
    "upperResponseTimeTresholdSeconds": 10,
    "lowerResponseTimeTresholdSeconds": 5,
  }, {
    "days": ["Mon", "Tues"],
    "timeFrom": "00:00",
    "timeTo": "06:59",
    "cpuTresholdPercent": 80,
    "memoryTresholdPercent": 500, // percent or max
    "upperResponseTimeTresholdSeconds": 10,
    "lowerResponseTimeTresholdSeconds": 5,
  }]
};

exports.getModel = function (cb) {
  cb(null, model);
};
