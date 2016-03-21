import { assignedNodes, changeListeners, fallbackNodes, fallbackState, debouncedTriggerSlotChangeEvent } from './data';

function get (slot) {
  return assignedNodes.get(slot);
}

function removeFromSlot (frag, slot) {
  frag.childNodes.forEach(ch => slot.__removeChild(ch));
}

function moveIntoSlot (frag, slot) {
  frag.childNodes.forEach(ch => slot.__appendChild(ch));
}

function shouldAffectSlot (slot) {
  return !fallbackState.get(slot);
}

function triggerSideEffects (slot) {
  toggle(slot);
  triggerSlotChangeEvent(slot);
}

export function appendChild (slot, newNode) {
  get(slot).appendChild(newNode);
  shouldAffectSlot(slot) && slot.__appendChild(newNode);
  triggerSideEffects(slot);
}

export function insertBefore (slot, newNode, refNode) {
  get(slot).insertBefore(newNode, refNode);
  shouldAffectSlot(slot) && slot.__insertBefore(newNode, refNode);
  triggerSideEffects(slot);
}

export function removeChild (slot, refNode) {
  get(slot).removeChild(refNode);
  shouldAffectSlot(slot) && slot.__removeChild(refNode);
  triggerSideEffects(slot);
}

export function replaceChild (slot, newNode, refNode) {
  get(slot).replaceChild(newNode, refNode);
  shouldAffectSlot(slot) && slot.__replaceChild(newNode, refNode);
  triggerSideEffects(slot);
}

export function toggle (slot) {
  const aNodes = assignedNodes.get(slot);
  const fNodes = fallbackNodes.get(slot);

  if (fallbackState.get(slot)) {
    if (aNodes.hasChildNodes()) {
      removeFromSlot(fNodes, slot);
      moveIntoSlot(aNodes, slot);
      fallbackState.set(slot, false);
    }
  } else {
    if (!aNodes.hasChildNodes()) {
      removeFromSlot(aNodes, slot);
      moveIntoSlot(fNodes, slot);
      fallbackState.set(slot, true);
    }
  }
}

export function triggerSlotChangeEvent (slot) {
  if (changeListeners.get(slot)) {
    debouncedTriggerSlotChangeEvent.get(slot)(slot);
  }
}
