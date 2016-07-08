import '../../../src/index';
import create from '../../lib/create';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('shadow/polyfill', function () {
  const invalidModeMessage = 'You must specify { mode } as "open" or "closed" to attachShadow().';

  it('mode: [not specified]', function () {
    const host = create('div');
    expect(host.attachShadow.bind(host)).to.throw(invalidModeMessage);
  });

  it('mode: [invalid value (not "open" or "closed")]', function () {
    const host = create('div');
    expect(host.attachShadow.bind(host, { mode: 'invalid' })).to.throw(invalidModeMessage);
  });

  it('mode: "open"', function () {
    const host = create('div');
    const root = host.attachShadow({ mode: 'open' });
    expect(host.shadowRoot).to.equal(root);
  });

  it('mode: "closed"', function () {
    const host = create('div');
    host.attachShadow({ mode: 'closed' });
    expect(host.shadowRoot).to.equal(null);
  });

  it('polyfillShadowRootTagName: [default="_shadow_root_"]', function () {
    const host = create('div');
    const root = host.attachShadow({ mode: 'open' });
    expect(root.tagName).to.equal('_SHADOW_ROOT_');
  });

  it('polyfillShadowRootTagName: "test-ing"', function () {
    const host = create('div');
    const root = host.attachShadow({ mode: 'open', polyfillShadowRootTagName: 'test-ing' });
    expect(root.tagName).to.equal('TEST-ING');
  });

  if (canPatchNativeAccessors) {
    it('proper node removal', function () {
      const host = create('div');
      host.appendChild(create('div'));
      host.appendChild(create('div'));
      host.appendChild(create('div'));
      host.appendChild(create('div'));
      host.attachShadow({ mode: 'open' });

      expect(host.__childNodes.length).to.equal(1);
      expect(host.__childNodes[0].tagName).to.equal('_SHADOW_ROOT_');
    });
  }

  it('polyfilled properties with value should be writable', function() {
    let elem = create('div');

    expect(elem.removeEventListener).not.to.equal('');
    elem.removeEventListener = '';
    expect(elem.removeEventListener).to.equal('');
  });

  describe('setup order', function () {
    it('host -> shadow root -> light dom', function () {
      const light1 = create('div', { slot: 'light1' });
      const light2 = create('div', { slot: 'light2' });
      const slot1 = create('slot', { name: 'light1' });
      const slot2 = create('slot', { name: 'light2' });
      const host = create('div');
      const root = host.attachShadow({ mode: 'closed' });

      root.appendChild(slot1);
      root.appendChild(slot2);
      host.appendChild(light1);
      host.appendChild(light2);

      expect(slot1.assignedNodes().length).to.equal(1);
      expect(slot1.assignedNodes()[0]).to.equal(light1);
      expect(slot2.assignedNodes().length).to.equal(1);
      expect(slot2.assignedNodes()[0]).to.equal(light2);
    });

    it('host -> light dom -> shadow root', function () {
      const light1 = create('div', { slot: 'light1' });
      const light2 = create('div', { slot: 'light2' });
      const slot1 = create('slot', { name: 'light1' });
      const slot2 = create('slot', { name: 'light2' });
      const host = create('div', [light1, light2]);
      const root = host.attachShadow({ mode: 'open' });

      // Child nodes should be in the host even if there's no slots.
      expect(host.childNodes.length).to.equal(2);
      expect(host.childNodes[0]).to.equal(light1);
      expect(host.childNodes[1]).to.equal(light2);

      // Ensure there's no slots.
      expect(root.childNodes.length).to.equal(0);

      // After adding a slot, we should see it distributed.
      root.appendChild(slot1);
      expect(slot1.assignedNodes().length).to.equal(1);
      expect(slot1.assignedNodes()[0]).to.equal(light1);

      // After removing we should not.
      root.appendChild(slot2);
      expect(slot2.assignedNodes().length).to.equal(1);
      expect(slot2.assignedNodes()[0]).to.equal(light2);

      // After removing we should not have any assigned nodes.
      root.removeChild(slot1);
      root.removeChild(slot2);
      expect(slot1.assignedNodes().length).to.equal(0);
      expect(slot2.assignedNodes().length).to.equal(0);
    });
  });
});
