import debounce from 'debounce';
import each from './util/each';
import version from './version';


const defaultShadowRootTagName = '_shadow_root_';


// Parse HTML natively.

const parser = new DOMParser;

function convertXmlToHtml (node) {
  const { nodeType } = node;
  if (nodeType === 1) {
    const copy = document.createElement(node.tagName);
    for (let a = 0; a < node.attributes.length; a++) {
      const attr = node.attributes[a];
      copy.setAttribute(attr.name, attr.value);
    }
    for (let a = 0; a < node.childNodes.length; a++) {
      const childNode = node.childNodes[a];
      copy.appendChild(convertXmlToHtml(childNode));
    }
    return copy;
  }
  return node;
}

function parse (html) {
  const tree = document.createElement('div');
  const parsed = parser.parseFromString(html, 'text/xml');
  while (parsed.hasChildNodes()) {
    const firstChild = parsed.firstChild;
    parsed.removeChild(firstChild);
    tree.appendChild(convertXmlToHtml(firstChild));
  }
  return tree;
}


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

function isHostNode (node) {
  return !!node.____rootNode;
}

function isShadowNode (node) {
  return !!node.____hostNode;
}

function isSlotNode (node) {
  return node.tagName === 'SLOT';
}

function findClosest (node, func) {
  while (node) {
    if (node === document) {
      break;
    }
    if (func(node)) {
      return node;
    }
    node = node.parentNode;
  }
}

function findClosestShadowRoot (node) {
  return findClosest(node, isShadowNode);
}

function staticProp (node, prop, value) {
  Object.defineProperty(node, prop, {
    configurable: true,
    get () {
      return value;
    }
  });
}

function getSlotNameFromSlot (node) {
  return node.getAttribute && node.getAttribute('name') || 'default';
}

function getSlotNameFromNode (node) {
  return node.getAttribute && node.getAttribute('slot') || 'default';
}

function slotNodeIntoSlot (slot, node, insertBefore) {
  const slotInsertBeforeIndex = slot.____assignedNodes.indexOf(insertBefore);
  const assignedNodes = slot.____assignedNodes;
  const fallbackNodes = slot.childNodes;

  staticProp(node, 'assignedSlot', slot);

  // If there's currently no assigned nodes, there will be, so remove all fallback content.
  if (!assignedNodes.length) {
    slot.____isInFallbackMode = false;
    fallbackNodes.forEach(fallbackNode => slot.__removeChild(fallbackNode));
  }

  if (slotInsertBeforeIndex > -1) {
    if (!slot.____isInFallbackMode) {
      slot.__insertBefore(node, insertBefore);
    }

    assignedNodes.splice(slotInsertBeforeIndex, 0, node);
  } else {
    if (!slot.____isInFallbackMode) {
      slot.__appendChild(node);
    }

    assignedNodes.push(node);
  }

  slot.____triggerSlotChangeEvent();
}

function slotNodeFromSlot (node) {
  const slot = node.assignedSlot;

  if (slot) {
    const index = slot.____assignedNodes.indexOf(node);

    if (index > -1) {
      const assignedNodes = slot.____assignedNodes;

      assignedNodes.splice(index, 1);
      staticProp(node, 'assignedSlot', null);

      // We only update the actual DOM representation if we're displaying
      // slotted nodes.
      if (!slot.____isInFallbackMode) {
        slot.__removeChild(node);
      }

      // If this was the last slotted node, then insert fallback content.
      if (!assignedNodes.length) {
        slot.____isInFallbackMode = true;
        slot.childNodes.forEach(fallbackNode => slot.__appendChild(fallbackNode));
      }

      slot.____triggerSlotChangeEvent();
    }
  }
}

// Adds the node to the list of childNodes on the host and fakes any necessary
// information such as parentNode.
function registerNode (host, node, insertBefore, func) {
  const index = host.childNodes.indexOf(insertBefore);
  each(node, function (eachNode, eachIndex) {
    func(eachNode, eachIndex);
    staticProp(eachNode, 'parentNode', host);
    if (index > -1) {
      host.childNodes.splice(index + eachIndex, 0, eachNode);
    } else {
      host.childNodes.push(eachNode);
    }
  });
}

// Cleans up registerNode().
function unregisterNode (host, node, func) {
  const index = host.childNodes.indexOf(node);
  if (index > -1) {
    func(node, 0);
    staticProp(node, 'parentNode', null);
    host.childNodes.splice(index, 1);
  }
}

function addNodeToNode (host, node, insertBefore) {
  registerNode(host, node, insertBefore, function (eachNode) {
    host.__insertBefore(eachNode, insertBefore);
  });
}

function addNodeToHost (host, node, insertBefore) {
  registerNode(host, node, insertBefore, function (eachNode) {
    const slotNode = host.____rootNode.____slotNodes[getSlotNameFromNode(eachNode)];
    if (slotNode) {
      slotNodeIntoSlot(slotNode, eachNode, insertBefore);
    }
  });
}

function addNodeToRoot (root, node, insertBefore) {
  each(node, function (node) {
    if (isSlotNode(node)) {
      addSlotToRoot(root, node);
    } else {
      const slotNodes = node.querySelectorAll && node.querySelectorAll('slot');
      const slotNodesLen = slotNodes.length;
      for (let a = 0; a < slotNodesLen; a++) {
        addSlotToRoot(root, slotNodes[a]);
      }
    }
  });
  addNodeToNode(root, node, insertBefore);
}

function addSlotToRoot (root, node) {
  const slotName = getSlotNameFromSlot(node);
  node.____isInFallbackMode = true;
  root.____slotNodes[slotName] = node;
  root.____hostNode.childNodes.forEach(function (eachNode) {
    if (!eachNode.assignedSlot && slotName === getSlotNameFromNode(eachNode)) {
      slotNodeIntoSlot(node, eachNode);
    }
  });
}

function removeNodeFromNode (host, node) {
  unregisterNode(host, node, function () {
    host.__removeChild(node);
  });
}

function removeNodeFromHost (host, node) {
  unregisterNode(host, node, function () {
    slotNodeFromSlot(node);
  });
}

function removeNodeFromRoot (root, node) {
  unregisterNode(root, node, function () {
    if (isSlotNode(node)) {
      removeSlotFromRoot(root, node);
    } else {
      const nodes = node.querySelectorAll && node.querySelectorAll('slot');
      for (let a = 0; a < nodes.length; a++) {
        removeSlotFromRoot(root, nodes[a]);
      }
    }
  });
}

function removeSlotFromRoot (root, node) {
  node.____assignedNodes.forEach(slotNodeFromSlot);
  delete root.____slotNodes[getSlotNameFromSlot(node)];
}

function appendChildOrInsertBefore (host, newNode, refNode) {
  let closestRoot;

  cleanNode(newNode);

  if (isHostNode(host)) {
    addNodeToHost(host, newNode, refNode);
  } else if (isSlotNode(host)) {
    addNodeToNode(host, newNode, refNode);
  } else if ((closestRoot = findClosestShadowRoot(host))) {
    addNodeToRoot(closestRoot, newNode, refNode);
  } else {
    addNodeToNode(host, newNode, refNode);
  }
}

const members = {
  ____assignedNodes: {
    get () {
      return this.______assignedNodes || (this.______assignedNodes = []);
    }
  },
  ____slotChangeListeners: {
    get () {
      if (typeof this.______slotChangeListeners === 'undefined') {
        this.______slotChangeListeners = 0;
      }
      return this.______slotChangeListeners;
    },
    set (value) {
      this.______slotChangeListeners = value;
    }
  },
  ____triggerSlotChangeEvent: {
    value: debounce(function () {
      if (this.____slotChangeListeners) {
        this.dispatchEvent(new CustomEvent('slotchange', {
          bubbles: false,
          cancelable: false
        }));
      }
    })
  },
  addEventListener: {
    value (name, func, opts) {
      if (name === 'slotchange') {
        this.____slotChangeListeners++;
      }
      return this.__addEventListener(name, func, opts);
    }
  },
  appendChild: {
    value (newNode) {
      return appendChildOrInsertBefore(this, newNode);
    }
  },
  assignedSlot: {
    get () {
      return null;
    }
  },
  attachShadow: {
    value (opts) {
      const mode = opts && opts.mode;
      if (mode !== 'closed' && mode !== 'open') {
        throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
      }

      const existingShadowRoot = this.____shadowRoot;
      if (existingShadowRoot) {
        return existingShadowRoot;
      }

      const shadowRoot = document.createElement(opts.polyfillShadowRootTagName || defaultShadowRootTagName);

      // Emulating the spec { mode }.
      Object.defineProperty(this, 'shadowRoot', {
        configurable: true,
        get () {
          return mode === 'open' ? shadowRoot : null;
        }
      });

      // Host and shadow root data.
      this.____rootNode = shadowRoot;
      this.____unslottedNodes = this.childNodes.concat();
      shadowRoot.____hostNode = this;
      shadowRoot.____slotNodes = [];

      // The shadow root is actually the only child of the host.
      return this.__appendChild(shadowRoot);
    }
  },
  childElementCount: {
    get () {
      return this.children.length;
    }
  },
  childNodes: {
    get () {
      return this.____childNodes || (this.____childNodes = makeLikeNodeList([]));
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
  getAssignedNodes: {
    value () {
      return this.____assignedNodes || [];
    }
  },
  hasChildNodes: {
    value () {
      return this.childNodes.length > 0;
    }
  },
  innerHTML: {
    get () {
      return this.childNodes.reduce(function (prev, curr) {
        return prev + (curr.nodeType === 1 ? curr.outerHTML : curr.textContent);
      }, '');
    },
    set (innerHTML) {
      const parsed = parse(innerHTML);

      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }

      while (parsed.hasChildNodes()) {
        const firstChild = parsed.firstChild;

        // When we polyfill everything on HTMLElement.prototype, we overwrite
        // properties. This makes it so that parentNode reports null even though
        // it's actually a parent of the HTML parser. For this reason,
        // cleanNode() won't work and we must manually remove it from the
        // parser before it is moved to the host just in case it's added as a
        // light node but not assigned to a slot.
        parsed.removeChild(firstChild);

        this.appendChild(firstChild);
      }
    }
  },
  insertBefore: {
    value (newNode, refNode) {
      return appendChildOrInsertBefore(this, newNode, refNode);
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
  name: {
    get () {
      return this.getAttribute('name');
    },
    set (name) {
      return this.setAttribute('name', name);
    }
  },
  nextSibling: {
    get () {
      const parentNode = this.parentNode;
      if (parent) {
        const childNodes = parentNode.childNodes;
        return childNodes[childNodes.indexOf(this) + 1] || null;
      }
      return null;
    }
  },
  nextElementSibling: {
    get () {
      let nextSibling = this;
      while ((nextSibling = nextSibling.nextSibling)) {
        if (nextSibling.nodeType === 1) {
          return nextSibling;
        }
      }
      return null;
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
  parentElement: {
    get () {
      return findClosest(this.parentNode, function (node) {
        return node.nodeType === 1;
      });
    }
  },
  previousSibling: {
    get () {
      const parentNode = this.parentNode;
      if (parent) {
        const childNodes = parentNode.childNodes;
        return childNodes[childNodes.indexOf(this) - 1] || null;
      }
      return null;
    }
  },
  previousElementSibling: {
    get () {
      let previousSibling = this;
      while ((previousSibling = previousSibling.previousSibling)) {
        if (previousSibling.nodeType === 1) {
          return previousSibling;
        }
      }
      return null;
    }
  },
  removeChild: {
    value (refNode) {
      let closestRoot;

      if (isHostNode(this)) {
        removeNodeFromHost(this, refNode);
      } else if (isSlotNode(this)) {
        removeNodeFromNode(this, refNode);
      } else if ((closestRoot = findClosestShadowRoot(this))) {
        removeNodeFromRoot(closestRoot, refNode);
      } else {
        removeNodeFromNode(this, refNode);
      }
    }
  },
  removeEventListener: {
    value (name, func, opts) {
      if (name === 'slotchange' && this.____slotChangeListeners) {
        this.____slotChangeListeners--;
      }
      return this.__removeEventListener(name, func, opts);
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


const protos = [Node, Element, EventTarget];
function findDescriptorFor (name) {
  for (let a = 0; a < protos.length; a++) {
    const proto = protos[a].prototype;
    if (proto.hasOwnProperty(name)) {
      return Object.getOwnPropertyDescriptor(proto, name);
    }
  }
}

if (!('attachShadow' in document.createElement('div'))) {
  const elementProto = HTMLElement.prototype;
  Object.keys(members).forEach(function (memberName) {
    const memberProperty = members[memberName];
    const nativeDescriptor = findDescriptorFor(memberName);
    memberProperty.configurable = true;
    Object.defineProperty(elementProto, memberName, memberProperty);
    if (nativeDescriptor && nativeDescriptor.configurable) {
      Object.defineProperty(elementProto, '__' + memberName, nativeDescriptor);
    }
  });
}

export default version;