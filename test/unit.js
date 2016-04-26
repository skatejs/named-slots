import create from './lib/create';
import version from '../src/version';

import './unit/light/polyfill';
import './unit/shadow/polyfill';
import './unit/slot/change-event.js';
import './unit/slot/distribution';
import './unit/slot/fallback-content';
import './unit/slot/polyfill';
import './unit/webcomponents/initialisation';

describe('skatejs-named-slots', function () {
  it('version', function () {
    expect(version).to.be.a('string');
  });
});

describe('skatejs-named-slots', function () {
  let host, root, slot;

  function add () {
    host.appendChild(document.createElement('div'));
  }

  function remove() {
    host.removeChild(host.firstChild);
  }

  /**
   * Technically attributes may appear in any order, so we test only for the exclusive presence, rather than the order.
   * @param {element} el the element to test
   * @param {string[]} attrs an array of attributes to check the exclusive presence of
   * @returns {boolean} whether all attributes are present, but no others are.
   */
  function hasAllAttributes(el, attrs) {
    const exactNumber = el.attributes.length === attrs.length;
    let hasAttrs = true;
    attrs.forEach(function (attr) {
      hasAttrs = hasAttrs && el.hasAttribute(attr);
    });

    return exactNumber && hasAttrs;
  }

  beforeEach(function () {
    host = document.createElement('div');
    root = host.attachShadow({ mode: 'closed' });
    slot = create('slot');

    // Now it has something to assign nodes to.
    root.appendChild(slot);
  });

  describe('methods', function () {
    it('appendChild()', function () {
      const light1 = document.createElement('light-1');
      const light2 = document.createElement('light-2');

      host.appendChild(light1);
      expect(host.childNodes[0]).to.equal(light1, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');

      host.appendChild(light2);
      expect(host.childNodes[1]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(2, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.getAssignedNodes()[1]).to.equal(light2, 'slot');

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
      const light1 = document.createElement('light1');
      const light2 = document.createElement('light2');

      host.insertBefore(light2);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.insertBefore(light1, light2);
      expect(host.childNodes[0]).to.equal(light1, 'internal light dom');
      expect(host.childNodes[1]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(2, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.getAssignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');
    });

    it('removeChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);
      host.appendChild(light2);

      expect(slot.getAssignedNodes().length).to.equal(2, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.getAssignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      host.removeChild(light1);
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.removeChild(light2);
      expect(host.childNodes.length).to.equal(0);

      expect(slot.getAssignedNodes().length).to.equal(0, 'slot');
      expect(host.childNodes.length).to.equal(0, 'light');
    });

    it('replaceChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');

      host.replaceChild(light2, light1);
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light2, 'slot');

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
      expect(host.innerHTML).to.equal('<div slot="custom"></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(0);

      host.innerHTML = '<div></div>';
      expect(host.innerHTML).to.equal('<div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);

      host.innerHTML = '<div></div>';
      expect(host.innerHTML).to.equal('<div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);

      host.innerHTML = '<div></div><div></div>';
      expect(host.innerHTML).to.equal('<div></div><div></div>');
      expect(host.childNodes.length).to.equal(2);
      expect(slot.getAssignedNodes().length).to.equal(2);

      host.innerHTML = '<div checked></div>';
      expect(host.innerHTML).to.equal('<div checked></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);
    });

    it('innerHTML (with whitespace text nodes)', function () {
      expect(host.innerHTML).to.equal('');
      host.innerHTML = '<div> <button></button> </div>';
      expect(host.innerHTML).to.equal('<div> <button></button> </div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);
    });

    it('innerHTML (with [ attributes)', function () {
      expect(host.innerHTML).to.equal('');
      host.innerHTML = '<div [ foo ] ( bar )></div>';
      expect(hasAllAttributes(host.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);
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
      expect(host.outerHTML).to.equal('<div><div slot="custom"></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(0);

      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);

      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);
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
