$.fn.imagesLoaded = function (fn) {
	var $imgs = this.find('img[src!=""]'), imgArr = {cpl : [], err : []};
	if (!$imgs.length){
		if(fn) fn();
		return;
	}
	var dfds = [], cnt = 0;
	$imgs.each(function(){
		var _this = this;
		var dfd = $.Deferred();
		dfds.push(dfd);
		var img = new Image();
		img.onload = function(){
			imgArr.cpl.push(_this);
			check();
		}
		img.onerror = function(){
			imgArr.err.push(_this);
			check();
		}
		img.src = this.src;
	});
	function check(){
		cnt++;
		if(cnt === $imgs.length){
			if(fn) fn.call(imgArr);
		}
	}
};

var Owen_slide = function(el, params){
	var defaults = {
		list : ".owen-slide",
		paging : "",
		speed : 300,
		initialSlide : 0,
		activeW : 0,
		slidesW : 0,
		autoplay : "",
		easing : "swing",
		mode : 'horizontal',
		useCSS3Transforms : true,
		onLoad : function(){},
		onSlideChangeStart : function(){},
		onSlideChangeEnd : function(){}
	};
	params = params || {};
    for (var prop in defaults) {
        if (prop in params && typeof params[prop] === 'object') {
            for (var subProp in defaults[prop]) {if (! (subProp in params[prop])) params[prop][subProp] = defaults[prop][subProp];}
        } else if (! (prop in params)) {params[prop] = defaults[prop];}
    };
	this.params = params;

	var _this = this;
    this.bx = $(el);
    this.activeIdx = "";
	var bx = this.bx, area = ( params.mode === 'horizontal' ? 'width' : 'height' ), dirc = ( params.mode === 'horizontal' ? 'left' : 'top' ) ,space = bx.css(area);
	var oriLi = bx.find(params.list), oriLen = oriLi.length, ul = oriLi.parent(), interval = "";
    var li, len, page = bx.find(params.paging), flag = true, activeSlide;
	this.wrapper = ul[0], this.oriList = oriLi;
	this.list = [];

	if (!window.getComputedStyle) {
		window.getComputedStyle_MTslide = function (el, pseudo) {
			this.el = el;
			this.getPropertyValue = function (prop) {
				var re = /(\-([a-z]){1})/g;
				if (prop === 'float') prop = 'styleFloat';
				if (re.test(prop)) {
					prop = prop.replace(re, function () {
						return arguments[2].toUpperCase();
					});
				}
				return el.currentStyle[prop] ? el.currentStyle[prop] : null;
			};
			return this;
		};
	}else{
		 window.getComputedStyle_MTslide = window.getComputedStyle;
	}


	this.adjustW = function(active){
		li.css(area, params.slidesW || space);
		params.activeW && active.css(area, params.activeW);
	};

	this.slideTo = function(idx, speed, flg){
		if(flg === undefined) flg = true;
		var sd = this.list[idx];
		if(!flag) return;
		flag = false;
		speed = (speed === undefined) ? params.speed : speed;
		var mo, sdIdx = sd.index(), dist = sd.position()[dirc] - (params.activeW && activeSlide && activeSlide.index() < sd.index()  ? params.activeW - params.slidesW : 0);
		_this.activeIdx = sdIdx;
		if(flg) params.onSlideChangeStart();
		var aniEle = {};
		aniEle[area] = params.slidesW;
		if(activeSlide && params.slidesW) activeSlide.animate(aniEle,speed, params.easing);
		aniEle = {}, aniEle[area] = params.activeW;
		if(params.activeW) sd.animate(aniEle,speed, params.easing);

		aniEle = {}, aniEle[dirc] = -dist;

		if (_this.support.transitions) {
            _this.setWrapperTranslate(-dist);
            _this.setWrapperTransition(speed);
			setTimeout(function(){
				aniCallBack();
			},speed+10);
        }
        else {
			ul.animate(aniEle,speed, params.easing, aniCallBack);
        }

		function aniCallBack(){
			_this.setWrapperTransition(0);
			if(sdIdx <= 1 || sdIdx >= len-2){ //솔루션화 하려면 이 부분을 좀더 보강해야 한다.
				sd = sdIdx <= 1 ? _this.list[sdIdx+oriLen] : _this.list[sdIdx-oriLen];
				dist = sd.position()[dirc] - (params.activeW && activeSlide && sdIdx <= 1  ?params.activeW - params.slidesW : 0 );
				sdIdx = sd.index();
				_this.adjustW(sd);
				_this.setWrapperTranslate(-dist);
			}

			activeSlide = sd.siblings('.active').removeClass('active').end().addClass('active');
			_this.activeIdx = sdIdx;
			if(!flg) params.onSlideChangeEnd();
			flag = true;
		}
	};

	this.slideNext = function(){_this.slideTo(_this.activeIdx+1)};
	this.slidePrev = function(){_this.slideTo(_this.activeIdx-1)};

	this.init = function(){
		space = bx.css(area,'').css(area);
		this.adjustW(_this.list[_this.activeIdx]);
		this.slideTo(_this.activeIdx,0,false);
	};
	this.align = function(){
		{ //솔루션화 하려면 이 부분을 좀더 보강해야 한다.
			var addSlide = oriLi.eq(0).add(oriLi.eq(1)).clone().addClass('duplicate');
			ul.append(addSlide);
			addSlide = oriLi.eq(oriLen-1).add(oriLi.eq(oriLen-2)).clone().addClass('duplicate');
			ul.prepend(addSlide);
		}
		var initSlide = oriLi.eq(params.initialSlide);
		li = bx.find(params.list), len = li.length;
		var list = _this.list;
		for(var i = 0 ; i < len ; i++) list.push(li.eq(i));
		len = list.length;
		this.adjustW(initSlide);
		$(li).imagesLoaded(function(){
			var wd = 0;
			for(var j = 0 ; j < len ; j++){
				wd += parseInt(list[j].css(area));
			}
			ul.css(area, wd);
			_this.slideTo(initSlide.index(),0, false);
			params.onLoad(_this);
		});
	};
	this.align();
};//Owen_slide

var motionObjs = {
    plugins : {},
    /*==================================================
        Wrapper Operations
    ====================================================*/
    wrapperTransitionEnd : function (callback, permanent) {
        'use strict';
        var a = this,
            el = a.wrapper,
            events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i;

        function fireCallBack(e) {
            if (e.target !== el) return;
            callback(a);
            if (a.params.queueEndCallbacks) a._queueEndCallbacks = false;
            if (!permanent) {
                for (i = 0; i < events.length; i++) {
                    a.h.removeEventListener(el, events[i], fireCallBack);
                }
            }
        }

        if (callback) {
            for (i = 0; i < events.length; i++) {
                a.h.addEventListener(el, events[i], fireCallBack);
            }
        }
    },

    getWrapperTranslate : function (axis) {
        'use strict';
        var el = this.wrapper,
            matrix, curTransform, curStyle, transformMatrix;

        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = this.params.mode === 'horizontal' ? 'x' : 'y';
        }

        if (this.support.transforms && this.params.useCSS3Transforms) {
            curStyle = window.getComputedStyle_MTslide(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }

            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
        }
        else {
            if (axis === 'x') curTransform = parseFloat(el.style.left, 10) || 0;
            if (axis === 'y') curTransform = parseFloat(el.style.top, 10) || 0;
        }
        return curTransform || 0;
    },

    setWrapperTranslate : function (x, y, z) {
        'use strict';
        var es = this.wrapper.style,
            coords = {x: 0, y: 0, z: 0},
            translate;

        // passed all coordinates
        if (arguments.length === 3) {
            coords.x = x;
            coords.y = y;
            coords.z = z;
        }

        // passed one coordinate and optional axis
        else {
            if (typeof y === 'undefined') {
                y = this.params.mode === 'horizontal' ? 'x' : 'y';
            }
            coords[y] = x;
        }

        if (this.support.transforms && this.params.useCSS3Transforms) {
            translate = this.support.transforms3d ? 'translate3d(' + coords.x + 'px, ' + coords.y + 'px, ' + coords.z + 'px)' : 'translate(' + coords.x + 'px, ' + coords.y + 'px)';
            es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = translate;
        }
        else {
            es.left = coords.x + 'px';
            es.top  = coords.y + 'px';
        }
    },

    setWrapperTransition : function (duration) {
        'use strict';
        var es = this.wrapper.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = (duration / 1000) + 's';


    },

    /*==================================================
        Helpers
    ====================================================*/
    h : {
        getWidth: function (el, outer, round) {
            'use strict';
            var width = window.getComputedStyle_MTslide(el, null).getPropertyValue('width');
            var returnWidth = parseFloat(width);
            //IE Fixes
            if (isNaN(returnWidth) || width.indexOf('%') > 0 || returnWidth < 0) {
                returnWidth = el.offsetWidth - parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-left')) - parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-right'));
            }
            if (outer) returnWidth += parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-left')) + parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-right'));
            if (round) return Math.ceil(returnWidth);
            else return returnWidth;
        },
        getHeight: function (el, outer, round) {
            'use strict';
            if (outer) return el.offsetHeight;

            var height = window.getComputedStyle_MTslide(el, null).getPropertyValue('height');
            var returnHeight = parseFloat(height);
            //IE Fixes
            if (isNaN(returnHeight) || height.indexOf('%') > 0 || returnHeight < 0) {
                returnHeight = el.offsetHeight - parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-top')) - parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-bottom'));
            }
            if (outer) returnHeight += parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-top')) + parseFloat(window.getComputedStyle_MTslide(el, null).getPropertyValue('padding-bottom'));
            if (round) return Math.ceil(returnHeight);
            else return returnHeight;
        },
        getOffset: function (el) {
            'use strict';
            var box = el.getBoundingClientRect();
            var body = document.body;
            var clientTop  = el.clientTop  || body.clientTop  || 0;
            var clientLeft = el.clientLeft || body.clientLeft || 0;
            var scrollTop  = window.pageYOffset || el.scrollTop;
            var scrollLeft = window.pageXOffset || el.scrollLeft;
            if (document.documentElement && !window.pageYOffset) {
                //IE7-8
                scrollTop  = document.documentElement.scrollTop;
                scrollLeft = document.documentElement.scrollLeft;
            }
            return {
                top: box.top  + scrollTop  - clientTop,
                left: box.left + scrollLeft - clientLeft
            };
        },
        windowWidth : function () {
            'use strict';
            if (window.innerWidth) return window.innerWidth;
            else if (document.documentElement && document.documentElement.clientWidth) return document.documentElement.clientWidth;
        },
        windowHeight : function () {
            'use strict';
            if (window.innerHeight) return window.innerHeight;
            else if (document.documentElement && document.documentElement.clientHeight) return document.documentElement.clientHeight;
        },
        windowScroll : function () {
            'use strict';
            if (typeof pageYOffset !== 'undefined') {
                return {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
            }
            else if (document.documentElement) {
                return {
                    left: document.documentElement.scrollLeft,
                    top: document.documentElement.scrollTop
                };
            }
        },

        addEventListener : function (el, event, listener, useCapture) {
            'use strict';
            if (typeof useCapture === 'undefined') {
                useCapture = false;
            }

            if (el.addEventListener) {
                el.addEventListener(event, listener, useCapture);
            }
            else if (el.attachEvent) {
                el.attachEvent('on' + event, listener);
            }
        },

        removeEventListener : function (el, event, listener, useCapture) {
            'use strict';
            if (typeof useCapture === 'undefined') {
                useCapture = false;
            }

            if (el.removeEventListener) {
                el.removeEventListener(event, listener, useCapture);
            }
            else if (el.detachEvent) {
                el.detachEvent('on' + event, listener);
            }
        }
    },
    setTransform : function (el, transform) {
        'use strict';
        var es = el.style;
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transform;
    },
    setTranslate : function (el, translate) {
        'use strict';
        var es = el.style;
        var pos = {
            x : translate.x || 0,
            y : translate.y || 0,
            z : translate.z || 0
        };
        var transformString = this.support.transforms3d ? 'translate3d(' + (pos.x) + 'px,' + (pos.y) + 'px,' + (pos.z) + 'px)' : 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';
        es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = transformString;
        if (!this.support.transforms) {
            es.left = pos.x + 'px';
            es.top = pos.y + 'px';
        }
    },
    setTransition : function (el, duration) {
        'use strict';
        var es = el.style;
        es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration + 'ms';
    },
    /*==================================================
        Feature Detection
    ====================================================*/
    support: {

        touch : (window.Modernizr && Modernizr.touch === true) || (function () {
            'use strict';
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        })(),

        transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),

        transforms : (window.Modernizr && Modernizr.csstransforms === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
        })(),

        transitions : (window.Modernizr && Modernizr.csstransitions === true) || (function () {
            'use strict';
            var div = document.createElement('div').style;
            return ('transition' in div || 'WebkitTransition' in div || 'MozTransition' in div || 'msTransition' in div || 'MsTransition' in div || 'OTransition' in div);
        })(),

        classList : (function () {
            'use strict';
            var div = document.createElement('div');
            return 'classList' in div;
        })()
    },

    browser : {

        ie8 : (function () {
            'use strict';
            var rv = -1; // Return value assumes failure.
            if (navigator.appName === 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
                if (re.exec(ua) !== null)
                    rv = parseFloat(RegExp.$1);
            }
            return rv !== -1 && rv < 9;
        })(),

        ie10 : window.navigator.msPointerEnabled,
        ie11 : window.navigator.pointerEnabled
    }
};
Owen_slide.prototype = motionObjs;
