import create from '../../lib/create';
import hasAllAttributes from '../../lib/has-all-attributes';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('skatejs-named-slots dom', function () {
  let host, root, slot, div1, div2, div3, div4, div5;

  function add (elem) {
    this.appendChild(elem || document.createElement('div'));
  }

  function remove(elem) {
    this.removeChild(elem || this.firstChild);
  }

  beforeEach(function () {
    host = document.createElement('div');
    root = host.attachShadow({ mode: 'open' });
    slot = create('slot');

    // Now it has something to assign nodes to.
    root.appendChild(slot);

    div1 = document.createElement('div');
    div2 = document.createElement('div');
    div3 = document.createElement('div');
    div4 = document.createElement('div');
    div5 = document.createElement('div');

    div1.appendChild(div2);
    div1.appendChild(div3);
    div1.appendChild(div5);
    div3.appendChild(div4);
  });

  describe('methods', function () {

    
    it('replaceChild()', function () {
      testReplaceChild(host, true);
      root.innerHTML = '';
      testReplaceChild(root);
      testReplaceChild(document.createElement('div'));
      
      function testReplaceChild(elem, isHost) {
        const light1 = document.createElement('div');
        const light2 = document.createElement('div');
        const light3 = document.createTextNode('text');
        const light4 = document.createTextNode('text');
        const light5 = document.createElement('div');
        const light6 = document.createElement('div');

        elem.appendChild(light1);
        
        if (isHost) {
          expect(slot.assignedNodes().length).to.equal(1, 'slot');
          expect(slot.assignedNodes()[0]).to.equal(light1, 'slot');
        }
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.childNodes[0]).to.equal(light1);

        elem.replaceChild(light2, light1);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.childNodes[0]).to.equal(light2);
        if (isHost) {
          expect(slot.assignedNodes().length).to.equal(1, 'slot');
          expect(slot.assignedNodes()[0]).to.equal(light2, 'slot');
        }

        elem.replaceChild(light3, elem.childNodes[0]);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.childNodes[0]).to.equal(light3);
        if (isHost) {
          expect(slot.assignedNodes().length).to.equal(1, 'slot');
          expect(slot.assignedNodes()[0]).to.equal(light3, 'slot');
        }

        elem.replaceChild(light4, elem.childNodes[0]);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.childNodes[0]).to.equal(light4);
        if (isHost) {
          expect(slot.assignedNodes().length).to.equal(1, 'slot');
          expect(slot.assignedNodes()[0]).to.equal(light4, 'slot');
        }

        elem.replaceChild(light5, elem.childNodes[0]);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.childNodes[0]).to.equal(light5);
        if (isHost) {
          expect(slot.assignedNodes().length).to.equal(1, 'slot');
          expect(slot.assignedNodes()[0]).to.equal(light5, 'slot');
        }

        elem.appendChild(document.createElement('div'));
        elem.appendChild(document.createTextNode('test'));
        expect(elem.childNodes.length).to.equal(3);

        elem.replaceChild(light6, elem.childNodes[1]);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.childNodes[1]).to.equal(light6);
        expect(elem.childNodes[0]).not.to.equal(light6);
        expect(elem.childNodes[2]).not.to.equal(light6);

        if (isHost) {
          expect(slot.assignedNodes().length).to.equal(3, 'slot');
          expect(slot.assignedNodes()[1]).to.equal(light6, 'slot');
          expect(slot.assignedNodes()[0]).not.to.equal(light6, 'slot');
          expect(slot.assignedNodes()[2]).not.to.equal(light6, 'slot');
        }
      }
    });
  });



  describe('DocumentFragment', function () {
    it('should report the corect parent node for nested nodes', function () {
      const frag = document.createDocumentFragment();
      const elem = document.createElement('div');
      frag.appendChild(elem);
      expect(elem.parentNode).to.equal(frag);
    });
  });

  describe('SVGElement', function () {
    it('should be polyfilled', function () {
      const div = document.createElement('div');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      div.attachShadow({ mode: 'open' });
      div.shadowRoot.appendChild(document.createElement('slot'));
      div.appendChild(svg);
      expect(svg.parentNode).to.equal(div);
    });
  });
});
