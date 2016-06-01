import '../../../src/index';
import create from '../../lib/create';

describe('light/polyfill', function () {
  let host, light1, light2, root, slot, text;

  describe('when mode is closed', function () {
    beforeEach(function () {
      slot = create('slot');
      host = create('div');
      root = host.attachShadow({ mode: 'closed' });

      root.appendChild(slot);

      light1 = create('light1');

      host.appendChild(light1);
    });

    it('assignedSlot', function () {
      expect(light1.assignedSlot).to.equal(null);
    });
  });

  beforeEach(function () {
    slot = create('slot');
    host = create('div');
    root = host.attachShadow({ mode: 'open' });

    root.appendChild(slot);

    light1 = create('light1');
    light2 = create('light2');
    text = document.createTextNode('text');

    host.appendChild(light1);
    host.appendChild(text);
    host.appendChild(light2);
  });

  it('assignedSlot', function () {
    expect(light1.assignedSlot).to.equal(slot);
  });

  it('parentElement', function () {
    expect(light1.parentElement).to.equal(host);
  });

  it('parentNode', function () {
    expect(light1.parentNode).to.equal(host);
  });

  it('nextSibling', function () {
    expect(light1.nextSibling).to.equal(text);
  });

  it('nextElementSibling', function () {
    expect(light1.nextElementSibling).to.equal(light2);
  });

  it('previousSibling', function () {
    expect(light2.previousSibling).to.equal(text);
  });

  it('previousElementSibling', function () {
    expect(light2.previousElementSibling).to.equal(light1);
  });

  describe('when removed', function () {
    let anotherHost, anotherNode, anotherRoot, anotherSlot;

    beforeEach(function () {
      anotherHost = create('div');
      anotherNode = create('div');
      anotherRoot = anotherHost.attachShadow({ mode: 'open' });
      anotherSlot = create('slot');

      anotherRoot.appendChild(anotherSlot);
      host.removeChild(light1);
    });

    it('should null parentNode', function () {
      expect(light1.parentNode).to.equal(null);
    });

    it('should null assignedSlot', function () {
      expect(light1.assignedSlot).to.equal(null);
    });

    describe('and reparented to the same host', function () {
      beforeEach(function () {
        host.appendChild(light1);
      });

      it('should reset parentNode', function () {
        expect(light1.parentNode).to.equal(host);
      });

      it('should keep assignedSlot null', function () {
        expect(light1.assignedSlot).to.equal(slot);
      });
    });

    describe('and reparented to a different host', function () {
      beforeEach(function () {
        anotherHost.appendChild(light1);
      });

      it('should reset parentNode', function () {
        expect(light1.parentNode).to.equal(anotherHost);
      });

      it('should keep assignedSlot null', function () {
        expect(light1.assignedSlot).to.equal(anotherSlot);
      });
    });

    describe('and reparented to a different node', function () {
      beforeEach(function () {
        anotherNode.appendChild(light1);
      });

      it('should reset parentNode', function () {
        expect(light1.parentNode).to.equal(anotherNode);
      });

      it('should keep assignedSlot null', function () {
        expect(light1.assignedSlot).to.equal(null);
      });
    });
  });

  describe('when directly reparented', function () {
    let anotherHost, anotherNode, anotherRoot, anotherSlot;

    beforeEach(function () {
      anotherHost = create('div');
      anotherNode = create('div');
      anotherRoot = anotherHost.attachShadow({ mode: 'open' });
      anotherSlot = create('slot');

      anotherRoot.appendChild(anotherSlot);
    });

    describe('to the same host', function () {
      beforeEach(function () {
        host.appendChild(light1);
      });

      it('should reset parentNode', function () {
        expect(light1.parentNode).to.equal(host);
      });

      it('should reset assignedSlot', function () {
        expect(light1.assignedSlot).to.equal(slot);
      });
    });

    describe('to a different host', function () {
      beforeEach(function () {
        anotherHost.appendChild(light1);
      });

      it('should reset parentNode', function () {
        expect(light1.parentNode).to.equal(anotherHost);
      });

      it('should reset assignedSlot', function () {
        expect(light1.assignedSlot).to.equal(anotherSlot);
      });
    });

    describe('to a different node', function () {
      beforeEach(function () {
        anotherNode.appendChild(light1);
      });

      it('should reset parentNode', function () {
        expect(light1.parentNode).to.equal(anotherNode);
      });

      it('should reset assignedSlot', function () {
        expect(anotherNode.assignedSlot).to.equal(null);
      });
    });
  });

  describe('when text nodes are projected to a different spot than element nodes', function () {
    let host, light1, light2, root, namedSlot, unnamedSlot, text;

    beforeEach(function () {
      namedSlot = create('slot', {name: 'mySlot'});
      unnamedSlot = create('slot');
      host = create('div');
      root = host.attachShadow({ mode: 'open' });

      root.appendChild(namedSlot);
      root.appendChild(unnamedSlot);

      light1 = create('div', {slot: 'mySlot'});
      light2 = create('div', {slot: 'mySlot'});
      text = document.createTextNode('text');

      host.appendChild(light1);
      host.appendChild(text);
      host.appendChild(light2);
    });

    it('should polyfill previousSibling of textNode', function () {
      expect(text.previousSibling).to.equal(light1);
    });

    it('should polyfill nextSibling of textNode', function () {
      expect(text.nextSibling).to.equal(light2);
    });

    it('should NOT polyfill textContent of textNode', function () {
      expect(text.textContent).to.equal('text');
      expect(Object.getPrototypeOf(text).hasOwnProperty('textContent')).to.be.false;
      expect(Object.getPrototypeOf(text).hasOwnProperty('__textContent')).to.be.false;
    });
  });
});
