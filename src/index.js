import debounce from 'debounce';
import each from './util/each';
import version from './version';


const defaultShadowRootTagName = '_shadow_root_';
const defaultShadowRootTagNameUc = defaultShadowRootTagName.toUpperCase();

const assignedToSlotMap = new WeakMap();
const hostToRootMap = new WeakMap();
const nodeToChildNodesMap = new WeakMap();
const nodeToSlotMap = new WeakMap();
const rootToHostMap = new WeakMap();
const rootToSlotMap = new WeakMap();
const slotToModeMap = new WeakMap();


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
  return !!hostToRootMap.get(node);
}

function isShadowNode (node) {
  return node.tagName === defaultShadowRootTagNameUc;
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
  const assignedNodes = slot.getAssignedNodes();
  const fallbackNodes = slot.childNodes;
  const slotInsertBeforeIndex = assignedNodes.indexOf(insertBefore);

  nodeToSlotMap.set(node, slot);

  // If there's currently no assigned nodes, there will be, so remove all fallback content.
  if (!assignedNodes.length) {
    slotToModeMap.set(slot, false);
    fallbackNodes.forEach(fallbackNode => slot.__removeChild(fallbackNode));
  }

  const shouldAffectSlot = !slotToModeMap.get(slot);

  if (slotInsertBeforeIndex > -1) {
    if (shouldAffectSlot) {
      slot.__insertBefore(node, insertBefore);
    }

    assignedNodes.splice(slotInsertBeforeIndex, 0, node);
  } else {
    if (shouldAffectSlot) {
      slot.__appendChild(node);
    }

    assignedNodes.push(node);
  }

  slot.____triggerSlotChangeEvent();
}

function slotNodeFromSlot (node) {
  const slot = node.assignedSlot;

  if (slot) {
    const assignedNodes = slot.getAssignedNodes();
    const index = assignedNodes.indexOf(node);

    if (index > -1) {
      assignedNodes.splice(index, 1);
      nodeToSlotMap.set(node, null);

      const shouldAffectSlot = !slotToModeMap.get(slot);

      // We only update the actual DOM representation if we're displaying
      // slotted nodes.
      if (shouldAffectSlot) {
        slot.__removeChild(node);
      }

      // If this was the last slotted node, then insert fallback content.
      if (!assignedNodes.length) {
        slotToModeMap.set(slot, true);
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
    const rootNode = hostToRootMap.get(host);
    const slotNodes = rootToSlotMap.get(rootNode);
    const slotNode = slotNodes[getSlotNameFromNode(eachNode)];
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
  slotToModeMap.set(node, true);
  rootToSlotMap.get(root)[slotName] = node;
  rootToHostMap.get(root).childNodes.forEach(function (eachNode) {
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
  node.getAssignedNodes().forEach(slotNodeFromSlot);
  delete rootToSlotMap.get(root)[getSlotNameFromSlot(node)];
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
  // For testing purposes.
  ____assignedNodes: {
    get () {
      return this.______assignedNodes || (this.______assignedNodes = []);
    }
  },

  // For testing purposes.
  ____isInFallbackMode: {
    get () {
      return slotToModeMap.get(this);
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
      return nodeToSlotMap.get(this) || null;
    }
  },
  attachShadow: {
    value (opts) {
      const mode = opts && opts.mode;
      if (mode !== 'closed' && mode !== 'open') {
        throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
      }

      const existingShadowRoot = hostToRootMap.get(this);
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
      hostToRootMap.set(this, shadowRoot);
      rootToSlotMap.set(shadowRoot, {});
      rootToHostMap.set(shadowRoot, this);

      // Remove all current nodes as they may be slotted later.
      this.childNodes.forEach(node => this.__removeChild(node));

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
      let childNodes = nodeToChildNodesMap.get(this);
      childNodes || nodeToChildNodesMap.set(this, childNodes = makeLikeNodeList([]));
      return childNodes;
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
      if (isSlotNode(this)) {
        let assigned = assignedToSlotMap.get(this);
        assigned || assignedToSlotMap.set(this, assigned = []);
        return assigned;
      }
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