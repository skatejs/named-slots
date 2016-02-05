import mapPatch from './internal/map/patch';
import mapSlots from './internal/map/slots';
import mapSlotsDefault from './internal/map/slots-default';
import polyfilled from './polyfilled';

const prop = Object.defineProperty.bind(Object);


// Helpers.

function getSlot (elem, node) {
  const key = getSlotName(elem, node);
  const val = elem[key];
  return key && val ? { key, val: val.slice() } : null;
}

function getSlotName (elem, node) {
  return node.getAttribute && node.getAttribute('slot') || mapSlotsDefault.get(elem);
}

// TODO use in DOM manip methods to make them DocumentFragment compatible.
function nodeToArray (node) {
  return node instanceof DocumentFragment ? [].slice.call(node.childNodes) : [node];
}

function arrayItem (idx) {
  return this[idx];
}

function makeLikeNodeList (arr) {
  arr.item = arrayItem;
  return arr;
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
      return makeLikeNodeList((mapSlots.get(this) || []).reduce((prev, curr) => prev.concat(this[curr]), []));
    }
  },
  children: {
    get () {
      return makeLikeNodeList(this.childNodes.filter(node => node.nodeType === 1));
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
      const name = this.tagName.toLowerCase();
      const attributes = [].slice.call(this.attributes).map(function (attr) {
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
    const slot = getSlot(this, newNode);
    if (!slot) {
      return;
    }
    slot.val.push(newNode);
    this[slot.key] = slot.val;
    return newNode;
  },
  hasChildNodes () {
    return this.childNodes.length > 0;
  },
  insertBefore (newNode, refNode) {
    const slot = getSlot(this, newNode);
    if (!slot) {
      return;
    }
    const index = slot.val.indexOf(refNode);
    if (index === -1) {
      slot.val.push(newNode);
    } else {
      slot.val.splice(index, 0, newNode);
    }
    this[slot.key] = slot.val;
    return newNode;
  },
  removeChild (refNode) {
    const slot = getSlot(this, refNode);
    if (!slot) {
      return;
    }
    const index = slot.val.indexOf(refNode);
    if (index !== -1) {
      slot.val.splice(index, 1);
      this[slot.key] = slot.val;
    }
    return refNode;
  },
  replaceChild (newNode, refNode) {
    const slot = getSlot(this, newNode);
    if (!slot) {
      return;
    }
    const index = slot.val.indexOf(refNode);
    if (index !== -1) {
      slot.val.splice(index, 1, newNode);
      this[slot.key] = slot.val;
    }
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
