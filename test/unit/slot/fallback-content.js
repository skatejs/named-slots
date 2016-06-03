import create from '../../lib/create';

describe('fallback-content', function () {
  let host, root, slot;

  beforeEach(function () {
    host = create('div');
    root = host.attachShadow({ mode: 'open' });
    slot = create('slot');
    root.appendChild(slot);
  });

  describe('without fallback content', function () {
    it('should have no fallback nodes', function () {
      expect(slot.childNodes.length).to.equal(0);
      expect(slot.childNodes.length).to.equal(0);
    });

    it('should have no assigned nodes', function () {
      expect(slot.____assignedNodes.length).to.equal(0);
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(slot.____isInFallbackMode).to.equal(true);
    });
  });

  describe('with fallback content', function () {
    let fallback;

    beforeEach(function () {
      fallback = create('div');
      slot.appendChild(fallback);
    });

    it('should have fallback nodes', function () {
      expect(slot.childNodes.length).to.equal(1);
      expect(slot.childNodes[0]).to.equal(fallback);
    });

    it('should have no assigned nodes', function () {
      expect(slot.____assignedNodes.length).to.equal(0);
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(slot.____isInFallbackMode).to.equal(true);
    });

    describe('when assigned nodes', function () {
      let newNode;

      beforeEach(function () {
        newNode = create('div');
        host.appendChild(newNode);
      });

      it('should contain assigned nodes', function () {
        expect(slot.assignedNodes()[0]).to.equal(newNode);
      });

      it('should not be in a fallback state', function () {
        expect(slot.____isInFallbackMode).to.equal(false);
      });

      describe('are removed', function () {
        beforeEach(function () {
          host.removeChild(newNode);
        });

        it('should not contain the assigned nodes', function () {
          expect(slot.assignedNodes().length).to.equal(0);
        });

        it('should return to a fallback state', function () {
          expect(slot.____isInFallbackMode).to.equal(true);
        });
      });
    });
  });

  describe('with slot/fallback content assigned by innerHTML', function () {
    let fallback;

    beforeEach(function () {
      root.innerHTML = "<slot><div></div></slot>"
      slot = root.firstChild
    });

    it('should have fallback nodes', function () {
      expect(slot.childNodes.length).to.equal(1);
      expect(slot.childNodes[0]).to.equal(fallback);
    });

    it('should have no assigned nodes', function () {
      expect(slot.____assignedNodes.length).to.equal(0);
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(slot.____isInFallbackMode).to.equal(true);
    });

    describe('when assigned nodes', function () {
      let newNode;

      beforeEach(function () {
        newNode = create('div');
        host.appendChild(newNode);
      });

      it('should contain assigned nodes', function () {
        expect(slot.assignedNodes()[0]).to.equal(newNode);
      });

      it('should not be in a fallback state', function () {
        expect(slot.____isInFallbackMode).to.equal(false);
      });

      describe('are removed', function () {
        beforeEach(function () {
          host.removeChild(newNode);
        });

        it('should not contain the assigned nodes', function () {
          expect(slot.assignedNodes().length).to.equal(0);
        });

        it('should return to a fallback state', function () {
          expect(slot.____isInFallbackMode).to.equal(true);
        });
      });
    });
  });
});
