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

  var defaultShadowRootTagName = '_shadow_root_';
  var defaultShadowRootTagNameUc = defaultShadowRootTagName.toUpperCase();
  var polyfilAtRuntime = ['childNodes', 'parentNode'];
  var protos = ['Node', 'Element', 'EventTarget'];
  var assignedToSlotMap = new _weakMap2.default();
  var hostToModeMap = new _weakMap2.default();
  var hostToRootMap = new _weakMap2.default();
  var nodeToChildNodesMap = new _weakMap2.default();
  var nodeToParentNodeMap = new _weakMap2.default();
  var nodeToSlotMap = new _weakMap2.default();
  var rootToHostMap = new _weakMap2.default();
  var rootToSlotMap = new _weakMap2.default();
  var slotToModeMap = new _weakMap2.default();
  var parser = new DOMParser();

  function convertXmlToHtml(node) {
    var nodeType = node.nodeType;

    if (nodeType === 1) {
      var copy = document.createElement(node.tagName);

      for (var a = 0; a < node.attributes.length; a++) {
        var attr = node.attributes[a];
        copy.setAttribute(attr.name, attr.value);
      }

      for (var a = 0; a < node.childNodes.length; a++) {
        var childNode = node.childNodes[a];
        copy.appendChild(convertXmlToHtml(childNode));
      }

      return copy;
    }

    return node;
  }

  function parse(html) {
    var tree = document.createElement('div');
    var parsed = parser.parseFromString(html, 'text/xml');

    while (parsed.hasChildNodes()) {
      var firstChild = parsed.firstChild;
      parsed.removeChild(firstChild);
      tree.appendChild(convertXmlToHtml(firstChild));
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
    nodeToSlotMap.set(node, slot);

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

        if (shouldAffectSlot) {
          slot.__removeChild(node);
        }

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

  function appendChildOrInsertBefore(host, newNode, refNode) {
    var nodeType = getNodeType(host);
    var parentNode = newNode.parentNode;

    if (!_canPatchNativeAccessors2.default && !host.childNodes.push) {
      staticProp(host, 'childNodes', []);
    }

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
    ____assignedNodes: {
      get: function get() {
        return this.______assignedNodes || (this.______assignedNodes = []);
      }
    },
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

        var existingShadowRoot = hostToRootMap.get(this);

        if (existingShadowRoot) {
          return existingShadowRoot;
        }

        var lightNodes = makeLikeNodeList([].slice.call(this.childNodes));
        var shadowRoot = document.createElement(opts.polyfillShadowRootTagName || defaultShadowRootTagName);
        hostToModeMap.set(this, mode);
        hostToRootMap.set(this, shadowRoot);
        rootToHostMap.set(shadowRoot, this);
        rootToSlotMap.set(shadowRoot, {});

        if (_canPatchNativeAccessors2.default) {
          nodeToChildNodesMap.set(this, lightNodes);
        } else {
          staticProp(this, 'childNodes', lightNodes);
        }

        (0, _each.eachChildNode)(this, function (node) {
          return _this.__removeChild(node);
        });
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
        var found = undefined;
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
        var found = undefined;
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
        memberProperty.configurable = true;

        if (_canPatchNativeAccessors2.default || polyfilAtRuntime.indexOf(memberName) === -1) {
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