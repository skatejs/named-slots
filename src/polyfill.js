import assignFuncs from './internal/assign-funcs';
import assignProp from './internal/assign-prop';
import assignProps from './internal/assign-props';
import canPatchNativeAccessors from './internal/can-patch-native-accessors';
import copyChildNodes from './internal/copy-child-nodes';
import fragFromHtml from './internal/frag-from-html';
import getSlot from './internal/get-slot';
import htmlFromFrag from './internal/html-from-frag';
import mapNodeIsLightDom from './internal/map-node-is-light-dom';
import mapPolyfilled from './internal/map-polyfilled';
import mapPolyfilledLightNode from './internal/map-polyfilled-light-node';
import mapPolyfilledParentNode from './internal/map-polyfilled-parent-node';
import mapSlotChangeListeners from './internal/map-slot-change-listeners';
import removeChildNodes from './internal/remove-child-nodes';


const configurable = true;
const elProto = Element.prototype;
const htmlElProto = HTMLElement.prototype;
const nodeProto = Node.prototype;


// Fake parentNode helpers.

function applyParentNode (node, parent) {
  mapNodeIsLightDom.set(node, true);
  mapPolyfilledParentNode.set(node, parent);

  if (!canPatchNativeAccessors && !mapPolyfilledLightNode.get(node)) {
    mapPolyfilledLightNode.set(node, true);
    assignProps(node, lightProps);
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
    } else if (node.parentNode) {
      // If the node does not have a slot then we make sure that it is not
      // inserted anywhere else in the document.
      node.parentNode.removeChild(node);
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
          const childNodes = slot.getAssignedNodes();
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
      return htmlFromFrag(this);
    },
    set (innerHTML) {
      const copy = fragFromHtml(innerHTML);
      removeChildNodes(this);
      copyChildNodes(copy, this);
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
    set (textContent) {
      removeChildNodes(this);
      this.appendChild(document.createTextNode(textContent));
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
      slot.__appendChild(node);
      applyParentNode(node, elem);
    });
    return newNode;
  },
  hasChildNodes () {
    return this.childNodes.length > 0;
  },
  insertBefore (newNode, refNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slot.__insertBefore(node, refNode);
      applyParentNode(node, elem);
    });
    return newNode;
  },
  removeChild (refNode) {
    doForNodesIfSlot(this, refNode, function (elem, node, slot) {
      slot.__removeChild(node);
      removeParentNode(node);
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
      slot.__insertBefore(node, insertBefore);
      applyParentNode(node, elem);
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
    assignProp(proto, name, lightProps[name], '__');
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


function polyfill (host) {
  assignProps(host, hostProps);
  assignFuncs(host, funcs);
}

export default function (host) {
  if (mapPolyfilled.get(host)) {
    return;
  }
  polyfill(host);
  mapPolyfilled.set(host, true);
  return host;
}
