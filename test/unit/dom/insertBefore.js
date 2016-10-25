describe('dom: insertBefore', () => {
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

      it('should throw if nothing to insert', () => {
        expect(() => {
          elem.insertBefore(null);
        }).to.throw(Error);
        expect(elem.childNodes.length).to.equal(0);
      });

      it('should return the inserted node', () => {
        const inserted = document.createElement('div');
        const changedElem = elem.insertBefore(inserted, null);
        expect(changedElem).not.to.equal(undefined);
        expect(changedElem).to.equal(inserted);
      });

      it('should append node if referenceNode is null', () => {
        elem.innerHTML = '<div></div><div></div>';
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, null);

        expect(elem.innerHTML).to.equal('<div></div><div></div><test></test>');
        expect(elem.childNodes[2]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should insert an element node to a parent with no children', () => {
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, null);

        expect(elem.innerHTML).to.equal('<test></test>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should insert a text node to a parent with no children', () => {
        const inserted = document.createTextNode('text');
        elem.insertBefore(inserted, null);

        expect(elem.innerHTML).to.equal('text');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should insert a comment node to a parent with no children', () => {
        const inserted = document.createComment('comment');
        elem.insertBefore(inserted, null);

        expect(elem.innerHTML).to.equal('<!--comment-->');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should insert an element node to a parent with one child', () => {
        elem.innerHTML = '<div></div>';
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(elem.innerHTML).to.equal('<test></test><div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should insert a text node to a parent with one child', () => {
        elem.innerHTML = '<div></div>';
        const inserted = document.createTextNode('text');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(elem.innerHTML).to.equal('text<div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should insert a comment node to a parent with one child', () => {
        elem.innerHTML = '<div></div>';
        const inserted = document.createComment('comment');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(elem.innerHTML).to.equal('<!--comment--><div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should insert an element node to a parent with two or more children', () => {
        elem.innerHTML = '<div1></div1><div2></div2><div3></div3>';
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(elem.innerHTML).to.equal('<div1></div1><test></test><div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should insert a text node to a parent with two or more children', () => {
        elem.innerHTML = '<div1></div1><div2></div2><div3></div3>';
        const inserted = document.createTextNode('text');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(elem.innerHTML).to.equal('<div1></div1>text<div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should insert a comment node to a parent with two or more children', () => {
        elem.innerHTML = '<div1></div1><div2></div2><div3></div3>';
        const inserted = document.createComment('comment');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(elem.innerHTML).to.equal('<div1></div1><!--comment--><div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should insert a node with children', () => {
        const insertedHTML = '<div4></div4><!--comment--><div5><div6>text</div6></div5>';
        elem.innerHTML = '<div1><div></div></div1><div2></div2><div3></div3>';
        const inserted = document.createElement('test');
        inserted.innerHTML = insertedHTML;
        elem.insertBefore(inserted, elem.childNodes[2]);

        expect(elem.innerHTML).to.equal(`<div1><div></div></div1><div2></div2><test>${insertedHTML}</test><div3></div3>`);
        expect(elem.childNodes[2]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
