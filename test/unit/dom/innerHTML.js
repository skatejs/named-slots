import hasAllAttributes from '../../lib/has-all-attributes';

describe('dom: innerHTML', () => {
  function runTests(type) {
    describe(`${type}: `, () => {
      let host;
      let root;
      let slot;
      let div;
      let elem;
      let innerHTMLs;

      beforeEach(() => {
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = document.createElement('slot');

        root.appendChild(slot);

        div = document.createElement('div');
        /* eslint-disable max-len */
        innerHTMLs = [
          { value: '', nodes: 0, assigned: 0 },
          { value: '<div1></div1>', nodes: 1, assigned: 1 },
          { value: '<div1></div1><div2></div2>', nodes: 2, assigned: 2 },
          { value: '<div1></div1><div2><div3></div3></div2>', nodes: 2, assigned: 2 },
          { value: 'text', nodes: 1, assigned: 1 },
          { value: '<!--comment-->', nodes: 1, assigned: 0 },
          { value: '<div>text inside element</div>', nodes: 1, assigned: 1 },
          { value: 'text outside <div></div>', nodes: 2, assigned: 2 },
          { value: 'text outside <div>text inside</div>', nodes: 2, assigned: 2 },
          { value: 'text before <div>text inside</div> text after', nodes: 3, assigned: 3 },
          { value: 'text before <div>text inside <div>text deep inside</div> </div> text after', nodes: 3, assigned: 3 },
          { value: '<div><!-- comment inside --></div>', nodes: 1, assigned: 1 },
          { value: '<!-- comment outside --> <div></div>', nodes: 3, assigned: 2 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment outside --> <div><!-- comment inside --></div>', nodes: 3, assigned: 2 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment before --> <div><!-- comment inside --></div> <!-- comment after -->', nodes: 5, assigned: 3 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment before --> <div><!-- comment inside --><div><!-- comment deep inside --></div> </div><!-- comment after -->', nodes: 4, assigned: 2 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment outside --> text outside <div>text inside</div>', nodes: 3, assigned: 2 },
          { value: 'text outside <!-- comment outside --> text outside <div>text inside <!-- comment inside --> text inside</div>', nodes: 4, assigned: 3 },
        ];
        /* eslint-enable max-len */
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

      it('should set and get correct value', () => {
        innerHTMLs.forEach(html => {
          elem.innerHTML = html.value;

          expect(elem.innerHTML).to.equal(html.value);
          expect(elem.childNodes.length).to.equal(html.nodes);

          if (type === 'host') {
            expect(slot.assignedNodes().length).to.equal(html.assigned);
          }
        });
      });

      it('should set and get correct value with attributes', () => {
        elem.innerHTML = '<div [ foo ] ( bar )></div>';
        expect(hasAllAttributes(elem.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(elem.childNodes.length).to.equal(1);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }

        elem.innerHTML = '<div [ foo ] ( bar )><div [ foo2 ] ( bar2 )></div></div>';
        expect(hasAllAttributes(elem.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(hasAllAttributes(elem.firstChild.firstChild, ['[', 'foo2', ']', '(', 'bar2', ')'])).to.equal(true);
      });

      it('created text nodes get escaped when being appended', () => {
        const text = document.createTextNode('<u>foo & bar</u>');
        const escapedText = '&lt;u&gt;foo &amp; bar&lt;/u&gt;';

        elem.appendChild(text);
        expect(elem.innerHTML).to.equal(escapedText);
        expect(elem.childNodes.length).to.equal(1);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('created text nodes in scripts do not get escaped when being appended', () => {
        const script = document.createElement('script');
        const text = document.createTextNode('foo & <b>bar</b>');
        const expectedInnerHtml = '<script>foo & <b>bar</b></script>';

        script.appendChild(text);
        elem.appendChild(script);
        expect(elem.innerHTML).to.equal(expectedInnerHtml);
        expect(elem.childNodes.length).to.equal(1);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('created text nodes in noscript do not get escaped when being appended', () => {
        const script = document.createElement('noscript');
        const text = document.createTextNode('foo & <b>bar</b>');
        const expectedInnerHtml = '<noscript>foo & <b>bar</b></noscript>';

        script.appendChild(text);
        elem.appendChild(script);
        expect(elem.innerHTML).to.equal(expectedInnerHtml);
        expect(elem.childNodes.length).to.equal(1);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('innerHTML handles non text / html / comment nodes', () => {
        expect(elem.innerHTML).to.equal('');
        const processingInstruction = '<?xml-stylesheet href="mycss.css" type="text/css"?>';
        const processingInstructionsAfterInnerHtml = '<!--?xml-stylesheet href="mycss.css" type="text/css"?-->';

        elem.innerHTML = processingInstruction;
        // different browsers process this differently
        expect([processingInstruction, processingInstructionsAfterInnerHtml]).to.include(elem.innerHTML); // eslint-disable-line max-len
        expect(elem.childNodes.length).to.equal(1);

        if (type === 'host') {
          // non text / html nodes should not be slotted
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('setting to \'\' does not affect innerHTML', () => {
        elem.innerHTML = '';
        expect(elem.innerHTML).to.equal('');
        expect(elem.childNodes.length).to.equal(0);
      });

      it('should return correct value if html was appended', () => {
        elem.appendChild(document.createElement('div'));
        expect(elem.innerHTML).to.equal('<div></div>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }

        elem.appendChild(document.createElement('div2'));
        expect(elem.innerHTML).to.equal('<div></div><div2></div2>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }

        elem.firstChild.appendChild(document.createElement('div3'));
        expect(elem.innerHTML).to.equal('<div><div3></div3></div><div2></div2>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }

        elem.firstChild.appendChild(document.createElement('div4'));
        expect(elem.innerHTML).to.equal('<div><div3></div3><div4></div4></div><div2></div2>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should return correct value if html was removed', () => {
        elem.innerHTML = '<div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>';
        elem.removeChild(elem.firstChild);
        expect(elem.innerHTML).to.equal('<div2><div3></div3><div4></div4></div2><div3></div3>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }

        elem.removeChild(elem.firstChild);
        expect(elem.innerHTML).to.equal('<div3></div3>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }

        elem.removeChild(elem.firstChild);
        expect(elem.innerHTML).to.equal('');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should return correct value if html was inserted', () => {
        elem.innerHTML = '<div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>';
        elem.insertBefore(document.createElement('div'), elem.firstChild);
        expect(elem.innerHTML).to.equal('<div></div><div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }

        elem.insertBefore(document.createElement('div5'), elem.lastChild);
        expect(elem.innerHTML).to.equal('<div></div><div1></div1><div2><div3></div3><div4></div4></div2><div5></div5><div3></div3>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(5);
        }
      });

      it('should return correct value if child element was replaced', () => {
        elem.innerHTML = '<div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>';
        elem.replaceChild(document.createElement('div'), elem.firstChild);
        expect(elem.innerHTML).to.equal('<div></div><div2><div3></div3><div4></div4></div2><div3></div3>');

        elem.replaceChild(document.createElement('div5'), elem.lastChild);
        expect(elem.innerHTML).to.equal('<div></div><div2><div3></div3><div4></div4></div2><div5></div5>');
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
