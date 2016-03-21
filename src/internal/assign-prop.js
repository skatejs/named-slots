import propGet from './prop-get';
import propSet from './prop-set';

export default function (obj, name, prop, prefix) {
  if (prefix) {
    propSet(obj, prefix + name, propGet(obj, name));
  }
  propSet(obj, name, prop);
}
