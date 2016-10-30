/* eslint-env jasmine, mocha */

describe('dom: childElementCount', () => {
  function runTests (type) {
    describe(`${type}: `, () => {
      let div;
      let elem;
      let fragment;
      let host;
      const numbers = [0, 1, 2, 3];
      let root;
      let slot;

      beforeEach(function () {
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
            if ('childElementCount' in fragment) {
              elem = fragment;
            } else {
              // named-slots doesn't offer a polyfill for DocumentFragment.childElementCount,
              // so if it doesn't exist present it means that there isn't native support, and
              // thus nothing for us to verify.
              this.skip();
            }
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

      it('should return correct number of child nodes', () => {
        numbers.forEach(num => {
          expect(elem.childElementCount).to.equal(num);
          elem.appendChild(document.createElement('div'));
        });

        numbers.reverse().forEach(num => {
          elem.removeChild(elem.lastChild);
          expect(elem.childElementCount).to.equal(num);
        });
      });

      it('should not count text nodes', () => {
        elem.appendChild(document.createTextNode('text'));
        expect(elem.childElementCount).to.equal(0);

        elem.appendChild(document.createTextNode('text'));
        expect(elem.childElementCount).to.equal(0);

        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);

        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);
      });

      it('should not count comment nodes', () => {
        elem.appendChild(document.createComment('comment'));
        expect(elem.childElementCount).to.equal(0);

        elem.appendChild(document.createComment('comment'));
        expect(elem.childElementCount).to.equal(0);

        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);

        elem.removeChild(elem.lastChild);
        expect(elem.childElementCount).to.equal(0);
      });
    });
  }

  runTests('div');
  runTests('fragment');
  runTests('host');
  runTests('root');
  runTests('slot');
});
