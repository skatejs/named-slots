import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';
import create from '../../lib/create';

describe('dom: insertBefore', function () {
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

      it(`should not insert anything if there is nothing to insert`, () => {
        expect(function() {
          elem.insertBefore(null);
        }).to.throw(Error);
      });

      it(`should return the inserted node`, () => {
        let inserted = document.createElement('div');
        let changedElem = elem.insertBefore(inserted);
        expect(changedElem).not.to.equal(undefined);
        expect(changedElem).to.equal(inserted);
      });

      it(`should append node if referenceNode is null`, () => {
        elem.innerHTML = '<div></div><div></div>';
        let inserted = document.createElement('test');
        elem.insertBefore(inserted);

        expect(elem.innerHTML).to.equal('<div></div><div></div><test></test>');
        expect(elem.childNodes[2]).to.equal(inserted);
      });

      it(`should insert an element node to a parent with no children`, () => {


      });

      it(`should insert a text node to a parent with no children`, () => {


      });

      it(`should insert a comment node to a parent with no children`, () => {


      });

      it(`should insert an element node to a parent with one child`, () => {


      });

      it(`should insert a text node to a parent with one child`, () => {


      });

      it(`should insert a comment node to a parent with one child`, () => {


      });


      it(`should insert an element node to a parent with two or more children`, () => {


      });

      it(`should insert a text node to a parent with two or more children`, () => {


      });

      it(`should insert a comment node to a parent with two or more children`, () => {


      });

      it(`should work properly on a complex tree`, () => {


      });

    });
  }
});
