import polyfill from './polyfill';

// Incremented so that we can have a unique id for the shadow root.
let shadowId = 0;

// Returns a document fragment of the childNodes of the specified element. Due
// to the nature of the DOM, this will remove the nodes from the element.
function createFragmentFromChildNodes (elem) {
  const frag = document.createDocumentFragment();
  while (elem.hasChildNodes()) {
    frag.appendChild(elem.firstChild);
  }
  return frag;
}

// Creates an shadow root, appends it to the element and returns it.
function createShadowRoot (elem) {
  const root = document.createElement(isBlockLevel(elem) ? 'div' : 'span');
  elem.appendChild(root);
  return root;
}

// Returns whether or not the specified element is a block level element or not
// We need this to determine the type of element the shadow root should be
// since we must use real nodes to simulate a shadow root.
function isBlockLevel (elem) {
  return window.getComputedStyle(elem).display === 'block';
}

// Simple renderer that proxies another renderer. It will polyfill if not yet
// polyfilled, or simply run the renderer. Initial content is taken into
// consideration.
const defaults = { shadowId: '' };
export default function (fn, opts = defaults) {
  return function (elem) {
    let shadowRoot = elem.__shadowRoot;

    if (shadowRoot) {
      fn(elem, shadowRoot);
    } else {
      // We get a fragment of the initial DOM so that we can create the shadow
      // root.
      const initialLightDom = createFragmentFromChildNodes(elem);

      // Create a shadow ID so that it can be used to get a slot that is unique
      // to this shadow root. Since we don't polyfill querySelector() et al, we
      // need a way to be able to refer to slots that are unique to this
      // shadow root.
      elem.__shadowId = opts.shadowId;

      // Create the shadow root and return the light DOM. We must get the light
      // DOM before we template it so that we can distribute it after
      // polyfilling.
      elem.__shadowRoot = createShadowRoot(elem);

      // Render once we have the initial light DOM as this would likely blow
      // that away.
      fn(elem, elem.__shadowRoot);

      // Now polyfill so that we can distribute after.
      polyfill(elem);

      // Distribute the initial light DOM after polyfill so they get put into
      // the right spots.
      elem.appendChild(initialLightDom);
    }
  };
}
