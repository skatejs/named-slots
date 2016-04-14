(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.each = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.eachChildNode = eachChildNode;
  exports.eachNodeOrFragmentNodes = eachNodeOrFragmentNodes;
  function eachChildNode(node, func) {
    if (!node) {
      return;
    }

    var chs = node.childNodes;
    var chsLen = chs.length;
    for (var a = 0; a < chsLen; a++) {
      var ret = func(chs[a], a, chs);
      if (typeof ret !== 'undefined') {
        return ret;
      }
    }
  }

  function eachNodeOrFragmentNodes(node, func) {
    if (node instanceof DocumentFragment) {
      var chs = node.childNodes;
      var chsLen = chs.length;
      for (var a = 0; a < chsLen; a++) {
        func(chs[a], a);
      }
    } else {
      func(node, 0);
    }
  }
});