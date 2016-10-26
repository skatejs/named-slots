/* eslint-env jasmine, mocha */

describe('dom: hasChildNodes', () => {
  function runTests (type) {
    describe(`${type}: `, () => {
      let host;
      let root;
      let slot;
      let div;
      let elem;

      beforeEach(() => {
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = document.createElement('slot');

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

      it('should return false if there are no child nodes', () => {
        elem.innerHTML = '';
        expect(elem.hasChildNodes()).to.equal(false);
      });

      it('should return true if there is one element child node', () => {
        elem.innerHTML = '<div></div>';
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return true if there is one text child node', () => {
        elem.innerHTML = 'text';
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return true if there is one comment child node', () => {
        elem.innerHTML = '<!--comment-->';
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return true if there is more than one child node', () => {
        elem.innerHTML = '<div></div>text<div></div>';
        expect(elem.hasChildNodes()).to.equal(true);
      });

      it('should return correct value in a complex tree', () => {
        elem.innerHTML = '<div1></div1><div1><div1></div1><div1><div1></div1></div1></div1><div1></div1>';
        expect(elem.hasChildNodes()).to.equal(true);
        expect(elem.firstChild.hasChildNodes()).to.equal(false);
        expect(elem.childNodes[1].hasChildNodes()).to.equal(true);
        expect(elem.childNodes[1].childNodes[0].hasChildNodes()).to.equal(false);
        expect(elem.childNodes[1].childNodes[1].hasChildNodes()).to.equal(true);
        expect(elem.lastChild.hasChildNodes()).to.equal(false);
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
  runTests('root');
});
