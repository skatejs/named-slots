import * as hostData from './data';
import * as lightData from '../light/data';
import * as slotFuncs from '../slot/content';
import assignFuncs from '../util/assign-funcs';
import assignProps from '../util/assign-props';
import fragFromHtml from '../util/frag-from-html';
import getSlot from './get-slot';
import htmlFromFrag from '../util/html-from-frag';
import polyfillLight from '../light/polyfill';


const configurable = true;


// Fake parentNode helpers.

function applyParentNode (node, parent) {
  lightData.slotted.set(node, true);
  lightData.parentNode.set(node, parent);
  polyfillLight(node);
}

function removeParentNode (node) {
  lightData.slotted.set(node, false);
  lightData.parentNode.set(node, null);
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
          const childNodes = slot.getAssignedNodes().childNodes;
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
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      while (copy.hasChildNodes()) {
        this.appendChild(copy.firstChild);
      }
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
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      this.appendChild(document.createTextNode(textContent));
    }
  }
};


// Method overrides.

const funcs = {
  appendChild (newNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slotFuncs.appendChild(slot, node);
      applyParentNode(node, elem);
    });
    return newNode;
  },
  hasChildNodes () {
    return this.childNodes.length > 0;
  },
  insertBefore (newNode, refNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slotFuncs.insertBefore(slot, node, refNode);
      applyParentNode(node, elem);
    });
    return newNode;
  },
  removeChild (refNode) {
    doForNodesIfSlot(this, refNode, function (elem, node, slot) {
      slotFuncs.removeChild(slot, node);
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
      slotFuncs.insertBefore(slot, node, insertBefore);
      applyParentNode(node, elem);
    });

    return refNode;
  }
};


function polyfill (host) {
  assignProps(host, hostProps);
  assignFuncs(host, funcs);
}

export default function (host) {
  if (hostData.polyfilled.get(host)) {
    return;
  }
  polyfill(host);
  hostData.polyfilled.set(host, true);
  return host;
}
