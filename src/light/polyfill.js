import { assignedSlot, light, parentNode, polyfilled } from './data';
import { appendChild, insertBefore, removeChild, replaceChild } from '../util/node';
import canPatchNativeAccessors from '../util/can-patch-native-accessors';

const configurable = true;
const members = {
  assignedSlot: {
    configurable,
    get () {
      return assignedSlot.get(this) || null;
    }
  },
  parentElement: {
    configurable,
    get () {
      if (light.get(this)) {
        const parent = this.parentNode;
        return parent.nodeType === 1 ? parent : null;
      }
      return this.__parentElement;
    }
  },
  parentNode: {
    configurable,
    get () {
      return parentNode.get(this) || this.__parentNode || null;
    }
  },
  nextSibling: {
    configurable,
    get () {
      if (light.get(this)) {
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;
        for (let a = 0; a < parChsLen; a++) {
          if (parChs[a] === this) {
            return parChs[a + 1] || null;
          }
        }
      }
      return this.__nextSibling;
    }
  },
  nextElementSibling: {
    configurable,
    get () {
      if (light.get(this)) {
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;

        let found = false;
        for (let a = 0; a < parChsLen; a++) {
          if (!found && parChs[a] === this) {
            found = true;
          }

          if (!found) {
            continue;
          }

          const next = parChs[a + 1];
          if (next && next.nodeType === 1) {
            return next;
          } else {
            continue;
          }
        }
      }
      return this.__nextElementSibling;
    }
  },
  previousSibling: {
    configurable,
    get () {
      if (light.get(this)) {
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;
        for (let a = parChsLen - 1; a >= 0; a--) {
          if (parChs[a] === this) {
            return parChs[a - 1] || null;
          }
        }
      }
      return this.__previousSibling;
    }
  },
  previousElementSibling: {
    configurable,
    get () {
      if (light.get(this)) {
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;

        let found = false;
        for (let a = parChsLen - 1; a >= 0; a--) {
          if (!found && parChs[a] === this) {
            found = true;
          }

          if (!found) {
            continue;
          }

          const next = parChs[a - 1];
          if (next && next.nodeType === 1) {
            return next;
          } else {
            continue;
          }
        }
      }
      return this.__previousElementSibling;
    }
  }
};


// If we can patch native accessors, we can safely apply light DOM accessors to
// all HTML elements. This is faster than polyfilling them individually as they
// are added, if possible, and doesn't have a measurable impact on performance
// when they're not marked as light DOM.
const nodeProto = Node.prototype;
const elProto = Element.prototype;
if (canPatchNativeAccessors) {
  for (let name in members) {
    const proto = nodeProto.hasOwnProperty(name) ? nodeProto : elProto;
    const nativeDescriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (nativeDescriptor) {
      Object.defineProperty(proto, '__' + name, nativeDescriptor);
    }
    Object.defineProperty(proto, name, members[name]);
  }
}


// We patch the node prototype to ensure any method that reparents a node
// cleans up after the polyfills.
nodeProto.appendChild = function (newNode) {
  if (polyfilled.get(newNode)) {
    assignedSlot.set(newNode, null);
    light.set(newNode, false);
    parentNode.set(newNode, this);
  }
  return appendChild.call(this, newNode);
};
nodeProto.insertBefore = function (newNode, refNode) {
  if (polyfilled.get(newNode)) {
    assignedSlot.set(newNode, null);
    light.set(newNode, false);
    parentNode.set(newNode, this);
  }
  return insertBefore.call(this, newNode, refNode);
};
nodeProto.removeChild = function (refNode) {
  if (polyfilled.get(refNode)) {
    assignedSlot.set(refNode, null);
    light.set(refNode, false);
    parentNode.set(refNode, null);
  }
  return removeChild.call(this, refNode);
};
nodeProto.replaceChild = function (newNode, refNode) {
  if (polyfilled.get(newNode)) {
    assignedSlot.set(newNode, null);
    light.set(newNode, false);
    parentNode.set(newNode, this);
  }
  if (polyfilled.get(refNode)) {
    assignedSlot.set(refNode, null);
    light.set(refNode, false);
    parentNode.set(refNode, null);
  }
  return replaceChild.call(this, newNode, refNode);
};


// The assignedSlot property is only available on nodes that have been slotted
// so we always return false and redefine it when it's slotted.
Object.defineProperty(nodeProto, 'assignedSlot', {
  configurable,
  get () { return null; }
});


export default function polyfill (light) {
  if (polyfilled.get(light)) {
    return;
  }
  polyfilled.set(light, true);
  if (!canPatchNativeAccessors) {
    Object.defineProperties(light, members);
  }
}
