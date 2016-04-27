/**
 * Technically attributes may appear in any order, so we test only for the exclusive presence, rather than the order.
 * @param {element} el the element to test
 * @param {string[]} attrs an array of attributes to check the exclusive presence of
 * @returns {boolean} whether all attributes are present, but no others are.
 */
export default function hasAllAttributes(el, attrs) {
  const exactNumber = el.attributes.length === attrs.length;
  let hasAttrs = true;
  attrs.forEach(function (attr) {
    hasAttrs = hasAttrs && el.hasAttribute(attr);
  });

  return exactNumber && hasAttrs;
}
