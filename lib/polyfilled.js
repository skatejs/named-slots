(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './internal/map/patch'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./internal/map/patch'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.patch);
    global.polyfilled = mod.exports;
  }
})(this, function (exports, _patch) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (elem) {
    return _patch2.default.get(elem);
  };

  var _patch2 = _interopRequireDefault(_patch);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }
});