import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: outerHTML', () => {
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

      it('should get a proper value from a node with one element child', () => {
        elem.innerHTML = '<test></test>';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div><test></test></div>');
          if (canPatchNativeAccessors && type === 'div') {
            expect(elem.__outerHTML).to.equal('<div><test></test></div>');
          }
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot><test></test></slot>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<slot><test></test></slot>');
          }
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_><test></test></_shadow_root_>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<_shadow_root_><test></test></_shadow_root_>');
          }
        }
      });

      it('should get a proper value from a node with one text child', () => {
        elem.innerHTML = 'text';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div>text</div>');
          if (canPatchNativeAccessors && type === 'div') {
            expect(elem.__outerHTML).to.equal('<div>text</div>');
          }
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot>text</slot>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<slot>text</slot>');
          }
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_>text</_shadow_root_>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<_shadow_root_>text</_shadow_root_>');
          }
        }
      });

      it('should get a proper value from a node with one comment child', () => {
        elem.innerHTML = '<!--comment-->';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div><!--comment--></div>');
          if (canPatchNativeAccessors && type === 'div') {
            expect(elem.__outerHTML).to.equal('<div><!--comment--></div>');
          }
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot><!--comment--></slot>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<slot><!--comment--></slot>');
          }
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_><!--comment--></_shadow_root_>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<_shadow_root_><!--comment--></_shadow_root_>');
          }
        }
      });

      it('should get a proper value from a node with two or more children', () => {
        elem.innerHTML = '<test></test><test2>text</test2><!--comment-->';
        if (type === 'host' || type === 'div') {
          expect(elem.outerHTML).to.equal('<div><test></test><test2>text</test2><!--comment--></div>');
          if (canPatchNativeAccessors && type === 'div') {
            expect(elem.__outerHTML).to.equal('<div><test></test><test2>text</test2><!--comment--></div>');
          }
        } else if (type === 'slot') {
          expect(elem.outerHTML).to.equal('<slot><test></test><test2>text</test2><!--comment--></slot>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<slot><test></test><test2>text</test2><!--comment--></slot>');
          }
        } else if (type === 'root') {
          expect(elem.outerHTML).to.equal('<_shadow_root_><test></test><test2>text</test2><!--comment--></_shadow_root_>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<_shadow_root_><test></test><test2>text</test2><!--comment--></_shadow_root_>');
          }
        }
      });

      it('should set a proper value', () => {
        elem.innerHTML = '<div1><div2></div2><div3></div3></div1>';
        elem.childNodes[0].childNodes[0].outerHTML = '<div4></div4>';
        expect(elem.innerHTML).to.equal('<div1><div4></div4><div3></div3></div1>');
        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div1><div4></div4><div3></div3></div1>');
          }
        }

        elem.innerHTML = '<div1><div2></div2><div3></div3></div1>';
        elem.childNodes[0].outerHTML = '<div4></div4>';
        expect(elem.innerHTML).to.equal('<div4></div4>');

        if (type !== 'host') {
          if (canPatchNativeAccessors) {
            expect(elem.__innerHTML).to.equal('<div4></div4>');
          }
        }

        if (type === 'root') {
          elem.innerHTML = '<div></div>';
          // we can't change root with this, so nothing should happen
          elem.outerHTML = '<p></p>';
          expect(elem.outerHTML).to.equal('<_shadow_root_><div></div></_shadow_root_>');
          if (canPatchNativeAccessors) {
            expect(elem.__outerHTML).to.equal('<_shadow_root_><div></div></_shadow_root_>');
          }
        }
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
