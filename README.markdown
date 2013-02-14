# Kibo #

Kibo is a simple JavaScript library for handling keyboard events.

## Getting started ##

Kibo has no dependencies. Just include it in your HTML code:

```html
<script type="text/javascript" src="kibo.js"></script>
```

Then set up an event listener by creating an instance of Kibo:

```javascript
var k = new Kibo();
```

Kibo's constructor takes an optional argument - the HTML element on which you want to define the event handler. It should be an `input`, `textarea` or `select` element and defaults to `window.document`.

## Syntax and usage ##

Two shorthand methods are provided - `down` and `up`, which take two arguments: one or more key combinations or wildcards, and a function to invoke when a matching event is fired on the element. The shorthand methods can be chained.

A key combination is a string consisting of zero or more modifiers and a key name or, alternatively, one or more modifiers. You can pass the short-hand methods a single key combination or an array of one or more key combinations.

When the function is invoked, it is passed the event as its sole argument. Feel free to ignore it if you don't need to do anything else about it. If the function returns `false`, the default action will be prevented.

A `lastKey` method is provided for querying Kibo about which key was involved in the last keyboard event. It will return the key's name or `undefined` if the last key is not supported. Additionally, you can ask `lastKey` about a particular modifier key and it will reply either `true` or `false`.

## Supported keys ##

Kibo understands these keys and is case-insensitive about their spelling:

- modifiers `shift`, `ctrl`, `alt`

- letters `a` to `z`

- numbers `0` to `9`

- functions `f1` to `f12`

- arrows `left`, `up`, `right`, `down`

- `enter`, `esc`, `space`, `backspace`, `delete`, `insert`, `tab`, `page_up`, `page_down`, `home`, `end`, `caps_lock`, `num_lock`

- wildcards `any`, `any arrow`, `any number`, `any letter`, `any f`

## Examples ##

```javascript
var k = new Kibo();
```

### Single or multiple key combinations ###

```javascript
k.down(['up', 'down'], function() {
  console.log('up or down arrow key pressed');
}).up('tab', function() {
  console.log('TAB key released');
});
```

### Key combinations with modifiers ###

```javascript
function handler() {
  console.log('last key: ' + k.lastKey());
}

k.down(['shift q', 'ctrl alt x'], handler);
```

### Wildcards ###

```javascript
k.down(['any letter', 'any number'], function() {
  console.log('letter or number key pressed');
  console.log('shift key was' + (k.lastKey('shift') ? '' : ' not') + ' pressed');
});

k.up('any', function() {
  console.log('key released');
});
```

### Preventing the default action ###

```javascript
k.down('f5', function() { return false; });
```

## License ##

Kibo is released under the [MIT License](http://opensource.org/licenses/MIT). Copyright (c) 2013 [marquete](https://github.com/marquete).

