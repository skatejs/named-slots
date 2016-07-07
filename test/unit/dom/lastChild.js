import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('dom: lastChild', function () {
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

      it(`should return null if there are no children`, () => {
        elem.innerHTML = '';
        expect(elem.lastChild).to.equal(null);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(null);
        }
      });

      it(`should return correct element node from a parent with just one child`, () => {
        let appended = document.createElement('test');
        elem.appendChild(appended);
        expect(elem.lastChild).to.equal(appended);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(appended);
        }
      });

      it(`should return correct text node from a parent with just one child`, () => {
        let appended = document.createTextNode('text');
        elem.appendChild(appended);
        expect(elem.lastChild).to.equal(appended);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(appended);
        }
      });

      it(`should return correct comment node from a parent with just one child`, () => {
        let appended = document.createComment('comment');
        elem.appendChild(appended);
        expect(elem.lastChild).to.equal(appended);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(appended);
        }
      });

      it(`should return correct element node from a parent with two or more children`, () => {
        let appended = document.createElement('test');
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        elem.appendChild(appended);

        expect(elem.lastChild).to.equal(appended);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(appended);
        }
      });

      it(`should return correct text node from a parent with two or more children`, () => {
        let appended = document.createTextNode('text');
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        elem.appendChild(appended);
        expect(elem.lastChild).to.equal(appended);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(appended);
        }
      });

      it(`should return correct comment node from a parent with two or more children`, () => {
        let appended = document.createComment('comment');
        elem.appendChild(document.createElement('test2'));
        elem.appendChild(document.createElement('test3'));
        elem.appendChild(appended);
        expect(elem.lastChild).to.equal(appended);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild).to.equal(appended);
        }
      });

      it(`should return lastChild in a complex tree`, () => {
        let child1 = document.createElement('test1');
        let child2 = document.createElement('test2');
        elem.innerHTML = '<div1></div1><div2><div3></div3></div2><div4></div4>';
        elem.childNodes[2].appendChild(child1);
        elem.childNodes[1].childNodes[0].appendChild(child2);

        expect(elem.lastChild.lastChild).to.equal(child1);
        expect(elem.childNodes[1].lastChild.lastChild).to.equal(child2);

        if (type !== 'host') {
          canPatchNativeAccessors && expect(elem.__lastChild.__lastChild).to.equal(child1);
          canPatchNativeAccessors && expect(elem.__childNodes[1].__lastChild.__lastChild).to.equal(child2);
        }
      });
    });
  }
});
