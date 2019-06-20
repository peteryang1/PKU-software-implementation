define([
    'knockout',
    'text!./loading.html'
], function (ko, loadingTemplate) {
        var showLoading = function () {
            $('#loading').stop().fadeIn().siblings().addClass('blurred');
        }

        var hideLoading = function () {
            $('#loading').stop().fadeOut(function () {
                $(this).siblings().removeClass('blurred');
            });
        }

        ko.bindingHandlers.loadingFade = {
            update: function (elem, valueAccessor) {
                if (ko.unwrap(valueAccessor())) {
                    showLoading();
                } else {
                    hideLoading();
                }
            }
        }

        function loadingViewModel(params) {
            var self = this;
            self.type = params.type;
            self.show = params.show;
            self.msg = params.msg;
        }
        return { viewModel: loadingViewModel, template: loadingTemplate };

    });