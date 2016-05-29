# named-slots [![Build Status](https://travis-ci.org/skatejs/named-slots.svg?branch=master)](https://travis-ci.org/skatejs/named-slots)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/skatejs-named-slots.svg)](https://saucelabs.com/u/skatejs-named-slots)

A polygap (partial polyfill) for the Shadow DOM Named Slot API.



## Why

- You want to expose a named-slot style public API to your web component consumers
- You don't want to resort to massive, or outdated polyfills
- You don't want to wait for browser adoption
- You don't need allthethings in the [Shadow DOM spec](http://w3c.github.io/webcomponents/spec/shadow/)
- You want interopaberability with React, jQuery and other libraries that don't care about your implementation details
- You want something that is performant



## How

Instead of polyfilling everything, we polyfill only the bare minimum that is required to supply the consumers of your custom elements with an API where they can distribute content to / from your element.

Your consumers may use it like so:

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
    <slot>
      <p>paragraph 1</p>
      <p>paragraph 2</p>
    </slot>
  </div>
</my-component>
```



## Usage

This polyfill is used in the same way as specified in [the spec](http://w3c.github.io/webcomponents/spec/shadow/).

```js
const host = document.createElement('div');
const root = host.attachShadow({ mode: 'closed' });
root.innerHTML = '<h1><slot name="title"></slot></h1><slot></slot>';
host.innerHTML = '<span slot="title">title</span><p>content</p>';
```

If the browser you run that code in does not support native Shadow DOM then it would render:

```html
<div>
  <_shadow_root_>
    <h1>
      <slot name="title">title</slot>
    </h1>
    <slot>
      <p>content</p>
    </slot>
  </_shadow_root_>
</div>
```

The `attachShadow()` method accepts an options dictionary as per the spec and requires that you specify a `mode` that is either `open` or `closed`. For the polyfill, you may also specify an option for using a different name for the shadow root.

```js
const root = host.attachShadow({ mode: 'open', polyfillShadowRootTagName: 'custom-shadow-root-name' });
```

Which would then render a shadow root as:

```html
<custom-shadow-root-name>
```



## Support

The following describe what is polyfilled, what is not polyfilled, and why. All members which are not standardised or are listed as experimental are not included in these lists.



### Overview

- JavaScript API encapsulation for *most* things.
- Finders like `document.getElementById()` and `element.querySelectorAll()` are *not* polyfilled for performance reasons.
- All getters and setters that provide encapsulation are polyfilled.
- CSS encapsulation and selectors are *not* polyfilled.



### Polyfilled

These are members which are already polyfilled along with notes about their implementation details.

#### Properties

- `Element.assignedSlot` - Available on every node at time of creation. Available in WebKit after being added to a shadow root.
- `Element.childElementCount`
- `Element.children` - Same as `Node.childNodes` except that it only contains element nodes.
- `Element.firstElementChild`
- `Element.innerHTML`
- `Element.lastElementChild`
- `Element.nextElementSibling`
- `Element.outerHTML`
- `Element.previousElementSibling`
- `Node.childNodes` - Returns an array instead of a `NodeList`, however, it applies an `item()` function so things expecting it to behave like a `NodeList` don't break.
- `Node.firstChild`
- `Node.lastChild`
- `Node.nextSibling`
- `Node.parentElement`
- `Node.parentNode`
- `Node.previousSibling`
- `Node.textContent`

#### Methods

- `Element.attachShadow()`
- `HTMLSlotElement.assignedNodes()` - Only available after being added to a shadow root.
- `Node.appendChild()`
- `Node.hasChildNodes()`
- `Node.insertBefore()`
- `Node.removeChild()`
- `Node.replaceChild()`



### Maybe

These are members which are not yet polyfilled for a few reasons:

- They'd probably have to be polyfilled for all elements, not just the host.
- They may not behave as expected causing confusion.
- If only part of the finding methods are polyfilled, not polyfilling some may cause confusion.

#### Properties

- `Element.id`

#### Methods

- `Document.getElementById()`
- `Element.getElementsByClassName()`
- `Element.getElementsByTagName()`
- `Element.getElementsByTagNameNS()`
- `Element.querySelector()`
- `Element.querySelectorAll()`
- `Node.compareDocumentPosition()`
- `Node.contains()`



### Unlikely

These are members which are not polyfilled because it's likely not necessary.

#### Properties

- `Element.accessKey`
- `Element.attributes`
- `Element.classList`
- `Element.className`
- `Element.namespaceURI`
- `Element.tagName`
- `Node.baseURI`
- `Node.nodeName`
- `Node.nodeType`
- `Node.nodeValue` - doesn't need polyfilling because it returns `null` on element nodes in native anyways.
- `Node.ownerDocument`

#### Methods

- `Element.getAttribute()`
- `Element.getAttributeNS()`
- `Element.getBoundingClientRect()`
- `Element.getClientRects()`
- `Element.hasAttribute()`
- `Element.hasAttributeNS()`
- `Element.hasAttributes()`
- `Element.releasePointerCapture()`
- `Element.removeAttribute()`
- `Element.removeAttributeNS()`
- `Element.setAttribute()`
- `Element.setAttributeNS()`
- `Element.setPointerCapture()`
- `Node.addEventListener()`
- `Node.cloneNode()`
- `Node.dispatchEvent()`
- `Node.isDefaultNamespace()`
- `Node.isEqualNode()`
- `Node.lookupNamespaceURI()`
- `Node.lookupPrefix()`
- `Node.normalize()`
- `Node.removeEventListener()`



## Performance

Obviously, performance is a concern when polyfilling anything and the past has shown Shadow DOM polyfills to be slow. Since we're not polyfilling everything, and don't ever aim to, we strive to keep an acceptable level of performance.

We've written some simple perf tests to show overhead against native. These vary depending on the browser you run them, so if you're concerned about performance, it's best to run these yourself. You can do so by:

1. Clone the repo
2. `npm install`
3. `gulp perf`

For most purposes, the performance should be acceptable. That said, we're always looking at ways to imporove.
