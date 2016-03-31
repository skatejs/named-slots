// Any code referring to this is because it has to work around this bug in
// WebKit: https://bugs.webkit.org/show_bug.cgi?id=49739
export default !!Object.getOwnPropertyDescriptor(window.Node.prototype, 'parentNode').get;
