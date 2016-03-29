import canPatchNativeAccessors from './can-patch-native-accessors';
import element from './element';
import node from './node';

const html = HTMLElement.prototype;

function getNativeProto (name) {
  return node.hasOwnProperty(name) ? node : element;
}

export default function (members, prefix = '__') {
  const methods = Object.keys(members).filter(name => typeof members[name].value === 'function');
  const properties = Object.keys(members).filter(name => typeof members[name].value !== 'function');

  // Everything should be configurable.
  for (let name in members) {
    members[name].configurable = true;
  }

  methods.forEach(function (name) {
    const proto = getNativeProto(name);
    html[prefix + name] = proto[name];
    html[name] = members[name].value;
  });

  if (canPatchNativeAccessors) {
    properties.forEach(function (name) {
      const proto = getNativeProto(name);
      const nativeDescriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (nativeDescriptor) {
        Object.defineProperty(html, prefix + name, nativeDescriptor);
      }
      Object.defineProperty(html, name, members[name]);
    });
  } else {
    return function (instance) {
      properties.forEach(function (name) {
        Object.defineProperty(instance, name, members[name]);
      });
    };
  }

  return function () {};
}
