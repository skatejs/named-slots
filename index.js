const el = Node.prototype;
const def = Object.defineProperty.bind(Object);


// Notes:
//
// - Slots are resolved only when needed.
// - If a slot is removed, it's not removed from the cache until
// - This only polyfills part of the API.


// Helpers.

function find (elem, slot) {
  return elem.querySelector(`[slot-target="${slot}"]`);
}

function getter (elem, name, get) {
  def(elem, name, { get });
}

function slot (elem, newNode) {
  const name = newNode.getAttribute && newNode.getAttribute('slot') || 'default';
  
  // Cache slots on element;
  if (!elem.__slots) {
    elem.__slots = {}
  }
  
  // Try to find and cache the specific slot if there is one.
  if (!elem.__slots[name]) {
    elem.__slots[name] = find(elem, name) || find(elem, 'default') || find(elem, '');
  }
  
  // Return the slot if it still exists otherwise delete it from the cache.
  if (elem.__slots[name]) {
    if (elem.__slots[name].parentNode) {
      return elem.__slots[name];
    } else {
      delete elem.__slots[name];
    }
  }
}


// Prop overrides.

function childElementCount () {
  return this.children.length;
}

function childNodes () {
  const nodes = [];
  const slots = this.__slots || {};
  for (var name in slots) {
    var slot = slots[name];
    var chNodes = slot.childNodes;
    var chNodesLen = chNodes.length;
    for (var a = 0; a < chNodesLen; a++) {
      nodes.push(chNodes[a]);
    }
  }
  return nodes;
}

function children () {
  return this.childNodes.filter(node => node.nodeType === 1);
}

function firstChild () {
  return this.childNodes[0];
}

function firstElementChild () {
  return this.children[0];
}

function innerHTML () {
  return this.childNodes.map(node => node.outerHTML || node.textContent).join('');
}

function lastChild () {
  const ch = this.childNodes;
  return ch[ch.length - 1];
}

function lastElementChild () {
  const ch = this.children;
  return ch[ch.length - 1];
}

function outerHTML () {
  
}

function textContent () {
  return this.childNodes.map(node => node.textContent).join('');
}


// Method overrides.

function appendChild (newNode) {
  const target = slot(this, newNode);
  return target && target.appendChild(newNode);
}

function hasChildNodes () {
  return this.childNodes.length;
}

function insertBefore (newNode, refNode) {
  const target = slot(this, newNode);
  return target && target.insertBefore(newNode, refNode);
}

function removeChild (refNode) {
  const target = slot(this, refNode);
  return target && target.removeChild(refNode);
}

function replaceChild (newNode, refNode) {
  const target = slot(this, refNode);
  return target && target.replaceChild(newNode, refNode);
}


// Polyfill.

export default function polyfill (node) {
  getter(node, 'childElementCount', childElementCount);
  getter(node, 'childNodes', childNodes);
  getter(node, 'children', children);
  getter(node, 'firstChild', firstChild);
  getter(node, 'firstElementChild', firstElementChild);
  getter(node, 'innerHTML', innerHTML);
  getter(node, 'innerText', textContent);
  getter(node, 'lastChild', lastChild);
  getter(node, 'outerHTML', outerHTML);
  getter(node, 'textContent', textContent);
  node.appendChild = appendChild;
  node.hasChildNodes = hasChildNodes;
  node.insertBefore = insertBefore;
  node.removeChild = removeChild;
  node.replaceChild = replaceChild;
};
