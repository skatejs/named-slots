(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.skatejsNamedSlots = factory());
}(this, function () {

  var mapPolyfilled = new WeakMap();

  var prop = Object.defineProperty.bind(Object);

  // Helpers.

  function applyParentNode(node, parent) {
    prop(node, 'parentNode', {
      configurable: true,
      get: function get() {
        return parent;
      }
    });
  }

  function removeParentNode(node) {
    prop(node, 'parentNode', {
      configurable: true,
      get: function get() {
        return null;
      }
    });
  }

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
      var slot = elem.querySelector('[slot-name="' + elem.__shadowId + (name === 'content' ? '' : name) + '"]');
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

  // Returns whether or not the specified element has been polyfilled.
  function polyfilled (elem) {
    return mapPolyfilled.get(elem);
  }

  // Returns a document fragment of the childNodes of the specified element. Due
  // to the nature of the DOM, this will remove the nodes from the element.
  function createFragmentFromChildNodes(elem) {
    var frag = document.createDocumentFragment();
    while (elem.hasChildNodes()) {
      frag.appendChild(elem.firstChild);
    }
    return frag;
  }

  // Creates an shadow root, appends it to the element and returns it.
  function createShadowRoot(elem) {
    var root = document.createElement(isBlockLevel(elem) ? 'div' : 'span');
    elem.appendChild(root);
    return root;
  }

  // Returns whether or not the specified element is a block level element or not
  // We need this to determine the type of element the shadow root should be
  // since we must use real nodes to simulate a shadow root.
  function isBlockLevel(elem) {
    return window.getComputedStyle(elem).display === 'block';
  }

  // Simple renderer that proxies another renderer. It will polyfill if not yet
  // polyfilled, or simply run the renderer. Initial content is taken into
  // consideration.
  var defaults = { shadowId: '' };
  function render (fn) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? defaults : arguments[1];

    return function (elem) {
      var shadowRoot = elem.__shadowRoot;

      if (shadowRoot) {
        fn(elem, shadowRoot);
      } else {
        // We get a fragment of the initial DOM so that we can create the shadow
        // root.
        var initialLightDom = createFragmentFromChildNodes(elem);

        // Create a shadow ID so that it can be used to get a slot that is unique
        // to this shadow root. Since we don't polyfill querySelector() et al, we
        // need a way to be able to refer to slots that are unique to this
        // shadow root.
        elem.__shadowId = opts.shadowId;

        // Create the shadow root and return the light DOM. We must get the light
        // DOM before we template it so that we can distribute it after
        // polyfilling.
        elem.__shadowRoot = createShadowRoot(elem);

        // Render once we have the initial light DOM as this would likely blow
        // that away.
        fn(elem, elem.__shadowRoot);

        // Now polyfill so that we can distribute after.
        polyfill(elem);

        // Distribute the initial light DOM after polyfill so they get put into
        // the right spots.
        elem.appendChild(initialLightDom);
      }
    };
  }

  var version = '0.0.1';



  var api = Object.freeze({
  	default: polyfill,
  	polyfilled: polyfilled,
  	render: render,
  	version: version
  });

  var previousGlobal = window.skatejsNamedSlots;
  polyfill.noConflict = function noConflict() {
    window.skatejsNamedSlots = previousGlobal;
    return this;
  };
  window.skatejsNamedSlots = polyfill;
  for (var name in api) {
    polyfill[name] = api[name];
  }

  return polyfill;

}));
//# sourceMappingURL=index.js.map