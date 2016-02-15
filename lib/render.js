(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './polyfill', './internal/map/patch'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./polyfill'), require('./internal/map/patch'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.polyfill, global.mapPatch);
    global.render = mod.exports;
  }
})(this, function (exports, module, _polyfill, _internalMapPatch) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _mapPatch = _interopRequireDefault(_internalMapPatch);

  // Simple renderer that proxies another renderer. It will polyfill if not yet
  // polyfilled, or simply run the renderer. Initial content is taken into
  // consideration.

  module.exports = function (fn) {
    return function (elem) {
      if (_mapPatch['default'].get(elem)) {
        fn(elem);
      } else {
        fn(elem);
        (0, _polyfill2['default'])(elem);
      }
    };
  };
});