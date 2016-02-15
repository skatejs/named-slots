(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './polyfill', './polyfilled', './render', './slot', './version'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./polyfill'), require('./polyfilled'), require('./render'), require('./slot'), require('./version'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.polyfill, global.polyfilled, global.render, global.slot, global.version);
    global.index = mod.exports;
  }
})(this, function (exports, module, _polyfill, _polyfilled, _render, _slot, _version) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _polyfilled2 = _interopRequireDefault(_polyfilled);

  var _render2 = _interopRequireDefault(_render);

  var _slot2 = _interopRequireDefault(_slot);

  var _version2 = _interopRequireDefault(_version);

  module.exports = {
    polyfill: _polyfill2['default'],
    polyfilled: _polyfilled2['default'],
    render: _render2['default'],
    slot: _slot2['default'],
    version: _version2['default']
  };
});