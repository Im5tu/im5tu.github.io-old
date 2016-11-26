(function (_site) {

    _site.log = function (text) {
        if (!text || text.length === 0)
            return;

        console.log(text);
    }

    _site.listenFor = function (eventName, callback, target) {
        if (!eventName || eventName.length == 0)
            return;

        if (!callback)
            return;

        if(!target)
            target = window;

        if (target.addEventListener)
            target.addEventListener(eventName, callback, false);
        else if (target.attachEvent) {
            var en = eventName;
            if (en.indexOf("on") !== 0)
                en = "on" + en;

            target.attachEvent(en, callback);
        }
        else
            _site.log("Cannot attach onto event: " + eventName);
    };

    _site.onNextAnimation = function (callback) {
        if (window.requestAnimationFrame)
            window.requestAnimationFrame(callback);
        else
            callback();
    };

    _site.init = function (callback) {
        _site.listenFor("load", function () {
            if (callback)
                callback();
        });
    };

    if(window.location.hash && window.location.hash.indexOf("#debug") === 0)
        _site.debug = true;
})(window.site || (window.site = {}));

window.site.init(function () {
    window.site.listenFor("click", function(e) {
        window.site.log("click");
        window.site.onNextAnimation(function () {
            window.scroll(0, 0);
        });
        e.preventDefault();
    }, document.getElementById("pageFooter-scroll-link"));

    var renderableTimeElements = [], timePortions = document.getElementsByClassName("article-header-time");
    for (var i = 0; i < timePortions.length; i++) {
        var timeElement = timePortions[i];
        if (timeElement.attributes && timeElement.attributes.datetime)
            renderableTimeElements.push(timeElement);
    }

    function updateRenderableTimes() {
        for (var i = 0; i < renderableTimeElements.length; i++) {
            var time = renderableTimeElements[i],
                newTime = window.site.time.humanize(time.attributes.datetime.value);
            if (time.innerHtml !== newTime)
                time.innerHTML = newTime;
        }
    }
    var timeUpdateFunction = (window.site.debug ? window.site.every.second : window.site.every.minute),
        timeUpdater = timeUpdateFunction(updateRenderableTimes);

    updateRenderableTimes();
});
(function (_site) {
    (function (_time) {
        function humanizer(date) {
            // TODO :: Localise etc
            if (typeof date !== 'object') {
                date = new Date(date);
            }

            var seconds = Math.floor((new Date() - date) / 1000),
                intervalType,
                interval = Math.floor(seconds / 31536000);

            if (interval >= 1) {
                intervalType = 'year';
            } else {
                interval = Math.floor(seconds / 2592000);
                if (interval >= 1) {
                    intervalType = 'month';
                } else {
                    interval = Math.floor(seconds / 86400);
                    if (interval >= 1) {
                        intervalType = 'day';
                    } else {
                        interval = Math.floor(seconds / 3600);
                        if (interval >= 1) {
                            intervalType = "hour";
                        } else {
                            interval = Math.floor(seconds / 60);
                            if (interval >= 1) {
                                intervalType = "minute";
                            } else {
                                return "Less than a minute ago";
                            }
                        }
                    }
                }
            }

            if (interval > 1 || interval === 0) {
                intervalType += 's';
            }

            return interval + ' ' + intervalType + " ago";
        }

        _time.humanize = humanizer;
    })(_site.time || (_site.time = {}));

    (function (_every) {
        _every.registeredIntervals = [];

        function interval(duration, callback) {
            if (!duration || duration <= 0 || !callback)
                return;

            var intervalId = window.setInterval(callback, duration);
            _every.registeredIntervals.push({
                id: intervalId,
                duration: duration,
                callback
            });
            return intervalId;
        }

        _every.second = function (callback) {
            return interval(1000, callback);
        };
        _every.seconds = function (callback, duration) {
            return interval(duration * 1000, callback);
        };
        _every.minute = function (callback) {
            return interval(60000, callback);
        };
        _every.minutes = function (callback, duration) {
            return interval(duration * 60000, callback);
        };

        _every.clear = function (intervalId) {
            for (var i = 0; i < _every.registeredIntervals.length; i++) {
                var interval = _every.registeredIntervals[i];
                if (interval.id === intervalId) {
                    _every.registeredIntervals.splice(i, 1)
                    window.clearInterval(intervalId);
                    return;
                }
            }
        };
        _every.clearAll = function () {
            while(_every.registeredIntervals.length > 0)
                window.clearInterval(_every.registeredIntervals.pop().id);
        }

        _every.interval = interval;
    })(_site.every || (_site.every = {}));
})(window.site || (window.site = {})); 