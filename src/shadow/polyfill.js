import { hosts, roots, slots } from './data';
import { appendChild, insertBefore, removeChild, replaceChild } from '../util/node';
import distribute, { undistribute } from './distribute';
import elemProto from '../util/element';
import fragFromHtml from '../util/frag-from-html';
import htmlFromFrag from '../util/html-from-frag';
import hostPolyfill from '../host/polyfill';
import slotPolyfill from '../slot/polyfill';


const defaultShadowRootTagName = '_shadow_root_';


// Returns a document fragment of the childNodes of the specified element. Due
// to the nature of the DOM, this will remove the nodes from the element.
function createFragmentFromChildNodes (elem) {
  const frag = document.createDocumentFragment();
  while (elem.hasChildNodes()) {
    frag.appendChild(elem.firstChild);
  }
  return frag;
}


// Takes the shadow root and caches the slots it has.
function cacheSlots (root, node) {
  const oldSlots = slots.get(root);
  if (node.tagName === 'SLOT') {
    slotPolyfill(node);
    oldSlots[node.name || 'default'] = node;

    const host = hosts.get(root);
    const hostChs = host.childNodes;
    const hostChsLen = hostChs.length;
    for (let a = 0; a < hostChsLen; a++) {
      const ch = hostChs[a];
      if (!ch.assignedSlot) {
        distribute(ch);
      }
    }
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
    node.getAssignedNodes().forEach(aNode => undistribute(aNode));
    delete oldSlots[node.name || 'default'];
  } else if (node.nodeType === 1) {
    const newSlots = node.querySelectorAll('slot');
    const newSlotsLen = newSlots.length;
    for (let a = 0; a < newSlotsLen; a++) {
      uncacheSlots(root, newSlots[a]);
    }
  }
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


// Polyfill the native `attachShadow()` method if it doesn't exist.
if (!elemProto.attachShadow) {
  elemProto.attachShadow = function (opts) {
    const mode = opts && opts.mode;
    if (mode !== 'closed' && mode !== 'open') {
      throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
    }
    return polyfill(this, opts);
  };
}


export default function polyfill (host, { mode, polyfillShadowRootTagName } = {}) {
  const existingShadowRoot = roots.get(host);

  if (existingShadowRoot) {
    return existingShadowRoot;
  }

  const shadowRoot = document.createElement(polyfillShadowRootTagName || defaultShadowRootTagName);
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
