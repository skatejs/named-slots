const { Node } = window;
const div = document.createElement('div');

function getPrototype (obj, key) {
  let descriptor;

  while (obj && !(descriptor = Object.getOwnPropertyDescriptor(obj, key))) { // eslint-disable-line no-cond-assign
    obj = Object.getPrototypeOf(obj);
  }
  return descriptor;
}
export default function (obj, key) {
  if (obj instanceof Node) {
    obj = div;
  }
  const proto = getPrototype(obj, key);

  if (proto) {
    const getter = proto.get;
    const setter = proto.set;
    const descriptor = {
      configurable: true,
      enumerable: true
    };

    if (getter) {
      descriptor.get = getter;
      descriptor.set = setter;
      return descriptor;
    } else if (typeof obj[key] === 'function') {
      descriptor.value = obj[key];
      return descriptor;
    }
  }

  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor && descriptor.get) {
    return descriptor;
  }
}
