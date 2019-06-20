define([
    'jquery',
    'knockout'
],
    function ($, ko) {
        return {
            template:
                '<div class="share-curtain" style="display: none" data-bind="event: { show: show }, click: hide"></div><div class="share-img share-curtain-img" style="display:none"></div>',
            viewModel: viewModel
        };

        function viewModel(params) {
            var self = this;
            self.show = function () {
                $('.share-img').show()
                .one(utils.animationStartEvent, function () {
                    $('.share-curtain').fadeIn();
                })
                .addClass('animated bounceInDown')
                .one(utils.animationEndEvent, function () {
                    $(this).removeClass('animated bounceInDown');
                });
            };

            self.hide = function () {
                $('.share-img').addClass('animated bounceOutUp')
               .one(utils.animationStartEvent, function () {
                   $('.share-curtain').delay(300).fadeOut();
               })
               .one(utils.animationEndEvent, function () {
                   $(this).removeClass('animated bounceOutUp').hide();

               });
            };
        }
    });