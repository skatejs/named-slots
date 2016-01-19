const el = Node.prototype;
const mapPatch = new WeakMap();
const mapSlots = new WeakMap();
const mapSlotsDefault = new WeakMap();
const prop = Object.defineProperty.bind(Object);


// Helpers.

function getSlotName (elem, node) {
  return node.getAttribute && node.getAttribute('slot') || mapSlotsDefault.get(elem);
}

function nodeToArray (node) {
  return node instanceof DocumentFragment ? [].slice.call(node.childNodes) : [node];
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
      return (mapSlots.get(this) || []).reduce((prev, curr) => prev.concat(this[curr]), []);
    }
  },
  children: {
    get () {
      return this.childNodes.filter(node => node.nodeType === 1);
    }
  },
  firstChild: {
    get () {
      return this.childNodes[0];
    }
  },
  firstElementChild: {
    get () {
      return this.children[0];
    }
  },
  innerHTML: {
    get () {
      return this.childNodes.map(node => node.outerHTML || node.textContent).join('');
    },
    set (val) {
      this.appendChild(skate.fragment(val));
    }
  },
  lastChild: {
    get () {
      const ch = this.childNodes;
      return ch[ch.length - 1];
    }
  },
  lastElementChild: {
    get () {
      const ch = this.children;
      return ch[ch.length - 1];
    }
  },
  outerHTML: {
    get () {
      var name = this.tagName.toLowerCase();
      var attributes = [].slice.call(this.attributes).map(function (attr) {
        return ` ${attr.name}${attr.value ? `=${attr.value}` : ''}`;
      });
      return `<${name}${attributes}>${this.innerHTML}</${name}>`;
    }
  },
  textContent: {
    get () {
      return this.childNodes.map(node => node.textContent).join('');
    },
    set (val) {
      const slot = mapSlotsDefault.get(this);
      if (slot) {
        this[slot] = document.createTextNode(val);
      }
    }
  }
};


// Method overrides.

const funcs = {
  appendChild (newNode) {
    const name = getSlotName(this, newNode);
    if (!name && !this[name]) return;
    this[name] = this[name].concat(nodeToArray(newNode));
    return newNode;
  },
  hasChildNodes () {
    return this.childNodes.length > 0;
  },
  insertBefore (newNode, refNode) {
    const name = getSlotName(this, newNode);
    if (!name || !this[name]) return;
    const index = this[name].indexOf(refNode);
    this[name] = this[name].slice(0, index).concat(nodeToArray(newNode)).concat(this[name].slice(index));
    return newNode;
  },
  removeChild (refNode) {
    const name = getSlotName(this, refNode);
    if (!name && !this[name]) return;
    const index = this[name].indexOf(refNode);
    this[name] = this[name].slice(0, index).concat(this[name].slice(index + 1));
    return refNode;
  },
  replaceChild (newNode, refNode) {
    const name = getSlotName(this, newNode);
    if (!name || !this[name]) return;
    const index = this[name].indexOf(refNode);
    this[name] = this[name].slice(0, index).concat(nodeToArray(newNode)).concat(this[name].slice(index + 1));
    return refNode;
  }
};


// Polyfill.

function polyfill (elem) {
  if (mapPatch.get(elem)) {
    return;
  }
  
  for (var name in props) {
    prop(elem, name, props[name]);
  }
  
  for (var name in funcs) {
    elem[name] = funcs[name];
  }
  
  mapPatch.set(elem, true);
}

function slot (opts) {
  if (!opts) {
    opts = {
      default: false,
      set: null
    };
  }
  
  return {
    // Makes sure that whatever is passed in is an array.
    coerce: function (val) { 
      return Array.isArray(val) ? val : [val];
    },
    
    // Registers the slot so we can check later.
    created: function (elem, data) {
      var slots = mapSlots.get(elem);
      
      if (!slots) {
        mapSlots.set(elem, slots = []);
      }
      
      slots.push(data.name);
      
      if (opts.default) {
        mapSlotsDefault.set(elem, data.name);
      }
    },
    
    // If an empty value is passed in, ensure that it's an array.
    'default': function () { 
      return [];
    },
    
    // Return any initial nodes that match the slot.
    initial: function (elem, data) {
      return [].slice.call(elem.childNodes).filter(function (ch) {
        var slot = (ch.getAttribute && ch.getAttribute('slot')) || (opts.default && data.name);
        return slot && slot === data.name;
      });
    },
    
    // User-defined setter.
    set: opts.set
  }
}
