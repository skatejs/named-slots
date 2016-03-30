(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module", "exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.each = mod.exports;
  }
})(this, function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (node, func) {
    if (node instanceof DocumentFragment) {
      var chs = node.childNodes;
      var chsLen = chs.length;
      for (var a = 0; a < chsLen; a++) {
        func(chs[a]);
      }
    } else {
      func(node);
    }
  };

  module.exports = exports['default'];
});