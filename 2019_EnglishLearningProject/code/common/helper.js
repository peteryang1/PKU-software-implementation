define([
    'jquery',
    'knockout'
], function ($, ko) {
    return new helper();

    function helper() {
        var self = this;
        var defaultLoadingType = 'loading-square-msft';
        // Loading
        var loading = {
            msg: ko.observable(''),
            show: ko.observable(false),
            type: ko.observable(defaultLoadingType),
            count: 0
        };

        self.showLoading = function (msg, type) {
            loading.msg(msg);
            loading.type(type || defaultLoadingType);
            loading.show(true);
            ++loading.count;
        }

        self.readCookie = function () {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        self.hideLoading = function () {
            --loading.count;
            if (!loading.count) {
                loading.show(false);
            }
        }
        ko.components.register('loading', { require: 'loading' });
        ko.applyBindings(loading, document.getElementById('loading-component'));

        //messagebox modal
        ko.components.register('messagebox', { require: 'messagebox' });
        ko.applyBindings({}, document.getElementById('messagebox-component'));

        // NOTE:
        // WeChat overwrite the definition of `mAlert`. So it's insecure to simply overwrite the definition
        // of `mAlert`. Rename our `mAlert` and `mConfirm` as `mAlert` and `mConfirm`.
        function globalizeMessageBox(isDebugging) {
            var confirm, alert;
            window.defaultConfirm = window.confirm;
            window.defaultAlert = window.alert;
            if (isDebugging) {
                confirm = function (msg, yesCallback, noCallback, yesText, noText) {
                    ((defaultConfirm(msg) ? yesCallback : noCallback) || $.noop)();
                };

                alert = function (msg, callback) {
                    defaultAlert(msg);
                    callback && callback();
                };
            } else {
                confirm = function (msg, yesCallback, noCallback, yesText, noText) {
                    $('#messagebox-modal').trigger('showConfirm', [msg, noCallback, yesCallback, noText, yesText]);
                };

                alert = function (msg, callback) {
                    $('#messagebox-modal').trigger('showAlert', [msg, callback]);
                };
            }
            window.mConfirm = confirm;
            window.mAlert = alert;
        }
        globalizeMessageBox(); // If you want to use the default mAlert/mConfirm when debugging, use globalizeMessageBox(true).

        // Modeless Messagebox
        ko.components.register('modeless', { require: 'modeless' });
        ko.applyBindings({}, document.getElementById('modeless-component'));
        self.prompt = function (msg) {
            $('#modeless').trigger('prompt', msg);
        };
        window.defaultPrompt = window.prompt;
        window.prompt = self.prompt; // globalizePrompt
    }
});