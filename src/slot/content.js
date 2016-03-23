import { assignedNodes, changeListeners, debouncedTriggerSlotChangeEvent, fallbackNodes, fallbackState } from './data';
import { appendChild, insertBefore, removeChild, replaceChild } from '../util/node';

function shouldAffectSlot (slot) {
  return !fallbackState.get(slot);
}

function toggle (slot) {
  if (fallbackState.get(slot)) {
    const aNodes = assignedNodes.get(slot);
    if (aNodes.length) {
      const fNodes = fallbackNodes.get(slot);
      fNodes.forEach(node => removeChild.call(slot, node));
      aNodes.forEach(node => appendChild.call(slot, node));
      fallbackState.set(slot, false);
    }
  } else {
    const aNodes = assignedNodes.get(slot);
    if (!aNodes.length) {
      const fNodes = fallbackNodes.get(slot);
      aNodes.forEach(node => removeChild.call(slot, node));
      fNodes.forEach(node => appendChild.call(slot, node));
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

export function slotAppendChild (slot, newNode) {
  const assigned = assignedNodes.get(slot);
  assigned.push(newNode);
  shouldAffectSlot(slot) && appendChild.call(slot, newNode);
  triggerSideEffects(slot);
}

export function slotInsertBefore (slot, newNode, refNode) {
  const assigned = assignedNodes.get(slot);
  assigned.splice(assigned.indexOf(refNode), 0, newNode);
  shouldAffectSlot(slot) && insertBefore.call(slot, newNode, refNode);
  triggerSideEffects(slot);
}

export function slotRemoveChild (slot, refNode) {
  const assigned = assignedNodes.get(slot);
  assigned.splice(assigned.indexOf(refNode), 1);
  shouldAffectSlot(slot) && removeChild.call(slot, refNode);
  triggerSideEffects(slot);
}

export function slotReplaceChild (slot, newNode, refNode) {
  const assigned = assignedNodes.get(slot);
  assigned.splice(assigned.indexOf(refNode), 1, newNode);
  shouldAffectSlot(slot) && replaceChild.call(slot, newNode, refNode);
  triggerSideEffects(slot);
}
