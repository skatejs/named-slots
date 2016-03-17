(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.getSlot = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (host, node) {
    if (!node) {
      return;
    }

    var slotName = node.getAttribute && node.getAttribute('slot');
    var cacheKey = slotName || 'content';

    if (!host.__slots) {
      host.__slots = {};
    }

    var slots = host.__slots;

    // We check for a cached slot first because querying is slow.
    if (slots[cacheKey]) {
      var _slotElement = slots[cacheKey];

      // However, we check to see if it was detached. If not, just return it.
      if (_slotElement.parentNode) {
        return _slotElement;
      }

      // if it was detached we should make sure it's cleaned up.
      delete slots[cacheKey];
      return null;
    }

    var calculatedName = (host.__shadowId || '') + (slotName || '');
    var slotElement = slotName ? queryForNamedSlot(host, calculatedName) : queryForUnnamedSlot(host);

    // Cache it because querying is slow.
    if (slotElement) {
      slots[cacheKey] = slotElement;
    }

    return slots[cacheKey] || null;
  };

  function queryForNamedSlot(host, name) {
    return host.querySelector('slot[name="' + name + '"], [slot-name="' + name + '"]');
  }

  function queryForUnnamedSlot(host) {
    return host.querySelector('slot[name=""], slot:not([name]), [slot-name=""]');
  }

  module.exports = exports['default'];
});