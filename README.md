# Hotel Datepicker

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

A pure Javascript date range picker for hotels. Requires [Fecha](https://github.com/taylorhakes/fecha) and supports all modern browsers.

## Installation

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

An array of strings in this format: `YYYY-MM-DD`. All the dates passed to the list will be disabled.

### enableCheckout

- Type: `Boolean`
- Default: `false`

If `true`, allows the checkout on a disabled date. But with a criteria. Let's say we have these disabled dates: `03 April 2020` and `04 April 2020`. With this option enabled, an user can still select the first date (`03 April 2020`) for the checkout. But not `04 April 2020`.

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

### i18n

- Type: `Object`

Default:

```js
i18n: {
    'selected': 'Your stay:',
    'night': 'Night',
    'nights': 'Nights',
    'button': 'Close',
    'day-names': ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
    'month-names': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    'error-more': 'Date range should not be more than %d night(s)',
    'error-less': 'Date range should not be less than %d night(s)',
    'info-more': 'Please select a date range longer than %d night(s)',
    'info-range': 'Please select a date range between %d and %d night(s)',
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

## Versioning

Maintained under the [Semantic Versioning guidelines](http://semver.org/).

## Credits

Hotel Datepicker was initially developed as a fork of [jQuery Date Range Picker Plugin](https://github.com/longbill/jquery-date-range-picker) by Chunlong. But it was entirely rewritten in the version 2. It is now an independent project.

## License

[MIT](http://opensource.org/licenses/MIT) Copyright (c) 2017 [Benito Lopez](http://lopezb.com)
