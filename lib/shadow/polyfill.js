(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['debounce', '../util/each'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('debounce'), require('../util/each'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.debounce, global.each);
    global.polyfill = mod.exports;
  }
})(this, function (_debounce, _each) {
  'use strict';

  var _debounce2 = _interopRequireDefault(_debounce);

  var _each2 = _interopRequireDefault(_each);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var defaultShadowRootTagName = '_shadow_root_';
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

  function arrayItem(idx) {
    return this[idx];
  }

  function makeLikeNodeList(arr) {
    arr.item = arrayItem;
    return arr;
  }

  function cleanNode(node) {
    var parent = node.parentNode;

    if (parent) {
      parent.removeChild(node);
    }
  }

  function isHostNode(node) {
    return !!node.____rootNode;
  }

  function isShadowNode(node) {
    return !!node.____hostNode;
  }

  function isSlotNode(node) {
    return node.tagName === 'SLOT';
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

  function findClosestShadowRoot(node) {
    return findClosest(node, isShadowNode);
  }

  function staticProp(node, prop, value) {
    Object.defineProperty(node, prop, {
      configurable: true,
      get: function get() {
        return value;
      }
    });
  }

  function getSlotNameFromSlot(node) {
    return node.getAttribute && node.getAttribute('name') || 'default';
  }

  function getSlotNameFromNode(node) {
    return node.getAttribute && node.getAttribute('slot') || 'default';
  }

  function slotNodeIntoSlot(slot, node, insertBefore) {
    var slotInsertBeforeIndex = slot.____assignedNodes.indexOf(insertBefore);

    var assignedNodes = slot.____assignedNodes;
    var fallbackNodes = slot.childNodes;
    staticProp(node, 'assignedSlot', slot);

    if (!assignedNodes.length) {
      slot.____isInFallbackMode = false;
      fallbackNodes.forEach(function (fallbackNode) {
        return slot.__removeChild(fallbackNode);
      });
    }

    if (slotInsertBeforeIndex > -1) {
      if (!slot.____isInFallbackMode) {
        slot.__insertBefore(node, insertBefore);
      }

      assignedNodes.splice(slotInsertBeforeIndex, 0, node);
    } else {
      if (!slot.____isInFallbackMode) {
        slot.__appendChild(node);
      }

      assignedNodes.push(node);
    }

    slot.____triggerSlotChangeEvent();
  }

  function slotNodeFromSlot(node) {
    var slot = node.assignedSlot;

    if (slot) {
      var index = slot.____assignedNodes.indexOf(node);

      if (index > -1) {
        var assignedNodes = slot.____assignedNodes;
        assignedNodes.splice(index, 1);
        staticProp(node, 'assignedSlot', null);

        if (!slot.____isInFallbackMode) {
          slot.__removeChild(node);
        }

        if (!assignedNodes.length) {
          slot.____isInFallbackMode = true;
          slot.childNodes.forEach(function (fallbackNode) {
            return slot.__appendChild(fallbackNode);
          });
        }

        slot.____triggerSlotChangeEvent();
      }
    }
  }

  function registerNode(host, node, insertBefore, func) {
    var index = host.childNodes.indexOf(insertBefore);
    (0, _each2.default)(node, function (eachNode, eachIndex) {
      func(eachNode, eachIndex);
      staticProp(eachNode, 'parentNode', host);

      if (index > -1) {
        host.childNodes.splice(index + eachIndex, 0, eachNode);
      } else {
        host.childNodes.push(eachNode);
      }
    });
  }

  function unregisterNode(host, node, func) {
    var index = host.childNodes.indexOf(node);

    if (index > -1) {
      func(node, 0);
      staticProp(node, 'parentNode', null);
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
      var slotNode = host.____rootNode.____slotNodes[getSlotNameFromNode(eachNode)];

      if (slotNode) {
        slotNodeIntoSlot(slotNode, eachNode, insertBefore);
      }
    });
  }

  function addNodeToRoot(root, node, insertBefore) {
    (0, _each2.default)(node, function (node) {
      if (isSlotNode(node)) {
        addSlotToRoot(root, node);
      } else {
        var slotNodes = node.querySelectorAll && node.querySelectorAll('slot');
        var slotNodesLen = slotNodes.length;

        for (var a = 0; a < slotNodesLen; a++) {
          addSlotToRoot(root, slotNodes[a]);
        }
      }
    });
    addNodeToNode(root, node, insertBefore);
  }

  function addSlotToRoot(root, node) {
    var slotName = getSlotNameFromSlot(node);
    node.____isInFallbackMode = true;
    root.____slotNodes[slotName] = node;

    root.____hostNode.childNodes.forEach(function (eachNode) {
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
    node.____assignedNodes.forEach(slotNodeFromSlot);

    delete root.____slotNodes[getSlotNameFromSlot(node)];
  }

  function appendChildOrInsertBefore(host, newNode, refNode) {
    var closestRoot = undefined;
    cleanNode(newNode);

    if (isHostNode(host)) {
      addNodeToHost(host, newNode, refNode);
    } else if (isSlotNode(host)) {
      addNodeToNode(host, newNode, refNode);
    } else if (closestRoot = findClosestShadowRoot(host)) {
      addNodeToRoot(closestRoot, newNode, refNode);
    } else {
      addNodeToNode(host, newNode, refNode);
    }
  }

  var members = {
    ____assignedNodes: {
      get: function get() {
        return this.______assignedNodes || (this.______assignedNodes = []);
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
        if (name === 'slotchange') {
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
        return null;
      }
    },
    attachShadow: {
      value: function value(opts) {
        var mode = opts && opts.mode;

        if (mode !== 'closed' && mode !== 'open') {
          throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
        }

        var existingShadowRoot = this.____shadowRoot;

        if (existingShadowRoot) {
          return existingShadowRoot;
        }

        var shadowRoot = document.createElement(opts.polyfillShadowRootTagName || defaultShadowRootTagName);
        Object.defineProperty(this, 'shadowRoot', {
          configurable: true,
          get: function get() {
            return mode === 'open' ? shadowRoot : null;
          }
        });
        this.____rootNode = shadowRoot;
        this.____unslottedNodes = this.childNodes.concat();
        shadowRoot.____hostNode = this;
        shadowRoot.____slotNodes = [];
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
        return this.____childNodes || (this.____childNodes = makeLikeNodeList([]));
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
    getAssignedNodes: {
      value: function value() {
        return this.____assignedNodes || [];
      }
    },
    hasChildNodes: {
      value: function value() {
        return this.childNodes.length > 0;
      }
    },
    innerHTML: {
      get: function get() {
        return this.childNodes.reduce(function (prev, curr) {
          return prev + (curr.nodeType === 1 ? curr.outerHTML : curr.textContent);
        }, '');
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
        var parentNode = this.parentNode;

        if (parent) {
          var childNodes = parentNode.childNodes;
          return childNodes[childNodes.indexOf(this) + 1] || null;
        }

        return null;
      }
    },
    nextElementSibling: {
      get: function get() {
        var nextSibling = this;

        while (nextSibling = nextSibling.nextSibling) {
          if (nextSibling.nodeType === 1) {
            return nextSibling;
          }
        }

        return null;
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
    previousSibling: {
      get: function get() {
        var parentNode = this.parentNode;

        if (parent) {
          var childNodes = parentNode.childNodes;
          return childNodes[childNodes.indexOf(this) - 1] || null;
        }

        return null;
      }
    },
    previousElementSibling: {
      get: function get() {
        var previousSibling = this;

        while (previousSibling = previousSibling.previousSibling) {
          if (previousSibling.nodeType === 1) {
            return previousSibling;
          }
        }

        return null;
      }
    },
    removeChild: {
      value: function value(refNode) {
        var closestRoot = undefined;

        if (isHostNode(this)) {
          removeNodeFromHost(this, refNode);
        } else if (isSlotNode(this)) {
          removeNodeFromNode(this, refNode);
        } else if (closestRoot = findClosestShadowRoot(this)) {
          removeNodeFromRoot(closestRoot, refNode);
        } else {
          removeNodeFromNode(this, refNode);
        }
      }
    },
    removeEventListener: {
      value: function value(name, func, opts) {
        if (name === 'slotchange' && this.____slotChangeListeners) {
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
  var protos = [Node, Element, EventTarget];

  function findDescriptorFor(name) {
    for (var a = 0; a < protos.length; a++) {
      var proto = protos[a].prototype;

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
        var nativeDescriptor = findDescriptorFor(memberName);
        memberProperty.configurable = true;
        Object.defineProperty(elementProto, memberName, memberProperty);

        if (nativeDescriptor && nativeDescriptor.configurable) {
          Object.defineProperty(elementProto, '__' + memberName, nativeDescriptor);
        }
      });
    })();
  }
});