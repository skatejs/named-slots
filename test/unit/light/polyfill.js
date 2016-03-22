import create from '../../lib/create';
import polyfill from '../../../src/host/polyfill';

describe('light/polyfill', function () {
  let host, light1, light2, slot, text;

  beforeEach(function () {
    slot = create('slot');
    host = create('div', [slot]);
    light1 = create('light1');
    light2 = create('light2');
    text = document.createTextNode('text');

    polyfill(host);

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
    let anotherHost, anotherNode, anotherSlot;

    beforeEach(function () {
      anotherNode = create('div');
      anotherSlot = create('slot');
      anotherHost = create('div', [anotherSlot]);

      polyfill(anotherHost);

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
});
