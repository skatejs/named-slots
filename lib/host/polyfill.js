(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './data', '../light/data', '../shadow/distribute', '../util/each', '../util/frag-from-html', '../util/html-from-frag', '../light/polyfill'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./data'), require('../light/data'), require('../shadow/distribute'), require('../util/each'), require('../util/frag-from-html'), require('../util/html-from-frag'), require('../light/polyfill'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.data, global.data, global.distribute, global.each, global.fragFromHtml, global.htmlFromFrag, global.polyfill);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _data, _data2, _distribute, _each, _fragFromHtml, _htmlFromFrag, _polyfill) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (host) {
    if (_data.polyfilled.get(host)) {
      return;
    }
    _data.lightNodes.set(host, makeLikeNodeList([]));
    Object.defineProperties(host, members);
    _data.polyfilled.set(host, true);
    return host;
  };

  var _distribute2 = _interopRequireDefault(_distribute);

  var _each2 = _interopRequireDefault(_each);

  var _fragFromHtml2 = _interopRequireDefault(_fragFromHtml);

  var _htmlFromFrag2 = _interopRequireDefault(_htmlFromFrag);

  var _polyfill2 = _interopRequireDefault(_polyfill);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var configurable = true;

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

  var members = {
    appendChild: {
      value: function value(newNode) {
        var ln = _data.lightNodes.get(this);

        var host = this;
        cleanNode(newNode);
        (0, _each2.default)(newNode, function (node) {
          ln.push(node);

          _data2.light.set(node, true);

          _data2.parentNode.set(node, host);

          (0, _polyfill2.default)(node);
          (0, _distribute2.default)(node);
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
        return _data.lightNodes.get(this);
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
        return (0, _htmlFromFrag2.default)(this);
      },
      set: function set(innerHTML) {
        var copy = (0, _fragFromHtml2.default)(innerHTML);

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
        var ln = _data.lightNodes.get(this);

        var host = this;
        cleanNode(newNode);
        (0, _each2.default)(newNode, function (node) {
          var index = ln.indexOf(refNode);

          if (index > -1) {
            ln.splice(index, 0, node);
          } else {
            ln.push(node);
          }

          _data2.light.set(node, true);

          _data2.parentNode.set(node, host);

          (0, _polyfill2.default)(node);
          (0, _distribute2.default)(node);
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
        var ln = _data.lightNodes.get(this);

        var index = ln.indexOf(refNode);

        if (index > -1) {
          (0, _distribute.undistribute)(refNode);

          _data2.light.set(refNode, false);

          _data2.parentNode.set(refNode, null);

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
  module.exports = exports['default'];
});