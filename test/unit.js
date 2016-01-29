import render from '../src/render';
import version from '../src/version';

describe('skatejs-named-slots', function () {
  it('version', function () {
    expect(version).to.be.a('string');
  });
});
