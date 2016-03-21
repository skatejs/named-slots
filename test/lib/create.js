export default function (name, attrs = {}, chren = []) {
  const elem = document.createElement(name);
  const attrsIsChren = Array.isArray(attrs);
  chren = attrsIsChren ? attrs : chren;
  attrs = attrsIsChren ? {} : attrs;
  Object.keys(attrs).forEach(key => elem.setAttribute(key, attrs[key]));
  chren.forEach(ch => elem.appendChild(typeof ch === 'string' ? document.createTextNode(ch) : ch));
  return elem;
}
