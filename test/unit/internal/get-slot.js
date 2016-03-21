import create from '../../lib/create';
import getSlot from '../../../src/internal/get-slot';

describe('internal/get-slot', function () {
  it('returns a <slot>', function () {
    const slot = create('slot');
    const host = create('div', [slot]);
    expect(getSlot(host, create('div'))).to.equal(slot);
    expect(getSlot(host, create('div', { slot: '' }))).to.equal(slot);
    expect(getSlot(host, create('div', { slot: 'my-slot' }))).to.equal(null);
  });

  it('returns a <slot name="">', function () {
    const slot = create('slot', { name: '' });
    const host = create('div', [slot]);
    expect(getSlot(host, create('div'))).to.equal(slot);
    expect(getSlot(host, create('div', { slot: '' }))).to.equal(slot);
    expect(getSlot(host, create('div', { slot: 'my-slot' }))).to.equal(null);
  });

  it('returns a <slot name="my-slot">', function () {
    const slot = create('slot', { name: 'my-slot' });
    const host = create('div', [slot]);
    expect(getSlot(host, create('div'))).to.equal(null);
    expect(getSlot(host, create('div', { slot: '' }))).to.equal(null);
    expect(getSlot(host, create('div', { slot: 'my-slot' }))).to.equal(slot);
  });
});
