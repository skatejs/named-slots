describe('dom: SVGElement', () => {
  function expectToBeLikeNodeList(val) {
    expect(val).not.to.equal(undefined, 'like NodeList: undefined');
    expect(val.length).to.be.a('number', 'like NodeList: length not a number');
    expect(val.item).to.be.a('function', 'like NodeList: item not a function');
  }

  function runTests(type) {
    describe(`${type}: `, () => {
      let host;
      let root;
      let slot;
      let div;
      let elem;

      beforeEach(() => {
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = document.createElement('slot');

        root.appendChild(slot);

        div = document.createElement('div');

        switch (type) {
        case 'div':
          elem = div;
          break;
        case 'slot':
          elem = slot;
          break;
        case 'root':
          root.innerHTML = '';
          elem = root;
          break;
        default:
          elem = host;
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
  runTests('slot');
  runTests('host');
  runTests('root');
});
