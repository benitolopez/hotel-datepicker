# Hotel Datepicker

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

A pure Javascript date range picker for hotels. Requires [Fecha](https://github.com/taylorhakes/fecha) **4.0.0** or above and supports all modern browsers. Check the [demo here](http://lopezb.com/hoteldatepicker).

![Hotel Datepicker Thumbnail](http://static.lopezb.com/hoteldatepicker/datepicker_card.png "Hotel Thumbnail")

## Installation

Download [Fecha](https://github.com/taylorhakes/fecha/releases). 

**[BREAK CHANGE]** Use Fecha 4.0.0 or above.

Include files:

```html
<link  href="/path/to/hotel-datepicker.css" rel="stylesheet"><!-- Optional -->
<script src="/path/to/fecha.js"></script>
<script src="/path/to/hotel-datepicker.min.js"></script>

```

## Usage

Initialize with vanilla JS.

```html
<input id="input-id" type="text">

```

```js
var hdpkr = new HotelDatepicker(document.getElementById('input-id'), options);
```

## Options

### format

- Type: `String`
- Default: `YYYY-MM-DD`

The date format string.

### infoFormat

- Type: `String`
- Default: `YYYY-MM-DD`

The date format string in the info box. If not set, it uses the `format` option.

### separator

- Type: `String`
- Default: ` - `

The separator string used between date strings.

### startOfWeek

- Type: `String`
- Default: `sunday`

Default start week: `sunday` or `monday`.

### startDate

- Type: `Date` or `String`
- Default: `new Date()`

The start view date. All the dates before this date will be disabled.

### endDate

- Type: `Date` or `String` or `Boolean`
- Default: `false`

The end view date. All the dates after this date will be disabled.

### minNights

- Type: `Number`
- Default: `1`

Minimum nights required to select a range of dates.

### maxNights

- Type: `Number`
- Default: `0`

Maximum nights required to select a range of dates.

### selectForward

- Type: `Boolean`
- Default: `false`

If `true`, the selection of the second date must be after the first date. If `false`, you can select a range of dates in both directions.

### disabledDates

- Type: `Array`
- Default: `[]`

An array of **strings** in this format: `'YYYY-MM-DD'` (note the `''`). All the dates passed to the list will be disabled.

### enableCheckout

- Type: `Boolean`
- Default: `false`

If `true`, allows the checkout on a **disabled** date. But with a criteria. Let's say we have these disabled dates: `03 April 2020` and `04 April 2020`. With this option enabled, an user can still select the first date (`03 April 2020`) for the checkout. But not `04 April 2020`.

### noCheckInDates

- Type: `Array`
- Default: `[]`

An array of **strings** in this format: `'YYYY-MM-DD'` (note the `''`). All the dates passed to the list will not allow a check-in on that day.

### noCheckOutDates

- Type: `Array`
- Default: `[]`

An array of **strings** in this format: `'YYYY-MM-DD'` (note the `''`). All the dates passed to the list will not allow a check-out on that day.

### disabledDaysOfWeek

- Type: `Array`
- Default: `[]`

An array of **strings** in English: `'Monday'` (note the `''` and the uppercase).

```js
['Monday', 'Tuesday', 'Wednesday']
```

### container

- Type: `Element`
- Default: `''`

An element for putting the datepicker. If not set, the datepicker will be appended to the parent of the input.

### animationSpeed

- Type: `String`
- Default: `.5s`

The duration (in seconds) of the animation (open/close datepicker).

### hoveringTooltip

- Type: `Boolean` or `Function`
- Default: `true`

Shows a tooltip when hovering a date. It can be a custom function:

```js
hoveringTooltip: function(nights, startTime, hoverTime) {
    return nights;
}
```

### showTopbar

- Type: `Boolean`
- Default: `true`

Show/hide the toolbar.

### autoClose

- Type: `Boolean`
- Default: `true`

Close the datepicker after the selection of the second date.

### preventContainerClose

- Type: `Boolean`
- Default: `false`

When a click is done outside the datepicker container, the datepicker closes. Use this option to disable this behavior.

### moveBothMonths

- Type: `Boolean`
- Default: `false`

Move both months when clicking on the next/prev month button.

### onDayClick

- Type: `Function`
- Default: `false`

Run a custom function every time a day is clicked:

```js
onDayClick: function() {
    console.log('Day clicked!');
}
```

### onOpenDatepicker

- Type: `Function`
- Default: `false`

Run a custom function when the datepicker is opened:

```js
onOpenDatepicker: function() {
    console.log('Datepicker opened!');
}
```

### onSelectRange

- Type: `Function`
- Default: `false`

Run a custom function when a range is selected:

```js
onSelectRange: function() {
    console.log('Date range selected!');
}
```

### i18n

**[BREAK CHANGE]** Two new options has been introduced in the v.3: `month-names-short` and `day-names-short`. Previously, the *short* day name version ('Sun', 'Mon', 'Tue', etc) was used in the `day-names` option. Now, the `day-names` option uses the *long* version.

- Type: `Object`

Default:

```js
i18n: {
    selected: 'Your stay:',
    night: 'Night',
    nights: 'Nights',
    button: 'Close',
    'checkin-disabled': 'Check-in disabled',
    'checkout-disabled': 'Check-out disabled',
    'day-names-short': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'day-names': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'month-names-short': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'month-names': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    'error-more': 'Date range should not be more than 1 night',
    'error-more-plural': 'Date range should not be more than %d nights',
    'error-less': 'Date range should not be less than 1 night',
    'error-less-plural': 'Date range should not be less than %d nights',
    'info-more': 'Please select a date range of at least 1 night',
    'info-more-plural': 'Please select a date range of at least %d nights',
    'info-range': 'Please select a date range between %d and %d nights',
    'info-default': 'Please select a date range'
}
```

## Methods

### getValue()

This function is called when the picker gets the date range string from the input.

### setValue()

This function is called when the picker sets the input value.

## API

### open()

Opens the datepicker.

### close()

Closes the datepicker.

### getDatePicker()

Gets the datepicker DOM element.

### setRange(d1, d2)

Sets the date range value.

### clear()

Clears the datepicker value.

### getNights()

Gets the number of nights selected. Returns `0` otherwise.

### destroy()

Destroys the datepicker.

## Events

### afterClose

You can listen for this event when the datepicker closes.

```js
var input = document.getElementById('input-id');

input.addEventListener('afterClose', function () {
    console.log('Closed!');
}, false);
```

## Versioning

Maintained under the [Semantic Versioning guidelines](http://semver.org/).

## Credits

Hotel Datepicker was initially developed as a fork of [jQuery Date Range Picker Plugin](https://github.com/longbill/jquery-date-range-picker) by Chunlong. But it was entirely rewritten in the version 2. It is now an independent project.

## License

[MIT](http://opensource.org/licenses/MIT) Copyright (c) 2019 [Benito Lopez](http://lopezb.com)
