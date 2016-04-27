import version from '../src/version';

describe('skatejs-named-slots', function () {
  it('version', function () {
    expect(version).to.be.a('string');
  });
});

import './unit/dom/dom';
import './unit/light/polyfill';
import './unit/shadow/polyfill';
import './unit/slot/change-event.js';
import './unit/slot/distribution';
import './unit/slot/fallback-content';
import './unit/slot/polyfill';
import './unit/webcomponents/initialisation';
