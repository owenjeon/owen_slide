# owen_slide
나만의 슬라이드를 직접 구현해보자



### How to use?

```javascript
var slider = new Owen_slide('.owen-slide-area', {
    onLoad : function(sp){
        $('.paging .btn_prev').on('click',sp.slidePrev);
        $('.paging .btn_next').on('click',sp.slideNext);
    }
});
```

### options

* `list:string` - 슬라이드들의 className. default 는".owen-slide",
* `paging: string` - 슬라이드간의 padding값,
* `speed:number` - 슬라이딩 에니메이션의 시간,
* `initialSlide:number` - 최초 슬라이드의 index,
* `activeW:number` - active 되어있는 슬라이드의 길이,
* `slidesW` - 슬라이드들의 길이,
* `slidesToShow:number` - 보여질 슬라이드 갯수,
* `loop:boolean` - 루브 여부,
* `autoplay:number` - 값이 있으면 해당 초 단위로 오토플레이,
* `easing: follow jquery easing spec`,
* `mode:string` - horizontal | vertical,
* `useCSS3Transforms:boolean` - true,
* `onLoad:function` - 슬라이더 로딩후 호출되는 콜백,
* `onSlideChangeStart:function` - 슬라이드 변경시작시 호출되는 콜백,
* `onSlideChangeEnd:function` - 슬라이드 변경끝날시 호출되는 콜백
