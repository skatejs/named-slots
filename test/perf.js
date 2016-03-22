import bench from '../lib/bench';
import polyfill from '../../src/host/polyfill';

describe('add / remove', function () {
  const div = document.createElement.bind(document, 'div');

  function fn () {
    const ch = div();
    const el = this.elem;
    el.appendChild(ch);
    el.removeChild(ch);
  }

  bench(`native`, function () {
    const elem = div();
    return { elem, fn };
  });

  bench('prollyfill (no slot)', function () {
    const elem = polyfill(div());
    return { elem, fn };
  });

  bench('prollyfill (default slot)', function () {
    const elem = div();
    elem.innerHTML = '<slot></slot>';
    polyfill(elem);
    return { elem, fn };
  });
});
