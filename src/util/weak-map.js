export default window.WeakMap || (function () {
  let index = 0;
  function Wm () {
    this.key = `____weak_map_${index++}`;
  }
  Wm.prototype = {
    delete (obj) {
      if (obj) {
        delete obj[this.key];
      }
    },
    get (obj) {
      return obj ? obj[this.key] : null;
    },
    has (obj) {
      return obj ? typeof obj[this.key] !== 'undefined' : false;
    },
    set (obj, val) {
      return obj ? obj[this.key] = val : null;
    }
  };
  return Wm;
}());
