import assignFuncs from './assign-funcs';
import assignProps from './assign-props';
import copyChildNodes from './copy-child-nodes';
import debounce from 'debounce';
import mapPolyfilled from './map-polyfilled';
import mapSlotAssignedNodes from './map-slot-assigned-nodes';
import WeakMap from './weak-map';

const fragments = new WeakMap();

function fallback (slot) {
  return fragments.get(slot);
}

function getAssignedNodes (slot) {
  return mapSlotAssignedNodes.get(slot);
}

function getAssignedNodesDeep (slot) {
  return getAssignedNodes(slot);
}

function triggerSlotChangeEvent () {
  this.dispatchEvent(new CustomEvent('slotchange', {
    bubbles: false,
    cancelable: false
  }));
}

const props = {
  innerHTML: {
    get () {
      return fallback(this).innerHTML;
    },
    set (innerHTML) {
      fallback(this).innerHTML = innerHTML;
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
      let attrs = this.attributes;
      let str = '<slot';
      if (attrs) {
        const attrsLen = attrs.length;
        for (let a = 0; a < attrsLen; a++) {
          const attr = attrs[a];
          str += `${attr.nodeName || attr.name}="${attr.nodeValue}"`;
        }
      }
      return str + '>' + fallback(this).innerHTML + '</slot>';
    }
  },
  childNodes: {
    get () {
      return fallback(this).childNodes;
    }
  },
  firstChild: {
    get () {
      return fallback(this).firstChild;
    }
  },
  lastChild: {
    get () {
      return fallback(this).lastChild;
    }
  },
  textContent: {
    get () {
      return fallback(this).textContent;
    },
    set (textContent) {
      fallback(this).textConten = textContent;
    }
  },
  childElementCount: {
    get () {
      return fallback(this).childElementCount;
    }
  },
  children: {
    get () {
      return fallback(this).children;
    }
  },
  firstElementChild: {
    get () {
      return fallback(this).firstElementChild;
    }
  },
  lastElementChild: {
    get () {
      return fallback(this).lastElementChild;
    }
  }
};
const funcs = {
  __appendChild (newNode) {
    const assigned = mapSlotAssignedNodes.get(this);
    assigned.push(newNode);
    return this.____appendChild(newNode);
  },
  __insertBefore (newNode, refNode) {
    const assigned = mapSlotAssignedNodes.get(this);
    assigned.splice(assigned.indexOf(refNode), 0, newNode);
    return this.____insertBefore(newNode, refNode);
  },
  __removeChild (refNode) {
    const assigned = mapSlotAssignedNodes.get(this);
    assigned.splice(assigned.indexOf(refNode), 1);
    return this.____removeChild(refNode);
  },
  appendChild (newNode) {
    return fallback(this).appendChild(newNode);
  },
  getAssignedNodes (opts = {}) {
    return opts.deep ? getAssignedNodesDeep(this) : getAssignedNodes(this);
  },
  hasChildNodes () {
    return fallback(this).hasChildNodes();
  },
  insertBefore (newNode, refNode) {
    return fallback(this).insertBefore(newNode, refNode);
  },
  removeChild (refNode) {
    return fallback(this).removeChild(refNode);
  },
  replaceChild (newNode, refNode) {
    return fallback(this).replaceChild(newNode, refNode);
  }
};

function polyfill (slot) {
  const frag = document.createElement('div');
  mapSlotAssignedNodes.set(slot, []);
  fragments.set(slot, frag);
  copyChildNodes(slot, frag);
  assignProps(slot, props);
  assignFuncs(slot, funcs, '____');
  slot.__triggerSlotChangeEvent = debounce(triggerSlotChangeEvent);
}

export default function (slot) {
  if (mapPolyfilled.get(slot)) {
    return slot;
  }
  polyfill(slot);
  mapPolyfilled.set(slot, true);
  return slot;
}
