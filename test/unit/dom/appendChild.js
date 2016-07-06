import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';
import create from '../../lib/create';

describe('dom: appendChild', function () {
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

      it(`should not append anything if there is nothing to append`, () => {
        expect(function() {
          elem.appendChild(null)
        }).to.throw(Error);
      });

      it(`should return an appended node`, () => {
        let appended = document.createElement('div');
        let changedElem = elem.appendChild(appended);
        expect(changedElem).not.to.equal(undefined);
        expect(changedElem).to.equal(appended);
      });

      it(`should append one element node to an empty parent`, () => {
        elem.appendChild(document.createElement('div'));
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal('<div></div>');

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<_shadow_root_><slot><div></div></slot></_shadow_root_>');
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<div></div>');
        }
      });

      it(`should append one element node to a parent with one child`, () => {
        elem.innerHTML = '<test></test>';
        elem.appendChild(document.createElement('div'));
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal('<test></test><div></div>');

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<_shadow_root_><slot><test></test><div></div></slot></_shadow_root_>');
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<test></test><div></div>');
        }
      });

      it(`should append one element node to a parent with two or more children`, () => {
        let html = '<test1></test1><test2><test3></test3></test2>';
        elem.innerHTML = html;
        elem.appendChild(document.createElement('div'));
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}<div></div>`);

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<_shadow_root_><slot>${html}<div></div></slot></_shadow_root_>`);
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`${html}<div></div>`);
        }
      });

      it(`should append an element node with children to a parent without any children`, () => {
        let child = document.createElement('div');
        let html = '<test1></test1><test2><test3></test3></test2>';
        child.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal(`<div>${html}</div>`);

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<_shadow_root_><slot><div>${html}</div></slot></_shadow_root_>`);
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<div>${html}</div>`);
        }
      });

      it(`should append an element node with children to a parent with two or more children`, () => {
        let child = document.createElement('div');
        let html = '<test1></test1><test2><test3></test3></test2>';
        child.innerHTML = html;
        elem.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}<div>${html}</div>`);

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<_shadow_root_><slot>${html}<div>${html}</div></slot></_shadow_root_>`);
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`${html}<div>${html}</div>`);
        }
      });

      it(`should append one text node to an empty parent`, () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal('text');

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<_shadow_root_><slot>text</slot></_shadow_root_>');
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('text');
        }
      });

      it(`should append one text node to a parent with one child`, () => {
        elem.innerHTML = '<test></test>';
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal('<test></test>text');

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<_shadow_root_><slot><test></test>text</slot></_shadow_root_>');
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<test></test>text');
        }
      });

      it(`should append one text node to a parent with two or more children`, () => {
        let child = document.createTextNode('text');
        let html = '<test1></test1><test2><test3></test3></test2>';
        elem.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}text`);

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<_shadow_root_><slot>${html}text</slot></_shadow_root_>`);
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`${html}text`);
        }
      });

      it(`should append one comment node to an empty parent`, () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(1);
        expect(elem.innerHTML).to.equal('<!--comment-->');

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<_shadow_root_><slot></slot></_shadow_root_>');
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<!--comment-->');
        }
      });

      it(`should append one comment node to a parent with one child`, () => {
        elem.innerHTML = '<test></test>';
        elem.appendChild(document.createComment('comment'));
        expect(elem.childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal('<test></test><!--comment-->');

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<_shadow_root_><slot><test></test></slot></_shadow_root_>');
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal('<test></test><!--comment-->');
        }
      });

      it(`should append one comment node to a parent with two or more children`, () => {
        let child = document.createComment('comment');
        let html = '<test1></test1><test2><test3></test3></test2>';
        elem.innerHTML = html;
        elem.appendChild(child);
        expect(elem.childNodes.length).to.equal(3);
        expect(elem.innerHTML).to.equal(`${html}<!--comment-->`);

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<_shadow_root_><slot>${html}</slot></_shadow_root_>`);
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`${html}<!--comment-->`);
        }
      });

      it(`should do a series of appends`, () => {
        let resultHTML = '<div1><div4><div5></div5><div6></div6></div4></div1><div2></div2><div3></div3>';
        elem.appendChild(document.createElement('div1'));
        elem.appendChild(document.createElement('div2'));
        elem.appendChild(document.createElement('div3'));
        elem.childNodes[0].appendChild(document.createElement('div4'));
        elem.childNodes[0].childNodes[0].appendChild(document.createElement('div5'));
        elem.childNodes[0].childNodes[0].appendChild(document.createElement('div6'));

        expect(elem.childNodes.length).to.equal(3);
        expect(elem.childNodes[0].childNodes.length).to.equal(1);
        expect(elem.childNodes[0].childNodes[0].childNodes.length).to.equal(2);
        expect(elem.innerHTML).to.equal(resultHTML);

        if (type === 'host') {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`<_shadow_root_><slot>${resultHTML}</slot></_shadow_root_>`);
        } else {
          canPatchNativeAccessors && expect(elem.__innerHTML).to.equal(`${resultHTML}`);
        }
      });

    });
  }
});
