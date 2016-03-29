import { assignedSlot, light, parentNode, polyfilled } from './data';
import { appendChild, insertBefore, removeChild, replaceChild } from '../util/node';
import patchNative from '../util/patch-native';
import nodeProto from '../util/node';

const configurable = true;
const patchInstance = patchNative({
  appendChild: {
    value (newNode) {
      if (polyfilled.get(newNode)) {
        assignedSlot.set(newNode, null);
        light.set(newNode, false);
        parentNode.set(newNode, this);
      }
      return appendChild.call(this, newNode);
    }
  },
  assignedSlot: {
    configurable,
    get () {
      return assignedSlot.get(this) || null;
    }
  },
  insertBefore: {
    value (newNode, refNode) {
      if (polyfilled.get(newNode)) {
        assignedSlot.set(newNode, null);
        light.set(newNode, false);
        parentNode.set(newNode, this);
      }
      return insertBefore.call(this, newNode, refNode);
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
  },
  removeChild: {
    value (refNode) {
      if (polyfilled.get(refNode)) {
        assignedSlot.set(refNode, null);
        light.set(refNode, false);
        parentNode.set(refNode, null);
      }
      return removeChild.call(this, refNode);
    }
  },
  replaceChild: {
    value (newNode, refNode) {
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
    }
  }
});


// The assignedSlot property is only available on nodes that have been slotted
// so we always return false and redefine it when it's slotted.
Object.defineProperty(nodeProto, 'assignedSlot', {
  configurable,
  get () { return null; }
});


export default function polyfill (light) {
  if (polyfilled.get(light)) {
    return light;
  }
  patchInstance(light);
  polyfilled.set(light, true);
  return light;
}
