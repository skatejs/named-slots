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
    global.getPropertyDescriptor = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (obj, key) {
    if (hasLookupFunctions) {
      if (obj instanceof Node) {
        obj = div;
      }

      var getter = obj.__lookupGetter__(key);
      var setter = obj.__lookupSetter__(key);
      var _descriptor = {
        configurable: true,
        enumerable: true
      };

      if (getter) {
        _descriptor.get = getter;
        _descriptor.set = setter;
        return _descriptor;
      } else if (typeof obj[key] === 'function') {
        _descriptor.value = obj[key];
        return _descriptor;
      }
    }

    var descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor && descriptor.get) {
      return descriptor;
    }
  };

  var div = document.createElement('div');
  var hasLookupFunctions = !!div.__lookupGetter__;
  module.exports = exports['default'];
});