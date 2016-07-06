describe('DocumentFragment', function () {
  it('should report the corect parent node for nested nodes', function () {
    const frag = document.createDocumentFragment();
    const elem = document.createElement('div');
    frag.appendChild(elem);
    expect(elem.parentNode).to.equal(frag);
  });
});
