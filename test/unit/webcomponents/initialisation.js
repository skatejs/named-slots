/* eslint-env jasmine, mocha */

import '../../../src/index';

describe('webcomponents/initialisation', () => {
  it('web components are initialised with the polyfill', () => {
    if (document.registerElement) {
      document.registerElement('x-wc', {
        prototype: {
          hasPrototype: true,
          createdCallback () {
            this.created = true;
          }
        }
      });

      const div = document.createElement('div');
      div.innerHTML += '<x-wc></x-wc>';

      const el = div.querySelector('x-wc');
      expect(el.hasPrototype).to.equal(true);
      expect(el.created).to.equal(true);
    }
  });
});
