import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';
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
        slot = create('slot');

        root.appendChild(slot);

        div = document.createElement('div');

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
          { value: '<!-- comment outside --> <div></div>', nodes: 3, assigned: 1 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment outside --> <div><!-- comment inside --></div>', nodes: 3, assigned: 1 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment before --> <div><!-- comment inside --></div> <!-- comment after -->', nodes: 5, assigned: 1 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment before --> <div><!-- comment inside --><div><!-- comment deep inside --></div> </div><!-- comment after -->', nodes: 4, assigned: 1 }, // empty space is a text node, do not slot empty space
          { value: '<!-- comment outside --> text outside <div>text inside</div>', nodes: 3, assigned: 2 },
          { value: 'text outside <!-- comment outside --> text outside <div>text inside <!-- comment inside --> text inside</div>', nodes: 4, assigned: 3 },
        ];

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

          if (type !== 'host') {
            if (canPatchNativeAccessors) {
              expect(elem.__innerHTML).to.equal(html.value);
            }
          } else {
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
        const textCont = '&lt;u&gt;foo &amp; bar&lt;/u&gt;';

        elem.appendChild(text);
        expect(elem.innerHTML).to.equal(textCont);
        expect(elem.childNodes.length).to.equal(1);

        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal(textCont);
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('innerHTML handles non text / html / comment nodes', () => {
        expect(elem.innerHTML).to.equal('');
        const processingInstruction = '<?xml-stylesheet href="mycss.css" type="text/css"?>';
        const processingInstructionsAfterInnerHtml = '<!--?xml-stylesheet href="mycss.css" type="text/css"?-->';

        elem.innerHTML = processingInstruction;
        expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(elem.innerHTML)).to.be.above(-1); // different browsers process this differently
        expect(elem.childNodes.length).to.equal(1);

        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(elem.__innerHTML)).to.be.above(-1);
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(0);  // non text / html nodes should not be slotted
        }
      });

      it('setting to \'\' does not affect innerHTML', () => {
        elem.innerHTML = '';
        expect(elem.innerHTML).to.equal('');
        expect(elem.childNodes.length).to.equal(0);

        if (type !== 'host' && canPatchNativeAccessors) {
          expect(elem.__innerHTML).to.equal('');
          expect(elem.__childNodes.length).to.equal(0);
        }
      });

      it('should return correct value if html was appended', () => {
        elem.appendChild(document.createElement('div'));
        expect(elem.innerHTML).to.equal('<div></div>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div></div>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(1);
        }

        elem.appendChild(document.createElement('div2'));
        expect(elem.innerHTML).to.equal('<div></div><div2></div2>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div></div><div2></div2>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(2);
        }

        elem.firstChild.appendChild(document.createElement('div3'));
        expect(elem.innerHTML).to.equal('<div><div3></div3></div><div2></div2>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div><div3></div3></div><div2></div2>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(2);
        }

        elem.firstChild.appendChild(document.createElement('div4'));
        expect(elem.innerHTML).to.equal('<div><div3></div3><div4></div4></div><div2></div2>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div><div3></div3><div4></div4></div><div2></div2>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should return correct value if html was removed', () => {
        elem.innerHTML = '<div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>';
        elem.removeChild(elem.firstChild);
        expect(elem.innerHTML).to.equal('<div2><div3></div3><div4></div4></div2><div3></div3>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div2><div3></div3><div4></div4></div2><div3></div3>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(2);
        }

        elem.removeChild(elem.firstChild);
        expect(elem.innerHTML).to.equal('<div3></div3>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div3></div3>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(1);
        }

        elem.removeChild(elem.firstChild);
        expect(elem.innerHTML).to.equal('');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should return correct value if html was inserted', () => {
        elem.innerHTML = '<div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>';
        elem.insertBefore(document.createElement('div'), elem.firstChild);
        expect(elem.innerHTML).to.equal('<div></div><div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div></div><div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(4);
        }

        elem.insertBefore(document.createElement('div5'), elem.lastChild);
        expect(elem.innerHTML).to.equal('<div></div><div1></div1><div2><div3></div3><div4></div4></div2><div5></div5><div3></div3>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div></div><div1></div1><div2><div3></div3><div4></div4></div2><div5></div5><div3></div3>');
          }
        } else {
          expect(slot.assignedNodes().length).to.equal(5);
        }
      });

      it('should return correct value if html was replaced', () => {
        elem.innerHTML = '<div1></div1><div2><div3></div3><div4></div4></div2><div3></div3>';
        elem.replaceChild(document.createElement('div'), elem.firstChild);
        expect(elem.innerHTML).to.equal('<div></div><div2><div3></div3><div4></div4></div2><div3></div3>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div></div><div2><div3></div3><div4></div4></div2><div3></div3>');
          }
        }

        elem.replaceChild(document.createElement('div5'), elem.lastChild);
        expect(elem.innerHTML).to.equal('<div></div><div2><div3></div3><div4></div4></div2><div5></div5>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div></div><div2><div3></div3><div4></div4></div2><div5></div5>');
          }
        } else {
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
