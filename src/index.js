// TODO move into the skatejs-web-components package.
import 'custom-event-polyfill';
import { shadowDomV0, shadowDomV1 } from './util/support';
import v0 from './v0';
import v1 from './v1';
import version from './version';

if (shadowDomV1) {
  // then we should probably not be loading this
} else if (shadowDomV0) {
  v0();
} else {
  v1();
}

export default version;
export { v0, v1 };
