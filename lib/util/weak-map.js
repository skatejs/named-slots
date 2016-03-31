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
        if (obj) {
          delete obj[this.key];
        }
      },
      get: function get(obj) {
        return obj ? obj[this.key] : null;
      },
      has: function has(obj) {
        return obj ? typeof obj[this.key] !== 'undefined' : false;
      },
      set: function set(obj, val) {
        if (obj) {
          var key = this.key;
          if (typeof obj[key] === 'undefined') {
            Object.defineProperty(obj, key, {
              configurable: true,
              enumerable: false,
              value: val
            });
          } else {
            obj[key] = val;
          }
        }
      }
    };
    return Wm;
  }();

  module.exports = exports['default'];
});