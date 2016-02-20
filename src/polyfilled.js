import mapPolyfilled from './internal/map-polyfilled';

// Returns whether or not the specified element has been polyfilled.
export default function (elem) {
  return mapPolyfilled.get(elem);
}
