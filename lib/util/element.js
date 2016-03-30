(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.element = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var proto = Element.prototype;
  exports.default = proto;
  var addEventListener = proto.addEventListener;
  var removeEventListener = proto.removeEventListener;
  exports.addEventListener = addEventListener;
  exports.removeEventListener = removeEventListener;
});