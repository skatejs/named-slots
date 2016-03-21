import assignFunc from './assign-func';

export default function (obj, funcs, prefix) {
  for (let name in funcs) {
    assignFunc(obj, name, funcs[name], prefix);
  }
}
