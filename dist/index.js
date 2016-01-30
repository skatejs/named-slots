(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.skatejs-named-slots = factory());
}(this, function () {

  var mapPatch = new WeakMap();

  var mapSlots = new WeakMap();

  var mapSlotsDefault = new WeakMap();

  // Returns whether or not the specified element has been polyfilled.
  function polyfilled (elem) {
    return mapPatch.get(elem);
  }

  var prop = Object.defineProperty.bind(Object);

  // Helpers.

  function getSlot(elem, node) {
    var key = getSlotName(elem, node);
    var val = elem[key];
    return key && val ? { key: key, val: val.slice() } : null;
  }

  function getSlotName(elem, node) {
    return node.getAttribute && node.getAttribute('slot') || mapSlotsDefault.get(elem);
  }

  function arrayItem(idx) {
    return this[idx];
  }

  function makeLikeNodeList(arr) {
    arr.item = arrayItem;
    return arr;
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
        var _this = this;

        return makeLikeNodeList((mapSlots.get(this) || []).reduce(function (prev, curr) {
          return prev.concat(_this[curr]);
        }, []));
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
        return this.childNodes[0];
      }
    },
    firstElementChild: {
      get: function get() {
        return this.children[0];
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
        div.innerHTML = val;
        while (div.hasChildNodes()) {
          this.appendChild(div.childNodes[0]);
        }
      }
    },
    lastChild: {
      get: function get() {
        var ch = this.childNodes;
        return ch[ch.length - 1];
      }
    },
    lastElementChild: {
      get: function get() {
        var ch = this.children;
        return ch[ch.length - 1];
      }
    },
    outerHTML: {
      get: function get() {
        var name = this.tagName.toLowerCase();
        var attributes = [].slice.call(this.attributes).map(function (attr) {
          return ' ' + attr.name + (attr.value ? '=' + attr.value : '');
        });
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
        var slot = mapSlotsDefault.get(this);
        if (slot) {
          this[slot] = document.createTextNode(val);
        }
      }
    }
  };

  // Method overrides.

  var funcs = {
    appendChild: function appendChild(newNode) {
      var slot = getSlot(this, newNode);
      if (!slot) {
        return;
      }
      slot.val.push(newNode);
      this[slot.key] = slot.val;
      return newNode;
    },
    hasChildNodes: function hasChildNodes() {
      return this.childNodes.length > 0;
    },
    insertBefore: function insertBefore(newNode, refNode) {
      var slot = getSlot(this, newNode);
      if (!slot) {
        return;
      }
      var index = slot.val.indexOf(refNode);
      if (index === -1) {
        slot.val.push(newNode);
      } else {
        slot.val.splice(index, 0, newNode);
      }
      this[slot.key] = slot.val;
      return newNode;
    },
    removeChild: function removeChild(refNode) {
      var slot = getSlot(this, refNode);
      if (!slot) {
        return;
      }
      var index = slot.val.indexOf(refNode);
      if (index !== -1) {
        slot.val.splice(index, 1);
        this[slot.key] = slot.val;
      }
      return refNode;
    },
    replaceChild: function replaceChild(newNode, refNode) {
      var slot = getSlot(this, newNode);
      if (!slot) {
        return;
      }
      var index = slot.val.indexOf(refNode);
      if (index !== -1) {
        slot.val.splice(index, 1, newNode);
        this[slot.key] = slot.val;
      }
      return refNode;
    }
  };

  // Polyfills an element.
  function polyfill (elem) {
    if (polyfilled(elem)) {
      return;
    }

    for (var name in props) {
      prop(elem, name, props[name]);
    }

    for (var name in funcs) {
      elem[name] = funcs[name];
    }

    mapPatch.set(elem, true);
  }

  // Simple renderer that proxies another renderer. It will polyfill if not yet
  // polyfilled, or simply run the renderer. Initial content is taken into
  // consideration.
  function render (fn) {
    return function (elem) {
      if (mapPatch.get(elem)) {
        fn(elem);
      } else {
        fn(elem);
        polyfill(elem);
      }
    };
  }

  // Creates a slot property compatible with the SkateJS custom property
  // definitions. Makes web component integration much simpler.
  function slot (opts) {
    if (!opts) {
      opts = {
        default: false,
        set: null
      };
    }

    return {
      // Makes sure that whatever is passed in is an array.
      coerce: function coerce(val) {
        return Array.isArray(val) ? val : [val];
      },

      // Registers the slot so we can check later.
      created: function created(elem, data) {
        var slots = mapSlots.get(elem);

        if (!slots) {
          mapSlots.set(elem, slots = []);
        }

        slots.push(data.name);

        if (opts.default) {
          mapSlotsDefault.set(elem, data.name);
        }
      },

      // If an empty value is passed in, ensure that it's an array.
      'default': function _default() {
        return [];
      },

      // Return any initial nodes that match the slot.
      initial: function initial(elem, data) {
        return [].slice.call(elem.childNodes).filter(function (ch) {
          if (ch.getAttribute) {
            var slot = ch.getAttribute('slot') || opts.default && data.name;
            return slot === data.name;
          }
        });
      },

      // User-defined setter.
      set: opts.set
    };
  }

  var version = '0.0.1';

  var main = {
    polyfill: polyfill,
    polyfilled: polyfilled,
    render: render,
    slot: slot,
    version: version
  };

  var previousGlobal = window.skatejsNamedSlots;
  main.noConflict = function noConflict() {
    window.skatejsNamedSlots = previousGlobal;
    return this;
  };
  window.skatejsNamedSlots = main;

  return main;

}));
//# sourceMappingURL=index.js.map