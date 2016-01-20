# named-slots

A polygap (partial polyfill) for the Shadow DOM Named Slot API.

Working example: http://jsbin.com/weboki/31/edit?js,output

## Why

- You want to expose a named-slot style API to your web component consumers
- You don't want to resort to massive, or outdated polyfills
- You don't want to wait for browser adoption
- You don't need allthefuckingthings in the [Shadow DOM spec](http://w3c.github.io/webcomponents/spec/shadow/)

## Support

The following lists are an exhaustive representation of what this polygap supports and why from the following interfaces:

- [ChildNode](https://developer.mozilla.org/en/docs/Web/API/ChildNode)
- [Element](https://developer.mozilla.org/en/docs/Web/API/Element)
- [EventTarget](https://developer.mozilla.org/en/docs/Web/API/EventTarget)
- [Node](https://developer.mozilla.org/en/docs/Web/API/Node)
- [NonDocumentTypeChildNode](https://developer.mozilla.org/en/docs/Web/API/NonDocumentTypeChildNode)
- [ParentNode](https://developer.mozilla.org/en/docs/Web/API/ParentNode)

Note:

- Prototypes that get more specific than that are not polyfilled. These include `HTMLElement` and anything more specific.
- All members which are not standardised or are listed as experimental are not included in these lists.
- Members are only polyfilled on the specific web component unless otherwise noted.
- Members must be overridden on the instance rather than prototype because WebKit as a bug that prevents correct descritpors from being returned using `Object.getOwnPropertyDescriptors()` See https://bugs.webkit.org/show_bug.cgi?id=49739 for more info. We'd need to be able to bypass the overrides. This does have performance implications and we'll be gathering data on that soon.



## Polyfilled

These are members which are already polyfilled.

### Properties

#### Element

- `Element.innerHTML`

#### Node

- `Node.childNodes`
- `Node.firstChild`
- `Node.lastChild`
- `Node.textContent`

#### ParentNode

- `ParentNode.children`

### Methods

#### Node

- `Node.appendChild()`
- `Node.hasChildNodes()`
- `Node.insertBefore()`
- `Node.removeChild()`
- `Node.replaceChild()`



## Probably

These are members which are not yet polyfilled but are planned to be.

### Properties

#### ParentNode

- `ParentNode.childElementCount`
- `ParentNode.firstElementChild`
- `ParentNode.lastElementChild`



## Maybe

These are members which are not yet polyfilled but are up for discussion.

### Properties

#### Element

- `Element.id`

#### NonDocumentTypeChildNode

- `NonDocumentTypeChildNode.nextElementSibling`
- `NonDocumentTypeChildNode.previousElementSibling`

#### Node

- `Node.nodeValue`
- `Node.nextSibling`
- `Node.nodeValue`
- `Node.parentNode`
- `Node.parentElement`
- `Node.previousSibling`

### Methods

#### Element

- `Element.getElementsByClassName()`
- `Element.getElementsByTagName()`
- `Element.getElementsByTagNameNS()`

#### Node

- `Node.cloneNode()`
- `Node.compareDocumentPosition()`
- `Node.contains()`
- `Node.normalize()`



## Unlikely

These are members which are not polyfilled and probably never will be.

### Properties

#### Element

- `Element.accessKey`
- `Element.attributes`
- `Element.classList`
- `Element.className`
- `Element.namespaceURI`
- `Element.tagName`

#### Node

- `Node.baseURI`
- `Node.nodeName`
- `Node.nodeType`
- `Node.ownerDocument`

### Methods

#### Element

- `Element.getAttribute()`
- `Element.getAttributeNS()`
- `Element.getBoundingClientRect()`
- `Element.getClientRects()`
- `Element.hasAttribute()`
- `Element.hasAttributeNS()`
- `Element.hasAttributes()`
- `Element.querySelector()`
- `Element.querySelectorAll()`
- `Element.releasePointerCapture()`
- `Element.removeAttribute()`
- `Element.removeAttributeNS()`
- `Element.setAttribute()`
- `Element.setAttributeNS()`
- `Element.setPointerCapture()`

#### EventTarget

- `EventTarget.addEventListener()`
- `EventTarget.dispatchEvent()`
- `EventTarget.removeEventListener()`

#### Node

- `Node.isDefaultNamespace()`
- `Node.isEqualNode()`
- `Node.lookupNamespaceURI()`
- `Node.lookupPrefix()`
