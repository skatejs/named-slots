import mapPolyfilled from './internal/map-polyfilled';
import prop from './internal/prop';


// Helpers.

function arrayItem (idx) {
  return this[idx];
}

function doForNodesIfSlot (elem, node, func) {
  nodeToArray(node).forEach(function (node) {
    const slot = getSlot(elem, node);
    if (slot) {
      func(elem, node, slot);
    }
  });
}

function getSlot (elem, node) {
  const name = node.getAttribute && node.getAttribute('slot') || 'content';

  if (!elem.__slots) {
    elem.__slots = {};
  }

  const slots = elem.__slots;

  if (typeof slots[name] === 'undefined') {
    const slot = elem.querySelector(`[slot-name="${name === 'content' ? '' : name}"]`);
    if (slot) {
      slots[name] = slot;
    }
  }

  if (slots[name]) {
    return slots[name];
  }
}

function makeLikeNodeList (arr) {
  arr.item = arrayItem;
  return arr;
}

function nodeToArray (node) {
  return node instanceof DocumentFragment ? toArray(node.childNodes) : [node];
}

function toArray (obj) {
  return Array.prototype.slice.call(obj);
}


// Prop overrides.

const props = {
  childElementCount: {
    get () {
      return this.children.length;
    }
  },
  childNodes: {
    get () {
      let nodes = [];
      const slots = this.__slots;
      if (slots) {
        for (let name in slots) {
          const slot = slots[name];
          const childNodes = slot.childNodes;
          const childNodesLen = childNodes.length;
          for (let a = 0; a < childNodesLen; a++) {
            nodes.push(childNodes[a]);
          }
        }
      }
      return makeLikeNodeList(nodes);
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
  innerHTML: {
    get () {
      return this.childNodes.map(node => node.outerHTML || node.textContent).join('');
    },
    set (val) {
      const div = document.createElement('div');
      const frag = document.createDocumentFragment();
      div.innerHTML = val;
      while (div.hasChildNodes()) {
        frag.appendChild(div.firstChild);
      }
      this.appendChild(frag);
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
  outerHTML: {
    get () {
      const name = this.tagName.toLowerCase();
      const attributes = toArray(this.attributes).map(function (attr) {
        return ` ${attr.name}${attr.value ? `="${attr.value}"` : ''}`;
      }).join('');
      return `<${name}${attributes}>${this.innerHTML}</${name}>`;
    }
  },
  textContent: {
    get () {
      return this.childNodes.map(node => node.textContent).join('');
    },
    set (val) {
      doForNodesIfSlot(this, val.toString(), function (elem, node, slot) {
        slot.textContent = node;
      });
    }
  }
};


// Method overrides.

const funcs = {
  appendChild (newNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slot.appendChild(node);
    });
    return newNode;
  },
  hasChildNodes () {
    return this.childNodes.length > 0;
  },
  insertBefore (newNode, refNode) {
    doForNodesIfSlot(this, newNode, function (elem, node, slot) {
      slot.insertBefore(newNode, refNode);
    });
    return newNode;
  },
  removeChild (refNode) {
    doForNodesIfSlot(this, refNode, function (elem, node, slot) {
      slot.removeChild(refNode);
    });
    return refNode;
  },
  replaceChild (newNode, refNode) {
    doForNodesIfSlot(this, refNode, function (elem, node, slot) {
      slot.replaceChild(newNode, refNode);
    });
    return refNode;
  }
};


// Polyfills an element.
export default function (elem) {
  if (mapPolyfilled.get(elem)) {
    return;
  }

  // Polyfill properties.
  for (let name in props) {
    prop(elem, name, props[name]);
  }

  // Polyfill methods.
  for (let name in funcs) {
    elem[name] = funcs[name];
  }

  mapPolyfilled.set(elem, true);
  return elem;
}
