import propGet from './prop-get';
import propSet from './prop-set';

export default function (elem, props, prefix) {
  for (let name in props) {
    if (prefix) {
      propSet(elem, prefix + name, propGet(elem, name));
    }
    propSet(elem, name, props[name]);
  }
}
