module.exports = function (profileName) {
  var prefix = 'VARS';
  prefix = prefix + '.';
  var vars = require('./' + profileName + '.js');
  var config = {};
  // Turn to VARS.NAME
  Object.keys(vars).map(function (k) {
    config[prefix + k] = JSON.stringify(vars[k]);
  });
  return config;
};
