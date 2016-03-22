export default function (html) {
  const frag = document.createElement('div');
  frag.innerHTML = html;
  return frag;
}
