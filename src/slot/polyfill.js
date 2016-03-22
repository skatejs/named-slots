import { assignedNodes, changeListeners, debouncedTriggerSlotChangeEvent, fallbackNodes, fallbackState, polyfilled } from './data';
import debounce from 'debounce';
import fragFromHtml from '../util/frag-from-html';

function getInitialFallbackContent (slot) {
  const arr = [];
  const chs = slot.childNodes;
  const chsLen = chs.length;
  for (let a = 0; a < chsLen; a++) {
    arr.push(chs[a]);
  }
  return arr;
}

function getAssignedNodesDeep (slot) {
  return assignedNodes.get(slot);
}

function shouldAffectSlot (slot) {
  return fallbackState.get(slot);
}

function triggerSlotChangeEvent (slot) {
  slot.dispatchEvent(new CustomEvent('slotchange', {
    bubbles: false,
    cancelable: false
  }));
}

const members = {
  appendChild: {
    value (newNode) {
      shouldAffectSlot(this) && this.__appendChild(newNode);
      this.childNodes.push(newNode);
      return newNode;
    }
  },
  childElementCount: {
    get () {
      return this.children.length;
    }
  },
  childNodes: {
    get () {
      return fallbackNodes.get(this);
    }
  },
  children: {
    get () {
      return this.childNodes.filter(node => node.nodeType === 1);
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
  getAssignedNodes: {
    value (opts = {}) {
      return opts.deep ? getAssignedNodesDeep(this) : assignedNodes.get(this);
    }
  },
  hasChildNodes: {
    value () {
      return !!this.childNodes.length;
    }
  },
  innerHTML: {
    get () {
      return fallbackNodes.get(this).map(node => node.outerHTML).join('');
    },
    set (innerHTML) {
      fallbackNodes.set(this, []);
      const chs = fragFromHtml(innerHTML).childNodes;
      const chsLen = chs.length;
      for (let a = chsLen - 1; a >= 0; a--) {
        this.insertBefore(chs[a], this.firstChild);
      }
    }
  },
  insertBefore: {
    value (newNode, refNode) {
      const fb = fallbackNodes.get(this);
      shouldAffectSlot(this) && this.__insertBefore(newNode, refNode);
      fb.splice(fb.indexOf(refNode), 0, newNode);
      return newNode;
    }
  },
  lastChild: {
    get () {
      const chs = this.childNodes;
      return chs[chs.length - 1] || null;
    }
  },
  lastElementChild: {
    get () {
      const chs = this.children;
      return chs[chs.length - 1] || null;
    }
  },
  name: {
    get () {
      return this.getAttribute('name');
    },
    set (name) {
      this.setAttribute('name', name);
    }
  },
  outerHTML: {
    get () {
      const attrs = this.attributes;
      const tag = this.tagName.toLowerCase();
      let str = `<${tag}`;
      if (attrs) {
        const attrsLen = attrs.length;
        for (let a = 0; a < attrsLen; a++) {
          const attr = attrs[a];
          str += ` ${attr.nodeName || attr.name}="${attr.nodeValue}"`;
        }
      }
      return str + '>' + this.innerHTML + `</${tag}>`;
    }
  },
  removeChild: {
    value (refNode) {
      const fb = fallbackNodes.get(this);
      shouldAffectSlot(this) && this.__removeChild(refNode);
      fb.splice(fb.indexOf(refNode), 1);
      return refNode;
    }
  },
  replaceChild: {
    value (newNode, refNode) {
      const fb = fallbackNodes.get(this);
      shouldAffectSlot(this) && this.__replaceChild(newNode, refNode);
      fb.splice(fb.indexOf(refNode), 1, newNode);
      return refNode;
    }
  },
  textContent: {
    get () {
      return fallbackNodes.get(this).map(node => node.textContent).join('');
    },
    set (textContent) {
      fallbackNodes.set(this, [document.createTextNode(textContent)]);
    }
  }
};

// Patch add/removeEventListener() so that we can keep track of slotchange
// events. Since we support <slot> elements and normal elements - due to some
// quirks that cannot be polyfilled - we add this to HTMLElement.
const htmlElProto = HTMLElement.prototype;
const addEventListener = htmlElProto.addEventListener;
const removeEventListener = htmlElProto.removeEventListener;
htmlElProto.addEventListener = function (name, func, opts) {
  if (name === 'slotchange') {
    let listeners = changeListeners.get(this) || 0;
    changeListeners.set(this, ++listeners);
  }
  return addEventListener.call(this, name, func, opts);
};
htmlElProto.removeEventListener = function (name, func, opts) {
  if (name === 'slotchange') {
    let listeners = changeListeners.get(this) || 1;
    changeListeners.set(this, --listeners);
  }
  return removeEventListener.call(this, name, func, opts);
};

const originalFuncs = ['appendChild', 'insertBefore', 'removeChild', 'replaceChild'];
function polyfill (slot) {
  assignedNodes.set(slot, []);
  fallbackNodes.set(slot, getInitialFallbackContent(slot));
  fallbackState.set(slot, true);
  debouncedTriggerSlotChangeEvent.set(slot, debounce(triggerSlotChangeEvent));
  originalFuncs.forEach(fn => slot['__' + fn] = slot[fn]);
  Object.defineProperties(slot, members);
}

export default function (slot) {
  if (polyfilled.get(slot)) {
    return slot;
  }
  polyfill(slot);
  polyfilled.set(slot, true);
  return slot;
}
