(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './data', '../util/node', 'debounce', '../util/element', '../util/frag-from-html'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./data'), require('../util/node'), require('debounce'), require('../util/element'), require('../util/frag-from-html'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.data, global.node, global.debounce, global.element, global.fragFromHtml);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _data, _node, _debounce, _element, _fragFromHtml) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (slot) {
    if (_data.polyfilled.get(slot)) {
      return slot;
    }
    polyfill(slot);
    _data.polyfilled.set(slot, true);
    return slot;
  };

  var _debounce2 = _interopRequireDefault(_debounce);

  var _element2 = _interopRequireDefault(_element);

  var _fragFromHtml2 = _interopRequireDefault(_fragFromHtml);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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
    return _data.assignedNodes.get(slot);
  }

  function shouldAffectSlot(slot) {
    return _data.fallbackState.get(slot);
  }

  function triggerSlotChangeEvent(slot) {
    slot.dispatchEvent(new CustomEvent('slotchange', {
      bubbles: false,
      cancelable: false
    }));
  }

  var members = {
    appendChild: {
      value: function value(newNode) {
        shouldAffectSlot(this) && _node.appendChild.call(this, newNode);
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
        return _data.fallbackNodes.get(this);
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
        return opts.deep ? getAssignedNodesDeep(this) : _data.assignedNodes.get(this);
      }
    },
    hasChildNodes: {
      value: function value() {
        return !!this.childNodes.length;
      }
    },
    innerHTML: {
      get: function get() {
        return _data.fallbackNodes.get(this).map(function (node) {
          return node.outerHTML;
        }).join('');
      },
      set: function set(innerHTML) {
        _data.fallbackNodes.set(this, []);

        var chs = (0, _fragFromHtml2.default)(innerHTML).childNodes;
        var chsLen = chs.length;

        for (var a = chsLen - 1; a >= 0; a--) {
          this.insertBefore(chs[a], this.firstChild);
        }
      }
    },
    insertBefore: {
      value: function value(newNode, refNode) {
        var fb = _data.fallbackNodes.get(this);

        shouldAffectSlot(this) && _node.insertBefore.call(this, newNode, refNode);
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
        var fb = _data.fallbackNodes.get(this);

        shouldAffectSlot(this) && _node.removeChild.call(this, refNode);
        fb.splice(fb.indexOf(refNode), 1);
        return refNode;
      }
    },
    replaceChild: {
      value: function value(newNode, refNode) {
        var fb = _data.fallbackNodes.get(this);

        shouldAffectSlot(this) && _node.replaceChild.call(this, newNode, refNode);
        fb.splice(fb.indexOf(refNode), 1, newNode);
        return refNode;
      }
    },
    textContent: {
      get: function get() {
        return _data.fallbackNodes.get(this).map(function (node) {
          return node.textContent;
        }).join('');
      },
      set: function set(textContent) {
        _data.fallbackNodes.set(this, [document.createTextNode(textContent)]);
      }
    }
  };

  _element2.default.addEventListener = function (name, func, opts) {
    if (name === 'slotchange') {
      var listeners = _data.changeListeners.get(this) || 0;

      _data.changeListeners.set(this, ++listeners);
    }

    return _element.addEventListener.call(this, name, func, opts);
  };

  _element2.default.removeEventListener = function (name, func, opts) {
    if (name === 'slotchange') {
      var listeners = _data.changeListeners.get(this) || 1;

      _data.changeListeners.set(this, --listeners);
    }

    return _element.removeEventListener.call(this, name, func, opts);
  };

  function polyfill(slot) {
    _data.assignedNodes.set(slot, []);

    _data.fallbackNodes.set(slot, getInitialFallbackContent(slot));

    _data.fallbackState.set(slot, true);

    _data.debouncedTriggerSlotChangeEvent.set(slot, (0, _debounce2.default)(triggerSlotChangeEvent));

    Object.defineProperties(slot, members);
  }

  module.exports = exports['default'];
});