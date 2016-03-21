import create from '../lib/create';
import polyfill from '../../src/polyfill';

function createHost (attrs, chren) {
  return polyfill(create('div', attrs, chren));
}

describe('slotchange-event', function () {
  let host, slot;

  beforeEach(function () {
    slot = create('slot', { emit: '' });
    host = createHost([slot]);
    polyfill(host);
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
