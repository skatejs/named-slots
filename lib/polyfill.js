(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './internal/map/patch', './internal/map/slots', './internal/map/slots-default', './polyfilled'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./internal/map/patch'), require('./internal/map/slots'), require('./internal/map/slots-default'), require('./polyfilled'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.patch, global.slots, global.slotsDefault, global.polyfilled);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _patch, _slots, _slotsDefault, _polyfilled) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (elem) {
    if ((0, _polyfilled2.default)(elem)) {
      return;
    }

    for (var name in props) {
      prop(elem, name, props[name]);
    }

    for (var name in funcs) {
      elem[name] = funcs[name];
    }

    _patch2.default.set(elem, true);
  };

  var _patch2 = _interopRequireDefault(_patch);

  var _slots2 = _interopRequireDefault(_slots);

  var _slotsDefault2 = _interopRequireDefault(_slotsDefault);

  var _polyfilled2 = _interopRequireDefault(_polyfilled);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var prop = Object.defineProperty.bind(Object);

  function getSlot(elem, node) {
    var key = getSlotName(elem, node);
    var val = elem[key];
    return key && val ? {
      key: key,
      val: val.slice()
    } : null;
  }

  function getSlotName(elem, node) {
    return node.getAttribute && node.getAttribute('slot') || _slotsDefault2.default.get(elem);
  }

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

  var props = {
    childElementCount: {
      get: function get() {
        return this.children.length;
      }
    },
    childNodes: {
      get: function get() {
        var _this = this;

        return makeLikeNodeList((_slots2.default.get(this) || []).reduce(function (prev, curr) {
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
        var slot = _slotsDefault2.default.get(this);

        if (slot) {
          this[slot] = document.createTextNode(val);
        }
      }
    }
  };
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
  module.exports = exports['default'];
});