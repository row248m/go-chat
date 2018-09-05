!function(undefined) {
    "use strict";
    var baron = function(root, data) {
        var out = [];
        root[0] || (root = [root]);
        for (var i = 0; i < root.length; i++)
            out[i] = new baron.init(root[i],data);
        return out
    };
    baron.init = function(root, gData) {
        function barOn(on) {
            on ? dom(bar).addClass(gData.barOnCls || "") : dom(bar).removeClass(gData.barOnCls || "")
        }
        function posBar(top, height) {
            var barMinHeight = gData.barMinHeight || 20;
            dom(bar).css("top", top + "px"),
            height !== undefined && (height > 0 && height < barMinHeight && (height = barMinHeight),
                dom(bar).css({
                    height: height + "px"
                }),
                0 == height ? dom(bar).addClass("baron_scroller__bar-hidden") : dom(bar).removeClass("baron_scroller__bar-hidden"))
        }
        function k() {
            return scroller.clientHeight - bar.offsetHeight - (gData.barTop || 0)
        }
        function relToTop(r) {
            return r * k() + (gData.barTop || 0)
        }
        function topToRel(t) {
            return (t - (gData.barTop || 0)) / k()
        }
        function dontStartSelect() {
            return !1
        }
        function selection(on) {
            event(document, "selectstart", dontStartSelect, on ? "off" : "")
        }
        var viewPortHeight, topHeights, rTimer, selector, event, dom, scroller, container, bar, barTop, drag, scrollerY0, oldBarHeight = 0, oldBarTop = 0;
        this.viewport = function() {
            viewPortHeight = scroller.clientHeight,
                topHeights = []
        }
            ,
            this.updateScrollBar = function() {
                var containerTop, newBarHeight;
                dom(bar).addClass("baron_scroller__bar-visible"),
                    containerTop = -(scroller.pageYOffset || scroller.scrollTop),
                    barTop = relToTop(-containerTop / (container.offsetHeight - scroller.clientHeight)),
                    newBarHeight = scroller.clientHeight * scroller.clientHeight / container.offsetHeight,
                    dom(bar).removeClass("baron_scroller__bar-visible"),
                scroller.clientHeight >= container.offsetHeight && (newBarHeight = 0);
                var topDiff = Math.abs(barTop - oldBarTop)
                    , heightDiff = Math.abs(newBarHeight - oldBarHeight);
                (topDiff > 3 || heightDiff > 3 || 0 == newBarHeight) && (heightDiff > 3 || 0 == newBarHeight ? (posBar(barTop, newBarHeight),
                    oldBarHeight = newBarHeight) : posBar(barTop),
                    oldBarTop = barTop)
            }
            ,
            this.setScrollerWidth = function() {
                dom(scroller).css("width", getDomComputedWidth(scroller.parentNode) + scroller.offsetWidth - scroller.clientWidth + "px")
            }
        ;
        var $ = window.jQuery;
        if (selector = gData.selector || $,
        selector && (event = gData.event || function(elem, event, func, off) {
            $(elem)[off || "on"](event, func)
        }
            ,
        (gData.event || $) && (dom = gData.dom || $,
        dom && (scroller = dom(root).children(gData.scroller).get(0),
            bar = dom(scroller).children(gData.bar).get(0),
            container = selector(gData.container, scroller)[0],
        scroller && container && bar)))) {
            barOn(scroller.clientHeight < container.offsetHeight),
                this.setScrollerWidth(),
                this.viewport(),
                event(scroller, "scroll", this.updateScrollBar);
            var that = this
                , onWinResize = function() {
                clearTimeout(rTimer),
                    rTimer = setTimeout(function() {
                        that.viewport(),
                            that.updateScrollBar(),
                            barOn(container.offsetHeight > scroller.clientHeight)
                    }, 200)
            };
            event(window, "resize", onWinResize),
                event(bar, "mousedown", function(e) {
                    e.preventDefault(),
                        selection(),
                        drag = 1
                });
            var onDocMouseUp = function(e) {
                selection(1),
                    drag = 0
            };
            event(document, "mouseup blur", onDocMouseUp);
            var onDocMouseDown = function(e) {
                scrollerY0 = e.clientY - barTop
            };
            event(document, "mousedown", onDocMouseDown);
            var onDocMouseMove = function(e) {
                drag && (scroller.scrollTop = topToRel(e.clientY - scrollerY0) * (container.offsetHeight - scroller.clientHeight))
            };
            event(document, "mousemove", onDocMouseMove),
                this.destroyEvents = function() {
                    event(window, "resize", onWinResize, "off"),
                        event(document, "mouseup blur", onDocMouseUp, "off"),
                        event(document, "mousedown", onDocMouseDown, "off"),
                        event(document, "mousemove", onDocMouseMove, "off")
                }
            ;
            var speed = 50;
            return event(scroller, "mousewheel", function(e, delta, deltaX, deltaY, redirected) {
                if (redirected) {
                    var scrollDiff = -deltaY * speed;
                    return scroller.scrollTop += scrollDiff,
                        e.preventDefault(),
                        e.stopPropagation(),
                        !1
                }
            }),
                event(scroller, "keydown.jsp", function(e, redirected) {
                    if (redirected) {
                        switch (e.keyCode) {
                            case 40:
                                scroller.scrollTop += speed;
                                break;
                            case 38:
                                scroller.scrollTop -= speed;
                                break;
                            case 34:
                            case 32:
                                scroller.scrollTop += scroller.offsetHeight;
                                break;
                            case 33:
                                scroller.scrollTop -= scroller.offsetHeight;
                                break;
                            case 35:
                                scroller.scrollTop += scroller.scrollHeight;
                                break;
                            case 36:
                                scroller.scrollTop -= scroller.scrollHeight
                        }
                        return e.preventDefault(),
                            e.stopPropagation(),
                            !1
                    }
                }),
                this.updateScrollBar(),
                this
        }
    }
        ,
        baron.init.prototype.reinit = function() {
            this.viewport(),
                this.setScrollerWidth(),
                this.updateScrollBar()
        }
        ,
        baron.init.prototype.destroy = function() {
            this.destroyEvents()
        }
        ,
        window.baron = baron
}()