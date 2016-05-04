/**
 * See https://w3c.github.io/DOM-Parsing/#serializing
 * @param {TextNode}
 * @returns {string}
 */
export default function getEscapedTextContent (textNode) {
  return textNode.textContent.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
