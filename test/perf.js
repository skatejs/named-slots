import '../src/index';
import benchmark from 'birdpoo';

describe('add / remove', () => {
  const div = document.createElement.bind(document, 'div');

  function fn(elem) {
    const ch = div();
    const el = elem;
    el.appendChild(ch);
    el.removeChild(ch);
  }

  function fn_native(elem) {
    const ch = div();
    const el = elem;
    el.__appendChild(ch);
    el.__removeChild(ch);
  }


  benchmark(() => {
    const elem = div();
    fn_native(elem);
  }).then((opsPerSec) => {
    console.log('native: ', opsPerSec);
  });

  benchmark(() => {
    const elem = div();
    fn(elem);
  }).then((opsPerSec) => {
    console.log('polyfilled (no root): ', opsPerSec);
  });

  benchmark(() => {
    const elem = div();
    elem.attachShadow({ mode: 'closed' });
    fn(elem);
  }).then((opsPerSec) => {
    console.log('prolyfill (no slot): ', opsPerSec);
  });

  benchmark(() => {
    const elem = div();
    const root = elem.attachShadow({ mode: 'closed' });
    root.innerHTML = '<slot></slot>';
    fn(elem);
  }).then((opsPerSec) => {
    console.log('prolyfill (default slot): ', opsPerSec);
  });
});

describe('add / remove document fragments', () => {
  const frag = document.createDocumentFragment.bind(document);
  const div = document.createElement.bind(document, 'div');

  function fn(elem) {
    const ch = frag();
    const el = elem;
    ch.appendChild(div());

    el.appendChild(ch);
    el.removeChild(ch);
  }

  benchmark(() => {
    const elem = div();
    const root = elem.attachShadow({ mode: 'closed' });
    root.innerHTML = '<slot></slot>';
    fn(elem);
  }).then((opsPerSec) => {
    console.log('prolyfill (fragments): ', opsPerSec);
  });
});
