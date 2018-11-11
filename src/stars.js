/*!
 * stars.js
 * https://github.com/viniciusmichelutti/jquery-stars
 *
 * Released under the MIT license
 * https://github.com/viniciusmichelutti/jquery-stars/blob/master/LICENSE
 */
(function($) {
    
    $.fn.stars = function() {
        var _args = arguments;
        var _options = {};
        var _this = this;

        events = {
            removeFilledStars: function (stars, options) {
                stars.removeClass(options.filledIcon).addClass(options.emptyIcon);

                return stars;
            },

            fillStars: function (stars, options) {
                stars.removeClass(options.emptyIcon).addClass(options.filledIcon);

                return stars;
            }
        };

        function bindEvents(el) {
            var stars = el.find("i");
            var options = el.data("options");

            if (options != undefined) {
                stars.on("mouseover", function () {
                    var index = $(this).index() + 1;
                    var starsHovered = stars.slice(0, index);

                    starsHovered.addClass(options.filledIcon).css("color", options.hoverColor);

                    if (options.text) {
                        el.find(".rating-text").html($(this).data("rating-text"));
                    }
                    if ($.isFunction(options.over)) {
                        options.over.call(stars.get(index), el, $(this));
                    }
                }).on("mouseout", function () {
                    var index = $(this).index() + 1;

                    events.removeFilledStars(stars, options).css("color", options.color);
                    events.fillStars(stars.filter(".selected"), options);

                    if (options.text) {
                        el.find(".rating-text").html("");
                    }
                    if ($.isFunction(options.out)) {
                        options.out.call(stars.get(index), el, $(this));
                    }
                });
            } else {
                console.log("bindEvents", el[0], "not starred");
            }
        }

        function unbindEvents(el) {
            var stars = el.find("i");
            var options = el.data("options");

            if (options != undefined) {
                stars.unbind("mouseover");
                stars.unbind("mouseout");
            } else {
                console.log("unbindEvents", el, "not starred");
            }
        }

        function getOptions(el) {
            var stars = el.find("i");
            var options = el.data("options");

            if (options != undefined) {
                return options;
            } else {
                console.log("getOptions", el, "not starred");
            }
        }

        function setValue(el, value) {
            var options = el.data("options");

            if (options != undefined) {
                if (value >= 0 && value <= options.stars) {
                    for (var x = 0; x < options.stars; x++) {
                        var i = el.find("i:nth-child(" + (x + 1) + ")");

                        if (value > x) {
                            if (i.hasClass(options.emptyIcon)) {
                                i.removeClass(options.emptyIcon);
                            }
                            if (!i.hasClass(options.filledIcon)) {
                                i.addClass(options.filledIcon).addClass("selected");
                            }
                        } else {
                            if (i.hasClass(options.filledIcon)) {
                                i.removeClass(options.filledIcon);
                            }
                            if (!i.hasClass(options.emptyIcon)) {
                                i.addClass(options.emptyIcon);
                            }
                        }
                    }
                }

                options.value = value;

                el.data("options", options);
            } else {
                console.log("setValue", el, "not starred");
            }
        }

        function create(el, options) {
            var opt = $.extend({}, options);

            for (var x = 0; x < opt.stars; x++) {
                var i = $("<i>");

                i.addClass(opt.emptyIcon);

                if ($.isArray(opt.titles) && x < opt.titles.length) {
                    i.attr("title", opt.titles[x]);
                }

                if ($.isArray(opt.text) && x < opt.text.length) {
                    i.attr("data-rating-text", opt.text[x]);
                }

                if (opt.color !== "none") {
                    i.css("color", opt.color)
                }

                if ($.isFunction(opt.onStarCreated)) {
                    opt.onStarCreated(x, i);
                }

                el.append(i);
            }

            if (opt.text) {
                var textDiv = $("<div>").addClass("rating-text");
                el.append(textDiv);
            }

            var stars = el.find("i");

            if (!opt.readonly) {
                stars.on("click", function () {
                    var index = $(this).index();

                    var newValue = index + 1;
                    var changeValue = false;

                    if ($.isFunction(opt.click)) {
                        changeValue = opt.click.call(stars.get(index), el, newValue);
                    }

                    if ($.isFunction(changeValue.then)) {
                        changeValue.done(function (result) {
                            if (result == undefined || result) {
                                opt.value = newValue;
                                stars.removeClass("selected").slice(0, newValue).addClass("selected");
                            }
                        });
                    } else {
                        if (changeValue == undefined || changeValue) {
                            opt.value = newValue;
                            stars.removeClass("selected").slice(0, newValue).addClass("selected");
                        }
                    }
                });
            }

            if (opt.value == undefined) {
                var value = el.data("value");

                if ($.isNumeric(value)) {
                    opt.value = value;
                }
            }

            if (opt.value > 0) {
                var starsToSelect = stars.slice(0, opt.value);

                starsToSelect.removeClass(options.emptyIcon).addClass(options.filledIcon).addClass("selected");
            }

            el.data("options", opt);

            if (!opt.readonly) {
                bindEvents(el);
            }
        }

        if (_args.length > 0) {
            if (typeof _args[0] == "string") {
                switch (_args[0]) {
                    case "setValue":    // ex: $(".rate").stars("setValue", 4);
                        return this.each(function () {
                            var el = $(this);

                            if (_args.length > 1) {
                                var value = _args[1];

                                if ($.isNumeric(value)) {
                                    setValue(el, value);
                                }
                            }
                        });

                        break;
                    case "readonly":    // ex: $(".rate").stars("readonly", true);
                        if (_args.length > 1 && _args[1]) {
                            return this.each(function () {
                                var el = $(this);
                                unbindEvents(el);
                            });
                        } else {
                            return this.each(function () {
                                var el = $(this);
                                bindEvents(el);
                            });
                        }
                        break;
                    case "options":
                        var result = [];

                        this.each(function () {
                            var el = $(this);

                            result.push(getOptions(el));
                        });

                        if (result.length == 1)
                            return result[0];

                        return result;

                        break;
                    case "destroy":
                        return this.each(function () {
                            var el = $(this);

                            el.empty();
                        });
                        
                        break;
                    default:
                        console.log("unknown method " + _args[0]);
                        break;
                }
            } else {
                _options = _args[0];
            }
        }
        
        var options = $.extend({
            readonly: false,
            stars: 5,
            emptyIcon: 'far fa-star',
            filledIcon: 'fas fa-star',
            halfIcon: 'fas fa-star-half-alt',
            color: '#E4AD22',
            hoverColor: '#FF8338',
            starClass: '',
            value: undefined,
            text: null,
            onStarCreated: null,
            click: null,
            over: null,
            out: null
        }, _options);

        return this.each(function () {
            var el = $(this);

            create(el, options);
        });
    };
    
}(jQuery));
