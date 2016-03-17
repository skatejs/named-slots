(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './polyfill'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./polyfill'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.polyfill);
    global.render = mod.exports;
  }
})(this, function (module, exports, _polyfill) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (fn) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? defaults : arguments[1];

    return function (elem) {
      var shadowRoot = elem.__shadowRoot;

      if (shadowRoot) {
        fn(elem, shadowRoot);
      } else {
        // We get a fragment of the initial DOM so that we can create the shadow
        // root.
        var initialLightDom = createFragmentFromChildNodes(elem);

        // Create a shadow ID so that it can be used to get a slot that is unique
        // to this shadow root. Since we don't polyfill querySelector() et al, we
        // need a way to be able to refer to slots that are unique to this
        // shadow root.
        elem.__shadowId = opts.shadowId;

        // Create the shadow root and return the light DOM. We must get the light
        // DOM before we template it so that we can distribute it after
        // polyfilling.
        elem.__shadowRoot = createShadowRoot(elem);

        // Render once we have the initial light DOM as this would likely blow
        // that away.
        fn(elem, elem.__shadowRoot);

        // Now polyfill so that we can distribute after.
        (0, _polyfill2.default)(elem);

        // Distribute the initial light DOM after polyfill so they get put into
        // the right spots.
        elem.appendChild(initialLightDom);
      }
    };
  };

  var _polyfill2 = _interopRequireDefault(_polyfill);

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

  var defaults = {
    shadowId: ''
  };
  module.exports = exports['default'];
});