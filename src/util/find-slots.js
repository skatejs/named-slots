import isRootNode from './is-root-node';
import isSlotNode from './is-slot-node';

export default function(root) {
  const slots = [];

  // IE complains if you call nextNode() on a tree walker that isn't an element.
  if (root.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  // IE requies the last argument, so we must provide both the 3rd and last.
  const walker = document.createTreeWalker(root, Node.SHOW_ELEMENT, null, false);
  let inDescendantRoot = false;

  while (walker.nextNode()) {
    const { currentNode } = walker;
    const isCurrentSlot = isSlotNode(currentNode);

    if (inDescendantRoot && isCurrentSlot) {
      inDescendantRoot = false;
      continue;
    }

    if (isRootNode(currentNode)) {
      inDescendantRoot = true;
      continue;
    }

    if (!inDescendantRoot && isCurrentSlot) {
      slots.push(currentNode);
    }
  }

  return slots;
}
