// Any code referring to this is because it has to work around this bug in
// WebKit: https://bugs.webkit.org/show_bug.cgi?id=49739

import getPropertyDescriptor from './get-property-descriptor';

const nativeParentNode = getPropertyDescriptor(Node.prototype, 'parentNode');

export default !!nativeParentNode;
