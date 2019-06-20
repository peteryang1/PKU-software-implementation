define([
    'jquery',
    'hammer'
],
    function ($, Hammer) {
        function Carousel(selector, option) {
            var self = this;
            var $carousel = $(selector);
            var $container = $('.pane-container', selector);
            var $panes = $('.pane', selector);

            var carouselWidth = 0;
            var paneWidth = 0;
            var containerWidth = 0;
            var containerOffset = 0;
            var marginWidth = 0;
            var paneCount = $panes.length;
            var panBoundary = .25; // if the pane is paned .25, switch to the next pane.

            var currentPane = -1;
            var hammer = new Hammer($carousel[0])
                .on('swipeleft swiperight swipeup swipedown', handleSwipe)
                .on('panstart panmove panend pancancel', handlePan);
            hammer.get('pan').set({ threshold: 0 });

            self.setSize = function (_carouselWidth) {
                carouselWidth = _carouselWidth;
                $carousel.width(carouselWidth);
                paneWidth = carouselWidth * option.paneWidthPercent;
                containerWidth = paneWidth * (paneCount + (paneCount - 1) * option.paneMarginPercent);
                containerOffset = (carouselWidth - paneWidth) / 2;
                marginWidth = paneWidth * option.paneMarginPercent;
                $panes.each(function (i) {
                    $(this).width(paneWidth);
                    if (i !== 0) $(this).css('margin-left', marginWidth);
                });
                $container.width(containerWidth);
                self.showPane(currentPane);
            }

            self.showPane = function (index, velocityX) {
                $('.dot:eq(' + currentPane + ')', $carousel).removeClass('on');
                var lastPane = currentPane;
                currentPane = Math.max(0, Math.min(index, paneCount - 1));
                setContainerOffsetX(0, true, velocityX);
                $('.dot:eq(' + currentPane + ')', $carousel).addClass('on');
                if (lastPane !== currentPane) {
                    option.onPaneChange(currentPane);
                }
            }

            function setContainerOffsetX(offset, doAnimation, velocityX) {
                var offsetX = -currentPane * paneWidth + containerOffset - marginWidth * currentPane + offset;
                var time = doAnimation ? 400 : 0;
                if (velocityX) {
                    var left = $container.position().left;
                    var animTime = (left - offsetX) / velocityX;
                    if (animTime >= 0) {
                        time = animTime;
                    }
                }
                $container.stop().animate({ left: offsetX }, time);
            }

            self.next = function (velocityX) {
                self.showPane(currentPane + 1, velocityX);
            }
            self.prev = function (velocityX) {
                self.showPane(currentPane - 1, velocityX);
            }

            function handleSwipe(e) {
                switch (e.direction) {
                    case Hammer.DIRECTION_LEFT:
                        self.next(e.velocityX);
                        break;
                    case Hammer.DIRECTION_RIGHT:
                        self.prev(e.velocityX);
                        break;
                }
                // Disable the default scroll behavior.
                e.preventDefault();
                hammer.stop(true);
            }

            function outOfBound() {
                var left = Math.round($container.position().left - containerOffset);
                return (currentPane === 0 && left >= 0) ||
                  (currentPane === paneCount - 1 && left <= -containerWidth + paneWidth);
            }

            function handlePan(e) {
                switch (e.type) {
                    case 'panstart':
                    case 'panmove':
                        // Slow down at the first and last pane.
                        if (outOfBound()) {
                            e.deltaX *= .2;
                        }
                        setContainerOffsetX(e.deltaX, false);
                        break;
                    case 'panend':
                    case 'pancancel':
                        if (e.direction == Hammer.DIRECTION_LEFT
                            || e.direction == Hammer.DIRECTION_RIGHT
                            && Math.abs(e.deltaX) > paneWidth * panBoundary) {
                            if (e.deltaX > 0) {
                                self.prev();
                            } else {
                                self.next();
                            }
                        } else {
                            self.showPane(currentPane);
                        }
                        break;
                }
                // Disable the default scroll behavior.
                e.preventDefault();
            }

            function init() {
                option = option || {};
                option.paneWidthPercent = option.paneWidthPercent || 1;
                option.paneMarginPercent = option.paneMarginPercent || 0;
                option.showDots = option.showDots || false;
                option.onPaneChange = option.onPaneChange || $.noop;
                option.initPaneIndex = Math.max(0, Math.min(option.initPaneIndex || 0, paneCount - 1));
                self.setSize($carousel.width());
                if (option.showDots) {
                    var $dotContainer = $('<div class="dot-container">');
                    for (var i = 0; i < paneCount; ++i) {
                        $dotContainer.append('<span class="dot">');
                    }
                    $carousel.append($dotContainer);
                }
                self.showPane(option.initPaneIndex);
            }
            init();
        }

        return Carousel;
    });