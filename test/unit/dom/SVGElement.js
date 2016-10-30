/* eslint-env jasmine, mocha */

describe('dom: SVGElement', () => {
  function expectToBeLikeNodeList (val) {
    expect(val).not.to.equal(undefined, 'like NodeList: undefined');
    expect(val.length).to.be.a('number', 'like NodeList: length not a number');
    expect(val.item).to.be.a('function', 'like NodeList: item not a function');
  }

  function runTests (type) {
    describe(`${type}: `, () => {
      let div;
      let elem;
      let fragment;
      let host;
      let root;
      let slot;

      beforeEach(() => {
        div = document.createElement('div');
        fragment = document.createElement('fragment');
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = document.createElement('slot');

        root.appendChild(slot);

        switch (type) {
          case 'div':
            elem = div;
            break;
          case 'fragment':
            elem = fragment;
            break;
          case 'host':
            elem = host;
            break;
          case 'root':
            root.innerHTML = '';
            elem = root;
            break;
          case 'slot':
            elem = slot;
            break;
        }
      });

      it('should be polyfilled', () => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        elem.appendChild(svg);
        expect(svg.parentNode).to.equal(elem);
        expectToBeLikeNodeList(svg.childNodes);
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
