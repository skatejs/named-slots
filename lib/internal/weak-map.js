(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.weakMap = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = window.WeakMap || function () {
    var index = 0;
    function Wm() {
      this.key = '____weak_map_' + index++;
    }
    Wm.prototype = {
      delete: function _delete(obj) {
        delete obj[this.key];
      },
      get: function get(obj) {
        return obj[this.key];
      },
      has: function has(obj) {
        return typeof obj[this.key] !== 'undefined';
      },
      set: function set(obj, val) {
        return obj[this.key] = val;
      }
    };
    return Wm;
  }();

  module.exports = exports['default'];
});