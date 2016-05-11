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
    global.getEscapedTextContent = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = getEscapedTextContent;
  /**
   * See https://w3c.github.io/DOM-Parsing/#serializing
   * @param {TextNode}
   * @returns {string}
   */
  function getEscapedTextContent(textNode) {
    return textNode.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  module.exports = exports['default'];
});