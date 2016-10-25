describe('dom: childNodes', () => {
  function runTests (type) {
    describe(`${type}: `, () => {
      let host;
      let root;
      let slot;
      let div;
      let elem;
      const numbers = [0, 1, 2, 3];

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

      it('should return correct number of child nodes', () => {
        numbers.forEach(num => {
          expect(elem.childNodes.length).to.equal(num);
          elem.appendChild(document.createElement('div'));
        });

        numbers.reverse().forEach(num => {
          elem.removeChild(elem.lastChild);
          expect(elem.childNodes.length).to.equal(num);
        });
      });

      it('should count text nodes', () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(1);

        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(2);

        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(1);

        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(0);
      });

      it('should count comment nodes', () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(1);

        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(2);

        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(1);

        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(0);
      });

      it('should be correct nodes if children were appended or inserted', () => {
        const node1 = document.createElement('node1');
        const node2 = document.createElement('node2');
        const node3 = document.createTextNode('text1');
        const node4 = document.createTextNode('text2');
        const node5 = document.createComment('comment1');
        const node6 = document.createComment('comment2');

        elem.appendChild(node1);
        expect(elem.childNodes[0]).to.equal(node1);
        expect(elem.innerHTML).to.equal('<node1></node1>');

        elem.appendChild(node2);
        expect(elem.childNodes[1]).to.equal(node2);
        expect(elem.innerHTML).to.equal('<node1></node1><node2></node2>');

        elem.appendChild(node3);
        expect(elem.childNodes[2]).to.equal(node3);
        expect(elem.innerHTML).to.equal('<node1></node1><node2></node2>text1');

        elem.insertBefore(node4, null);
        expect(elem.childNodes[3]).to.equal(node4);
        expect(elem.innerHTML).to.equal('<node1></node1><node2></node2>text1text2');

        elem.insertBefore(node5, null);
        expect(elem.childNodes[4]).to.equal(node5);
        expect(elem.innerHTML).to.equal('<node1></node1><node2></node2>text1text2<!--comment1-->');

        elem.insertBefore(node6, null);
        expect(elem.childNodes[5]).to.equal(node6);
        expect(elem.innerHTML).to.equal('<node1></node1><node2></node2>text1text2<!--comment1--><!--comment2-->');
      });

      it('should return correct nodes if children were removed', () => {
        const node1 = document.createElement('node1');
        const node3 = document.createTextNode('text1');
        const node5 = document.createComment('comment1');
        elem.appendChild(node1);
        elem.appendChild(node3);
        elem.appendChild(node5);

        elem.removeChild(elem.firstChild);
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.childNodes[0]).to.equal(node3);
        expect(elem.innerHTML).to.equal('text1<!--comment1-->');

        elem.removeChild(elem.firstChild);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.childNodes[0]).to.equal(node5);
        expect(elem.innerHTML).to.equal('<!--comment1-->');
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
