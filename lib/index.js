(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './shadow/polyfill', './version'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./shadow/polyfill'), require('./version'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.polyfill, global.version);
    global.index = mod.exports;
  }
})(this, function (exports, _polyfill, _version) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.version = undefined;

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _version2 = _interopRequireDefault(_version);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = _polyfill2.default;
  exports.version = _version2.default;
});