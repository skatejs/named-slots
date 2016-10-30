/* eslint-env jasmine, mocha */
import htmlContent from '../../lib/html-content';

describe('dom: removeChild', () => {
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

      it('should return removed element node', () => {
        const removed = document.createElement('div');
        elem.appendChild(removed);
        const res = elem.removeChild(removed);
        expect(res).to.be.equal(removed);
      });

      it('should return removed text node', () => {
        const removed = document.createTextNode('text');
        elem.appendChild(removed);
        const res = elem.removeChild(removed);
        expect(res).to.be.equal(removed);
      });

      it('should return removed comment node', () => {
        const removed = document.createComment('comment');
        elem.appendChild(removed);
        const res = elem.removeChild(removed);
        expect(res).to.be.equal(removed);
      });

      it('removedChild should not have parent', () => {
        const removed = document.createElement('div');
        elem.appendChild(removed);
        elem.removeChild(removed);
        expect(removed.parentNode).to.be.equal(null);
      });

      it('should remove a single element node', () => {
        htmlContent(elem, '<test></test>');
        elem.removeChild(elem.childNodes[0]);

        expect(htmlContent(elem)).to.be.equal('');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should remove a single text node', () => {
        htmlContent(elem, 'text');
        elem.removeChild(elem.childNodes[0]);

        expect(htmlContent(elem)).to.be.equal('');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should remove a single comment node', () => {
        htmlContent(elem, '<!--comment-->');
        elem.removeChild(elem.childNodes[0]);

        expect(htmlContent(elem)).to.be.equal('');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should remove a single element node from a parent with children', () => {
        htmlContent(elem, '<test></test><test2></test2><test3></test3>');
        elem.removeChild(elem.childNodes[1]);

        expect(htmlContent(elem)).to.be.equal('<test></test><test3></test3>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should remove a single text node from a parent with children', () => {
        htmlContent(elem, 'text<test2></test2>another text');
        elem.removeChild(elem.firstChild);

        expect(htmlContent(elem)).to.be.equal('<test2></test2>another text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should remove a single comment node from a parent with children', () => {
        htmlContent(elem, '<!--comment--><test2></test2>another text');
        elem.removeChild(elem.firstChild);

        expect(htmlContent(elem)).to.be.equal('<test2></test2>another text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should remove an element node with children', () => {
        htmlContent(elem, '<!--comment--><test2><test3><test5>some text</test5></test3><test4></test4></test2><test></test>another text');
        elem.removeChild(elem.childNodes[1]);

        expect(htmlContent(elem)).to.be.equal('<!--comment--><test></test>another text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should be able to remove child after child', () => {
        htmlContent(elem, '<!--comment--><test2><test3><test5>some text</test5></test3><test4></test4></test2><test></test>another text<test6></test6>'); // eslint-disable-line max-len
        elem.removeChild(elem.firstChild);
        elem.removeChild(elem.childNodes[1]);
        elem.removeChild(elem.firstChild);
        elem.removeChild(elem.firstChild);

        expect(htmlContent(elem)).to.be.equal('<test6></test6>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
