import mapPatch from './internal/map/patch';
import mapSlots from './internal/map/slots';
import mapSlotsDefault from './internal/map/slots-default';
import polyfilled from './polyfilled';

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
      const div = document.createElement('div');
      div.innerHTML = val;
      while (div.hasChildNodes()) {
        this.appendChild(div.childNodes[0]);
      }
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


// Polyfills an element.
export default function (elem) {
  if (polyfilled(elem)) {
    return;
  }

  for (let name in props) {
    prop(elem, name, props[name]);
  }

  for (let name in funcs) {
    elem[name] = funcs[name];
  }

  mapPatch.set(elem, true);
}
