/* eslint-env jasmine, mocha */

describe('DocumentFragment', () => {
  it('should report the correct parent node for nested nodes', () => {
    const frag = document.createDocumentFragment();
    const elem = document.createElement('div');
    frag.appendChild(elem);
    expect(elem.parentNode).to.equal(frag);
  });

  it('should remove child elements when appending a document fragment', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');

    const frag = document.createDocumentFragment();
    frag.appendChild(div1);
    frag.appendChild(div2);

    const elem = document.createElement('div');
    elem.appendChild(frag);
    expect(frag.childNodes.length).to.equal(0);
  });
});
