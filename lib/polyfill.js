(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './internal/map/patch', './internal/map/slots', './internal/map/slots-default', './polyfilled'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./internal/map/patch'), require('./internal/map/slots'), require('./internal/map/slots-default'), require('./polyfilled'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.mapPatch, global.mapSlots, global.mapSlotsDefault, global.polyfilled);
    global.polyfill = mod.exports;
  }
})(this, function (exports, module, _internalMapPatch, _internalMapSlots, _internalMapSlotsDefault, _polyfilled) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _mapPatch = _interopRequireDefault(_internalMapPatch);

  var _mapSlots = _interopRequireDefault(_internalMapSlots);

  var _mapSlotsDefault = _interopRequireDefault(_internalMapSlotsDefault);

  var _polyfilled2 = _interopRequireDefault(_polyfilled);

  var prop = Object.defineProperty.bind(Object);

  // Helpers.

  function getSlot(elem, node) {
    var key = getSlotName(elem, node);
    var val = elem[key];
    return key && val ? { key: key, val: val.slice() } : null;
  }

  function getSlotName(elem, node) {
    return node.getAttribute && node.getAttribute('slot') || _mapSlotsDefault['default'].get(elem);
  }

  // TODO use in DOM manip methods to make them DocumentFragment compatible.
  function nodeToArray(node) {
    return node instanceof DocumentFragment ? [].slice.call(node.childNodes) : [node];
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

        return makeLikeNodeList((_mapSlots['default'].get(this) || []).reduce(function (prev, curr) {
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
        var slot = _mapSlotsDefault['default'].get(this);
        if (slot) {
          this[slot] = document.createTextNode(val);
        }
      }
    }
  };

  function doForNodesIfSlot(elem, node, func) {
    nodeToArray(node).forEach(function (node) {
      var slot = getSlot(elem, node);
      if (slot) {
        func(elem, node, slot);
      }
    });
  }

  // Method overrides.

  var funcs = {
    appendChild: function appendChild(newNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.val.push(node);
        elem[slot.key] = slot.val;
      });
      return newNode;
    },
    hasChildNodes: function hasChildNodes() {
      return this.childNodes.length > 0;
    },
    insertBefore: function insertBefore(newNode, refNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        var index = slot.val.indexOf(refNode);
        if (index === -1) {
          slot.val.push(node);
        } else {
          slot.val.splice(index, 0, node);
        }
        elem[slot.key] = slot.val;
      });
      return newNode;
    },
    removeChild: function removeChild(refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        var index = slot.val.indexOf(node);
        if (index !== -1) {
          slot.val.splice(index, 1);
          elem[slot.key] = slot.val;
        }
      });
      return refNode;
    },
    replaceChild: function replaceChild(newNode, refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        var index = slot.val.indexOf(refNode);
        if (index !== -1) {
          slot.val.splice(index, 1, newNode);
          elem[slot.key] = slot.val;
        }
      });
      return refNode;
    }
  };

  // Polyfills an element.

  module.exports = function (elem) {
    if ((0, _polyfilled2['default'])(elem)) {
      return;
    }

    for (var _name in props) {
      prop(elem, _name, props[_name]);
    }

    for (var _name2 in funcs) {
      elem[_name2] = funcs[_name2];
    }

    _mapPatch['default'].set(elem, true);
  };
});