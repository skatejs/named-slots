(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './data', '../util/node', '../util/can-patch-native-accessors'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./data'), require('../util/node'), require('../util/can-patch-native-accessors'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.data, global.node, global.canPatchNativeAccessors);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _data, _node, _canPatchNativeAccessors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = polyfill;

  var _canPatchNativeAccessors2 = _interopRequireDefault(_canPatchNativeAccessors);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var configurable = true;
  var members = {
    assignedSlot: {
      configurable: configurable,
      get: function get() {
        return _data.assignedSlot.get(this) || null;
      }
    },
    parentElement: {
      configurable: configurable,
      get: function get() {
        if (_data.light.get(this)) {
          var parent = this.parentNode;
          return parent.nodeType === 1 ? parent : null;
        }

        return this.__parentElement;
      }
    },
    parentNode: {
      configurable: configurable,
      get: function get() {
        return _data.parentNode.get(this) || this.__parentNode || null;
      }
    },
    nextSibling: {
      configurable: configurable,
      get: function get() {
        if (_data.light.get(this)) {
          var parChs = this.parentNode.childNodes;
          var parChsLen = parChs.length;

          for (var a = 0; a < parChsLen; a++) {
            if (parChs[a] === this) {
              return parChs[a + 1] || null;
            }
          }
        }

        return this.__nextSibling;
      }
    },
    nextElementSibling: {
      configurable: configurable,
      get: function get() {
        if (_data.light.get(this)) {
          var parChs = this.parentNode.childNodes;
          var parChsLen = parChs.length;
          var found = false;

          for (var a = 0; a < parChsLen; a++) {
            if (!found && parChs[a] === this) {
              found = true;
            }

            if (!found) {
              continue;
            }

            var next = parChs[a + 1];

            if (next && next.nodeType === 1) {
              return next;
            } else {
              continue;
            }
          }
        }

        return this.__nextElementSibling;
      }
    },
    previousSibling: {
      configurable: configurable,
      get: function get() {
        if (_data.light.get(this)) {
          var parChs = this.parentNode.childNodes;
          var parChsLen = parChs.length;

          for (var a = parChsLen - 1; a >= 0; a--) {
            if (parChs[a] === this) {
              return parChs[a - 1] || null;
            }
          }
        }

        return this.__previousSibling;
      }
    },
    previousElementSibling: {
      configurable: configurable,
      get: function get() {
        if (_data.light.get(this)) {
          var parChs = this.parentNode.childNodes;
          var parChsLen = parChs.length;
          var found = false;

          for (var a = parChsLen - 1; a >= 0; a--) {
            if (!found && parChs[a] === this) {
              found = true;
            }

            if (!found) {
              continue;
            }

            var next = parChs[a - 1];

            if (next && next.nodeType === 1) {
              return next;
            } else {
              continue;
            }
          }
        }

        return this.__previousElementSibling;
      }
    }
  };
  var nodeProto = Node.prototype;
  var elProto = Element.prototype;

  if (_canPatchNativeAccessors2.default) {
    for (var name in members) {
      var proto = nodeProto.hasOwnProperty(name) ? nodeProto : elProto;
      var nativeDescriptor = Object.getOwnPropertyDescriptor(proto, name);

      if (nativeDescriptor) {
        Object.defineProperty(proto, '__' + name, nativeDescriptor);
      }

      Object.defineProperty(proto, name, members[name]);
    }
  }

  nodeProto.appendChild = function (newNode) {
    if (_data.polyfilled.get(newNode)) {
      _data.assignedSlot.set(newNode, null);

      _data.light.set(newNode, false);

      _data.parentNode.set(newNode, this);
    }

    return _node.appendChild.call(this, newNode);
  };

  nodeProto.insertBefore = function (newNode, refNode) {
    if (_data.polyfilled.get(newNode)) {
      _data.assignedSlot.set(newNode, null);

      _data.light.set(newNode, false);

      _data.parentNode.set(newNode, this);
    }

    return _node.insertBefore.call(this, newNode, refNode);
  };

  nodeProto.removeChild = function (refNode) {
    if (_data.polyfilled.get(refNode)) {
      _data.assignedSlot.set(refNode, null);

      _data.light.set(refNode, false);

      _data.parentNode.set(refNode, null);
    }

    return _node.removeChild.call(this, refNode);
  };

  nodeProto.replaceChild = function (newNode, refNode) {
    if (_data.polyfilled.get(newNode)) {
      _data.assignedSlot.set(newNode, null);

      _data.light.set(newNode, false);

      _data.parentNode.set(newNode, this);
    }

    if (_data.polyfilled.get(refNode)) {
      _data.assignedSlot.set(refNode, null);

      _data.light.set(refNode, false);

      _data.parentNode.set(refNode, null);
    }

    return _node.replaceChild.call(this, newNode, refNode);
  };

  Object.defineProperty(nodeProto, 'assignedSlot', {
    configurable: configurable,
    get: function get() {
      return null;
    }
  });

  function polyfill(light) {
    if (_data.polyfilled.get(light)) {
      return;
    }

    _data.polyfilled.set(light, true);

    if (!_canPatchNativeAccessors2.default) {
      Object.defineProperties(light, members);
    }
  }

  module.exports = exports['default'];
});