import version from '../src/version';
import '../src/index';

describe('skatejs-named-slots', function () {
  it('version', function () {
    expect(version).to.be.a('string');
  });
});

// import './unit/dom/dom';
import './unit/dom/appendChild';
import './unit/dom/childElementCount';
import './unit/dom/childNodes';
import './unit/dom/children';
import './unit/dom/DocumentFragment';
import './unit/dom/firstChild';
import './unit/dom/firstElementChild';
import './unit/dom/hasChildNodes';
import './unit/dom/innerHTML';
import './unit/dom/insertBefore';
import './unit/dom/lastChild';
import './unit/dom/lastElementChild';
import './unit/dom/outerHTML';
import './unit/dom/textContent';
import './unit/dom/removeChild';
import './unit/dom/replaceChild';
import './unit/dom/SVGElement';

//
// import './unit/light/polyfill';
// import './unit/shadow/polyfill';
// import './unit/slot/change-event.js';
// import './unit/slot/distribution';
// import './unit/slot/fallback-content';
// import './unit/slot/polyfill';
// import './unit/util/find-slots';
// import './unit/webcomponents/initialisation';
