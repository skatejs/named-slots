export function eachChildNode(node, func) {
  if (!node) {
    return;
  }

  const chs = node.childNodes;
  const chsLen = chs.length;
  for (let a = 0; a < chsLen; a++) {
    const ret = func(chs[a], a, chs);
    if (typeof ret !== 'undefined') {
      return ret; // eslint-disable-line consistent-return
    }
  }
}

export function eachNodeOrFragmentNodes(node, func) {
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
