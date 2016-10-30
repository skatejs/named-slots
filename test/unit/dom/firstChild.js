/* eslint-env jasmine, mocha */
import htmlContent from '../../lib/html-content';

describe('dom: firstChild', () => {
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

      it('should return null if there are no children', () => {
        htmlContent(elem, '');
        expect(elem.firstChild).to.equal(null);
      });

      it('should return correct element node from a parent with just one child', () => {
        const appended = document.createElement('test');
        elem.appendChild(appended);
        expect(elem.firstChild).to.equal(appended);
      });

      it('should return correct text node from a parent with just one child', () => {
        const appended = document.createTextNode('text');
        elem.appendChild(appended);
        expect(elem.firstChild).to.equal(appended);
      });

      it('should return correct comment node from a parent with just one child', () => {
        const appended = document.createComment('comment');
        elem.appendChild(appended);
        expect(elem.firstChild).to.equal(appended);
      });

      it('should return correct element node from a parent with two or more children', () => {
        const appended = document.createElement('test');
        elem.appendChild(appended);
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        expect(elem.firstChild).to.equal(appended);
      });

      it('should return correct text node from a parent with two or more children', () => {
        const appended = document.createTextNode('text');
        elem.appendChild(appended);
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        expect(elem.firstChild).to.equal(appended);
      });

      it('should return correct comment node from a parent with two or more children', () => {
        const appended = document.createComment('comment');
        elem.appendChild(appended);
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        expect(elem.firstChild).to.equal(appended);
      });

      it('should return firstChild in a complex tree', () => {
        const child1 = document.createElement('test1');
        const child2 = document.createElement('test2');
        htmlContent(elem, '<div1></div1><div2><div3></div3></div2><div4></div4>');
        elem.childNodes[0].appendChild(child1);
        elem.childNodes[1].childNodes[0].appendChild(child2);

        expect(elem.firstChild.firstChild).to.equal(child1);
        expect(elem.childNodes[1].firstChild.firstChild).to.equal(child2);
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
