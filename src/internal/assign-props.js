import assignProp from './assign-prop';

export default function (obj, props, prefix) {
  for (let name in props) {
    assignProp(obj, name, props[name], prefix);
  }
}
