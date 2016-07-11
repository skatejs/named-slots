describe('DocumentFragment', () => {
  it('should report the correct parent node for nested nodes', () => {
    const frag = document.createDocumentFragment();
    const elem = document.createElement('div');
    frag.appendChild(elem);
    expect(elem.parentNode).to.equal(frag);
  });
});
