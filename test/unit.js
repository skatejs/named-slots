import polyfill from '../src/index';
import version from '../src/version';

describe('skatejs-named-slots', function () {
  it('version', function () {
    expect(version).to.be.a('string');
  });
});

describe('skatejs-named-slots', function () {
  let host;
  let shadow;
  let slot;

  function add () {
    host.appendChild(document.createElement('div'));
  }

  function remove() {
    host.removeChild(host.firstChild);
  }

  beforeEach(function () {
    host = document.createElement('div');
    shadow = document.createElement('div');
    slot = document.createElement('div');

    // Template out the host by adding the shadow root and the slot to the
    // shadow root.
    slot.setAttribute('slot-name', '');
    shadow.appendChild(slot);
    host.appendChild(shadow);

    // Ensure the host is templated out properly.
    expect(host.firstChild).to.equal(shadow, 'before polyfill');

    // Polyfill after templated. This is because the polyfill must
    polyfill(host);

    // Ensure that the polyfill was properly applied.
    expect(host.firstChild).to.equal(null, 'after polyfill');
  });

  describe('methods', function () {
    it('appendChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);

      expect(slot.childNodes.length).to.equal(1, 'slot');
      expect(slot.childNodes[0]).to.equal(light1, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');

      host.appendChild(light2);

      expect(slot.childNodes.length).to.equal(2, 'slot');
      expect(slot.childNodes[0]).to.equal(light1, 'slot');
      expect(slot.childNodes[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');
    });

    it('hasChildNodes', function () {
      expect(host.hasChildNodes()).to.equal(false);
      host.appendChild(document.createElement('div'));
      expect(host.hasChildNodes()).to.equal(true);
      host.removeChild(host.firstChild);
      expect(host.hasChildNodes()).to.equal(false);
    });

    it('insertBefore()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.insertBefore(light2);

      expect(slot.childNodes.length).to.equal(1, 'slot');
      expect(slot.childNodes[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.insertBefore(light1, light2);

      expect(slot.childNodes.length).to.equal(2, 'slot');
      expect(slot.childNodes[0]).to.equal(light1, 'slot');
      expect(slot.childNodes[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');
    });

    it('removeChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);
      host.appendChild(light2);

      expect(slot.childNodes.length).to.equal(2, 'slot');
      expect(slot.childNodes[0]).to.equal(light1, 'slot');
      expect(slot.childNodes[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      host.removeChild(light1);

      expect(slot.childNodes.length).to.equal(1, 'slot');
      expect(slot.childNodes[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.removeChild(light2);

      expect(slot.childNodes.length).to.equal(0, 'slot');
      expect(host.childNodes.length).to.equal(0, 'light');
    });

    it('replaceChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);

      expect(slot.childNodes.length).to.equal(1, 'slot');
      expect(slot.childNodes[0]).to.equal(light1, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');

      host.replaceChild(light2, light1);

      expect(slot.childNodes.length).to.equal(1, 'slot');
      expect(slot.childNodes[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');
    });
  });

  describe('properties', function () {
    it('childElementCount', function () {
      expect(host.childElementCount).to.equal(0);
      add();
      expect(host.childElementCount).to.equal(1);
      remove();
      expect(host.childElementCount).to.equal(0);
    });

    it('childNodes', function () {
      expect(host.childNodes).to.be.an('array');
      expect(host.childNodes.item).to.be.a('function');
      expect(host.childNodes.length).to.equal(0);
      add();
      expect(host.childNodes.length).to.equal(1);
      remove();
      expect(host.childNodes.length).to.equal(0);
    });

    it('children', function () {
      expect(host.childNodes).to.be.an('array');
      expect(host.childNodes.item).to.be.a('function');
      expect(host.childNodes.length).to.equal(0);
      add();
      expect(host.childNodes.length).to.equal(1);
      remove();
      expect(host.childNodes.length).to.equal(0);
    });

    it('firstChild', function () {
      expect(host.firstChild).to.equal(null);
      add();
      expect(host.firstChild).to.not.equal(null);
      expect(host.firstChild.tagName).to.equal('DIV');
      remove();
      expect(host.firstChild).to.equal(null);
    });

    it('firstElementChild', function () {
      expect(host.firstChild).to.equal(null);
      add();
      expect(host.firstChild).to.not.equal(null);
      expect(host.firstChild.tagName).to.equal('DIV');
      remove();
      expect(host.firstChild).to.equal(null);
    });

    it('innerHTML', function () {
      expect(host.innerHTML).to.equal('');
      host.innerHTML = '<div slot="custom"></div>';
      expect(host.innerHTML).to.equal('');
      host.innerHTML = '<div></div>';
      expect(host.innerHTML).to.equal('<div></div>');
      host.innerHTML = '<div></div>';
      expect(host.innerHTML).to.equal('<div></div>');
    });

    it('lastChild', function () {
      expect(host.lastChild).to.equal(null);
      add();
      expect(host.lastChild).to.not.equal(null);
      expect(host.lastChild.tagName).to.equal('DIV');
      remove();
      expect(host.lastChild).to.equal(null);
    });

    it('lastElementChild', function () {
      expect(host.lastElementChild).to.equal(null);
      add();
      expect(host.lastElementChild).to.not.equal(null);
      expect(host.lastElementChild.tagName).to.equal('DIV');
      remove();
      expect(host.lastElementChild).to.equal(null);
    });

    it('outerHTML', function () {
      expect(host.outerHTML).to.equal('<div></div>');
      host.innerHTML = '<div slot="custom"></div>';
      expect(host.outerHTML).to.equal('<div></div>');
      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
    });

    it('parentNode', function () {
      const childNode = document.createElement('div');

      host.appendChild(childNode);

      // Ensure it's in fact in the slot.
      expect(slot.childNodes[0]).to.equal(childNode);

      // And this will confirm appendChild has set parentNode.
      expect(childNode.parentNode).to.equal(host);

      // We ensure that removeChild cleans up the parentNode.
      host.removeChild(childNode);
      expect(childNode.parentNode).to.equal(null);


      // Other means of adding.

      // insertBefore
      const childNodeInsertBefore = document.createElement('div');
      host.appendChild(childNodeInsertBefore);
      host.insertBefore(childNode, childNodeInsertBefore);
      expect(childNode.parentNode).to.equal(host);
      expect(childNodeInsertBefore.parentNode).to.equal(host);
      host.removeChild(childNode);
      host.removeChild(childNodeInsertBefore);

      // replaceChild
      const childNodeReplaceChild = document.createElement('div');
      host.appendChild(childNodeReplaceChild);
      host.replaceChild(childNode, childNodeReplaceChild);
      expect(childNode.parentNode).to.equal(host);
      expect(childNodeReplaceChild.parentNode).to.equal(null);
      host.removeChild(childNode);


      // Other means of removing.

      // innerHTML
      host.appendChild(childNode);
      host.innerHTML = '';
      expect(childNode.parentNode).to.equal(null);

      // textContent
      host.appendChild(childNode);
      host.textContent = '';
      expect(childNode.parentNode).to.equal(null);

      // parentNode.removeChild()
      host.appendChild(childNode);
      childNode.parentNode.removeChild(childNode);
      expect(childNode.parentNode).to.equal(null);
    });

    it('textContent', function () {
      expect(host.textContent).to.equal('');
      host.textContent = '<test />';
      expect(host.textContent).to.equal('<test />');

      // Ensure value was escaped.
      expect(host.firstChild.nodeType).to.equal(3);
    });
  });
});
