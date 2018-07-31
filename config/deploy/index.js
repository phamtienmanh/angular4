module.exports = function (profileName) {
  return require('./' + profileName + '.js');
};
