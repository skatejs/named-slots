import * as data from '../../src/slot/data';
import * as content from '../../src/slot/content';
import create from '../lib/create';
import polyfill from '../../src/slot/polyfill';

describe('fallback-content', function () {
  let slot;

  beforeEach(function () {
    slot = create('slot');
    polyfill(slot);
  });

  describe('without fallback content', function () {
    it('should have no fallback nodes', function () {
      expect(data.fallbackNodes.get(slot).childNodes.length).to.equal(0);
      expect(slot.childNodes.length).to.equal(0);
    });

    it('should have no assigned nodes', function () {
      expect(data.assignedNodes.get(slot).childNodes.length).to.equal(0);
      expect(slot.getAssignedNodes().childNodes.length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(data.fallbackState.get(slot)).to.equal(true);
    });
  });

  describe('with fallback content', function () {
    let fallback;

    beforeEach(function () {
      fallback = create('div');
      slot.appendChild(fallback);
    });

    it('should have fallback nodes', function () {
      const fallbackNodes = data.fallbackNodes.get(slot).childNodes;
      expect(fallbackNodes.length).to.equal(1);
      expect(fallbackNodes[0]).to.equal(fallback);
    });

    it('should have no assigned nodes', function () {
      expect(data.assignedNodes.get(slot).childNodes.length).to.equal(0);
      expect(slot.getAssignedNodes().childNodes.length).to.equal(0);
    });

    it('should be in a fallback state', function () {
      expect(data.fallbackState.get(slot)).to.equal(true);
    });

    describe('when assigned nodes', function () {
      let newNode;

      beforeEach(function () {
        newNode = create('div');
        content.appendChild(slot, newNode);
      });

      it('should contain assigned nodes', function () {
        expect(slot.getAssignedNodes().childNodes[0]).to.equal(newNode);
      });

      it('should not be in a fallback state', function () {
        expect(data.fallbackState.get(slot)).to.equal(false);
      });

      describe('are removed', function () {
        beforeEach(function () {
          content.removeChild(slot, newNode);
        });

        it('should not contain the assigned nodes', function () {
          expect(slot.getAssignedNodes().childNodes.length).to.equal(0);
        });

        it('should return to a fallback state', function () {
          expect(data.fallbackState.get(slot)).to.equal(true);
        });
      });
    });
  });
});
