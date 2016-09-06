import { shadowDomV0, shadowDomV1 } from '../../../src/util/support';

describe('dom: createElement', () => {
  if (!shadowDomV1 && shadowDomV0) {
    it('should create a content element instead of a slot element', () => {
      const slot1 = document.createElementNS('http://www.w3.org/1999/xhtml', 'slot');
      const slot2 = document.createElement('slot');

      expect(slot1.tagName.toLowerCase()).to.equal('content');
      expect(slot2.tagName.toLowerCase()).to.equal('content');
    });
  }
});
