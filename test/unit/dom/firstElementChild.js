import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: firstElementChild', () => {
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
        slot = create('slot');

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

      it('should return null if there are no children', () => {
        elem.innerHTML = '';
        expect(elem.firstElementChild).to.equal(null);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(null);
          }
        }
      });

      it('should return correct element node from a parent with just one child', () => {
        const appended = document.createElement('test');
        elem.appendChild(appended);
        expect(elem.firstElementChild).to.equal(appended);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(appended);
          }
        }
      });

      it('should NOT return text node from a parent with just one child', () => {
        const appended = document.createTextNode('text');
        elem.appendChild(appended);
        expect(elem.firstElementChild).to.equal(null);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(null);
          }
        }
      });

      it('should NOT return comment node from a parent with just one child', () => {
        const appended = document.createComment('comment');
        elem.appendChild(appended);
        expect(elem.firstElementChild).to.equal(null);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(null);
          }
        }
      });

      it('should return correct element node from a parent with two or more children', () => {
        const appended = document.createElement('test');
        elem.appendChild(appended);
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        expect(elem.firstElementChild).to.equal(appended);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(appended);
          }
        }
      });

      it('should skip first text node from a parent with two or more children', () => {
        const appended = document.createTextNode('text');
        const elNode = document.createElement('test2');
        elem.appendChild(appended);
        elem.appendChild(elNode);
        elem.appendChild(document.createElement('test3'));
        expect(elem.firstElementChild).to.equal(elNode);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(elNode);
          }
        }
      });

      it('should skip first comment node from a parent with two or more children', () => {
        const appended = document.createComment('comment');
        const elNode = document.createElement('test2');

        elem.appendChild(appended);
        elem.appendChild(elNode);
        elem.appendChild(document.createElement('test3'));
        expect(elem.firstElementChild).to.equal(elNode);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild).to.equal(root);
          } else {
            expect(elem.__firstElementChild).to.equal(elNode);
          }
        }
      });

      it('should return correct element node in a complex tree', () => {
        const child1 = document.createElement('test1');
        const child2 = document.createElement('test2');
        elem.innerHTML = '<div1></div1><div2><div3></div3></div2><div4></div4>';
        elem.childNodes[0].appendChild(child1);
        elem.childNodes[1].childNodes[0].appendChild(child2);

        expect(elem.firstElementChild.firstElementChild).to.equal(child1);
        expect(elem.childNodes[1].firstElementChild.firstElementChild).to.equal(child2);

        if (canPatchNativeAccessors) {
          if (type === 'host') {
            expect(elem.__firstElementChild.__firstElementChild).to.equal(slot);
          } else {
            expect(elem.__firstElementChild.__firstElementChild).to.equal(child1);
            expect(elem.__childNodes[1].__firstElementChild.__firstElementChild).to.equal(child2);
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
