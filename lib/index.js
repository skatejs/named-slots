(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './util/each', './util/can-patch-native-accessors', 'debounce', './version', './util/weak-map'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./util/each'), require('./util/can-patch-native-accessors'), require('debounce'), require('./version'), require('./util/weak-map'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.each, global.canPatchNativeAccessors, global.debounce, global.version, global.weakMap);
    global.index = mod.exports;
  }
})(this, function (module, exports, _each, _canPatchNativeAccessors, _debounce, _version, _weakMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _canPatchNativeAccessors2 = _interopRequireDefault(_canPatchNativeAccessors);

  var _debounce2 = _interopRequireDefault(_debounce);

  var _version2 = _interopRequireDefault(_version);

  var _weakMap2 = _interopRequireDefault(_weakMap);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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

  // Private data stores.
  var assignedToSlotMap = new _weakMap2.default();
  var hostToModeMap = new _weakMap2.default();
  var hostToRootMap = new _weakMap2.default();
  var nodeToChildNodesMap = new _weakMap2.default();
  var nodeToParentNodeMap = new _weakMap2.default();
  var nodeToSlotMap = new _weakMap2.default();
  var rootToHostMap = new _weakMap2.default();
  var rootToSlotMap = new _weakMap2.default();
  var slotToModeMap = new _weakMap2.default();

  // * WebKit only *
  //
  // We require some way to parse HTML natively because we can't use the native
  // accessors.
  //
  // We must create the elements manually, as they will not get initialised as
  // custom elements if we parse it as text/html

  var parser = new DOMParser();

  function createElements(node) {
    var nodeType = node.nodeType;

    if (nodeType === 1) {
      var copy = document.createElement(node.tagName);
      for (var a = 0; a < node.attributes.length; a++) {
        var attr = node.attributes[a];
        copy.setAttribute(attr.name, attr.value);
      }
      for (var _a = 0; _a < node.childNodes.length; _a++) {
        var childNode = node.childNodes[_a];
        copy.appendChild(createElements(childNode));
      }
      return copy;
    }
    return node.cloneNode();
  }

  function parse(html) {
    var tree = document.createElement('div');
    var parsed = parser.parseFromString(html, 'text/html').body;
    while (parsed.hasChildNodes()) {
      var firstChild = parsed.firstChild;
      parsed.removeChild(firstChild);
      tree.appendChild(createElements(firstChild));
    }
    return tree;
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
    var assignedNodes = slot.getAssignedNodes();
    var slotInsertBeforeIndex = assignedNodes.indexOf(insertBefore);

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

    nodeToSlotMap.set(node, slot);

    // If there's currently no assigned nodes, there will be, so remove all fallback content.
    if (!assignedNodes.length) {
      slotToModeMap.set(slot, false);
      [].slice.call(slot.childNodes).forEach(function (fallbackNode) {
        return slot.__removeChild(fallbackNode);
      });
    }

    var shouldAffectSlot = !slotToModeMap.get(slot);

    if (slotInsertBeforeIndex > -1) {
      if (shouldAffectSlot) {
        slot.__insertBefore(node, insertBefore);
      }

      assignedNodes.splice(slotInsertBeforeIndex, 0, node);
    } else {
      if (shouldAffectSlot) {
        slot.__appendChild(node);
      }

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
        assignedNodes.splice(index, 1);
        nodeToSlotMap.set(node, null);

        var shouldAffectSlot = !slotToModeMap.get(slot);

        // We only update the actual DOM representation if we're displaying
        // slotted nodes.
        if (shouldAffectSlot) {
          slot.__removeChild(node);
        }

        // If this was the last slotted node, then insert fallback content.
        if (!assignedNodes.length) {
          slotToModeMap.set(slot, true);
          (0, _each.eachChildNode)(slot, function (node) {
            slot.__appendChild(node);
          });
        }

        slot.____triggerSlotChangeEvent();
      }
    }
  }

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
    (0, _each.eachNodeOrFragmentNodes)(node, function (eachNode, eachIndex) {
      func(eachNode, eachIndex);

      if (_canPatchNativeAccessors2.default) {
        nodeToParentNodeMap.set(eachNode, host);
      } else {
        staticProp(eachNode, 'parentNode', host);
      }

      if (index > -1) {
        host.childNodes.splice(index + eachIndex, 0, eachNode);
      } else {
        host.childNodes.push(eachNode);
      }
    });
  }

  // Cleans up registerNode().
  function unregisterNode(host, node, func) {
    var index = indexOfNode(host, node);
    if (index > -1) {
      func(node, 0);

      if (_canPatchNativeAccessors2.default) {
        nodeToParentNodeMap.set(node, null);
      } else {
        staticProp(node, 'parentNode', null);
      }

      host.childNodes.splice(index, 1);
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
    (0, _each.eachNodeOrFragmentNodes)(node, function (node) {
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

  function addSlotToRoot(root, node) {
    var slotName = getSlotNameFromSlot(node);
    slotToModeMap.set(node, true);
    rootToSlotMap.get(root)[slotName] = node;
    (0, _each.eachChildNode)(rootToHostMap.get(root), function (eachNode) {
      if (!eachNode.assignedSlot && slotName === getSlotNameFromNode(eachNode)) {
        slotNodeIntoSlot(node, eachNode);
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

  function getRootNode(host) {
    //TODO terribly inefficient
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

    if (rootNode && getNodeType(newNode) === 'slot') {
      addSlotToRoot(rootNode, newNode);
    }

    if (!_canPatchNativeAccessors2.default && !host.childNodes.push) {
      staticProp(host, 'childNodes', []);
    }

    // If we append a child to a host, the host tells the shadow root to distribute
    // it. If the root decides it doesn't need to be distributed, it is never
    // removed from the old parent because in polyfill land we store a reference
    // to the node but we don't move it. Due to that, we must explicitly remove the
    // node from its old parent.
    if (parentNode && getNodeType(parentNode) === 'host') {
      if (_canPatchNativeAccessors2.default) {
        nodeToParentNodeMap.set(newNode, null);
      } else {
        staticProp(newNode, 'parentNode', null);
      }
    }

    if (nodeType === 'node') {
      if (_canPatchNativeAccessors2.default) {
        return host.__insertBefore(newNode, refNode);
      } else {
        return addNodeToNode(host, newNode, refNode);
      }
    }

    if (nodeType === 'slot') {
      return addNodeToNode(host, newNode, refNode);
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
        return slotToModeMap.get(this);
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
      value: (0, _debounce2.default)(function () {
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

        if (_canPatchNativeAccessors2.default) {
          nodeToChildNodesMap.set(this, lightNodes);
        } else {
          staticProp(this, 'childNodes', lightNodes);
        }

        // Existing children should be removed from being displayed, but still
        // appear to be child nodes. This is how light DOM works; they're still
        // child nodes but not in the composed DOM yet as there won't be any
        // slots for them to go into.
        (0, _each.eachChildNode)(this, function (node) {
          return _this.__removeChild(node);
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
        if (_canPatchNativeAccessors2.default && getNodeType(this) === 'node') {
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
        (0, _each.eachChildNode)(this, function (node) {
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
        (0, _each.eachChildNode)(this, function (node) {
          innerHTML += node.nodeType === 1 ? node.outerHTML : node.textContent;
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
        return (0, _each.eachChildNode)(this.parentNode, function (child, index, nodes) {
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
        return (0, _each.eachChildNode)(this.parentNode, function (child) {
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
        return (0, _each.eachChildNode)(this.parentNode, function (child, index, nodes) {
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
        return (0, _each.eachChildNode)(this.parentNode, function (child) {
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
          if (_canPatchNativeAccessors2.default) {
            return this.__removeChild(refNode);
          } else {
            return removeNodeFromNode(this, refNode);
          }
        }

        if (nodeType === 'slot') {
          return removeNodeFromNode(this, refNode);
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
        (0, _each.eachChildNode)(this, function (node) {
          textContent += node.textContent;
        });
        return textContent;
      },
      set: function set(textContent) {
        while (this.hasChildNodes()) {
          this.removeChild(this.firstChild);
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
      Object.keys(members).forEach(function (memberName) {
        var memberProperty = members[memberName];

        // All properties should be configurable.
        memberProperty.configurable = true;

        // Polyfill as much as we can and work around WebKit in other areas.
        if (_canPatchNativeAccessors2.default || polyfillAtRuntime.indexOf(memberName) === -1) {
          var nativeDescriptor = findDescriptorFor(memberName);
          Object.defineProperty(elementProto, memberName, memberProperty);
          if (nativeDescriptor && nativeDescriptor.configurable) {
            Object.defineProperty(elementProto, '__' + memberName, nativeDescriptor);
          }
        }
      });
    })();
  }

  exports.default = _version2.default;
  module.exports = exports['default'];
});