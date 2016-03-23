(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './shadow/polyfill', './render', './version'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./shadow/polyfill'), require('./render'), require('./version'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.polyfill, global.render, global.version);
    global.index = mod.exports;
  }
})(this, function (exports, _polyfill, _render, _version) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.version = exports.render = undefined;

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _render2 = _interopRequireDefault(_render);

  var _version2 = _interopRequireDefault(_version);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Element.prototype.attachShadow = function (opts) {
    return (0, _polyfill2.default)(this, opts);
  };

  exports.default = _polyfill2.default;
  exports.render = _render2.default;
  exports.version = _version2.default;
});