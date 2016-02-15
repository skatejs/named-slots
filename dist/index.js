// src/internal/map/patch.js
(typeof window === 'undefined' ? global : window).__e0f3ff9d2482bb4d7d1a054acdbf91f0 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports["default"] = new WeakMap();
  module.exports = exports["default"];
  
  return module.exports;
}).call(this);
// src/internal/map/slots.js
(typeof window === 'undefined' ? global : window).__c5ff1991634757682d350a3d5a6d7487 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports["default"] = new WeakMap();
  module.exports = exports["default"];
  
  return module.exports;
}).call(this);
// src/internal/map/slots-default.js
(typeof window === 'undefined' ? global : window).__d7d815c237595e6d764cb57744dca5a3 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports["default"] = new WeakMap();
  module.exports = exports["default"];
  
  return module.exports;
}).call(this);
// src/polyfilled.js
(typeof window === 'undefined' ? global : window).__f7b10bf00c7af5bbec02f710b3134a30 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _internalMapPatch = __e0f3ff9d2482bb4d7d1a054acdbf91f0;
  
  var _internalMapPatch2 = _interopRequireDefault(_internalMapPatch);
  
  // Returns whether or not the specified element has been polyfilled.
  
  exports['default'] = function (elem) {
    return _internalMapPatch2['default'].get(elem);
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/polyfill.js
(typeof window === 'undefined' ? global : window).__c3b6c16d5a5beb9a0502d6861c6a5157 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _internalMapPatch = __e0f3ff9d2482bb4d7d1a054acdbf91f0;
  
  var _internalMapPatch2 = _interopRequireDefault(_internalMapPatch);
  
  var _internalMapSlots = __c5ff1991634757682d350a3d5a6d7487;
  
  var _internalMapSlots2 = _interopRequireDefault(_internalMapSlots);
  
  var _internalMapSlotsDefault = __d7d815c237595e6d764cb57744dca5a3;
  
  var _internalMapSlotsDefault2 = _interopRequireDefault(_internalMapSlotsDefault);
  
  var _polyfilled = __f7b10bf00c7af5bbec02f710b3134a30;
  
  var _polyfilled2 = _interopRequireDefault(_polyfilled);
  
  var prop = Object.defineProperty.bind(Object);
  
  // Helpers.
  
  function getSlot(elem, node) {
    var key = getSlotName(elem, node);
    var val = elem[key];
    return key && val ? { key: key, val: val.slice() } : null;
  }
  
  function getSlotName(elem, node) {
    return node.getAttribute && node.getAttribute('slot') || _internalMapSlotsDefault2['default'].get(elem);
  }
  
  // TODO use in DOM manip methods to make them DocumentFragment compatible.
  function nodeToArray(node) {
    return node instanceof DocumentFragment ? [].slice.call(node.childNodes) : [node];
  }
  
  function arrayItem(idx) {
    return this[idx];
  }
  
  function makeLikeNodeList(arr) {
    arr.item = arrayItem;
    return arr;
  }
  
  // Prop overrides.
  
  var props = {
    childElementCount: {
      get: function get() {
        return this.children.length;
      }
    },
    childNodes: {
      get: function get() {
        var _this = this;
  
        return makeLikeNodeList((_internalMapSlots2['default'].get(this) || []).reduce(function (prev, curr) {
          return prev.concat(_this[curr]);
        }, []));
      }
    },
    children: {
      get: function get() {
        return makeLikeNodeList(this.childNodes.filter(function (node) {
          return node.nodeType === 1;
        }));
      }
    },
    firstChild: {
      get: function get() {
        return this.childNodes[0];
      }
    },
    firstElementChild: {
      get: function get() {
        return this.children[0];
      }
    },
    innerHTML: {
      get: function get() {
        return this.childNodes.map(function (node) {
          return node.outerHTML || node.textContent;
        }).join('');
      },
      set: function set(val) {
        var div = document.createElement('div');
        div.innerHTML = val;
        while (div.hasChildNodes()) {
          this.appendChild(div.childNodes[0]);
        }
      }
    },
    lastChild: {
      get: function get() {
        var ch = this.childNodes;
        return ch[ch.length - 1];
      }
    },
    lastElementChild: {
      get: function get() {
        var ch = this.children;
        return ch[ch.length - 1];
      }
    },
    outerHTML: {
      get: function get() {
        var name = this.tagName.toLowerCase();
        var attributes = [].slice.call(this.attributes).map(function (attr) {
          return ' ' + attr.name + (attr.value ? '="' + attr.value + '"' : '');
        }).join('');
        return '<' + name + attributes + '>' + this.innerHTML + '</' + name + '>';
      }
    },
    textContent: {
      get: function get() {
        return this.childNodes.map(function (node) {
          return node.textContent;
        }).join('');
      },
      set: function set(val) {
        var slot = _internalMapSlotsDefault2['default'].get(this);
        if (slot) {
          this[slot] = document.createTextNode(val);
        }
      }
    }
  };
  
  function doForNodesIfSlot(elem, node, func) {
    nodeToArray(node).forEach(function (node) {
      var slot = getSlot(elem, node);
      if (slot) {
        func(elem, node, slot);
      }
    });
  }
  
  // Method overrides.
  
  var funcs = {
    appendChild: function appendChild(newNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        slot.val.push(node);
        elem[slot.key] = slot.val;
      });
      return newNode;
    },
    hasChildNodes: function hasChildNodes() {
      return this.childNodes.length > 0;
    },
    insertBefore: function insertBefore(newNode, refNode) {
      doForNodesIfSlot(this, newNode, function (elem, node, slot) {
        var index = slot.val.indexOf(refNode);
        if (index === -1) {
          slot.val.push(node);
        } else {
          slot.val.splice(index, 0, node);
        }
        elem[slot.key] = slot.val;
      });
      return newNode;
    },
    removeChild: function removeChild(refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        var index = slot.val.indexOf(node);
        if (index !== -1) {
          slot.val.splice(index, 1);
          elem[slot.key] = slot.val;
        }
      });
      return refNode;
    },
    replaceChild: function replaceChild(newNode, refNode) {
      doForNodesIfSlot(this, refNode, function (elem, node, slot) {
        var index = slot.val.indexOf(refNode);
        if (index !== -1) {
          slot.val.splice(index, 1, newNode);
          elem[slot.key] = slot.val;
        }
      });
      return refNode;
    }
  };
  
  // Polyfills an element.
  
  exports['default'] = function (elem) {
    if ((0, _polyfilled2['default'])(elem)) {
      return;
    }
  
    for (var _name in props) {
      prop(elem, _name, props[_name]);
    }
  
    for (var _name2 in funcs) {
      elem[_name2] = funcs[_name2];
    }
  
    _internalMapPatch2['default'].set(elem, true);
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/render.js
(typeof window === 'undefined' ? global : window).__4b1fb0087d27bc1c8cc501d2e3060c30 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _polyfill = __c3b6c16d5a5beb9a0502d6861c6a5157;
  
  var _polyfill2 = _interopRequireDefault(_polyfill);
  
  var _internalMapPatch = __e0f3ff9d2482bb4d7d1a054acdbf91f0;
  
  var _internalMapPatch2 = _interopRequireDefault(_internalMapPatch);
  
  // Simple renderer that proxies another renderer. It will polyfill if not yet
  // polyfilled, or simply run the renderer. Initial content is taken into
  // consideration.
  
  exports['default'] = function (fn) {
    return function (elem) {
      if (_internalMapPatch2['default'].get(elem)) {
        fn(elem);
      } else {
        fn(elem);
        (0, _polyfill2['default'])(elem);
      }
    };
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/slot.js
(typeof window === 'undefined' ? global : window).__36ff6696f2c15c86c505cd37caa87aac = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _internalMapSlots = __c5ff1991634757682d350a3d5a6d7487;
  
  var _internalMapSlots2 = _interopRequireDefault(_internalMapSlots);
  
  var _internalMapSlotsDefault = __d7d815c237595e6d764cb57744dca5a3;
  
  var _internalMapSlotsDefault2 = _interopRequireDefault(_internalMapSlotsDefault);
  
  // Creates a slot property compatible with the SkateJS custom property
  // definitions. Makes web component integration much simpler.
  
  exports['default'] = function (opts) {
    if (!opts) {
      opts = {
        'default': false,
        set: null
      };
    }
  
    return {
      // Makes sure that whatever is passed in is an array.
      coerce: function coerce(val) {
        return Array.isArray(val) ? val : [val];
      },
  
      // Registers the slot so we can check later.
      created: function created(elem, data) {
        var slots = _internalMapSlots2['default'].get(elem);
  
        if (!slots) {
          _internalMapSlots2['default'].set(elem, slots = []);
        }
  
        slots.push(data.name);
  
        if (opts['default']) {
          _internalMapSlotsDefault2['default'].set(elem, data.name);
        }
      },
  
      // If an empty value is passed in, ensure that it's an array.
      'default': function _default() {
        return [];
      },
  
      // Return any initial nodes that match the slot.
      initial: function initial(elem, data) {
        return [].slice.call(elem.childNodes).filter(function (ch) {
          if (ch.getAttribute) {
            var slot = ch.getAttribute('slot') || opts['default'] && data.name;
            return slot === data.name;
          } else if (ch.nodeType === 3) {
            return true;
          }
        });
      },
  
      // User-defined setter.
      set: opts.set
    };
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/version.js
(typeof window === 'undefined' ? global : window).__f3b5bbf7c2869a091610ee437003226b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports['default'] = '0.0.1';
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/index.js
(typeof window === 'undefined' ? global : window).__c62e2a3f85bb48383fbab4fda1d3137c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _polyfill = __c3b6c16d5a5beb9a0502d6861c6a5157;
  
  var _polyfill2 = _interopRequireDefault(_polyfill);
  
  var _polyfilled = __f7b10bf00c7af5bbec02f710b3134a30;
  
  var _polyfilled2 = _interopRequireDefault(_polyfilled);
  
  var _render = __4b1fb0087d27bc1c8cc501d2e3060c30;
  
  var _render2 = _interopRequireDefault(_render);
  
  var _slot = __36ff6696f2c15c86c505cd37caa87aac;
  
  var _slot2 = _interopRequireDefault(_slot);
  
  var _version = __f3b5bbf7c2869a091610ee437003226b;
  
  var _version2 = _interopRequireDefault(_version);
  
  exports['default'] = {
    polyfill: _polyfill2['default'],
    polyfilled: _polyfilled2['default'],
    render: _render2['default'],
    slot: _slot2['default'],
    version: _version2['default']
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/global.js
(typeof window === 'undefined' ? global : window).__911af63b703cd92dd8341dd8c6151193 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _index = __c62e2a3f85bb48383fbab4fda1d3137c;
  
  var _index2 = _interopRequireDefault(_index);
  
  window.skateNamedSlots = _index2['default'];
  exports['default'] = _index2['default'];
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);