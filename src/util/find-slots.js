import isRootNode from './is-root-node';
import isSlotNode from './is-slot-node';

export default function(root) {
  const walker = document.createTreeWalker(root, Node.SHOW_ELEMENT, null, false);
  const slots = [];

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
