import getSlot from './internal/get-slot';
import mapPolyfilled from './internal/map-polyfilled';
import mapSlotAddedNodes from './internal/map-slot-added-nodes';
import mapSlotRemovedNodes from './internal/map-slot-removed-nodes';
import prop from './internal/prop';

const configurable = true;

// Cached prototypes.
const elProto = Element.prototype;
const htmlElProto = HTMLElement.prototype;
const nodeProto = Node.prototype;

// Cached descriptor getters.
const descEl = Object.getOwnPropertyDescriptor.bind(Object, elProto);
const descNode = Object.getOwnPropertyDescriptor.bind(Object, nodeProto);

// Properties that must be applied to descendants.
const descendantAccessors = {
  // Natives.
  __nextElementSibling: descEl('nextElementSibling'),
  __nextSibling: descNode('nextSibling'),
  __parentElement: descNode('parentElement'),
  __parentNode: descNode('parentNode'),
  __previousElementSibling: descEl('nextElementSibling'),
  __previousSibling: descNode('previousSibling'),

  // Polyfills.
  parentElement: {
    configurable,
    get () {
      if (this.__isLightDom) {
        const parent = this.parentNode;
        return parent.nodeType === 1 ? parent : null;
      }
      return this.__parentElement;
    }
  },
  parentNode: {
    configurable,
    get () {
      return this.__polyfilledParentNode || this.__parentNode || null;
    }
  },
  nextSibling: {
    configurable,
    get () {
      if (this.__isLightDom) {
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
      if (this.__isLightDom) {
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
      if (this.__isLightDom) {
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
      if (this.__isLightDom) {
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

// WebKit, this is because of you.
const canPatchNativeAccessors = !!descendantAccessors.__parentNode.get;


// Helpers.

function applyParentNode (node, parent) {
  node.__isLightDom = true;
  node.__polyfilledParentNode = parent;
  if (!canPatchNativeAccessors && !node.__isPolyfilledPoorly) {
    node.__isPolyfilledPoorly = true;
    Object.defineProperties(node, descendantAccessors);
  }
}

function removeParentNode (node) {
  node.__isLightDom = false;
  node.__polyfilledParentNode = null;
}

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
      if (slot.hasAttribute('emit')) {
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


// Prop overrides.

const props = {
  childElementCount: {
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


// Method overrides.

function addSlotNode (slot, node) {
  if (slot.hasAttribute('emit')) {
    const addedNodes = mapSlotAddedNodes.get(slot) || [];
    addedNodes.push(node);
    mapSlotAddedNodes.set(slot, addedNodes);
  }
}

function removeSlotNode (slot, node) {
  if (slot.hasAttribute('emit')) {
    const removedNodes = mapSlotRemovedNodes.get(slot) || [];
    removedNodes.push(node);
    mapSlotRemovedNodes.set(slot, removedNodes);
  }
}

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


// Polyfill the prototypes if we can.
if (canPatchNativeAccessors) {
  // Patch the HTMLElement prototype if we can as it's the highest in the
  // prototype chain we need to worry about.
  Object.defineProperties(htmlElProto, descendantAccessors);
}


// Polyfills an element.
export default function (elem) {
  if (mapPolyfilled.get(elem)) {
    return;
  }

  // Polyfill properties.
  for (let name in props) {
    prop(elem, name, props[name]);
  }

  // Polyfill methods.
  for (let name in funcs) {
    elem[name] = funcs[name];
  }

  mapPolyfilled.set(elem, true);
  return elem;
}
