import getSlot from './internal/get-slot';
import mapAddedNodeIndex from './internal/map-added-node-index';
import mapNodeIsLightDom from './internal/map-node-is-light-dom';
import mapPolyfilled from './internal/map-polyfilled';
import mapPolyfilledLightNode from './internal/map-polyfilled-light-node';
import mapPolyfilledParentNode from './internal/map-polyfilled-parent-node';
import mapRemovedNodeIndex from './internal/map-removed-node-index';
import mapSlotAddedNodes from './internal/map-slot-added-nodes';
import mapSlotChangeListeners from './internal/map-slot-change-listeners';
import mapSlotRemovedNodes from './internal/map-slot-removed-nodes';
import prop from './internal/prop';

const nodeProto = Node.prototype;
const elProto = Element.prototype;
const htmlElProto = HTMLElement.prototype;

const configurable = true;
const canPatchNativeAccessors = !!Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;

// Fake parentNode helpers.

function applyParentNode (node, parent) {
  mapNodeIsLightDom.set(node, true);
  mapPolyfilledParentNode.set(node, parent);

  if (!canPatchNativeAccessors && !mapPolyfilledLightNode.get(node)) {
    mapPolyfilledLightNode.set(node, true);
    for (let name in lightProps) {
      prop(node, name, lightProps[name]);
    }
  }
}

function removeParentNode (node) {
  mapNodeIsLightDom.set(node, false);
  mapPolyfilledParentNode.set(node, null);
}


// Slotting helpers.

function arrayItem (idx) {
  return this[idx];
}

function doForNodesIfSlot (elem, node, func) {
  const nodes = nodeToArray(node);
  const nodesLen = nodes.length;

  for (let a = 0; a < nodesLen; a++) {
    const node = nodes[a];
    const slot = getSlot(elem, node);

    if (slot) {
      func(elem, node, slot);
      if (mapSlotChangeListeners.get(slot)) {
        slot.__triggerSlotChangeEvent();
      }
    }
  }
}

function makeLikeNodeList (arr) {
  arr.item = arrayItem;
  return arr;
}

function nodeToArray (node) {
  return node instanceof DocumentFragment ? toArray(node.childNodes) : [node];
}

function toArray (obj) {
  return Array.prototype.slice.call(obj);
}


// Helpers for adding / removing information about slotted nodes.

function addSlotNode (slot, node) {
  if (!mapSlotChangeListeners.get(slot)) {
    return;
  }

  const addedNodes = mapSlotAddedNodes.get(slot) || [];
  const addedNodeIndex = addedNodes.length;
  const removedNodes = mapSlotRemovedNodes.get(slot);
  const removedNodeIndex = mapRemovedNodeIndex.get(node);

  if (typeof removedNodeIndex === 'number') {
    mapRemovedNodeIndex.set(node, null);
    removedNodes.splice(removedNodeIndex, 1);
  } else {
    addedNodes.push(node);
    mapSlotAddedNodes.set(slot, addedNodes);
    mapAddedNodeIndex.set(node, addedNodeIndex);
  }
}

function removeSlotNode (slot, node) {
  if (!mapSlotChangeListeners.get(slot)) {
    return;
  }

  const removedNodes = mapSlotRemovedNodes.get(slot) || [];
  const removedNodeIndex = removedNodes.length;
  const addedNodes = mapSlotAddedNodes.get(slot);
  const addedNodeIndex = mapAddedNodeIndex.get(node);

  if (typeof addedNodeIndex === 'number') {
    mapAddedNodeIndex.set(node, null);
    addedNodes.splice(addedNodeIndex, 1);
  } else {
    removedNodes.push(node);
    mapSlotRemovedNodes.set(slot, removedNodes);
    mapRemovedNodeIndex.set(node, removedNodeIndex);
  }
}


// Prop overrides.

const hostProps = {
  childElementCount: {
    configurable,
    get () {
      return this.children.length;
    }
  },
  childNodes: {
    get () {
      let nodes = [];
      const slots = this.__slots;
      if (slots) {
        for (let name in slots) {
          const slot = slots[name];
          const childNodes = slot.childNodes;
          const childNodesLen = childNodes.length;
          for (let a = 0; a < childNodesLen; a++) {
            nodes.push(childNodes[a]);
          }
        }
      }
      return makeLikeNodeList(nodes);
    }
  },
  children: {
    get () {
      return makeLikeNodeList(this.childNodes.filter(node => node.nodeType === 1));
    }
  },
  firstChild: {
    get () {
      return this.childNodes[0] || null;
    }
  },
  firstElementChild: {
    get () {
      return this.children[0] || null;
    }
  },
  innerHTML: {
    get () {
      return this.childNodes.map(node => node.outerHTML || node.textContent).join('');
    },
    set (val) {
      const div = document.createElement('div');
      const frag = document.createDocumentFragment();

      // TODO: This may not be foolproof with incompatible child nodes.
      div.innerHTML = val;

      // Ensure existing nodes are cleaned up properly.
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }

      // Ensures new nodes are set up properly.
      while (div.hasChildNodes()) {
        frag.appendChild(div.firstChild);
      }

      this.appendChild(frag);
    }
  },
  lastChild: {
    get () {
      const ch = this.childNodes;
      return ch[ch.length - 1] || null;
    }
  },
  lastElementChild: {
    get () {
      const ch = this.children;
      return ch[ch.length - 1] || null;
    }
  },
  outerHTML: {
    get () {
      const name = this.tagName.toLowerCase();
      const attributes = toArray(this.attributes).map(function (attr) {
        return ` ${attr.name}${attr.value ? `="${attr.value}"` : ''}`;
      }).join('');
      return `<${name}${attributes}>${this.innerHTML}</${name}>`;
    }
  },
  textContent: {
    get () {
      return this.childNodes.map(node => node.textContent).join('');
    },
    set (val) {
      // Ensure existing nodes are cleaned up properly.
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }

      doForNodesIfSlot(this, val.toString(), function (elem, node, slot) {
        slot.textContent = node;
      });
    }
  }
};

const lightProps = {
  parentElement: {
    configurable,
    get () {
      if (mapNodeIsLightDom.get(this)) {
        const parent = this.parentNode;
        return parent.nodeType === 1 ? parent : null;
      }
      return this.__parentElement;
    }
  },
  parentNode: {
    configurable,
    get () {
      return mapPolyfilledParentNode.get(this) || this.__parentNode || null;
    }
  },
  nextSibling: {
    configurable,
    get () {
      if (mapNodeIsLightDom.get(this)) {
        let index;
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;
        for (let a = 0; a < parChsLen; a++) {
          if (parChs[a] === this) {
            index = a;
            continue;
          }
        }
        return typeof index === 'number' ? parChs[index + 1] : null;
      }
      return this.__nextSibling;
    }
  },
  nextElementSibling: {
    configurable,
    get () {
      if (mapNodeIsLightDom.get(this)) {
        let next;
        while ((next = this.nextSibling)) {
          if (next.nodeType === 1) {
            return next;
          }
        }
        return null;
      }
      return this.__nextElementSibling;
    }
  },
  previousSibling: {
    configurable,
    get () {
      if (mapNodeIsLightDom.get(this)) {
        let index;
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;
        for (let a = 0; a < parChsLen; a++) {
          if (parChs[a] === this) {
            index = a;
            continue;
          }
        }
        return typeof index === 'number' ? parChs[index - 1] : null;
      }
      return this.__previousSibling;
    }
  },
  previousElementSibling: {
    configurable,
    get () {
      if (mapNodeIsLightDom.get(this)) {
        let prev;
        while ((prev = this.previousSibling)) {
          if (prev.nodeType === 1) {
            return prev;
          }
        }
        return null;
      }
      return this.__previousElementSibling;
    }
  }
};


// Method overrides.

const funcs = {
  appendChild (newNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slot.appendChild(node);
      applyParentNode(node, elem);
      addSlotNode(slot, node);
    });
    return newNode;
  },
  hasChildNodes () {
    return this.childNodes.length > 0;
  },
  insertBefore (newNode, refNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slot.insertBefore(node, refNode);
      applyParentNode(node, elem);
      addSlotNode(slot, node);
    });
    return newNode;
  },
  removeChild (refNode) {
    doForNodesIfSlot(this, refNode, function (elem, node, slot) {
      slot.removeChild(node);
      removeParentNode(node);
      removeSlotNode(slot, node);
    });
    return refNode;
  },
  replaceChild (newNode, refNode) {
    // If the ref node is not in the light DOM, just return it.
    if (refNode.parentNode !== this) {
      return refNode;
    }

    // We're dealing with a representation of the light DOM, so we insert nodes
    // relative to the location of the refNode in the light DOM, not the where
    // it appears in the composed DOM.
    const insertBefore = refNode.nextSibling;

    // Clean up the reference node.
    this.removeChild(refNode);

    // Add new nodes in place of the reference node.
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slot.insertBefore(node, insertBefore);
      applyParentNode(node, elem);
      addSlotNode(slot, node);
    });

    return refNode;
  }
};


// If we can patch native accessors, we can safely apply light DOM accessors to
// all HTML elements. This is faster than polyfilling them individually as they
// are added, if possible, and doesn't have a measurable impact on performance
// when they're not marked as light DOM.
if (canPatchNativeAccessors) {
  for (let name in lightProps) {
    const proto = nodeProto.hasOwnProperty(name) ? nodeProto : elProto;
    prop(proto, `__${name}`, Object.getOwnPropertyDescriptor(proto, name));
    prop(proto, name, lightProps[name]);
  }
}


// Patch add/removeEventListener() so that we can keep track of slotchange
// events. Since we support <slot> elements and normal elements - due to some
// quirks that cannot be polyfilled - we add this to HTMLElement.
const addEventListener = htmlElProto.addEventListener;
const removeEventListener = htmlElProto.removeEventListener;
htmlElProto.addEventListener = function (name, func, opts) {
  if (name === 'slotchange') {
    let listeners = mapSlotChangeListeners.get(this) || 0;
    mapSlotChangeListeners.set(this, ++listeners);
  }
  return addEventListener.call(this, name, func, opts);
};
htmlElProto.removeEventListener = function (name, func, opts) {
  if (name === 'slotchange') {
    let listeners = mapSlotChangeListeners.get(this) || 1;
    mapSlotChangeListeners.set(this, --listeners);
  }
  return removeEventListener.call(this, name, func, opts);
};


// Polyfills a host element.
export default function polyfill (elem) {
  if (mapPolyfilled.get(elem)) {
    return;
  }

  for (let name in hostProps) {
    prop(elem, name, hostProps[name]);
  }

  for (let name in funcs) {
    elem[name] = funcs[name];
  }

  mapPolyfilled.set(elem, true);
  return elem;
}
