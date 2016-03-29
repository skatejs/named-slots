import { assignedSlot } from '../light/data';
import { assignedNodes, changeListeners, debouncedTriggerSlotChangeEvent, fallbackNodes, fallbackState } from '../slot/data';
import { roots, slots } from './data';
import { appendChild, insertBefore, removeChild } from '../util/node';

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

function getSlotName (node) {
  return (node.getAttribute ? node.getAttribute('slot') : null) || 'default';
}

function getSlotNode (root, node) {
  const slot = getSlotName(node);
  return slots.get(root)[slot];
}

export default function (node) {
  const host = node.parentNode;
  const root = roots.get(host);
  const slot = getSlotNode(root, node);

  if (slot) {
    const an = assignedNodes.get(slot);
    const ns = node.nextSibling;
    const shouldManip = shouldAffectSlot(slot);

    assignedSlot.set(node, slot);

    if (ns && ns.assignedSlot === slot) {
      an.splice(an.indexOf(ns), 0, node);
      shouldManip && insertBefore.call(slot, node, ns);
    } else {
      an.push(node);
      shouldManip && appendChild.call(slot, node);
    }

    triggerSideEffects(slot);
  }
}

export function undistribute (node) {
  const host = node.parentNode;
  const slot = getSlotNode(roots.get(host), node);

  if (slot) {
    const an = assignedNodes.get(slot);
    const index = an.indexOf(node);

    if (index > -1) {
      shouldAffectSlot(slot) && removeChild.call(slot, node);
      assignedSlot.set(node, null);
      an.splice(index, 1);
      triggerSideEffects(slot);
    }
  }
}
