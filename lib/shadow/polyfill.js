(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './data', '../util/node', './distribute', '../util/element', '../util/frag-from-html', '../util/html-from-frag', '../host/polyfill', '../slot/polyfill'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./data'), require('../util/node'), require('./distribute'), require('../util/element'), require('../util/frag-from-html'), require('../util/html-from-frag'), require('../host/polyfill'), require('../slot/polyfill'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.data, global.node, global.distribute, global.element, global.fragFromHtml, global.htmlFromFrag, global.polyfill, global.polyfill);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _data, _node, _distribute, _element, _fragFromHtml, _htmlFromFrag, _polyfill, _polyfill3) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = polyfill;

  var _distribute2 = _interopRequireDefault(_distribute);

  var _element2 = _interopRequireDefault(_element);

  var _fragFromHtml2 = _interopRequireDefault(_fragFromHtml);

  var _htmlFromFrag2 = _interopRequireDefault(_htmlFromFrag);

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _polyfill4 = _interopRequireDefault(_polyfill3);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var defaultShadowRootTagName = '_shadow_root_';

  function createFragmentFromChildNodes(elem) {
    var frag = document.createDocumentFragment();

    while (elem.hasChildNodes()) {
      frag.appendChild(elem.firstChild);
    }

    return frag;
  }

  function cacheSlots(root, node) {
    var oldSlots = _data.slots.get(root);

    if (node.tagName === 'SLOT') {
      (0, _polyfill4.default)(node);
      oldSlots[node.name || 'default'] = node;

      var host = _data.hosts.get(root);

      var hostChs = host.childNodes;
      var hostChsLen = hostChs.length;

      for (var a = 0; a < hostChsLen; a++) {
        var ch = hostChs[a];

        if (!ch.assignedSlot) {
          (0, _distribute2.default)(ch);
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
    var oldSlots = _data.slots.get(root);

    if (node.tagName === 'SLOT') {
      node.getAssignedNodes().forEach(function (aNode) {
        return (0, _distribute.undistribute)(aNode);
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
        var ret = _node.appendChild.call(this, newNode);

        cacheSlots(this, newNode);
        return ret;
      }
    },
    host: {
      configurable: true,
      get: function get() {
        return _data.hosts.get(this);
      }
    },
    innerHTML: {
      configurable: true,
      get: function get() {
        return (0, _htmlFromFrag2.default)(this);
      },
      set: function set(innerHTML) {
        var frag = (0, _fragFromHtml2.default)(innerHTML);

        while (frag.hasChildNodes()) {
          this.appendChild(frag.firstChild);
        }
      }
    },
    insertBefore: {
      configurable: true,
      value: function value(newNode, refNode) {
        var ret = _node.insertBefore.call(this, newNode, refNode);

        cacheSlots(this, newNode);
        return ret;
      }
    },
    removeChild: {
      configurable: true,
      value: function value(refNode) {
        var ret = _node.removeChild.call(this, refNode);

        uncacheSlots(this, refNode);
        return ret;
      }
    },
    replaceChild: {
      configurable: true,
      value: function value(newNode, refNode) {
        var ret = _node.replaceChild.call(this, newNode, refNode);

        cacheSlots(this, newNode);
        uncacheSlots(this, refNode);
        return ret;
      }
    }
  };

  if (!_element2.default.attachShadow) {
    _element2.default.attachShadow = function (opts) {
      var mode = opts && opts.mode;

      if (mode !== 'closed' && mode !== 'open') {
        throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
      }

      return polyfill(this, opts);
    };
  }

  function polyfill(host) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var mode = _ref.mode;
    var polyfillShadowRootTagName = _ref.polyfillShadowRootTagName;

    var existingShadowRoot = _data.roots.get(host);

    if (existingShadowRoot) {
      return existingShadowRoot;
    }

    var shadowRoot = document.createElement(polyfillShadowRootTagName || defaultShadowRootTagName);
    var initialLightDom = createFragmentFromChildNodes(host);

    _data.hosts.set(shadowRoot, host);

    _data.roots.set(host, shadowRoot);

    _data.slots.set(shadowRoot, {});

    Object.defineProperty(host, 'shadowRoot', {
      configurable: true,
      get: function get() {
        return mode === 'open' ? shadowRoot : null;
      }
    });
    host.appendChild(shadowRoot);
    Object.defineProperties(shadowRoot, members);
    (0, _polyfill2.default)(host);
    host.appendChild(initialLightDom);
    return shadowRoot;
  }

  module.exports = exports['default'];
});