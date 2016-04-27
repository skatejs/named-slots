/**
 * @returns {string}
 * @param {commentNode}
 */
export default function getCommentNodeOuterHtml (commentNode) {
  return `<!--${commentNode.textContent}-->`;
}
