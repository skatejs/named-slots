(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './internal/map-polyfilled'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./internal/map-polyfilled'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.mapPolyfilled);
    global.polyfilled = mod.exports;
  }
})(this, function (module, exports, _mapPolyfilled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (elem) {
    return _mapPolyfilled2.default.get(elem);
  };

  var _mapPolyfilled2 = _interopRequireDefault(_mapPolyfilled);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  module.exports = exports['default'];
});