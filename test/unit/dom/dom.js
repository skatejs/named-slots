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
    it('insertBefore()', function () {
      const light1 = document.createElement('light1');
      const light2 = document.createElement('light2');

      host.insertBefore(light2);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.assignedNodes().length).to.equal(1, 'slot');
      expect(slot.assignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.insertBefore(light1, light2);
      expect(host.childNodes[0]).to.equal(light1, 'internal light dom');
      expect(host.childNodes[1]).to.equal(light2, 'internal light dom');

      expect(slot.assignedNodes().length).to.equal(2, 'slot');
      expect(slot.assignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.assignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      let local1 = document.createElement('h1');
      let local2 = document.createElement('h2');
      let local3 = document.createElement('h3');

      div1.insertBefore(local1, div1.childNodes[0]);
      div1.insertBefore(local2, div1.childNodes[0]);
      div1.insertBefore(local3);

      expect(div1.innerHTML).to.equal('<h2></h2><h1></h1><div></div><div><div></div></div><div></div><h3></h3>');
      expect(div1.childNodes[0]).to.equal(local2);
      expect(div1.childNodes[1]).to.equal(local1);
      expect(div1.childNodes[div1.childNodes.length-1]).to.equal(local3);

      root.insertBefore(local1, root.childNodes[0]);
      root.insertBefore(local2, root.childNodes[0]);
      root.insertBefore(local3);

      expect(root.innerHTML).to.equal('<h2></h2><h1></h1><slot></slot><h3></h3>');
      expect(root.childNodes[0]).to.equal(local2);
      expect(root.childNodes[1]).to.equal(local1);
      expect(root.childNodes[root.childNodes.length-1]).to.equal(local3);


      let div = document.createElement('div');
      let elem, changed;

      div.innerHTML = "<div></div>";
      changed = document.createElement('div');
      elem = div.insertBefore(changed);
      expect(elem).not.to.equal(undefined);
      expect(elem).to.equal(changed);

      changed = document.createElement('div');
      elem = root.insertBefore(changed);
      expect(elem).not.to.equal(undefined);
      expect(elem).to.equal(changed);

      changed = document.createElement('div');
      elem = host.insertBefore(changed);
      expect(elem).not.to.equal(undefined);
      expect(elem).to.equal(changed);
    });

    it('removeChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);
      host.appendChild(light2);

      expect(slot.assignedNodes().length).to.equal(2, 'slot');
      expect(slot.assignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.assignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      host.removeChild(light1);
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.assignedNodes().length).to.equal(1, 'slot');
      expect(slot.assignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.removeChild(light2);
      expect(host.childNodes.length).to.equal(0);

      expect(slot.assignedNodes().length).to.equal(0, 'slot');
      expect(host.childNodes.length).to.equal(0, 'light');

      let local1 = document.createElement('h1');
      let local2 = document.createElement('h2');
      let local3 = document.createElement('h3');
      let local4 = document.createElement('h4');
      let local5 = document.createElement('h5');

      div1.insertBefore(local1, div1.childNodes[0]);
      div1.insertBefore(local2);
      div1.childNodes[2].insertBefore(local3, div1.childNodes[2].childNodes[0]);
      div1.childNodes[2].insertBefore(local4, div1.childNodes[2].childNodes[0]);
      div1.childNodes[2].insertBefore(local5);

      expect(div1.childNodes.length).to.equal(5);

      div1.removeChild(local1);
      expect(div1.childNodes.length).to.equal(4);

      div1.childNodes[1].removeChild(div1.childNodes[1].childNodes[0]);
      expect(div1.childNodes.length).to.equal(4);
      expect(div1.childNodes[1].childNodes.length).to.equal(3);

      div1.childNodes[1].removeChild(div1.childNodes[1].childNodes[div1.childNodes[1].childNodes.length - 1]);
      expect(div1.childNodes.length).to.equal(4);
      expect(div1.childNodes[1].childNodes.length).to.equal(2);

      div1.removeChild(div1.childNodes[1]);
      expect(div1.childNodes.length).to.equal(3);

      div1.removeChild(div1.firstChild);
      expect(div1.childNodes.length).to.equal(2);

      div1.removeChild(div1.firstChild);
      expect(div1.childNodes.length).to.equal(1);

      div1.removeChild(div1.firstChild);
      expect(div1.childNodes.length).to.equal(0);

      let local6 = document.createElement('div');
      let local7 = document.createElement('div');
      local6.appendChild(local7);
      root.insertBefore(local1, root.childNodes[0]);
      root.insertBefore(local6);
      root.insertBefore(local2);

      root.childNodes[2].insertBefore(local3, root.childNodes[2].childNodes[0]);
      root.childNodes[2].insertBefore(local4, root.childNodes[2].childNodes[0]);
      root.childNodes[2].insertBefore(local5);

      expect(root.childNodes.length).to.equal(4);

      root.removeChild(local1);
      expect(root.childNodes.length).to.equal(3);

      root.childNodes[1].removeChild(root.childNodes[1].childNodes[0]);
      expect(root.childNodes.length).to.equal(3);
      expect(root.childNodes[1].childNodes.length).to.equal(3);

      root.childNodes[1].removeChild(root.childNodes[1].childNodes[root.childNodes[1].childNodes.length - 1]);
      expect(root.childNodes.length).to.equal(3);
      expect(root.childNodes[1].childNodes.length).to.equal(2);

      root.removeChild(root.childNodes[1]);
      expect(root.childNodes.length).to.equal(2);

      root.removeChild(root.firstChild);
      expect(root.childNodes.length).to.equal(1);

      root.removeChild(root.firstChild);
      expect(root.childNodes.length).to.equal(0);

      expect(root.innerHTML).to.equal('');

      if (canPatchNativeAccessors) {
        expect(root.__innerHTML).to.equal('');
      }

      let div = document.createElement('div');
      let elem, changed;
      host.innerHTML = "<div></div>";
      root.innerHTML = "<div></div>";

      div.innerHTML = "<div></div><div></div>";
      changed = div.childNodes[0];
      elem = div.removeChild(changed);
      expect(elem).not.to.equal(undefined);
      expect(elem).to.equal(changed);

      changed = host.childNodes[0];
      elem = host.removeChild(changed);
      expect(elem).not.to.equal(undefined);
      expect(elem).to.equal(changed);

      changed = root.childNodes[0];
      elem = root.removeChild(changed);
      expect(elem).not.to.equal(undefined);
      expect(elem).to.equal(changed);
    });

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

  describe('properties', function () {
 
    describe('textContent', function () {
      it('sets and gets correctly', function () {
        expect(host.textContent).to.equal('');
        host.textContent = '<test />';
        expect(host.textContent).to.equal('<test />');
        expect(host.innerHTML).to.equal('&lt;test /&gt;');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.assignedNodes().length).to.equal(1);
        // Ensure value was escaped.
        expect(host.firstChild.nodeType).to.equal(3);

        host.textContent = '<testtest />';
        expect(host.textContent).to.equal('<testtest />');
        expect(host.innerHTML).to.equal('&lt;testtest /&gt;');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.assignedNodes().length).to.equal(1);

        host.innerHTML = '<div>sometest <div>another text</div></div>and outside';
        expect(host.textContent).to.equal('sometest another textand outside');

        expect(root.textContent).to.equal('');
        root.textContent = '<test />';
        expect(root.textContent).to.equal('<test />');
        expect(root.firstChild.nodeType).to.equal(3);
        expect(root.innerHTML).to.equal('&lt;test /&gt;');
        expect(root.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('&lt;test /&gt;');

        root.textContent = '<testtest />';
        expect(root.textContent).to.equal('<testtest />');
        expect(root.firstChild.nodeType).to.equal(3);
        expect(root.innerHTML).to.equal('&lt;testtest /&gt;');
        expect(root.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('&lt;testtest /&gt;');

        root.innerHTML = '<div>sometest <div>another text</div></div>and outside';
        expect(root.textContent).to.equal('sometest another textand outside');

        const div = document.createElement('div');
        expect(div.textContent).to.equal('');
        div.textContent = '<test />';
        expect(div.textContent).to.equal('<test />');
        expect(div.firstChild.nodeType).to.equal(3);
        expect(div.innerHTML).to.equal('&lt;test /&gt;');
        expect(div.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('&lt;test /&gt;');

        div.textContent = '<testtest />';
        expect(div.textContent).to.equal('<testtest />');
        expect(div.firstChild.nodeType).to.equal(3);
        expect(div.innerHTML).to.equal('&lt;testtest /&gt;');
        expect(div.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('&lt;testtest /&gt;');

        div.innerHTML = '<div>sometest <div>another text</div></div>and outside';
        expect(div.textContent).to.equal('sometest another textand outside');
      });

      it('does not return comments', function () {
        expect(host.textContent).to.equal('');
        host.innerHTML = '<!-- comment -->';
        expect(host.textContent).to.equal('');

        root.innerHTML = '<!-- comment -->';
        expect(root.textContent).to.equal('');

        const div = document.createElement('div');
        div.innerHTML = '<!-- comment -->';
        expect(div.textContent).to.equal('');
      });

      it('setting to \'\' does not affect textContent', function () {
        expect(host.textContent).to.equal('');
        host.textContent = '';
        expect(host.childNodes.length).to.equal(0);
        expect(slot.assignedNodes().length).to.equal(0);

        root.textContent = '';
        expect(root.innerHTML).to.equal('');
        expect(root.childNodes.length).to.equal(0);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('');

        const div = document.createElement('div');
        div.textContent = '';
        expect(div.innerHTML).to.equal('');
        expect(div.childNodes.length).to.equal(0);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('');
      });
    });



    it('lastChild', function () {
      testLastChild(host);
      root.innerHTML = '';
      testLastChild(root);
      testLastChild(document.createElement('div'));

      function testLastChild(elem) {
        expect(elem.lastChild).to.equal(null);
        add.call(elem);
        expect(elem.lastChild).to.not.equal(null);
        expect(elem.lastChild.tagName).to.equal('DIV');
        remove.call(elem);
        expect(elem.lastChild).to.equal(null);

        add.call(elem, document.createTextNode('123'));
        expect(elem.lastChild).to.not.equal(null);
        expect(elem.lastChild.nodeType).to.equal(3);

        add.call(elem);
        expect(elem.lastChild).to.not.equal(null);
        expect(elem.lastChild.nodeType).to.equal(1);

        remove.call(elem, elem.lastChild);
        expect(elem.lastChild).to.not.equal(null);
        expect(elem.lastChild.nodeType).to.equal(3);

        remove.call(elem, elem.lastChild);
        expect(elem.lastChild).to.equal(null);
      }
    });

    it('lastElementChild', function () {
      testLastElementChild(host);
      root.innerHTML = '';
      testLastElementChild(root);
      testLastElementChild(document.createElement('div'));
      
      function testLastElementChild(elem) {
        expect(elem.lastElementChild).to.equal(null);
        add.call(elem);
        expect(elem.lastElementChild).to.not.equal(null);
        expect(elem.lastElementChild.tagName).to.equal('DIV');
        remove.call(elem);
        expect(elem.lastElementChild).to.equal(null);

        add.call(elem, document.createTextNode('123'));
        expect(elem.lastElementChild).to.equal(null);
        add.call(elem);
        expect(elem.lastElementChild).to.not.equal(null);
        expect(elem.lastElementChild.tagName).to.equal('DIV');
        remove.call(elem, elem.lastElementChild);
        expect(elem.lastElementChild).to.equal(null);
        expect(elem.innerHTML).to.equal('123');
      }
    });

    it('outerHTML', function () {
      expect(host.outerHTML).to.equal('<div></div>');
      host.innerHTML = '<div slot="custom"></div>';
      expect(host.outerHTML).to.equal('<div><div slot="custom"></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.assignedNodes().length).to.equal(0);

      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.assignedNodes().length).to.equal(1);

      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.assignedNodes().length).to.equal(1);

      // check normal behaviour of the 'outerHTML' property
      root.innerHTML = '<div><div></div><div></div></div>';
      root.childNodes[0].childNodes[0].outerHTML = '<p></p>';
      expect(root.innerHTML).to.equal( '<div><p></p><div></div></div>');

      root.innerHTML = '<div><div></div><div></div></div>';
      root.childNodes[0].outerHTML = '<p></p>';
      expect(root.innerHTML).to.equal('<p></p>');

      host.innerHTML = '<div><div></div><div></div></div>';
      host.childNodes[0].childNodes[0].outerHTML = '<p></p>';
      expect(host.innerHTML).to.equal('<div><p></p><div></div></div>');

      host.innerHTML = '<div><div></div><div></div></div>';
      host.childNodes[0].outerHTML = '<p></p>';
      expect(host.innerHTML).to.equal('<p></p>');

      root.innerHTML = '<div></div>';
      // we can't change root with this, so nothing should happen
      root.outerHTML = '<p></p>';
      expect(root.outerHTML).to.equal('<_shadow_root_><div></div></_shadow_root_>');

      // host has no parentNode so we expect is to throw an error in some browsers, otherwise do nothing
      const errorMsg = 'Failed to set the \'outerHTML\' property on \'Element\': This element has no parent node.';
      const errorMsgOpera = 'Failed to call host setter';
      host.innerHTML = '';
      expect(host.outerHTML).to.equal('<div></div>');

      if (canPatchNativeAccessors) {
        let throwsErrorNatively = false;
        try {
          host.__outerHTML = '';
        } catch(e) {
          throwsErrorNatively = true;
        }

        if (throwsErrorNatively) {
          let throwsErrorFromPolyfill = false;
          try {
            host.outerHTML = '<p></p>';
          } catch(e) {
            throwsErrorFromPolyfill = true;
            expect([errorMsg, errorMsgOpera].indexOf(e.message)).to.be.above(-1);
          }
          expect(throwsErrorFromPolyfill).to.equal(true);
        }

      } else {
        expect(function() {
          host.outerHTML = '<p></p>';
        }).to.throw(Error, errorMsg);
      }

      //after all that above it should stay the same
      expect(host.outerHTML).to.equal('<div></div>');
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
});
