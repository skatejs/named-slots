import { assignedNodes, changeListeners, debouncedTriggerSlotChangeEvent, fallbackNodes, fallbackState } from './data';

function shouldAffectSlot (slot) {
  return !fallbackState.get(slot);
}

function toggle (slot) {
  if (fallbackState.get(slot)) {
    const aNodes = assignedNodes.get(slot);
    if (aNodes.length) {
      const fNodes = fallbackNodes.get(slot);
      fNodes.forEach(node => slot.__removeChild(node));
      aNodes.forEach(node => slot.__appendChild(node));
      fallbackState.set(slot, false);
    }
  } else {
    const aNodes = assignedNodes.get(slot);
    if (!aNodes.length) {
      const fNodes = fallbackNodes.get(slot);
      aNodes.forEach(node => slot.__removeChild(node));
      fNodes.forEach(node => slot.__appendChild(node));
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
  const assigned = assignedNodes.get(slot);
  assigned.push(newNode);
  shouldAffectSlot(slot) && slot.__appendChild(newNode);
  triggerSideEffects(slot);
}

export function insertBefore (slot, newNode, refNode) {
  const assigned = assignedNodes.get(slot);
  assigned.splice(assigned.indexOf(refNode), 0, newNode);
  shouldAffectSlot(slot) && slot.__insertBefore(newNode, refNode);
  triggerSideEffects(slot);
}

export function removeChild (slot, refNode) {
  const assigned = assignedNodes.get(slot);
  assigned.splice(assigned.indexOf(refNode), 1);
  shouldAffectSlot(slot) && slot.__removeChild(refNode);
  triggerSideEffects(slot);
}

export function replaceChild (slot, newNode, refNode) {
  const assigned = assignedNodes.get(slot);
  assigned.splice(assigned.indexOf(refNode), 1, newNode);
  shouldAffectSlot(slot) && slot.__replaceChild(newNode, refNode);
  triggerSideEffects(slot);
}
