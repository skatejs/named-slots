(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.skatejs-named-slots = factory());
}(this, function () {

  var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
  function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }

  var version = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports);
      global.version = mod.exports;
    }
  })(__commonjs_global, function (module, exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = '0.0.1';
    module.exports = exports['default'];
  });
  });

  var require$$0$1 = (version && typeof version === 'object' && 'default' in version ? version['default'] : version);

  var slotsDefault = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports);
      global.slotsDefault = mod.exports;
    }
  })(__commonjs_global, function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = new WeakMap();
    module.exports = exports['default'];
  });
  });

  var require$$1$2 = (slotsDefault && typeof slotsDefault === 'object' && 'default' in slotsDefault ? slotsDefault['default'] : slotsDefault);

  var slots = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports);
      global.slots = mod.exports;
    }
  })(__commonjs_global, function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = new WeakMap();
    module.exports = exports['default'];
  });
  });

  var require$$2$1 = (slots && typeof slots === 'object' && 'default' in slots ? slots['default'] : slots);

  var slot = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports', './internal/map/slots', './internal/map/slots-default'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports, require$$2$1, require$$1$2);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports, global.slots, global.slotsDefault);
      global.slot = mod.exports;
    }
  })(__commonjs_global, function (module, exports, _slots, _slotsDefault) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    exports.default = function (opts) {
      if (!opts) {
        opts = {
          default: false,
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
          var slots = _slots2.default.get(elem);

          if (!slots) {
            _slots2.default.set(elem, slots = []);
          }

          slots.push(data.name);

          if (opts.default) {
            _slotsDefault2.default.set(elem, data.name);
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
              var slot = ch.getAttribute('slot') || opts.default && data.name;
              return slot === data.name;
            }
          });
        },

        // User-defined setter.
        set: opts.set
      };
    };

    var _slots2 = _interopRequireDefault(_slots);

    var _slotsDefault2 = _interopRequireDefault(_slotsDefault);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    module.exports = exports['default'];
  });
  });

  var require$$1 = (slot && typeof slot === 'object' && 'default' in slot ? slot['default'] : slot);

  var patch = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports);
      global.patch = mod.exports;
    }
  })(__commonjs_global, function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = new WeakMap();
    module.exports = exports['default'];
  });
  });

  var require$$3 = (patch && typeof patch === 'object' && 'default' in patch ? patch['default'] : patch);

  var polyfilled = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports', './internal/map/patch'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports, require$$3);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports, global.patch);
      global.polyfilled = mod.exports;
    }
  })(__commonjs_global, function (module, exports, _patch) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    exports.default = function (elem) {
      return _patch2.default.get(elem);
    };

    var _patch2 = _interopRequireDefault(_patch);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    module.exports = exports['default'];
  });
  });

  var require$$0$2 = (polyfilled && typeof polyfilled === 'object' && 'default' in polyfilled ? polyfilled['default'] : polyfilled);

  var polyfill = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports', './internal/map/patch', './internal/map/slots', './internal/map/slots-default', './polyfilled'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports, require$$3, require$$2$1, require$$1$2, require$$0$2);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports, global.patch, global.slots, global.slotsDefault, global.polyfilled);
      global.polyfill = mod.exports;
    }
  })(__commonjs_global, function (module, exports, _patch, _slots, _slotsDefault, _polyfilled) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    exports.default = function (elem) {
      if ((0, _polyfilled2.default)(elem)) {
        return;
      }

      for (var name in props) {
        prop(elem, name, props[name]);
      }

      for (var name in funcs) {
        elem[name] = funcs[name];
      }

      _patch2.default.set(elem, true);
    };

    var _patch2 = _interopRequireDefault(_patch);

    var _slots2 = _interopRequireDefault(_slots);

    var _slotsDefault2 = _interopRequireDefault(_slotsDefault);

    var _polyfilled2 = _interopRequireDefault(_polyfilled);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var prop = Object.defineProperty.bind(Object);

    function getSlot(elem, node) {
      var key = getSlotName(elem, node);
      var val = elem[key];
      return key && val ? {
        key: key,
        val: val.slice()
      } : null;
    }

    function getSlotName(elem, node) {
      return node.getAttribute && node.getAttribute('slot') || _slotsDefault2.default.get(elem);
    }

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

    var props = {
      childElementCount: {
        get: function get() {
          return this.children.length;
        }
      },
      childNodes: {
        get: function get() {
          var _this = this;

          return makeLikeNodeList((_slots2.default.get(this) || []).reduce(function (prev, curr) {
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
            return ' ' + attr.name + (attr.value ? '=' + attr.value : '');
          });
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
          var slot = _slotsDefault2.default.get(this);

          if (slot) {
            this[slot] = document.createTextNode(val);
          }
        }
      }
    };
    var funcs = {
      appendChild: function appendChild(newNode) {
        var slot = getSlot(this, newNode);

        if (!slot) {
          return;
        }

        slot.val.push(newNode);
        this[slot.key] = slot.val;
        return newNode;
      },
      hasChildNodes: function hasChildNodes() {
        return this.childNodes.length > 0;
      },
      insertBefore: function insertBefore(newNode, refNode) {
        var slot = getSlot(this, newNode);

        if (!slot) {
          return;
        }

        var index = slot.val.indexOf(refNode);

        if (index === -1) {
          slot.val.push(newNode);
        } else {
          slot.val.splice(index, 0, newNode);
        }

        this[slot.key] = slot.val;
        return newNode;
      },
      removeChild: function removeChild(refNode) {
        var slot = getSlot(this, refNode);

        if (!slot) {
          return;
        }

        var index = slot.val.indexOf(refNode);

        if (index !== -1) {
          slot.val.splice(index, 1);
          this[slot.key] = slot.val;
        }

        return refNode;
      },
      replaceChild: function replaceChild(newNode, refNode) {
        var slot = getSlot(this, newNode);

        if (!slot) {
          return;
        }

        var index = slot.val.indexOf(refNode);

        if (index !== -1) {
          slot.val.splice(index, 1, newNode);
          this[slot.key] = slot.val;
        }

        return refNode;
      }
    };
    module.exports = exports['default'];
  });
  });

  var require$$1$1 = (polyfill && typeof polyfill === 'object' && 'default' in polyfill ? polyfill['default'] : polyfill);

  var render = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports', './polyfill', './internal/map/patch'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports, require$$1$1, require$$3);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports, global.polyfill, global.patch);
      global.render = mod.exports;
    }
  })(__commonjs_global, function (module, exports, _polyfill, _patch) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    exports.default = function (fn) {
      return function (elem) {
        if (_patch2.default.get(elem)) {
          fn(elem);
        } else {
          fn(elem);
          (0, _polyfill2.default)(elem);
        }
      };
    };

    var _polyfill2 = _interopRequireDefault(_polyfill);

    var _patch2 = _interopRequireDefault(_patch);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    module.exports = exports['default'];
  });
  });

  var require$$2 = (render && typeof render === 'object' && 'default' in render ? render['default'] : render);

  var index = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports', './polyfill', './polyfilled', './render', './slot', './version'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports, require$$1$1, require$$0$2, require$$2, require$$1, require$$0$1);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports, global.polyfill, global.polyfilled, global.render, global.slot, global.version);
      global.index = mod.exports;
    }
  })(__commonjs_global, function (module, exports, _polyfill, _polyfilled, _render, _slot, _version) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _polyfill2 = _interopRequireDefault(_polyfill);

    var _polyfilled2 = _interopRequireDefault(_polyfilled);

    var _render2 = _interopRequireDefault(_render);

    var _slot2 = _interopRequireDefault(_slot);

    var _version2 = _interopRequireDefault(_version);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    exports.default = {
      polyfill: _polyfill2.default,
      polyfilled: _polyfilled2.default,
      render: _render2.default,
      slot: _slot2.default,
      version: _version2.default
    };
    module.exports = exports['default'];
  });
  });

  var require$$0 = (index && typeof index === 'object' && 'default' in index ? index['default'] : index);

  var global = __commonjs(function (module, exports, global) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(['module', 'exports', '../lib/index.js'], factory);
    } else if (typeof exports !== "undefined") {
      factory(module, exports, require$$0);
    } else {
      var mod = {
        exports: {}
      };
      factory(mod, mod.exports, global.index);
      global.global = mod.exports;
    }
  })(__commonjs_global, function (module, exports, _index) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _index2 = _interopRequireDefault(_index);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var previousGlobal = window.skatejsNamedSlots;

    _index2.default.noConflict = function noConflict() {
      window.skatejsNamedSlots = previousGlobal;
      return this;
    };

    window.skatejsNamedSlots = _index2.default;
    exports.default = _index2.default;
    module.exports = exports['default'];
  });
  });

  var global$1 = (global && typeof global === 'object' && 'default' in global ? global['default'] : global);

  return global$1;

}));
//# sourceMappingURL=index.js.map