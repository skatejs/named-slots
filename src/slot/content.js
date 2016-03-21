import * as data from './data';

function get (slot) {
  return data.assignedNodes.get(slot);
}

function removeFromSlot (frag, slot) {
  frag.childNodes.forEach(ch => slot.__removeChild(ch));
}

function moveIntoSlot (frag, slot) {
  frag.childNodes.forEach(ch => slot.__appendChild(ch));
}

function shouldAffectSlot (slot) {
  return !data.fallbackState.get(slot);
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
  const assignedNodes = data.assignedNodes.get(slot);
  const fallbackNodes = data.fallbackNodes.get(slot);

  if (data.fallbackState.get(slot)) {
    if (assignedNodes.hasChildNodes()) {
      removeFromSlot(fallbackNodes, slot);
      moveIntoSlot(assignedNodes, slot);
      data.fallbackState.set(slot, false);
    }
  } else {
    if (!assignedNodes.hasChildNodes()) {
      removeFromSlot(assignedNodes, slot);
      moveIntoSlot(fallbackNodes, slot);
      data.fallbackState.set(slot, true);
    }
  }
}

export function triggerSlotChangeEvent (slot) {
  if (data.changeListeners.get(slot)) {
    data.triggerSlotChangeEvent.get(slot)(slot);
  }
}
