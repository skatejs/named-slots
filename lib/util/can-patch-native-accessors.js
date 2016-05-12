(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './get-property-descriptor'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./get-property-descriptor'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.getPropertyDescriptor);
    global.canPatchNativeAccessors = mod.exports;
  }
})(this, function (module, exports, _getPropertyDescriptor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _getPropertyDescriptor2 = _interopRequireDefault(_getPropertyDescriptor);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var nativeParentNode = (0, _getPropertyDescriptor2.default)(Element.prototype, 'innerHTML'); // Any code referring to this is because it has to work around this bug in
  // WebKit: https://bugs.webkit.org/show_bug.cgi?id=49739

  exports.default = !!nativeParentNode;
  module.exports = exports['default'];
});