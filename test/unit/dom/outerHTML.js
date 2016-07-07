import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: outerHTML', function () {
  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');

  function runTests(type) {
    describe(`${type}: `, () => {
      let host, root, slot, div, elem;

      beforeEach(function () {
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = create('slot');

        root.appendChild(slot);

        div = document.createElement('div');

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

      it('should get a proper value from a node with one element child', () => {
        elem.innerHTML = '<test></test>';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div><test></test></div>');
          canPatchNativeAccessors && type === 'div' && expect(elem.__outerHTML).to.equal('<div><test></test></div>');
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot><test></test></slot>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<slot><test></test></slot>');
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_><test></test></_shadow_root_>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<_shadow_root_><test></test></_shadow_root_>');
        }
      });

      it('should get a proper value from a node with one text child', () => {
        elem.innerHTML = 'text';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div>text</div>');
          canPatchNativeAccessors && type === 'div' && expect(elem.__outerHTML).to.equal('<div>text</div>');
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot>text</slot>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<slot>text</slot>');
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_>text</_shadow_root_>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<_shadow_root_>text</_shadow_root_>');
        }
      });

      it('should get a proper value from a node with one comment child', () => {
        elem.innerHTML = '<!--comment-->';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div><!--comment--></div>');
          canPatchNativeAccessors && type === 'div' && expect(elem.__outerHTML).to.equal('<div><!--comment--></div>');
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot><!--comment--></slot>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<slot><!--comment--></slot>');
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_><!--comment--></_shadow_root_>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<_shadow_root_><!--comment--></_shadow_root_>');
        }
      });

      it('should get a proper value from a node with two or more children', () => {
        elem.innerHTML = '<test></test><test2>text</test2><!--comment-->';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div><test></test><test2>text</test2><!--comment--></div>');
          canPatchNativeAccessors && type === 'div' && expect(elem.__outerHTML).to.equal('<div><test></test><test2>text</test2><!--comment--></div>');
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot><test></test><test2>text</test2><!--comment--></slot>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<slot><test></test><test2>text</test2><!--comment--></slot>');
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_><test></test><test2>text</test2><!--comment--></_shadow_root_>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<_shadow_root_><test></test><test2>text</test2><!--comment--></_shadow_root_>');
        }
      });

      it('should set a proper value', () => {
        elem.innerHTML = '<div1><div2></div2><div3></div3></div1>';
        elem.childNodes[0].childNodes[0].outerHTML = '<div4></div4>';
        expect(elem.innerHTML).to.equal('<div1><div4></div4><div3></div3></div1>');
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<div1><div4></div4><div3></div3></div1>');
        }

        elem.innerHTML = '<div1><div2></div2><div3></div3></div1>';
        elem.childNodes[0].outerHTML = '<div4></div4>';
        expect(elem.innerHTML).to.equal('<div4></div4>');

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<div4></div4>');
        }

        if (type === 'root') {
          elem.innerHTML = '<div></div>';
          // we can't change root with this, so nothing should happen
          elem.outerHTML = '<p></p>';
          expect(elem.outerHTML).to.equal('<_shadow_root_><div></div></_shadow_root_>');
          canPatchNativeAccessors && expect(elem.__outerHTML).to.equal('<_shadow_root_><div></div></_shadow_root_>');
        }
      });


      it(`should throw an error when setting outerHTML to an element with no parent`, () => {
        if (type === 'host' || type === 'div') {
          const errorMsg = 'Failed to set the \'outerHTML\' property on \'Element\': This element has no parent node.';
          const errorMsgOpera = 'Failed to call host setter';
          elem.innerHTML = '';
          expect(elem.outerHTML).to.equal('<div></div>');

          if (canPatchNativeAccessors) {
            let throwsErrorNatively = false;
            try {
              elem.__outerHTML = '';
            } catch(e) {
              throwsErrorNatively = true;
            }

            if (throwsErrorNatively) {
              let throwsErrorFromPolyfill = false;
              try {
                elem.outerHTML = '<p></p>';
              } catch(e) {
                throwsErrorFromPolyfill = true;
                expect([errorMsg, errorMsgOpera].indexOf(e.message)).to.be.above(-1);
              }
              expect(throwsErrorFromPolyfill).to.equal(true);
            }

          } else {
            expect(function() {
              elem.outerHTML = '<p></p>';
            }).to.throw(Error, errorMsg);
          }
        }
      });


    });
  }
});
