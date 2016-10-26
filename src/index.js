// TODO move into the skatejs-web-components package.
import 'custom-event-polyfill';
import { shadowDomV1 } from './util/support';
import v1 from './v1';

if (shadowDomV1) {
  // then we should probably not be loading this
} else {
  v1();
}

export { v1 }; // eslint-disable-line import/prefer-default-export
