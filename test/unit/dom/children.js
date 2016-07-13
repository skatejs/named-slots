import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: children', () => {
  function runTests(type) {
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
          expect(elem.children.length).to.equal(num);
          if (canPatchNativeAccessors && type !== 'host') {
            expect(elem.__children.length).to.equal(num);
          }
          elem.appendChild(document.createElement('div'));
        });

        numbers.reverse().forEach(num => {
          elem.removeChild(elem.lastChild);
          expect(elem.children.length).to.equal(num);
          if (canPatchNativeAccessors && type !== 'host') {
            expect(elem.__children.length).to.equal(num);
          }
        });
      });

      it('should not count text nodes', () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }
        elem.appendChild(document.createTextNode('text'));
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }

        elem.removeChild(elem.lastChild);
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }
        elem.removeChild(elem.lastChild);
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }
      });

      it('should not count comment nodes', () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }
        elem.appendChild(document.createComment('comment'));
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }

        elem.removeChild(elem.lastChild);
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }
        elem.removeChild(elem.lastChild);
        expect(elem.children.length).to.equal(0);
        if (canPatchNativeAccessors && type !== 'host') {
          expect(elem.__children.length).to.equal(0);
        }
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
