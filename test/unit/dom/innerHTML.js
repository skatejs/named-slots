import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';
import hasAllAttributes from '../../lib/has-all-attributes';

describe('dom: innerHTML', function () {
  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');

  function runTests(type) {
    describe(`${type}: `, () => {
      let host, root, slot, div, elem;
      let innerHTMLs;

      beforeEach(function () {
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = create('slot');

        root.appendChild(slot);

        div = document.createElement('div');

        innerHTMLs = [
          {value: '', nodes: 0},
          {value: '<div1></div1>', nodes: 1},
          {value: '<div1></div1><div2></div2>', nodes: 2},
          {value: '<div1></div1><div2><div3></div3></div2>', nodes: 2},
          {value: 'text', nodes: 1},
          {value: '<!--comment-->', nodes: 1},
          {value: '<div>text inside element</div>', nodes: 1},
          {value: 'text outside <div></div>', nodes: 2},
          {value: 'text outside <div>text inside</div>', nodes: 2},
          {value: 'text before <div>text inside</div> text after', nodes: 3},
          {value: 'text before <div>text inside <div>text deep inside</div> </div> text after', nodes: 3},
          {value: '<div><!-- comment inside --></div>', nodes: 1},
          {value: '<!-- comment outside --> <div></div>', nodes: 3}, // empty space is a text node
          {value: '<!-- comment outside --> <div><!-- comment inside --></div>', nodes: 3}, // empty space is a text node
          {value: '<!-- comment before --> <div><!-- comment inside --></div> <!-- comment after -->', nodes: 5}, // empty space is a text node
          {value: '<!-- comment before --> <div><!-- comment inside --><div><!-- comment deep inside --></div> </div><!-- comment after -->', nodes: 4}, // empty space is a text node
          {value: '<!-- comment outside --> text outside <div>text inside</div>', nodes: 3},
          {value: 'text outside <!-- comment outside --> text outside <div>text inside <!-- comment inside --> text inside</div>', nodes: 4},
        ];

        switch(type) {
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

      it(`should set and get correct value`, () => {
        innerHTMLs.forEach(html => {
          elem.innerHTML = html.value;

          expect(elem.innerHTML).to.equal(html.value);
          expect(elem.childNodes.length).to.equal(html.nodes);

          if (type !== 'host') {
            canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(html.value);
          }
        });
      });

      it(`should set and get correct value with attributes`, () => {
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

      it('created text nodes get escaped when being appended', function () {
        const text = document.createTextNode('<u>foo & bar</u>');
        const textCont = '&lt;u&gt;foo &amp; bar&lt;/u&gt;';

        elem.appendChild(text);
        expect(elem.innerHTML).to.equal(textCont);
        expect(elem.childNodes.length).to.equal(1);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(textCont);
        } else {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('innerHTML handles non text / html / comment nodes', function () {
        expect(elem.innerHTML).to.equal('');
        const processingInstruction = '<?xml-stylesheet href="mycss.css" type="text/css"?>';
        const processingInstructionsAfterInnerHtml = '<!--?xml-stylesheet href="mycss.css" type="text/css"?-->';

        elem.innerHTML = processingInstruction;
        expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(elem.innerHTML)).to.be.above(-1); // different browsers process this differently
        expect(elem.childNodes.length).to.equal(1);

        if (type !== 'host') {
          canPatchNativeAccessors && expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(elem.__innerHTML)).to.be.above(-1);
        } else {
          expect(slot.assignedNodes().length).to.equal(0);  // non text / html nodes should not be slotted
        }
      });

      it('setting to \'\' does not affect innerHTML', function () {
        elem.innerHTML = '';
        expect(elem.innerHTML).to.equal('');
        expect(elem.childNodes.length).to.equal(0);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('');
          expect(elem.__childNodes.length).to.equal(0);
        }
      });
    });
  }
});
