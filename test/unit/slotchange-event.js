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

  it('should not fire if the "emit" attribute is not present', function (done) {
    const elem = create('div');
    slot.removeAttribute('emit');
    host.appendChild(elem);
    slot.addEventListener('slotchange', assert.bind(null, false));
    setTimeout(done, 10);
  });

  it('should fire asynchronously', function (done) {
    const elem = create('div');
    host.appendChild(elem);
    slot.addEventListener('slotchange', function () {
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(elem);
      done();
    });
  });

  it('should fire once all synchronous dom operations are complete', function (done) {
    const elem1 = create('div');
    const elem2 = create('div');
    host.appendChild(elem1);
    host.appendChild(elem2);
    slot.addEventListener('slotchange', function () {
      expect(host.childNodes.length).to.equal(2);
      expect(host.childNodes[0]).to.equal(elem1);
      expect(host.childNodes[1]).to.equal(elem2);
      done();
    });
  });

  it('should contain a lists of added / removed nodes', function (done) {
    const elem1 = create('elem-1');
    const elem2 = create('elem-2');
    host.appendChild(elem1);
    host.appendChild(elem2);
    host.removeChild(elem2);
    slot.addEventListener('slotchange', function (e) {
      const { addedNodes, removedNodes } = e.detail;

      expect(addedNodes).to.not.equal(null);
      expect(addedNodes.length).to.equal(2);
      expect(addedNodes[0]).to.equal(elem1);
      expect(addedNodes[1]).to.equal(elem2);

      expect(removedNodes).to.not.equal(null);
      expect(removedNodes.length).to.equal(1);
      expect(removedNodes[0]).to.equal(elem2);

      done();
    });
  });
});
