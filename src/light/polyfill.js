import { parentNode, polyfilled, slotted } from './data';
import canPatchNativeAccessors from '../util/can-patch-native-accessors';

const configurable = true;
const lightProps = {
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
        let index;
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;
        for (let a = 0; a < parChsLen; a++) {
          if (parChs[a] === this) {
            index = a;
            continue;
          }
        }
        return typeof index === 'number' ? parChs[index + 1] : null;
      }
      return this.__nextSibling;
    }
  },
  nextElementSibling: {
    configurable,
    get () {
      if (slotted.get(this)) {
        let next;
        while ((next = this.nextSibling)) {
          if (next.nodeType === 1) {
            return next;
          }
        }
        return null;
      }
      return this.__nextElementSibling;
    }
  },
  previousSibling: {
    configurable,
    get () {
      if (slotted.get(this)) {
        let index;
        const parChs = this.parentNode.childNodes;
        const parChsLen = parChs.length;
        for (let a = 0; a < parChsLen; a++) {
          if (parChs[a] === this) {
            index = a;
            continue;
          }
        }
        return typeof index === 'number' ? parChs[index - 1] : null;
      }
      return this.__previousSibling;
    }
  },
  previousElementSibling: {
    configurable,
    get () {
      if (slotted.get(this)) {
        let prev;
        while ((prev = this.previousSibling)) {
          if (prev.nodeType === 1) {
            return prev;
          }
        }
        return null;
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
  for (let name in lightProps) {
    const proto = nodeProto.hasOwnProperty(name) ? nodeProto : elProto;
    Object.defineProperty(proto, '__' + name, Object.getOwnPropetyDescriptor(proto, name));
    Object.defineProperty(proto, name, lightProps[name]);
  }
}

export default function (light) {
  if (!canPatchNativeAccessors && !polyfilled.get(light)) {
    polyfilled.set(light, true);
    Object.defineProperties(light, lightProps);
  }
}
