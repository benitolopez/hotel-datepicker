/*!
 * Hotel Datepicker Plugin v1.0.0
 * https://github.com/lopezb/hotel-datepicker
 *
 * Original work Copyright (c) 2015 Chunlong
 * Modified work Copyright 2016 Benito Lopez
 * Released under the MIT license
 */
;(function ($, window, undefined) {
    'use strict';

    $.fn.hotelDatePicker = function(opt) {
        if (!opt) {
            opt = {};
        }

        // defaults
        opt = $.extend(true, {
            format: 'YYYY-MM-DD',
            separator: ' - ',
            startOfWeek: 'sunday', // or monday
            getValue: function() {
                return $(this).val();
            },
            setValue: function(s) {
                if (!$(this).attr('readonly') && !$(this).is(':disabled') && s !== $(this).val()) {
                    $(this).val(s);
                }
            },
            startDate: new Date(),
            endDate: false,
            minNights: 1,
            maxNights: 0,
            container: '', // default container of the input
            duration: 200,
            hoveringTooltip: true, // or function
            showTopbar: true,
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
                'month-name': ['january','february','march','april','may','june','july','august','september','october','november','december'],
                'less-than': 'Date range should not be more than %d night(s)',
                'more-than': 'Date range should not be less than %d night(s)',
                'default-more': 'Please select a date range longer than %d night(s)',
                'default-range': 'Please select a date range between %d and %d night(s)',
                'default-default': 'Please select a date range'
            }
        }, opt);

        opt.start = false;
        opt.end = false;
        opt.minDays = opt.minNights > 1 ? opt.minNights + 1 : 2;
        opt.maxDays = opt.maxNights > 1 ? opt.maxNights + 1 : 0;

        if (opt.startDate && typeof opt.startDate === 'string') {
            opt.startDate = fecha.parse(opt.startDate, opt.format);
        }

        if (opt.endDate && typeof opt.endDate === 'string') {
            opt.endDate = fecha.parse(opt.endDate, opt.format);
        }

        var box;
        var initiated = false;
        var self = this;
        var selfDom = $(self).get(0);
        var domChangeTimer;
        var singleMonth = $(window).width() < 480;
        var isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;

        // show one month on mobile devices
        singleMonth = $(window).width() < 480;

        // hide hovering tooltip on touch devices
        if (isTouchDevice) {
            opt.hoveringTooltip = false;
        }

        $(this).unbind('.datepicker').bind('click.datepicker',function() {
            var isOpen = box.is(':visible');

            if (!isOpen) {
                openDatePicker(opt.duration);
            }
        }).bind('change.datepicker', function() {
            checkAndSetDefaultValue();
        }).bind('keyup.datepicker',function() {
            try {
                clearTimeout(domChangeTimer);
            } catch(e) {}

            domChangeTimer = setTimeout(function() {
                checkAndSetDefaultValue();
            }, 2000);
        });

        init_datepicker.call(this);

        // expose some api
        $(this).data('dateRangePicker', {
            setDateRange: function(d1, d2, silent) {
                if (typeof d1 === 'string' && typeof d2 === 'string') {
                    d1 = fecha.parse(d1, opt.format);
                    d2 = fecha.parse(d2, opt.format);
                }

                setDateRange(d1, d2, silent);
            },
            clear: clearSelection,
            close: closeDatePicker,
            open: openDatePicker,
            getDatePicker: getDatePicker,
            destroy: function() {
                $(self).unbind('.datepicker');
                $(self).data('dateRangePicker', '');
                $(self).data('hdp-opened', null);
                box.remove();
                $(document).unbind('click.datepicker', closeDatePicker);
            }
        });

        return this;

        function isOwnDatePickerClicked(evt, selfObj) {
            return (evt.target === selfObj || (selfObj.childNodes !== undefined && $.inArray(evt.target, selfObj.childNodes) >= 0));
        }

        function init_datepicker() {
            var self = this;
            var _this = $(this);

            if (_this.data('hdp-opened')) {
                closeDatePicker();
                return;
            }

            _this.data('hdp-opened',true);

            box = createDom().hide();
            box.append('<div class="date-range-length-tip"></div>');
            box.delegate('.day', 'mouseleave', function() {
                box.find('.date-range-length-tip').hide();
            });

            if ((opt.container)) {
                $(opt.container).append(box);
            } else {
                self.parent().append(box);
            }

            var defaultTime = new Date();

            if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0 ) {
                defaultTime = opt.startDate;
            }

            if (opt.endDate && compare_month(nextMonth(defaultTime), opt.endDate) > 0 ) {
                defaultTime = prevMonth(opt.endDate);
            }

            showMonth(defaultTime, 'month1');
            showMonth(nextMonth(defaultTime), 'month2');

            var defaultTopText = '';

            if (opt.minDays && opt.maxDays) {
                defaultTopText = lang('default-range');
            } else if (opt.minDays) {
                defaultTopText = lang('default-more');
            } else {
                defaultTopText = lang('default-default');
            }

            box.find('.default-top').html(defaultTopText.replace(/\%d/, (opt.minDays - 1)).replace(/\%d/, (opt.maxDays - 1)));
            if (singleMonth) {
                box.addClass('single-month');
            } else {
                box.addClass('two-months');
            }

            box.click(function(evt) {
                evt.stopPropagation();
            });

            // if user click other place of the webpage, close date range picker window
            $(document).bind('click.datepicker', function(evt) {
                if (!isOwnDatePickerClicked(evt, self[0])) {
                    if (box.is(':visible')) {
                        closeDatePicker();
                    }
                }
            });

            box.find('.next').click(function() {
                gotoNextMonth(this);
            });

            function gotoNextMonth(self) {
                var isMonth2 = $(self).parents('table').hasClass('month2');
                var month = isMonth2 ? opt.month2 : opt.month1;

                month = nextMonth(month);

                if (!singleMonth && !isMonth2 && compare_month(month, opt.month2) >= 0 || isMonthOutOfBounds(month)) {
                    return;
                }

                showMonth(month, isMonth2 ? 'month2' : 'month1');
                showSelectedDays();
                handleNextPrev();
            }

            box.find('.prev').click(function() {
                gotoPrevMonth(this);
            });

            function gotoPrevMonth(self) {
                var isMonth2 = $(self).parents('table').hasClass('month2');
                var month = isMonth2 ? opt.month2 : opt.month1;

                month = prevMonth(month);

                if (isMonth2 && compare_month(month, opt.month1) <= 0 || isMonthOutOfBounds(month)) {
                    return;
                }

                showMonth(month, isMonth2 ? 'month2' : 'month1');
                showSelectedDays();
                handleNextPrev();
            }

            box.delegate('.day', 'click', function() {
                dayClicked($(this));
            });

            box.delegate('.day', 'mouseenter', function() {
                dayHovering($(this));
            });

            box.attr('unselectable', 'on').css('user-select', 'none').bind('selectstart', function(e) {
                e.preventDefault();
                return false;
            });

            box.find('.apply-btn').click(function() {
                closeDatePicker();

                var dateRange = getDateString(new Date(opt.start)) + opt.separator + getDateString(new Date(opt.end));

                $(self).trigger('datepicker-apply', {
                    'value': dateRange,
                    'date1' : new Date(opt.start),
                    'date2' : new Date(opt.end)
                });
            });
        }

        // Return the date picker wrapper element
        function getDatePicker() {
            return box;
        }

        function openDatePicker(animationTime) {
            checkAndSetDefaultValue();

            box.slideDown(animationTime, function() {
                $(self).trigger('datepicker-opened', {relatedTarget: box});
            });

            $(self).trigger('datepicker-open', {relatedTarget: box});
            showSelectedDays();
            handleNextPrev();
        }

        function checkAndSetDefaultValue() {
            var __default_string = opt.getValue.call(selfDom);
            var defaults = __default_string ? __default_string.split(opt.separator) : '';

            if (defaults && (defaults.length >= 2)) {
                var ___format = opt.format;

                if (___format.match(/Do/)) {
                    ___format = ___format.replace(/Do/,'D');
                    defaults[0] = defaults[0].replace(/(\d+)(th|nd|st)/,'$1');
                    defaults[1] = defaults[1].replace(/(\d+)(th|nd|st)/,'$1');
                }

                // set initiated to avoid triggerring datepicker-change event
                initiated = false;
                setDateRange(fecha.parse(defaults[0], ___format), fecha.parse(defaults[1], ___format));
                initiated = true;
            }
        }

        function clearSelection() {
            opt.start = false;
            opt.end = false;
            box.find('.day.checked').removeClass('checked');
            box.find('.day.last-date-selected').removeClass('last-date-selected');
            box.find('.day.first-date-selected').removeClass('first-date-selected');
            opt.setValue.call(selfDom, '');
            checkSelectionValid();
            showSelectedInfo();
            showSelectedDays();
        }

        function dayClicked(day) {
            if (day.hasClass('invalid')) {
                return;
            }

            var time = day.attr('time');

            day.addClass('checked');

            if ((opt.start && opt.end) || (!opt.start && !opt.end)) {
                opt.start = time;
                opt.end = false;
            } else if (opt.start) {
                opt.end = time;
            }

            // In case the start is after the end, swap the timestamps
            if (opt.start && opt.end && opt.start > opt.end) {
                var tmp = opt.end;

                opt.end = opt.start;
                opt.start = tmp;
            }

            opt.start = parseInt(opt.start);
            opt.end = parseInt(opt.end);

            clearHovering();

            if (opt.start && !opt.end) {
                $(self).trigger('datepicker-first-date-selected', {
                    'date1' : new Date(opt.start)
                });
                dayHovering(day);
            }

            updateSelectableRange(time);
            checkSelectionValid();
            showSelectedInfo();
            showSelectedDays();
            autoclose();
        }

        function isValidTime(time) {
            time = parseInt(time, 10);

            if (opt.startDate && compare_day(time, opt.startDate) < 0) {
                return false;
            }

            if (opt.endDate && compare_day(time, opt.endDate) > 0) {
                return false;
            }

            if (opt.start && !opt.end) {
                // check maxDays and minDays setting
                if (opt.maxDays > 0 && countDays(time, opt.start) > opt.maxDays) {
                    return false;
                }

                if (opt.minDays > 0 && countDays(time, opt.start) < opt.minDays) {
                    return false;
                }

                // check if date is before opt.start
                if (time < opt.start) {
                    return false;
                }
            }

            return true;
        }

        function updateSelectableRange() {
            box.find('.day.invalid.tmp').removeClass('tmp invalid').addClass('valid');

            if (opt.start && !opt.end) {
                box.find('.day.toMonth.valid').each(function() {
                    var time = parseInt($(this).attr('time'), 10);

                    if (!isValidTime(time)) {
                        $(this).addClass('invalid tmp').removeClass('valid');
                    } else {
                        $(this).addClass('valid tmp').removeClass('invalid');
                    }
                });
            }

            return true;
        }

        function dayHovering(day) {
            var hoverTime = parseInt(day.attr('time'));
            var tooltip = '';

            if (day.hasClass('has-tooltip') && day.attr('data-tooltip')) {
                tooltip = '<span style="white-space:nowrap">' + day.attr('data-tooltip') + '</span>';
            } else if (!day.hasClass('invalid')) {
                box.find('.day').each(function() {
                    var time = parseInt($(this).attr('time'));

                    if (time === hoverTime) {
                        $(this).addClass('hovering');
                    } else {
                        $(this).removeClass('hovering');
                    }

                    if ((opt.start && !opt.end) && ((opt.start < time && hoverTime >= time) || (opt.start > time && hoverTime <= time))) {
                        $(this).addClass('hovering');
                    } else {
                        $(this).removeClass('hovering');
                    }
                });

                if (opt.start && !opt.end) {
                    var nights = countDays(hoverTime, opt.start) - 1;

                    if (opt.hoveringTooltip) {
                        if (typeof opt.hoveringTooltip === 'function') {
                            tooltip = opt.hoveringTooltip(nights, opt.start, hoverTime);
                        } else if (opt.hoveringTooltip === true && nights > 0) {
                            var label = nights === 1 ? lang('night') : lang('nights');
                            tooltip = (nights) + ' ' + label;
                        }
                    }
                }
            }

            if (tooltip) {
                var posDay = day.offset();
                var posBox = box.offset();
                var _left = posDay.left - posBox.left;
                var _top = posDay.top - posBox.top;

                _left += day.width()/2;

                var $tip = box.find('.date-range-length-tip');
                var w = $tip.css({'visibility':'hidden', 'display':'none'}).html(tooltip).width();
                var h = $tip.height();

                _left -= w/2;
                _top -= h;

                setTimeout(function() {
                    $tip.css({left:_left, top:_top, display:'block', 'visibility':'visible'});
                }, 10);
            } else {
                box.find('.date-range-length-tip').hide();
            }
        }

        function clearHovering() {
            box.find('.day.hovering').removeClass('hovering');
            box.find('.date-range-length-tip').hide();
        }

        function autoclose() {
            if (initiated && opt.start && opt.end) {
                if (opt.autoClose) {
                    closeDatePicker();
                }
            }
        }

        function checkSelectionValid() {
            var days = Math.ceil((opt.end - opt.start) / 86400000) + 1;

            if (opt.maxDays && days > opt.maxDays) {
                opt.start = false;
                opt.end = false;
                box.find('.day').removeClass('checked');
                box.find('.drp_top-bar').removeClass('normal').addClass('error').find('.error-top').html(lang('less-than').replace('%d', (opt.maxDays - 1)));
            } else if (opt.minDays && days < opt.minDays) {
                opt.start = false;
                opt.end = false;
                box.find('.day').removeClass('checked');
                box.find('.drp_top-bar').removeClass('normal').addClass('error').find('.error-top').html( lang('more-than').replace('%d', (opt.minDays - 1)) );
            } else {
                if (opt.start || opt.end) {
                    box.find('.drp_top-bar').removeClass('error').addClass('normal');
                } else {
                    box.find('.drp_top-bar').removeClass('error').removeClass('normal');
                }
            }

            if (opt.start && opt.end) {
                box.find('.apply-btn').removeClass('disabled');
            } else {
                box.find('.apply-btn').addClass('disabled');
            }
        }

        function showSelectedInfo(forceValid,silent) {
            box.find('.start-day').html('...');
            box.find('.end-day').html('...');
            box.find('.selected-days').hide();

            if (opt.start) {
                box.find('.start-day').html(getDateString(new Date(parseInt(opt.start))));
            }

            if (opt.end) {
                box.find('.end-day').html(getDateString(new Date(parseInt(opt.end))));
            }

            if (opt.start && opt.end) {
                var count = countDays(opt.end, opt.start) - 1;
                var countText = count === 1 ? count + ' ' + lang('night') : count + ' ' + lang('nights');
                box.find('.selected-days').show().find('.selected-days-num').html(countText);
                box.find('.apply-btn').removeClass('disabled');

                var dateRange = getDateString(new Date(opt.start)) + opt.separator + getDateString(new Date(opt.end));

                opt.setValue.call(selfDom,dateRange, getDateString(new Date(opt.start)), getDateString(new Date(opt.end)));

                if (initiated && !silent) {
                    $(self).trigger('datepicker-change', {
                        'value': dateRange,
                        'date1' : new Date(opt.start),
                        'date2' : new Date(opt.end)
                    });
                }
            } else if (forceValid) {
                box.find('.apply-btn').removeClass('disabled');
            } else {
                box.find('.apply-btn').addClass('disabled');
            }
        }

        function countDays(start,end) {
            return Math.abs(daysFrom1970(start) - daysFrom1970(end)) + 1;
        }

        function setDateRange(date1,date2,silent) {
            if (date1.getTime() > date2.getTime()) {
                var tmp = date2;

                date2 = date1;
                date1 = tmp;
                tmp = null;
            }

            var valid = true;

            if (opt.startDate && compare_day(date1, opt.startDate) < 0) {
                valid = false;
            }

            if (opt.endDate && compare_day(date2, opt.endDate) > 0) {
                valid = false;
            }

            if (!valid) {
                showMonth(opt.startDate, 'month1');
                showMonth(nextMonth(opt.startDate), 'month2');
                showSelectedDays();
                handleNextPrev();
                return;
            }

            opt.start = date1.getTime();
            opt.end = date2.getTime();

            if ((compare_day(date1, date2) > 0 && compare_month(date1, date2) === 0)) {
                date2 = nextMonth(date1);
            }

            if (compare_month(date1,date2) === 0) {
                date2 = nextMonth(date1);
            }

            showMonth(date1, 'month1');
            showMonth(date2, 'month2');
            showSelectedDays();
            handleNextPrev();
            checkSelectionValid();
            showSelectedInfo(false,silent);
            autoclose();
        }

        function showSelectedDays() {
            if (!opt.start && !opt.end) {
                return;
            }

            box.find('.day').each(function() {
                var time = parseInt($(this).attr('time'));
                var start = opt.start;
                var end = opt.end;

                if ((opt.start && opt.end && end >= time && start <= time) || (opt.start && !opt.end && fecha.format(start, 'YYYY-MM-DD') === fecha.format(time, 'YYYY-MM-DD'))) {
                    $(this).addClass('checked');
                } else {
                    $(this).removeClass('checked');
                }

                // add first-date-selected class name to the first date selected
                if (opt.start && fecha.format(start, 'YYYY-MM-DD') === fecha.format(time, 'YYYY-MM-DD')) {
                    $(this).addClass('first-date-selected');
                } else {
                    $(this).removeClass('first-date-selected');
                }

                // add last-date-selected
                if (opt.end && fecha.format(end, 'YYYY-MM-DD') === fecha.format(time, 'YYYY-MM-DD')) {
                    $(this).addClass('last-date-selected');
                } else {
                    $(this).removeClass('last-date-selected');
                }
            });
        }

        function showMonth(date,month) {
            var monthName = nameMonth(date.getMonth());

            box.find('.' + month + ' .month-name').html(monthName + ' ' + date.getFullYear());
            box.find('.' + month + ' tbody').html(createMonthHTML(date));
            opt[month] = date;
            updateSelectableRange();
        }

        function nameMonth(m) {
            return lang('month-name')[m];
        }

        function getDateString(d) {
            return fecha.format(d, opt.format);
        }

        function handleNextPrev() {
            var m1 = parseInt(fecha.format(opt.month1, 'YYYYMM'));
            var m2 = parseInt(fecha.format(opt.month2, 'YYYYMM'));
            var p = Math.abs(m1 - m2);
            var shouldShow = (p > 1 && p !== 89);

            if (shouldShow) {
                box.removeClass('no-prev-next');
            } else {
                box.addClass('no-prev-next');
            }
        }

        function closeDatePicker() {
            $(box).slideUp(opt.duration,function() {
                $(self).data('hdp-opened', false);
                $(self).trigger('datepicker-closed', {relatedTarget: box});
            });
            $(self).trigger('datepicker-close', {relatedTarget: box});
        }

        function compare_month(m1,m2) {
            var p = parseInt(fecha.format(m1, 'YYYYMM')) - parseInt(fecha.format(m2, 'YYYYMM'));

            if (p > 0 ) {
                return 1;
            }

            if (p === 0) {
                return 0;
            }

            return -1;
        }

        function compare_day(m1,m2) {
            var p = parseInt(fecha.format(m1, 'YYYYMMDD')) - parseInt(fecha.format(m2, 'YYYYMMDD'));

            if (p > 0 ) {
                return 1;
            }

            if (p === 0) {
                return 0;
            }

            return -1;
        }

        function nextMonth(month) {
            var _m = new Date(month.valueOf());

            return new Date(_m.setMonth(_m.getMonth() + 1));
        }

        function prevMonth(month) {
            var _m = new Date(month.valueOf());

            return new Date(_m.setMonth(_m.getMonth() - 1));
        }

        function createDom() {
            var html = '<div class="hdp-wrapper';

            if (opt.extraClass) {
                html += ' ' + opt.extraClass + ' ';
            }

            if (!opt.showTopbar) {
                html += ' no-topbar ';
            }

            html += '">';

            if (opt.showTopbar) {
                html += '<div class="drp_top-bar">';
                html += '<div class="normal-top"><span>' + lang('selected') + ' </span> <strong class="start-day">...</strong>';
                html += ' <span class="separator-day">' + opt.separator + '</span> <strong class="end-day">...</strong> <em class="selected-days">(<span class="selected-days-num">3</span>)</em>';
                html += '</div>';
                html += '<div class="error-top">error</div><div class="default-top">default</div>';
                html += '<input type="button" class="apply-btn disabled hide" value="' + lang('apply') + '" />';
                html += '</div>';
            }

            html += '<div class="month-wrapper"><table class="month1" cellspacing="0" border="0" cellpadding="0"><thead><tr class="caption"><th><span class="prev">&lt;</span></th><th colspan="5" class="month-name"></th><th><span class="next">&gt;</span></th></tr><tr class="week-name">' + getWeekHead() + '</thead><tbody></tbody></table>';

            if (hasMonth2()) {
                html += '<table class="month2" cellspacing="0" border="0" cellpadding="0"><thead><tr class="caption"><th><span class="prev">&lt;</span></th><th colspan="5" class="month-name"></th><th><span class="next">&gt;</span></th></tr><tr class="week-name">' + getWeekHead() + '</thead><tbody></tbody></table>';
            }

            html += '<div style="clear:both;height:0;font-size:0;"></div>';
            html += '</div>';
            html += '</div>';

            return $(html);
        }

        function getWeekHead() {
            if (opt.startOfWeek === 'monday') {
                return '<th>' + lang('week-1') + '</th>' +
                    '<th>' + lang('week-2') + '</th>' +
                    '<th>' + lang('week-3') + '</th>' +
                    '<th>' + lang('week-4') + '</th>' +
                    '<th>' + lang('week-5') + '</th>' +
                    '<th>' + lang('week-6') + '</th>' +
                    '<th>' + lang('week-7') + '</th>';
            } else {
                return '<th>'+lang('week-7') + '</th>' +
                    '<th>' + lang('week-1') + '</th>' +
                    '<th>' + lang('week-2') + '</th>' +
                    '<th>' + lang('week-3') + '</th>' +
                    '<th>' + lang('week-4') + '</th>' +
                    '<th>' + lang('week-5') + '</th>' +
                    '<th>' + lang('week-6') + '</th>';
            }
        }

        function isMonthOutOfBounds(month) {
            var _m = new Date(month.valueOf());

            if (opt.startDate && (new Date(_m.getFullYear(), _m.getMonth() + 1, 0, 23, 59, 59) < opt.startDate)) {
                return true;
            }

            if (opt.endDate && (new Date(_m.getFullYear(), _m.getMonth(), 1) > opt.endDate)) {
                return true;
            }

            return false;
        }

        function hasMonth2() {
            return (!singleMonth);
        }

        function attributesCallbacks(obj) {
            var _obj = obj;
            var attrString = '';

            for (var attr in obj) {
                if (_obj.hasOwnProperty(attr)) {
                    attrString += attr + '="' + _obj[attr] + '" ';
                }
            }

            return attrString;
        }

        function daysFrom1970(t) {
            return Math.floor(toLocalTimestamp(t) / 86400000);
        }

        function toLocalTimestamp(t) {
            if (typeof t === 'object' && t.getTime) {
                t = t.getTime();
            }

            if (typeof t === 'string' && !t.match(/\d{13}/)) {
                t = fecha.parse(t, opt.format).getTime();
            }

            t = parseInt(t, 10) - new Date().getTimezoneOffset() * 60 * 1000;

            return t;
        }

        function addDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        function createMonthHTML(d) {
            var days = [];
            d.setDate(1);
            var valid;

            var dayOfWeek = d.getDay();

            if ((dayOfWeek === 0) && (opt.startOfWeek === 'monday')) {
                // add one week
                dayOfWeek = 7;
            }

            if (dayOfWeek > 0) {
                for (var i = dayOfWeek; i > 0; i--) {
                    var day = new Date(d.getTime() - 86400000 * i);
                    valid = isValidTime(day.getTime());

                    if (opt.startDate && compare_day(day, opt.startDate) < 0) {
                        valid = false;
                    }

                    if (opt.endDate && compare_day(day, opt.endDate) > 0) {
                        valid = false;
                    }

                    days.push({
                        date: day,
                        type:'lastMonth',
                        day: day.getDate(),
                        time:day.getTime(),
                        valid:valid
                    });
                }
            }

            var toMonth = d.getMonth();

            for (var j = 0; j < 40; j++) {
                var today = addDays(d,j);
                valid = isValidTime(today.getTime());

                if (opt.startDate && compare_day(today,opt.startDate) < 0) {
                    valid = false;
                }

                if (opt.endDate && compare_day(today,opt.endDate) > 0) {
                    valid = false;
                }

                days.push({
                    date: today,
                    type: today.getMonth() === toMonth ? 'toMonth' : 'nextMonth',
                    day: today.getDate(),
                    time: today.getTime(),
                    valid: valid
                });
            }

            var html = [];

            for (var week = 0; week < 6; week++) {
                if (days[week * 7].type === 'nextMonth') {
                    break;
                }

                html.push('<tr>');

                for (var k = 0; k < 7; k++) {
                    var _day = (opt.startOfWeek === 'monday') ? k + 1 : k;
                    var singleDay = days[week * 7 + _day];
                    var highlightToday = fecha.format(singleDay.time, opt.format) === fecha.format(new Date(), opt.format);

                    singleDay.extraClass = '';
                    singleDay.tooltip = '';

                    var todayDivAttr = {
                        time: singleDay.time,
                        'data-tooltip': singleDay.tooltip,
                        'class': 'day ' + singleDay.type + ' ' + singleDay.extraClass + ' ' + (singleDay.valid ? 'valid' : 'invalid') + ' ' + (highlightToday ? 'real-today' : '')
                    };

                    html.push('<td><div ' + attributesCallbacks(todayDivAttr) + '>' + showDayHTML(singleDay.time, singleDay.day) + '</div></td>');
                }

                html.push('</tr>');
            }

            return html.join('');
        }

        function showDayHTML(time, date) {
            if (opt.showDateFilter && typeof opt.showDateFilter === 'function') {
                return opt.showDateFilter(time, date);
            }

            return date;
        }

        function lang(s) {
            return (s in opt.i18n) ? opt.i18n[s] : '';
        }
    };
}(jQuery, window));
