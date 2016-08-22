describe('dom: replaceChild', () => {
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

      it('should return the replaced element node', () => {
        const node = document.createElement('div');
        const node2 = document.createElement('test1');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<test1></test1>');
      });

      it('should replace an element node with an element node', () => {
        const node = document.createElement('toreplace');
        const node2 = document.createElement('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace an element node with a text node', () => {
        const node = document.createElement('toreplace');
        const node2 = document.createTextNode('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('newnode');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace an element node with a comment node', () => {
        const node = document.createElement('toreplace');
        const node2 = document.createComment('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<!--newnode-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should replace a text node with an element node', () => {
        const node = document.createTextNode('toreplace');
        const node2 = document.createElement('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a text node with a text node', () => {
        const node = document.createTextNode('toreplace');
        const node2 = document.createTextNode('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('newnode');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a text node with a comment node', () => {
        const node = document.createTextNode('toreplace');
        const node2 = document.createComment('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<!--newnode-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should replace a comment node with an element node', () => {
        const node = document.createComment('toreplace');
        const node2 = document.createElement('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a comment node with a text node', () => {
        const node = document.createComment('toreplace');
        const node2 = document.createTextNode('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('newnode');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a comment node with a comment node', () => {
        const node = document.createComment('toreplace');
        const node2 = document.createComment('newnode');
        elem.appendChild(node);
        const replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<!--newnode-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should replace a node in a parent with two or more children', () => {
        const node = document.createElement('newnode');
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>'; // eslint-disable-line max-len
        const toreplace = elem.childNodes[2];
        const replaced = elem.replaceChild(node, elem.childNodes[2]);

        expect(replaced).to.be.equal(toreplace);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><newnode></newnode><div9></div9>'); // eslint-disable-line max-len

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should replace a node with children', () => {
        const node = document.createElement('newnode');
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>'; // eslint-disable-line max-len
        const toreplace = elem.childNodes[1];
        const replaced = elem.replaceChild(node, elem.childNodes[1]);

        expect(replaced).to.be.equal(toreplace);
        expect(replaced.parentNode).to.be.equal(null);
        expect(replaced.innerHTML).to.be.equal('<div3><div4><div5></div5></div4><div6></div6></div3><div7></div7>'); // eslint-disable-line max-len
        expect(elem.innerHTML).to.be.equal('<div1></div1><newnode></newnode><div8></div8><div9></div9>'); // eslint-disable-line max-len

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should replace a node with children with another node with children', () => {
        const node = document.createElement('newnode');
        node.innerHTML = '<newdiv1></newdiv1><newdiv2><newdiv4></newdiv4></newdiv2><newdiv3></newdiv3>';
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>'; // eslint-disable-line max-len
        const toreplace = elem.childNodes[1];
        const replaced = elem.replaceChild(node, elem.childNodes[1]);

        expect(replaced).to.be.equal(toreplace);
        expect(replaced.parentNode).to.be.equal(null);
        expect(replaced.innerHTML).to.be.equal('<div3><div4><div5></div5></div4><div6></div6></div3><div7></div7>'); // eslint-disable-line max-len
        expect(elem.innerHTML).to.be.equal('<div1></div1><newnode><newdiv1></newdiv1><newdiv2><newdiv4></newdiv4></newdiv2><newdiv3></newdiv3></newnode><div8></div8><div9></div9>'); // eslint-disable-line max-len

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should be able to replace in sequence', () => {
        const node = document.createElement('newnode');
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>'; // eslint-disable-line max-len

        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>'); // eslint-disable-line max-len
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
        elem.removeChild(elem.firstChild);
        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode><div8></div8><div9></div9>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
        elem.removeChild(elem.firstChild);
        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode><div9></div9>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
        elem.removeChild(elem.firstChild);
        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');
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
