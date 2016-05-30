const base = require('skatejs-build/karma.conf');
module.exports = function (config) {
  base(config);
  config.browserNoActivityTimeout = 60000;
};
