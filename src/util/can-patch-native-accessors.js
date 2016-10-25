// Any code referring to this is because it has to work around this bug in
// WebKit: https://bugs.webkit.org/show_bug.cgi?id=49739

import getPropertyDescriptor from './get-property-descriptor';

const { Element } = window;
const nativeParentNode = getPropertyDescriptor(Element.prototype, 'innerHTML');

export default !!nativeParentNode;
