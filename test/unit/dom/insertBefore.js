/* eslint-env jasmine, mocha */
import htmlContent from '../../lib/html-content';

describe('dom: insertBefore', () => {
  function runTests (type) {
    describe(`${type}: `, () => {
      let div;
      let elem;
      let fragment;
      let host;
      let root;
      let slot;

      beforeEach(() => {
        div = document.createElement('div');
        fragment = document.createDocumentFragment();
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = document.createElement('slot');

        root.appendChild(slot);

        switch (type) {
          case 'div':
            elem = div;
            break;
          case 'fragment':
            elem = fragment;
            break;
          case 'host':
            elem = host;
            break;
          case 'root':
            root.innerHTML = '';
            elem = root;
            break;
          case 'slot':
            elem = slot;
            break;
        }
      });

      it('should throw if nothing to insert', () => {
        expect(() => {
          elem.insertBefore(null);
        }).to.throw(Error);
        expect(elem.childNodes.length).to.equal(0);
      });

      it('should return the inserted node', () => {
        const inserted = document.createElement('div');
        const changedElem = elem.insertBefore(inserted, null);
        expect(changedElem).not.to.equal(undefined);
        expect(changedElem).to.equal(inserted);
      });

      it('should append node if referenceNode is null', () => {
        htmlContent(elem, '<div></div><div></div>');
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, null);

        expect(htmlContent(elem)).to.equal('<div></div><div></div><test></test>');
        expect(elem.childNodes[2]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should insert an element node to a parent with no children', () => {
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, null);

        expect(htmlContent(elem)).to.equal('<test></test>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should insert a text node to a parent with no children', () => {
        const inserted = document.createTextNode('text');
        elem.insertBefore(inserted, null);

        expect(htmlContent(elem)).to.equal('text');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should insert a comment node to a parent with no children', () => {
        const inserted = document.createComment('comment');
        elem.insertBefore(inserted, null);

        expect(htmlContent(elem)).to.equal('<!--comment-->');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should insert an element node to a parent with one child', () => {
        htmlContent(elem, '<div></div>');
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(htmlContent(elem)).to.equal('<test></test><div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should insert a text node to a parent with one child', () => {
        htmlContent(elem, '<div></div>');
        const inserted = document.createTextNode('text');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(htmlContent(elem)).to.equal('text<div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
      });

      it('should insert a comment node to a parent with one child', () => {
        htmlContent(elem, '<div></div>');
        const inserted = document.createComment('comment');
        elem.insertBefore(inserted, elem.childNodes[0]);

        expect(htmlContent(elem)).to.equal('<!--comment--><div></div>');
        expect(elem.childNodes[0]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should insert an element node to a parent with two or more children', () => {
        htmlContent(elem, '<div1></div1><div2></div2><div3></div3>');
        const inserted = document.createElement('test');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(htmlContent(elem)).to.equal('<div1></div1><test></test><div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should insert a text node to a parent with two or more children', () => {
        htmlContent(elem, '<div1></div1><div2></div2><div3></div3>');
        const inserted = document.createTextNode('text');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(htmlContent(elem)).to.equal('<div1></div1>text<div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should insert a comment node to a parent with two or more children', () => {
        htmlContent(elem, '<div1></div1><div2></div2><div3></div3>');
        const inserted = document.createComment('comment');
        elem.insertBefore(inserted, elem.childNodes[1]);

        expect(htmlContent(elem)).to.equal('<div1></div1><!--comment--><div2></div2><div3></div3>');
        expect(elem.childNodes[1]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
      });

      it('should insert a node with children', () => {
        const insertedHTML = '<div4></div4><!--comment--><div5><div6>text</div6></div5>';
        htmlContent(elem, '<div1><div></div></div1><div2></div2><div3></div3>');
        const inserted = document.createElement('test');
        inserted.innerHTML = insertedHTML;
        elem.insertBefore(inserted, elem.childNodes[2]);

        expect(htmlContent(elem)).to.equal(`<div1><div></div></div1><div2></div2><test>${insertedHTML}</test><div3></div3>`);
        expect(elem.childNodes[2]).to.equal(inserted);

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
