export default function (frag) {
  let html = '';
  let chs = frag.childNodes;
  let chsLen = chs.length;
  for (let a = 0; a < chsLen; a++) {
    html += chs[a].outerHTML;
  }
  return html;
}
