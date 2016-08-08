import 'custom-event-polyfill';

const $shadowRoot = '__shadowRoot';

export default () => {
  // Returns the assigned nodes (unflattened) for a <content> node.
  const getAssignedNodes = node => {
    const slot = node.getAttribute('name');

    let host = node;
    while (host) {
      const sr = host[$shadowRoot];
      if (sr && sr.contains(node)) {
        break;
      }
      host = host.parentNode;
    }

    if (!host) {
      return [];
    }

    const chs = host.childNodes;
    const chsLen = chs.length;
    const filtered = [];

    for (let a = 0; a < chsLen; a++) {
      const ch = chs[a];
      const chSlot = ch.getAttribute ? ch.getAttribute('slot') : null;
      if (slot === chSlot) {
        filtered.push(ch);
      }
    }

    return filtered;
  };

  const { getAttribute, setAttribute } = HTMLElement.prototype;
  const elementInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const shadowRootInnerHTML = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'innerHTML');

  // We do this so creating a <slot> actually creates a <content>.
  const filterTagName = name => (name === 'slot' ? 'content' : name);
  const createElement = document.createElement.bind(document);
  const createElementNS = document.createElementNS.bind(document);
  document.createElement = (name, ...args) => createElement(filterTagName(name), ...args);
  document.createElementNS = (name, ...args) => createElementNS(filterTagName(name), ...args);

  // Override innerHTML to turn slot nodes into content nodes.
  function replaceSlotsWithContents(node) {
    const tree = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
    const repl = [];

    // Walk the tree and record nodes that need replacing.
    while (tree.nextNode()) {
      const { currentNode } = tree;
      if (currentNode.tagName === 'SLOT') {
        repl.push(currentNode);
      }
    }

    repl.forEach(fake => {
      const name = fake.getAttribute('name');
      const real = document.createElement('slot');
      if (name) {
        real.setAttribute('name', name);
      }

      fake.parentNode.replaceChild(real, fake);
      while (fake.hasChildNodes()) {
        real.appendChild(fake.firstChild);
      }
    });
  }
  Object.defineProperty(Element.prototype, 'innerHTML', {
    configurable: true,
    get: elementInnerHTML.get,
    set(html) {
      elementInnerHTML.set.call(this, html);
      replaceSlotsWithContents(this);
    },
  });
  Object.defineProperty(ShadowRoot.prototype, 'innerHTML', {
    configurable: true,
    get: shadowRootInnerHTML.get,
    set(html) {
      shadowRootInnerHTML.set.call(this, html);
      replaceSlotsWithContents(this);
    },
  });


  // Node
  // ----

  Object.defineProperty(Node.prototype, 'assignedSlot', {
    get() {
      const { parentNode } = this;
      if (parentNode) {
        const { shadowRoot } = parentNode;

        // If { mode } is "closed", always return `null`.
        if (!shadowRoot) {
          return null;
        }

        const contents = shadowRoot.querySelectorAll('content');
        for (let a = 0; a < contents.length; a++) {
          const content = contents[a];
          if (content.assignedNodes().indexOf(this) > -1) {
            return content;
          }
        }
      }
      return null;
    },
  });


  // Just proxy createShadowRoot() because there's no such thing as closed
  // shadow trees in v0.
  HTMLElement.prototype.attachShadow = function attachShadow({ mode } = {}) {
    // In v1 you must specify a mode.
    if (mode !== 'closed' && mode !== 'open') {
      throw new Error('You must specify { mode } as "open" or "closed" to attachShadow().');
    }

    // Proxy native v0.
    const sr = this.createShadowRoot();

    // In v0 it always defines the shadowRoot property so we must undefine it.
    if (mode === 'closed') {
      Object.defineProperty(this, 'shadowRoot', {
        configurable: true,
        get: () => null,
      });
    }

    // For some reason this wasn't being reported as set, but it seems to work
    // in dev tools.
    Object.defineProperty(sr, 'parentNode', {
      get: () => this,
    });

    // Add a MutationObserver to trigger slot change events when the element
    // is mutated. We only need to listen to the childList because we only care
    // about light DOM.
    const mo = new MutationObserver(muts => {
      const root = this[$shadowRoot];
      muts.forEach(mut => {
        const { addedNodes, removedNodes } = mut;
        const slots = {};
        const recordSlots = node => (slots[node.getAttribute && node.getAttribute('slot') || '__default'] = true);

        if (addedNodes) {
          const addedNodesLen = addedNodes.length;
          for (let a = 0; a < addedNodesLen; a++) {
            recordSlots(addedNodes[a]);
          }
        }

        if (removedNodes) {
          const removedNodesLen = removedNodes.length;
          for (let a = 0; a < removedNodesLen; a++) {
            recordSlots(removedNodes[a]);
          }
        }

        Object.keys(slots).forEach(slot => {
          const node = slot === '__default' ?
            root.querySelector('content:not([name])') || root.querySelector('content[name=""]') :
            root.querySelector(`content[name="${slot}"]`);

          if (node) {
            node.dispatchEvent(new CustomEvent('slotchange', {
              bubbles: false,
              cancelable: false,
            }));
          }
        });
      });
    });
    mo.observe(this, { childList: true });

    return (this[$shadowRoot] = sr);
  };


  // Make like the <slot> name property.
  Object.defineProperty(HTMLContentElement.prototype, 'name', {
    get() {
      return this.getAttribute('name');
    },
    set(name) {
      return this.setAttribute('name', name);
    },
  });


  // Make like the element slot property.
  Object.defineProperty(HTMLElement.prototype, 'slot', {
    get() {
      return this.getAttribute('slot');
    },
    set(name) {
      return this.setAttribute('slot', name);
    },
  });

  // By default, getDistributedNodes() returns a flattened tree (no <slot>
  // nodes). That means we get native { deep } but we have to manually do the
  // opposite.
  HTMLContentElement.prototype.assignedNodes = function assignedNodes({ deep } = {}) {
    const cnodes = [];
    const dnodes = deep ? this.getDistributedNodes() : getAssignedNodes(this);

    // Regardless of how we get the nodes, we must ensure we're only given text
    // nodes or element nodes.
    for (let a = 0; a < dnodes.length; a++) {
      const dnode = dnodes[a];
      const dtype = dnode.nodeType;
      if (dtype === Node.ELEMENT_NODE || dtype === Node.TEXT_NODE) {
        cnodes.push(dnode);
      }
    }
    return cnodes;
  };

  HTMLContentElement.prototype.getAttribute = function overriddenGetAttribute(name) {
    if (name === 'name') {
      const select = getAttribute.call(this, 'select');
      return select ? select.match(/\[slot=['"]?(.*?)['"]?\]/)[1] : null;
    }
    return getAttribute.call(this, name);
  };

  HTMLContentElement.prototype.setAttribute = function overriddenSetAttribute(name, value) {
    if (name === 'name') {
      name = 'select';
      value = `[slot='${value}']`;
    }
    return setAttribute.call(this, name, value);
  };
};
