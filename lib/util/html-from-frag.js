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
    global.htmlFromFrag = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (frag) {
    var html = '';
    var chs = frag.childNodes;
    var chsLen = chs.length;
    for (var a = 0; a < chsLen; a++) {
      html += chs[a].outerHTML;
    }
    return html;
  };

  module.exports = exports['default'];
});