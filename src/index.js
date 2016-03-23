import polyfill from './shadow/polyfill';
import render from './render';
import version from './version';

Element.prototype.attachShadow = function (opts) {
  return polyfill(this, opts);
};

export default polyfill;
export {
  render,
  version
};
