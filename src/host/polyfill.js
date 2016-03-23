import { lightNodes, polyfilled, roots } from './data';
import { slots } from '../shadow/data';
import { slotAppendChild, slotInsertBefore, slotRemoveChild } from '../slot/content';
import each from '../util/each';
import fragFromHtml from '../util/frag-from-html';
import htmlFromFrag from '../util/html-from-frag';
import lightPolyfill, { cleanLightNodeState, setLightNodeState } from '../light/polyfill';

const configurable = true;


// Slotting helpers.

function arrayItem (idx) {
  return this[idx];
}

function doForNodeIfSlot (host, node, func) {
  const cachedSlots = slots.get(roots.get(host));
  const slotName = node.getAttribute && node.getAttribute('slot') || 'default';
  const slot = cachedSlots[slotName];

  if (slot) {
    func(host, node, slot);
  } else if (node.parentNode) {
    // If the node does not have a slot then we make sure that it is not
    // inserted anywhere else in the document.
    node.parentNode.removeChild(node);
  }
}

function doForNodesIfSlot (host, node, func) {
  if (node instanceof DocumentFragment) {
    while (node.hasChildNodes()) {
      doForNodeIfSlot(host, node.firstChild, func);
    }
  } else {
    doForNodeIfSlot(host, node, func);
  }
}

function makeLikeNodeList (arr) {
  arr.item = arrayItem;
  return arr;
}

function toArray (obj) {
  return Array.prototype.slice.call(obj);
}


// Member overrides.

const members = {
  appendChild: {
    value (newNode) {
      const ln = lightNodes.get(this);
      each(newNode, newNode => ln.push(newNode));
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slotAppendChild(slot, node);
        lightPolyfill(node);
        setLightNodeState(node, elem, slot);
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
      return lightNodes.get(this);
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
      const ln = lightNodes.get(this);
      each(newNode, newNode => ln.splice(ln.indexOf(refNode), 0, newNode));
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slotInsertBefore(slot, node, refNode);
        lightPolyfill(node);
        setLightNodeState(node, elem, slot);
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
      const ln = lightNodes.get(this);
      ln.splice(ln.indexOf(refNode), 1);
      doForNodesIfSlot(this, refNode, function (host, node, slot) {
        slotRemoveChild(slot, refNode);
        cleanLightNodeState(node);
      });
      return refNode;
    }
  },
  replaceChild: {
    value (newNode, refNode) {
      this.insertBefore(newNode, refNode);
      this.removeChild(refNode);
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
  lightNodes.set(host, makeLikeNodeList([]));
  Object.defineProperties(host, members);
  polyfilled.set(host, true);
  return host;
}
