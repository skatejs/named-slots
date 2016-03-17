import getSlot from '../../../src/internal/get-slot';

function create (name, attrs = {}, chren = []) {
  const elem = document.createElement(name);
  const attrsIsChren = Array.isArray(attrs);
  chren = attrsIsChren ? attrs : chren;
  attrs = attrsIsChren ? {} : attrs;
  Object.keys(attrs).forEach(key => elem.setAttribute(key, attrs[key]));
  chren.forEach(ch => elem.appendChild(ch));
  return elem;
}

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
