 if (!Event.prototype.preventDefault) {Event.prototype.preventDefault=function() {this.returnValue=false;};}
 if (!Event.prototype.stopPropagation) {Event.prototype.stopPropagation=function() {this.cancelBubble=true;};}

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
		slidesToShow : 3,
		loop : true,
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
	var bx = this.bx, area = ( params.mode === 'horizontal' ? 'width' : 'height' ), dirc = ( params.mode === 'horizontal' ? 'left' : 'top' ) ,space = parseInt(bx.css(area));
	var oriLi = bx.find(params.list), oriLen = oriLi.length, ul = oriLi.parent(), interval = "", list;
    var li, len, page = bx.find(params.paging), flag = true, activeSlide, win = $(window);
	this.wrapper = ul[0], this.oriList = oriLi;
	list = this.list = [];
	var sp_touch = this.support.touch;
	var touchEv = {
		down : (sp_touch ? 'touchstart' : 'mousedown'),
		move : (sp_touch ? 'touchmove' : 'mousemove'),
		up : (sp_touch ? 'touchend' : 'mouseup')
	};



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
		li.css(area, params.slidesW || (space/params.slidesToShow));
		params.activeW && active.css(area, params.activeW);
	};
	this.slideTo = function(idx, speed, flg){
		if(flg === undefined) flg = true;
		var sd = typeof idx == 'object' ? idx : list[idx].el;
		if(!flag) return;
		flag = false;
		speed = (speed === undefined) ? params.speed : speed;
		var mo, sdIdx = sd.index(), dist = sd.position()[dirc] - (params.activeW && activeSlide && activeSlide.index() < sd.index() ? params.activeW - params.slidesW : 0);
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
			if(list[sdIdx].duple){ //솔루션화 하려면 이 부분을 좀더 보강해야 한다.
				sd = list[sdIdx].duple == -1 ? list[sdIdx+oriLen].el : list[sdIdx-oriLen].el;
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

	this.reinit = function(){
		space = parseInt(bx.css(area,'').css(area));
		this.adjustW(list[_this.activeIdx].el);
		this.slideTo(_this.activeIdx,0,false);
	};

	this.resize = function(o){
		o = o || {};
		o.first || (space = parseInt(bx.css(area)), _this.adjustW(_this.activeIdx));
		var wd = 0;
		for(var j = 0 ; j < len ; j++){
			wd += parseFloat(_this.list[j].el[0].style[area]);
		}
		ul.css(area, wd);
		_this.slideTo(_this.activeIdx,0, false);

	};
	var x1, y1, x2, y2, mStart, mCheck, posi, moveDist, rectPoints = [];
	this.swipeFn = {
		down : function(e){
			if(e.type == 'mousedown'){
				x1 = e.pageX;
				y1 = e.pageY;
			}else{
				x1 = e.originalEvent.touches[0].pageX;
				y1 = e.originalEvent.touches[0].pageY;
			}
			posi = _this.getWrapperTranslate();
			rectPoints = [bx.offset().top, bx.offset().left + bx.width(), bx.offset().top + bx.height(), bx.offset().left];
			mStart = mCheck = true;
			moveDist = 0;
		},
		move : function(e){
			if(mStart){
				if(e.type == 'mousemove'){
					x2 = e.pageX - x1;
					y2 = e.pageY - y1;
				}else{
					x2 = e.originalEvent.touches[0].pageX - x1;
					y2 = e.originalEvent.touches[0].pageY - y1;
				}
				if(mCheck){
					if((params.mode === 'horizontal' && (Math.abs(x2/y2) < 1 || Math.abs(x2/y2) == -Infinity)) || (params.mode !== 'horizontal' && (Math.abs(y2/x2) < 1 || Math.abs(y2/x2) == -Infinity))){
						win.off(touchEv.move, _this.swipeFn.move);
						win.off(touchEv.up, _this.swipeFn.up);
						mCheck = false;
						mStart = x1 = y1 = undefined;
						return;
					}
					mCheck = false;
				}
				moveDist = params.mode === 'horizontal' ? x2 : y2
				if (_this.support.transitions) {
					_this.setWrapperTranslate(moveDist + posi);
					_this.setWrapperTransition(0);
				}
				else {
					ul.css(dirc, moveDist + posi);
				}
				if(e.pageY < rectPoints[0] || e.pageX > rectPoints[1] || e.pageY > rectPoints[2] || e.pageX < rectPoints[3]){
					_this.swipeFn.up(e);
				}
			}
			e.preventDefault();
		},
		up : function(e){
			e.preventDefault();
			mStart = x1 = y1 = undefined;
			win.off(touchEv.move, _this.swipeFn.move);
			win.off(touchEv.up, _this.swipeFn.up);
			var dircFlag = moveDist > 0 ? -1 : 1;
			if(100 < Math.abs(moveDist)){
				var targetList = _this.activeIdx;
				var bxLeft = bx.offset()[dirc];
				for (var i = 0; i < list.length; i++) {
					var liLeft = list[i].el.offset()[dirc];
					if((liLeft - bxLeft) > 0 && dircFlag === 1) {
						targetList = list[i].el;
						break;
					}else if((liLeft + list[i].el.innerWidth() - bxLeft) > 0 && dircFlag === -1){
						targetList = list[i].el;
						break;
					}
				}
				_this.slideTo(targetList);
			}else{
				_this.slideTo(_this.activeIdx);
			}
		}
	}


	this.init = function(){
		var addSlide = $(), preSlide = $();
		for (var i = params.slidesToShow-1; i >= 0 ; i--) {
			addSlide = addSlide.add(oriLi.eq(i));
			preSlide = preSlide.add(oriLi.eq(oriLen-i-1));
		}
		ul.append(addSlide.clone().addClass('duplicate next'));
		ul.prepend(preSlide.clone().addClass('duplicate prev'));

		var initSlide = oriLi.eq(params.initialSlide);
		li = bx.find(params.list), len = li.length;
		var list = _this.list;
		for(var i = 0 ; i < len ; i++) {
			var l = li.eq(i);
			list.push({el : l, duple : l.hasClass('duplicate prev') ? -1 : (l.hasClass('duplicate next') ? 1 : 0)});
		}
		len = list.length;
		this.activeIdx = initSlide.index();
		this.adjustW(this.activeIdx);
		li.imagesLoaded(function(){
			_this.resize({first : 1});
			win.off('resize',_this.resize).on('resize',_this.resize);

			bx.on(touchEv.down,function(e){
				if(!flag) return;
				_this.swipeFn.down(e);
				win.on(touchEv.move, _this.swipeFn.move);
				win.on(touchEv.up, _this.swipeFn.up);
			})

			params.onLoad(_this);
		});
	};
	this.init();
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
        if (axis === undefined) {
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
