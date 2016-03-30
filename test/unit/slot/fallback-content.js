import { assignedNodes, fallbackNodes, fallbackState } from '../../src/slot/data';
import create from '../lib/create';
import polyfill from '../../src/shadow/polyfill';

describe('fallback-content', function () {
  let host, root, slot;

  beforeEach(function () {
    host = create('div');
    root = polyfill(host);
    slot = create('slot');
    root.appendChild(slot);
  });

  describe('without fallback content', function () {
    it('should have no fallback nodes', function () {
      expect(fallbackNodes.get(slot).length).to.equal(0);
      expect(slot.childNodes.length).to.equal(0);
    });

    it('should have no assigned nodes', function () {
      expect(assignedNodes.get(slot).length).to.equal(0);
      expect(slot.getAssignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(fallbackState.get(slot)).to.equal(true);
    });
  });

  describe('with fallback content', function () {
    let fallback;

    beforeEach(function () {
      fallback = create('div');
      slot.appendChild(fallback);
    });

    it('should have fallback nodes', function () {
      const fb = fallbackNodes.get(slot);
      expect(fb.length).to.equal(1);
      expect(fb[0]).to.equal(fallback);
    });

    it('should have no assigned nodes', function () {
      expect(assignedNodes.get(slot).length).to.equal(0);
      expect(slot.getAssignedNodes().length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(fallbackState.get(slot)).to.equal(true);
    });

    describe('when assigned nodes', function () {
      let newNode;

      beforeEach(function () {
        newNode = create('div');
        host.appendChild(newNode);
      });

      it('should contain assigned nodes', function () {
        expect(slot.getAssignedNodes()[0]).to.equal(newNode);
      });

      it('should not be in a fallback state', function () {
        expect(fallbackState.get(slot)).to.equal(false);
      });

      describe('are removed', function () {
        beforeEach(function () {
          host.removeChild(newNode);
        });

        it('should not contain the assigned nodes', function () {
          expect(slot.getAssignedNodes().length).to.equal(0);
        });

        it('should return to a fallback state', function () {
          expect(fallbackState.get(slot)).to.equal(true);
        });
      });
    });
  });
});
