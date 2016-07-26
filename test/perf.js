import '../src/index';
import benchmark from 'birdpoo';

describe('add / remove', () => {
  const div = document.createElement.bind(document, 'div');

  function fn() {
    const ch = div();
    const el = this.elem;
    el.appendChild(ch);
    el.removeChild(ch);
  }

  benchmark(() => {
    const elem = div();
    return { elem, fn };
  }).then((opsPerSec) => {
    console.log('native: ', opsPerSec);
  });

  benchmark(() => {
    const elem = div();
    elem.attachShadow({ mode: 'closed' });
    return { elem, fn };
  }).then((opsPerSec) => {
    console.log('prollyfill (no slot): ', opsPerSec);
  });

  benchmark(() => {
    const elem = div();
    const root = elem.attachShadow({ mode: 'closed' });
    root.innerHTML = '<slot></slot>';
    return { elem, fn };
  }).then((opsPerSec) => {
    console.log('prollyfill (default slot): ', opsPerSec);
  });
});
