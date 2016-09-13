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

  it('different combinations of slots, roots and nodes', () => {
    const host = document.createElement('div');
    host.innerHTML = '<div></div><div></div><div></div>';
    expect(findSlots(host).length).to.equal(0);

    const root1 = host.childNodes[1].attachShadow({ mode: 'open' });
    root1.innerHTML = '<div></div><slot></slot><div></div>';
    expect(findSlots(host).length).to.equal(0);
    expect(findSlots(root1).length).to.equal(1);
    expect(!findSlots(root1)[0].name).to.equal(true);

    root1.innerHTML = '<div></div><slot></slot><div></div><div><slot name="name1"></slot></div><slot name="name2"></slot>';
    expect(findSlots(host).length).to.equal(0);
    expect(findSlots(root1).length).to.equal(3);
    expect(!findSlots(root1)[0].name).to.equal(true);
    expect(findSlots(root1)[1].name).to.equal('name1');
    expect(findSlots(root1)[2].name).to.equal('name2');

    const root2 = root1.childNodes[2].attachShadow({ mode: 'open' });
    root2.innerHTML = '<div></div><slot></slot><div></div><div><slot name="name3"></slot></div><slot name="name4"></slot>';

    expect(findSlots(host).length).to.equal(0);
    expect(findSlots(root1).length).to.equal(3);
    expect(!findSlots(root1)[0].name).to.equal(true);
    expect(findSlots(root1)[1].name).to.equal('name1');
    expect(findSlots(root1)[2].name).to.equal('name2');

    expect(findSlots(root2).length).to.equal(3);
    expect(!findSlots(root2)[0].name).to.equal(true);
    expect(findSlots(root2)[1].name).to.equal('name3');
    expect(findSlots(root2)[2].name).to.equal('name4');
  });
});
