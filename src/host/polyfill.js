import { lightNodes, polyfilled } from './data';
import { light, parentNode } from '../light/data';
import distribute, { undistribute } from '../shadow/distribute';
import each from '../util/each';
import fragFromHtml from '../util/frag-from-html';
import htmlFromFrag from '../util/html-from-frag';
import lightPolyfill from '../light/polyfill';

const configurable = true;


// Slotting helpers.

function arrayItem (idx) {
  return this[idx];
}

function makeLikeNodeList (arr) {
  arr.item = arrayItem;
  return arr;
}

// If we append a child to a host, the host tells the shadow root to distribute
// it. If the root decides it doesn't need to be distributed, it is never
// removed from the old parent because in polyfill land we store a reference
// to the node but we don't move it. Due to that, we must explicitly remove the
// node from its old parent.
function cleanNode (node) {
  const parent = node.parentNode;
  if (parent) {
    parent.removeChild(node);
  }
}

const members = {
  appendChild: {
    value (newNode) {
      const ln = lightNodes.get(this);
      const host = this;
      cleanNode(newNode);
      each(newNode, function (node) {
        ln.push(node);
        light.set(node, true);
        parentNode.set(node, host);
        lightPolyfill(node);
        distribute(node);
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
      const host = this;
      cleanNode(newNode);
      each(newNode, function (node) {
        const index = ln.indexOf(refNode);
        if (index > -1) {
          ln.splice(index, 0, node);
        } else {
          ln.push(node);
        }
        light.set(node, true);
        parentNode.set(node, host);
        lightPolyfill(node);
        distribute(node);
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
      const attributes = Array.prototype.slice.call(this.attributes).map(function (attr) {
        return ` ${attr.name}${attr.value ? `="${attr.value}"` : ''}`;
      }).join('');
      return `<${name}${attributes}>${this.innerHTML}</${name}>`;
    }
  },
  removeChild: {
    value (refNode) {
      const ln = lightNodes.get(this);
      const index = ln.indexOf(refNode);

      if (index > -1) {
        undistribute(refNode);
        light.set(refNode, false);
        parentNode.set(refNode, null);
        ln.splice(index, 1);
      }

      return refNode;
    }
  },
  replaceChild: {
    value (newNode, refNode) {
      this.insertBefore(newNode, refNode);
      return this.removeChild(refNode);
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
