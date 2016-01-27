(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './polyfill', './internal/map/patch'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./polyfill'), require('./internal/map/patch'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.polyfill, global.patch);
    global.render = mod.exports;
  }
})(this, function (module, exports, _polyfill, _patch) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (fn) {
    return function (elem) {
      if (_patch2.default.get(elem)) {
        fn(elem);
      } else {
        fn(elem);
        (0, _polyfill2.default)(elem);
      }
    };
  };

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _patch2 = _interopRequireDefault(_patch);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  module.exports = exports['default'];
});