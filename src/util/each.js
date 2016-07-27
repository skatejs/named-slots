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

export function appendEachNodeOrFragmentNodes(node, func) {
  if (node instanceof DocumentFragment) {
    let a = 0;
    const chs = node.childNodes;
    while (node.childNodes.length > 0) {
      func(chs[0], a);
      a++;
    }
  } else {
    func(node, 0);
  }
}
