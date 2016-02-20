import mapPatch from './internal/map-patch';

// Returns whether or not the specified element has been polyfilled.
export default function (elem) {
  return mapPatch.get(elem);
}
