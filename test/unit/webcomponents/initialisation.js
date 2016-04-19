import '../../../src/index';

describe('webcomponents/initialisation', function () {

  it('web components are initialised with the polyfill', function () {
    if (document.registerElement) {
      var x = document.registerElement('x-wc', {
        prototype: {
          hasPrototype: true,
          createdCallback: function () {
            this.created = true;
          }
        }
      });

      var div = document.createElement('div');
      div.innerHTML += '<x-wc></x-wc>';

      var el = div.querySelector('x-wc');
      expect(el.hasPrototype).to.equal(true);
      expect(el.created).to.equal(true);
    }
  });
});
