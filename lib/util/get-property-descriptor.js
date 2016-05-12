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
    if (obj instanceof Node) {
      obj = div;
    }
    var proto = getPrototype(obj, key);

    if (proto) {
      var getter = proto.get;
      var setter = proto.set;
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

  function getPrototype(obj, key) {
    var descriptor = void 0;

    while (obj && !(descriptor = Object.getOwnPropertyDescriptor(obj, key))) {
      obj = Object.getPrototypeOf(obj);
    }
    return descriptor;
  }
  module.exports = exports['default'];
});