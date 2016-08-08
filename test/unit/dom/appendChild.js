describe('dom: appendChild', () => {
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

      it('should not append anything if there is nothing to append', () => {
        expect(() => {
          elem.appendChild(null);
        }).to.throw(Error);
      });

      it('should return an appended div', () => {
        const appended = document.createElement('div');
        const changedElem = elem.appendChild(appended);
        expect(changedElem).not.to.equal(undefined);
        expect(changedElem).to.equal(appended);
      });

      it('should return an appended document fragment', () => {
        const appended = document.createDocumentFragment();
        const div2 = document.createElement('div');
        appended.appendChild(div2);
        const changedElem = elem.appendChild(appended);
        expect(changedElem).not.to.equal(undefined);
        expect(changedElem).to.equal(appended);
      });

      it('should append one element node to an empty parent', () => {
        elem.appendChild(document.createElement('div'));
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal('<div></div>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should append one element node to a parent with one child', () => {
        elem.innerHTML = '<test></test>';
        elem.appendChild(document.createElement('div'));
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal('<test></test><div></div>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should append one element node to a parent with two or more children', () => {
        const html = '<test1></test1><test2><test3></test3></test2>';
        elem.innerHTML = html;
        elem.appendChild(document.createElement('div'));
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}<div></div>`);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should append an element node with children to a parent without any children', () => {
        const child = document.createElement('div');
        const html = '<test1></test1><test2><test3></test3></test2>';
        child.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal(`<div>${html}</div>`);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should append an element node with children to a parent with two or more children', () => {
        const child = document.createElement('div');
        const html = '<test1></test1><test2><test3></test3></test2>';
        child.innerHTML = html;
        elem.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}<div>${html}</div>`);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should append one text node to an empty parent', () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal('text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should append one text node to a parent with one child', () => {
        elem.innerHTML = '<test></test>';
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal('<test></test>text');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should append one text node to a parent with two or more children', () => {
        const child = document.createTextNode('text');
        const html = '<test1></test1><test2><test3></test3></test2>';
        elem.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}text`);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should append one comment node to an empty parent', () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal('<!--comment-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should append one comment node to a parent with one child', () => {
        elem.innerHTML = '<test></test>';
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal('<test></test><!--comment-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should append one comment node to a parent with two or more children', () => {
        const child = document.createComment('comment');
        const html = '<test1></test1><test2><test3></test3></test2>';
        elem.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}<!--comment-->`);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should do a series of appends', () => {
        const resultHTML = '<div1><div4><div5></div5><div6></div6></div4></div1><div2></div2><div3></div3>';
        elem.appendChild(document.createElement('div1'));
        elem.appendChild(document.createElement('div2'));
        elem.appendChild(document.createElement('div3'));
        elem.childNodes[0].appendChild(document.createElement('div4'));
        elem.childNodes[0].childNodes[0].appendChild(document.createElement('div5'));
        elem.childNodes[0].childNodes[0].appendChild(document.createElement('div6'));

        expect(elem.childNodes.length).to.equal(3);
        expect(elem.childNodes[0].childNodes.length).to.equal(1);
        expect(elem.childNodes[0].childNodes[0].childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal(resultHTML);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
