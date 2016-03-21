import { assignedNodes, changeListeners, debouncedTriggerSlotChangeEvent, fallbackNodes, fallbackState } from './data';

function removeFromSlot (frag, slot) {
  frag.childNodes.forEach(ch => slot.__removeChild(ch));
}

function moveIntoSlot (frag, slot) {
  frag.childNodes.forEach(ch => slot.__appendChild(ch));
}

function shouldAffectSlot (slot) {
  return !fallbackState.get(slot);
}

function toggle (slot) {
  if (fallbackState.get(slot)) {
    const aNodes = assignedNodes.get(slot);
    if (aNodes.hasChildNodes()) {
      const fNodes = fallbackNodes.get(slot);
      removeFromSlot(fNodes, slot);
      moveIntoSlot(aNodes, slot);
      fallbackState.set(slot, false);
    }
  } else {
    const aNodes = assignedNodes.get(slot);
    if (!aNodes.hasChildNodes()) {
      const fNodes = fallbackNodes.get(slot);
      removeFromSlot(aNodes, slot);
      moveIntoSlot(fNodes, slot);
      fallbackState.set(slot, true);
    }
  }
}

function triggerEvent (slot) {
  if (changeListeners.get(slot)) {
    debouncedTriggerSlotChangeEvent.get(slot)(slot);
  }
}

function triggerSideEffects (slot) {
  toggle(slot);
  triggerEvent(slot);
}

export function appendChild (slot, newNode) {
  assignedNodes.get(slot).appendChild(newNode);
  shouldAffectSlot(slot) && slot.__appendChild(newNode);
  triggerSideEffects(slot);
}

export function insertBefore (slot, newNode, refNode) {
  assignedNodes.get(slot).insertBefore(newNode, refNode);
  shouldAffectSlot(slot) && slot.__insertBefore(newNode, refNode);
  triggerSideEffects(slot);
}

export function removeChild (slot, refNode) {
  assignedNodes.get(slot).removeChild(refNode);
  shouldAffectSlot(slot) && slot.__removeChild(refNode);
  triggerSideEffects(slot);
}

export function replaceChild (slot, newNode, refNode) {
  assignedNodes.get(slot).replaceChild(newNode, refNode);
  shouldAffectSlot(slot) && slot.__replaceChild(newNode, refNode);
  triggerSideEffects(slot);
}
