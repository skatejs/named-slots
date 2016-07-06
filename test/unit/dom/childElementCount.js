import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: childElementCount', function () {
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

      it(`should return correct number of child nodes`, () => {
        numbers.forEach(num => {
          expect(elem.childElementCount).to.equal(num);
          if (type !== 'host') {
            canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(num);
          }
          elem.appendChild(document.createElement('div'));
        });

        numbers.reverse().forEach(num => {
          elem.removeChild(elem.lastChild);
          expect(elem.childElementCount).to.equal(num);
          if (type !== 'host') {
            canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(num);
          }
        });
      });

      it(`should not count text nodes`, () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }

        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }
        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }
      });

      it(`should not count comment nodes`, () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }
        elem.appendChild(document.createComment('comment'));
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }

        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }
        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childElementCount).to.equal(0);
        }
      });
    });
  }
});
