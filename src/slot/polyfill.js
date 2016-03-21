import * as data from './data';
import assignFuncs from '../util/assign-funcs';
import assignProps from '../util/assign-props';
import createPlaceholderFragment from '../util/create-placeholder-fragment';
import debounce from 'debounce';

function copyInitialFallbackContent (slot, frag) {
  const chs = slot.childNodes;
  const chsLen = chs.length;
  for (let a = 0; a < chsLen; a++) {
    frag.appendChild(chs[a]);
  }
}

function getAssignedNodes (slot ) {
  return data.assignedNodes.get(slot);
}

function getAssignedNodesDeep (slot) {
  return data.assignedNodes.get(slot);
}

function getFallbackNodes (slot) {
  return data.fallbackNodes.get(slot);
}

function shouldAffectSlot (slot) {
  return data.fallbackState.get(slot);
}

function triggerSlotChangeEvent (slot) {
  slot.dispatchEvent(new CustomEvent('slotchange', {
    bubbles: false,
    cancelable: false
  }));
}

const props = {
  innerHTML: {
    get () {
      return getFallbackNodes(this).innerHTML;
    },
    set (innerHTML) {
      getFallbackNodes(this).innerHTML = innerHTML;
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
      return str + '>' + getFallbackNodes(this).innerHTML + `</${tag}>`;
    }
  },
  childNodes: {
    get () {
      return getFallbackNodes(this).childNodes;
    }
  },
  firstChild: {
    get () {
      return getFallbackNodes(this).firstChild;
    }
  },
  lastChild: {
    get () {
      return getFallbackNodes(this).lastChild;
    }
  },
  textContent: {
    get () {
      return getFallbackNodes(this).textContent;
    },
    set (textContent) {
      getFallbackNodes(this).textContent = textContent;
    }
  },
  childElementCount: {
    get () {
      return getFallbackNodes(this).childElementCount;
    }
  },
  children: {
    get () {
      return getFallbackNodes(this).children;
    }
  },
  firstElementChild: {
    get () {
      return getFallbackNodes(this).firstElementChild;
    }
  },
  lastElementChild: {
    get () {
      return getFallbackNodes(this).lastElementChild;
    }
  }
};

const funcs = {
  appendChild (newNode) {
    shouldAffectSlot(this) && this.__appendChild(newNode);
    return getFallbackNodes(this).appendChild(newNode);
  },
  getAssignedNodes (opts = {}) {
    return opts.deep ? getAssignedNodesDeep(this) : getAssignedNodes(this);
  },
  hasChildNodes () {
    return getFallbackNodes(this).hasChildNodes();
  },
  insertBefore (newNode, refNode) {
    shouldAffectSlot(this) && this.__insertBefore(newNode, refNode);
    return getFallbackNodes(this).insertBefore(newNode, refNode);
  },
  removeChild (refNode) {
    shouldAffectSlot(this) && this.__removeChild(refNode);
    return getFallbackNodes(this).removeChild(refNode);
  },
  replaceChild (newNode, refNode) {
    shouldAffectSlot(this) && this.__replaceChild(newNode, refNode);
    return getFallbackNodes(this).replaceChild(newNode, refNode);
  }
};

const originalFuncs = ['appendChild', 'insertBefore', 'removeChild', 'replaceChild'];

// Patch add/removeEventListener() so that we can keep track of slotchange
// events. Since we support <slot> elements and normal elements - due to some
// quirks that cannot be polyfilled - we add this to HTMLElement.
const htmlElProto = HTMLElement.prototype;
const addEventListener = htmlElProto.addEventListener;
const removeEventListener = htmlElProto.removeEventListener;
htmlElProto.addEventListener = function (name, func, opts) {
  if (name === 'slotchange') {
    let listeners = data.changeListeners.get(this) || 0;
    data.changeListeners.set(this, ++listeners);
  }
  return addEventListener.call(this, name, func, opts);
};
htmlElProto.removeEventListener = function (name, func, opts) {
  if (name === 'slotchange') {
    let listeners = data.changeListeners.get(this) || 1;
    data.changeListeners.set(this, --listeners);
  }
  return removeEventListener.call(this, name, func, opts);
};

function polyfill (slot) {
  const fragAssignedNodes = createPlaceholderFragment();
  const fragFallbackNodes = createPlaceholderFragment();
  data.assignedNodes.set(slot, fragAssignedNodes);
  data.fallbackNodes.set(slot, fragFallbackNodes);
  data.fallbackState.set(slot, true);
  data.debouncedTriggerSlotChangeEvent.set(slot, debounce(triggerSlotChangeEvent));
  copyInitialFallbackContent(slot, fragFallbackNodes);
  assignProps(slot, props);
  originalFuncs.forEach(fn => slot['__' + fn] = slot[fn]);
  assignFuncs(slot, funcs);
}

export default function (slot) {
  if (data.polyfilled.get(slot)) {
    return slot;
  }
  polyfill(slot);
  data.polyfilled.set(slot, true);
  return slot;
}
