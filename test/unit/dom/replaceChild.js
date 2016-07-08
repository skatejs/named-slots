import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';
import create from '../../lib/create';

describe('dom: replaceChild', function () {
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

      it('should return the replaced element node', () => {
        let node = document.createElement('div');
        let node2 = document.createElement('test1');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<test1></test1>');
      });

      it('should replace an element node with an element node', () => {
        let node = document.createElement('toreplace');
        let node2 = document.createElement('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace an element node with a text node', () => {
        let node = document.createElement('toreplace');
        let node2 = document.createTextNode('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('newnode');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace an element node with a comment node', () => {
        let node = document.createElement('toreplace');
        let node2 = document.createComment('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<!--newnode-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should replace a text node with an element node', () => {
        let node = document.createTextNode('toreplace');
        let node2 = document.createElement('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a text node with a text node', () => {
        let node = document.createTextNode('toreplace');
        let node2 = document.createTextNode('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('newnode');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a text node with a comment node', () => {
        let node = document.createTextNode('toreplace');
        let node2 = document.createComment('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<!--newnode-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should replace a comment node with an element node', () => {
        let node = document.createComment('toreplace');
        let node2 = document.createElement('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a comment node with a text node', () => {
        let node = document.createComment('toreplace');
        let node2 = document.createTextNode('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('newnode');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      });

      it('should replace a comment node with a comment node', () => {
        let node = document.createComment('toreplace');
        let node2 = document.createComment('newnode');
        elem.appendChild(node);
        let replaced = elem.replaceChild(node2, elem.firstChild);

        expect(replaced).to.be.equal(node);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<!--newnode-->');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(0);
        }
      });

      it('should replace a node in a parent with two or more children', () => {
        let node = document.createElement('newnode');
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>';
        let toreplace = elem.childNodes[2];
        let replaced = elem.replaceChild(node, elem.childNodes[2]);

        expect(replaced).to.be.equal(toreplace);
        expect(replaced.parentNode).to.be.equal(null);
        expect(elem.innerHTML).to.be.equal('<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><newnode></newnode><div9></div9>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should replace a node with children', () => {
        let node = document.createElement('newnode');
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>';
        let toreplace = elem.childNodes[1];
        let replaced = elem.replaceChild(node, elem.childNodes[1]);

        expect(replaced).to.be.equal(toreplace);
        expect(replaced.parentNode).to.be.equal(null);
        expect(replaced.innerHTML).to.be.equal('<div3><div4><div5></div5></div4><div6></div6></div3><div7></div7>');
        expect(elem.innerHTML).to.be.equal('<div1></div1><newnode></newnode><div8></div8><div9></div9>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should replace a node with children with another node with children', () => {
        let node = document.createElement('newnode');
        node.innerHTML = '<newdiv1></newdiv1><newdiv2><newdiv4></newdiv4></newdiv2><newdiv3></newdiv3>';
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>';
        let toreplace = elem.childNodes[1];
        let replaced = elem.replaceChild(node, elem.childNodes[1]);

        expect(replaced).to.be.equal(toreplace);
        expect(replaced.parentNode).to.be.equal(null);
        expect(replaced.innerHTML).to.be.equal('<div3><div4><div5></div5></div4><div6></div6></div3><div7></div7>');
        expect(elem.innerHTML).to.be.equal('<div1></div1><newnode><newdiv1></newdiv1><newdiv2><newdiv4></newdiv4></newdiv2><newdiv3></newdiv3></newnode><div8></div8><div9></div9>');

        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
      });

      it('should be able to replace in sequence', () => {   
        let node = document.createElement('newnode');
        elem.innerHTML = '<div1></div1><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>';

        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode><div2><div3><div4><div5></div5></div4><div6></div6></div3><div7></div7></div2><div8></div8><div9></div9>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(4);
        }
        elem.removeChild(elem.firstChild);
        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode><div8></div8><div9></div9>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(3);
        }
        elem.removeChild(elem.firstChild);
        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode><div9></div9>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(2);
        }
        elem.removeChild(elem.firstChild);
        elem.replaceChild(node, elem.firstChild);
        expect(elem.innerHTML).to.be.equal('<newnode></newnode>');
        if (type === 'host') {
          expect(slot.assignedNodes().length).to.equal(1);
        }
      })
    });
  }
});