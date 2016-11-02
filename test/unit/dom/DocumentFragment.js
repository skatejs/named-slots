/* eslint-env jasmine, mocha */

import create from '../../lib/create';

describe('DocumentFragment', () => {
  it('should report the correct parent node for nested nodes', () => {
    const frag = document.createDocumentFragment();
    const elem = create();
    frag.appendChild(elem);
    expect(elem.parentNode).to.equal(frag);
  });

  it('should remove child elements when appending a document fragment', () => {
    const div1 = create();
    const div2 = create();

    const frag = document.createDocumentFragment();
    frag.appendChild(div1);
    frag.appendChild(div2);

    const elem = create();
    elem.appendChild(frag);
    expect(frag.childNodes.length).to.equal(0);
  });

  it('should correctly report the host node of children that are reparented', () => {
    const frag = document.createDocumentFragment();
    const ch1 = create();
    const ch2 = create();
    const ch3 = create();
    const target = create();

    frag.appendChild(ch1);
    frag.appendChild(ch2);
    frag.appendChild(ch3);

    target.appendChild(frag);

    // Make sure that lengths are in sync between the source and target.
    expect(frag.children.length).to.equal(0);
    expect(target.children.length).to.equal(3);

    // We ensure we're reporting the correct parent.
    expect(ch1.parentNode).to.equal(target);
    expect(ch2.parentNode).to.equal(target);
    expect(ch3.parentNode).to.equal(target);

    // It should also not error when removed. This is how the original problem
    // presented itself. Theoretically this is ensured by checking the
    // parentNode above, but it's probably good to have a sanity check here to
    // ensure it's cleaned up.
    ch1.parentNode.removeChild(ch1);
    ch2.parentNode.removeChild(ch2);
    ch3.parentNode.removeChild(ch3);
    expect(ch1.parentNode).to.equal(null);
    expect(ch2.parentNode).to.equal(null);
    expect(ch3.parentNode).to.equal(null);
  });
});
