(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './can-patch-native-accessors', './element', './node'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./can-patch-native-accessors'), require('./element'), require('./node'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.canPatchNativeAccessors, global.element, global.node);
    global.patchNative = mod.exports;
  }
})(this, function (module, exports, _canPatchNativeAccessors, _element, _node) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (members) {
    var prefix = arguments.length <= 1 || arguments[1] === undefined ? '__' : arguments[1];

    var methods = Object.keys(members).filter(function (name) {
      return typeof members[name].value === 'function';
    });
    var properties = Object.keys(members).filter(function (name) {
      return typeof members[name].value !== 'function';
    });

    // Everything should be configurable.
    for (var name in members) {
      members[name].configurable = true;
    }

    methods.forEach(function (name) {
      var proto = getNativeProto(name);
      html[prefix + name] = proto[name];
      html[name] = members[name].value;
    });

    if (_canPatchNativeAccessors2.default) {
      properties.forEach(function (name) {
        var proto = getNativeProto(name);
        var nativeDescriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (nativeDescriptor) {
          Object.defineProperty(html, prefix + name, nativeDescriptor);
        }
        Object.defineProperty(html, name, members[name]);
      });
    } else {
      return function (instance) {
        properties.forEach(function (name) {
          Object.defineProperty(instance, name, members[name]);
        });
      };
    }

    return function () {};
  };

  var _canPatchNativeAccessors2 = _interopRequireDefault(_canPatchNativeAccessors);

  var _element2 = _interopRequireDefault(_element);

  var _node2 = _interopRequireDefault(_node);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var html = HTMLElement.prototype;

  function getNativeProto(name) {
    return _node2.default.hasOwnProperty(name) ? _node2.default : _element2.default;
  }

  module.exports = exports['default'];
});