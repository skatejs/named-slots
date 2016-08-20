describe('dom: removeChild', () => {
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
        elem.innerHTML = '<test></test>';
        elem.removeChild(elem.childNodes[0]);

        expect(elem.innerHTML).to.be.equal('');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should remove a single text node', () => {
        elem.innerHTML = 'text';
        elem.removeChild(elem.childNodes[0]);

        expect(elem.innerHTML).to.be.equal('');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should remove a single comment node', () => {
        elem.innerHTML = '<!--comment-->';
        elem.removeChild(elem.childNodes[0]);

        expect(elem.innerHTML).to.be.equal('');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should remove a single element node from a parent with children', () => {
        elem.innerHTML = '<test></test><test2></test2><test3></test3>';
        elem.removeChild(elem.childNodes[1]);

        expect(elem.innerHTML).to.be.equal('<test></test><test3></test3>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should remove a single text node from a parent with children', () => {
        elem.innerHTML = 'text<test2></test2>another text';
        elem.removeChild(elem.firstChild);

        expect(elem.innerHTML).to.be.equal('<test2></test2>another text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should remove a single comment node from a parent with children', () => {
        elem.innerHTML = '<!--comment--><test2></test2>another text';
        elem.removeChild(elem.firstChild);

        expect(elem.innerHTML).to.be.equal('<test2></test2>another text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should remove an element node with children', () => {
        elem.innerHTML = '<!--comment--><test2><test3><test5>some text</test5></test3><test4></test4></test2><test></test>another text';
        elem.removeChild(elem.childNodes[1]);

        expect(elem.innerHTML).to.be.equal('<!--comment--><test></test>another text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should be able to remove child after child', () => {
        elem.innerHTML = '<!--comment--><test2><test3><test5>some text</test5></test3><test4></test4></test2><test></test>another text<test6></test6>'; // eslint-disable-line max-len
        elem.removeChild(elem.firstChild);
        elem.removeChild(elem.childNodes[1]);
        elem.removeChild(elem.firstChild);
        elem.removeChild(elem.firstChild);

        expect(elem.innerHTML).to.be.equal('<test6></test6>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
