(function (factory, disableAMD) {
    factory();
}(function (undefined) {
    window.utils = function () {
        var utils = {};

        if (typeof String.prototype.startsWith != 'function') {
            String.prototype.startsWith = function (str) {
                return this.slice(0, str.length) == str;
            };
        }

        // cachify caches promise returned by function.
        // E.g.
        // var ajax = function() { /* ajax request */ }.cachify();
        // ajax(); // <- send the ajax request and cache the promise.
        // ajax(); // <- load the promise from cache.
        Function.prototype.cachify = function (getKey) {
            var func = this;
            var computeKey = function (args) {
                return '(' + (getKey ? getKey.apply(null, args) : Array.prototype.slice.call(args).join(',')) + ')';
            };
            var thiz = function () {
                var key = computeKey(arguments);
                if (!(key in thiz.cache)) {
                    console.log(key, 'starts.');
                    thiz.cache[key] = func.apply(this, arguments);
                    thiz.cache[key].done(function (r) {
                        console.log(key, 'done:', r);
                    });
                } else {
                    console.log(key, 'is loaded from cache');
                }
                return thiz.cache[key];
            };
            thiz.cache = thiz.cache || {};
            // Input arguments should be the same as those of invocations,
            // so as to compute the key correctly.
            // E.g.
            // obj.func = function(date) { /* some implementation */ }.cachify();
            // var date = new Date('2016/1/1');
            // obj.func(date); // <- this is the invocation.
            // obj.clean(date); // <- this date is used for finding the key.
            // obj.func(); // <- invocation without argument
            // obj.clean(); // <- clean cache for the invocation without argument.
            thiz.clean = function () {
                var key = computeKey(arguments);
                thiz.cache[key] = {};
                console.log(key, 'is cleaned.');
            };
            // Clears all the cache entries of this function.
            thiz.cleanAll = function () {
                thiz.cache = {};
            };
            // Directly sets the value returned by the cached promise.
            thiz.set = function () {
                var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                var key = computeKey(args);
                var value = arguments[arguments.length - 1];
                thiz.cache[key] = $.when(value);
                console.log(key, 'is set to', value);
            };
            return thiz;
        };

        utils.round = function (number, precision) {
            precision = precision || 0;
            var factor = Math.pow(10, precision);
            var tempNumber = number * factor;
            var roundedTempNumber = Math.round(tempNumber);
            return roundedTempNumber / factor;
        };

        utils.timeStrToMinute = function (timeStr) {
            var parts = timeStr.split(':');
            var minutes = (+parts[0]) * 60 + (+parts[1]) + (+parts[2] / 60);
            return utils.round(minutes, 1);
        };

        utils.getTodayDate = function () {
            return new Date((new Date()).toDateString());
        };

        // as the beginning date of our app
        utils.beginningDate = new Date(2014, 0, 1);

        // https://w3ctech.com/topic/1165
        // https://gist.github.com/ufologist/7c14837db642a6e916ce
        utils.weixinJSBridgeWrapper = function(callback) {
            if (window.WeixinJSBridge != undefined) {
                window.WeixinJSBridge.invoke('getNetworkType',
                    {},
                    function (e) {
                        callback();
                    });
            } else {
                callback();
            }
        }

        utils.getParameterByName = function (name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        utils.animationStartEvent = 'webkitAnimationStart mozAnimationStart MSAnimationStart oanimationstart animationstart';
        utils.animationEndEvent = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        utils.transitionEndEvent = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';

        utils.isSessionStorageSupported = function () {
            var mod = 'mtutor';
            try {
                sessionStorage.setItem(mod, mod);
                sessionStorage.removeItem(mod);
                return true;
            } catch (e) {
                return false;
            }
        };

        utils.hexToRgba = function (hex, alpha) {
            if (alpha === undefined) {
                alpha = 1;
            }
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ?
                'rgba('
                + parseInt(result[1], 16) + ','
                + parseInt(result[2], 16) + ','
                + parseInt(result[3], 16) + ','
                + alpha + ')'
                : '';
        };

        Storage.prototype.getJSON = function (key) {
            return JSON.parse(sessionStorage.getItem(key));
        };

        Storage.prototype.set = function (key, value) {
            if (_.isObject(value)) {
                value = JSON.stringify(value);
            }
            sessionStorage.setItem(key, value);
        };

        utils.guid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
        };

        utils.AsyncFuncQueue = (function () {
            function AsyncFuncQueue() {
                this.queue = [];
            }

            AsyncFuncQueue.prototype._pop = function () {
                var self = this;
                var func = self.queue.shift();
                if (func) {
                    self.running = true;
                    func();
                } else {
                    self.running = false;
                }
            }

            AsyncFuncQueue.prototype.push = function (func) {
                var self = this;
                self.queue.push(function () {
                    func().always(function () {
                        self._pop();
                    });
                });
                if (!self.running) {
                    self._pop();
                }
            };

            return AsyncFuncQueue;
        }());


        if (utils.isSessionStorageSupported()) {
            utils.storage = sessionStorage;
        } else {
            utils.storage = { set: $.noop, getJSON: $.noop };
            mAlert("您的浏览器版本较旧, 请不要刷新。");
        }
        return utils;
    }();

    window.interactionMode = function() {
        var interactionMode = {};

        interactionMode.isMouseSupported = function() {
            return utils.getParameterByName('interaction-mode') === 'mouse';
        };

        return interactionMode;
    }();

    window.device = function () {
        var device = {};
        userAgent = window.navigator.userAgent.toLowerCase();

        // micromessenger is for Android/iOS
        // For a XiaoMi4 with windows 10 installed, the wechat browser can be differentiated using 'webbrowser' from 
        // the native browser.
        // For Yan's winPhone, the wechat browser has the same UA as the native browser.
        // So for winPhone, Richard decided that, as long as there is 'windows phone' in UA, it's regarded to be
        // wechat browser, though it might be the native browser.
        device.wechat = function () {
            return find('micromessenger') || find('windows phone');
        };
        device.bingDict = function () {
            var origin = utils.getParameterByName('origin');
            return origin && origin.indexOf('-bingdict') !== -1;
        };
        
        device.ios = function () {
            return device.iphone() || device.ipod() || device.ipad();
        };

        device.iphone = function () {
            return !device.windows() && find('iphone');
        };

        device.ipod = function () {
            return find('ipod');
        };

        device.ipad = function () {
            return find('ipad');
        };

        device.android = function () {
            return !device.windows() && find('android');
        };

        device.androidPhone = function () {
            return device.android() && find('mobile');
        };

        device.androidTablet = function () {
            return device.android() && !find('mobile');
        };

        device.blackberry = function () {
            return find('blackberry') || find('bb10') || find('rim');
        };

        device.blackberryPhone = function () {
            return device.blackberry() && !find('tablet');
        };

        device.blackberryTablet = function () {
            return device.blackberry() && find('tablet');
        };

        device.windows = function () {
            return find('windows');
        };

        device.windowsPhone = function () {
            return device.windows() && find('phone');
        };

        device.windowsTablet = function () {
            return device.windows() && (find('touch') && !device.windowsPhone());
        };

        device.fxos = function () {
            return (find('(mobile;') || find('(tablet;')) && find('; rv:');
        };

        device.fxosPhone = function () {
            return device.fxos() && find('mobile');
        };

        device.fxosTablet = function () {
            return device.fxos() && find('tablet');
        };

        device.meego = function () {
            return find('meego');
        };

        device.cordova = function () {
            return window.cordova && location.protocol === 'file:';
        };

        device.nodeWebkit = function () {
            return typeof window.process === 'object';
        };

        device.mobile = function () {
            return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
        };

        device.tablet = function () {
            return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
        };

        device.desktop = function () {
            return !device.tablet() && !device.mobile();
        };

        var userAgent = navigator.userAgent.toLowerCase();
        var find = function (needle) {
            return userAgent.indexOf(needle) !== -1;
        };
        return device;
    }();

}));