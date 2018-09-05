var CommonScrollJS = (function() {
    function CommonScrollJS(jElement, getHeightFunction, getScrollRedirect) {
        this.inited = false;
        this.touchStartY = 0;
        if(!jElement.is('.baron_container')) {
            this.jElement = jElement;
            var jElementWidth = jElement.outerWidth();
            this.getHeightFunction = getHeightFunction;
            this.barWrapper = $('<div class="baron_wrapper"><div class="baron_scroller"><div class="baron_scroller__bar"></div></div></div>');
            jElement.after(this.barWrapper);
            this.barWrapper.find('.baron_scroller').prepend(jElement);
            jElement.addClass('baron_container');
            this.barWrapper.height(getHeightFunction());
            this.barWrapper.width(jElementWidth);
            this.baronObj =  baron(this.barWrapper, {
                scroller: '.baron_scroller',
                container: '.baron_container',
                bar: '.baron_scroller__bar'
            })[0];
            this.baronScrollerBar = this.barWrapper.find('.baron_scroller__bar');
            this.jElement.data('common-scroll-obj', this);
            this.barScroller = this.barWrapper.children('.baron_scroller').get(0);
            this.nonbounce();
            this.initEvents();
            this.inited = true;
            if(getScrollRedirect) {
                this.barWrapper.addClass('baron_wrapper_scroll_redirect');
            }
        }
    };

    CommonScrollJS.prototype.onScrollHandlers = {};

    CommonScrollJS.prototype.initEvents = function() {
        var self = this;
        this.barWrapper.find('.baron_scroller').bind('scroll', _.throttle(function(e) {
            var isAtTop = this.scrollTop == 0;
            var isAtBottom = self.isAtBottom();
            var topOffset = this.scrollTop;
            self.jElement.trigger('jsp-scroll-y',[topOffset, isAtTop, isAtBottom]);
            self.jElement.trigger('jsp-wheel-y',[topOffset, isAtTop, isAtBottom, 1]);
            self.barWrapper.find('input:focus').blur();

            self.triggerOnScrollHandlers(topOffset, isAtTop, isAtBottom);
        }, 100));
        var mwEvent = $.fn.mwheelIntent ? 'mwheelIntent.jsp' : 'mousewheel.jsp';
        this.barWrapper.find('.baron_scroller').bind(mwEvent, _.throttle(function(event, delta, deltaX, deltaY, dontPropagate) {
            var $target = $(event.target);
            if($target.parents('select,.chzn-drop').length > 0) {
                return true;
            }
            else {
                var isAtTop = self.barScroller.scrollTop == 0;
                var isAtBottom = self.isAtBottom();
                var topOffset = self.barScroller.scrollTop;
                self.jElement.trigger('jsp-wheel-y',[topOffset, isAtTop, isAtBottom, deltaY]);
                self.barWrapper.find('input:focus').blur();
                // return true if there was no movement so rest of screen can scroll
                return !dontPropagate;
            }
        }, 100));
    };

    CommonScrollJS.prototype.isAtBottom = function() {
        return this.barScroller.scrollHeight - this.barScroller.offsetHeight <= this.barScroller.scrollTop;
    };

    CommonScrollJS.prototype.hasScroll = function() {
        return !$(this.barScroller).children('.baron_scroller__bar').hasClass('baron_scroller__bar-hidden');
    };

    CommonScrollJS.prototype.scrollToBlock = function(elem, shift, isSmooth) {
        if(typeof(shift) == 'undefined') {
            shift = 0;
        }
        if(elem.length > 0) {
            var elemTop = elem.offset().top;
            var barTop = this.jElement.offset().top;
            var toScroll = elemTop - barTop + shift;

            if (isSmooth) {
                var self = this;
                $(this.barScroller).css('will-change', 'scroll-position');
                $(this.barScroller).animate({scrollTop: toScroll}, 500, 'swing', function() {
                    $(self.barScroller).css('will-change', 'none');
                });
            }
            else {
                this.barScroller.scrollTop = elemTop - barTop + shift;
            }
        }
    };

    CommonScrollJS.prototype.scrollToY = function(pos) {
        this.barScroller.scrollTop = pos;
    };

    CommonScrollJS.prototype.getContentPositionY = function() {
        return this.barScroller.scrollTop;
    };

    CommonScrollJS.prototype.reinitialise = function() {
        this.reinit(true);
    };

    CommonScrollJS.prototype.reinitHeight = function() {
        this.reinit(false);
    };

    CommonScrollJS.prototype.reinit = function(reinitWidth) {
        if(this.inited) {
            this.barWrapper.height(this.getHeightFunction());
            if(reinitWidth) {
                this.barWrapper.width(this.getWidthFunction());
            }
            this.baronObj.reinit();

            var isAtTop = this.scrollTop == 0;
            var isAtBottom = this.isAtBottom();
            var topOffset = this.scrollTop;
            this.triggerOnScrollHandlers(topOffset, isAtTop, isAtBottom);
        }
    };

    CommonScrollJS.prototype.getWidthFunction = function() {
        this.barWrapper.hide();
        var jElementWidth = this.barWrapper.parent().width();
        this.barWrapper.show();

        return jElementWidth;
    };

    CommonScrollJS.prototype.destroy = function() {
        if(this.inited) {
            $(window).unbind('touchmove', this.touchMove);
            $(window).unbind('touchstart', this.touchStart);
            this.barWrapper.before(this.jElement);
            this.barWrapper.remove();
            this.jElement.removeClass('baron_container');
            this.jElement.removeData('common-scroll-obj');
            this.baronObj.destroy();
        }
    };

    CommonScrollJS.prototype.touchMoveStart = function(evt) {
        var isAtTop = this.barScroller.scrollTop == 0;
        var isAtBottom = this.isAtBottom();
        var topOffset = this.barScroller.scrollTop;
        this.jElement.trigger('jsp-wheel-y',[topOffset, isAtTop, isAtBottom, 1]);

        evt.stopImmediatePropagation();
    };

    CommonScrollJS.prototype.touchMove = function(evt) {
        var isAtTop = this.barScroller.scrollTop == 0;
        var isAtBottom = this.isAtBottom();
        var topOffset = this.barScroller.scrollTop;
        this.jElement.trigger('jsp-wheel-y',[topOffset, isAtTop, isAtBottom, 1]);

        var y = (evt.touches) ? evt.touches[0].screenY : evt.screenY;

        var elem = this.barScroller;

        // Prevents scrolling of content to top
        if (elem.scrollTop === 0 && this.touchStartY <= y) {
            evt.preventDefault();
        }

        // Prevents scrolling of content to bottom
        if (elem.scrollHeight-elem.offsetHeight === elem.scrollTop && this.touchStartY >= y) {
            evt.preventDefault();
        }
    };

    CommonScrollJS.prototype.touchStart = function(evt) {
        if($(evt.target).is('.baron_scroller') || $(evt.target).parents('.baron_scroller').length > 0) {
            evt.stopPropagation();
        }

        this.touchStartY = (evt.touches) ? evt.touches[0].screenY : evt.screenY;
    };

    CommonScrollJS.prototype.nonbounce = function() {
        $(window).bind('touchmove', $.proxy(this.touchMove, this));
        $(this.barScroller).bind('touchmove', $.proxy(this.touchMoveStart, this));
        $(window).bind('touchstart', $.proxy(this.touchStart, this));
    };

    CommonScrollJS.prototype.addOnScrollHandler = function(name, handler) {
        this.onScrollHandlers[name] = handler;
    };

    CommonScrollJS.prototype.removeOnScrollHandler = function(name) {
        delete this.onScrollHandlers[name];
    };

    CommonScrollJS.prototype.triggerOnScrollHandlers = function(topOffset, isAtTop, isAtBottom) {
        _.each(_.values(this.onScrollHandlers), function(handler) {
            handler(topOffset, isAtTop, isAtBottom);
        })
    };

    return CommonScrollJS;
})();
