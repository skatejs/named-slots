import { eachChildNode, eachNodeOrFragmentNodes } from './util/each';
import canPatchNativeAccessors from './util/can-patch-native-accessors';
import getPropertyDescriptor from './util/get-property-descriptor';
import debounce from 'debounce';
import getEscapedTextContent from './util/get-escaped-text-content';
import getCommentNodeOuterHtml from './util/get-comment-node-outer-html';
import version from './version';
import WeakMap from 'weakmap';
import 'custom-event-polyfill';

const arrProto = Array.prototype;
const { forEach } = arrProto;

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


// Unfortunately manual DOM parsing is because of WebKit.
const parser = new DOMParser();
function parse (html) {
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
  // Don't slot nodes that have content but are only whitespace. This is an
  // anomaly that I don't think the spec deals with.
  //
  // The problem is:
  //
  // - If you insert HTML with indentation into the page, there will be
  //   whitespace and if that's inserted it messes with fallback content
  //   calculation where there is formatting, but no meaningful content, so in
  //   theory it should fallback. Since you can attach a shadow root after we
  //   mean to insert an empty text node and have it "count", we can't really
  //   discard nodes that are considered formatting at the time of attachment.
  // - You can insert a text node and modify its text content later.
  //   Incremental DOM seems to do this. Every way I look at it, it seems
  //   problematic that we should have to screen for content, but I don't seems
  //   much of a way around it at the moment.
  if (node.nodeType === 3 && node.textContent && node.textContent.trim().length === 0) {
    return;
  }

  // only Text and Element nodes should be slotted
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
    forEach.call(slot.__childNodes, node => slot.__removeChild(node));
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

function slotNodeFromSlot (node) {
  const slot = node.assignedSlot;

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
        forEach.call(slot.childNodes, node => slot.__appendChild(node));
      }

      slot.____triggerSlotChangeEvent();
    }
  }
}

// Returns the index of the node in the host's childNodes.
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
      arrProto.splice.call(host.childNodes, index + eachIndex, 0, eachNode);
    } else {
      arrProto.push.call(host.childNodes, eachNode);
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

    arrProto.splice.call(host.childNodes, index, 1);
  }
}

function addNodeToNode (host, node, insertBefore) {
  registerNode(host, node, insertBefore, function (eachNode) {
    host.__insertBefore(eachNode, insertBefore !== undefined ? insertBefore : null);
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
function addNodeToSlot (slot, node, insertBefore) {
  const isInDefaultMode = slot.assignedNodes().length === 0;
  registerNode(slot, node, insertBefore, function (eachNode) {
    if (isInDefaultMode) {
      slot.__insertBefore(eachNode, insertBefore !== undefined ? insertBefore : null);
    }
  });
}

// Removes a node from a slot (default content). It ensures that if the slot
// doesn't have any assigned nodes yet, that the node is actually removed,
// otherwise it's just unregistered.
function removeNodeFromSlot (slot, node) {
  const isInDefaultMode = slot.assignedNodes().length === 0;
  unregisterNode(slot, node, function () {
    if (isInDefaultMode) {
      slot.__removeChild(node);
    }
  });
}

function addSlotToRoot (root, slot) {
  const slotName = getSlotNameFromSlot(slot);

  // Ensure a slot node's childNodes are overridden at the earliest point
  // possible for WebKit.
  if (!canPatchNativeAccessors && !slot.childNodes.push) {
    staticProp(slot, 'childNodes', []);
  }

  rootToSlotMap.get(root)[slotName] = slot;
  eachChildNode(rootToHostMap.get(root), function (eachNode) {
    if (!eachNode.assignedSlot && slotName === getSlotNameFromNode(eachNode)) {
      slotNodeIntoSlot(slot, eachNode);
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
      if (nodes) {
        for (let a = 0; a < nodes.length; a++) {
          removeSlotFromRoot(root, nodes[a]);
        }
      }
    }
    root.__removeChild(node);
  });
}

function removeSlotFromRoot (root, node) {
  node.assignedNodes().forEach(slotNodeFromSlot);
  delete rootToSlotMap.get(root)[getSlotNameFromSlot(node)];
}

// TODO terribly inefficient
function getRootNode (host) {
  if (isRootNode(host)) {
    return host;
  } else {
    if (!host.parentNode) {
      return;
    }

    return getRootNode(host.parentNode);
  }
}

function appendChildOrInsertBefore (host, newNode, refNode) {
  const nodeType = getNodeType(host);
  const parentNode = newNode.parentNode;
  const rootNode = getRootNode(host);

  // Ensure childNodes is patched so we can manually update it for WebKit.
  if (!canPatchNativeAccessors && !host.childNodes.push) {
    staticProp(host, 'childNodes', [...host.childNodes]);
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
    } else {
      return addNodeToNode(host, newNode, refNode);
    }
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
      return this.assignedNodes().length === 0;
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
  assignedNodes: {
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

      const getHtmlNodeOuterHtml = (node) => node.outerHTML;
      const getOuterHtmlByNodeType = {
        1: getHtmlNodeOuterHtml,
        3: getEscapedTextContent,
        8: getCommentNodeOuterHtml
      };

      eachChildNode(this, function (node) {
        const getOuterHtml = getOuterHtmlByNodeType[node.nodeType] || getHtmlNodeOuterHtml;
        innerHTML += getOuterHtml(node);
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
    },

    set (outerHTML) {
      if (this.parentNode) {
        const parsed = parse(outerHTML);
        this.parentNode.replaceChild(parsed.firstChild, this);
      } else {
        if (canPatchNativeAccessors) {
          this.__outerHTML = outerHTML;  // this will throw a native error;
        } else {
          throw new Error('Failed to set the \'outerHTML\' property on \'Element\': This element has no parent node.');
        }
      }
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
        return removeNodeFromSlot(this, refNode);
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
        if (node.nodeType !== Node.COMMENT_NODE) {
          textContent += node.textContent;
        }
      });
      return textContent;
    },
    set (textContent) {
      while (this.hasChildNodes()) {
        this.removeChild(this.firstChild);
      }
      if (!textContent) {
        return;
      }
      this.appendChild(document.createTextNode(textContent));
    }
  }
};

if (!('attachShadow' in document.createElement('div'))) {
  const elementProto = HTMLElement.prototype;
  const textProto = Text.prototype;
  const commProto = Comment.prototype;
  const textNode = document.createTextNode('');
  const commNode = document.createComment('');

  Object.keys(members).forEach(function (memberName) {
    const memberProperty = members[memberName];

    // All properties should be configurable.
    memberProperty.configurable = true;

    // Applying to the data properties only since we can't have writable accessor properties.
    if (memberProperty.hasOwnProperty('value')) {
      memberProperty.writable = true;
    }

    // Polyfill as much as we can and work around WebKit in other areas.
    if (canPatchNativeAccessors || polyfillAtRuntime.indexOf(memberName) === -1) {
      const nativeDescriptor = getPropertyDescriptor(elementProto, memberName);
      const nativeTextDescriptor = getPropertyDescriptor(textProto, memberName);
      const nativeCommDescriptor = getPropertyDescriptor(commProto, memberName);
      
      const shouldOverrideInTextNode = (memberName in textNode && doNotOverridePropertiesInTextNodes.indexOf(memberName) === -1) || ~defineInTextNodes.indexOf(memberName);
      const shouldOverrideInCommentNode = (memberName in commNode && doNotOverridePropertiesInCommNodes.indexOf(memberName) === -1) || ~defineInCommNodes.indexOf(memberName);

      Object.defineProperty(elementProto, memberName, memberProperty);

      if (nativeDescriptor) {
        Object.defineProperty(elementProto, '__' + memberName, nativeDescriptor);
      }

      if (shouldOverrideInTextNode) {
        Object.defineProperty(textProto, memberName, memberProperty);
      }

      if (shouldOverrideInTextNode && nativeTextDescriptor) {
        Object.defineProperty(textProto, '__' + memberName, nativeTextDescriptor);
      }

      if (shouldOverrideInCommentNode) {
        Object.defineProperty(commProto, memberName, memberProperty);
      }

      if (shouldOverrideInCommentNode && nativeCommDescriptor) {
        Object.defineProperty(commProto, '__' + memberName, nativeCommDescriptor);
      }
    }
  });
}

export default version;
