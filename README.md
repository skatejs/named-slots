# named-slots

A polygap (partial polyfill) for the Shadow DOM Named Slot API.

Working example: http://jsbin.com/weboki/31/edit?js,output



## Why

- You want to expose a named-slot style public API to your web component consumers
- You don't want to resort to massive, or outdated polyfills
- You don't want to wait for browser adoption
- You don't need allthethings in the [Shadow DOM spec](http://w3c.github.io/webcomponents/spec/shadow/)
- You want interopability with React, jQuery and other libraries that don't care about your implementation details



## How

What this polyfill does is override native methods so that it can check added / removed elements for a `slot` attribute, or use a default. It uses this slot as a property name and sets that property with information regarding the change. From there, you do the work.

On top of this, it needs to report only the nodes that are contained in slots from native accessors such as `chilNodes`, `children`, etc.

For example, let's assume we have some initial content. This is what your consumer would write.

```html
<my-component id="example">
  <p slot="content">paragraph 1</p>
  <p slot="content">paragraph 2</p>
</my-component>
```

And you want it to result in:

```html
<my-component id="example">
  <div class="wrapper">
    <p slot="content">paragraph 1</p>
    <p slot="content">paragraph 2</p>
  </div>
</my-component>
```

However, you don't want your consumers to worry, or know about `.wrapper`.



### Skate (vanilla)

There are some helpers that make using with [Skate](https://github.com/skatejs/skatejs) a lot simpler.

```js
import slots from 'skatejs-named-slots';

skate('my-component', {
  properties: {
    content: slots.property({
      set (elem, data) {
        const wrapper = elem.querySelector('.wrapper');
        wrapper[data.type].apply(wrapper, data.args);
      }
    })
  },
  render: slots.render(function (elem) {
    elem.innerHTML = '<div class="wrapper"></div>';
  })
});
```



### Skate (functional + virtual DOM)

And if you like writing in a more functional approach, you can use [skatejs-dom-diff](https://github.com/skatejs/dom-diff).

```js
import diff from 'skatejs-dom-diff';
import slots from 'skatejs-named-slots';

skate('my-component', {
  properties: {
    content: slots.property({ set: skate.render }
  },
  render: slots.render(diff.render(function (elem) {
    return diff.vdom.element('div', { 'class': 'wrapper' }, elem.content.nodes);
  }))
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
- Members must be overridden on the instance rather than prototype because WebKit as a bug that prevents correct descritpors from being returned using [`Object.getOwnPropertyDescriptors()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) See https://bugs.webkit.org/show_bug.cgi?id=49739 for more info. We need to be able to bypass the overrides if modifying the prototypes. This does have performance implications but since only web component elements get these overrides, these are minimised. We'll be gathering some performance data on this soon.



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
