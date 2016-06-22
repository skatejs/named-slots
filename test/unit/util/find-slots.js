import findSlots from '../../../src/util/find-slots';

describe('util/find-slots called from', () => {
  it('node: slot in node', () => {
    const host = document.createElement('div');
    const slot = document.createElement('slot');

    host.appendChild(slot);

    expect(findSlots(host).length).to.equal(1);
    expect(findSlots(host)[0]).to.equal(slot);
  });

  it('node: slot in root', () => {
    const host = document.createElement('div');
    const slot = document.createElement('slot');

    host.attachShadow({ mode: 'open' });
    host.shadowRoot.appendChild(slot);

    expect(findSlots(host).length).to.equal(0);
  });

  it('root: slot in root', () => {
    const host = document.createElement('div');
    const slot = document.createElement('slot');

    host.attachShadow({ mode: 'open' });
    host.shadowRoot.appendChild(slot);

    expect(findSlots(host.shadowRoot).length).to.equal(1);
    expect(findSlots(host.shadowRoot)[0]).to.equal(slot);
  });
});
