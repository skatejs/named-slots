(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.skatejs-named-slots = factory());
}(this, function () {

  var mapPolyfilled = new WeakMap();

  var prop = Object.defineProperty.bind(Object);

  // Helpers.

  function arrayItem(idx) {
    return this[idx];
  }

  function doForNodesIfSlot(elem, node, func) {
    nodeToArray(node).forEach(function (node) {
      var slot = getSlot(elem, node);
      if (slot) {
        func(elem, node, slot);
      }
    });
  }

  function getSlot(elem, node) {
    if (!node) {
      return;
    }

    var name = node.getAttribute && node.getAttribute('slot') || 'content';

    if (!elem.__slots) {
      elem.__slots = {};
    }

    var slots = elem.__slots;

    if (typeof slots[name] === 'undefined') {
      var slot = elem.querySelector('[slot-name="' + (name === 'content' ? '' : name) + '"]');
      if (slot) {
        slots[name] = slot;
      }
    }

    if (slots[name]) {
      return slots[name];
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

  // Prop overrides.

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
        doForNodesIfSlot(this, val.toString(), function (elem, node, slot) {
          slot.textContent = node;
        });
      }
    }
  };

  // Method overrides.

  var funcs = {
    appendChild: function appendChild(newNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.appendChild(node);
      });
      return newNode;
    },
    hasChildNodes: function hasChildNodes() {
      return this.childNodes.length > 0;
    },
    insertBefore: function insertBefore(newNode, refNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.insertBefore(newNode, refNode);
      });
      return newNode;
    },
    removeChild: function removeChild(refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        slot.removeChild(refNode);
      });
      return refNode;
    },
    replaceChild: function replaceChild(newNode, refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        slot.replaceChild(newNode, refNode);
      });
      return refNode;
    }
  };

  // Polyfills an element.
  function polyfill (elem) {
    if (mapPolyfilled.get(elem)) {
      return;
    }

    // Polyfill properties.
    for (var name in props) {
      prop(elem, name, props[name]);
    }

    // Polyfill methods.
    for (var name in funcs) {
      elem[name] = funcs[name];
    }

    mapPolyfilled.set(elem, true);
    return elem;
  }

  var previousGlobal = window.skatejsNamedSlots;
  polyfill.noConflict = function noConflict() {
    window.skatejsNamedSlots = previousGlobal;
    return this;
  };
  window.skatejsNamedSlots = polyfill;

  return polyfill;

}));
//# sourceMappingURL=index.js.map