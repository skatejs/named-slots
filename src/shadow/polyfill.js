import { hosts, slots } from './data';
import { roots } from '../host/data';
import { slotAppendChild, slotRemoveChild } from '../slot/content';
import each from '../util/each';
import fragFromHtml from '../util/frag-from-html';
import htmlFromFrag from '../util/html-from-frag';
import hostPolyfill from '../host/polyfill';
import slotPolyfill from '../slot/polyfill';

const { appendChild, insertBefore, removeChild, replaceChild } = Node.prototype;

function getLightDomFromHostForSlot (root, slot) {
  const frag = document.createDocumentFragment();
  const host = root.host;
  const hostChs = host.childNodes;
  const hostChsLen = host.childNodes.length;
  for (let a = 0; a < hostChsLen; a++) {
    const ch = hostChs[a];
    if (ch.nodeType === 3 && !slot || (ch.getAttribute && ch.getAttribute('slot') === slot)) {
      frag.appendChild(ch);
    }
  }
  return frag;
}

// Takes the shadow root and caches the slots it has.
function cacheSlots (root, node) {
  const oldSlots = slots.get(root);
  if (node.tagName === 'SLOT') {
    slotPolyfill(node);
    oldSlots[node.name || 'default'] = node;
    each(getLightDomFromHostForSlot(root, node.name), aNode => slotAppendChild(node, aNode));
  } else {
    const newSlots = node.querySelectorAll('slot');
    const newSlotsLen = newSlots.length;
    for (let a = 0; a < newSlotsLen; a++) {
      cacheSlots(root, newSlots[a]);
    }
  }
}

function uncacheSlots (root, node) {
  const oldSlots = slots.get(root);
  if (node.tagName === 'SLOT') {
    delete oldSlots[node.name || 'default'];
    node.getAssignedNodes().forEach(aNode => slotRemoveChild(node, aNode));
  } else if (node.nodeType === 1) {
    const newSlots = node.querySelectorAll('slot');
    const newSlotsLen = newSlots.length;
    for (let a = 0; a < newSlotsLen; a++) {
      uncacheSlots(root, newSlots[a]);
    }
  }
}

// Returns a document fragment of the childNodes of the specified element. Due
// to the nature of the DOM, this will remove the nodes from the element.
function createFragmentFromChildNodes (elem) {
  const frag = document.createDocumentFragment();
  while (elem.hasChildNodes()) {
    frag.appendChild(elem.firstChild);
  }
  return frag;
}

// Creates an shadow root, appends it to the element and returns it.
function createShadowRoot (elem) {
  const root = document.createElement(isBlockLevel(elem) ? 'div' : 'span');
  elem.appendChild(root);
  return root;
}

// Returns whether or not the specified element is a block level element or not
// We need this to determine the type of element the shadow root should be
// since we must use real nodes to simulate a shadow root.
function isBlockLevel (elem) {
  return window.getComputedStyle(elem).display === 'block';
}

const members = {
  appendChild: {
    configurable: true,
    value (newNode) {
      const ret = appendChild.call(this, newNode);
      cacheSlots(this, newNode);
      return ret;
    }
  },
  host: {
    configurable: true,
    get () {
      return hosts.get(this);
    }
  },
  innerHTML: {
    configurable: true,
    get () {
      return htmlFromFrag(this);
    },
    set (innerHTML) {
      const frag = fragFromHtml(innerHTML);
      while (frag.hasChildNodes()) {
        this.appendChild(frag.firstChild);
      }
    }
  },
  insertBefore: {
    configurable: true,
    value (newNode, refNode) {
      const ret = insertBefore.call(this, newNode, refNode);
      cacheSlots(this, newNode);
      return ret;
    }
  },
  removeChild: {
    configurable: true,
    value (refNode) {
      const ret = removeChild.call(this, refNode);
      uncacheSlots(this, refNode);
      return ret;
    }
  },
  replaceChild: {
    configurable: true,
    value (newNode, refNode) {
      const ret = replaceChild.call(this, newNode, refNode);
      cacheSlots(this, newNode);
      uncacheSlots(this, refNode);
      return ret;
    }
  }
};

export default function (host, { mode } = {}) {
  if (host.shadowRoot) {
    return host.shadowRoot;
  }

  const shadowRoot = createShadowRoot(host);
  const initialLightDom = createFragmentFromChildNodes(host);

  // Host and shadow root data.
  hosts.set(shadowRoot, host);
  roots.set(host, shadowRoot);
  slots.set(shadowRoot, {});

  // Emulating the spec { mode }.
  Object.defineProperty(host, 'shadowRoot', {
    configurable: true,
    get () {
      return mode === 'open' ? shadowRoot : null;
    }
  });

  // The shadow root is actually the only child of the host.
  host.appendChild(shadowRoot);

  // Now polyfill the shadow root so that we can cache slots.
  Object.defineProperties(shadowRoot, members);

  // Polyfill the host.
  hostPolyfill(host);

  // Finally, insert the initial light DOM content so it's distributed.
  host.appendChild(initialLightDom);

  return shadowRoot;
}