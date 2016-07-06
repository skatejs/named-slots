import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: firstElementChild', function () {
  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');

  function runTests(type) {
    describe(`${type}: `, () => {
      let host, root, slot, div, elem;
      let numbers = [0, 1, 2, 3];

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

      it(`should return false if there are no child nodes`, () => {
        elem.innerHTML = '';
        expect(elem.hasChildNodes()).to.equal(false);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__hasChildNodes()).to.equal(false);
        }
      });

      it(`should return true if there is one element child node`, () => {
        elem.innerHTML = '<div></div>';
        expect(elem.hasChildNodes()).to.equal(true);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__hasChildNodes()).to.equal(true);
        }
      });

      it(`should return true if there is one text child node`, () => {
        elem.innerHTML = 'text';
        expect(elem.hasChildNodes()).to.equal(true);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__hasChildNodes()).to.equal(true);
        }
      });

      it(`should return true if there is one comment child node`, () => {
        elem.innerHTML = '<!--comment-->';
        expect(elem.hasChildNodes()).to.equal(true);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__hasChildNodes()).to.equal(true);
        }
      });

      it(`should return true if there is more than one child nodes`, () => {
        elem.innerHTML = '<div></div>text<div></div>';
        expect(elem.hasChildNodes()).to.equal(true);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__hasChildNodes()).to.equal(true);
        }
      });

      it(`should return correct value in a complex tree`, () => {
        elem.innerHTML = '<div1></div1><div1><div1></div1><div1><div1></div1></div1></div1><div1></div1>';
        expect(elem.hasChildNodes()).to.equal(true);
        expect(elem.firstChild.hasChildNodes()).to.equal(false);
        expect(elem.childNodes[1].hasChildNodes()).to.equal(true);
        expect(elem.childNodes[1].childNodes[0].hasChildNodes()).to.equal(false);
        expect(elem.childNodes[1].childNodes[1].hasChildNodes()).to.equal(true);
        expect(elem.lastChild.hasChildNodes()).to.equal(false);

        if (type !== 'host' && canPatchNativeAccessors) {
          expect(elem.__hasChildNodes()).to.equal(true);
          expect(elem.__firstChild.__hasChildNodes()).to.equal(false);
          expect(elem.__childNodes[1].__hasChildNodes()).to.equal(true);
          expect(elem.__childNodes[1].__childNodes[0].__hasChildNodes()).to.equal(false);
          expect(elem.__childNodes[1].__childNodes[1].__hasChildNodes()).to.equal(true);
          expect(elem.__lastChild.__hasChildNodes()).to.equal(false);
        }
      });
    });
  }
});
