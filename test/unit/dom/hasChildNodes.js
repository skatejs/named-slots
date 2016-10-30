/* eslint-env jasmine, mocha */
import htmlContent from '../../lib/html-content';

describe('dom: hasChildNodes', () => {
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

      it('should return false if there are no child nodes', () => {
        htmlContent(elem, '');
        expect(elem.hasChildNodes()).to.equal(false);
      });

      it('should return true if there is one element child node', () => {
        htmlContent(elem, '<div></div>');
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return true if there is one text child node', () => {
        htmlContent(elem, 'text');
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return true if there is one comment child node', () => {
        htmlContent(elem, '<!--comment-->');
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return true if there is more than one child node', () => {
        htmlContent(elem, '<div></div>text<div></div>');
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return correct value in a complex tree', () => {
        htmlContent(elem, '<div1></div1><div1><div1></div1><div1><div1></div1></div1></div1><div1></div1>');
        expect(elem.hasChildNodes()).to.equal(true);
        expect(elem.firstChild.hasChildNodes()).to.equal(false);
        expect(elem.childNodes[1].hasChildNodes()).to.equal(true);
        expect(elem.childNodes[1].childNodes[0].hasChildNodes()).to.equal(false);
        expect(elem.childNodes[1].childNodes[1].hasChildNodes()).to.equal(true);
        expect(elem.lastChild.hasChildNodes()).to.equal(false);
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
