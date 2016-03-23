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
    global.node = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var proto = Node.prototype;
  exports.default = proto;
  var appendChild = proto.appendChild;
  var insertBefore = proto.insertBefore;
  var removeChild = proto.removeChild;
  var replaceChild = proto.replaceChild;
  exports.appendChild = appendChild;
  exports.insertBefore = insertBefore;
  exports.removeChild = removeChild;
  exports.replaceChild = replaceChild;
});