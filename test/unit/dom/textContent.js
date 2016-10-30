/* eslint-env jasmine, mocha */
import htmlContent from '../../lib/html-content';

describe('dom: textContent', () => {
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
        fragment = document.createDocumentFragment();
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

      it('should be set correctly to a node without children', () => {
        elem.textContent = '<test />';
        expect(elem.textContent).to.equal('<test />');
        expect(htmlContent(elem)).to.equal('&lt;test /&gt;');
        expect(elem.childNodes.length).to.equal(1);
      });

      it('should be set correctly to a node with children', () => {
        htmlContent(elem, 'text <div></div>');
        elem.textContent = '<test />';
        expect(elem.textContent).to.equal('<test />');
        expect(htmlContent(elem)).to.equal('&lt;test /&gt;');
        expect(elem.childNodes.length).to.equal(1);
      });

      it('should always get the correct text value', () => {
        htmlContent(elem, '');
        expect(elem.textContent).to.equal('');

        htmlContent(elem, '<div></div>');
        expect(elem.textContent).to.equal('');

        htmlContent(elem, '<div>text</div>');
        expect(elem.textContent).to.equal('text');

        htmlContent(elem, 'outside <div>text</div> outside ');
        expect(elem.textContent).to.equal('outside text outside ');

        htmlContent(elem, 'outside <div>text <div>deep inside</div> <div>another</div></div> outside ');
        expect(elem.textContent).to.equal('outside text deep inside another outside ');
      });

      it('should not return comments', () => {
        htmlContent(elem, '<!-- comment -->');
        expect(elem.textContent).to.equal('');
      });

      it('setting to \'\' does not affect textContent', () => {
        elem.textContent = '';
        expect(htmlContent(elem)).to.equal('');
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
