define(['jquery'],
    function($) {
        Number.prototype.mod = function(n) { return ((this % n) + n) % n; }

        function Stack(selector, options) {
            this.containerSelector = selector;
            this.$container = $(selector);
            // current item's index (the one on the top of the stack)
            this.current = -1;
            this.itemCount = this.$container.children('.stack-pane').length;
            options = $.extend({
                visibleCount: this.itemCount,
                zStep: 50,
                opacity: 1
            }, options);
            $.extend(this, options);
            this.visibleCount = Math.max(1, Math.min(this.itemCount, this.visibleCount));
            this.goToPane(0);
        }

        Stack.prototype._getItem = function (index) {
            return $('.stack-pane:eq('+ index + ')', this.containerSelector);
        }

        Stack.prototype.next = function() {
            this.goToPane(this.current + 1);
        }

        Stack.prototype.goToPane = function(index) {
            index = index.mod(this.itemCount);
            if (index === this.current) return;

            for (var i = 0; i < this.itemCount; ++i) {
                var $item = this._getItem(i);
                var dist = i - index;
                var endOpacity, endPointerEvents;
                if (dist < 0 || dist > this.visibleCount - 1) {
                    endOpacity = 0;
                    endPointerEvents = 'none';
                } else {
                    endOpacity = this.opacity;
                    endPointerEvents = 'auto';
                }
                var endZIndex = this.itemCount - i;
                var endZ = -this.zStep * dist;
                if (endZ > 0) endZ *= 5;
                $item.css({
                    opacity: endOpacity,
                    zIndex: endZIndex,
                    transform: 'translate3d(0,0,' + endZ + 'px)',
                    pointerEvents: endPointerEvents
                });
            }
            this.current = index;
        }

        return Stack;
    });