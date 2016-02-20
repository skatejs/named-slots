(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './internal/map/patch'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./internal/map/patch'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.mapPatch);
    global.polyfilled = mod.exports;
  }
})(this, function (exports, module, _internalMapPatch) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _mapPatch = _interopRequireDefault(_internalMapPatch);

  // Returns whether or not the specified element has been polyfilled.

  module.exports = function (elem) {
    return _mapPatch['default'].get(elem);
  };
});