import mapSlots from './internal/map/slots';
import mapSlotsDefault from './internal/map/slots-default';

// Creates a slot property compatible with the SkateJS custom property
// definitions. Makes web component integration much simpler.
export default function (opts) {
  if (!opts) {
    opts = {
      default: false,
      set: null
    };
  }

  return {
    // Makes sure that whatever is passed in is an array.
    coerce: function (val) {
      return Array.isArray(val) ? val : [val];
    },

    // Registers the slot so we can check later.
    created: function (elem, data) {
      let slots = mapSlots.get(elem);

      if (!slots) {
        mapSlots.set(elem, slots = []);
      }

      slots.push(data.name);

      if (opts.default) {
        mapSlotsDefault.set(elem, data.name);
      }
    },

    // If an empty value is passed in, ensure that it's an array.
    'default': function () {
      return [];
    },

    // Return any initial nodes that match the slot.
    initial: function (elem, data) {
      return [].slice.call(elem.childNodes).filter(function (ch) {
        const slot = (ch.getAttribute && ch.getAttribute('slot')) || (opts.default && data.name);
        const chHasContent = ch.nodeType === 1 || ch.textContent.trim();
        return slot && slot === data.name && chHasContent;
      });
    },

    // User-defined setter.
    set: opts.set
  };
}
