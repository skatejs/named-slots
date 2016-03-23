(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './data', '../util/node', './distribute', '../util/frag-from-html', '../util/html-from-frag', '../host/polyfill', '../slot/polyfill'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./data'), require('../util/node'), require('./distribute'), require('../util/frag-from-html'), require('../util/html-from-frag'), require('../host/polyfill'), require('../slot/polyfill'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.data, global.node, global.distribute, global.fragFromHtml, global.htmlFromFrag, global.polyfill, global.polyfill);
    global.polyfill = mod.exports;
  }
})(this, function (module, exports, _data, _node, _distribute, _fragFromHtml, _htmlFromFrag, _polyfill, _polyfill3) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (host) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var mode = _ref.mode;

    if (host.shadowRoot) {
      return host.shadowRoot;
    }

    var shadowRoot = createShadowRoot(host);
    var initialLightDom = createFragmentFromChildNodes(host);

    // Host and shadow root data.
    _data.hosts.set(shadowRoot, host);
    _data.roots.set(host, shadowRoot);
    _data.slots.set(shadowRoot, {});

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
    (0, _polyfill2.default)(host);

    // Finally, insert the initial light DOM content so it's distributed.
    host.appendChild(initialLightDom);

    return shadowRoot;
  };

  var _distribute2 = _interopRequireDefault(_distribute);

  var _fragFromHtml2 = _interopRequireDefault(_fragFromHtml);

  var _htmlFromFrag2 = _interopRequireDefault(_htmlFromFrag);

  var _polyfill2 = _interopRequireDefault(_polyfill);

  var _polyfill4 = _interopRequireDefault(_polyfill3);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function createFragmentFromChildNodes(elem) {
    var frag = document.createDocumentFragment();

    while (elem.hasChildNodes()) {
      frag.appendChild(elem.firstChild);
    }

    return frag;
  }

  function createShadowRoot(elem) {
    var root = document.createElement(isBlockLevel(elem) ? 'div' : 'span');
    elem.appendChild(root);
    return root;
  }

  function isBlockLevel(elem) {
    return window.getComputedStyle(elem).display === 'block';
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
  module.exports = exports['default'];
});