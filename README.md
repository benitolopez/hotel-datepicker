# Hotel Datepicker

This is a fork of [jQuery Date Range Picker Plugin](https://github.com/longbill/jquery-date-range-picker) by Chunlong. The main difference is that Hotel Datepicker uses [Fecha](https://github.com/taylorhakes/fecha) instead of Moment.js. And a lot of options of jQuery Date Range Picker Plugin are not available in Hotel Datepicker. Hotel Datepicker is a light version of jQuery Date Range Picker Plugin.

Another difference is that it uses *nights* instead of *days* to calculate the date range. For this reason, the plugin is perfect for hotels.

## Installation

Include files:

```html
<link  href="/path/to/hotel-datepicker.css" rel="stylesheet"><!-- Optional -->
<script src="/path/to/jquery.js"></script>
<script src="/path/to/fecha.js"></script>
<script src="/path/to/hotel-datepicker.js"></script>

```

## Usage

Initialize with `$.fn.hotelDatePicker` method.

```html
<input id="input-id" type="text">

```

```js
$('#input-id').hotelDatePicker(options);
```

## Options

### format

- Type: `String`
- Default: `YYYY-MM-DD`

The date format string.

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

### container

- Type: `Element`
- Default: `''`

An element for putting the datepicker. If not set, the datepicker will be appended to the parent of the input.

### duration

- Type: `Number`
- Default: `200`

The duration of the animation (open/close datepicker).

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

### i18n

- Type: `Object`

Default:

```js
i18n: {
    'selected': 'Your stay:',
    'night': 'Night',
    'nights': 'Nights',
    'apply': 'Close',
    'week-1': 'mo',
    'week-2': 'tu',
    'week-3': 'we',
    'week-4': 'th',
    'week-5': 'fr',
    'week-6': 'sa',
    'week-7': 'su',
    'month-name': ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    'less-than': 'Date range should not be more than %d night(s)',
    'more-than': 'Date range should not be less than %d night(s)',
    'default-more': 'Please select a date range longer than %d night(s)',
    'default-range': 'Please select a date range between %d and %d night(s)',
    'default-default': 'Please select a date range'
}
```

## Methods

### getValue()

This function is called when get date range string from DOM.

### setValue()

This function is called when set date range string to DOM.

## Versioning

Maintained under the [Semantic Versioning guidelines](http://semver.org/).

## License

[MIT](http://opensource.org/licenses/MIT)
Original work Copyright (c) 2015 [Chunlong](https://github.com/longbill/jquery-date-range-picker)
Modified work Copyright 2016 [Benito Lopez](http://benitolopez.me)
