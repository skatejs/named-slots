export default function (elem) {
  while (elem.hasChildNodes()) {
    elem.removeChild(elem.firstChild);
  }
}
