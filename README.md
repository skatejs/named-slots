# named-slots

A polygap (partial polyfill) for the Shadow DOM Named Slot API using SkateJS.

Working example: http://jsbin.com/weboki/31/edit?js,output



## Why

- You want to expose a named-slot style public API to your web component consumers
- You don't want to resort to massive, or outdated polyfills
- You don't want to wait for browser adoption
- You don't need allthethings in the [Shadow DOM spec](http://w3c.github.io/webcomponents/spec/shadow/)
- You want interopaberability with React, jQuery and other libraries that don't care about your implementation details
- You want something that is performant



## How

Instead of polyfilling everything, we polyfill only the bare minimum that is required to supply the consumers of your custom elements with an API where they can distribute content to / from your element.

Your consuemrs may use it like so:

```html
<my-component id="example">
  <p>paragraph 1</p>
  <p>paragraph 2</p>
</my-component>
```

Your shadow root may be templated out like:

```html
<div class="wrapper">
  <slot />
</div>
```

Which would result in:

```html
<my-component id="example">
  <div class="wrapper">
    <p>paragraph 1</p>
    <p>paragraph 2</p>
  </div>
</my-component>
```


## Usage

To render a shadow root and distribute initial content, use the `render` function:

```js
import { render } from 'skatejs-named-slots';

const div = document.createElement('div');
const template = render(function (elem, shadowRoot) {
  shadowRoot.innerHTML = '<div class="wrapper"><slot name=""></slot></div>';
});

// Set initial light DOM.
div.innerHTML = '<p>paragraph 1</p>';

// Render shadow root template and distribute initial light DOM.
template(div);

// Add more content.
div.innerHTML += '<p>paragraph 2</p>';
```

A more streamlined approach would be to use it with a library like [Skate](https://github.com/skatejs/skatejs).



### With Skate (vanilla)

There are some helpers that make using with [Skate](https://github.com/skatejs/skatejs) a lot simpler.

```js
import { render } from 'skatejs-named-slots';

skate('my-component', {
  render: render(function (elem, shadowRoot) {
    shadoRoot.innerHTML = '<div class="wrapper"><slot name=""></slot></div>';
  })
});
```



### With Kickflip (Skate + Named Slots + Incremental DOM)

And if you like writing in a more functional approach, [Kickflip](https://github.com/skatejs/kickflip) blends this polygap with Skate.

```js
import { div, slot } from 'kickflip/src/vdom';
import kickflip from 'kickflip';

kickflip('my-component', {
  render (elem) {
    div({ class: 'wrapper' }, function () {
      slot({ name: '' });
    });
  }
});
```



## Support

The following lists are an exhaustive representation of what this polygap supports and why for the following interfaces:

- [ChildNode](https://developer.mozilla.org/en/docs/Web/API/ChildNode)
- [Element](https://developer.mozilla.org/en/docs/Web/API/Element)
- [EventTarget](https://developer.mozilla.org/en/docs/Web/API/EventTarget)
- [Node](https://developer.mozilla.org/en/docs/Web/API/Node)
- [NonDocumentTypeChildNode](https://developer.mozilla.org/en/docs/Web/API/NonDocumentTypeChildNode)
- [ParentNode](https://developer.mozilla.org/en/docs/Web/API/ParentNode)

Note:

- `HTMLElement` and any prototypes more specific are not polyfilled for simplicity.
- All members which are not standardised or are listed as experimental are not included in these lists.
- Members are only polyfilled on the specific web component unless otherwise noted.
- Members must be overridden on the instance rather than prototype because WebKit has a bug that prevents correct descritpors from being returned using [`Object.getOwnPropertyDescriptor()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) See https://bugs.webkit.org/show_bug.cgi?id=49739 for more info. We need to be able to bypass the overrides if modifying the prototypes. This does have performance implications but since only web component elements get these overrides, these are minimised. We'll be gathering some performance data on this soon.



## Polyfilled

These are members which are already polyfilled.

### Properties

#### Element

- `Element.innerHTML`

#### Node

- `Node.childNodes`
- `Node.firstChild`
- `Node.lastChild`
- `Node.parentNode`
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

These are members which are not polyfilled and probably never will be because it's likely not necessary.

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
