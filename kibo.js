var Kibo = function(element) {
  this.element = element || window.document;
  this.initialize();
};

Kibo.KEY_NAMES_BY_CODE = {
  8: 'backspace', 9: 'tab', 13: 'enter',
  16: 'shift', 17: 'ctrl', 18: 'alt',
  20: 'caps_lock',
  27: 'esc',
  32: 'space',
  33: 'page_up', 34: 'page_down',
  35: 'end', 36: 'home',
  37: 'left', 38: 'up', 39: 'right', 40: 'down',
  45: 'insert', 46: 'delete',
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
  65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z',
  112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12',
  144: 'num_lock'
};

Kibo.KEY_CODES_BY_NAME = {};
(function() {
for (var key in Kibo.KEY_NAMES_BY_CODE)
  if (Object.prototype.hasOwnProperty.call(Kibo.KEY_NAMES_BY_CODE, key))
    Kibo.KEY_CODES_BY_NAME[Kibo.KEY_NAMES_BY_CODE[key]] = +key;
})();

Kibo.MODIFIERS = ['shift', 'ctrl', 'alt'];

Kibo.WILDCARD_TYPES = ['arrow', 'number', 'letter', 'f'];

Kibo.WILDCARDS = {
  arrow: [37, 38, 39, 40],
  number: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
  letter: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
  f: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
};

Kibo.assert = function(expression, exception) {
  exception = exception || {};
  exception.name = exception.name || 'Exception raised';
  exception.message = exception.message || 'an error has occurred.';

  try {
    if(!expression)
      throw(exception);
  } catch(error) {
    if((typeof console !== 'undefined') && console.log)
      console.log(error.name + ': ' + error.message);
    else
      window.alert(error.name + ': ' + error.message);
  }
};

Kibo.registerEvent = (function() {
  if(document.addEventListener) {
    return function(element, eventName, func) {
      element.addEventListener(eventName, func, false);
    };
  }
  else if(document.attachEvent) {
    return function(element, eventName, func) {
      element.attachEvent('on' + eventName, func);
    };
  }
})();

Kibo.unregisterEvent = (function() {
  if(document.removeEventListener) {
    return function(element, eventName, func) {
      element.removeEventListener(eventName, func, false);
    };
  }
  else if(document.detachEvent) {
    return function(element, eventName, func) {
      element.detachEvent('on' + eventName, func);
    };
  }
})();

Kibo.isArray = function(what) {
  return !!(what && what.splice);
};

Kibo.isString = function(what) {
  return typeof what === 'string';
};

Kibo.arrayIncludes = (function() {
  if(Array.prototype.indexOf) {
    return function(haystack, needle) {
      return haystack.indexOf(needle) !== -1;
    };
  }
  else {
    return function(haystack, needle) {
      for(var i = 0; i < haystack.length; i++)
        if(haystack[i] === needle)
          return true;
      return false;
    };
  }
})();

Kibo.trimString = function(string) {
  return string.replace(/^\s+|\s+$/g, '');
};

Kibo.neatString = function(string) {
  return Kibo.trimString(string).replace(/\s+/g, ' ');
};

Kibo.capitalize = function(string) {
  return string.toLowerCase().replace(/^./, function(match) { return match.toUpperCase(); });
};

Kibo.isModifier = function(key) {
  return Kibo.arrayIncludes(Kibo.MODIFIERS, key);
};

Kibo.prototype.initialize = function() {
  var i, that = this;

  this.lastKeyCode = -1;
  this.lastModifiers = {};
  for(i = 0; i < Kibo.MODIFIERS.length; i++)
    this.lastModifiers[Kibo.MODIFIERS[i]] = false;

  this.keysDown = { any: [] };
  this.keysUp = { any: [] };
  for(i = 0; i < Kibo.WILDCARD_TYPES.length; i++) {
    this.keysDown['any ' + Kibo.WILDCARD_TYPES[i]] = [];
    this.keysUp['any ' + Kibo.WILDCARD_TYPES[i]] = [];
  }

  this.downHandler = this.handler('down');
  this.upHandler = this.handler('up');

  Kibo.registerEvent(this.element, 'keydown', this.downHandler);
  Kibo.registerEvent(this.element, 'keyup', this.upHandler);
  Kibo.registerEvent(window, 'unload', function unloader() {
    Kibo.unregisterEvent(that.element, 'keydown', that.downHandler);
    Kibo.unregisterEvent(that.element, 'keyup', that.upHandler);
    Kibo.unregisterEvent(window, 'unload', unloader);
  });
};

Kibo.prototype.matchingKeys = function(registeredKeys) {
  var i, j, keyCombination, match, result = [];
  for(var registeredKey in registeredKeys) {
    if(Object.prototype.hasOwnProperty.call(registeredKeys, registeredKey)) {
      keyCombination = Kibo.trimString(registeredKey).split(' ');
      if(keyCombination.length && keyCombination[0] !== 'any') {
        match = true;
        for(j = 0; j < keyCombination.length; j++)
          match = match && (Kibo.isModifier(keyCombination[j]) ? this.lastKey(keyCombination[j]) : (this.lastKey() === keyCombination[j]));
        if(match)
          result.push(registeredKey);
      }
    }
  }
  return result;
};

Kibo.prototype.handler = function(upOrDown) {
  var that = this;
  return function(e) {
    var i, j, matchingKeys, registeredKeys;

    e = e || window.event;

    that.lastKeyCode = e.keyCode;
    for(i = 0; i < Kibo.MODIFIERS.length; i++)
      that.lastModifiers[Kibo.MODIFIERS[i]] = e[Kibo.MODIFIERS[i] + 'Key'];
    if(Kibo.arrayIncludes(Kibo.MODIFIERS, Kibo.keyName(that.lastKeyCode)))
      that.lastModifiers[Kibo.keyName(that.lastKeyCode)] = true;

    registeredKeys = that['keys' + Kibo.capitalize(upOrDown)];
    matchingKeys = that.matchingKeys(registeredKeys);

    for(i = 0; i < registeredKeys.any.length; i++)
      if((registeredKeys.any[i](e) === false) && e.preventDefault)
        e.preventDefault();

    for(i = 0; i < Kibo.WILDCARD_TYPES.length; i++)
      if(Kibo.arrayIncludes(Kibo.WILDCARDS[Kibo.WILDCARD_TYPES[i]], that.lastKeyCode))
        for(j = 0; j < registeredKeys['any ' + Kibo.WILDCARD_TYPES[i]].length; j++)
          if((registeredKeys['any ' + Kibo.WILDCARD_TYPES[i]][j](e) === false) && e.preventDefault)
            e.preventDefault();

    for(i = 0; i < matchingKeys.length; i++)
      for(j = 0; j < registeredKeys[matchingKeys[i]].length; j++)
        if((registeredKeys[matchingKeys[i]][j](e) === false) && e.preventDefault)
          e.preventDefault();
  };
};

Kibo.prototype.registerKeys = function(upOrDown, newKeys, func) {
  var i, registeredKeys = this['keys' + Kibo.capitalize(upOrDown)];

  if(!Kibo.isArray(newKeys))
    newKeys = [newKeys];

  for(i = 0; i < newKeys.length; i++) {
    Kibo.assert(
      Kibo.isString(newKeys[i]),
      { name: 'Type error', message: 'expected string or array of strings.' }
    );

    newKeys[i] = Kibo.neatString(newKeys[i]);

    if(Kibo.isArray(registeredKeys[newKeys[i]]))
      registeredKeys[newKeys[i]].push(func);
    else
      registeredKeys[newKeys[i]] = [func];
    }

    return this;
};

Kibo.prototype.unregisterKeys = function(upOrDown, newKeys, func) {
  var i, j, registeredKeys = this['keys' + Kibo.capitalize(upOrDown)];

  if(!Kibo.isArray(newKeys))
    newKeys = [newKeys];

  for(i = 0; i < newKeys.length; i++) {
    Kibo.assert(
      Kibo.isString(newKeys[i]),
      { name: 'Type error', message: 'expected string or array of strings.' }
    );

    newKeys[i] = Kibo.neatString(newKeys[i]);

    if(func === null)
      delete registeredKeys[newKeys[i]];
    else {
      if(Kibo.isArray(registeredKeys[newKeys[i]])) {
        for(j = 0; j < registeredKeys[newKeys[i]].length; j++) {
          if(String(registeredKeys[newKeys[i]][j]) === String(func)) {
            registeredKeys[newKeys[i]].splice(j, 1);
            break;
          }
        }
      }
    }
  }

  return this;
};

Kibo.prototype.delegate = function(action, keys, func) {
  return func !== null ? this.registerKeys(action, keys, func) : this.unregisterKeys(action, keys, func);
};
Kibo.prototype.down = function(keys, func) {
  return this.delegate('down', keys, func);
};

Kibo.prototype.up = function(keys, func) {
  return this.delegate('up', keys, func);
};

Kibo.keyName = function(keyCode) {
  return Kibo.KEY_NAMES_BY_CODE[keyCode + ''];
};

Kibo.keyCode = function(keyName) {
  return +Kibo.KEY_CODES_BY_NAME[keyName];
};

Kibo.prototype.lastKey = function(modifier) {
  if(!modifier)
    return Kibo.keyName(this.lastKeyCode);

  Kibo.assert(
    Kibo.arrayIncludes(Kibo.MODIFIERS, modifier),
    { name: 'Modifier error', message: 'invalid modifier ' + modifier + ' (valid modifiers are: ' + Kibo.MODIFIERS.join(', ') + ').' }
  );

  return this.lastModifiers[modifier];
};

