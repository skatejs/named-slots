import '../src/index';
import bench from './lib/bench';

describe('add / remove', () => {
  const div = document.createElement.bind(document, 'div');

  function fn() {
    const ch = div();
    const el = this.elem;
    el.appendChild(ch);
    el.removeChild(ch);
  }

  bench('native', () => {
    const elem = div();
    return { elem, fn };
  });

  bench('prollyfill (no slot)', () => {
    const elem = div();
    elem.attachShadow({ mode: 'closed' });
    return { elem, fn };
  });

  bench('prollyfill (default slot)', () => {
    const elem = div();
    const root = elem.attachShadow({ mode: 'closed' });
    root.innerHTML = '<slot></slot>';
    return { elem, fn };
  });
});
