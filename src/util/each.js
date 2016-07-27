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

/**
 * Run a function on each node or childnode of a document fragment, that may optionally append the
 * children to another element.
 *
 * @param node a node or a document fragment
 * @param func a function to run on the node or each child node of the document fragment. func may
 *        or may not append the child to another parent.
 */
export function appendEachNodeOrFragmentNodes(node, func) {
  if (node instanceof DocumentFragment) {
    let a = 0;
    let unappendedChildNodesCount = 0;
    const chs = node.childNodes;

    while (node.childNodes.length > unappendedChildNodesCount) {
      const originalLength = node.childNodes.length;
      func(chs[unappendedChildNodesCount], a);

      const didAppendNode = node.childNodes.length !== originalLength;
      if (!didAppendNode) {
        unappendedChildNodesCount++;
      }
      a++;
    }
  } else {
    func(node, 0);
  }
}
