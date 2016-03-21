(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './internal/get-slot', './internal/map-node-is-light-dom', './internal/map-polyfilled', './internal/map-polyfilled-light-node', './internal/map-polyfilled-parent-node', './internal/map-slot-change-listeners', './internal/prop'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./internal/get-slot'), require('./internal/map-node-is-light-dom'), require('./internal/map-polyfilled'), require('./internal/map-polyfilled-light-node'), require('./internal/map-polyfilled-parent-node'), require('./internal/map-slot-change-listeners'), require('./internal/prop'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.getSlot, global.mapNodeIsLightDom, global.mapPolyfilled, global.mapPolyfilledLightNode, global.mapPolyfilledParentNode, global.mapSlotChangeListeners, global.prop);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _getSlot, _mapNodeIsLightDom, _mapPolyfilled, _mapPolyfilledLightNode, _mapPolyfilledParentNode, _mapSlotChangeListeners, _prop) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = polyfill;

  var _getSlot2 = _interopRequireDefault(_getSlot);

  var _mapNodeIsLightDom2 = _interopRequireDefault(_mapNodeIsLightDom);

  var _mapPolyfilled2 = _interopRequireDefault(_mapPolyfilled);

  var _mapPolyfilledLightNode2 = _interopRequireDefault(_mapPolyfilledLightNode);

  var _mapPolyfilledParentNode2 = _interopRequireDefault(_mapPolyfilledParentNode);

  var _mapSlotChangeListeners2 = _interopRequireDefault(_mapSlotChangeListeners);

  var _prop2 = _interopRequireDefault(_prop);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var nodeProto = Node.prototype;
  var elProto = Element.prototype;
  var htmlElProto = HTMLElement.prototype;
  var configurable = true;
  var canPatchNativeAccessors = !!Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;

  function applyParentNode(node, parent) {
    _mapNodeIsLightDom2.default.set(node, true);

    _mapPolyfilledParentNode2.default.set(node, parent);

    if (!canPatchNativeAccessors && !_mapPolyfilledLightNode2.default.get(node)) {
      _mapPolyfilledLightNode2.default.set(node, true);

      for (var name in lightProps) {
        (0, _prop2.default)(node, name, lightProps[name]);
      }
    }
  }

  function removeParentNode(node) {
    _mapNodeIsLightDom2.default.set(node, false);

    _mapPolyfilledParentNode2.default.set(node, null);
  }

  function arrayItem(idx) {
    return this[idx];
  }

  function doForNodesIfSlot(elem, node, func) {
    var nodes = nodeToArray(node);
    var nodesLen = nodes.length;

    for (var a = 0; a < nodesLen; a++) {
      var _node = nodes[a];
      var slot = (0, _getSlot2.default)(elem, _node);

      if (slot) {
        func(elem, _node, slot);

        if (_mapSlotChangeListeners2.default.get(slot)) {
          slot.__triggerSlotChangeEvent();
        }
      }
    }
  }

  function makeLikeNodeList(arr) {
    arr.item = arrayItem;
    return arr;
  }

  function nodeToArray(node) {
    return node instanceof DocumentFragment ? toArray(node.childNodes) : [node];
  }

  function toArray(obj) {
    return Array.prototype.slice.call(obj);
  }

  var hostProps = {
    childElementCount: {
      configurable: configurable,
      get: function get() {
        return this.children.length;
      }
    },
    childNodes: {
      get: function get() {
        var nodes = [];
        var slots = this.__slots;

        if (slots) {
          for (var name in slots) {
            var slot = slots[name];
            var childNodes = slot.childNodes;
            var childNodesLen = childNodes.length;

            for (var a = 0; a < childNodesLen; a++) {
              nodes.push(childNodes[a]);
            }
          }
        }

        return makeLikeNodeList(nodes);
      }
    },
    children: {
      get: function get() {
        return makeLikeNodeList(this.childNodes.filter(function (node) {
          return node.nodeType === 1;
        }));
      }
    },
    firstChild: {
      get: function get() {
        return this.childNodes[0] || null;
      }
    },
    firstElementChild: {
      get: function get() {
        return this.children[0] || null;
      }
    },
    innerHTML: {
      get: function get() {
        return this.childNodes.map(function (node) {
          return node.outerHTML || node.textContent;
        }).join('');
      },
      set: function set(val) {
        var div = document.createElement('div');
        var frag = document.createDocumentFragment();
        div.innerHTML = val;

        while (this.hasChildNodes()) {
          this.removeChild(this.firstChild);
        }

        while (div.hasChildNodes()) {
          frag.appendChild(div.firstChild);
        }

        this.appendChild(frag);
      }
    },
    lastChild: {
      get: function get() {
        var ch = this.childNodes;
        return ch[ch.length - 1] || null;
      }
    },
    lastElementChild: {
      get: function get() {
        var ch = this.children;
        return ch[ch.length - 1] || null;
      }
    },
    outerHTML: {
      get: function get() {
        var name = this.tagName.toLowerCase();
        var attributes = toArray(this.attributes).map(function (attr) {
          return ' ' + attr.name + (attr.value ? '="' + attr.value + '"' : '');
        }).join('');
        return '<' + name + attributes + '>' + this.innerHTML + '</' + name + '>';
      }
    },
    textContent: {
      get: function get() {
        return this.childNodes.map(function (node) {
          return node.textContent;
        }).join('');
      },
      set: function set(val) {
        while (this.hasChildNodes()) {
          this.removeChild(this.firstChild);
        }

        doForNodesIfSlot(this, val.toString(), function (elem, node, slot) {
          slot.textContent = node;
        });
      }
    }
  };
  var lightProps = {
    parentElement: {
      configurable: configurable,
      get: function get() {
        if (_mapNodeIsLightDom2.default.get(this)) {
          var parent = this.parentNode;
          return parent.nodeType === 1 ? parent : null;
        }

        return this.__parentElement;
      }
    },
    parentNode: {
      configurable: configurable,
      get: function get() {
        return _mapPolyfilledParentNode2.default.get(this) || this.__parentNode || null;
      }
    },
    nextSibling: {
      configurable: configurable,
      get: function get() {
        if (_mapNodeIsLightDom2.default.get(this)) {
          var index = undefined;
          var parChs = this.parentNode.childNodes;
          var parChsLen = parChs.length;

          for (var a = 0; a < parChsLen; a++) {
            if (parChs[a] === this) {
              index = a;
              continue;
            }
          }

          return typeof index === 'number' ? parChs[index + 1] : null;
        }

        return this.__nextSibling;
      }
    },
    nextElementSibling: {
      configurable: configurable,
      get: function get() {
        if (_mapNodeIsLightDom2.default.get(this)) {
          var next = undefined;

          while (next = this.nextSibling) {
            if (next.nodeType === 1) {
              return next;
            }
          }

          return null;
        }

        return this.__nextElementSibling;
      }
    },
    previousSibling: {
      configurable: configurable,
      get: function get() {
        if (_mapNodeIsLightDom2.default.get(this)) {
          var index = undefined;
          var parChs = this.parentNode.childNodes;
          var parChsLen = parChs.length;

          for (var a = 0; a < parChsLen; a++) {
            if (parChs[a] === this) {
              index = a;
              continue;
            }
          }

          return typeof index === 'number' ? parChs[index - 1] : null;
        }

        return this.__previousSibling;
      }
    },
    previousElementSibling: {
      configurable: configurable,
      get: function get() {
        if (_mapNodeIsLightDom2.default.get(this)) {
          var prev = undefined;

          while (prev = this.previousSibling) {
            if (prev.nodeType === 1) {
              return prev;
            }
          }

          return null;
        }

        return this.__previousElementSibling;
      }
    }
  };
  var funcs = {
    appendChild: function appendChild(newNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.appendChild(node);
        applyParentNode(node, elem);
      });
      return newNode;
    },
    hasChildNodes: function hasChildNodes() {
      return this.childNodes.length > 0;
    },
    insertBefore: function insertBefore(newNode, refNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.insertBefore(node, refNode);
        applyParentNode(node, elem);
      });
      return newNode;
    },
    removeChild: function removeChild(refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        slot.removeChild(node);
        removeParentNode(node);
      });
      return refNode;
    },
    replaceChild: function replaceChild(newNode, refNode) {
      if (refNode.parentNode !== this) {
        return refNode;
      }

      var insertBefore = refNode.nextSibling;
      this.removeChild(refNode);
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.insertBefore(node, insertBefore);
        applyParentNode(node, elem);
      });
      return refNode;
    }
  };

  if (canPatchNativeAccessors) {
    for (var name in lightProps) {
      var proto = nodeProto.hasOwnProperty(name) ? nodeProto : elProto;
      (0, _prop2.default)(proto, '__' + name, Object.getOwnPropertyDescriptor(proto, name));
      (0, _prop2.default)(proto, name, lightProps[name]);
    }
  }

  var addEventListener = htmlElProto.addEventListener;
  var removeEventListener = htmlElProto.removeEventListener;

  htmlElProto.addEventListener = function (name, func, opts) {
    if (name === 'slotchange') {
      var listeners = _mapSlotChangeListeners2.default.get(this) || 0;

      _mapSlotChangeListeners2.default.set(this, ++listeners);
    }

    return addEventListener.call(this, name, func, opts);
  };

  htmlElProto.removeEventListener = function (name, func, opts) {
    if (name === 'slotchange') {
      var listeners = _mapSlotChangeListeners2.default.get(this) || 1;

      _mapSlotChangeListeners2.default.set(this, --listeners);
    }

    return removeEventListener.call(this, name, func, opts);
  };

  function polyfill(elem) {
    if (_mapPolyfilled2.default.get(elem)) {
      return;
    }

    for (var name in hostProps) {
      (0, _prop2.default)(elem, name, hostProps[name]);
    }

    for (var name in funcs) {
      elem[name] = funcs[name];
    }

    _mapPolyfilled2.default.set(elem, true);

    return elem;
  }

  module.exports = exports['default'];
});