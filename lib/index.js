(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './polyfill', './polyfilled', './render', './slot'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./polyfill'), require('./polyfilled'), require('./render'), require('./slot'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.polyfill, global.polyfilled, global.render, global.slot);
    global.index = mod.exports;
  }
})(this, function (exports, _polyfill, _polyfilled, _render, _slot) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _polyfilled2 = _interopRequireDefault(_polyfilled);

  var _render2 = _interopRequireDefault(_render);

  var _slot2 = _interopRequireDefault(_slot);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = {
    polyfill: _polyfill2.default,
    polyfilled: _polyfilled2.default,
    render: _render2.default,
    slot: _slot2.default
  };
});