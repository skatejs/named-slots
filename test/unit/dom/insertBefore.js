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

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it(`should insert an element node to a parent with no children`, () => {
        let inserted = document.createElement('test');
        elem.insertBefore(inserted);

        expect(elem.innerHTML).to.equal('<test></test>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it(`should insert a text node to a parent with no children`, () => {
        let inserted = document.createTextNode('text');
        elem.insertBefore(inserted);

        expect(elem.innerHTML).to.equal('text');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it(`should insert a comment node to a parent with no children`, () => {
        let inserted = document.createComment('comment');
        elem.insertBefore(inserted);

        expect(elem.innerHTML).to.equal('<!--comment-->');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it(`should insert an element node to a parent with one child`, () => {
        elem.innerHTML = '<div></div>';
        let inserted = document.createElement('test');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(elem.innerHTML).to.equal('<test></test><div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it(`should insert a text node to a parent with one child`, () => {
        elem.innerHTML = '<div></div>';
        let inserted = document.createTextNode('text');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(elem.innerHTML).to.equal('text<div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it(`should insert a comment node to a parent with one child`, () => {
        elem.innerHTML = '<div></div>';
        let inserted = document.createComment('comment');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(elem.innerHTML).to.equal('<!--comment--><div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it(`should insert an element node to a parent with two or more children`, () => {
        elem.innerHTML = '<div1></div1><div2></div2><div3></div3>';
        let inserted = document.createElement('test');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(elem.innerHTML).to.equal('<div1></div1><test></test><div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it(`should insert a text node to a parent with two or more children`, () => {
        elem.innerHTML = '<div1></div1><div2></div2><div3></div3>';
        let inserted = document.createTextNode('text');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(elem.innerHTML).to.equal('<div1></div1>text<div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it(`should insert a comment node to a parent with two or more children`, () => {
        elem.innerHTML = '<div1></div1><div2></div2><div3></div3>';
        let inserted = document.createComment('comment');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(elem.innerHTML).to.equal('<div1></div1><!--comment--><div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it(`should insert a node with children`, () => {
        let insertedHTML = '<div4></div4><!--comment--><div5><div6>text</div6></div5>';
        elem.innerHTML = '<div1><div></div></div1><div2></div2><div3></div3>';
        let inserted = document.createElement('test');
        inserted.innerHTML = insertedHTML;
        elem.insertBefore(inserted, elem.childNodes[2]);

        expect(elem.innerHTML).to.equal(`<div1><div></div></div1><div2></div2><test>${insertedHTML}</test><div3></div3>`);
        expect(elem.childNodes[2]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });
    });
  }
});
