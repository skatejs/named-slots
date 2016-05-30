import '../../../src/index';
import create from '../../lib/create';

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

    expect(slot.assignedNodes().length).to.equal(1, 'slot');
    expect(slot.assignedNodes()[0]).to.equal(light, 'slot');

    const lightText = document.createTextNode('text');
    host.appendChild(lightText);
    expect(host.childNodes[1]).to.equal(lightText);

    expect(slot.assignedNodes().length).to.equal(2);
    expect(slot.assignedNodes()[0]).to.equal(light, 'slot');
    expect(slot.assignedNodes()[1]).to.equal(lightText);

    const lightComment = document.createComment('text');
    host.appendChild(lightComment);
    expect(host.childNodes[2]).to.equal(lightComment);

    expect(slot.assignedNodes().length).to.equal(2);
    expect(slot.assignedNodes()[0]).to.equal(light, 'slot');
    expect(slot.assignedNodes()[1]).to.equal(lightText);
  });

});
