export default function (obj, name, func, prefix) {
  if (prefix) {
    obj[prefix + name] = obj[name];
  }
  obj[name] = func;
}
