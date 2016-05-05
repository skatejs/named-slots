import '../../../src/index';
import create from '../lib/create';

describe('slot/distribution', function () {
  let slot;
  let host;
  let root;
  let parent;

  beforeEach(function () {
    host = document.createElement('div');
    root = host.attachShadow({ mode: 'closed' });
    parent = create('div');
    slot = create('slot');

    root.appendChild(parent);
    parent.appendChild(slot);
  });

  it('distributes to the inner slot', function () {
    const light = document.createElement('light');

    host.appendChild(light);
    expect(host.childNodes[0]).to.equal(light, 'internal light dom');

    expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
    expect(slot.getAssignedNodes()[0]).to.equal(light, 'slot');
  });

});
