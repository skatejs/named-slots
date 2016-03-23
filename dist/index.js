(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.skatejsNamedSlots = factory());
}(this, function () {

    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

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

    var hosts = new WeakMap();
    var roots = new WeakMap();
    var slots = new WeakMap();

    var proto = Node.prototype;
    var appendChild = proto.appendChild;
    var insertBefore = proto.insertBefore;
    var removeChild = proto.removeChild;
    var replaceChild = proto.replaceChild;

    var assignedSlot = new WeakMap();
    var light = new WeakMap();
    var parentNode = new WeakMap();
    var polyfilled = new WeakMap();

    var assignedNodes = new WeakMap();
    var changeListeners = new WeakMap();
    var debouncedTriggerSlotChangeEvent = new WeakMap();
    var fallbackNodes = new WeakMap();
    var fallbackState = new WeakMap();
    var polyfilled$1 = new WeakMap();

    function shouldAffectSlot(slot) {
      return !fallbackState.get(slot);
    }

    function toggle(slot) {
      if (fallbackState.get(slot)) {
        var aNodes = assignedNodes.get(slot);
        if (aNodes.length) {
          var fNodes = fallbackNodes.get(slot);
          fNodes.forEach(function (node) {
            return removeChild.call(slot, node);
          });
          aNodes.forEach(function (node) {
            return appendChild.call(slot, node);
          });
          fallbackState.set(slot, false);
        }
      } else {
        var aNodes = assignedNodes.get(slot);
        if (!aNodes.length) {
          var fNodes = fallbackNodes.get(slot);
          aNodes.forEach(function (node) {
            return removeChild.call(slot, node);
          });
          fNodes.forEach(function (node) {
            return appendChild.call(slot, node);
          });
          fallbackState.set(slot, true);
        }
      }
    }

    function triggerEvent(slot) {
      if (changeListeners.get(slot)) {
        debouncedTriggerSlotChangeEvent.get(slot)(slot);
      }
    }

    function triggerSideEffects(slot) {
      toggle(slot);
      triggerEvent(slot);
    }

    function getSlotName(node) {
      return (node.getAttribute ? node.getAttribute('slot') : null) || 'default';
    }

    function getSlotNode(root, node) {
      var slot = getSlotName(node);
      return slots.get(root)[slot];
    }

    function distribute (node) {
      var host = node.parentNode;
      var slot = getSlotNode(roots.get(host), node);

      if (slot) {
        var an = assignedNodes.get(slot);
        var ns = node.nextSibling;
        var shouldManip = shouldAffectSlot(slot);

        assignedSlot.set(node, slot);

        if (ns && ns.assignedSlot === slot) {
          an.splice(an.indexOf(ns), 0, node);
          shouldManip && insertBefore.call(slot, node, ns);
        } else {
          an.push(node);
          shouldManip && appendChild.call(slot, node);
        }

        triggerSideEffects(slot);
      }
    }

    function undistribute(node) {
      var host = node.parentNode;
      var slot = getSlotNode(roots.get(host), node);

      if (slot) {
        var an = assignedNodes.get(slot);
        var index = an.indexOf(node);

        if (index > -1) {
          shouldAffectSlot(slot) && removeChild.call(slot, node);
          assignedSlot.set(node, null);
          an.splice(index, 1);
          triggerSideEffects(slot);
        }
      }
    }

    function fragFromHtml (html) {
      var frag = document.createElement('div');
      frag.innerHTML = html;
      return frag;
    }

    function htmlFromFrag (frag) {
      var html = '';
      var chs = frag.childNodes;
      var chsLen = chs.length;
      for (var a = 0; a < chsLen; a++) {
        html += chs[a].outerHTML;
      }
      return html;
    }

    var lightNodes = new WeakMap();
    var polyfilled$2 = new WeakMap();

    // Does something for a single node or a DocumentFragment. This is useful when
    // working with arguments that are passed to DOM methods that work with either.
    function each (node, func) {
      if (node instanceof DocumentFragment) {
        var chs = node.childNodes;
        var chsLen = chs.length;
        for (var a = 0; a < chsLen; a++) {
          func(chs[a]);
        }
      } else {
        func(node);
      }
    }

    // Any code referring to this is because it has to work around this bug in
    // WebKit: https://bugs.webkit.org/show_bug.cgi?id=49739
    var canPatchNativeAccessors = !!Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;

    var configurable$1 = true;
    var members$3 = {
      assignedSlot: {
        configurable: configurable$1,
        get: function get() {
          return assignedSlot.get(this) || null;
        }
      },
      parentElement: {
        configurable: configurable$1,
        get: function get() {
          if (light.get(this)) {
            var parent = this.parentNode;
            return parent.nodeType === 1 ? parent : null;
          }
          return this.__parentElement;
        }
      },
      parentNode: {
        configurable: configurable$1,
        get: function get() {
          return parentNode.get(this) || this.__parentNode || null;
        }
      },
      nextSibling: {
        configurable: configurable$1,
        get: function get() {
          if (light.get(this)) {
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
        configurable: configurable$1,
        get: function get() {
          if (light.get(this)) {
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
        configurable: configurable$1,
        get: function get() {
          if (light.get(this)) {
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
        configurable: configurable$1,
        get: function get() {
          if (light.get(this)) {
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

    // If we can patch native accessors, we can safely apply light DOM accessors to
    // all HTML elements. This is faster than polyfilling them individually as they
    // are added, if possible, and doesn't have a measurable impact on performance
    // when they're not marked as light DOM.
    var nodeProto = Node.prototype;
    var elProto = Element.prototype;
    if (canPatchNativeAccessors) {
      for (var name$1 in members$3) {
        var proto$1 = nodeProto.hasOwnProperty(name$1) ? nodeProto : elProto;
        var nativeDescriptor = Object.getOwnPropertyDescriptor(proto$1, name$1);
        if (nativeDescriptor) {
          Object.defineProperty(proto$1, '__' + name$1, nativeDescriptor);
        }
        Object.defineProperty(proto$1, name$1, members$3[name$1]);
      }
    }

    // We patch the node prototype to ensure any method that reparents a node
    // cleans up after the polyfills.
    nodeProto.appendChild = function (newNode) {
      if (polyfilled.get(newNode)) {
        assignedSlot.set(newNode, null);
        light.set(newNode, false);
        parentNode.set(newNode, this);
      }
      return appendChild.call(this, newNode);
    };
    nodeProto.insertBefore = function (newNode, refNode) {
      if (polyfilled.get(newNode)) {
        assignedSlot.set(newNode, null);
        light.set(newNode, false);
        parentNode.set(newNode, this);
      }
      return insertBefore.call(this, newNode, refNode);
    };
    nodeProto.removeChild = function (refNode) {
      if (polyfilled.get(refNode)) {
        assignedSlot.set(refNode, null);
        light.set(refNode, false);
        parentNode.set(refNode, null);
      }
      return removeChild.call(this, refNode);
    };
    nodeProto.replaceChild = function (newNode, refNode) {
      if (polyfilled.get(newNode)) {
        assignedSlot.set(newNode, null);
        light.set(newNode, false);
        parentNode.set(newNode, this);
      }
      if (polyfilled.get(refNode)) {
        assignedSlot.set(refNode, null);
        light.set(refNode, false);
        parentNode.set(refNode, null);
      }
      return replaceChild.call(this, newNode, refNode);
    };

    // By default we should always return null from the Element for `assignedSlot`.
    Object.defineProperty(nodeProto, 'assignedSlot', {
      configurable: configurable$1,
      get: function get() {
        return null;
      }
    });

    function polyfill$3(light) {
      if (polyfilled.get(light)) {
        return;
      }
      polyfilled.set(light, true);
      if (!canPatchNativeAccessors) {
        Object.defineProperties(light, members$3);
      }
    }

    var configurable = true;

    // Slotting helpers.

    function arrayItem(idx) {
      return this[idx];
    }

    function makeLikeNodeList(arr) {
      arr.item = arrayItem;
      return arr;
    }

    // If we append a child to a host, the host tells the shadow root to distribute
    // it. If the root decides it doesn't need to be distributed, it is never
    // removed from the old parent because in polyfill land we store a reference
    // to the node but we don't move it. Due to that, we must explicitly remove the
    // node from its old parent.
    function cleanNode(node) {
      var parent = node.parentNode;
      if (parent) {
        parent.removeChild(node);
      }
    }

    var members$1 = {
      appendChild: {
        value: function value(newNode) {
          var ln = lightNodes.get(this);
          var host = this;
          cleanNode(newNode);
          each(newNode, function (node) {
            ln.push(node);
            light.set(node, true);
            parentNode.set(node, host);
            polyfill$3(node);
            distribute(node);
          });
          return newNode;
        }
      },
      childElementCount: {
        configurable: configurable,
        get: function get() {
          return this.children.length;
        }
      },
      childNodes: {
        get: function get() {
          return lightNodes.get(this);
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
      hasChildNodes: {
        value: function value() {
          return this.childNodes.length > 0;
        }
      },
      innerHTML: {
        get: function get() {
          return htmlFromFrag(this);
        },
        set: function set(innerHTML) {
          var copy = fragFromHtml(innerHTML);
          while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
          }
          while (copy.hasChildNodes()) {
            this.appendChild(copy.firstChild);
          }
        }
      },
      insertBefore: {
        value: function value(newNode, refNode) {
          var ln = lightNodes.get(this);
          var host = this;
          cleanNode(newNode);
          each(newNode, function (node) {
            var index = ln.indexOf(refNode);
            if (index > -1) {
              ln.splice(index, 0, node);
            } else {
              ln.push(node);
            }
            light.set(node, true);
            parentNode.set(node, host);
            polyfill$3(node);
            distribute(node);
          });
          return newNode;
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
          var attributes = Array.prototype.slice.call(this.attributes).map(function (attr) {
            return ' ' + attr.name + (attr.value ? '="' + attr.value + '"' : '');
          }).join('');
          return '<' + name + attributes + '>' + this.innerHTML + '</' + name + '>';
        }
      },
      removeChild: {
        value: function value(refNode) {
          var ln = lightNodes.get(this);
          var index = ln.indexOf(refNode);

          if (index > -1) {
            undistribute(refNode);
            light.set(refNode, false);
            parentNode.set(refNode, null);
            ln.splice(index, 1);
          }

          return refNode;
        }
      },
      replaceChild: {
        value: function value(newNode, refNode) {
          this.insertBefore(newNode, refNode);
          return this.removeChild(refNode);
        }
      },
      textContent: {
        get: function get() {
          return this.childNodes.map(function (node) {
            return node.textContent;
          }).join('');
        },
        set: function set(textContent) {
          while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
          }
          this.appendChild(document.createTextNode(textContent));
        }
      }
    };

    function polyfill$1 (host) {
      if (polyfilled$2.get(host)) {
        return;
      }
      lightNodes.set(host, makeLikeNodeList([]));
      Object.defineProperties(host, members$1);
      polyfilled$2.set(host, true);
      return host;
    }

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

    function getInitialFallbackContent(slot) {
      var arr = [];
      var chs = slot.childNodes;
      var chsLen = chs.length;
      for (var a = 0; a < chsLen; a++) {
        arr.push(chs[a]);
      }
      return arr;
    }

    function getAssignedNodesDeep(slot) {
      return assignedNodes.get(slot);
    }

    function shouldAffectSlot$1(slot) {
      return fallbackState.get(slot);
    }

    function triggerSlotChangeEvent(slot) {
      slot.dispatchEvent(new CustomEvent('slotchange', {
        bubbles: false,
        cancelable: false
      }));
    }

    var members$2 = {
      appendChild: {
        value: function value(newNode) {
          shouldAffectSlot$1(this) && appendChild.call(this, newNode);
          this.childNodes.push(newNode);
          return newNode;
        }
      },
      childElementCount: {
        get: function get() {
          return this.children.length;
        }
      },
      childNodes: {
        get: function get() {
          return fallbackNodes.get(this);
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
          return this.childNodes[0] || null;
        }
      },
      firstElementChild: {
        get: function get() {
          return this.children[0] || null;
        }
      },
      getAssignedNodes: {
        value: function value() {
          var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

          return opts.deep ? getAssignedNodesDeep(this) : assignedNodes.get(this);
        }
      },
      hasChildNodes: {
        value: function value() {
          return !!this.childNodes.length;
        }
      },
      innerHTML: {
        get: function get() {
          return fallbackNodes.get(this).map(function (node) {
            return node.outerHTML;
          }).join('');
        },
        set: function set(innerHTML) {
          fallbackNodes.set(this, []);
          var chs = fragFromHtml(innerHTML).childNodes;
          var chsLen = chs.length;
          for (var a = chsLen - 1; a >= 0; a--) {
            this.insertBefore(chs[a], this.firstChild);
          }
        }
      },
      insertBefore: {
        value: function value(newNode, refNode) {
          var fb = fallbackNodes.get(this);
          shouldAffectSlot$1(this) && insertBefore.call(this, newNode, refNode);
          fb.splice(fb.indexOf(refNode), 0, newNode);
          return newNode;
        }
      },
      lastChild: {
        get: function get() {
          var chs = this.childNodes;
          return chs[chs.length - 1] || null;
        }
      },
      lastElementChild: {
        get: function get() {
          var chs = this.children;
          return chs[chs.length - 1] || null;
        }
      },
      name: {
        get: function get() {
          return this.getAttribute('name');
        },
        set: function set(name) {
          this.setAttribute('name', name);
        }
      },
      outerHTML: {
        get: function get() {
          var attrs = this.attributes;
          var tag = this.tagName.toLowerCase();
          var str = '<' + tag;
          if (attrs) {
            var attrsLen = attrs.length;
            for (var a = 0; a < attrsLen; a++) {
              var attr = attrs[a];
              str += ' ' + (attr.nodeName || attr.name) + '="' + attr.nodeValue + '"';
            }
          }
          return str + '>' + this.innerHTML + ('</' + tag + '>');
        }
      },
      removeChild: {
        value: function value(refNode) {
          var fb = fallbackNodes.get(this);
          shouldAffectSlot$1(this) && removeChild.call(this, refNode);
          fb.splice(fb.indexOf(refNode), 1);
          return refNode;
        }
      },
      replaceChild: {
        value: function value(newNode, refNode) {
          var fb = fallbackNodes.get(this);
          shouldAffectSlot$1(this) && replaceChild.call(this, newNode, refNode);
          fb.splice(fb.indexOf(refNode), 1, newNode);
          return refNode;
        }
      },
      textContent: {
        get: function get() {
          return fallbackNodes.get(this).map(function (node) {
            return node.textContent;
          }).join('');
        },
        set: function set(textContent) {
          fallbackNodes.set(this, [document.createTextNode(textContent)]);
        }
      }
    };

    function polyfill$2(slot) {
      assignedNodes.set(slot, []);
      fallbackNodes.set(slot, getInitialFallbackContent(slot));
      fallbackState.set(slot, true);
      debouncedTriggerSlotChangeEvent.set(slot, debounce(triggerSlotChangeEvent));
      Object.defineProperties(slot, members$2);
    }

    function slotPolyfill (slot) {
      if (polyfilled$1.get(slot)) {
        return slot;
      }
      polyfill$2(slot);
      polyfilled$1.set(slot, true);
      return slot;
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

    // Takes the shadow root and caches the slots it has.
    function cacheSlots(root, node) {
      var oldSlots = slots.get(root);
      if (node.tagName === 'SLOT') {
        slotPolyfill(node);
        oldSlots[node.name || 'default'] = node;

        var host = hosts.get(root);
        var hostChs = host.childNodes;
        var hostChsLen = hostChs.length;
        for (var a = 0; a < hostChsLen; a++) {
          var ch = hostChs[a];
          if (!ch.assignedSlot) {
            distribute(ch);
          }
        }
      } else {
        var newSlots = node.querySelectorAll('slot');
        var newSlotsLen = newSlots.length;
        for (var a = 0; a < newSlotsLen; a++) {
          cacheSlots(root, newSlots[a]);
        }
      }
    }

    function uncacheSlots(root, node) {
      var oldSlots = slots.get(root);
      if (node.tagName === 'SLOT') {
        node.getAssignedNodes().forEach(function (aNode) {
          return undistribute(aNode);
        });
        delete oldSlots[node.name || 'default'];
      } else if (node.nodeType === 1) {
        var newSlots = node.querySelectorAll('slot');
        var newSlotsLen = newSlots.length;
        for (var a = 0; a < newSlotsLen; a++) {
          uncacheSlots(root, newSlots[a]);
        }
      }
    }

    var members = {
      appendChild: {
        configurable: true,
        value: function value(newNode) {
          var ret = appendChild.call(this, newNode);
          cacheSlots(this, newNode);
          return ret;
        }
      },
      host: {
        configurable: true,
        get: function get() {
          return hosts.get(this);
        }
      },
      innerHTML: {
        configurable: true,
        get: function get() {
          return htmlFromFrag(this);
        },
        set: function set(innerHTML) {
          var frag = fragFromHtml(innerHTML);
          while (frag.hasChildNodes()) {
            this.appendChild(frag.firstChild);
          }
        }
      },
      insertBefore: {
        configurable: true,
        value: function value(newNode, refNode) {
          var ret = insertBefore.call(this, newNode, refNode);
          cacheSlots(this, newNode);
          return ret;
        }
      },
      removeChild: {
        configurable: true,
        value: function value(refNode) {
          var ret = removeChild.call(this, refNode);
          uncacheSlots(this, refNode);
          return ret;
        }
      },
      replaceChild: {
        configurable: true,
        value: function value(newNode, refNode) {
          var ret = replaceChild.call(this, newNode, refNode);
          cacheSlots(this, newNode);
          uncacheSlots(this, refNode);
          return ret;
        }
      }
    };

    function polyfill (host) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var mode = _ref.mode;

      if (host.shadowRoot) {
        return host.shadowRoot;
      }

      var shadowRoot = createShadowRoot(host);
      var initialLightDom = createFragmentFromChildNodes(host);

      // Host and shadow root data.
      hosts.set(shadowRoot, host);
      roots.set(host, shadowRoot);
      slots.set(shadowRoot, {});

      // Emulating the spec { mode }.
      Object.defineProperty(host, 'shadowRoot', {
        configurable: true,
        get: function get() {
          return mode === 'open' ? shadowRoot : null;
        }
      });

      // The shadow root is actually the only child of the host.
      host.appendChild(shadowRoot);

      // Now polyfill the shadow root so that we can cache slots.
      Object.defineProperties(shadowRoot, members);

      // Polyfill the host.
      polyfill$1(host);

      // Finally, insert the initial light DOM content so it's distributed.
      host.appendChild(initialLightDom);

      return shadowRoot;
    }

    // Returns a document fragment of the childNodes of the specified element. Due
    // to the nature of the DOM, this will remove the nodes from the element.
    function createFragmentFromChildNodes$1(elem) {
      var frag = document.createDocumentFragment();
      while (elem.hasChildNodes()) {
        frag.appendChild(elem.firstChild);
      }
      return frag;
    }

    // Creates an shadow root, appends it to the element and returns it.
    function createShadowRoot$1(elem) {
      var root = document.createElement(isBlockLevel$1(elem) ? 'div' : 'span');
      elem.appendChild(root);
      return root;
    }

    // Returns whether or not the specified element is a block level element or not
    // We need this to determine the type of element the shadow root should be
    // since we must use real nodes to simulate a shadow root.
    function isBlockLevel$1(elem) {
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
          var initialLightDom = createFragmentFromChildNodes$1(elem);

          // Create a shadow ID so that it can be used to get a slot that is unique
          // to this shadow root. Since we don't polyfill querySelector() et al, we
          // need a way to be able to refer to slots that are unique to this
          // shadow root.
          elem.__shadowId = opts.shadowId;

          // Create the shadow root and return the light DOM. We must get the light
          // DOM before we template it so that we can distribute it after
          // polyfilling.
          elem.__shadowRoot = createShadowRoot$1(elem);

          // Render once we have the initial light DOM as this would likely blow
          // that away.
          fn(elem, elem.__shadowRoot);

          // Now polyfill so that we can distribute after.
          polyfill$1(elem);

          // Distribute the initial light DOM after polyfill so they get put into
          // the right spots.
          elem.appendChild(initialLightDom);
        }
      };
    }

    var version = '0.0.1';

    Element.prototype.attachShadow = function (opts) {
      return polyfill(this, opts);
    };



    var api = Object.freeze({
      default: polyfill,
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