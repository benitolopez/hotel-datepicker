'use strict';
/* global fecha, DocumentTouch */
/* eslint-disable no-multi-assign */
let idCounter = 0;

export default class HotelDatepicker {
	constructor(input, options) {
		this._boundedEventHandlers = {};
		this.id = HotelDatepicker.getNewId();

        // Set default values
		const opts = options || {};

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
		this.noCheckInDates = opts.noCheckInDates || [];
		this.noCheckOutDates = opts.noCheckOutDates || [];
		this.disabledDaysOfWeek = opts.disabledDaysOfWeek || [];
		this.enableCheckout = opts.enableCheckout || false;
		this.preventContainerClose = opts.preventContainerClose || false;
		this.container = opts.container || '';
		this.animationSpeed = opts.animationSpeed || '.5s';
		this.hoveringTooltip = opts.hoveringTooltip || true; // Or a function
		this.autoClose = opts.autoClose === undefined ? true : opts.autoClose;
		this.showTopbar = opts.showTopbar === undefined ? true : opts.showTopbar;
		this.moveBothMonths = opts.moveBothMonths || false;
		this.i18n = opts.i18n || {
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
		};
		this.getValue = opts.getValue || function () {
			return input.value;
		};
		this.setValue = opts.setValue || function (s) {
			input.value = s;
		};
		this.onDayClick = opts.onDayClick === undefined ? false : opts.onDayClick;
		this.onOpenDatepicker = opts.onOpenDatepicker === undefined ? false : opts.onOpenDatepicker;
		this.onSelectRange = opts.onSelectRange === undefined ? false : opts.onSelectRange;

        // DOM input
		this.input = input;

        // Initialize the datepicker
		this.init();
	}

	addBoundedListener(node, event, handler, capture) {
		if (!(node in this._boundedEventHandlers)) {
            // _boundedEventHandlers stores references to nodes
			this._boundedEventHandlers[node] = {};
		}
		if (!(event in this._boundedEventHandlers[node])) {
            // Each entry contains another entry for each event type
			this._boundedEventHandlers[node][event] = [];
		}
        // Capture reference
		const boundedHandler = handler.bind(this);
		this._boundedEventHandlers[node][event].push([boundedHandler, capture]);
		node.addEventListener(event, boundedHandler, capture);
	}

	removeAllBoundedListeners(node, event) {
		if (node in this._boundedEventHandlers) {
			const handlers = this._boundedEventHandlers[node];
			if (event in handlers) {
				const eventHandlers = handlers[event];
				for (let i = eventHandlers.length; i--;) {
					const handler = eventHandlers[i];
					node.removeEventListener(event, handler[0], handler[1]);
				}
			}
		}
	}

	static getNewId() {
		return ++idCounter;
	}

	setFechaI18n() {
		fecha.setGlobalDateI18n({
			dayNamesShort: this.i18n['day-names-short'],
			dayNames: this.i18n['day-names'],
			monthNamesShort: this.i18n['month-names-short'],
			monthNames: this.i18n['month-names']
		});
	}

	getWeekDayNames() {
		let week = '';

        // Start from monday if we passed that option
		if (this.startOfWeek === 'monday') {
			for (let i = 0; i < 7; i++) {
				week += '<th class="datepicker__week-name">' + this.lang('day-names-short')[(1 + i) % 7] + '</th>';
			}

			return week;
		}

        // Otherwise start from sunday (default)
		for (let i = 0; i < 7; i++) {
			week += '<th class="datepicker__week-name">' + this.lang('day-names-short')[i] + '</th>';
		}

		return week;
	}

	getMonthDom(month) {
        // Get month DOM element
		return document.getElementById(this.getMonthTableId(month));
	}

	getMonthName(m) {
        // Get month name
		return this.lang('month-names')[m];
	}

	getDatepickerId() {
        // Get datepicker ID
		return 'datepicker-' + this.generateId();
	}

	getMonthTableId(month) {
        // Get month table ID
		return 'month-' + month + '-' + this.generateId();
	}

	getCloseButtonId() {
        // Get close button ID
		return 'close-' + this.generateId();
	}

	getTooltipId() {
        // Get close button ID
		return 'tooltip-' + this.generateId();
	}

	getNextMonth(month) {
        // Get next month date
		const _m = new Date(month.valueOf());

		return new Date(_m.setMonth(_m.getMonth() + 1, 1));
	}

	getPrevMonth(month) {
        // Get previous month date
		const _m = new Date(month.valueOf());

		return new Date(_m.setMonth(_m.getMonth() - 1, 1));
	}

	getDateString(date, format = this.format) {
        // Format date
		this.setFechaI18n();
		return fecha.format(date, format);
	}

	parseDate(date, format = this.format) {
        // Parse a date object
		this.setFechaI18n();
		return fecha.parse(date, format);
	}

	init() {
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
		let defaultTime = new Date();

		if (this.startDate && this.compareMonth(defaultTime, this.startDate) < 0) {
			defaultTime = new Date(this.startDate.getTime());
		}

		if (this.endDate && this.compareMonth(this.getNextMonth(defaultTime), this.endDate) > 0) {
			defaultTime = new Date(this.getPrevMonth(this.endDate.getTime()));
		}

		// Parse disabled dates
		if (this.disabledDates.length > 0) {
			this.parseDisabledDates();
		}

        // Show months
		this.showMonth(defaultTime, 1);
		this.showMonth(this.getNextMonth(defaultTime), 2);

		// Print default info in top bar
		this.topBarDefaultText();

        // Attach listeners
		this.addListeners();

		// Flag for first disabled date
		this.isFirstDisabledDate = 0;

		// Holds last disabled date
		this.lastDisabledDate = false;
	}

	addListeners() {
        // Next month button
		const nextButtons = this.datepicker.getElementsByClassName('datepicker__month-button--next');

		for (let i = 0; i < nextButtons.length; i++) {
			nextButtons[i].addEventListener('click', evt => this.goToNextMonth(evt));
		}

        // Previous month button
		const prevButtons = this.datepicker.getElementsByClassName('datepicker__month-button--prev');

		for (let i = 0; i < prevButtons.length; i++) {
			prevButtons[i].addEventListener('click', evt => this.goToPreviousMonth(evt));
		}

        // Open the datepicker on the input click
		this.addBoundedListener(this.input, 'click', evt => this.openDatepicker(evt));

		if (this.showTopbar) {
			// Close the datepicker on the button click
			document.getElementById(this.getCloseButtonId()).addEventListener('click', evt => this.closeDatepicker(evt));
		}

        // Close the datepicker on resize?
        // The problem is that mobile keyboards trigger the resize event closing
        // the datepicker. There are some workarounds (http://stackoverflow.com/q/14902321)
        // but for now I will disable this option. I'm open to new ideas.
        // window.addEventListener('resize', evt => this.closeDatepicker(evt));

        // Add a mouseover event listener to the document. This will help us to:
        // 1 - Handle the hover on calendar days
		this.datepicker.addEventListener('mouseover', evt => this.datepickerHover(evt));

        // Add a mouseout event listener to the document. This will help us to:
        // 1 - Hide the tooltip on the mouseout event on days
		this.datepicker.addEventListener('mouseout', evt => this.datepickerMouseOut(evt));

        // Update the selected values when the input changes manually
		this.addBoundedListener(this.input, 'change', () => this.checkAndSetDefaultValue());
	}

	generateId() {
        // Generate an unique ID for each datepicker
        // Use input ID if set
		if (this.input.id) {
			return this.input.id;
        // Otherwise get the instance id
		}
		return this.id;
	}

	createDom() {
		const domString = this.createDatepickerDomString();

        // Insert the datepicker in the document
		this.parent.insertAdjacentHTML('beforeend', domString);

        // Store our datepicker in a property
		this.datepicker = document.getElementById(this.getDatepickerId());
	}

	createDatepickerDomString() {
        // Generate our datepicker
		let html = '<div id="' + this.getDatepickerId() + '" style="display:none" class="datepicker datepicker--closed">';

		html += '<div class="datepicker__inner">';

		if (this.showTopbar) {
			// Top bar section
			html += '<div class="datepicker__topbar">' +
						'<div class="datepicker__info datepicker__info--selected"><span class="datepicker__info datepicker__info--selected-label">' + this.lang('selected') + ' </span> <strong class="datepicker__info-text datepicker__info-text--start-day">...</strong>' +
							' <span class="datepicker__info-text datepicker__info--separator">' + this.separator + '</span> <strong class="datepicker__info-text datepicker__info-text--end-day">...</strong> <em class="datepicker__info-text datepicker__info-text--selected-days">(<span></span>)</em>' +
						'</div>' +

						'<div class="datepicker__info datepicker__info--feedback"></div>' +

						'<button type="button" id="' + this.getCloseButtonId() + '" class="datepicker__close-button">' + this.lang('button') + '</button>' +
					'</div>';
		}

        // Months section
		html += '<div class="datepicker__months">';

        // Print single months
		for (let i = 1; i <= 2; i++) {
			html += '<table id="' + this.getMonthTableId(i) + '" class="datepicker__month datepicker__month--month' + i + '"><thead><tr class="datepicker__month-caption"><th><span class="datepicker__month-button datepicker__month-button--prev" month="' + i + '">&lt;</span></th><th colspan="5" class="datepicker__month-name"></th><th><span class="datepicker__month-button datepicker__month-button--next" month="' + i + '">&gt;</span></th></tr><tr class="datepicker__week-days">' + this.getWeekDayNames(i) + '</tr></thead><tbody></tbody></table>';
		}

		html += '</div>';

        // Tooltip
		html += '<div style="display:none" id="' + this.getTooltipId() + '" class="datepicker__tooltip"></div>';

		html += '</div>';

		html += '</div>';

		return html;
	}

	showMonth(date, month) {
        // Show month table and create the necessary HTML code
		const name = this.getMonthName(date.getMonth());
		const monthDom = this.getMonthDom(month);
		const monthName = monthDom.getElementsByClassName('datepicker__month-name')[0];
		const monthBody = monthDom.getElementsByTagName('tbody')[0];

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

	createMonthDomString(_date) {
		const days = [];
		let html = '';
		let valid;
		_date.setDate(1);

		let dayOfWeek = _date.getDay();
		const currentMonth = _date.getMonth();

		if ((dayOfWeek === 0) && (this.startOfWeek === 'monday')) {
            // Add one week
			dayOfWeek = 7;
		}

        // If the first day is in the middle of the week, push also
        // the first days of the week (the days before our first day).
        // We need a complete week row.
        // Obviously, these days are part of the previous month.
		if (dayOfWeek > 0) {
			for (let i = dayOfWeek; i > 0; i--) {
				const _day = new Date(_date.getTime() - (86400000 * i));

                // Check if the day is valid. And pass this property to the days object
				valid = this.isValidDate(_day.getTime());

				if ((this.startDate && this.compareDay(_day, this.startDate) < 0) || (this.endDate && this.compareDay(_day, this.endDate) > 0)) {
					valid = false;
				}

                // We pass the type property to know if the day is part of the
                // previous month. We already know that it is true.
				days.push({
					date: _day,
					type: 'lastMonth',
					day: _day.getDate(),
					time: _day.getTime(),
					valid
				});
			}
		}

        // Push 40 days. Each month table needs the days of the month plus
        // the remaining days (of the week row) before the first day of the month
        // and after the last day of the month. (PS. They will be hidden)
        // 40 days are enough to cover all the possibilities.
		for (let i = 0; i < 40; i++) {
			const _day = this.addDays(_date, i);

            // Check if the day is valid. And pass this property to the days object
			valid = this.isValidDate(_day.getTime());

			if ((this.startDate && this.compareDay(_day, this.startDate) < 0) || (this.endDate && this.compareDay(_day, this.endDate) > 0)) {
				valid = false;
			}

            // We pass the type property to know if the day is part of the
            // current month or part of the next month
			days.push({
				date: _day,
				type: _day.getMonth() === currentMonth ? 'visibleMonth' : 'nextMonth',
				day: _day.getDate(),
				time: _day.getTime(),
				valid
			});
		}

        // Create the week rows.
		for (let week = 0; week < 6; week++) {
            // Iterate the days object week by week.
            // If the last day is part of the next month, stop the loop.
			if (days[week * 7].type === 'nextMonth') {
				break;
			}

			html += '<tr class="datepicker__week-row">';

            // Create the days of a week, one by one
			for (let i = 0; i < 7; i++) {
				let _day = (this.startOfWeek === 'monday') ? i + 1 : i;
				_day = days[(week * 7) + _day];
				const isToday = this.getDateString(_day.time) === this.getDateString(new Date());
				const isStartDate = this.getDateString(_day.time) === this.getDateString(this.startDate);
				let isDisabled = false;
				let isNoCheckIn = false;
				let isNoCheckOut = false;
				let isDayOfWeekDisabled = false;
				let isFirstEnabledDate = false;

				// Day between disabled dates and the last day
				// before the disabled date
				let isDayBeforeDisabledDate = false;

                // Check if the day is one of the days passed in the
                // (optional) disabledDates option. And set valid to
                // false in this case.
                //
                // Also, check if the checkin or checkout is disabled
				if (_day.valid || _day.type === 'visibleMonth') {
					const dateString = this.getDateString(_day.time, 'YYYY-MM-DD');
					if (this.disabledDates.length > 0) {
						// Check if this day is between two disabled dates
						// and disable it if there are not enough days
						// available to select a valid range
						const limit = this.getClosestDates(_day.date);

						if (limit[0] && limit[1]) {
							if (this.compareDay(_day.date, limit[0]) && (this.countDays(limit[0], limit[1]) - 2) > 0) {
								const daysBeforeNextDisabledDate = this.countDays(limit[1], _day.date) - 1;
								const daysAfterPrevDisabledDate = this.countDays(_day.date, limit[0]) - 1;

								if (this.selectForward && daysBeforeNextDisabledDate < this.minDays) {
									_day.valid = false;
								} else if (!this.selectForward && daysBeforeNextDisabledDate < this.minDays && daysAfterPrevDisabledDate < this.minDays) {
									_day.valid = false;
								}

								if (!_day.valid && this.enableCheckout && daysBeforeNextDisabledDate === 2) {
									isDayBeforeDisabledDate = true;
								}
							}
						}

						if (this.disabledDates.indexOf(dateString) > -1) {
							_day.valid = false;
							isDisabled = true;

							this.isFirstDisabledDate++;

							// Store last disabled date for later
							this.lastDisabledDate = _day.date;
						} else {
							this.isFirstDisabledDate = 0;
						}

						// First day after a disabled day
						if (_day.valid && this.lastDisabledDate && this.compareDay(_day.date, this.lastDisabledDate) > 0 && this.countDays(_day.date, this.lastDisabledDate) === 2) {
							isFirstEnabledDate = true;
						}
					}

					if (this.disabledDaysOfWeek.length > 0) {
						if (this.disabledDaysOfWeek.indexOf(fecha.format(_day.time, 'dddd')) > -1) {
							_day.valid = false;
							isDayOfWeekDisabled = true;
						}
					}

					if (this.noCheckInDates.length > 0) {
						if (this.noCheckInDates.indexOf(dateString) > -1) {
							isNoCheckIn = true;
							isFirstEnabledDate = false;
						}
					}

					if (this.noCheckOutDates.length > 0) {
						if (this.noCheckOutDates.indexOf(dateString) > -1) {
							isNoCheckOut = true;
						}
					}
				}

				const classes = [
					'datepicker__month-day--' + _day.type,
					'datepicker__month-day--' + (_day.valid ? 'valid' : 'invalid'),
					isToday ? 'datepicker__month-day--today' : '',
					isDisabled ? 'datepicker__month-day--disabled' : '',
					isDisabled && this.enableCheckout && (this.isFirstDisabledDate === 1) ? 'datepicker__month-day--checkout-enabled' : '',
					isDayBeforeDisabledDate ? 'datepicker__month-day--before-disabled-date' : '',
					isStartDate || isFirstEnabledDate ? 'datepicker__month-day--checkin-only' : '',
					isNoCheckIn ? 'datepicker__month-day--no-checkin' : '',
					isNoCheckOut ? 'datepicker__month-day--no-checkout' : '',
					isDayOfWeekDisabled ? 'datepicker__month-day--day-of-week-disabled' : ''
				];

				// Add a title for those days where the checkin or checkout is disabled
				let title = '';

				if (isNoCheckIn) {
					title = this.i18n['checkin-disabled'];
				}

				if (isNoCheckOut) {
					if (title) {
						title += '. ';
					}

					title += this.i18n['checkout-disabled'];
				}

                // Each day has the "time" attribute (timestamp) and an appropriate class
				const dayAttributes = {
					time: _day.time,
					class: classes.join(' ')
				};

				// Add title attribute if available
				if (title) {
					dayAttributes.title = title;
				}

                // Create the day HTML
				html += '<td class="datepicker__month-day ' + dayAttributes.class + '" ' + this.printAttributes(dayAttributes) + '>' + _day.day + '</td>';
			}

			html += '</tr>';
		}

		return html;
	}

	openDatepicker() {
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

            // Add a click event listener to the document. This will help us to:
            // 1 - Check if the click it's outside the datepicker
            // 2 - Handle the click on calendar days
			this.addBoundedListener(document, 'click', evt => this.documentClick(evt));

			// Optionally run a function when the datepicker is open
			if (this.onOpenDatepicker) {
				this.onOpenDatepicker();
			}
		}
	}

	closeDatepicker() {
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

		// Create event on close
		const evt = document.createEvent('Event');
		evt.initEvent('afterClose', true, true);
		this.input.dispatchEvent(evt);

		this.removeAllBoundedListeners(document, 'click');
	}

	autoclose() {
        // Autoclose the datepicker when the second date is set
		if (this.autoClose && this.changed && this.isOpen && this.start && this.end) {
			this.closeDatepicker();
		}
	}

	documentClick(evt) {
        // Check if the click was outside the datepicker and close it
		if (!this.parent.contains(evt.target) && evt.target !== this.input) {
			if (!this.preventContainerClose) {
				this.closeDatepicker();
			}
		} else if (evt.target.tagName.toLowerCase() === 'td') {
            // Check if the click was on a calendar day
			this.dayClicked(evt.target);
		}
	}

	datepickerHover(evt) {
        // Check if the hover is on a calendar day
		if (evt.target.tagName && evt.target.tagName.toLowerCase() === 'td') {
			this.dayHovering(evt.target);
		}
	}

	datepickerMouseOut(evt) {
        // Check if the mouseout is on a calendar day
		if (evt.target.tagName && evt.target.tagName.toLowerCase() === 'td') {
            // Hide the tooltip
			const tooltipContainer = document.getElementById(this.getTooltipId());
			tooltipContainer.style.display = 'none';
		}
	}

	checkAndSetDefaultValue() {
        // Set range based on the input value

        // Get dates from input value
		const value = this.getValue();
		const dates = value ? value.split(this.separator) : '';

        // If we have our two dates, set the date range
		if (dates && (dates.length >= 2)) {
            // Format the values correctly
			const _format = this.format;

            // Set the date range
			this.changed = false;
			this.setDateRange(this.parseDate(dates[0], _format), this.parseDate(dates[1], _format));
			this.changed = true;
		} else if (this.showTopbar) {
			const selectedInfo = this.datepicker.getElementsByClassName('datepicker__info--selected')[0];
			selectedInfo.style.display = 'none';
		}
	}

	setDateRange(date1, date2) {
        // Swap dates if needed
		if (date1.getTime() > date2.getTime()) {
			let tmp = date2;

			date2 = date1;
			date1 = tmp;
			tmp = null;
		}

		let valid = true;

        // Check the validity of the dates
		if ((this.startDate && this.compareDay(date1, this.startDate) < 0) || (this.endDate && this.compareDay(date2, this.endDate) > 0)) {
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
		date1.setTime(date1.getTime() + (12 * 60 * 60 * 1000));
		date2.setTime(date2.getTime() + (12 * 60 * 60 * 1000));

        // Calculate the next month value
		this.start = date1.getTime();
		this.end = date2.getTime();

		if ((this.compareDay(date1, date2) > 0 && this.compareMonth(date1, date2) === 0)) {
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

	showSelectedDays() {
        // Show selected days in the calendar

        // Return early if we don't have the start and end dates
		if (!this.start && !this.end) {
			return;
		}

        // Get every td in the months table: our days
		const days = this.datepicker.getElementsByTagName('td');

        // Iterate each day and assign an appropriate HTML class
        // if they are selected in the date range
		for (let i = 0; i < days.length; i++) {
			const time = parseInt(days[i].getAttribute('time'), 10);

            // Add selected class
			if ((this.start && this.end && this.end >= time && this.start <= time) || (this.start && !this.end && this.getDateString(this.start, 'YYYY-MM-DD') === this.getDateString(time, 'YYYY-MM-DD'))) {
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

	showSelectedInfo() {
		// Return early if the top bar is disabled
		if (!this.showTopbar) {
			// If both dates are set, set the value of our input
			if (this.start && this.end) {
				const dateRangeValue = this.getDateString(new Date(this.start)) + this.separator + this.getDateString(new Date(this.end));

				// Set input value
				this.setValue(dateRangeValue, this.getDateString(new Date(this.start)), this.getDateString(new Date(this.end)));
				this.changed = true;
			}

			return;
		}

        // Show selected range in top bar
		const selectedInfo = this.datepicker.getElementsByClassName('datepicker__info--selected')[0];
		const elStart = selectedInfo.getElementsByClassName('datepicker__info-text--start-day')[0];
		const elEnd = selectedInfo.getElementsByClassName('datepicker__info-text--end-day')[0];
		const elSelected = selectedInfo.getElementsByClassName('datepicker__info-text--selected-days')[0];
		const closeButton = document.getElementById(this.getCloseButtonId());

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
			const count = this.countDays(this.end, this.start) - 1;
			const countText = count === 1 ? count + ' ' + this.lang('night') : count + ' ' + this.lang('nights');
			const dateRangeValue = this.getDateString(new Date(this.start)) + this.separator + this.getDateString(new Date(this.end));

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

	dayClicked(day) {
		if (this.hasClass(day, 'datepicker__month-day--invalid')) {
			return;
		}

		const isSelectStart = (this.start && this.end) || (!this.start && !this.end);

		// Return early for those days where the checkin or checkout is disabled
		if (isSelectStart) {
			if (this.hasClass(day, 'datepicker__month-day--no-checkin')) {
				return;
			}
		} else if (this.start) {
			if (this.hasClass(day, 'datepicker__month-day--no-checkout')) {
				return;
			}
		}

		const time = parseInt(day.getAttribute('time'), 10);
		this.addClass(day, 'datepicker__month-day--selected');

		if (isSelectStart) {
			this.start = time;
			this.end = false;
		} else if (this.start) {
			this.end = time;
		}

        // Swap dates if they are inverted
		if (this.start && this.end && this.start > this.end) {
			const tmp = this.end;

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

		// Optionally run a function when a day is clicked
		if (this.onDayClick) {
			this.onDayClick();
		}

        // Optionally run a function when a range is selected
		if (this.end && this.onSelectRange) {
			this.onSelectRange();
		}
	}

	isValidDate(time) {
        // Check if the date is valid
		time = parseInt(time, 10);

		if ((this.startDate && this.compareDay(time, this.startDate) < 0) || (this.endDate && this.compareDay(time, this.endDate) > 0)) {
			return false;
		}

        // Update valid dates during the selection
		if (this.start && !this.end) {
            // Check maximum/minimum days
			if ((this.maxDays > 0 && this.countDays(time, this.start) > this.maxDays) || (this.minDays > 0 && this.countDays(time, this.start) > 1 && this.countDays(time, this.start) < this.minDays)) {
				return false;
			}

            // Check if date is before first date of range
			if (this.selectForward && time < this.start) {
				return false;
			}

            // Check the disabled dates
			if (this.disabledDates.length > 0) {
				const limit = this.getClosestDates(new Date(parseInt(this.start, 10)));

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

	checkSelection() {
		const numberOfDays = this.countDays(this.end, this.start);
		const bar = this.showTopbar ? this.datepicker.getElementsByClassName('datepicker__info--feedback')[0] : false;

		if (this.maxDays && numberOfDays > this.maxDays) {
			this.start = false;
			this.end = false;

            // Remove selected class from each day
			const days = this.datepicker.getElementsByTagName('td');
			for (let i = 0; i < days.length; i++) {
				this.removeClass(days[i], 'datepicker__month-day--selected');
				this.removeClass(days[i], 'datepicker__month-day--first-day-selected');
				this.removeClass(days[i], 'datepicker__month-day--last-day-selected');
			}

			if (this.showTopbar) {
				// Show error in top bar
				const errorValue = this.maxDays - 1;
				this.topBarErrorText(bar, 'error-more', errorValue);
			}
		} else if (this.minDays && numberOfDays < this.minDays) {
			this.start = false;
			this.end = false;

            // Remove selected class from each day
			const days = this.datepicker.getElementsByTagName('td');
			for (let i = 0; i < days.length; i++) {
				this.removeClass(days[i], 'datepicker__month-day--selected');
				this.removeClass(days[i], 'datepicker__month-day--first-day-selected');
				this.removeClass(days[i], 'datepicker__month-day--last-day-selected');
			}

			if (this.showTopbar) {
				// Show error in top bar
				const errorValue = this.minDays - 1;
				this.topBarErrorText(bar, 'error-less', errorValue);
			}
		} else if (this.start || this.end) {
			if (this.showTopbar) {
				// Remove error and help classes from top bar
				this.removeClass(bar, 'datepicker__info--error');
				this.removeClass(bar, 'datepicker__info--help');
			}
		} else if (this.showTopbar) {
			// Show help message
			this.removeClass(bar, 'datepicker__info--error');
			this.addClass(bar, 'datepicker__info--help');
		}
	}

	addDays(date, days) {
        // Add xx days to date
		const result = new Date(date);

		result.setDate(result.getDate() + days);

		return result;
	}

	countDays(start, end) {
        // Return days between two dates
		return Math.abs(this.daysFrom1970(start) - this.daysFrom1970(end)) + 1;
	}

	compareDay(day1, day2) {
        // Compare two days: check if day1 is before/after/same day of day2
		const p = parseInt(this.getDateString(day1, 'YYYYMMDD'), 10) - parseInt(this.getDateString(day2, 'YYYYMMDD'), 10);

		if (p > 0) {
			return 1;
		}

		if (p === 0) {
			return 0;
		}

		return -1;
	}

	compareMonth(month1, month2) {
        // Compare two months: check if month1 is before/after/same month of month2
		const p = parseInt(this.getDateString(month1, 'YYYYMM'), 10) - parseInt(this.getDateString(month2, 'YYYYMM'), 10);

		if (p > 0) {
			return 1;
		}

		if (p === 0) {
			return 0;
		}

		return -1;
	}

	daysFrom1970(t) {
        // Get days from 1970
		return Math.floor(this.toLocalTimestamp(t) / 86400000);
	}

	toLocalTimestamp(t) {
        // Convert timestamp to local timestamp
		if (typeof t === 'object' && t.getTime) {
			t = t.getTime();
		}

		if (typeof t === 'string' && !t.match(/\d{13}/)) {
			t = this.parseDate(t).getTime();
		}

		t = parseInt(t, 10) - (new Date().getTimezoneOffset() * 60 * 1000);

		return t;
	}

	printAttributes(obj) {
        // Print object attributes in a DOM element
		const _obj = obj;
		let attribute = '';

		for (const attr in obj) {
			if (Object.prototype.hasOwnProperty.call(_obj, attr)) {
				attribute += attr + '="' + _obj[attr] + '" ';
			}
		}

		return attribute;
	}

	goToNextMonth(e) {
        // Go to the next month
		const thisMonth = e.target.getAttribute('month');
		const isMonth2 = thisMonth > 1;
		let nextMonth = isMonth2 ? this.month2 : this.month1;

		nextMonth = this.getNextMonth(nextMonth);

        // Dont't go to the next month if:
        // 1. The second month is visible and it is the next month after
        //    our current month
        // 2. The month is after the (optional) endDate. There's no need
        //    to show other months in this case.
		if ((!this.isSingleMonth() && !isMonth2 && this.compareMonth(nextMonth, this.month2) >= 0) || this.isMonthOutOfRange(nextMonth)) {
			return;
		}

        // We can now show the month and proceed
		if (this.moveBothMonths && isMonth2) {
			this.showMonth(this.month2, 1);
		}
		this.showMonth(nextMonth, thisMonth);
		this.showSelectedDays();
		this.disableNextPrevButtons();
	}

	goToPreviousMonth(e) {
        // Go to the previous month
		const thisMonth = e.target.getAttribute('month');
		const isMonth2 = thisMonth > 1;
		let prevMonth = isMonth2 ? this.month2 : this.month1;

		prevMonth = this.getPrevMonth(prevMonth);

        // Dont't go to the previous month if:
        // 1. The click it's in the second month and the month we need is already
        //    shown in the first month
        // 2. The month is before the (optional) startDate. There's no need
        //    to show other months in this case.
		if ((isMonth2 && this.compareMonth(prevMonth, this.month1) <= 0) || this.isMonthOutOfRange(prevMonth)) {
			return;
		}

        // We can now show the month and proceed
		if (this.moveBothMonths && !isMonth2) {
			this.showMonth(this.month1, 2);
		}
		this.showMonth(prevMonth, thisMonth);
		this.showSelectedDays();
		this.disableNextPrevButtons();
	}

	isSingleMonth() {
        // Check if the second month is visible
		return !this.isVisible(this.getMonthDom(2));
	}

	isMonthOutOfRange(month) {
		const _m = new Date(month.valueOf());

        // Return true for months before the startDate and months after the endDate
		if ((this.startDate && (new Date(_m.getFullYear(), _m.getMonth() + 1, 0, 23, 59, 59) < this.startDate)) || (this.endDate && (new Date(_m.getFullYear(), _m.getMonth(), 1) > this.endDate))) {
			return true;
		}

		return false;
	}

    // Disable next/prev buttons according to the value of the prev/next
    // month. We don't want two same months at the same time!
	disableNextPrevButtons() {
		if (this.isSingleMonth()) {
			return;
		}

		const month1 = parseInt(this.getDateString(this.month1, 'YYYYMM'), 10);
		const month2 = parseInt(this.getDateString(this.month2, 'YYYYMM'), 10);
		const d = Math.abs(month1 - month2);

		const nextButtons = this.datepicker.getElementsByClassName('datepicker__month-button--next');
		const prevButtons = this.datepicker.getElementsByClassName('datepicker__month-button--prev');

		if (d > 1 && d !== 89) {
			this.removeClass(nextButtons[0], 'datepicker__month-button--disabled');
			this.removeClass(prevButtons[1], 'datepicker__month-button--disabled');
		} else {
			this.addClass(nextButtons[0], 'datepicker__month-button--disabled');
			this.addClass(prevButtons[1], 'datepicker__month-button--disabled');
		}

		if (this.isMonthOutOfRange(this.getPrevMonth(this.month1))) {
			this.addClass(prevButtons[0], 'datepicker__month-button--disabled');
		} else {
			this.removeClass(prevButtons[0], 'datepicker__month-button--disabled');
		}
		if (this.isMonthOutOfRange(this.getNextMonth(this.month2))) {
			this.addClass(nextButtons[1], 'datepicker__month-button--disabled');
		} else {
			this.removeClass(nextButtons[1], 'datepicker__month-button--disabled');
		}
	}

	topBarDefaultText() {
		// Return early if the top bar is disabled
		if (!this.showTopbar) {
			return;
		}

        // Show help message on top bar
		let topBarText = '';

		if (this.minDays && this.maxDays) {
			topBarText = this.lang('info-range');
		} else if (this.minDays && this.minDays > 2) {
			topBarText = this.lang('info-more-plural');
		} else if (this.minDays) {
			topBarText = this.lang('info-more');
		} else {
			topBarText = this.lang('info-default');
		}

		const bar = this.datepicker.getElementsByClassName('datepicker__info--feedback')[0];
		topBarText = topBarText.replace(/%d/, (this.minDays - 1)).replace(/%d/, (this.maxDays - 1));
		this.addClass(bar, 'datepicker__info--help');
		this.removeClass(bar, 'datepicker__info--error');
		bar.textContent = topBarText;
	}

	topBarErrorText(bar, errorText, errorValue) {
		if (!this.showTopbar) {
			return;
		}

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
		const selectedInfo = this.datepicker.getElementsByClassName('datepicker__info--selected')[0];
		selectedInfo.style.display = 'none';
	}

	updateSelectableRange() {
		const days = this.datepicker.getElementsByTagName('td');
		const isSelecting = this.start && !this.end;

        // Add needed classes
		for (let i = 0; i < days.length; i++) {
			if (this.hasClass(days[i], 'datepicker__month-day--invalid') && this.hasClass(days[i], 'datepicker__month-day--tmp')) {
				this.removeClass(days[i], 'datepicker__month-day--tmp');
				if (this.hasClass(days[i], 'datepicker__month-day--tmpinvalid')) {
					this.removeClass(days[i], 'datepicker__month-day--tmpinvalid');
				} else {
					this.removeClass(days[i], 'datepicker__month-day--invalid');
					this.addClass(days[i], 'datepicker__month-day--valid');
				}
			}

            // Update day classes during the date range selection
			if (isSelecting) {
				if (this.hasClass(days[i], 'datepicker__month-day--visibleMonth') && (this.hasClass(days[i], 'datepicker__month-day--valid') || this.hasClass(days[i], 'datepicker__month-day--disabled') || this.hasClass(days[i], 'datepicker__month-day--before-disabled-date'))) {
					const time = parseInt(days[i].getAttribute('time'), 10);

					if (this.isValidDate(time)) {
						this.addClass(days[i], 'datepicker__month-day--valid');
						this.addClass(days[i], 'datepicker__month-day--tmp');
						this.removeClass(days[i], 'datepicker__month-day--invalid');
						this.removeClass(days[i], 'datepicker__month-day--disabled');
					} else {
						if (this.hasClass(days[i], 'datepicker__month-day--invalid')) {
							this.addClass(days[i], 'datepicker__month-day--tmpinvalid');
						}
						this.addClass(days[i], 'datepicker__month-day--invalid');
						this.addClass(days[i], 'datepicker__month-day--tmp');
						this.removeClass(days[i], 'datepicker__month-day--valid');
					}
				}
			// At the end of the selection, restore the disabled/invalid class for
			// days where the checkout is enabled. We need to check this when the
			// autoclose option is false .the same for the day just before the
			// disabled date
			} else if (this.hasClass(days[i], 'datepicker__month-day--checkout-enabled') || this.hasClass(days[i], 'datepicker__month-day--before-disabled-date')) {
				this.addClass(days[i], 'datepicker__month-day--invalid');
				this.removeClass(days[i], 'datepicker__month-day--valid');
				if (!this.hasClass(days[i], 'datepicker__month-day--before-disabled-date')) {
					this.addClass(days[i], 'datepicker__month-day--disabled');
				}
			}
		}

		return true;
	}

	dayHovering(day) {
		const hoverTime = parseInt(day.getAttribute('time'), 10);
		let tooltip = '';

		if (!this.hasClass(day, 'datepicker__month-day--invalid')) {
            // Get every td in the months table: our days
			const days = this.datepicker.getElementsByTagName('td');

            // Iterate each day and add the hovering class
			for (let i = 0; i < days.length; i++) {
				const time = parseInt(days[i].getAttribute('time'), 10);

				if (time === hoverTime) {
					this.addClass(days[i], 'datepicker__month-day--hovering');
				} else {
					this.removeClass(days[i], 'datepicker__month-day--hovering');
				}

				if ((this.start && !this.end) && ((this.start < time && hoverTime >= time) || (this.start > time && hoverTime <= time))) {
					this.addClass(days[i], 'datepicker__month-day--hovering');
				} else {
					this.removeClass(days[i], 'datepicker__month-day--hovering');
				}
			}

            // Generate date range tooltip
			if (this.start && !this.end) {
				const nights = this.countDays(hoverTime, this.start) - 1;

				if (this.hoveringTooltip) {
					if (typeof this.hoveringTooltip === 'function') {
						tooltip = this.hoveringTooltip(nights, this.start, hoverTime);
					} else if (this.hoveringTooltip === true && nights > 0) {
						const label = nights === 1 ? this.lang('night') : this.lang('nights');
						tooltip = (nights) + ' ' + label;
					}
				}
			}
		}

        // Show tooltip on hovering and set its position
		if (tooltip) {
			const dayBounding = day.getBoundingClientRect();
			const datepickerBounding = this.datepicker.getBoundingClientRect();
			let _left = dayBounding.left - datepickerBounding.left;
			let _top = dayBounding.top - datepickerBounding.top;

			_left += dayBounding.width / 2;

			const tooltipContainer = document.getElementById(this.getTooltipId());
			tooltipContainer.style.display = '';
			tooltipContainer.textContent = tooltip;
			const w = tooltipContainer.getBoundingClientRect().width;
			const h = tooltipContainer.getBoundingClientRect().height;

			_left -= w / 2;
			_top -= h;

			setTimeout(() => {
				tooltipContainer.style.left = _left + 'px';
				tooltipContainer.style.top = _top + 'px';
			}, 10);
		} else {
			const tooltipContainer = document.getElementById(this.getTooltipId());
			tooltipContainer.style.display = 'none';
		}
	}

	clearHovering() {
        // Remove hovering class from every day
		const days = this.datepicker.getElementsByTagName('td');
		for (let i = 0; i < days.length; i++) {
			this.removeClass(days[i], 'datepicker__month-day--hovering');
		}

        // Hide the tooltip
		const tooltipContainer = document.getElementById(this.getTooltipId());
		tooltipContainer.style.display = 'none';
	}

	clearSelection() {
        // Reset start and end dates
		this.start = false;
		this.end = false;

        // Remove selected classes
		const days = this.datepicker.getElementsByTagName('td');
		for (let i = 0; i < days.length; i++) {
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

	parseDisabledDates() {
        // Sort disabled dates and store it in property
		const _tmp = [];
		this.setFechaI18n();
		for (let i = 0; i < this.disabledDates.length; i++) {
			_tmp[i] = fecha.parse(this.disabledDates[i], 'YYYY-MM-DD');
		}

		_tmp.sort((a, b) => {
			return a - b;
		});

		this.disabledDatesTime = _tmp;
	}

	getClosestDates(x) {
        // This method implements part of the work done by the user Zeta
        // http://stackoverflow.com/a/11795472

        // Return an array with two elements:
        // - The closest date on the left
        // - The closest date on the right
		let dates = [false, false];

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
			let bestPrevDate = this.disabledDatesTime.length;
			let bestNextDate = this.disabledDatesTime.length;
			const maxDateValue = Math.abs((new Date(0, 0, 0)).valueOf());
			let bestPrevDiff = maxDateValue;
			let bestNextDiff = -maxDateValue;
			let currDiff = 0;
			let i;

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

	lang(s) {
        // Return i18n string
		return (s in this.i18n) ? this.i18n[s] : '';
	}

	emptyElement(element) {
        // Remove all child elements of a DOM node
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

    // Helper regex for DOM classes
	classRegex(c) {
		return new RegExp('(^|\\s+)' + c + '(\\s+|$)');
	}

    // Check if an element has a class
	hasClass(el, c) {
		return this.classRegex(c).test(el.className);
	}

    // Add a class to the element
	addClass(el, c) {
		if (!this.hasClass(el, c)) {
			el.className = el.className + ' ' + c;
		}
	}

    // Remove class from element
	removeClass(el, c) {
		el.className = el.className.replace(this.classRegex(c), ' ');
	}

	isVisible(element) {
        // Check if a DOM element is visible
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	}

	slideDown(element, speed) {
        // Slide down an element
		element.style.display = '';
		const h = element.getBoundingClientRect().height;
		element.style.height = 0;
		this.recalc(element.offsetHeight);
		element.style.transition = 'height ' + speed;
		element.style.height = h + 'px';
		element.addEventListener('transitionend', () => {
			element.style.height = element.style.transition = element.style.display = '';
		});
	}

	slideUp(element, speed) {
        // Slide up an element
		const h = element.getBoundingClientRect().height;
		element.style.height = h + 'px';
		this.recalc(element.offsetHeight);
		element.style.transition = 'height ' + speed;
		element.style.height = 0;
		element.addEventListener('transitionend', () => {
			element.style.display = 'none';
		});
	}

	recalc(element) {
        // Force browser recalculation
		return element.offsetHeight;
	}

	isTouchDevice() {
        // This *does not* necessarily reflect a touchscreen device!!!
        // http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
		return (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch));
	}

    // ------------------ //
    //   PUBLIC METHODS   //
    // ------------------ //

	open() {
		this.openDatepicker();
	}

	close() {
		this.closeDatepicker();
	}

	getDatePicker() {
		return this.datepicker;
	}

	setRange(d1, d2) {
		if (typeof d1 === 'string' && typeof d2 === 'string') {
			d1 = this.parseDate(d1);
			d2 = this.parseDate(d2);
		}

		this.setDateRange(d1, d2);
	}

	clear() {
		this.clearSelection();
	}

	getNights() {
		let count = 0;

		if (this.start && this.end) {
			count = this.countDays(this.end, this.start) - 1;
		} else {
			const value = this.getValue();
			const dates = value ? value.split(this.separator) : '';

			if (dates && (dates.length >= 2)) {
				const _format = this.format;

				count = this.countDays(this.parseDate(dates[0], _format), this.parseDate(dates[1], _format)) - 1;
			}
		}

		return count;
	}

	destroy() {
		if (document.getElementById(this.getDatepickerId())) {
			this.removeAllBoundedListeners(this.input, 'click');
			this.removeAllBoundedListeners(document, 'click');
			this.removeAllBoundedListeners(this.input, 'change');
			this.datepicker.parentNode.removeChild(this.datepicker);
		}
	}
}
