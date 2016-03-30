(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', '../util/weak-map'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('../util/weak-map'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.weakMap);
    global.data = mod.exports;
  }
})(this, function (exports, _weakMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.polyfilled = exports.fallbackState = exports.fallbackNodes = exports.debouncedTriggerSlotChangeEvent = exports.changeListeners = exports.assignedNodes = undefined;

  var _weakMap2 = _interopRequireDefault(_weakMap);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var assignedNodes = exports.assignedNodes = new _weakMap2.default();
  var changeListeners = exports.changeListeners = new _weakMap2.default();
  var debouncedTriggerSlotChangeEvent = exports.debouncedTriggerSlotChangeEvent = new _weakMap2.default();
  var fallbackNodes = exports.fallbackNodes = new _weakMap2.default();
  var fallbackState = exports.fallbackState = new _weakMap2.default();
  var polyfilled = exports.polyfilled = new _weakMap2.default();
});