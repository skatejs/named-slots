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
    global.getCommentNodeOuterHtml = mod.exports;
  }
})(this, function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getCommentNodeOuterHtml;

  function getCommentNodeOuterHtml(commentNode) {
    return "<!--" + commentNode.textContent + "-->";
  }

  module.exports = exports['default'];
});