import create from '../lib/create';

describe('slotchange-event', function () {
  let host, root, slot;

  beforeEach(function () {
    slot = create('slot');
    host = create('div');
    root = host.attachShadow({ mode: 'closed' });
    root.appendChild(slot);
  });

  it('should fire asynchronously', function (done) {
    const elem = create('div');

    slot.addEventListener('slotchange', function () {
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(elem);
      done();
    });

    host.appendChild(elem);
  });

  it('should fire once all synchronous dom operations are complete', function (done) {
    const elem1 = create('div');
    const elem2 = create('div');

    slot.addEventListener('slotchange', function () {
      expect(host.childNodes.length).to.equal(2);
      expect(host.childNodes[0]).to.equal(elem1);
      expect(host.childNodes[1]).to.equal(elem2);
      done();
    });

    host.appendChild(elem1);
    host.appendChild(elem2);
  });
});
