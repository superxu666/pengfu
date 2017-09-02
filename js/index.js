var winWidth, winHeight, lastPage = 0,
    currentPage = 1,
    totalPage = 0,
    pageTransition = false,
    pageEvents = {},
    pageReverts = {},
    $header = $('#J_Header'),
    carousels = [];
    $logoIMG = $("#J_Header").find(".logo img");

function goToPage(targetPage, mode) {
    var $targetPage = $("#page-" + targetPage);

    var idx = $targetPage.index();

    if (lastPage && lastPage != targetPage) {
        $('#page-' + lastPage).removeClass('page' + lastPage + '-loaded');
        pageReverts[lastPage] && pageReverts[lastPage].call();
    }

    if (mode == "slide" && lastPage != targetPage) {
        $page.animate({
            top: -winHeight * (targetPage - 1)
        }, 1300)
    } else if (mode == "fade" && lastPage != targetPage) {
        $pages.addClass("absolute").hide();
        $page.removeClass("animate").css({
            top: 0
        });
        $targetPage.fadeIn(1000).css('z-index', 5).siblings("div.page").css('z-index', 1).fadeOut(1000);
        setTimeout(function() {
            $pages.removeClass("absolute").show();
            $page.css({
                top: -winHeight * idx
            });
        }, 1000);
    } else {
        $page.css({
            top: -winHeight * idx
        });
    }

    if (lastPage != targetPage) {
        pageTransition = true;
        currentPage = targetPage;
        $indicators.eq(currentPage - 1).addClass("current").siblings().removeClass("current");
        $targetPage.addClass("current").siblings("div.page").removeClass("current");
        setTimeout(function() {
            lastPage = currentPage;
            $targetPage.addClass('page' + targetPage + '-loaded');
            pageEvents[targetPage] && pageEvents[targetPage].call();
            // 如果目标页面等于第一页
            if (targetPage === 1) {
                $header.removeClass('header-black');
            } else {
                $header.addClass('header-black');
                $logoIMG.attr("src","images/logo2.png");
            }
            $header.find('li').removeClass('active');
            // console.info(targetPage);
            $header.find('a[data-rel=' + targetPage + ']').parent().addClass('active');
        }, 800);
        setTimeout(function() {
            pageTransition = false;
        }, 1500);
    }
}

function resetPage() {
    var $pages = $("div.page");
    window.scrollTo(0, 0);
    setTimeout(function() {
        winWidth = $(window).width();
        winHeight = $(window).height();
        $pages.height(winHeight);
        totalPage = $(".page:visible").length;
        goToPage(currentPage);

        if (winHeight < 700) {
            $('body').addClass('body-small')
        } else {
            $('body').removeClass('body-small')
        }

        Slider.reset();
    }, 100);
}

/**
 * 首屏幻灯
 */
var Slider = (function() {
    var $slider = $('#J_p1Slider');

    var $wrap = $slider.children('.items');
    var len = $wrap.children('.item').length;

    var current = 0,
        last = 0,
        pause = false;

    $slider.find('.prev').click(function(e) {
        last = current;
        show(--current);
        e.preventDefault();
    });
    $slider.find('.next').click(function(e) {
        last = current;
        show(++current);
        e.preventDefault();
    });
    $slider.find('.ctrl').hover(function() {
        pause = true;
    }, function() {
        pause = false;
    });

    function show(i) {
        if (i < 0) {
            i = len - 1;
        } else if (i >= len) {
            i = 0;
        }

        current = i;

        $wrap.children().eq(last).fadeOut(1000);
        $wrap.children().eq(current).fadeIn(1000);
    }

    show(current);
    var timer;

    return {
        reset: function() {
            $wrap.width(winWidth * len);
            $wrap.children().width(winWidth);
        },
        disable: function() {
            clearInterval(timer);
        },
        enable: function() {
            timer = setInterval(function() {
                if (pause) {
                    return;
                }
                last = current;
                show(++current);
            }, 4000);
        }
    }
}());
Slider.enable();

/**
 * 延迟遍历数组
 * @param  {[type]} arr  [数组]
 * @param  {[type]} func [回调]
 * @param  {[type]} time [延迟时间]
 */
function loopWithPause(arr, func, time) {
    if (!arr.length) {
        return;
    }

    function one(idx, arr) {
        if (idx === arr.length) {
            return;
        } else {
            setTimeout(function() {
                func.call(arr[idx], idx, arr[idx]);
                idx++;
                one(idx, arr);
            }, time);
        }
    }

    func.call(arr[0], 0, arr[0]);
    one(1, arr);
}

$(function() {
    $page = $("#page");
    $pages = $(".page");
    $indicators = $("#page-indicator li");

    winWidth = $(window).width();
    winHeight = $(window).height();
    resetPage();
    $(window).resize(function() {
        resetPage();
    });
    totalPage = $(".page").length;

    var e = 1;
    $('body').on("mousewheel", function(t, i, a, n) {
        if (!pageTransition) {
            if (i <= -e) {
                if (currentPage + 1 <= totalPage) {
                    currentPage = currentPage + 1;
                    goToPage(currentPage, "slide")
                }
            } else if (i >= e) {
                if (currentPage - 1 >= 1) {
                    currentPage = currentPage - 1;
                    goToPage(currentPage, "slide")
                }
            }
        }
    });

    $("#page-indicator [data-rel], #J_Header [data-rel]").click(function() {
        var targetPage = parseInt($(this).attr("data-rel"));
        if (!pageTransition)
            goToPage(targetPage, "fade");
        return false;
    });
    // 创建carousel2实例
    $('.carousel2').each(function() {
        carousels.push(new carousel2({
            elem: this
        }));
    });

    (function() {
        var $page1 = $('#page-1'),
            $drawer = $page1.find('.modules-box'),
            $itemsInDrawer = $page1.find('.modules'),
            $drawerTrig = $page1.find('.collapsible-arrow'),
            $list = $drawer.find('.modules-list'),
            $lis = $list.find('li'),
            $descs = $('.mudules-description').children(),
            $hideTrigLeft = $page1.find('.hide-trigger-left'),
            $hideTrigRight = $page1.find('.hide-trigger-right'),
            listOuterWidth = $lis.length * 110;

        function openDrawer() {
            if ($drawer.hasClass("on")) {
                $drawer.removeClass("on").attr('style', '');
                $itemsInDrawer.removeClass("p1-module-wrapper");
                $lis.removeClass('active');
            } else {
                $drawer.height($lis.height() * 5 - 80).addClass("on");
                $itemsInDrawer.addClass("p1-module-wrapper");
                // carousels[0].lazyLoadImgsAt(0);
            }
        }

        function showDesc(idx) {
            $descs.eq(idx).addClass('active').siblings().removeClass('active');
            idx && carousels[idx - 1].lazyLoadImgsAt(0); // 在这里懒加载当前module下carousel的第1组图片
        }

        var $modal = $('#J_modal');
        $modal.find('.close').click(function() {
            $modal.fadeOut();
            return false;
        });
        $modal.on('mousewheel', function(e) {
            e.stopPropagation && e.stopPropagation();
        });
        // function showModal(option){
        //     $('#J_modalCtn').html(option.innerHTML);
        //     $modal.fadeIn(500);
        // }

        $drawerTrig.click(function() {
            openDrawer();
            showDesc(0);
        });

        $lis.click(function() {
            var $self = $(this);
            var idx = $self.index();
            if (!$drawer.hasClass("on")) {
                openDrawer(idx);
            }
            showDesc(idx);
            // carousels[idx].lazyLoadImgsAt(0);
            $self.addClass('active').siblings().removeClass('active');
        });

        var leftMoved = 1;
        var rightMoved = 0;
        var moving = 0;
        $hideTrigLeft.mouseover(function() {
            if (moving || leftMoved) {
                return;
            }
            moving = 1;
            $list.animate({
                left: 0
            }, 800, function() {
                moving = 0;
                leftMoved = 1;
                rightMoved = 0;
            });
        });
        $hideTrigRight.mouseover(function() {
            if (moving || rightMoved) {
                return;
            }
            moving = 1;
            var l = listOuterWidth - winWidth;
            $list.animate({
                left: '-' + l + 'px'
            }, 800, function() {
                moving = 0;
                rightMoved = 1;
                leftMoved = 0;
            });
        });
    }());

    (function() {
        var $page2 = $('#page-2'),
            $page2selection = $page2.find('.desc'),
            $page2layers = $page2.find('.layer');

        function activeTriggerAndLayer(idx) {
            $page2selection.eq(idx).addClass('active').siblings().removeClass('active');
            $.each($page2layers, function(i, item) {
                if (i >= idx) {
                    i++;
                    $(item).removeClass('layer' + i + '-ignore');
                } else {
                    i++;
                    $(item).addClass('layer' + i + '-ignore');
                }
            });
        }
        $page2selection.hover(function() {
            activeTriggerAndLayer($(this).index());
        });
        pageEvents[2] = function() {
            loopWithPause($page2selection, function(idx, item) {
                $(item).addClass('animate');
                if (idx === $page2selection.length - 1) {
                    $.each($page2layers, function(idx, layer) {
                        idx++;
                        $(layer).addClass('layer' + idx + '-active');
                    });
                    setTimeout(function() {
                        activeTriggerAndLayer(0);
                    }, 1000);
                }
            }, 100);
        }
        pageReverts[2] = function() {
            $page2selection.removeClass('active animate');
            $page2layers.each(function(idx, item) {
                idx++;
                $(item).removeClass('layer' + idx + '-ignore layer' + idx + '-active active');
            });
        }
        // }
    }());

    (function() {
        var $page3 = $('#page-3'),
            $timelineLis = $page.find('.timeline li'),
            timelineLen = $timelineLis.length,
            $dot = $page3.find('span.dot'),
            page3Timer = 0,
            page3AutoRun = 0,
            page3pause = 0,
            page3Current = 0;

        function activeDotAndTimeline(idx) {
            var $target = $timelineLis.eq(idx);
            $dot.stop().animate({
                left: $target.offset().left + $target.width() / 2 - $dot.width() / 2
            }, 500);
            $target.addClass("current").siblings().removeClass("current");
        }
        $timelineLis.mouseover(function() {
            var self = this;
            clearTimeout(page3Timer);
            page3Timer = setTimeout(function() {
                page3Current = $(self).index()
                activeDotAndTimeline(page3Current);
            }, 500);
            page3pause = 1;
        }).mouseout(function() {
            clearTimeout(page3Timer);
            page3pause = 0;
        });
        pageEvents[3] = function() {
            pageReverts[3]();
            activeDotAndTimeline(page3Current);
            page3Current++;
            page3AutoRun = setInterval(function() {
                if (page3pause) {
                    return;
                }

                if (page3Current >= $timelineLis.length) {
                    page3Current = 0;
                }

                activeDotAndTimeline(page3Current);
                page3Current++;
            }, 2000);
        };
        pageReverts[3] = function() {
            page3pause = 0;
            clearInterval(page3AutoRun);
        }
    }());

    // 专家介绍
    (function() {
        var $partners = $('#page-6').find('.partners');
        // var tmpl = '';
        // $.each(PARTNERS, function(idx, item) {
        //     tmpl += '<li class="logo logo-' + idx + '"><a href="###">' + item.name + '</a></li>';
        // });
        // $partners.html(tmpl);

        // var $portrait = $("#page-6 .partners a");
        // console.log($portrait.length);

        
        // pageEvents[6] = function() {
        //     loopWithPause($partners.children(), function(idx, item) {
        //         $(item).addClass('active');
        //     }, 30);
        // }
        // pageReverts[6] = function() {
        //     $partners.children().removeClass('active');
        // }
    }());

    // 地图
    (function() {
        var $mapCtn = $('#J_mapCtn'),
            mapInited = 0,
            map;
        pageEvents[7] = function() {
            if (mapInited) {
                return false;
            }
            mapInited = 1;
            map = new BMap.Map('J_mapCtn');
            map.centerAndZoom(new BMap.Point(114.072321,22.566699), 18);
            var marker = new BMap.Marker(new BMap.Point(114.072321,22.566699),18);
            // var control = new BMap.NavigationControl({
            //     anchor : BMAP_ANCHOR_TOP_LEFT
            // });
            // map.addControl(control);
            map.addOverlay(marker);
            var opts = {
                width: 220, // 信息窗口宽度      
                height: 60, // 信息窗口高度      
                title: "鹏福咨询" // 信息窗口标题     
            }
            var infoWindow = new BMap.InfoWindow("地址：深圳市福田区彩田村长城盛世二期1栋30F <br /> 电话：0755-33332028", opts); // 创建信息窗口对象      

            marker.addEventListener('click', function() {
                map.openInfoWindow(infoWindow, marker.getPosition()); // 打开信息窗口
            });
        };
        pageEvents[7]();
    }());

    (function() {

        // // 添加A标签
        var $dls = $('#page-5').find('dl');
        // var $detailA = "";
        // $detailA += "<dd class='detail'><a href='#'>详情&GT;&GT;</a></dd>"
        // $dls.append($detailA);

        // var detaildl = $("#page-5").find(".detail");
        // detaildl.css("textAlign","right");



        /*-----华丽分割线--------------------------------------------*/
        pageEvents[5] = function(){
            loopWithPause($dls, function(idx, item){
                $(item).addClass('active');
            }, 100);
        }
        pageReverts[5] = function(){
            $dls.removeClass('active');
        }

    }());

    // (function() {
    //     var $left = $('#page-5').find('.left .inner');
    //     var $right = $('#page-5').find('.right .inner');

    //     var half = Math.floor(QA.length/2);

    //     var ltmp = '';
    //     var rtmp = '';
    //     for(var i = 0, l = QA.length; i<l; i++){
    //         var temp = '<dl>';
    //         temp += '   <dt>'+ QA[i].name +'</dt>';
    //         temp += '    <dd>'+ QA[i].answer +'</dd>';
    //         temp += '</dl>';
    //         if(i >= half){
    //             rtmp += temp;
    //         }else{
    //             ltmp += temp;
    //         }
    //     }

    //     $left.html(ltmp);
    //     $right.html(rtmp);

    //     var $dls = $('#page-5').find('dl');

    //     pageEvents[5] = function(){
    //         loopWithPause($dls, function(idx, item){
    //             $(item).addClass('active');
    //         }, 100);
    //     }
    //     pageReverts[5] = function(){
    //         $dls.removeClass('active');
    //     }
    // }());


    
    // // 点击详情调用newsDet_click
    // $("#page-5").find(".detail").eq(0).click(function(){
    //     newsDet_click(newscontent);
    // });

    partnersMouse();

});


// 静止弹窗外滚轮
$(".newsDet").on('mousewheel',function(event) {
    event.stopPropagation();
});


// 新闻详情点击函数
function newsdet_click(num) {

    // 弹出窗口代码
    var newsDet = $(".newsDet_bg");
    var newsDet_Con = $(".newsDet_bg").find(".newsDet_Con");
    // 弹窗上下左右缩紧50像素
    newsDet_Con.css({
        "padding":"50px"
    });

    // 淡入
    if (newsDet) {
        newsDet.fadeIn();
    }
    // 关闭按钮
    var close = $(".close_det");
    close.click(function(){
        newsDet.fadeOut();
        newsDet_Con.html('');//清空弹窗内容
    });
    //键盘esc
    $(document).keyup(function(e){


        if (e.keyCode == 27) 
        {
            newsDet.fadeOut();
            newsDet_Con.html('');
        }


    });
 
    switch (num) {

        case 0:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<p>" + news.text[0] + "</p>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[1] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p>" + news.text[2] + "</p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p><img src="+news.newsImg[3]+"></p>";
            conHtml += "<p><img src="+news.newsImg[4]+"></p>";
            conHtml += "<p><img src="+news.newsImg[5]+"></p>";
            conHtml += "<p><img src="+news.newsImg[6]+"></p>";
            conHtml += "<p>" + news.text[4] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"center"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        case 1:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<p>" + news.text[0] + "</p>";
            conHtml += "<p>" + news.text[1] + "</p>";
            conHtml += "<p>" + news.text[2] + "</p>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p style='color:#F79646;'>" + news.text[4] + "</p>";
            conHtml += "<p>" + news.text[5] + "</p>";
            conHtml += "<p>" + news.text[6] + "</p>";
            conHtml += "<p>" + news.text[7] + "</p>";
            conHtml += "<p>" + news.text[8] + "</p>";
            conHtml += "<p>" + news.text[9] + "</p>";
            conHtml += "<p>" + news.text[10] + "</p>";
            conHtml += "<p>" + news.text[11] + "</p>";
            conHtml += "<p>" + news.text[12] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p style='color:#F79646;'>" + news.text[13] + "</p>";
            conHtml += "<p>" + news.text[14] + "</p>";
            conHtml += "<p>" + news.text[15] + "</p>";
            conHtml += "<p>" + news.text[16] + "</p>";
            conHtml += "<p>" + news.text[17] + "</p>";
            conHtml += "<p>" + news.text[18] + "</p>";
            conHtml += "<p>" + news.text[19] + "</p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p style='color:#F79646;'>" + news.text[20] + "</p>";
            conHtml += "<p>" + news.text[21] + "</p>";
            conHtml += "<p>" + news.text[21] + "</p>";
            conHtml += "<p>" + news.text[22] + "</p>";
            conHtml += "<p>" + news.text[23] + "</p>";
            conHtml += "<p>" + news.text[24] + "</p>";
            conHtml += "<p>" + news.text[25] + "</p>";
            conHtml += "<p>" + news.text[26] + "</p>";
            conHtml += "<p><img src="+news.newsImg[3]+"></p>";
            conHtml += "<p><img src="+news.newsImg[4]+"></p>";
            conHtml += "<p><img src="+news.newsImg[5]+"></p>";
            conHtml += "<p><img src="+news.newsImg[6]+"></p>";
            conHtml += "<p><img src="+news.newsImg[7]+"></p>";
            conHtml += "<p>" + news.text[27] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"left"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        case 2:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<h1>" + news.text[0] + "</h1>";
            conHtml += "<p>" + news.text[1] +"<span style='color:#27ABC1;'>"+news.text[2]+"</span>" + "</p>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p>" + news.text[4] + "</p>";
            conHtml += "<p>" + news.text[5] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p><img src="+news.newsImg[3]+"></p>";
            conHtml += "<p><img src="+news.newsImg[4]+"></p>";
            conHtml += "<p><img src="+news.newsImg[5]+"></p>";
            conHtml += "<p>" + news.text[6] + "</p>";
            conHtml += "<p>" + news.text[7] + "</p>";
            conHtml += "<p>" + news.text[8] + "</p>";
            conHtml += "<p>" + news.text[9] + "</p>";
            conHtml += "<p><img src="+news.newsImg[6]+"></p>";
            conHtml += "<p>" + news.text[10] + "</p>";
            conHtml += "<p><img src="+news.newsImg[7]+"></p>";
            conHtml += "<p>" + news.text[11] + "</p>";
            conHtml += "<p><img src="+news.newsImg[8]+"></p>";
            conHtml += "<p>" + news.text[12] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"left"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        case 3:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<h1 style='text-align:center;'>" + news.text[0] + "</h1>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[1] +"</p>";
            conHtml += "<p>" + news.text[2] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p>" + news.text[4] + "</p>";
            conHtml += "<p>" + news.text[5] + "</p>";
            conHtml += "<p><img src="+news.newsImg[3]+"></p>";
            conHtml += "<p>" + news.text[6] + "</p>";
            conHtml += "<p><img src="+news.newsImg[4]+"></p>";
            conHtml += "<p>" + news.text[7] + "</p>";
            conHtml += "<p><img src="+news.newsImg[5]+"></p>";
            conHtml += "<p>" + news.text[8] + "</p>";
            conHtml += "<p>"+"<span style='color:#00B050;'>"+news.text[9]+"</span>" + news.text[10] + "</p>";
            conHtml += "<p style='text-align:right;'>"+ news.text[11] + "</p>";
            conHtml += "<p style='text-align:right;'>" + news.text[12] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"left"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        case 4:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<h1 style='text-align:center;'>" + news.text[0] + "</h1>";
            conHtml += "<p>" + news.text[1] +"</p>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[2] + "</p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p>" + news.text[4] + "</p>";
            conHtml += "<p>" + news.text[5] + "</p>";
            conHtml += "<p>" + news.text[6] + "</p>";
            conHtml += "<p>" + news.text[7] + "</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[8] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p style='text-align:center;'>" + news.text[9] + "</p>";
            conHtml += "<p><img src="+news.newsImg[3]+"></p>";
            conHtml += "<p><img src="+news.newsImg[4]+"></p>";
            conHtml += "<p style='text-align:right;'>"+ news.text[10] + "</p>";
            conHtml += "<p style='text-align:right;'>" + news.text[11] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"left"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        case 5:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<h1 style='text-align:center;'>" + news.text[0] + "</h1>";
            conHtml += "<p>" + news.text[1] +"</p>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[2] + "</p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p>" + news.text[4] + "</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[5] + "</p>";
            conHtml += "<p><img src="+news.newsImg[3]+"></p>";
            conHtml += "<p><img src="+news.newsImg[4]+"></p>";
            conHtml += "<p style='text-align:center;'>" + news.text[6] + "</p>";
            conHtml += "<p>" + news.text[7] + "</p>";
            conHtml += "<p>" + news.text[8] + "</p>";
            conHtml += "<p style='text-align:right;'>" + news.text[9] + "</p>";
            conHtml += "<p style='text-align:right;'>"+ news.text[10] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"left"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        case 6:

            var conHtml = "";
            var news = newscontent[num];
            conHtml += "<h1 style='text-align:center;'>" + news.text[0] + "</h1>";
            conHtml += "<p>" + news.text[1] +"</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[2] + "</p>";
            conHtml += "<p><img src="+news.newsImg[0]+"></p>";
            conHtml += "<p>" + news.text[3] + "</p>";
            conHtml += "<p>" + news.text[4] + "</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[5] + "</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[6] + "</p>";
            conHtml += "<p><img src="+news.newsImg[1]+"></p>";
            conHtml += "<p>" + news.text[7] + "</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[8] + "</p>";
            conHtml += "<p style='text-align:center;'>" + news.text[9] + "</p>";
            conHtml += "<p><img src="+news.newsImg[2]+"></p>";
            conHtml += "<p style='text-align:center;'>"+ news.text[10] + "</p>";
            conHtml += "<p><span style='color:#FF6600;'>" + news.text[11]+"</span>"+news.text[12] + "</p>";
            conHtml += "<p><span style='color:#FF6600;'>" + news.text[13]+"</span>"+news.text[14] + "</p>";
            conHtml += "<p><span style='color:#FF6600;'>" + news.text[15]+"</span>"+news.text[16] + "</p>";
            conHtml += "<p><span style='color:#FF6600;'>" + news.text[17]+"</span>"+news.text[18] + "</p>";
            conHtml += "<p>"+ news.text[19] + "</p>";
            conHtml += "<p style='color:#FF6600; text-align:right;'>"+ news.text[20] + "</p>";
            conHtml += "<p style='color:#FF6600; text-align:right;'>"+ news.text[21] + "</p>";

            newsDet_Con.html(conHtml);// 添加html标签

            newsDet_Con.css({//设置样式
                "textAlign":"left"
            });
            // 弹窗内容默认字体
            newsDet_Con.find("p").css({
                "fontSize":"13px",
                "paddingBottom":"10px"
            });

            break;
        default:
            // statements_def
            break;
    }

};

//鼠标悬停头像事件
function partnersMouse (){

    // var page6 = document.getElementById("page-6");
    // var partnersLiarr = page6.getElementsByTagName("li");
    // console.log(partnersLiarr);

    // for (var i=0; i<partnersLiarr.length; i++){

    //     partnersLiarr[i].onmouseover = function(){
            
    //     };
    // }


    $("#page-6 li").mouseover(function(){

        var item = $(this).index();
        var textword = $(this).text();
        var detailcont = $(".detail-cont");

        switch (item) {
            case 0:
                // console.log(item);
                detailcont.css("display", "block");
                detailcont.html("陈懿，首席财务咨询师，CEO，公司董事长。陈懿先生毕业于西南财经大学，管理学硕士，注册会计师、高级会计师、执业财务总监，国家财务管理资格一级，国际权威（CTA）认证高级财务管理师，剑桥大学财务管理师最高级。从事金融业20多年，拥有一流的财务、投融资从业经验，曾在大型房地产、物流集团、工业企业及多元化集团企业任CFO，有丰富的实战经验，较多的投融资、资本运作、财务规划、纳税筹划成功案例，是公司高超的财务以及投资理财专家，更是公司发展、壮大的掌舵人。");
                break;
            case 1:
                detailcont.css("display", "block");
                detailcont.html("张斌，高级咨询师，拥有着13年制造业管理实操经验，擅长工厂布局规划丶现场目视化整改丶精益物流、绩效管理、班组建设、BSCI验厂。辅导风格不拘形式、喜欢用通俗语言诠释精益思想、推崇简单适用的管理、为人务实不喜作秀。<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：管理变革、精益生产。<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：辅导动作快、精、质优！<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：佛山南海卓航五金厂、东莞隆凯股份有限公司、深圳尊狮鞋业、佛山融骏门窗有限公司、深圳华阳通机电、东莞石碣浩智电子厂、顺德乐善机械有限公司、宁波得力集团、北京奥峰铭金属制品有限公司、佛山高明新东海五金电器有限公司（九阳一级OEM厂商）、深圳市畅翔机电设备有限公司、深圳市晋捷塑胶五金有限公司、福建省厦门先海电气有限公司（中车一级供应商）、湖南株洲华信精密工业股份有限公司（中车一级供应商）、成都彩堂钣金有限公司等");
                break;
            case 2:
                detailcont.css("display", "block");
                detailcont.html("陶洁，高级咨询师，拥有着7年制造业管理实操经验，热爱供应链管理，一直以来专注于生产计划、采购、仓库工作。辅导时手把手传授，追求周期更短、库存更少、反应更快、算得更准。<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产、管理变革<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：7年电热水壶管理经验，10年PMC从业经验，专注于供应链管理。<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：顺德盛熙电器有限公司、佛山高明新东海五金电器有限公司（九阳一级OEM厂商）、广州花都双快钣金制品有限公司等担任咨询师");
                break;
            case 3:
                detailcont.css("display", "block");
                detailcont.html("韩海龙，高级咨询师，拥有着1年奥地利精益研习工作经历，10年精益改善从业经历，擅长VSM、一个流、SMED快速换模、6S现场整改，风格务实，埋头苦干，用效果及数据说话！<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：现场整改、价值流分析、单元化生产、SMED、TPM<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：东莞石碣浩智电子厂、佛山融骏门窗有限公司、佛山瑞州科技有限公司、广东今日之星门业、佛山德昌誉机械有限公司、广东海信科龙有限公司、佛山米格兰陶瓷厂等项目担任咨询师。");
                break;
            case 4:
                detailcont.css("display", "block");
                detailcont.html("甘元秀，高级咨询师，拥有13年制造业PMC管理实操经历，擅长物流链打造，多年精益小批量、多批次实际推行经验，娴熟运用价值流分析工具，结合拉动生产使其与生产计划和物流计划完美整合，从而达到提升生产效率、订单准交率、库存周转率、降低物流成本的目的，辅导风格务实，不拘一格、不教条主义、喜欢用实际数据来说话。<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：仓库、采购、物控与生产计划，精细化生产尤其擅长<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：佛山嘉腾机器人有限公司、顺德乐善机械有限公司、深圳市福兴达电子有限公司、佛山高明新东海五金电器有限公司（九阳一级OEM厂商）、深圳市晋捷塑胶五金有限公司、湖南株洲华信精密工业股份有限公司（中车一级供应商）、成都彩堂钣金有限公司等项目担任咨询师。");
                break;
            case 5:
                detailcont.css("display", "block");
                detailcont.html("李学芹，高级咨询师，拥有10年世界500强企业IE实战和管理经验，5年咨询业工作经历，精通自动化改造及电子看板与异常呼叫系统改善。辅导风格务实、高效、立足现场。<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：设备自动化、电子看板、信息化<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：中国南铭家具有限公司、爱华仕箱包集团、惠州国展电子集团、震雄集团、广东新宝股份有限公司、创格电子有限公司、美威包装材料有限公司等项目担任咨询师。");
                break;
            case 6:
                detailcont.css("display", "block");
                detailcont.html("李有龙，高级咨询师，于2000年参加工作，在17年的职场生涯过程中，成长为一名专业的顾问师，主要职责是为制造性企业提供生产管理咨询服务。一直以来从事企业制造端辅导工作，辅助企业建立精益生产体系，工业工程基础架构建设和生产现场改善辅导。<br>&nbsp;&nbsp;&nbsp;&nbsp;自从业至今企业内部工作约15年，任职企业包括：台资深圳昊阳天宇、港资深圳查氏电子、台资深圳帝闻电子、民营陕西艺林实业。经历过的职务包含：工艺工程师、IE工程师、IE主管、PIE主管、PIE经理、IE经理。2015年进入顾问业，主要协助资深顾问师展开生产力改善项目的推动，协助企业推动精益生产改善。参与辅导过的企业如：东莞克诺五金、中山恒力精密五金、成都旭光电子、广东信源物流设备有限公司......<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：精益生产，工业工程基础架构建设和生产现场改善辅导<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：东莞克诺五金、中山恒力精密五金、成都旭光电子、广东信源物流设备有限公司等项目担任咨询师。");
                break;
            case 7:
                detailcont.css("display", "block");
                detailcont.html("樊林，咨询师，15年韩资企业工作经验，期间曾多次被派到韩国本社及韩国标准协会进行品质管理、TPM、精英革新、战略企划等管理技术和固有技术的研修；是从现场实战成长起来的管理及革新实战人员，在三星电子、新东洋、奥尔提、凯赫威一直从事品质、生产、技术、革新管理等事务工作；并在2010年所在公司Best Pranctice大型项目中实践了精益物流（物料在库口数缩减10天）28%的提高改善；综合成本节减率提高64%的改善；成功关闭重点课题21件；成功关闭DFM课题12件；成功指导总课题181件；课题财务收益一千万余元。<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产、管理变革<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长：TPM、制造革新（精益生产）、星级班组建设<br>&nbsp;&nbsp;&nbsp;&nbsp;咨询经历：山东常林、浙江公元、惠州TCL、中山维康爱马仕（法资）、河南中沃实业、ATL等。取得韩国KSA QCC改善革新发表大会金奖，在电子、五金、机电、食品等多个行业领域有丰富的项目实战经验。");
                break;
            case 8:
                detailcont.css("display", "block");
                detailcont.html("许治平，咨询师，10年工作经验，职业生涯初期在日系500强企业中工作4年，接受日系精益思想。 专职从事IE、精益生产推进。有5年以上精益项目策划、精益远期/近期规划、项目推进经历。 成功推进并实施了工厂规划、制造设施与物流设计、单元生产、JIT、后拉式生产等专项。  熟悉各家精益咨询公司推进模式。 <br>&nbsp;&nbsp;&nbsp;&nbsp;咨询范围：精益生产<br>&nbsp;&nbsp;&nbsp;&nbsp;优势与专长： 生产模式专项改善（自动包装项目、制造周期改善项目）、 标准化工厂建设、生产流程改善与信息化系统建设、擅长离散行业（五金、注塑、电子组装）计划与物流、现场改善、生产模式改善、供应链改善等专项。");
                break;
            default:
                // statements_def
                break;
        }
    });
    $("#page-6 li").mouseout(function(){

        var item = $(this).index();
        var textword = $(this).text();
        var detailcont = $(".detail-cont");

        if (detailcont) {
            detailcont.css({
                "display": "none"
            });
            detailcont.html("");

        }
    });


};



