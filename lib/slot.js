(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './internal/map/slots', './internal/map/slots-default'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./internal/map/slots'), require('./internal/map/slots-default'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.slots, global.slotsDefault);
    global.slot = mod.exports;
  }
})(this, function (exports, _slots, _slotsDefault) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (opts) {
    if (!opts) {
      opts = {
        default: false,
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
        var slots = _slots2.default.get(elem);

        if (!slots) {
          _slots2.default.set(elem, slots = []);
        }

        slots.push(data.name);

        if (opts.default) {
          _slotsDefault2.default.set(elem, data.name);
        }
      },

      // If an empty value is passed in, ensure that it's an array.
      'default': function _default() {
        return [];
      },

      // Return any initial nodes that match the slot.
      initial: function initial(elem, data) {
        return [].slice.call(elem.childNodes).filter(function (ch) {
          var slot = ch.getAttribute && ch.getAttribute('slot') || opts.default && data.name;
          return slot && slot === data.name;
        });
      },

      // User-defined setter.
      set: opts.set
    };
  };

  var _slots2 = _interopRequireDefault(_slots);

  var _slotsDefault2 = _interopRequireDefault(_slotsDefault);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }
});