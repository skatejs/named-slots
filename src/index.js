import { eachChildNode, eachNodeOrFragmentNodes } from './util/each';
import debounce from 'debounce';
import version from './version';


// * WebKit only *
//
// WebKit doesn't allow access to native accessors which makes polyfilling a
// huge pain because we have to use separate code paths for modern browsers
// and it. Modern browsers obviously get the perf benefits and WebKit doesn't.
const canPatchNativeAccessors = !!Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;

// We use a real DOM node for a shadow root. This is because the host node
// basically becomes a virtual entry point for your element leaving the shadow
// root the only thing that can receive instructions on how the host should
// render to the browser.
const defaultShadowRootTagName = '_shadow_root_';
const defaultShadowRootTagNameUc = defaultShadowRootTagName.toUpperCase();

// * WebKit only *
//
// These members we need cannot override as we require native access to their
// original values at some point.
const polyfilAtRuntime = ['childNodes', 'parentNode'];

// These are the protos that we need to search for native descriptors on.
const protos = ['Node', 'Element', 'EventTarget'];

// Private data stores.
const assignedToSlotMap = new WeakMap();
const hostToModeMap = new WeakMap();
const hostToRootMap = new WeakMap();
const nodeToChildNodesMap = new WeakMap();
const nodeToParentNodeMap = new WeakMap();
const nodeToSlotMap = new WeakMap();
const rootToHostMap = new WeakMap();
const rootToSlotMap = new WeakMap();
const slotToModeMap = new WeakMap();


// * WebKit only *
//
// We require some way to parse HTML natively because we can't use the native
// accessors. To do this we parse as XML and conver each node in the tree to
// HTML nodes.
//
// This works because we polyfill at the HTMLElement level and XML nodes are
// considered Element nodes and we don't polyfill at that level.

const parser = new DOMParser();

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


function staticProp (obj, name, value) {
  Object.defineProperty(obj, name, {
    configurable: true,
    get () { return value; }
  });
}


// Slotting helpers.

function arrayItem (idx) {
  return this[idx];
}

function makeLikeNodeList (arr) {
  arr.item = arrayItem;
  return arr;
}

function getNodeType (node) {
  if (isHostNode(node)) {
    return 'host';
  }

  if (isSlotNode(node)) {
    return 'slot';
  }

  if (isRootNode(node)) {
    return 'root';
  }

  return 'node';
}

function isHostNode (node) {
  return !!hostToRootMap.get(node);
}

function isSlotNode (node) {
  return node.tagName === 'SLOT';
}

function isRootNode (node) {
  return node.tagName === defaultShadowRootTagNameUc;
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

function getSlotNameFromSlot (node) {
  return node.getAttribute && node.getAttribute('name') || 'default';
}

function getSlotNameFromNode (node) {
  return node.getAttribute && node.getAttribute('slot') || 'default';
}

function slotNodeIntoSlot (slot, node, insertBefore) {
  const assignedNodes = slot.getAssignedNodes();
  const slotInsertBeforeIndex = assignedNodes.indexOf(insertBefore);

  nodeToSlotMap.set(node, slot);

  // If there's currently no assigned nodes, there will be, so remove all fallback content.
  if (!assignedNodes.length) {
    slotToModeMap.set(slot, false);
    [].slice.call(slot.childNodes).forEach(fallbackNode => slot.__removeChild(fallbackNode));
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
        eachChildNode(slot, function (node) {
          slot.__appendChild(node);
        });
      }

      slot.____triggerSlotChangeEvent();
    }
  }
}

function indexOfNode (host, node) {
  const chs = host.childNodes;
  const chsLen = chs.length;
  for (let a = 0; a < chsLen; a++) {
    if (chs[a] === node) {
      return a;
    }
  }
  return -1;
}

// Adds the node to the list of childNodes on the host and fakes any necessary
// information such as parentNode.
function registerNode (host, node, insertBefore, func) {
  const index = indexOfNode(host, insertBefore);
  eachNodeOrFragmentNodes(node, function (eachNode, eachIndex) {
    func(eachNode, eachIndex);

    if (canPatchNativeAccessors) {
      nodeToParentNodeMap.set(eachNode, host);
    } else {
      staticProp(eachNode, 'parentNode', host);
    }

    if (index > -1) {
      host.childNodes.splice(index + eachIndex, 0, eachNode);
    } else {
      host.childNodes.push(eachNode);
    }
  });
}

// Cleans up registerNode().
function unregisterNode (host, node, func) {
  const index = indexOfNode(host, node);
  if (index > -1) {
    func(node, 0);

    if (canPatchNativeAccessors) {
      nodeToParentNodeMap.set(node, null);
    } else {
      staticProp(node, 'parentNode', null);
    }

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
  eachNodeOrFragmentNodes(node, function (node) {
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
  eachChildNode(rootToHostMap.get(root), function (eachNode) {
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
  const nodeType = getNodeType(host);
  const parentNode = newNode.parentNode;

  if (!canPatchNativeAccessors && !host.childNodes.push) {
    staticProp(host, 'childNodes', []);
  }

  // If we append a child to a host, the host tells the shadow root to distribute
  // it. If the root decides it doesn't need to be distributed, it is never
  // removed from the old parent because in polyfill land we store a reference
  // to the node but we don't move it. Due to that, we must explicitly remove the
  // node from its old parent.
  if (parentNode && getNodeType(parentNode) === 'host') {
    if (canPatchNativeAccessors) {
      nodeToParentNodeMap.set(newNode, null);
    } else {
      staticProp(newNode, 'parentNode', null);
    }
  }

  if (nodeType === 'node') {
    if (canPatchNativeAccessors) {
      return host.__insertBefore(newNode, refNode);
    } else {
      return addNodeToNode(host, newNode, refNode);
    }
  }

  if (nodeType === 'slot') {
    return addNodeToNode(host, newNode, refNode);
  }

  if (nodeType === 'host') {
    return addNodeToHost(host, newNode, refNode);
  }

  if (nodeType === 'root') {
    return addNodeToRoot(host, newNode, refNode);
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
      if (name === 'slotchange' && isSlotNode(this)) {
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

      // Return the existing shadow root if it exists.
      const existingShadowRoot = hostToRootMap.get(this);
      if (existingShadowRoot) {
        return existingShadowRoot;
      }

      const lightNodes = makeLikeNodeList([].slice.call(this.childNodes));
      const shadowRoot = document.createElement(opts.polyfillShadowRootTagName || defaultShadowRootTagName);

      // Host and shadow root data.
      hostToModeMap.set(this, mode);
      hostToRootMap.set(this, shadowRoot);
      rootToHostMap.set(shadowRoot, this);
      rootToSlotMap.set(shadowRoot, {});

      if (canPatchNativeAccessors) {
        nodeToChildNodesMap.set(this, lightNodes);
      } else {
        staticProp(this, 'childNodes', lightNodes);
      }

      // Existing children should be removed from being displayed, but still
      // appear to be child nodes. This is how light DOM works; they're still
      // child nodes but not in the composed DOM yet as there won't be any
      // slots for them to go into.
      eachChildNode(this, node => this.__removeChild(node));

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
      if (canPatchNativeAccessors && getNodeType(this) === 'node') {
        return this.__childNodes;
      }
      let childNodes = nodeToChildNodesMap.get(this);
      childNodes || nodeToChildNodesMap.set(this, childNodes = makeLikeNodeList([]));
      return childNodes;
    }
  },
  children: {
    get () {
      const chs = [];
      eachChildNode(this, function (node) {
        if (node.nodeType === 1) {
          chs.push(node);
        }
      });
      return makeLikeNodeList(chs);
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
      let innerHTML = '';
      eachChildNode(this, function (node) {
        innerHTML += node.nodeType === 1 ? node.outerHTML : node.textContent;
      });
      return innerHTML;
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
      const host = this;
      return eachChildNode(this.parentNode, function (child, index, nodes) {
        if (host === child) {
          return nodes[index + 1] || null;
        }
      });
    }
  },
  nextElementSibling: {
    get () {
      const host = this;
      let found;
      return eachChildNode(this.parentNode, function (child) {
        if (found && child.nodeType === 1) {
          return child;
        }
        if (host === child) {
          found = true;
        }
      });
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
  parentNode: {
    get () {
      return nodeToParentNodeMap.get(this) || this.__parentNode || null;
    }
  },
  previousSibling: {
    get () {
      const host = this;
      return eachChildNode(this.parentNode, function (child, index, nodes) {
        if (host === child) {
          return nodes[index - 1] || null;
        }
      });
    }
  },
  previousElementSibling: {
    get () {
      const host = this;
      let found;
      return eachChildNode(this.parentNode, function (child) {
        if (found && host === child) {
          return found;
        }
        if (child.nodeType === 1) {
          found = child;
        }
      });
    }
  },
  removeChild: {
    value (refNode) {
      const nodeType = getNodeType(this);

      if (nodeType === 'node') {
        if (canPatchNativeAccessors) {
          return this.__removeChild(refNode);
        } else {
          return removeNodeFromNode(this, refNode);
        }
      }

      if (nodeType === 'slot') {
        return removeNodeFromNode(this, refNode);
      }

      if (nodeType === 'host') {
        return removeNodeFromHost(this, refNode);
      }

      if (nodeType === 'root') {
        return removeNodeFromRoot(this, refNode);
      }
    }
  },
  removeEventListener: {
    value (name, func, opts) {
      if (name === 'slotchange' && this.____slotChangeListeners && isSlotNode(this)) {
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
  shadowRoot: {
    get () {
      return hostToModeMap.get(this) === 'open' ? hostToRootMap.get(this) : null;
    }
  },
  textContent: {
    get () {
      let textContent = '';
      eachChildNode(this, function (node) {
        textContent += node.textContent;
      });
      return textContent;
    },
    set (textContent) {
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      this.appendChild(document.createTextNode(textContent));
    }
  }
};

function findDescriptorFor (name) {
  for (let a = 0; a < protos.length; a++) {
    const ctor = window[protos[a]];
    if (!ctor) {
      continue;
    }
    const proto = ctor.prototype;
    if (proto.hasOwnProperty(name)) {
      return Object.getOwnPropertyDescriptor(proto, name);
    }
  }
}

function polyfill (elementProto, memberName, memberProperty) {
  const nativeDescriptor = findDescriptorFor(memberName);
  Object.defineProperty(elementProto, memberName, memberProperty);
  if (nativeDescriptor && nativeDescriptor.configurable) {
    Object.defineProperty(elementProto, '__' + memberName, nativeDescriptor);
  }
}

if (!('attachShadow' in document.createElement('div'))) {
  const elementProto = HTMLElement.prototype;
  Object.keys(members).forEach(function (memberName) {
    const memberProperty = members[memberName];

    // All properties should be configurable.
    memberProperty.configurable = true;

    // Polyfill as much as we can and work around WebKit in other areas.
    if (canPatchNativeAccessors || polyfilAtRuntime.indexOf(memberName) === -1) {
      polyfill(elementProto, memberName, memberProperty);
    }
  });
}

export default version;
