/**
 * @returns {string}
 * @param {commentNode}
 */
export default function getCommentNodeOuterHtml (commentNode) {
  return commentNode.text || `<!--${commentNode.textContent}-->`;
}
