export function eachChildNode (node, func) {
  const chs = node.childNodes;
  const chsLen = chs.length;
  for (let a = 0; a < chsLen; a++) {
    func(chs[a], a);
  }
}

export function eachNodeOrFragmentNodes (node, func) {
  if (node instanceof DocumentFragment) {
    const chs = node.childNodes;
    const chsLen = chs.length;
    for (let a = 0; a < chsLen; a++) {
      func(chs[a], a);
    }
  } else {
    func(node, 0);
  }
}
