'use strict';
/* global fecha, DocumentTouch */
/* eslint-disable no-multi-assign */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HotelDatepicker = function () {
    function HotelDatepicker(input, options) {
        _classCallCheck(this, HotelDatepicker);

        // Set default values
        var opts = options || {};

        this.format = opts.format || 'YYYY-MM-DD';
        this.infoFormat = opts.infoFormat || this.format;
        this.separator = opts.separator || ' - ';
        this.startOfWeek = opts.startOfWeek || 'sunday'; // Or monday
        this.startDate = opts.startDate || new Date();
        this.endDate = opts.endDate || false;
        this.minNights = opts.minNights || 1;
        this.maxNights = opts.maxNights || 0;
        this.selectForward = opts.selectForward || false;
        this.disabledDates = opts.disabledDates || [];
        this.enableCheckout = opts.enableCheckout || false;
        this.container = opts.container || '';
        this.animationSpeed = opts.animationSpeed || '.5s';
        this.hoveringTooltip = opts.hoveringTooltip || true; // Or a function
        this.autoClose = opts.autoClose === undefined ? true : opts.autoClose;
        this.i18n = opts.i18n || {
            selected: 'Your stay:',
            night: 'Night',
            nights: 'Nights',
            button: 'Close',
            'day-names': ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            'month-names': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'error-more': 'Date range should not be more than 1 night',
            'error-more-plural': 'Date range should not be more than %d nights',
            'error-less': 'Date range should not be less than 1 night',
            'error-less-plural': 'Date range should not be less than %d nights',
            'info-more': 'Please select a date range longer than 1 night',
            'info-more-plural': 'Please select a date range longer than %d nights',
            'info-range': 'Please select a date range between %d and %d nights',
            'info-default': 'Please select a date range'
        };
        this.getValue = opts.getValue || function () {
            return input.value;
        };
        this.setValue = opts.setValue || function (s) {
            input.value = s;
        };

        // DOM input
        this.input = input;

        // Initialize the datepicker
        this.init();
    }

    _createClass(HotelDatepicker, [{
        key: 'getWeekDayNames',
        value: function getWeekDayNames() {
            var week = '';

            // Start from monday if we passed that option
            if (this.startOfWeek === 'monday') {
                for (var i = 0; i < 7; i++) {
                    week += '<th class="datepicker__week-name">' + this.lang('day-names')[(1 + i) % 7] + '</th>';
                }

                return week;
            }

            // Otherwise start from sunday (default)
            for (var _i = 0; _i < 7; _i++) {
                week += '<th class="datepicker__week-name">' + this.lang('day-names')[_i] + '</th>';
            }

            return week;
        }
    }, {
        key: 'getMonthDom',
        value: function getMonthDom(month) {
            // Get month DOM element
            return document.getElementById(this.getMonthTableId(month));
        }
    }, {
        key: 'getMonthName',
        value: function getMonthName(m) {
            // Get month name
            return this.lang('month-names')[m];
        }
    }, {
        key: 'getDatepickerId',
        value: function getDatepickerId() {
            // Get datepicker ID
            return 'datepicker-' + this.generateId();
        }
    }, {
        key: 'getMonthTableId',
        value: function getMonthTableId(month) {
            // Get month table ID
            return 'month-' + month + '-' + this.generateId();
        }
    }, {
        key: 'getCloseButtonId',
        value: function getCloseButtonId() {
            // Get close button ID
            return 'close-' + this.generateId();
        }
    }, {
        key: 'getTooltipId',
        value: function getTooltipId() {
            // Get close button ID
            return 'tooltip-' + this.generateId();
        }
    }, {
        key: 'getNextMonth',
        value: function getNextMonth(month) {
            // Get next month date
            var _m = new Date(month.valueOf());

            return new Date(_m.setMonth(_m.getMonth() + 1));
        }
    }, {
        key: 'getPrevMonth',
        value: function getPrevMonth(month) {
            // Get previous month date
            var _m = new Date(month.valueOf());

            return new Date(_m.setMonth(_m.getMonth() - 1));
        }
    }, {
        key: 'getDateString',
        value: function getDateString(date) {
            var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.format;

            // Format date
            return fecha.format(date, format);
        }
    }, {
        key: 'parseDate',
        value: function parseDate(date) {
            var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.format;

            // Parse a date object
            return fecha.parse(date, format);
        }
    }, {
        key: 'init',
        value: function init() {
            // DOM container
            this.parent = this.container ? this.container : this.input.parentElement;

            // Start date of the selected range
            this.start = false;

            // End date of the selected range
            this.end = false;

            // Set the minimum of days required by the daterange
            this.minDays = this.minNights > 1 ? this.minNights + 1 : 2;

            // Set the maximum of days required by the daterange
            this.maxDays = this.maxNights > 0 ? this.maxNights + 1 : 0;

            // Set startDate if we passed that option
            if (this.startDate && typeof this.startDate === 'string') {
                this.startDate = this.parseDate(this.startDate);
            }

            // Set endDate if we passed that option
            if (this.endDate && typeof this.endDate === 'string') {
                this.endDate = this.parseDate(this.endDate);
            }

            // Hide tooltip on touch devices
            if (this.isTouchDevice()) {
                this.hoveringTooltip = false;
            }

            // Flag that checks if the datepicker is open
            this.isOpen = false;

            // Flag that checks if the second date of the range is set
            this.changed = false;

            // Create the DOM elements
            this.createDom();

            // Set default time
            var defaultTime = new Date();

            if (this.startDate && this.compareMonth(defaultTime, this.startDate) < 0) {
                defaultTime = this.startDate;
            }

            if (this.endDate && this.compareMonth(this.getNextMonth(defaultTime), this.endDate) > 0) {
                defaultTime = this.getPrevMonth(this.endDate);
            }

            // Show months
            this.showMonth(defaultTime, 1);
            this.showMonth(this.getNextMonth(defaultTime), 2);

            // Print default info in top bar
            this.topBarDefaultText();

            // Parse disabled dates
            if (this.disabledDates.length > 0) {
                this.parseDisabledDates();
            }

            // Attach listeners
            this.addListeners();
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _this = this;

            // Next month button
            var nextButtons = this.datepicker.getElementsByClassName('datepicker__month-button--next');

            for (var i = 0; i < nextButtons.length; i++) {
                nextButtons[i].addEventListener('click', function (evt) {
                    return _this.goToNextMonth(evt);
                });
            }

            // Previous month button
            var prevButtons = this.datepicker.getElementsByClassName('datepicker__month-button--prev');

            for (var _i2 = 0; _i2 < prevButtons.length; _i2++) {
                prevButtons[_i2].addEventListener('click', function (evt) {
                    return _this.goToPreviousMonth(evt);
                });
            }

            // Open the datepicker on the input click
            this.input.addEventListener('click', function (evt) {
                return _this.openDatepicker(evt);
            });

            // Close the datepicker on the button click
            document.getElementById(this.getCloseButtonId()).addEventListener('click', function (evt) {
                return _this.closeDatepicker(evt);
            });

            // Close the datepicker on resize?
            // The problem is that mobile keyboards trigger the resize event closing
            // the datepicker. There are some workarounds (http://stackoverflow.com/q/14902321)
            // but for now I will disable this option. I'm open to new ideas.
            // window.addEventListener('resize', evt => this.closeDatepicker(evt));

            // Add a click event listener to the document. This will help us to:
            // 1 - Check if the click it's outside the datepicker
            // 2 - Handle the click on calendar days
            document.addEventListener('click', function (evt) {
                return _this.documentClick(evt);
            });

            // Add a mouseover event listener to the document. This will help us to:
            // 1 - Handle the hover on calendar days
            document.addEventListener('mouseover', function (evt) {
                return _this.documentHover(evt);
            });

            // Add a mouseout event listener to the document. This will help us to:
            // 1 - Hide the tooltip on the mouseout event on days
            document.addEventListener('mouseout', function (evt) {
                return _this.documentMouseOut(evt);
            });

            // Update the selected values when the input changes manually
            this.input.addEventListener('change', function () {
                return _this.checkAndSetDefaultValue();
            });
        }
    }, {
        key: 'generateId',
        value: function generateId() {
            // Generate an unique ID for each datepicker
            var id = '';

            // Use input ID if set
            if (this.input.id) {
                id += this.input.id;
                // Otherwise create a random string
            } else {
                // @todo - Is a date string unique enough?
                id += Date.now();
            }

            return id;
        }
    }, {
        key: 'createDom',
        value: function createDom() {
            var domString = this.createDatepickerDomString();

            // Insert the datepicker in the document
            this.parent.insertAdjacentHTML('beforeend', domString);

            // Store our datepicker in a property
            this.datepicker = document.getElementById(this.getDatepickerId());
        }
    }, {
        key: 'createDatepickerDomString',
        value: function createDatepickerDomString() {
            // Generate our datepicker
            var html = '<div id="' + this.getDatepickerId() + '" style="display:none" class="datepicker datepicker--closed">';

            html += '<div class="datepicker__inner">';

            // Top bar section
            html += '<div class="datepicker__topbar">' + '<div class="datepicker__info datepicker__info--selected"><span class="datepicker__info datepicker__info--selected-label">' + this.lang('selected') + ' </span> <strong class="datepicker__info-text datepicker__info-text--start-day">...</strong>' + ' <span class="datepicker__info-text datepicker__info--separator">' + this.separator + '</span> <strong class="datepicker__info-text datepicker__info-text--end-day">...</strong> <em class="datepicker__info-text datepicker__info-text--selected-days">(<span></span>)</em>' + '</div>' + '<div class="datepicker__info datepicker__info--feedback"></div>' + '<button type="button" id="' + this.getCloseButtonId() + '" class="datepicker__close-button">' + this.lang('button') + '</button>' + '</div>';

            // Months section
            html += '<div class="datepicker__months">';

            // Print single months
            for (var i = 1; i <= 2; i++) {
                html += '<table id="' + this.getMonthTableId(i) + '" class="datepicker__month datepicker__month--month' + i + '"><thead><tr class="datepicker__month-caption"><th><span class="datepicker__month-button datepicker__month-button--prev" month="' + i + '">&lt;</span></th><th colspan="5" class="datepicker__month-name"></th><th><span class="datepicker__month-button datepicker__month-button--next" month="' + i + '">&gt;</span></th></tr><tr class="datepicker__week-days">' + this.getWeekDayNames(i) + '</tr></thead><tbody></tbody></table>';
            }

            html += '</div>';

            // Tooltip
            html += '<div style="display:none" id="' + this.getTooltipId() + '" class="datepicker__tooltip"></div>';

            html += '</div>';

            html += '</div>';

            return html;
        }
    }, {
        key: 'showMonth',
        value: function showMonth(date, month) {
            // Show month table and create the necessary HTML code
            var name = this.getMonthName(date.getMonth());
            var monthDom = this.getMonthDom(month);
            var monthName = monthDom.getElementsByClassName('datepicker__month-name')[0];
            var monthBody = monthDom.getElementsByTagName('tbody')[0];

            // Month caption
            monthName.textContent = name + ' ' + date.getFullYear();

            // Remove child elements before to insert the new month
            this.emptyElement(monthBody);

            // Append the month
            monthBody.insertAdjacentHTML('beforeend', this.createMonthDomString(date));

            // Check day dates
            this.updateSelectableRange();

            // Store current month dates
            this['month' + month] = date;
        }
    }, {
        key: 'createMonthDomString',
        value: function createMonthDomString(_date) {
            var days = [];
            var html = '';
            var valid = void 0;
            _date.setDate(1);

            var dayOfWeek = _date.getDay();
            var currentMonth = _date.getMonth();

            if (dayOfWeek === 0 && this.startOfWeek === 'monday') {
                // Add one week
                dayOfWeek = 7;
            }

            // If the first day is in the middle of the week, push also
            // the first days of the week (the days before our first day).
            // We need a complete week row.
            // Obviously, these days are part of the previous month.
            if (dayOfWeek > 0) {
                for (var i = dayOfWeek; i > 0; i--) {
                    var _day = new Date(_date.getTime() - 86400000 * i);

                    // Check if the day is valid. And pass this property to the days object
                    valid = this.isValidDate(_day.getTime());

                    if (this.startDate && this.compareDay(_day, this.startDate) < 0 || this.endDate && this.compareDay(_day, this.endDate) > 0) {
                        valid = false;
                    }

                    // We pass the type property to know if the day is part of the
                    // previous month. We already know that it is true.
                    days.push({
                        date: _day,
                        type: 'lastMonth',
                        day: _day.getDate(),
                        time: _day.getTime(),
                        valid: valid
                    });
                }
            }

            // Push 40 days. Each month table needs the days of the month plus
            // the remaining days (of the week row) before the first day of the month
            // and after the last day of the month. (PS. They will be hidden)
            // 40 days are enough to cover all the possibilities.
            for (var _i3 = 0; _i3 < 40; _i3++) {
                var _day2 = this.addDays(_date, _i3);

                // Check if the day is valid. And pass this property to the days object
                valid = this.isValidDate(_day2.getTime());

                if (this.startDate && this.compareDay(_day2, this.startDate) < 0 || this.endDate && this.compareDay(_day2, this.endDate) > 0) {
                    valid = false;
                }

                // We pass the type property to know if the day is part of the
                // current month or part of the next month
                days.push({
                    date: _day2,
                    type: _day2.getMonth() === currentMonth ? 'visibleMonth' : 'nextMonth',
                    day: _day2.getDate(),
                    time: _day2.getTime(),
                    valid: valid
                });
            }

            // Create the week rows.
            for (var week = 0; week < 6; week++) {
                // Iterate the days object week by week.
                // If the last day is part of the next month, stop the loop.
                if (days[week * 7].type === 'nextMonth') {
                    break;
                }

                // Flag for disabled dates
                var flag = 0;

                html += '<tr class="datepicker__week-row">';

                // Create the days of a week, one by one
                for (var _i4 = 0; _i4 < 7; _i4++) {
                    var _day3 = this.startOfWeek === 'monday' ? _i4 + 1 : _i4;
                    _day3 = days[week * 7 + _day3];
                    var isToday = this.getDateString(_day3.time) === this.getDateString(new Date());
                    var isDisabled = false;

                    // Check if the day is one of the days passed in the
                    // (optional) disabledDates option. And set valid to
                    // false in this case.
                    if (_day3.valid && this.disabledDates.length > 0) {
                        if (this.disabledDates.indexOf(this.getDateString(_day3.time, 'YYYY-MM-DD')) > -1) {
                            _day3.valid = false;
                            isDisabled = true;

                            flag++;
                        } else {
                            flag = 0;
                        }
                    }

                    // Each day has the "time" attribute (timestamp) and an appropriate class
                    var dayAttributes = {
                        time: _day3.time,
                        class: 'datepicker__month-day--' + _day3.type + ' datepicker__month-day--' + (_day3.valid ? 'valid' : 'invalid') + ' ' + (isToday ? 'datepicker__month-day--today' : '') + ' ' + (isDisabled ? 'datepicker__month-day--disabled' : '') + ' ' + (isDisabled && this.enableCheckout && flag === 1 ? 'datepicker__month-day--checkout-enabled' : '')
                    };

                    // Create the day HTML
                    html += '<td class="datepicker__month-day ' + dayAttributes.class + '" ' + this.printAttributes(dayAttributes) + '>' + _day3.day + '</td>';
                }

                html += '</tr>';
            }

            return html;
        }
    }, {
        key: 'openDatepicker',
        value: function openDatepicker() {
            // Open the datepicker
            if (!this.isOpen) {
                // Add/remove helper classes
                this.removeClass(this.datepicker, 'datepicker--closed');
                this.addClass(this.datepicker, 'datepicker--open');

                // Set (and check) the range value based on the current input value
                this.checkAndSetDefaultValue();

                // Slide down the datepicker
                this.slideDown(this.datepicker, this.animationSpeed);

                // Set flag
                this.isOpen = true;

                // Show selected days in the calendar
                this.showSelectedDays();

                // Disable (if needed) the prev/next buttons
                this.disableNextPrevButtons();
            }
        }
    }, {
        key: 'closeDatepicker',
        value: function closeDatepicker() {
            // Close the datepicker
            if (!this.isOpen) {
                return;
            }

            // Add/remove helper classes
            this.removeClass(this.datepicker, 'datepicker--open');
            this.addClass(this.datepicker, 'datepicker--closed');

            // Slide up the datepicker
            this.slideUp(this.datepicker, this.animationSpeed);
            this.isOpen = false;
        }
    }, {
        key: 'autoclose',
        value: function autoclose() {
            // Autoclose the datepicker when the second date is set
            if (this.autoClose && this.changed && this.isOpen && this.start && this.end) {
                this.closeDatepicker();
            }
        }
    }, {
        key: 'documentClick',
        value: function documentClick(evt) {
            // Check if the click was outside the datepicker and close it
            if (!this.parent.contains(evt.target) && evt.target !== this.input) {
                this.closeDatepicker();
            } else if (evt.target.tagName.toLowerCase() === 'td') {
                // Check if the click was on a calendar day
                this.dayClicked(evt.target);
            }
        }
    }, {
        key: 'documentHover',
        value: function documentHover(evt) {
            // Check if the hover is on a calendar day
            if (evt.target.tagName && evt.target.tagName.toLowerCase() === 'td') {
                this.dayHovering(evt.target);
            }
        }
    }, {
        key: 'documentMouseOut',
        value: function documentMouseOut(evt) {
            // Check if the mouseout is on a calendar day
            if (evt.target.tagName && evt.target.tagName.toLowerCase() === 'td') {
                // Hide the tooltip
                var tooltipContainer = document.getElementById(this.getTooltipId());
                tooltipContainer.style.display = 'none';
            }
        }
    }, {
        key: 'checkAndSetDefaultValue',
        value: function checkAndSetDefaultValue() {
            // Set range based on the input value

            // Get dates from input value
            var value = this.getValue();
            var dates = value ? value.split(this.separator) : '';

            // If we have our two dates, set the date range
            if (dates && dates.length >= 2) {
                // Format the values correctly
                var _format = this.format;

                if (_format.match(/Do/)) {
                    _format = _format.replace(/Do/, 'D');
                    dates[0] = dates[0].replace(/(\d+)(th|nd|st)/, '$1');
                    dates[1] = dates[1].replace(/(\d+)(th|nd|st)/, '$1');
                }

                // Set the date range
                this.changed = false;
                this.setDateRange(this.parseDate(dates[0], _format), this.parseDate(dates[1], _format));
                this.changed = true;
            } else {
                var selectedInfo = this.datepicker.getElementsByClassName('datepicker__info--selected')[0];
                selectedInfo.style.display = 'none';
            }
        }
    }, {
        key: 'setDateRange',
        value: function setDateRange(date1, date2) {
            // Swap dates if needed
            if (date1.getTime() > date2.getTime()) {
                var tmp = date2;

                date2 = date1;
                date1 = tmp;
                tmp = null;
            }

            var valid = true;

            // Check the validity of the dates
            if (this.startDate && this.compareDay(date1, this.startDate) < 0 || this.endDate && this.compareDay(date2, this.endDate) > 0) {
                valid = false;
            }

            // If not valid, reset the datepicker
            if (!valid) {
                // Show default (initial) months
                this.showMonth(this.startDate, 1);
                this.showMonth(this.getNextMonth(this.startDate), 2);

                // Show selected days in the calendar
                this.showSelectedDays();

                // Disable (if needed) the prev/next buttons
                this.disableNextPrevButtons();

                return;
            }

            // Fix DST
            date1.setTime(date1.getTime() + 12 * 60 * 60 * 1000);
            date2.setTime(date2.getTime() + 12 * 60 * 60 * 1000);

            // Calculate the next month value
            this.start = date1.getTime();
            this.end = date2.getTime();

            if (this.compareDay(date1, date2) > 0 && this.compareMonth(date1, date2) === 0) {
                date2 = this.getNextMonth(date1);
            }

            if (this.compareMonth(date1, date2) === 0) {
                date2 = this.getNextMonth(date1);
            }

            // Show the months
            this.showMonth(date1, 1);
            this.showMonth(date2, 2);

            // Show selected days in the calendar
            this.showSelectedDays();

            // Disable (if needed) the prev/next buttons
            this.disableNextPrevButtons();

            // Check the selection
            this.checkSelection();

            // Show selected dates in top bar
            this.showSelectedInfo();

            // Close the datepicker
            this.autoclose();
        }
    }, {
        key: 'showSelectedDays',
        value: function showSelectedDays() {
            // Show selected days in the calendar

            // Return early if we don't have the start and end dates
            if (!this.start && !this.end) {
                return;
            }

            // Get every td in the months table: our days
            var days = this.datepicker.getElementsByTagName('td');

            // Iterate each day and assign an appropriate HTML class
            // if they are selected in the date range
            for (var i = 0; i < days.length; i++) {
                var time = parseInt(days[i].getAttribute('time'), 10);

                // Add selected class
                if (this.start && this.end && this.end >= time && this.start <= time || this.start && !this.end && this.getDateString(this.start, 'YYYY-MM-DD') === this.getDateString(time, 'YYYY-MM-DD')) {
                    this.addClass(days[i], 'datepicker__month-day--selected');
                } else {
                    this.removeClass(days[i], 'datepicker__month-day--selected');
                }

                // Add class to the first day of the range
                if (this.start && this.getDateString(this.start, 'YYYY-MM-DD') === this.getDateString(time, 'YYYY-MM-DD')) {
                    this.addClass(days[i], 'datepicker__month-day--first-day-selected');
                } else {
                    this.removeClass(days[i], 'datepicker__month-day--first-day-selected');
                }

                // Add class to the last day of the range
                if (this.end && this.getDateString(this.end, 'YYYY-MM-DD') === this.getDateString(time, 'YYYY-MM-DD')) {
                    this.addClass(days[i], 'datepicker__month-day--last-day-selected');
                } else {
                    this.removeClass(days[i], 'datepicker__month-day--last-day-selected');
                }
            }
        }
    }, {
        key: 'showSelectedInfo',
        value: function showSelectedInfo() {
            // Show selected range in top bar
            var selectedInfo = this.datepicker.getElementsByClassName('datepicker__info--selected')[0];
            var elStart = selectedInfo.getElementsByClassName('datepicker__info-text--start-day')[0];
            var elEnd = selectedInfo.getElementsByClassName('datepicker__info-text--end-day')[0];
            var elSelected = selectedInfo.getElementsByClassName('datepicker__info-text--selected-days')[0];
            var closeButton = document.getElementById(this.getCloseButtonId());

            // Set default text and hide the count element
            elStart.textContent = '...';
            elEnd.textContent = '...';
            elSelected.style.display = 'none';

            // Show first date
            if (this.start) {
                selectedInfo.style.display = '';
                elStart.textContent = this.getDateString(new Date(parseInt(this.start, 10)), this.infoFormat);
            }

            // Show second date
            if (this.end) {
                elEnd.textContent = this.getDateString(new Date(parseInt(this.end, 10)), this.infoFormat);
            }

            // If both dates are set, show the count and set the value of our input
            if (this.start && this.end) {
                var count = this.countDays(this.end, this.start) - 1;
                var countText = count === 1 ? count + ' ' + this.lang('night') : count + ' ' + this.lang('nights');
                var dateRangeValue = this.getDateString(new Date(this.start)) + this.separator + this.getDateString(new Date(this.end));

                // Show count
                elSelected.style.display = '';
                elSelected.firstElementChild.textContent = countText;
                closeButton.disabled = false;

                // Set input value
                this.setValue(dateRangeValue, this.getDateString(new Date(this.start)), this.getDateString(new Date(this.end)));
                this.changed = true;
            } else {
                // Disable the close button until a valid date range
                closeButton.disabled = true;
            }
        }
    }, {
        key: 'dayClicked',
        value: function dayClicked(day) {
            if (this.hasClass(day, 'datepicker__month-day--invalid')) {
                return;
            }

            var time = parseInt(day.getAttribute('time'), 10);
            this.addClass(day, 'datepicker__month-day--selected');

            if (this.start && this.end || !this.start && !this.end) {
                this.start = time;
                this.end = false;
            } else if (this.start) {
                this.end = time;
            }

            // Swap dates if they are inverted
            if (this.start && this.end && this.start > this.end) {
                var tmp = this.end;

                this.end = this.start;
                this.start = tmp;
            }

            this.start = parseInt(this.start, 10);
            this.end = parseInt(this.end, 10);

            // Remove hovering class from every day and hide tooltip
            this.clearHovering();

            // Show hover
            if (this.start && !this.end) {
                // Add hovering class
                this.dayHovering(day);
            }

            // Check day dates
            this.updateSelectableRange();

            // Check the selection
            this.checkSelection();

            // Show selected dates in top bar
            this.showSelectedInfo();

            // Show selected days in the calendar
            this.showSelectedDays();

            // Close the datepicker
            this.autoclose();
        }
    }, {
        key: 'isValidDate',
        value: function isValidDate(time) {
            // Check if the date is valid
            time = parseInt(time, 10);

            if (this.startDate && this.compareDay(time, this.startDate) < 0 || this.endDate && this.compareDay(time, this.endDate) > 0) {
                return false;
            }

            // Update valid dates during the selection
            if (this.start && !this.end) {
                // Check maximum/minimum days
                if (this.maxDays > 0 && this.countDays(time, this.start) > this.maxDays || this.minDays > 0 && this.countDays(time, this.start) < this.minDays) {
                    return false;
                }

                // Check if date is before first date of range
                if (this.selectForward && time < this.start) {
                    return false;
                }

                // Check the disabled dates
                if (this.disabledDates.length > 0) {
                    var limit = this.getClosestDates(new Date(parseInt(this.start, 10)));

                    if (limit[0] && this.compareDay(time, limit[0]) <= 0) {
                        return false;
                    }

                    if (limit[1] && this.compareDay(time, limit[1]) >= 0) {
                        return false;
                    }
                }
            }

            return true;
        }
    }, {
        key: 'checkSelection',
        value: function checkSelection() {
            var numberOfDays = Math.ceil((this.end - this.start) / 86400000) + 1;
            var bar = this.datepicker.getElementsByClassName('datepicker__info--feedback')[0];

            if (this.maxDays && numberOfDays > this.maxDays) {
                this.start = false;
                this.end = false;

                // Remove selected class from each day
                var days = this.datepicker.getElementsByTagName('td');
                for (var i = 0; i < days.length; i++) {
                    this.removeClass(days[i], 'datepicker__month-day--selected');
                    this.removeClass(days[i], 'datepicker__month-day--first-day-selected');
                    this.removeClass(days[i], 'datepicker__month-day--last-day-selected');
                }

                // Show error in top bar
                var errorValue = this.maxDays - 1;
                this.topBarErrorText(bar, 'error-more', errorValue);
            } else if (this.minDays && numberOfDays < this.minDays) {
                this.start = false;
                this.end = false;

                // Remove selected class from each day
                var _days = this.datepicker.getElementsByTagName('td');
                for (var _i5 = 0; _i5 < _days.length; _i5++) {
                    this.removeClass(_days[_i5], 'datepicker__month-day--selected');
                    this.removeClass(_days[_i5], 'datepicker__month-day--first-day-selected');
                    this.removeClass(_days[_i5], 'datepicker__month-day--last-day-selected');
                }

                // Show error in top bar
                var _errorValue = this.minDays - 1;
                this.topBarErrorText(bar, 'error-less', _errorValue);
            } else if (this.start || this.end) {
                // Remove error and help classes from top bar
                this.removeClass(bar, 'datepicker__info--error');
                this.removeClass(bar, 'datepicker__info--help');
            } else {
                // Show help message
                this.removeClass(bar, 'datepicker__info--error');
                this.addClass(bar, 'datepicker__info--help');
            }
        }
    }, {
        key: 'addDays',
        value: function addDays(date, days) {
            // Add xx days to date
            var result = new Date(date);

            result.setDate(result.getDate() + days);

            return result;
        }
    }, {
        key: 'countDays',
        value: function countDays(start, end) {
            // Return days between two dates
            return Math.abs(this.daysFrom1970(start) - this.daysFrom1970(end)) + 1;
        }
    }, {
        key: 'compareDay',
        value: function compareDay(day1, day2) {
            // Compare two days: check if day1 is before/after/same day of day2
            var p = parseInt(this.getDateString(day1, 'YYYYMMDD'), 10) - parseInt(this.getDateString(day2, 'YYYYMMDD'), 10);

            if (p > 0) {
                return 1;
            }

            if (p === 0) {
                return 0;
            }

            return -1;
        }
    }, {
        key: 'compareMonth',
        value: function compareMonth(month1, month2) {
            // Compare two months: check if month1 is before/after/same month of month2
            var p = parseInt(this.getDateString(month1, 'YYYYMM'), 10) - parseInt(this.getDateString(month2, 'YYYYMM'), 10);

            if (p > 0) {
                return 1;
            }

            if (p === 0) {
                return 0;
            }

            return -1;
        }
    }, {
        key: 'daysFrom1970',
        value: function daysFrom1970(t) {
            // Get days from 1970
            return Math.floor(this.toLocalTimestamp(t) / 86400000);
        }
    }, {
        key: 'toLocalTimestamp',
        value: function toLocalTimestamp(t) {
            // Convert timestamp to local timestamp
            if ((typeof t === 'undefined' ? 'undefined' : _typeof(t)) === 'object' && t.getTime) {
                t = t.getTime();
            }

            if (typeof t === 'string' && !t.match(/\d{13}/)) {
                t = this.parseDate(t).getTime();
            }

            t = parseInt(t, 10) - new Date().getTimezoneOffset() * 60 * 1000;

            return t;
        }
    }, {
        key: 'printAttributes',
        value: function printAttributes(obj) {
            // Print object attributes in a DOM element
            var _obj = obj;
            var attribute = '';

            for (var attr in obj) {
                if (Object.prototype.hasOwnProperty.call(_obj, attr)) {
                    attribute += attr + '="' + _obj[attr] + '" ';
                }
            }

            return attribute;
        }
    }, {
        key: 'goToNextMonth',
        value: function goToNextMonth(e) {
            // Go to the next month
            var thisMonth = e.target.getAttribute('month');
            var isMonth2 = thisMonth > 1;
            var nextMonth = isMonth2 ? this.month2 : this.month1;

            nextMonth = this.getNextMonth(nextMonth);

            // Dont't go to the next month if:
            // 1. The second month is visible and it is the next month after
            //    our current month
            // 2. The month is after the (optional) endDate. There's no need
            //    to show other months in this case.
            if (!this.isSingleMonth() && !isMonth2 && this.compareMonth(nextMonth, this.month2) >= 0 || this.isMonthOutOfRange(nextMonth)) {
                return;
            }

            // We can now show the month and proceed
            this.showMonth(nextMonth, thisMonth);
            this.showSelectedDays();
            this.disableNextPrevButtons();
        }
    }, {
        key: 'goToPreviousMonth',
        value: function goToPreviousMonth(e) {
            // Go to the previous month
            var thisMonth = e.target.getAttribute('month');
            var isMonth2 = thisMonth > 1;
            var prevMonth = isMonth2 ? this.month2 : this.month1;

            prevMonth = this.getPrevMonth(prevMonth);

            // Dont't go to the previous month if:
            // 1. The click it's in the second month and the month we need is already
            //    shown in the first month
            // 2. The month is before the (optional) startDate. There's no need
            //    to show other months in this case.
            if (isMonth2 && this.compareMonth(prevMonth, this.month1) <= 0 || this.isMonthOutOfRange(prevMonth)) {
                return;
            }

            // We can now show the month and proceed
            this.showMonth(prevMonth, thisMonth);
            this.showSelectedDays();
            this.disableNextPrevButtons();
        }
    }, {
        key: 'isSingleMonth',
        value: function isSingleMonth() {
            // Check if the second month is visible
            return !this.isVisible(this.getMonthDom(2));
        }
    }, {
        key: 'isMonthOutOfRange',
        value: function isMonthOutOfRange(month) {
            var _m = new Date(month.valueOf());

            // Return true for months before the startDate and months after the endDate
            if (this.startDate && new Date(_m.getFullYear(), _m.getMonth() + 1, 0, 23, 59, 59) < this.startDate || this.endDate && new Date(_m.getFullYear(), _m.getMonth(), 1) > this.endDate) {
                return true;
            }

            return false;
        }

        // Disable next/prev buttons according to the value of the prev/next
        // month. We don't want two same months at the same time!

    }, {
        key: 'disableNextPrevButtons',
        value: function disableNextPrevButtons() {
            if (this.isSingleMonth()) {
                return;
            }

            var month1 = parseInt(this.getDateString(this.month1, 'YYYYMM'), 10);
            var month2 = parseInt(this.getDateString(this.month2, 'YYYYMM'), 10);
            var d = Math.abs(month1 - month2);

            // First month "next" month button
            var nextButton = this.datepicker.getElementsByClassName('datepicker__month-button--next')[0];

            // Second month "previous" month button
            var prevButton = this.datepicker.getElementsByClassName('datepicker__month-button--prev')[1];

            if (d > 1 && d !== 89) {
                this.removeClass(nextButton, 'datepicker__month-button--disabled');
                this.removeClass(prevButton, 'datepicker__month-button--disabled');
            } else {
                this.addClass(nextButton, 'datepicker__month-button--disabled');
                this.addClass(prevButton, 'datepicker__month-button--disabled');
            }
        }
    }, {
        key: 'topBarDefaultText',
        value: function topBarDefaultText() {
            // Show help message on top bar
            var topBarText = '';

            if (this.minDays && this.maxDays) {
                topBarText = this.lang('info-range');
            } else if (this.minDays && this.minDays > 2) {
                topBarText = this.lang('info-more-plural');
            } else if (this.minDays) {
                topBarText = this.lang('info-more');
            } else {
                topBarText = this.lang('info-default');
            }

            var bar = this.datepicker.getElementsByClassName('datepicker__info--feedback')[0];
            topBarText = topBarText.replace(/%d/, this.minDays - 1).replace(/%d/, this.maxDays - 1);
            this.addClass(bar, 'datepicker__info--help');
            this.removeClass(bar, 'datepicker__info--error');
            bar.textContent = topBarText;
        }
    }, {
        key: 'topBarErrorText',
        value: function topBarErrorText(bar, errorText, errorValue) {
            // Show error message on top bar
            this.addClass(bar, 'datepicker__info--error');
            this.removeClass(bar, 'datepicker__info--help');

            if (errorValue > 1) {
                errorText = this.lang(errorText + '-plural');
                errorText = errorText.replace('%d', errorValue);
                bar.textContent = errorText;
            } else {
                errorText = this.lang(errorText);
            }

            // And hide the selected info
            var selectedInfo = this.datepicker.getElementsByClassName('datepicker__info--selected')[0];
            selectedInfo.style.display = 'none';
        }
    }, {
        key: 'updateSelectableRange',
        value: function updateSelectableRange() {
            var days = this.datepicker.getElementsByTagName('td');
            var isSelecting = this.start && !this.end;

            // Add needed classes
            for (var i = 0; i < days.length; i++) {
                if (this.hasClass(days[i], 'datepicker__month-day--invalid') && this.hasClass(days[i], 'datepicker__month-day--tmp')) {
                    this.removeClass(days[i], 'datepicker__month-day--invalid');
                    this.removeClass(days[i], 'datepicker__month-day--tmp');
                    this.addClass(days[i], 'datepicker__month-day--valid');
                }

                // Update day classes during the date range selection
                if (isSelecting) {
                    if (this.hasClass(days[i], 'datepicker__month-day--visibleMonth') && (this.hasClass(days[i], 'datepicker__month-day--valid') || this.hasClass(days[i], 'datepicker__month-day--disabled'))) {
                        var time = parseInt(days[i].getAttribute('time'), 10);

                        if (this.isValidDate(time)) {
                            this.addClass(days[i], 'datepicker__month-day--valid');
                            this.addClass(days[i], 'datepicker__month-day--tmp');
                            this.removeClass(days[i], 'datepicker__month-day--invalid');
                            this.removeClass(days[i], 'datepicker__month-day--disabled');
                        } else {
                            this.addClass(days[i], 'datepicker__month-day--invalid');
                            this.addClass(days[i], 'datepicker__month-day--tmp');
                            this.removeClass(days[i], 'datepicker__month-day--valid');
                        }
                    }
                }
            }

            return true;
        }
    }, {
        key: 'dayHovering',
        value: function dayHovering(day) {
            var hoverTime = parseInt(day.getAttribute('time'), 10);
            var tooltip = '';

            if (!this.hasClass(day, 'datepicker__month-day--invalid')) {
                // Get every td in the months table: our days
                var days = this.datepicker.getElementsByTagName('td');

                // Iterate each day and add the hovering class
                for (var i = 0; i < days.length; i++) {
                    var time = parseInt(days[i].getAttribute('time'), 10);

                    if (time === hoverTime) {
                        this.addClass(days[i], 'datepicker__month-day--hovering');
                    } else {
                        this.removeClass(days[i], 'datepicker__month-day--hovering');
                    }

                    if (this.start && !this.end && (this.start < time && hoverTime >= time || this.start > time && hoverTime <= time)) {
                        this.addClass(days[i], 'datepicker__month-day--hovering');
                    } else {
                        this.removeClass(days[i], 'datepicker__month-day--hovering');
                    }
                }

                // Generate date range tooltip
                if (this.start && !this.end) {
                    var nights = this.countDays(hoverTime, this.start) - 1;

                    if (this.hoveringTooltip) {
                        if (typeof this.hoveringTooltip === 'function') {
                            tooltip = this.hoveringTooltip(nights, this.start, hoverTime);
                        } else if (this.hoveringTooltip === true && nights > 0) {
                            var label = nights === 1 ? this.lang('night') : this.lang('nights');
                            tooltip = nights + ' ' + label;
                        }
                    }
                }
            }

            // Show tooltip on hovering and set its position
            if (tooltip) {
                var dayBounding = day.getBoundingClientRect();
                var datepickerBounding = this.datepicker.getBoundingClientRect();
                var _left = dayBounding.left - datepickerBounding.left;
                var _top = dayBounding.top - datepickerBounding.top;

                _left += dayBounding.width / 2;

                var tooltipContainer = document.getElementById(this.getTooltipId());
                tooltipContainer.style.display = '';
                tooltipContainer.textContent = tooltip;
                var w = tooltipContainer.getBoundingClientRect().width;
                var h = tooltipContainer.getBoundingClientRect().height;

                _left -= w / 2;
                _top -= h;

                setTimeout(function () {
                    tooltipContainer.style.left = _left + 'px';
                    tooltipContainer.style.top = _top + 'px';
                }, 10);
            } else {
                var _tooltipContainer = document.getElementById(this.getTooltipId());
                _tooltipContainer.style.display = 'none';
            }
        }
    }, {
        key: 'clearHovering',
        value: function clearHovering() {
            // Remove hovering class from every day
            var days = this.datepicker.getElementsByTagName('td');
            for (var i = 0; i < days.length; i++) {
                this.removeClass(days[i], 'datepicker__month-day--hovering');
            }

            // Hide the tooltip
            var tooltipContainer = document.getElementById(this.getTooltipId());
            tooltipContainer.style.display = 'none';
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            // Reset start and end dates
            this.start = false;
            this.end = false;

            // Remove selected classes
            var days = this.datepicker.getElementsByTagName('td');
            for (var i = 0; i < days.length; i++) {
                this.removeClass(days[i], 'datepicker__month-day--selected');
                this.removeClass(days[i], 'datepicker__month-day--first-day-selected');
                this.removeClass(days[i], 'datepicker__month-day--last-day-selected');
            }

            // Reset input
            this.setValue('');

            // Check the selection
            this.checkSelection();

            // Show selected dates in top bar
            this.showSelectedInfo();

            // Show selected days in the calendar
            this.showSelectedDays();
        }
    }, {
        key: 'parseDisabledDates',
        value: function parseDisabledDates() {
            // Sort disabled dates and store it in property
            var _tmp = [];

            for (var i = 0; i < this.disabledDates.length; i++) {
                _tmp[i] = fecha.parse(this.disabledDates[i], 'YYYY-MM-DD');
            }

            _tmp.sort(function (a, b) {
                return a - b;
            });

            this.disabledDatesTime = _tmp;
        }
    }, {
        key: 'getClosestDates',
        value: function getClosestDates(x) {
            // This method implements part of the work done by the user Zeta
            // http://stackoverflow.com/a/11795472

            // Return an array with two elements:
            // - The closest date on the left
            // - The closest date on the right
            var dates = [false, false];

            // If the day is before the first disabled date return early
            if (x < this.disabledDatesTime[0]) {
                // Add one day if we want include the checkout
                if (this.enableCheckout) {
                    dates = [false, this.addDays(this.disabledDatesTime[0], 1)];
                    // Otherwise use the first date of the array
                } else {
                    dates = [false, this.disabledDatesTime[0]];
                }

                // If the day is after the last disabled date return early
            } else if (x > this.disabledDatesTime[this.disabledDatesTime.length - 1]) {
                dates = [this.disabledDatesTime[this.disabledDatesTime.length - 1], false];
                // Otherwise calculate the closest dates
            } else {
                var bestPrevDate = this.disabledDatesTime.length;
                var bestNextDate = this.disabledDatesTime.length;
                var maxDateValue = Math.abs(new Date(0, 0, 0).valueOf());
                var bestPrevDiff = maxDateValue;
                var bestNextDiff = -maxDateValue;
                var currDiff = 0;
                var i = void 0;

                for (i = 0; i < this.disabledDatesTime.length; ++i) {
                    currDiff = x - this.disabledDatesTime[i];

                    if (currDiff < 0 && currDiff > bestNextDiff) {
                        bestNextDate = i;
                        bestNextDiff = currDiff;
                    }

                    if (currDiff > 0 && currDiff < bestPrevDiff) {
                        bestPrevDate = i;
                        bestPrevDiff = currDiff;
                    }
                }

                if (this.disabledDatesTime[bestPrevDate]) {
                    dates[0] = this.disabledDatesTime[bestPrevDate];
                }

                if (typeof this.disabledDatesTime[bestPrevDate] === 'undefined') {
                    dates[1] = false;
                    // Add one day if we want include the checkout
                } else if (this.enableCheckout) {
                    dates[1] = this.addDays(this.disabledDatesTime[bestNextDate], 1);
                    // Otherwise use the date of the array
                } else {
                    dates[1] = this.disabledDatesTime[bestNextDate];
                }
            }

            return dates;
        }
    }, {
        key: 'lang',
        value: function lang(s) {
            // Return i18n string
            return s in this.i18n ? this.i18n[s] : '';
        }
    }, {
        key: 'emptyElement',
        value: function emptyElement(element) {
            // Remove all child elements of a DOM node
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }

        // Helper regex for DOM classes

    }, {
        key: 'classRegex',
        value: function classRegex(c) {
            return new RegExp('(^|\\s+)' + c + '(\\s+|$)');
        }

        // Check if an element has a class

    }, {
        key: 'hasClass',
        value: function hasClass(el, c) {
            return this.classRegex(c).test(el.className);
        }

        // Add a class to the element

    }, {
        key: 'addClass',
        value: function addClass(el, c) {
            if (!this.hasClass(el, c)) {
                el.className = el.className + ' ' + c;
            }
        }

        // Remove class from element

    }, {
        key: 'removeClass',
        value: function removeClass(el, c) {
            el.className = el.className.replace(this.classRegex(c), ' ');
        }
    }, {
        key: 'isVisible',
        value: function isVisible(element) {
            // Check if a DOM element is visible
            return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
        }
    }, {
        key: 'slideDown',
        value: function slideDown(element, speed) {
            // Slide down an element
            element.style.display = '';
            var h = element.getBoundingClientRect().height;
            element.style.height = 0;
            this.recalc(element.offsetHeight);
            element.style.transition = 'height ' + speed;
            element.style.height = h + 'px';
            element.addEventListener('transitionend', function () {
                element.style.height = element.style.transition = element.style.display = '';
            });
        }
    }, {
        key: 'slideUp',
        value: function slideUp(element, speed) {
            // Slide up an element
            var h = element.getBoundingClientRect().height;
            element.style.height = h + 'px';
            this.recalc(element.offsetHeight);
            element.style.transition = 'height ' + speed;
            element.style.height = 0;
            element.addEventListener('transitionend', function () {
                element.style.display = 'none';
            });
        }
    }, {
        key: 'recalc',
        value: function recalc(element) {
            // Force browser recalculation
            return element.offsetHeight;
        }
    }, {
        key: 'isTouchDevice',
        value: function isTouchDevice() {
            // This *does not* necessarily reflect a touchscreen device!!!
            // http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
            return 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
        }

        // ------------------ //
        //   PUBLIC METHODS   //
        // ------------------ //

    }, {
        key: 'open',
        value: function open() {
            this.openDatepicker();
        }
    }, {
        key: 'close',
        value: function close() {
            this.closeDatepicker();
        }
    }, {
        key: 'getDatePicker',
        value: function getDatePicker() {
            return this.datepicker;
        }
    }, {
        key: 'setRange',
        value: function setRange(d1, d2) {
            if (typeof d1 === 'string' && typeof d2 === 'string') {
                d1 = this.parseDate(d1);
                d2 = this.parseDate(d2);
            }

            this.setDateRange(d1, d2);
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.clearSelection();
        }
    }, {
        key: 'getNights',
        value: function getNights() {
            var count = 0;

            if (this.start && this.end) {
                count = this.countDays(this.end, this.start) - 1;
            } else {
                var value = this.getValue();
                var dates = value ? value.split(this.separator) : '';

                if (dates && dates.length >= 2) {
                    var _format = this.format;

                    if (_format.match(/Do/)) {
                        _format = _format.replace(/Do/, 'D');
                        dates[0] = dates[0].replace(/(\d+)(th|nd|st)/, '$1');
                        dates[1] = dates[1].replace(/(\d+)(th|nd|st)/, '$1');
                    }

                    count = this.countDays(this.parseDate(dates[0], _format), this.parseDate(dates[1], _format)) - 1;
                }
            }

            return count;
        }
    }]);

    return HotelDatepicker;
}();

exports.default = HotelDatepicker;