(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.skatejsNamedSlots = factory());
}(this, function () {

    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

    function eachChildNode(node, func) {
      if (!node) {
        return;
      }

      var chs = node.childNodes;
      var chsLen = chs.length;
      for (var a = 0; a < chsLen; a++) {
        var ret = func(chs[a], a, chs);
        if (typeof ret !== 'undefined') {
          return ret;
        }
      }
    }

    function eachNodeOrFragmentNodes(node, func) {
      if (node instanceof DocumentFragment) {
        var chs = node.childNodes;
        var chsLen = chs.length;
        for (var a = 0; a < chsLen; a++) {
          func(chs[a], a);
        }
      } else {
        func(node, 0);
      }
    }

    // Any code referring to this is because it has to work around this bug in
    // WebKit: https://bugs.webkit.org/show_bug.cgi?id=49739
    var canPatchNativeAccessors = !!(Object.getOwnPropertyDescriptor(window.Node.prototype, 'parentNode') && Object.getOwnPropertyDescriptor(window.Node.prototype, 'parentNode').get);

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

    /**
     * See https://w3c.github.io/DOM-Parsing/#serializing
     * @param {TextNode}
     * @returns {string}
     */
    function getEscapedTextContent(textNode) {
      return textNode.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * @returns {string}
     * @param {commentNode}
     */
    function getCommentNodeOuterHtml(commentNode) {
      return "<!--" + commentNode.textContent + "-->";
    }

    var version = '0.0.1';

    var WeakMap = window.WeakMap || function () {
      var index = 0;
      function Wm() {
        this.key = '____weak_map_' + index++;
      }
      Wm.prototype = {
        delete: function _delete(obj) {
          if (obj) {
            delete obj[this.key];
          }
        },
        get: function get(obj) {
          return obj ? obj[this.key] : null;
        },
        has: function has(obj) {
          return obj ? typeof obj[this.key] !== 'undefined' : false;
        },
        set: function set(obj, val) {
          if (obj) {
            var key = this.key;
            if (typeof obj[key] === 'undefined') {
              Object.defineProperty(obj, key, {
                configurable: true,
                enumerable: false,
                value: val
              });
            } else {
              obj[key] = val;
            }
          }
        }
      };
      return Wm;
    }();

    var arrProto = Array.prototype;
    var forEach = arrProto.forEach;

    // We use a real DOM node for a shadow root. This is because the host node
    // basically becomes a virtual entry point for your element leaving the shadow
    // root the only thing that can receive instructions on how the host should
    // render to the browser.

    var defaultShadowRootTagName = '_shadow_root_';
    var defaultShadowRootTagNameUc = defaultShadowRootTagName.toUpperCase();

    // * WebKit only *
    //
    // These members we need cannot override as we require native access to their
    // original values at some point.
    var polyfillAtRuntime = ['childNodes', 'parentNode'];

    // These are the protos that we need to search for native descriptors on.
    var protos = ['Node', 'Element', 'EventTarget'];

    //some properties that should not be overridden in the Text prototype
    var doNotOverridePropertiesInTextNodes = ['textContent'];

    // Private data stores.
    var assignedToSlotMap = new WeakMap();
    var hostToModeMap = new WeakMap();
    var hostToRootMap = new WeakMap();
    var nodeToChildNodesMap = new WeakMap();
    var nodeToParentNodeMap = new WeakMap();
    var nodeToSlotMap = new WeakMap();
    var rootToHostMap = new WeakMap();
    var rootToSlotMap = new WeakMap();

    // * WebKit only *
    //
    // We require some way to parse HTML natively because we can't use the native
    // accessors.

    var parser = new DOMParser();
    function parse(html) {
      var tree = document.createElement('div');
      var parsed = parser.parseFromString('<div>' + html + '</div>', 'text/html').body.firstChild;
      while (parsed.hasChildNodes()) {
        var firstChild = parsed.firstChild;
        parsed.removeChild(firstChild);
        tree.appendChild(firstChild);
      }
      // Need to import the node to initialise the custom elements from the parser.
      return document.importNode(tree, true);
    }

    function staticProp(obj, name, value) {
      Object.defineProperty(obj, name, {
        configurable: true,
        get: function get() {
          return value;
        }
      });
    }

    // Slotting helpers.

    function arrayItem(idx) {
      return this[idx];
    }

    function makeLikeNodeList(arr) {
      arr.item = arrayItem;
      return arr;
    }

    function getNodeType(node) {
      if (isHostNode(node)) {
        return 'host';
      }

      if (isSlotNode(node)) {
        return 'slot';
      }

      if (isRootNode(node)) {
        return 'root';
      }

      return 'node';
    }

    function isHostNode(node) {
      return !!hostToRootMap.get(node);
    }

    function isSlotNode(node) {
      return node.tagName === 'SLOT';
    }

    function isRootNode(node) {
      return node.tagName === defaultShadowRootTagNameUc;
    }

    function findClosest(node, func) {
      while (node) {
        if (node === document) {
          break;
        }
        if (func(node)) {
          return node;
        }
        node = node.parentNode;
      }
    }

    function getSlotNameFromSlot(node) {
      return node.getAttribute && node.getAttribute('name') || 'default';
    }

    function getSlotNameFromNode(node) {
      return node.getAttribute && node.getAttribute('slot') || 'default';
    }

    function slotNodeIntoSlot(slot, node, insertBefore) {
      // Don't slot nodes that have content but are only whitespace. This is an
      // anomaly that I don't think the spec deals with.
      //
      // The problem is:
      //
      // - If you insert HTML with indentation into the page, there will be
      //   whitespace and if that's inserted it messes with fallback content
      //   calculation where there is formatting, but no meaningful content, so in
      //   theory it should fallback. Since you can attach a shadow root after we
      //   mean to insert an empty text node and have it "count", we can't really
      //   discard nodes that are considered formatting at the time of attachment.
      // - You can insert a text node and modify its text content later.
      //   Incremental DOM seems to do this. Every way I look at it, it seems
      //   problematic that we should have to screen for content, but I don't seems
      //   much of a way around it at the moment.
      if (node.nodeType === 3 && node.textContent && node.textContent.trim().length === 0) {
        return;
      }

      var assignedNodes = slot.getAssignedNodes();
      var shouldGoIntoContentMode = assignedNodes.length === 0;
      var slotInsertBeforeIndex = assignedNodes.indexOf(insertBefore);

      // Assign the slot to the node internally.
      nodeToSlotMap.set(node, slot);

      // Remove the fallback content and state if we're going into content mode.
      if (shouldGoIntoContentMode) {
        forEach.call(slot.childNodes, function (node) {
          return slot.__removeChild(node);
        });
      }

      if (slotInsertBeforeIndex > -1) {
        slot.__insertBefore(node, insertBefore);
        assignedNodes.splice(slotInsertBeforeIndex, 0, node);
      } else {
        slot.__appendChild(node);
        assignedNodes.push(node);
      }

      slot.____triggerSlotChangeEvent();
    }

    function slotNodeFromSlot(node) {
      var slot = node.assignedSlot;

      if (slot) {
        var assignedNodes = slot.getAssignedNodes();
        var index = assignedNodes.indexOf(node);

        if (index > -1) {
          var shouldGoIntoDefaultMode = assignedNodes.length === 1;

          assignedNodes.splice(index, 1);
          nodeToSlotMap.set(node, null);

          // Actually remove the child.
          slot.__removeChild(node);

          // If this was the last slotted node, then insert fallback content.
          if (shouldGoIntoDefaultMode) {
            forEach.call(slot.childNodes, function (node) {
              return slot.__appendChild(node);
            });
          }

          slot.____triggerSlotChangeEvent();
        }
      }
    }

    // Returns the index of the node in the host's childNodes.
    function indexOfNode(host, node) {
      var chs = host.childNodes;
      var chsLen = chs.length;
      for (var a = 0; a < chsLen; a++) {
        if (chs[a] === node) {
          return a;
        }
      }
      return -1;
    }

    // Adds the node to the list of childNodes on the host and fakes any necessary
    // information such as parentNode.
    function registerNode(host, node, insertBefore, func) {
      var index = indexOfNode(host, insertBefore);
      eachNodeOrFragmentNodes(node, function (eachNode, eachIndex) {
        func(eachNode, eachIndex);

        if (canPatchNativeAccessors) {
          nodeToParentNodeMap.set(eachNode, host);
        } else {
          staticProp(eachNode, 'parentNode', host);
        }

        if (index > -1) {
          arrProto.splice.call(host.childNodes, index + eachIndex, 0, eachNode);
        } else {
          arrProto.push.call(host.childNodes, eachNode);
        }
      });
    }

    // Cleans up registerNode().
    function unregisterNode(host, node, func) {
      var index = indexOfNode(host, node);
      if (index > -1) {
        func(node, 0);

        if (canPatchNativeAccessors) {
          nodeToParentNodeMap.set(node, null);
        } else {
          staticProp(node, 'parentNode', null);
        }

        arrProto.splice.call(host.childNodes, index, 1);
      }
    }

    function addNodeToNode(host, node, insertBefore) {
      registerNode(host, node, insertBefore, function (eachNode) {
        host.__insertBefore(eachNode, insertBefore);
      });
    }

    function addNodeToHost(host, node, insertBefore) {
      registerNode(host, node, insertBefore, function (eachNode) {
        var rootNode = hostToRootMap.get(host);
        var slotNodes = rootToSlotMap.get(rootNode);
        var slotNode = slotNodes[getSlotNameFromNode(eachNode)];
        if (slotNode) {
          slotNodeIntoSlot(slotNode, eachNode, insertBefore);
        }
      });
    }

    function addNodeToRoot(root, node, insertBefore) {
      eachNodeOrFragmentNodes(node, function (node) {
        if (isSlotNode(node)) {
          addSlotToRoot(root, node);
        } else {
          var slotNodes = node.querySelectorAll && node.querySelectorAll('slot');
          if (slotNodes) {
            var slotNodesLen = slotNodes.length;
            for (var a = 0; a < slotNodesLen; a++) {
              addSlotToRoot(root, slotNodes[a]);
            }
          }
        }
      });
      addNodeToNode(root, node, insertBefore);
    }

    // Adds a node to a slot. In other words, adds default content to a slot. It
    // ensures that if the slot doesn't have any assigned nodes yet, that the node
    // is actually displayed, otherwise it's just registered as child content.
    function addNodeToSlot(slot, node, insertBefore) {
      var isInDefaultMode = slot.getAssignedNodes().length === 0;
      registerNode(slot, node, insertBefore, function (eachNode) {
        if (isInDefaultMode) {
          slot.__insertBefore(eachNode, insertBefore);
        }
      });
    }

    // Removes a node from a slot (default content). It ensures that if the slot
    // doesn't have any assigned nodes yet, that the node is actually removed,
    // otherwise it's just unregistered.
    function removeNodeFromSlot(slot, node) {
      var isInDefaultMode = slot.getAssignedNodes().length === 0;
      unregisterNode(slot, node, function () {
        if (isInDefaultMode) {
          slot.__removeChild(node);
        }
      });
    }

    function addSlotToRoot(root, slot) {
      var slotName = getSlotNameFromSlot(slot);

      // Ensure a slot node's childNodes are overridden at the earliest point
      // possible for WebKit.
      if (!canPatchNativeAccessors && !slot.childNodes.push) {
        staticProp(slot, 'childNodes', []);
      }

      rootToSlotMap.get(root)[slotName] = slot;
      eachChildNode(rootToHostMap.get(root), function (eachNode) {
        if (!eachNode.assignedSlot && slotName === getSlotNameFromNode(eachNode)) {
          slotNodeIntoSlot(slot, eachNode);
        }
      });
    }

    function removeNodeFromNode(host, node) {
      unregisterNode(host, node, function () {
        host.__removeChild(node);
      });
    }

    function removeNodeFromHost(host, node) {
      unregisterNode(host, node, function () {
        slotNodeFromSlot(node);
      });
    }

    function removeNodeFromRoot(root, node) {
      unregisterNode(root, node, function () {
        if (isSlotNode(node)) {
          removeSlotFromRoot(root, node);
        } else {
          var nodes = node.querySelectorAll && node.querySelectorAll('slot');
          for (var a = 0; a < nodes.length; a++) {
            removeSlotFromRoot(root, nodes[a]);
          }
        }
      });
    }

    function removeSlotFromRoot(root, node) {
      node.getAssignedNodes().forEach(slotNodeFromSlot);
      delete rootToSlotMap.get(root)[getSlotNameFromSlot(node)];
    }

    // TODO terribly inefficient
    function getRootNode(host) {
      if (isRootNode(host)) {
        return host;
      } else {
        if (!host.parentNode) {
          return;
        }

        return getRootNode(host.parentNode);
      }
    }

    function appendChildOrInsertBefore(host, newNode, refNode) {
      var nodeType = getNodeType(host);
      var parentNode = newNode.parentNode;
      var rootNode = getRootNode(host);

      // Ensure childNodes is patched so we can manually update it for WebKit.
      if (!canPatchNativeAccessors && !host.childNodes.push) {
        staticProp(host, 'childNodes', []);
      }

      if (rootNode && getNodeType(newNode) === 'slot') {
        addSlotToRoot(rootNode, newNode);
      }

      // If we append a child to a host, the host tells the shadow root to distribute
      // it. If the root decides it doesn't need to be distributed, it is never
      // removed from the old parent because in polyfill land we store a reference
      // to the node but we don't move it. Due to that, we must explicitly remove the
      // node from its old parent.
      if (parentNode && getNodeType(parentNode) === 'host') {
        if (canPatchNativeAccessors) {
          nodeToParentNodeMap.set(newNode, null);
        } else {
          staticProp(newNode, 'parentNode', null);
        }
      }

      if (nodeType === 'node') {
        if (canPatchNativeAccessors) {
          return host.__insertBefore(newNode, refNode);
        } else {
          return addNodeToNode(host, newNode, refNode);
        }
      }

      if (nodeType === 'slot') {
        return addNodeToSlot(host, newNode, refNode);
      }

      if (nodeType === 'host') {
        return addNodeToHost(host, newNode, refNode);
      }

      if (nodeType === 'root') {
        return addNodeToRoot(host, newNode, refNode);
      }
    }

    var members = {
      // For testing purposes.
      ____assignedNodes: {
        get: function get() {
          return this.______assignedNodes || (this.______assignedNodes = []);
        }
      },

      // For testing purposes.
      ____isInFallbackMode: {
        get: function get() {
          return this.getAssignedNodes().length === 0;
        }
      },

      ____slotChangeListeners: {
        get: function get() {
          if (typeof this.______slotChangeListeners === 'undefined') {
            this.______slotChangeListeners = 0;
          }
          return this.______slotChangeListeners;
        },
        set: function set(value) {
          this.______slotChangeListeners = value;
        }
      },
      ____triggerSlotChangeEvent: {
        value: debounce(function () {
          if (this.____slotChangeListeners) {
            this.dispatchEvent(new CustomEvent('slotchange', {
              bubbles: false,
              cancelable: false
            }));
          }
        })
      },
      addEventListener: {
        value: function value(name, func, opts) {
          if (name === 'slotchange' && isSlotNode(this)) {
            this.____slotChangeListeners++;
          }
          return this.__addEventListener(name, func, opts);
        }
      },
      appendChild: {
        value: function value(newNode) {
          return appendChildOrInsertBefore(this, newNode);
        }
      },
      assignedSlot: {
        get: function get() {
          return nodeToSlotMap.get(this) || null;
        }
      },
      attachShadow: {
        value: function value(opts) {
          var _this = this;

          var mode = opts && opts.mode;
          if (mode !== 'closed' && mode !== 'open') {
            throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
          }

          // Return the existing shadow root if it exists.
          var existingShadowRoot = hostToRootMap.get(this);
          if (existingShadowRoot) {
            return existingShadowRoot;
          }

          var lightNodes = makeLikeNodeList([].slice.call(this.childNodes));
          var shadowRoot = document.createElement(opts.polyfillShadowRootTagName || defaultShadowRootTagName);

          // Host and shadow root data.
          hostToModeMap.set(this, mode);
          hostToRootMap.set(this, shadowRoot);
          rootToHostMap.set(shadowRoot, this);
          rootToSlotMap.set(shadowRoot, {});

          if (canPatchNativeAccessors) {
            nodeToChildNodesMap.set(this, lightNodes);
          } else {
            staticProp(this, 'childNodes', lightNodes);
          }

          // Process light DOM.
          lightNodes.forEach(function (node) {
            // Existing children should be removed from being displayed, but still
            // appear to be child nodes. This is how light DOM works; they're still
            // child nodes but not in the composed DOM yet as there won't be any
            // slots for them to go into.
            _this.__removeChild(node);

            // We must register the parentNode here as this has the potential to
            // become out of sync if the node is moved before being slotted.
            if (canPatchNativeAccessors) {
              nodeToParentNodeMap.set(node, _this);
            } else {
              staticProp(node, 'parentNode', _this);
            }
          });

          // The shadow root is actually the only child of the host.
          return this.__appendChild(shadowRoot);
        }
      },
      childElementCount: {
        get: function get() {
          return this.children.length;
        }
      },
      childNodes: {
        get: function get() {
          if (canPatchNativeAccessors && getNodeType(this) === 'node') {
            return this.__childNodes;
          }
          var childNodes = nodeToChildNodesMap.get(this);
          childNodes || nodeToChildNodesMap.set(this, childNodes = makeLikeNodeList([]));
          return childNodes;
        }
      },
      children: {
        get: function get() {
          var chs = [];
          eachChildNode(this, function (node) {
            if (node.nodeType === 1) {
              chs.push(node);
            }
          });
          return makeLikeNodeList(chs);
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
          if (isSlotNode(this)) {
            var assigned = assignedToSlotMap.get(this);
            assigned || assignedToSlotMap.set(this, assigned = []);
            return assigned;
          }
        }
      },
      hasChildNodes: {
        value: function value() {
          return this.childNodes.length > 0;
        }
      },
      innerHTML: {
        get: function get() {
          var innerHTML = '';

          var getHtmlNodeOuterHtml = function getHtmlNodeOuterHtml(node) {
            return node.outerHTML;
          };
          var getOuterHtmlByNodeType = {
            1: getHtmlNodeOuterHtml,
            3: getEscapedTextContent,
            8: getCommentNodeOuterHtml
          };

          eachChildNode(this, function (node) {
            var getOuterHtml = getOuterHtmlByNodeType[node.nodeType] || getHtmlNodeOuterHtml;
            innerHTML += getOuterHtml(node);
          });
          return innerHTML;
        },
        set: function set(innerHTML) {
          var parsed = parse(innerHTML);

          while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
          }

          while (parsed.hasChildNodes()) {
            var firstChild = parsed.firstChild;

            // When we polyfill everything on HTMLElement.prototype, we overwrite
            // properties. This makes it so that parentNode reports null even though
            // it's actually a parent of the HTML parser. For this reason,
            // cleanNode() won't work and we must manually remove it from the
            // parser before it is moved to the host just in case it's added as a
            // light node but not assigned to a slot.
            parsed.removeChild(firstChild);

            this.appendChild(firstChild);
          }
        }
      },
      insertBefore: {
        value: function value(newNode, refNode) {
          return appendChildOrInsertBefore(this, newNode, refNode);
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
      name: {
        get: function get() {
          return this.getAttribute('name');
        },
        set: function set(name) {
          return this.setAttribute('name', name);
        }
      },
      nextSibling: {
        get: function get() {
          var host = this;
          return eachChildNode(this.parentNode, function (child, index, nodes) {
            if (host === child) {
              return nodes[index + 1] || null;
            }
          });
        }
      },
      nextElementSibling: {
        get: function get() {
          var host = this;
          var found = void 0;
          return eachChildNode(this.parentNode, function (child) {
            if (found && child.nodeType === 1) {
              return child;
            }
            if (host === child) {
              found = true;
            }
          });
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
      parentElement: {
        get: function get() {
          return findClosest(this.parentNode, function (node) {
            return node.nodeType === 1;
          });
        }
      },
      parentNode: {
        get: function get() {
          return nodeToParentNodeMap.get(this) || this.__parentNode || null;
        }
      },
      previousSibling: {
        get: function get() {
          var host = this;
          return eachChildNode(this.parentNode, function (child, index, nodes) {
            if (host === child) {
              return nodes[index - 1] || null;
            }
          });
        }
      },
      previousElementSibling: {
        get: function get() {
          var host = this;
          var found = void 0;
          return eachChildNode(this.parentNode, function (child) {
            if (found && host === child) {
              return found;
            }
            if (child.nodeType === 1) {
              found = child;
            }
          });
        }
      },
      removeChild: {
        value: function value(refNode) {
          var nodeType = getNodeType(this);

          if (nodeType === 'node') {
            if (canPatchNativeAccessors) {
              return this.__removeChild(refNode);
            } else {
              return removeNodeFromNode(this, refNode);
            }
          }

          if (nodeType === 'slot') {
            return removeNodeFromSlot(this, refNode);
          }

          if (nodeType === 'host') {
            return removeNodeFromHost(this, refNode);
          }

          if (nodeType === 'root') {
            return removeNodeFromRoot(this, refNode);
          }
        }
      },
      removeEventListener: {
        value: function value(name, func, opts) {
          if (name === 'slotchange' && this.____slotChangeListeners && isSlotNode(this)) {
            this.____slotChangeListeners--;
          }
          return this.__removeEventListener(name, func, opts);
        }
      },
      replaceChild: {
        value: function value(newNode, refNode) {
          this.insertBefore(newNode, refNode);
          return this.removeChild(refNode);
        }
      },
      shadowRoot: {
        get: function get() {
          return hostToModeMap.get(this) === 'open' ? hostToRootMap.get(this) : null;
        }
      },
      textContent: {
        get: function get() {
          var textContent = '';
          eachChildNode(this, function (node) {
            if (node.nodeType !== Node.COMMENT_NODE) {
              textContent += node.textContent;
            }
          });
          return textContent;
        },
        set: function set(textContent) {
          while (this.hasChildNodes()) {
            this.removeChild(this.firstChild);
          }
          if (!textContent) {
            return;
          }
          this.appendChild(document.createTextNode(textContent));
        }
      }
    };

    function findDescriptorFor(name) {
      for (var a = 0; a < protos.length; a++) {
        var ctor = window[protos[a]];
        if (!ctor) {
          continue;
        }
        var proto = ctor.prototype;
        if (proto.hasOwnProperty(name)) {
          return Object.getOwnPropertyDescriptor(proto, name);
        }
      }
    }

    if (!('attachShadow' in document.createElement('div'))) {
      (function () {
        var elementProto = HTMLElement.prototype;
        var textProto = Text.prototype;
        Object.keys(members).forEach(function (memberName) {
          var memberProperty = members[memberName];

          // All properties should be configurable.
          memberProperty.configurable = true;
          // Applying to the data properties only since we can't have writable accessor properties
          if (memberProperty.hasOwnProperty('value')) {
            memberProperty.writable = true;
          }

          // Polyfill as much as we can and work around WebKit in other areas.
          if (canPatchNativeAccessors || polyfillAtRuntime.indexOf(memberName) === -1) {
            var nativeDescriptor = findDescriptorFor(memberName);
            Object.defineProperty(elementProto, memberName, memberProperty);
            var isDefinedInTextProto = memberName in textProto;
            var shouldOverrideInTextNode = doNotOverridePropertiesInTextNodes.indexOf(memberName) === -1;
            if (isDefinedInTextProto && shouldOverrideInTextNode) {
              Object.defineProperty(textProto, memberName, memberProperty);
            }
            if (nativeDescriptor && nativeDescriptor.configurable) {
              Object.defineProperty(elementProto, '__' + memberName, nativeDescriptor);
              if (isDefinedInTextProto && shouldOverrideInTextNode) {
                Object.defineProperty(textProto, '__' + memberName, nativeDescriptor);
              }
            }
          }
        });
      })();
    }



    var api = Object.freeze({
      default: version
    });

    var previousGlobal = window.skatejsNamedSlots;
    version.noConflict = function noConflict() {
      window.skatejsNamedSlots = previousGlobal;
      return this;
    };
    window.skatejsNamedSlots = version;
    for (var name in api) {
      version[name] = api[name];
    }
    version.version = '0.1.8';

    return version;

}));
//# sourceMappingURL=index.js.map