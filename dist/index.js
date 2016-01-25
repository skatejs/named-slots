// src/index.js
(typeof window === 'undefined' ? global : window).__b3a2e62299a9ffe4369f9a25c95cc2b6 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.polyfill = polyfill;
  exports.polyfilled = polyfilled;
  exports.slot = slot;
  exports.render = render;
  var mapPatch = new WeakMap();
  var mapSlots = new WeakMap();
  var mapSlotsDefault = new WeakMap();
  var prop = Object.defineProperty.bind(Object);
  
  // Helpers.
  
  function getSlotName(elem, node) {
    return node.getAttribute && node.getAttribute('slot') || mapSlotsDefault.get(elem);
  }
  
  function nodeToArray(node) {
    return node instanceof DocumentFragment ? [].slice.call(node.childNodes) : [node];
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
  
        return (mapSlots.get(this) || []).reduce(function (prev, curr) {
          return prev.concat(_this[curr]);
        }, []);
      }
    },
    children: {
      get: function get() {
        return this.childNodes.filter(function (node) {
          return node.nodeType === 1;
        });
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
      var name = getSlotName(this, newNode);
      if (!name && !this[name]) return;
      this[name] = this[name].concat(nodeToArray(newNode));
      return newNode;
    },
    hasChildNodes: function hasChildNodes() {
      return this.childNodes.length > 0;
    },
    insertBefore: function insertBefore(newNode, refNode) {
      var name = getSlotName(this, newNode);
      if (!name || !this[name]) return;
      var index = this[name].indexOf(refNode);
      this[name] = this[name].slice(0, index).concat(nodeToArray(newNode)).concat(this[name].slice(index));
      return newNode;
    },
    removeChild: function removeChild(refNode) {
      var name = getSlotName(this, refNode);
      if (!name && !this[name]) return;
      var index = this[name].indexOf(refNode);
      this[name] = this[name].slice(0, index).concat(this[name].slice(index + 1));
      return refNode;
    },
    replaceChild: function replaceChild(newNode, refNode) {
      var name = getSlotName(this, newNode);
      if (!name || !this[name]) return;
      var index = this[name].indexOf(refNode);
      this[name] = this[name].slice(0, index).concat(nodeToArray(newNode)).concat(this[name].slice(index + 1));
      return refNode;
    }
  };
  
  // Polyfills an element.
  
  function polyfill(elem) {
    if (polyfilled(elem)) {
      return;
    }
  
    for (var _name in props) {
      prop(elem, _name, props[_name]);
    }
  
    for (var _name2 in funcs) {
      elem[_name2] = funcs[_name2];
    }
  
    mapPatch.set(elem, true);
  }
  
  // Returns whether or not the specified element has been polyfilled.
  
  function polyfilled(elem) {
    return mapPatch.get(elem);
  }
  
  // Creates a slot property compatible with the SkateJS custom property
  // definitions. Makes web component integration much simpler.
  
  function slot(opts) {
    if (!opts) {
      opts = {
        'default': false,
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
  
        if (opts['default']) {
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
          var slot = ch.getAttribute && ch.getAttribute('slot') || opts['default'] && data.name;
          return slot && slot === data.name;
        });
      },
  
      // User-defined setter.
      set: opts.set
    };
  }
  
  // Simple renderer that proxies another renderer. It will polyfill if not yet
  // polyfilled, or simply run the renderer. Initial content is taken into
  // consideration.
  
  function render(fn) {
    return function (elem) {
      if (mapPatch.get(elem)) {
        fn(elem);
      } else {
        var ch = [].slice.call(elem.childNodes);
        fn(elem);
        polyfill(elem);
        ch.forEach(elem.appendChild(ch));
      }
    };
  }
  
  return module.exports;
}).call(this);
// src/global.js
(typeof window === 'undefined' ? global : window).__f1499e1f6a8598eaa78eca050f1b2a34 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  var _index = __b3a2e62299a9ffe4369f9a25c95cc2b6;
  
  exports.slot = _index.slot;
  exports.polyfill = _index.polyfill;
  
  return module.exports;
}).call(this);