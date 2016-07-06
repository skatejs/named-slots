import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';
import create from '../../lib/create';

describe('dom: childNodes', function () {
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
          expect(elem.childNodes.length).to.equal(num);
          if (type !== 'host') {
            canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(num);
          }
          elem.appendChild(document.createElement('div'));
        });

        numbers.reverse().forEach(num => {
          elem.removeChild(elem.lastChild);
          expect(elem.childNodes.length).to.equal(num);
          if (type !== 'host') {
            canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(num);
          }
        });
      });

      it(`should count text nodes`, () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(1);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(1);
        }
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(2);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(2);
        }

        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(1);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(1);
        }
        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(0);
        }
      });

      it(`should count comment nodes`, () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(1);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(1);
        }
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(2);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(2);
        }

        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(1);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(1);
        }
        elem.removeChild(elem.lastChild);
        expect(elem.childNodes.length).to.equal(0);
        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__childNodes.length).to.equal(0);
        }
      });
    });
  }
});
