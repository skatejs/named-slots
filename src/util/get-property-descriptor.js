const div = document.createElement('div');
const hasLookupFunctions = !!div.__lookupGetter__;

export default function (obj, key) {
  if (hasLookupFunctions) {
    if (obj.constructor.toString().match('Element')) {
      obj = div;
    }

    const getter = obj.__lookupGetter__(key);
    const setter = obj.__lookupSetter__(key);
    const descriptor = {
      configurable: true,
      enumerable: true
    };

    if (getter) {
      descriptor.get = function () {
        return getter.call(this);
      };
      descriptor.set = function (value) {
        setter.call(this, value);
      };
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
