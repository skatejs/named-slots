export default function (elem, funcs, prefix) {
  for (let a in funcs) {
    if (prefix) {
      elem[prefix + a] = elem[a];
    }
    elem[a] = funcs[a];
  }
}
