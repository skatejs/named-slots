(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './internal/get-slot', './internal/map-polyfilled', './internal/prop'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./internal/get-slot'), require('./internal/map-polyfilled'), require('./internal/prop'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.getSlot, global.mapPolyfilled, global.prop);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _getSlot, _mapPolyfilled, _prop) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (elem) {
    if (_mapPolyfilled2.default.get(elem)) {
      return;
    }

    // Polyfill properties.
    for (var name in props) {
      (0, _prop2.default)(elem, name, props[name]);
    }

    // Polyfill methods.
    for (var name in funcs) {
      elem[name] = funcs[name];
    }

    _mapPolyfilled2.default.set(elem, true);
    return elem;
  };

  var _getSlot2 = _interopRequireDefault(_getSlot);

  var _mapPolyfilled2 = _interopRequireDefault(_mapPolyfilled);

  var _prop2 = _interopRequireDefault(_prop);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var configurable = true;
  var elProto = Element.prototype;
  var htmlElProto = HTMLElement.prototype;
  var nodeProto = Node.prototype;
  var descEl = Object.getOwnPropertyDescriptor.bind(Object, elProto);
  var descNode = Object.getOwnPropertyDescriptor.bind(Object, nodeProto);
  var descendantAccessors = {
    __nextElementSibling: descEl('nextElementSibling'),
    __nextSibling: descNode('nextSibling'),
    __parentElement: descNode('parentElement'),
    __parentNode: descNode('parentNode'),
    __previousElementSibling: descEl('nextElementSibling'),
    __previousSibling: descNode('previousSibling'),
    parentElement: {
      configurable: configurable,
      get: function get() {
        if (this.__isLightDom) {
          var parent = this.parentNode;
          return parent.nodeType === 1 ? parent : null;
        }

        return this.__parentElement;
      }
    },
    parentNode: {
      configurable: configurable,
      get: function get() {
        return this.__polyfilledParentNode || this.__parentNode || null;
      }
    },
    nextSibling: {
      configurable: configurable,
      get: function get() {
        if (this.__isLightDom) {
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
        if (this.__isLightDom) {
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
        if (this.__isLightDom) {
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
        if (this.__isLightDom) {
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
  var canPatchNativeAccessors = !!descendantAccessors.__parentNode.get;

  function applyParentNode(node, parent) {
    node.__isLightDom = true;
    node.__polyfilledParentNode = parent;

    if (!canPatchNativeAccessors) {
      Object.defineProperties(node, descendantAccessors);
    }
  }

  function removeParentNode(node) {
    node.__isLightDom = false;
    node.__polyfilledParentNode = null;
  }

  function arrayItem(idx) {
    return this[idx];
  }

  function doForNodesIfSlot(elem, node, func) {
    nodeToArray(node).forEach(function (node) {
      var slot = (0, _getSlot2.default)(elem, node);

      if (slot) {
        func(elem, node, slot);
      }
    });
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

  var props = {
    childElementCount: {
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
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.replaceChild(node, refNode);
        applyParentNode(node, elem);
      });
      removeParentNode(refNode);
      return refNode;
    }
  };

  if (canPatchNativeAccessors) {
    Object.defineProperties(htmlElProto, descendantAccessors);
  }

  module.exports = exports['default'];
});