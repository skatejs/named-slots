export default function (src, dst) {
  while (src.hasChildNodes()) {
    dst.appendChild(src.firstChild);
  }
}
