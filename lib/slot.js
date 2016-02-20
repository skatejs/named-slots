(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', './internal/map/slots', './internal/map/slots-default'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('./internal/map/slots'), require('./internal/map/slots-default'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.mapSlots, global.mapSlotsDefault);
    global.slot = mod.exports;
  }
})(this, function (exports, module, _internalMapSlots, _internalMapSlotsDefault) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _mapSlots = _interopRequireDefault(_internalMapSlots);

  var _mapSlotsDefault = _interopRequireDefault(_internalMapSlotsDefault);

  // Creates a slot property compatible with the SkateJS custom property
  // definitions. Makes web component integration much simpler.

  module.exports = function (opts) {
    if (!opts) {
      opts = {
        'default': false,
        set: null
      };
    }

    return {
      // Makes sure that whatever is passed in is an array.
      coerce: function coerce(val) {
        return Array.isArray(val) ? val : [val];
      },

      // Registers the slot so we can check later.
      created: function created(elem, data) {
        var slots = _mapSlots['default'].get(elem);

        if (!slots) {
          _mapSlots['default'].set(elem, slots = []);
        }

        slots.push(data.name);

        if (opts['default']) {
          _mapSlotsDefault['default'].set(elem, data.name);
        }
      },

      // If an empty value is passed in, ensure that it's an array.
      'default': function _default() {
        return [];
      },

      // Return any initial nodes that match the slot.
      initial: function initial(elem, data) {
        return [].slice.call(elem.childNodes).filter(function (ch) {
          if (ch.getAttribute) {
            var slot = ch.getAttribute('slot') || opts['default'] && data.name;
            return slot === data.name;
          } else if (ch.nodeType === 3) {
            return true;
          }
        });
      },

      // User-defined setter.
      set: opts.set
    };
  };
});