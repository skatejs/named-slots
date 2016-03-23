import { assignedSlot } from '../light/data';
import { assignedNodes } from '../slot/data';
import { roots, slots } from './data';
import { appendChild, insertBefore, removeChild } from '../util/node';
import lightPolyfill from '../light/polyfill';

function getSlotName (node) {
  return (node.getAttribute ? node.getAttribute('slot') : null) || 'default';
}

function getSlotNode (root, node) {
  const slot = getSlotName(node);
  return slots.get(root)[slot];
}

export default function (node) {
  const host = node.parentNode;
  const slot = getSlotNode(roots.get(host), node);

  if (slot) {
    const an = assignedNodes.get(slot);
    const ns = node.nextSibling;

    assignedSlot.set(node, slot);
    lightPolyfill(node);

    if (ns && ns.assignedSlot === slot) {
      an.splice(an.indexOf(ns), 0, node);
      insertBefore.call(slot, node, ns);
    } else {
      an.push(node);
      appendChild.call(slot, node);
    }
  }
}

export function undistribute (node) {
  const host = node.parentNode;
  const slot = getSlotNode(roots.get(host), node);

  if (slot) {
    const an = assignedNodes.get(slot);
    const index = an.indexOf(node);

    if (index > -1) {
      removeChild.call(slot, node);
      assignedSlot.set(node, null);
      an.splice(index, 1);
    }
  }
}
