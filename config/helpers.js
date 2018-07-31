var path = require('path');

const EVENT = process.env.npm_lifecycle_event || '';

// Helper functions
var ROOT = path.resolve(__dirname, '..');

function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

function hasNpmFlag(flag) {
  return EVENT.includes(flag);
}

function isWebpackDevServer() {
  return process.argv[1] && !!(/webpack-dev-server/.exec(process.argv[1]));
}

function getProfile() {
  let profile = 'development';
  const argvs = process.argv.splice(2);
  if (argvs.filter((e) => {
      return /^--env\.profile/.test(e);
    }).length) {
    // get argument --env.profile value
    profile = argvs.filter((e) => {
      return /^--env\.profile/.test(e);
    })[0].split('=')[1];
  }

  return profile;
}

var root = path.join.bind(path, ROOT);

exports.hasProcessFlag = hasProcessFlag;
exports.hasNpmFlag = hasNpmFlag;
exports.isWebpackDevServer = isWebpackDevServer;
exports.root = root;
exports.getProfile = getProfile;
