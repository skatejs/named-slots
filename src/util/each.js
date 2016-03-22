// Does something for a single node or a DocumentFragment. This is useful when
// working with arguments that are passed to DOM methods that work with either.
export default function (node, func) {
  if (node instanceof DocumentFragment) {
    const chs = node.childNodes;
    const chsLen = chs.length;
    for (let a = 0; a < chsLen; a++) {
      func(chs[a]);
    }
  } else {
    func(node);
  }
}
