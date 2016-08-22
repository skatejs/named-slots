import '../../../src/index';
import create from '../../lib/create';

describe('light/polyfill', () => {
  let host;
  let light1;
  let light2;
  let root;
  let slot;
  let text;

  describe('when mode is closed', () => {
    beforeEach(() => {
      slot = create('slot');
      host = create('div');
      root = host.attachShadow({ mode: 'closed' });

      root.appendChild(slot);

      light1 = create('light1');

      host.appendChild(light1);
    });

    it('assignedSlot', () => {
      expect(light1.assignedSlot).to.equal(null);
    });
  });

  beforeEach(() => {
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

  it('assignedSlot', () => {
    expect(light1.assignedSlot).to.equal(slot);
  });

  it('parentElement', () => {
    expect(light1.parentElement).to.equal(host);
  });

  it('parentNode', () => {
    expect(light1.parentNode).to.equal(host);
  });

  it('nextSibling', () => {
    expect(light1.nextSibling).to.equal(text);
  });

  it('nextElementSibling', () => {
    expect(light1.nextElementSibling).to.equal(light2);
  });

  it('previousSibling', () => {
    expect(light2.previousSibling).to.equal(text);
  });

  it('previousElementSibling', () => {
    expect(light2.previousElementSibling).to.equal(light1);
  });

  describe('when removed', () => {
    let anotherHost;
    let anotherNode;
    let anotherRoot;
    let anotherSlot;

    beforeEach(() => {
      anotherHost = create('div');
      anotherNode = create('div');
      anotherRoot = anotherHost.attachShadow({ mode: 'open' });
      anotherSlot = create('slot');

      anotherRoot.appendChild(anotherSlot);
      host.removeChild(light1);
    });

    it('should null parentNode', () => {
      expect(light1.parentNode).to.equal(null);
    });

    it('should null assignedSlot', () => {
      expect(light1.assignedSlot).to.equal(null);
    });

    describe('and reparented to the same host', () => {
      beforeEach(() => {
        host.appendChild(light1);
      });

      it('should reset parentNode', () => {
        expect(light1.parentNode).to.equal(host);
      });

      it('should keep assignedSlot null', () => {
        expect(light1.assignedSlot).to.equal(slot);
      });
    });

    describe('and reparented to a different host', () => {
      beforeEach(() => {
        anotherHost.appendChild(light1);
      });

      it('should reset parentNode', () => {
        expect(light1.parentNode).to.equal(anotherHost);
      });

      it('should keep assignedSlot null', () => {
        expect(light1.assignedSlot).to.equal(anotherSlot);
      });
    });

    describe('and reparented to a different node', () => {
      beforeEach(() => {
        anotherNode.appendChild(light1);
      });

      it('should reset parentNode', () => {
        expect(light1.parentNode).to.equal(anotherNode);
      });

      it('should keep assignedSlot null', () => {
        expect(light1.assignedSlot).to.equal(null);
      });
    });
  });

  describe('when directly reparented', () => {
    let anotherHost;
    let anotherNode;
    let anotherRoot;
    let anotherSlot;

    beforeEach(() => {
      anotherHost = create('div');
      anotherNode = create('div');
      anotherRoot = anotherHost.attachShadow({ mode: 'open' });
      anotherSlot = create('slot');

      anotherRoot.appendChild(anotherSlot);
    });

    describe('to the same host', () => {
      beforeEach(() => {
        host.appendChild(light1);
      });

      it('should reset parentNode', () => {
        expect(light1.parentNode).to.equal(host);
      });

      it('should reset assignedSlot', () => {
        expect(light1.assignedSlot).to.equal(slot);
      });
    });

    describe('to a different host', () => {
      beforeEach(() => {
        anotherHost.appendChild(light1);
      });

      it('should reset parentNode', () => {
        expect(light1.parentNode).to.equal(anotherHost);
      });

      it('should reset assignedSlot', () => {
        expect(light1.assignedSlot).to.equal(anotherSlot);
      });
    });

    describe('to a different node', () => {
      beforeEach(() => {
        anotherNode.appendChild(light1);
      });

      it('should reset parentNode', () => {
        expect(light1.parentNode).to.equal(anotherNode);
      });

      it('should reset assignedSlot', () => {
        expect(anotherNode.assignedSlot).to.equal(null);
      });
    });
  });

  describe('when text nodes are projected to a different spot than element nodes', () => {
    let hostLocal;
    let light1Local;
    let light2Local;
    let rootLocal;
    let namedSlot;
    let unnamedSlot;
    let textLocal;

    beforeEach(() => {
      namedSlot = create('slot', { name: 'mySlot' });
      unnamedSlot = create('slot');
      hostLocal = create('div');
      rootLocal = hostLocal.attachShadow({ mode: 'open' });

      rootLocal.appendChild(namedSlot);
      rootLocal.appendChild(unnamedSlot);

      light1Local = create('div', { slot: 'mySlot' });
      light2Local = create('div', { slot: 'mySlot' });
      textLocal = document.createTextNode('text');

      hostLocal.appendChild(light1Local);
      hostLocal.appendChild(textLocal);
      hostLocal.appendChild(light2Local);
    });

    it('should polyfill previousSibling of textNode', () => {
      expect(textLocal.previousSibling).to.equal(light1Local);
    });

    it('should polyfill nextSibling of textNode', () => {
      expect(textLocal.nextSibling).to.equal(light2Local);
    });

    it('should NOT polyfill textContent of textNode', () => {
      expect(textLocal.textContent).to.equal('text');
      expect(Object.getPrototypeOf(textLocal).hasOwnProperty('textContent')).to.equal(false); // eslint-disable-line no-prototype-builtins
      expect(Object.getPrototypeOf(textLocal).hasOwnProperty('__textContent')).to.equal(false); // eslint-disable-line no-prototype-builtins
    });
  });
});
