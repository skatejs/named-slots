function htmlEncode (node) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      return node.outerHTML;
    case Node.TEXT_NODE:
      const surrogate = document.createElement('div');
      surrogate.textContent = node.textContent;
      return surrogate.innerHTML;
    case Node.COMMENT_NODE:
      return `<!--${node.textContent}-->`;
    default:
      throw new Error(`Unable to serialise node ${node}`);
  }
}

function setHtmlContent(node, html) {
  if (node instanceof DocumentFragment) {
    const surrogate = document.createElement('div');
    surrogate.innerHTML = html;
    while (node.firstChild) node.removeChild(node.firstChild);
    while (surrogate.firstChild) node.appendChild(surrogate.removeChild(surrogate.firstChild));
  } else {
    node.innerHTML = html;
  }
}

function getHtmlContent(node) {
  if (node instanceof DocumentFragment) {
    if (!node.firstChild) {
      return '';
    }
    let child = node.firstChild;
    let html = htmlEncode(child);
    while (child = child.nextSibling) html += htmlEncode(child);
    return html;
  } else {
    return node.innerHTML;
  }
}

/**
 * Fetch or set the HTML content of a node.
 *
 * For Elements this is easy (`.innerHTML`), but for DocumentFragments there's no
 * native API available, and so manual manipulation is performed
 *
 * @param {Element | DocumentFragment} node
 * @param {string} value? if specified, used to set the content of node
 * @returns {string | undefined} when `value` is not provided, returns the HTML
 *     representation of the node content
 */
export default function htmlContent (node, ...args) {
  if (args.length === 1) {
    return setHtmlContent(node, args[0]);
  } else {
    return getHtmlContent(node);
  }
}
