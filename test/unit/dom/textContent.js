/* eslint-env jasmine, mocha */

describe('dom: textContent', () => {
  function runTests (type) {
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

      it('should be set correctly to a node without children', () => {
        elem.textContent = '<test />';
        expect(elem.textContent).to.equal('<test />');
        expect(elem.innerHTML).to.equal('&lt;test /&gt;');
        expect(elem.childNodes.length).to.equal(1);
      });

      it('should be set correctly to a node with children', () => {
        elem.innerHTML = 'text <div></div>';
        elem.textContent = '<test />';
        expect(elem.textContent).to.equal('<test />');
        expect(elem.innerHTML).to.equal('&lt;test /&gt;');
        expect(elem.childNodes.length).to.equal(1);
      });

      it('should always get the correct text value', () => {
        elem.innerHTML = '';
        expect(elem.textContent).to.equal('');

        elem.innerHTML = '<div></div>';
        expect(elem.textContent).to.equal('');

        elem.innerHTML = '<div>text</div>';
        expect(elem.textContent).to.equal('text');

        elem.innerHTML = 'outside <div>text</div> outside ';
        expect(elem.textContent).to.equal('outside text outside ');

        elem.innerHTML = 'outside <div>text <div>deep inside</div> <div>another</div></div> outside ';
        expect(elem.textContent).to.equal('outside text deep inside another outside ');
      });

      it('should not return comments', () => {
        elem.innerHTML = '<!-- comment -->';
        expect(elem.textContent).to.equal('');
      });

      it('setting to \'\' does not affect textContent', () => {
        elem.textContent = '';
        expect(elem.innerHTML).to.equal('');
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
