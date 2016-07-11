import create from '../../lib/create';

describe('slotchange-event', () => {
  let host;
  let root;
  let slot;

  beforeEach(() => {
    slot = create('slot');
    host = create('div');
    root = host.attachShadow({ mode: 'closed' });
    root.appendChild(slot);
  });

  it('should fire asynchronously', (done) => {
    const elem = create('div');

    slot.addEventListener('slotchange', () => {
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(elem);
      done();
    });

    host.appendChild(elem);
  });

  it('should fire once all synchronous dom operations are complete', (done) => {
    const elem1 = create('div');
    const elem2 = create('div');

    slot.addEventListener('slotchange', () => {
      expect(host.childNodes.length).to.equal(2);
      expect(host.childNodes[0]).to.equal(elem1);
      expect(host.childNodes[1]).to.equal(elem2);
      done();
    });

    host.appendChild(elem1);
    host.appendChild(elem2);
  });
});
