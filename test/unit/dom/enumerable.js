describe('Enumeration', () => {
  it('should enumerate over properties belonging to the prototype', () => {
    const properties = [
      'appendChild',
      'childElementCount',
      'childNodes',
      'children',
      'firstChild',
      'firstElementChild',
      'hasChildNodes',
      'innerHTML',
      'insertBefore',
      'lastChild',
      'lastElementChild',
      'outerHTML',
      'removeChild',
      'replaceChild',
      'textContent'
    ];
    const found = [];
    const div = document.createElement('div');
    for (const name in div) { // eslint-disable-line guard-for-in,no-restricted-syntax
      found.push(name);
    }
    const notFound = [];
    properties.forEach((property) => {
      if (found.indexOf(property) === -1) {
        notFound.push(property);
      }
    });
    expect(notFound.length).to.equal(0, `Properties ${notFound.join(',')} were not enumerated`);
  });
});
