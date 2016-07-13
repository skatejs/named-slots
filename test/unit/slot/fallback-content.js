import create from '../../lib/create';

describe('fallback-content', () => {
  let host;
  let root;
  let slot;
  let fallback;

  beforeEach(() => {
    host = create('div');
    root = host.attachShadow({ mode: 'open' });
    slot = create('slot');
    root.appendChild(slot);
  });

  function testFallbackContent() {
    it('should have fallback nodes', () => {
      expect(slot.childNodes.length).to.equal(1);
      expect(slot.childNodes[0]).to.equal(fallback);
    });

    it('should have no assigned nodes', () => {
      expect(slot.____assignedNodes.length).to.equal(0);
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', () => {
      expect(slot.____isInFallbackMode).to.equal(true);
    });

    describe('when assigned nodes', () => {
      let newNode;

      beforeEach(() => {
        newNode = create('div');
        host.appendChild(newNode);
      });

      it('should contain assigned nodes', () => {
        expect(slot.assignedNodes()[0]).to.equal(newNode);
      });

      it('should not be in a fallback state', () => {
        expect(slot.____isInFallbackMode).to.equal(false);
      });

      describe('are removed', () => {
        beforeEach(() => {
          host.removeChild(newNode);
        });

        it('should not contain the assigned nodes', () => {
          expect(slot.assignedNodes().length).to.equal(0);
        });

        it('should return to a fallback state', () => {
          expect(slot.____isInFallbackMode).to.equal(true);
        });
      });
    });
  }

  describe('without fallback content', () => {
    it('should have no fallback nodes', () => {
      expect(slot.childNodes.length).to.equal(0);
      expect(slot.childNodes.length).to.equal(0);
    });

    it('should have no assigned nodes', () => {
      expect(slot.____assignedNodes.length).to.equal(0);
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', () => {
      expect(slot.____isInFallbackMode).to.equal(true);
    });
  });

  describe('with fallback content', () => {
    beforeEach(() => {
      fallback = create('div');
      slot.appendChild(fallback);
    });

    testFallbackContent();
  });

  describe('with slot/fallback content assigned by innerHTML', () => {
    beforeEach(() => {
      root.innerHTML = '<slot><div></div></slot>';
      slot = root.firstChild;
      fallback = slot.firstChild;
    });

    testFallbackContent();
  });

  describe('with slot deeper into the tree', () => {
    beforeEach(() => {
      root.innerHTML = '<div><slot><div></div></slot></div>';
      slot = root.firstChild.firstChild;
      fallback = slot.firstChild;
    });

    testFallbackContent();
  });
});
