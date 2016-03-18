import debounce from 'debounce';
import mapSlotAddedNodes from './map-slot-added-nodes';
import mapSlotRemovedNodes from './map-slot-removed-nodes';

function clearSlotNodeData (slot) {
  mapSlotAddedNodes.set(slot, null);
  mapSlotRemovedNodes.set(slot, null);
}

function polyfillSlot (slot) {
  slot.__triggerSlotChangeEvent = debounce(triggerSlotChangeEvent);
  return slot;
}

function queryForNamedSlot (host, name) {
  return host.querySelector(`slot[name="${name}"], [slot-name="${name}"]`);
}

function queryForUnnamedSlot (host) {
  return host.querySelector('slot[name=""], slot:not([name]), [slot-name=""]');
}

function triggerSlotChangeEvent () {
  const addedNodes = mapSlotAddedNodes.get(this) || [];
  const removedNodes = mapSlotRemovedNodes.get(this) || [];

  // Don't do anything if nothing changed.
  if (!addedNodes.length && !removedNodes.length) {
    return clearSlotNodeData(this);
  }

  const ce = new CustomEvent('slotchange', {
    bubbles: false,
    cancelable: false,
    detail: { addedNodes, removedNodes }
  });

  clearSlotNodeData(this);
  this.dispatchEvent(ce);
}

export default function (host, node) {
  if (!node) {
    return;
  }

  const slotName = node.getAttribute && node.getAttribute('slot');
  const cacheKey = slotName || 'content';

  if (!host.__slots) {
    host.__slots = {};
  }

  const slots = host.__slots;

  // We check for a cached slot first because querying is slow.
  if (slots[cacheKey]) {
    const slotElement = slots[cacheKey];

    // However, we check to see if it was detached. If not, just return it.
    if (slotElement.parentNode) {
      return slotElement;
    }

    // if it was detached we should make sure it's cleaned up.
    delete slots[cacheKey];
    return null;
  }

  const calculatedName = (host.__shadowId || '') + (slotName || '');
  const slotElement = slotName ? queryForNamedSlot(host, calculatedName) : queryForUnnamedSlot(host);

  // Cache it because querying is slow.
  if (slotElement) {
    slots[cacheKey] = polyfillSlot(slotElement);
  }

  return slots[cacheKey] || null;
}
