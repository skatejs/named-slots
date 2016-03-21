import fragFromHtml from './frag-from-html';
import htmlFromFrag from './html-from-frag';

export default function () {
  let childNodes = [];
  return {
    get childElementCount () {
      return this.children.length;
    },
    get childNodes () {
      return childNodes;
    },
    get children () {
      return childNodes.filter(ch => ch.nodeType === 1);
    },
    get firstChild () {
      return childNodes[0] || null;
    },
    get firstElementChild () {
      return this.children[0] || null;
    },
    get innerHTML () {
      return htmlFromFrag(this);
    },
    get lastChild () {
      return childNodes[childNodes.length - 1] || null;
    },
    get lastElementChild () {
      const chs = this.children;
      return chs[chs.length - 1];
    },
    get textContent () {
      return this.childNodes.map(node => node.textContent).join('');
    },

    set innerHTML (innerHTML) {
      childNodes = [].slice.call(fragFromHtml(innerHTML).childNodes);
    },
    set textContent (textContent) {
      childNodes = [document.createTextNode(textContent)];
    },

    appendChild (newNode) {
      childNodes.push(newNode);
      return newNode;
    },
    hasChildNodes () {
      return !!childNodes.length;
    },
    insertBefore (newNode, refNode) {
      childNodes.splice(childNodes.indexOf(refNode), 0, newNode);
      return newNode;
    },
    removeChild (refNode) {
      childNodes.splice(childNodes.indexOf(refNode), 1);
      return refNode;
    },
    replaceChild (newNode, refNode) {
      childNodes.splice(childNodes.indexOf(refNode), 1, newNode);
      return refNode;
    }
  };
}
