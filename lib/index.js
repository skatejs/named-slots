(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './polyfill', './polyfilled', './render', './version'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./polyfill'), require('./polyfilled'), require('./render'), require('./version'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.polyfill, global.polyfilled, global.render, global.version);
    global.index = mod.exports;
  }
})(this, function (exports, _polyfill, _polyfilled, _render, _version) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.version = exports.render = exports.polyfilled = undefined;

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _polyfilled2 = _interopRequireDefault(_polyfilled);

  var _render2 = _interopRequireDefault(_render);

  var _version2 = _interopRequireDefault(_version);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = _polyfill2.default;
  exports.polyfilled = _polyfilled2.default;
  exports.render = _render2.default;
  exports.version = _version2.default;
});