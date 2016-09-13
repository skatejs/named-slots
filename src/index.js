import debounce from 'debounce';
import 'custom-event-polyfill';
import 'webcomponents.js/src/WeakMap/WeakMap.js';
import { eachChildNode, eachNodeOrFragmentNodes } from './util/each';
import { shadowDomV0, shadowDomV1 } from './util/support';
import canPatchNativeAccessors from './util/can-patch-native-accessors';
import getPropertyDescriptor from './util/get-property-descriptor';
import getEscapedTextContent from './util/get-escaped-text-content';
import getRawTextContent from './util/get-raw-text-content';
import getCommentNodeOuterHtml from './util/get-comment-node-outer-html';
import findSlots from './util/find-slots';
import isRootNode from './util/is-root-node';
import isSlotNode from './util/is-slot-node';
import pseudoArrayToArray from './util/pseudo-array-to-array';
import v0 from './v0';
import version from './version';

const arrProto = Array.prototype;
const { forEach } = arrProto;

// We use a real DOM node for a shadow root. This is because the host node
// basically becomes a virtual entry point for your element leaving the shadow
// root the only thing that can receive instructions on how the host should
// render to the browser.
const defaultShadowRootTagName = '_shadow_root_';

// * WebKit only *
//
// These members we need cannot override as we require native access to their
// original values at some point.
const polyfillAtRuntime = ['childNodes', 'parentNode'];

// Some properties that should not be overridden in the Text prototype.
const doNotOverridePropertiesInTextNodes = ['textContent'];

// Some new properties that should be defined in the Text prototype.
const defineInTextNodes = ['assignedSlot'];

// Some properties that should not be overridden in the Comment prototype.
const doNotOverridePropertiesInCommNodes = ['textContent'];

// Some new properties that should be defined in the Comment prototype.
const defineInCommNodes = [];

// Nodes that should be slotted
const slottedNodeTypes = [Node.ELEMENT_NODE, Node.TEXT_NODE];

// Private data stores.
const assignedToSlotMap = new WeakMap();
const hostToModeMap = new WeakMap();
const hostToRootMap = new WeakMap();
const nodeToChildNodesMap = new WeakMap();
const nodeToParentNodeMap = new WeakMap();
const nodeToSlotMap = new WeakMap();
const rootToHostMap = new WeakMap();
const rootToSlotMap = new WeakMap();
const slotToRootMap = new WeakMap();


// Unfortunately manual DOM parsing is because of WebKit.
const parser = new DOMParser();
function parse(html) {
  const tree = document.createElement('div');

  // Everything not WebKit can do this easily.
  if (canPatchNativeAccessors) {
    tree.__innerHTML = html;
    return tree;
  }

  const parsed = parser.parseFromString(`<div>${html}</div>`, 'text/html').body.firstChild;

  while (parsed.hasChildNodes()) {
    const firstChild = parsed.firstChild;
    parsed.removeChild(firstChild);
    tree.appendChild(firstChild);
  }

  // Need to import the node to initialise the custom elements from the parser.
  return document.importNode(tree, true);
}

function staticProp(obj, name, value) {
  Object.defineProperty(obj, name, {
    configurable: true,
    get() { return value; },
  });
}


// Slotting helpers.

function arrayItem(idx) {
  return this[idx];
}

function makeLikeNodeList(arr) {
  arr.item = arrayItem;
  return arr;
}

function isHostNode(node) {
  return !!hostToRootMap.get(node);
}

function getNodeType(node) {
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

function findClosest(node, func) {
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

function getSlotNameFromSlot(node) {
  return (node.getAttribute && node.getAttribute('name')) || 'default';
}

function getSlotNameFromNode(node) {
  return (node.getAttribute && node.getAttribute('slot')) || 'default';
}

function slotNodeIntoSlot(slot, node, insertBefore) {
  // Only Text and Element nodes should be slotted.
  if (slottedNodeTypes.indexOf(node.nodeType) === -1) {
    return;
  }

  const assignedNodes = slot.assignedNodes();
  const shouldGoIntoContentMode = assignedNodes.length === 0;
  const slotInsertBeforeIndex = assignedNodes.indexOf(insertBefore);

  // Assign the slot to the node internally.
  nodeToSlotMap.set(node, slot);

  // Remove the fallback content and state if we're going into content mode.
  if (shouldGoIntoContentMode) {
    forEach.call(slot.childNodes, child => slot.__removeChild(child));
  }

  if (slotInsertBeforeIndex > -1) {
    slot.__insertBefore(node, insertBefore !== undefined ? insertBefore : null);
    assignedNodes.splice(slotInsertBeforeIndex, 0, node);
  } else {
    slot.__appendChild(node);
    assignedNodes.push(node);
  }

  slot.____triggerSlotChangeEvent();
}

function slotNodeFromSlot(node) {
  const slot = nodeToSlotMap.get(node);

  if (slot) {
    const assignedNodes = slot.assignedNodes();
    const index = assignedNodes.indexOf(node);

    if (index > -1) {
      const shouldGoIntoDefaultMode = assignedNodes.length === 1;

      assignedNodes.splice(index, 1);
      nodeToSlotMap.set(node, null);

      // Actually remove the child.
      slot.__removeChild(node);

      // If this was the last slotted node, then insert fallback content.
      if (shouldGoIntoDefaultMode) {
        forEach.call(slot.childNodes, child => slot.__appendChild(child));
      }

      slot.____triggerSlotChangeEvent();
    }
  }
}

// Returns the index of the node in the host's childNodes.
function indexOfNode(host, node) {
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
function registerNode(host, node, insertBefore, func) {
  const index = indexOfNode(host, insertBefore);
  eachNodeOrFragmentNodes(node, (eachNode, eachIndex) => {
    func(eachNode, eachIndex);

    if (canPatchNativeAccessors) {
      nodeToParentNodeMap.set(eachNode, host);
    } else {
      staticProp(eachNode, 'parentNode', host);
    }

    if (index > -1) {
      arrProto.splice.call(host.childNodes, index + eachIndex, 0, eachNode);
    } else {
      arrProto.push.call(host.childNodes, eachNode);
    }
  });
}

// Cleans up registerNode().
function unregisterNode(host, node, func) {
  const index = indexOfNode(host, node);

  if (index > -1) {
    func(node, 0);

    if (canPatchNativeAccessors) {
      nodeToParentNodeMap.set(node, null);
    } else {
      staticProp(node, 'parentNode', null);
    }

    arrProto.splice.call(host.childNodes, index, 1);
  }
}

function addNodeToNode(host, node, insertBefore) {
  registerNode(host, node, insertBefore, eachNode => {
    host.__insertBefore(eachNode, insertBefore !== undefined ? insertBefore : null);
  });
}

function addNodeToHost(host, node, insertBefore) {
  registerNode(host, node, insertBefore, eachNode => {
    const rootNode = hostToRootMap.get(host);
    const slotNodes = rootToSlotMap.get(rootNode);
    const slotNode = slotNodes[getSlotNameFromNode(eachNode)];
    if (slotNode) {
      slotNodeIntoSlot(slotNode, eachNode, insertBefore);
    }
  });
}

function addSlotToRoot(root, slot) {
  const slotName = getSlotNameFromSlot(slot);

  // Ensure a slot node's childNodes are overridden at the earliest point
  // possible for WebKit.
  if (!canPatchNativeAccessors && !Array.isArray(slot.childNodes)) {
    staticProp(slot, 'childNodes', pseudoArrayToArray(slot.childNodes));
  }

  rootToSlotMap.get(root)[slotName] = slot;

  if (!slotToRootMap.has(slot)) {
    slotToRootMap.set(slot, root);
  }

  eachChildNode(rootToHostMap.get(root), eachNode => {
    if (!eachNode.assignedSlot && slotName === getSlotNameFromNode(eachNode)) {
      slotNodeIntoSlot(slot, eachNode);
    }
  });
}

function addNodeToRoot(root, node, insertBefore) {
  eachNodeOrFragmentNodes(node, child => {
    if (isSlotNode(child)) {
      addSlotToRoot(root, child);
    } else {
      const slotNodes = findSlots(child);
      if (slotNodes) {
        const slotNodesLen = slotNodes.length;
        for (let a = 0; a < slotNodesLen; a++) {
          addSlotToRoot(root, slotNodes[a]);
        }
      }
    }
  });
  addNodeToNode(root, node, insertBefore);
}

// Adds a node to a slot. In other words, adds default content to a slot. It
// ensures that if the slot doesn't have any assigned nodes yet, that the node
// is actually displayed, otherwise it's just registered as child content.
function addNodeToSlot(slot, node, insertBefore) {
  const isInDefaultMode = slot.assignedNodes().length === 0;
  registerNode(slot, node, insertBefore, eachNode => {
    if (isInDefaultMode) {
      slot.__insertBefore(eachNode, insertBefore !== undefined ? insertBefore : null);
    }
  });
}

// Removes a node from a slot (default content). It ensures that if the slot
// doesn't have any assigned nodes yet, that the node is actually removed,
// otherwise it's just unregistered.
function removeNodeFromSlot(slot, node) {
  const isInDefaultMode = slot.assignedNodes().length === 0;
  unregisterNode(slot, node, () => {
    if (isInDefaultMode) {
      slot.__removeChild(node);
    }
  });
}

function removeNodeFromNode(host, node) {
  unregisterNode(host, node, () => {
    host.__removeChild(node);
  });
}

function removeNodeFromHost(host, node) {
  unregisterNode(host, node, () => {
    slotNodeFromSlot(node);
  });
}

function removeSlotFromRoot(root, node) {
  const assignedNodes = Array.prototype.slice.call(node.assignedNodes());
  assignedNodes.forEach(slotNodeFromSlot);
  delete rootToSlotMap.get(root)[getSlotNameFromSlot(node)];
  slotToRootMap.delete(node);
}

function removeNodeFromRoot(root, node) {
  unregisterNode(root, node, () => {
    if (isSlotNode(node)) {
      removeSlotFromRoot(root, node);
    } else {
      const nodes = findSlots(node);
      if (nodes) {
        for (let a = 0; a < nodes.length; a++) {
          removeSlotFromRoot(root, nodes[a]);
        }
      }
    }
    root.__removeChild(node);
  });
}

// TODO terribly inefficient
function getRootNode(host) {
  if (isRootNode(host)) {
    return host;
  }

  if (!host.parentNode) {
    return;
  }

  return getRootNode(host.parentNode);
}

function appendChildOrInsertBefore(host, newNode, refNode) {
  const nodeType = getNodeType(host);
  const parentNode = newNode.parentNode;
  const rootNode = getRootNode(host);

  // Ensure childNodes is patched so we can manually update it for WebKit.
  if (!canPatchNativeAccessors && !Array.isArray(host.childNodes)) {
    staticProp(host, 'childNodes', pseudoArrayToArray(host.childNodes));
  }

  if (rootNode && getNodeType(newNode) === 'slot') {
    addSlotToRoot(rootNode, newNode);
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
      nodeToParentNodeMap.set(newNode, host);
      return host.__insertBefore(newNode, refNode !== undefined ? refNode : null);
    }

    return addNodeToNode(host, newNode, refNode);
  }

  if (nodeType === 'slot') {
    return addNodeToSlot(host, newNode, refNode);
  }

  if (nodeType === 'host') {
    return addNodeToHost(host, newNode, refNode);
  }

  if (nodeType === 'root') {
    return addNodeToRoot(host, newNode, refNode);
  }
}

function syncSlotChildNodes(node) {
  if (canPatchNativeAccessors && getNodeType(node) === 'slot' && (node.__childNodes.length !== node.childNodes.length)) {
    while (node.hasChildNodes()) {
      node.removeChild(node.firstChild);
    }

    forEach.call(node.__childNodes, child => node.appendChild(child));
  }
}

const members = {
  // For testing purposes.
  ____assignedNodes: {
    get() {
      return this.______assignedNodes || (this.______assignedNodes = []);
    },
  },

  // For testing purposes.
  ____isInFallbackMode: {
    get() {
      return this.assignedNodes().length === 0;
    },
  },

  ____slotChangeListeners: {
    get() {
      if (typeof this.______slotChangeListeners === 'undefined') {
        this.______slotChangeListeners = 0;
      }
      return this.______slotChangeListeners;
    },
    set(value) {
      this.______slotChangeListeners = value;
    },
  },
  ____triggerSlotChangeEvent: {
    value: debounce(function callback() {
      if (this.____slotChangeListeners) {
        this.dispatchEvent(new CustomEvent('slotchange', {
          bubbles: false,
          cancelable: false,
        }));
      }
    }),
  },
  addEventListener: {
    value(name, func, opts) {
      if (name === 'slotchange' && isSlotNode(this)) {
        this.____slotChangeListeners++;
      }
      return this.__addEventListener(name, func, opts);
    },
  },
  appendChild: {
    value(newNode) {
      appendChildOrInsertBefore(this, newNode);
      return newNode;
    },
  },
  assignedSlot: {
    get() {
      const slot = nodeToSlotMap.get(this);

      if (!slot) {
        return null;
      }

      const root = slotToRootMap.get(slot);
      const host = rootToHostMap.get(root);
      const mode = hostToModeMap.get(host);

      return mode === 'open' ? slot : null;
    },
  },
  attachShadow: {
    value(opts) {
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

      // Process light DOM.
      lightNodes.forEach(node => {
        // Existing children should be removed from being displayed, but still
        // appear to be child nodes. This is how light DOM works; they're still
        // child nodes but not in the composed DOM yet as there won't be any
        // slots for them to go into.
        this.__removeChild(node);

        // We must register the parentNode here as this has the potential to
        // become out of sync if the node is moved before being slotted.
        if (canPatchNativeAccessors) {
          nodeToParentNodeMap.set(node, this);
        } else {
          staticProp(node, 'parentNode', this);
        }
      });

      // The shadow root is actually the only child of the host.
      return this.__appendChild(shadowRoot);
    },
  },
  childElementCount: {
    get() {
      return this.children.length;
    },
  },
  childNodes: {
    get() {
      if (canPatchNativeAccessors && getNodeType(this) === 'node') {
        return this.__childNodes;
      }
      let childNodes = nodeToChildNodesMap.get(this);

      if (!childNodes) {
        nodeToChildNodesMap.set(this, childNodes = makeLikeNodeList([]));
      }

      return childNodes;
    },
  },
  children: {
    get() {
      const chs = [];
      eachChildNode(this, node => {
        if (node.nodeType === 1) {
          chs.push(node);
        }
      });
      return makeLikeNodeList(chs);
    },
  },
  firstChild: {
    get() {
      return this.childNodes[0] || null;
    },
  },
  firstElementChild: {
    get() {
      return this.children[0] || null;
    },
  },
  assignedNodes: {
    value() {
      if (isSlotNode(this)) {
        let assigned = assignedToSlotMap.get(this);

        if (!assigned) {
          assignedToSlotMap.set(this, assigned = []);
        }

        return assigned;
      }
    },
  },
  hasChildNodes: {
    value() {
      return this.childNodes.length > 0;
    },
  },
  innerHTML: {
    get() {
      let innerHTML = '';

      const getHtmlNodeOuterHtml = (node) => node.outerHTML;
      const getOuterHtmlByNodeType = {};
      getOuterHtmlByNodeType[Node.ELEMENT_NODE] = getHtmlNodeOuterHtml;
      getOuterHtmlByNodeType[Node.COMMENT_NODE] = getCommentNodeOuterHtml;

      // Text nodes with these ancestors should be treated as raw text
      // See section 8.4 of
      // https://www.w3.org/TR/2008/WD-html5-20080610/serializing.html#html-fragment
      // Though Chrome does not adhere to spec for <noscript/>
      const rawTextNodeNames = {
        style: true,
        script: true,
        xmp: true,
        iframe: true,
        noembed: true,
        noframes: true,
        noscript: true,
        plaintext: true,
      };

      function isRawTextNode(node) {
        return node.nodeType === Node.ELEMENT_NODE &&
          node.nodeName.toLowerCase() in rawTextNodeNames;
      }

      const isCommonNodeRawText = isRawTextNode(this);

      eachChildNode(this, node => {
        let getOuterHtml;
        if (node.nodeType === Node.TEXT_NODE) {
          if (isCommonNodeRawText || isRawTextNode(node)) {
            getOuterHtml = getRawTextContent;
          } else {
            getOuterHtml = getEscapedTextContent;
          }
        } else {
          getOuterHtml = getOuterHtmlByNodeType[node.nodeType] || getHtmlNodeOuterHtml;
        }
        innerHTML += getOuterHtml(node);
      });
      return innerHTML;
    },
    set(innerHTML) {
      const parsed = parse(innerHTML);

      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }

      // when we are doing this: root.innerHTML = "<slot><div></div></slot>";
      // slot.__childNodes is out of sync with slot.childNodes.
      // to fix it we have to manually remove and insert them
      const slots = findSlots(parsed);
      forEach.call(slots, slot => syncSlotChildNodes(slot));

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
    },
  },
  insertBefore: {
    value(newNode, refNode) {
      appendChildOrInsertBefore(this, newNode, refNode);

      return newNode;
    },
  },
  lastChild: {
    get() {
      const ch = this.childNodes;
      return ch[ch.length - 1] || null;
    },
  },
  lastElementChild: {
    get() {
      const ch = this.children;
      return ch[ch.length - 1] || null;
    },
  },
  name: {
    get() {
      return this.getAttribute('name');
    },
    set(name) {
      const oldName = this.name;
      const ret = this.__setAttribute('name', name);

      if (name === oldName) {
        return ret;
      }

      if (!isSlotNode(this)) {
        return ret;
      }
      const root = slotToRootMap.get(this);
      if (root) {
        removeSlotFromRoot(root, this);
        addSlotToRoot(root, this);
      }
      return ret;
    },
  },
  nextSibling: {
    get() {
      const host = this;
      return eachChildNode(this.parentNode, (child, index, nodes) => {
        if (host === child) {
          return nodes[index + 1] || null;
        }
      });
    },
  },
  nextElementSibling: {
    get() {
      const host = this;
      let found;
      return eachChildNode(this.parentNode, child => {
        if (found && child.nodeType === 1) {
          return child;
        }
        if (host === child) {
          found = true;
        }
      });
    },
  },
  outerHTML: {
    get() {
      const name = this.tagName.toLowerCase();
      const attributes = Array.prototype.slice.call(this.attributes).map((attr) =>
        (` ${attr.name}${attr.value ? `="${attr.value}"` : ''}`)
      ).join('');
      return `<${name}${attributes}>${this.innerHTML}</${name}>`;
    },

    set(outerHTML) {
      if (this.parentNode) {
        const parsed = parse(outerHTML);
        this.parentNode.replaceChild(parsed.firstChild, this);
      } else if (canPatchNativeAccessors) {
        this.__outerHTML = outerHTML;  // this will throw a native error;
      } else {
        throw new Error('Failed to set the \'outerHTML\' property on \'Element\': This element has no parent node.');
      }
    },
  },
  parentElement: {
    get() {
      return findClosest(this.parentNode, (node) => node.nodeType === 1);
    },
  },
  parentNode: {
    get() {
      return nodeToParentNodeMap.get(this) || this.__parentNode || null;
    },
  },
  previousSibling: {
    get() {
      const host = this;
      return eachChildNode(this.parentNode, (child, index, nodes) => {
        if (host === child) {
          return nodes[index - 1] || null;
        }
      });
    },
  },
  previousElementSibling: {
    get() {
      const host = this;
      let found;
      return eachChildNode(this.parentNode, child => {
        if (found && host === child) {
          return found;
        }
        if (child.nodeType === 1) {
          found = child;
        }
      });
    },
  },
  removeChild: {
    value(refNode) {
      const nodeType = getNodeType(this);

      switch (nodeType) {
      case 'node':
        if (canPatchNativeAccessors) {
          nodeToParentNodeMap.set(refNode, null);
          return this.__removeChild(refNode);
        }
        removeNodeFromNode(this, refNode);
        break;
      case 'slot':
        removeNodeFromSlot(this, refNode);
        break;
      case 'host':
        removeNodeFromHost(this, refNode);
        break;
      case 'root':
        removeNodeFromRoot(this, refNode);
        break;
      default:
        break;
      }
      return refNode;
    },
  },
  removeEventListener: {
    value(name, func, opts) {
      if (name === 'slotchange' && this.____slotChangeListeners && isSlotNode(this)) {
        this.____slotChangeListeners--;
      }
      return this.__removeEventListener(name, func, opts);
    },
  },
  replaceChild: {
    value(newNode, refNode) {
      this.insertBefore(newNode, refNode);
      return this.removeChild(refNode);
    },
  },
  setAttribute: {
    value(attrName, attrValue) {
      if (attrName === 'slot') {
        this[attrName] = attrValue;
      }
      if (isSlotNode(this)) {
        if (attrName === 'name') {
          this[attrName] = attrValue;
        }
      }
      return this.__setAttribute(attrName, attrValue);
    },
  },
  shadowRoot: {
    get() {
      return hostToModeMap.get(this) === 'open' ? hostToRootMap.get(this) : null;
    },
  },
  slot: {
    get() {
      return this.getAttribute('slot');
    },
    set(name) {
      const oldName = this.name;
      const ret = this.__setAttribute('slot', name);

      if (oldName === name) {
        return ret;
      }

      const slot = nodeToSlotMap.get(this);
      const root = slot && slotToRootMap.get(slot);
      const host = root && rootToHostMap.get(root);

      if (host) {
        removeNodeFromHost(host, this);
        addNodeToHost(host, this);
      }
      return ret;
    },
  },
  textContent: {
    get() {
      let textContent = '';
      eachChildNode(this, node => {
        if (node.nodeType !== Node.COMMENT_NODE) {
          textContent += node.textContent;
        }
      });
      return textContent;
    },
    set(textContent) {
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      if (!textContent) {
        return;
      }
      this.appendChild(document.createTextNode(textContent));
    },
  },
};

if (shadowDomV1) {
  // then we should probably not be loading this
} else if (shadowDomV0) {
  v0();
} else {
  const commProto = Comment.prototype;
  const elementProto = HTMLElement.prototype;
  const svgProto = SVGElement.prototype;
  const textProto = Text.prototype;
  const textNode = document.createTextNode('');
  const commNode = document.createComment('');

  Object.keys(members).forEach(memberName => {
    const memberProperty = members[memberName];

    // All properties should be configurable.
    memberProperty.configurable = true;

    // Applying to the data properties only since we can't have writable accessor properties.
    if (memberProperty.hasOwnProperty('value')) { // eslint-disable-line no-prototype-builtins
      memberProperty.writable = true;
    }

    // Polyfill as much as we can and work around WebKit in other areas.
    if (canPatchNativeAccessors || polyfillAtRuntime.indexOf(memberName) === -1) {
      const nativeDescriptor = getPropertyDescriptor(elementProto, memberName);
      const nativeTextDescriptor = getPropertyDescriptor(textProto, memberName);
      const nativeCommDescriptor = getPropertyDescriptor(commProto, memberName);
      const shouldOverrideInTextNode = (
        memberName in textNode &&
        doNotOverridePropertiesInTextNodes.indexOf(memberName) === -1
      ) || ~defineInTextNodes.indexOf(memberName);
      const shouldOverrideInCommentNode = (
        memberName in commNode &&
        doNotOverridePropertiesInCommNodes.indexOf(memberName) === -1
      ) || ~defineInCommNodes.indexOf(memberName);
      const nativeMemberName = `__${memberName}`;

      Object.defineProperty(elementProto, memberName, memberProperty);
      Object.defineProperty(svgProto, memberName, memberProperty);

      if (nativeDescriptor) {
        Object.defineProperty(elementProto, nativeMemberName, nativeDescriptor);
        Object.defineProperty(svgProto, nativeMemberName, nativeDescriptor);
      }

      if (shouldOverrideInTextNode) {
        Object.defineProperty(textProto, memberName, memberProperty);
      }

      if (shouldOverrideInTextNode && nativeTextDescriptor) {
        Object.defineProperty(textProto, nativeMemberName, nativeTextDescriptor);
      }

      if (shouldOverrideInCommentNode) {
        Object.defineProperty(commProto, memberName, memberProperty);
      }

      if (shouldOverrideInCommentNode && nativeCommDescriptor) {
        Object.defineProperty(commProto, nativeMemberName, nativeCommDescriptor);
      }
    }
  });
}

export default version;
