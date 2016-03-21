export default window.WeakMap || (function () {
  let index = 0;
  function Wm () {
    this.key = `____weak_map_${index++}`;
  }
  Wm.prototype = {
    delete (obj) {
      delete obj[this.key];
    },
    get (obj) {
      return obj[this.key];
    },
    has (obj) {
      return typeof obj[this.key] !== 'undefined';
    },
    set (obj, val) {
      return obj[this.key] = val;
    }
  };
  return Wm;
}());
