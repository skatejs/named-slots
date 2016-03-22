import { assignedSlot, parentNode, polyfilled, slotted } from './data';
import canPatchNativeAccessors from '../util/can-patch-native-accessors';
import each from '../util/each';

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
      if (slotted.get(this)) {
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
      if (slotted.get(this)) {
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
      if (slotted.get(this)) {
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
      if (slotted.get(this)) {
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
      if (slotted.get(this)) {
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

// If we can't patch native accessors, we have to override native methods so
// that we can reset the parentNode on nodes that have already overriden the
// property.
if (!canPatchNativeAccessors) {
  ['appendChild', 'insertBefore', 'removeChild', 'replaceChild'].forEach(function (name) {
    nodeProto['__light__' + name] = nodeProto[name];
  });
  nodeProto.appendChild = function (newNode) {
    each(newNode, newNode => polyfilled.get(newNode) && parentNode.set(newNode, this));
    return this.__light__appendChild(newNode);
  };
  nodeProto.insertBefore = function (newNode, refNode) {
    each(newNode, newNode => polyfilled.get(newNode) && parentNode.set(newNode, this));
    return this.__light__insertBefore(newNode, refNode);
  };
  nodeProto.removeChild = function (refNode) {
    polyfilled.get(refNode) && parentNode.set(refNode, null);
    return this.__light__removeChild(refNode);
  };
  nodeProto.replaceChild = function (newNode, refNode) {
    each(newNode, newNode => polyfilled.get(newNode) && parentNode.set(newNode, this));
    polyfilled.get(refNode) && parentNode.set(refNode, null);
    return this.__light__replaceChild(newNode, refNode);
  };
}

// By default we should always return null from the Element for `assignedSlot`.
Object.defineProperty(nodeProto, 'assignedSlot', {
  configurable,
  get () { return null; }
});

export default function (light) {
  if (!canPatchNativeAccessors && !polyfilled.get(light)) {
    polyfilled.set(light, true);
    Object.defineProperties(light, members);
  }
}
