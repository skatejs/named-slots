(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.skatejsNamedSlots = factory());
}(this, function () {

    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

    var index$1 = __commonjs(function (module) {
    module.exports = Date.now || now;

    function now() {
        return new Date().getTime();
    }
    });

    var require$$0 = (index$1 && typeof index$1 === 'object' && 'default' in index$1 ? index$1['default'] : index$1);

    var index = __commonjs(function (module) {
    /**
     * Module dependencies.
     */

    var now = require$$0;

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */

    module.exports = function debounce(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = now() - timestamp;

        if (last < wait && last > 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          }
        }
      };

      return function debounced() {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };
    };
    });

    var debounce = (index && typeof index === 'object' && 'default' in index ? index['default'] : index);

    function polyfillSlot(slot) {
      slot.__triggerSlotChangeEvent = debounce(triggerSlotChangeEvent);
      return slot;
    }

    function queryForNamedSlot(host, name) {
      return host.querySelector('slot[name="' + name + '"], [slot-name="' + name + '"]');
    }

    function queryForUnnamedSlot(host) {
      return host.querySelector('slot[name=""], slot:not([name]), [slot-name=""]');
    }

    function triggerSlotChangeEvent() {
      this.dispatchEvent(new CustomEvent('slotchange', {
        bubbles: false,
        cancelable: false
      }));
    }

    function getSlot (host, node) {
      if (!node) {
        return;
      }

      var slotName = node.getAttribute && node.getAttribute('slot');
      var cacheKey = slotName || 'content';

      if (!host.__slots) {
        host.__slots = {};
      }

      var slots = host.__slots;

      // We check for a cached slot first because querying is slow.
      if (slots[cacheKey]) {
        var _slotElement = slots[cacheKey];

        // However, we check to see if it was detached. If not, just return it.
        if (_slotElement.parentNode) {
          return _slotElement;
        }

        // if it was detached we should make sure it's cleaned up.
        delete slots[cacheKey];
        return null;
      }

      var calculatedName = (host.__shadowId || '') + (slotName || '');
      var slotElement = slotName ? queryForNamedSlot(host, calculatedName) : queryForUnnamedSlot(host);

      // Cache it because querying is slow.
      if (slotElement) {
        slots[cacheKey] = polyfillSlot(slotElement);
      }

      return slots[cacheKey] || null;
    }

    var WeakMap = window.WeakMap || function () {
      var index = 0;
      function Wm() {
        this.key = '____weak_map_' + index++;
      }
      Wm.prototype = {
        delete: function _delete(obj) {
          delete obj[this.key];
        },
        get: function get(obj) {
          return obj[this.key];
        },
        has: function has(obj) {
          return typeof obj[this.key] !== 'undefined';
        },
        set: function set(obj, val) {
          return obj[this.key] = val;
        }
      };
      return Wm;
    }();

    var mapNodeIsLightDom = new WeakMap();

    var mapPolyfilled = new WeakMap();

    var mapPolyfilledLightNode = new WeakMap();

    var mapPolyfilledParentNode = new WeakMap();

    var mapSlotChangeListeners = new WeakMap();

    var prop = Object.defineProperty.bind(Object);

    var nodeProto = Node.prototype;
    var elProto = Element.prototype;
    var configurable = true;
    var canPatchNativeAccessors = !!Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;

    // Fake parentNode helpers.

    function applyParentNode(node, parent) {
      mapNodeIsLightDom.set(node, true);
      mapPolyfilledParentNode.set(node, parent);

      if (!canPatchNativeAccessors && !mapPolyfilledLightNode.get(node)) {
        mapPolyfilledLightNode.set(node, true);
        for (var name in lightProps) {
          prop(node, name, lightProps[name]);
        }
      }
    }

    function removeParentNode(node) {
      mapNodeIsLightDom.set(node, false);
      mapPolyfilledParentNode.set(node, null);
    }

    // Slotting helpers.

    function arrayItem(idx) {
      return this[idx];
    }

    function doForNodesIfSlot(elem, node, func) {
      var nodes = nodeToArray(node);
      var nodesLen = nodes.length;

      for (var a = 0; a < nodesLen; a++) {
        var _node = nodes[a];
        var slot = getSlot(elem, _node);

        if (slot) {
          func(elem, _node, slot);
          if (mapSlotChangeListeners.get(slot)) {
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

    // Prop overrides.

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

          // TODO: This may not be foolproof with incompatible child nodes.
          div.innerHTML = val;

          // Ensure existing nodes are cleaned up properly.
          while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
          }

          // Ensures new nodes are set up properly.
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
          // Ensure existing nodes are cleaned up properly.
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
          if (mapNodeIsLightDom.get(this)) {
            var parent = this.parentNode;
            return parent.nodeType === 1 ? parent : null;
          }
          return this.__parentElement;
        }
      },
      parentNode: {
        configurable: configurable,
        get: function get() {
          return mapPolyfilledParentNode.get(this) || this.__parentNode || null;
        }
      },
      nextSibling: {
        configurable: configurable,
        get: function get() {
          if (mapNodeIsLightDom.get(this)) {
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
          if (mapNodeIsLightDom.get(this)) {
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
          if (mapNodeIsLightDom.get(this)) {
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
          if (mapNodeIsLightDom.get(this)) {
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
        // If the ref node is not in the light DOM, just return it.
        if (refNode.parentNode !== this) {
          return refNode;
        }

        // We're dealing with a representation of the light DOM, so we insert nodes
        // relative to the location of the refNode in the light DOM, not the where
        // it appears in the composed DOM.
        var insertBefore = refNode.nextSibling;

        // Clean up the reference node.
        this.removeChild(refNode);

        // Add new nodes in place of the reference node.
        doForNodesIfSlot(this, newNode, function (elem, node, slot) {
          slot.insertBefore(node, insertBefore);
          applyParentNode(node, elem);
        });

        return refNode;
      }
    };

    // If we can patch native accessors, we can safely apply light DOM accessors to
    // all HTML elements. This is faster than polyfilling them individually as they
    // are added, if possible, and doesn't have a measurable impact on performance
    // when they're not marked as light DOM.
    if (canPatchNativeAccessors) {
      for (var name$1 in lightProps) {
        var proto = nodeProto.hasOwnProperty(name$1) ? nodeProto : elProto;
        prop(proto, '__' + name$1, Object.getOwnPropertyDescriptor(proto, name$1));
        prop(proto, name$1, lightProps[name$1]);
      }
    }

    // Polyfills a host element.
    function polyfill(elem) {
      if (mapPolyfilled.get(elem)) {
        return;
      }

      for (var name in hostProps) {
        prop(elem, name, hostProps[name]);
      }

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