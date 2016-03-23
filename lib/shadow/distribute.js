(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', '../light/data', '../slot/data', './data', '../util/node'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('../light/data'), require('../slot/data'), require('./data'), require('../util/node'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.data, global.data, global.data, global.node);
    global.distribute = mod.exports;
  }
})(this, function (exports, _data, _data2, _data3, _node) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (node) {
    var host = node.parentNode;
    var slot = getSlotNode(_data3.roots.get(host), node);

    if (slot) {
      var an = _data2.assignedNodes.get(slot);
      var ns = node.nextSibling;
      var shouldManip = shouldAffectSlot(slot);

      _data.assignedSlot.set(node, slot);

      if (ns && ns.assignedSlot === slot) {
        an.splice(an.indexOf(ns), 0, node);
        shouldManip && _node.insertBefore.call(slot, node, ns);
      } else {
        an.push(node);
        shouldManip && _node.appendChild.call(slot, node);
      }

      triggerSideEffects(slot);
    }
  };

  exports.undistribute = undistribute;

  function shouldAffectSlot(slot) {
    return !_data2.fallbackState.get(slot);
  }

  function toggle(slot) {
    if (_data2.fallbackState.get(slot)) {
      var aNodes = _data2.assignedNodes.get(slot);

      if (aNodes.length) {
        var fNodes = _data2.fallbackNodes.get(slot);

        fNodes.forEach(function (node) {
          return _node.removeChild.call(slot, node);
        });
        aNodes.forEach(function (node) {
          return _node.appendChild.call(slot, node);
        });

        _data2.fallbackState.set(slot, false);
      }
    } else {
      var aNodes = _data2.assignedNodes.get(slot);

      if (!aNodes.length) {
        var fNodes = _data2.fallbackNodes.get(slot);

        aNodes.forEach(function (node) {
          return _node.removeChild.call(slot, node);
        });
        fNodes.forEach(function (node) {
          return _node.appendChild.call(slot, node);
        });

        _data2.fallbackState.set(slot, true);
      }
    }
  }

  function triggerEvent(slot) {
    if (_data2.changeListeners.get(slot)) {
      _data2.debouncedTriggerSlotChangeEvent.get(slot)(slot);
    }
  }

  function triggerSideEffects(slot) {
    toggle(slot);
    triggerEvent(slot);
  }

  function getSlotName(node) {
    return (node.getAttribute ? node.getAttribute('slot') : null) || 'default';
  }

  function getSlotNode(root, node) {
    var slot = getSlotName(node);
    return _data3.slots.get(root)[slot];
  }

  function undistribute(node) {
    var host = node.parentNode;
    var slot = getSlotNode(_data3.roots.get(host), node);

    if (slot) {
      var an = _data2.assignedNodes.get(slot);

      var index = an.indexOf(node);

      if (index > -1) {
        shouldAffectSlot(slot) && _node.removeChild.call(slot, node);

        _data.assignedSlot.set(node, null);

        an.splice(index, 1);
        triggerSideEffects(slot);
      }
    }
  }
});