import { polyfilled } from './data';
import { assignedSlot, parentNode, slotted } from '../light/data';
import { appendChild, insertBefore, removeChild } from '../slot/content';
import fragFromHtml from '../util/frag-from-html';
import getSlot from './get-slot';
import htmlFromFrag from '../util/html-from-frag';
import lightPolyfill from '../light/polyfill';


const configurable = true;


// Things like:
//
//   - faking `parentNode`
//   - setting `assignedSlot`

function setNodeState (node, parent, slot) {
  slotted.set(node, true);
  parentNode.set(node, parent);
  assignedSlot.set(node, slot);
  lightPolyfill(node);
}

function cleanNodeState (node) {
  slotted.set(node, false);
  parentNode.set(node, null);
  assignedSlot.set(node, null);
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


// Member overrides.

const members = {
  appendChild: {
    value (newNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        appendChild(slot, node);
        setNodeState(node, elem, slot);
      });
      return newNode;
    }
  },
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
  hasChildNodes: {
    value () {
      return this.childNodes.length > 0;
    }
  },
  innerHTML: {
    get () {
      return htmlFromFrag(this);
    },
    set (innerHTML) {
      const copy = fragFromHtml(innerHTML);
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      while (copy.hasChildNodes()) {
        this.appendChild(copy.firstChild);
      }
    }
  },
  insertBefore: {
    value (newNode, refNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        insertBefore(slot, node, refNode);
        setNodeState(node, elem, slot);
      });
      return newNode;
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
  removeChild: {
    value (refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        removeChild(slot, node);
        cleanNodeState(node);
      });
      return refNode;
    }
  },
  replaceChild: {
    value (newNode, refNode) {
      // If the ref node is not in the light DOM, just return it.
      if (refNode.parentNode !== this) {
        return refNode;
      }

      // We're dealing with a representation of the light DOM, so we insert nodes
      // relative to the location of the refNode in the light DOM, not the where
      // it appears in the composed DOM.
      const insertBeforeSibling = refNode.nextSibling;

      // Remove, but since we're calling our defined removeChild, this also cleans
      // up the node so we don't have to do it.
      this.removeChild(refNode);

      // Add new nodes in place of the reference node.
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        insertBefore(slot, node, insertBeforeSibling);
        setNodeState(node, elem, slot);
      });

      return refNode;
    }
  },
  textContent: {
    get () {
      return this.childNodes.map(node => node.textContent).join('');
    },
    set (textContent) {
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      this.appendChild(document.createTextNode(textContent));
    }
  }
};

export default function (host) {
  if (polyfilled.get(host)) {
    return;
  }
  Object.defineProperties(host, members);
  polyfilled.set(host, true);
  return host;
}
