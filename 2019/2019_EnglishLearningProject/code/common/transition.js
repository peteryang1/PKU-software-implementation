define(['jquery'], function ($) {
    return new Transition();

    function Transition() {
        var self = this;
        var transStyles = {
            'fade': { name: 'fade', in: 'fadeIn', out: 'fadeOut' },
            'fadeLeft': { name: 'fadeToLeft', in: 'fadeInRight', out: 'fadeOutLeft', reverse: 'fadeRight' },
            'fadeRight': { name: 'fadeToRight', in: 'fadeInLeft', out: 'fadeOutRight', reverse: 'fadeLeft' },
            'fadeUp': { name: 'fadeToUp', in: 'fadeInUp', out: 'fadeOutUp', reverse: 'fadeDown' },
            'fadeDown': { name: 'fadeToDown', in: 'fadeInDown', out: 'fadeOutDown', reverse: 'fadeUp' },
            'bounce': { name: 'bounce', in: 'bounceIn', out: 'bounceOut' },
            'bounceLeft': { name: 'bounceLeft', in: 'bounceInRight', out: 'bounceOutLeft' },
            'bounceRight': { name: 'bounceRight', in: 'bounceInLeft', out: 'bounceOutRight' },
            'bounceUp': { name: 'bounceUp', in: 'bounceInUp', out: 'bounceOutUp' },
            'bounceDown': { name: 'bounceDown', in: 'bounceInDown', out: 'bounceOutDown' },
        };

        function bindTransition($page, trans, isIn, callback) {
            var transClass = isIn ? trans.in : trans.out;
            $page.addClass('animated ' + transClass);
            $page.data('animate-num', ($page.data('animate-num') || 0) + 1);
            $page.one(utils.animationEndEvent, function (event) {
                if ($page.data('animate-num') <= 0) { // A bug in quiz page: if sub quiz page ends its animation, the quiz paqe container also gets this event.
                    $page.data('animate-num', 0);
                    return;
                }
                $page.data('animate-num', ($page.data('animate-num') || 0) - 1);
                if ($page.data('animate-num') < 0) {
                    mAlert('ERROR! animate num less than 0');
                }
                if ($page.data('animate-num') === 0) {
                    $page.removeClass('animated');
                    callback();
                }
                $page.removeClass(transClass)
                    .toggleClass('active', isIn);
            });
        }

        self.transitBetween = function ($from, $to, transName, reverse, callbacks) {
            callbacks = $.extend({ inCallback: $.noop, outCallback: $.noop }, callbacks);
            var trans = transStyles[transName || defaultTransName];
            reverse && (trans = transStyles[trans.reverse]);
            if ($from && $from.length > 0) bindTransition($from, trans, false, callbacks.outCallback);
            if ($to && $to.length > 0) bindTransition($to, trans, true, callbacks.inCallback);
        }
    }
});