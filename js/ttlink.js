(function (tts) {
    var ttklink = {
        onload:false,
        api:{
            re:'http://re.taotaosou.com',
            browser:'http://browser.re.taotaosou.com',
            tpl:'http://re.taotaosou.com/data/getTemplateContent.do?',
            ad:'http://show.kc.taotaosou.com/adShowJson.do?',
            linktrans:'http://browser.re.taotaosou.com/linktranslator',
            dclog:'http://dc.log.taotaosou.com/statistics.do?'
        },
        /**
         * 'http://199.155.122.15:9999/tts_dc_log/statistics.do?'
         * 'http://dc.log.taotaosou.com/statistics.do?'
         */
        statistics:function (type, index) {
            var cls = 'J-ttklink-statistics';
            index = index || 0;
            if (tts.getByClassName(cls).length > 0) {
                var elms = tts.getByClassName(cls);
                for (var i = 0, len = elms.length; i < len; i++) {
                    document.body.removeChild(elms[i]);
                }
            }
            tts.loadJS(tts.api.log + '/browser_statistics.do?type=' + type + '&v=' + new Date().getTime() + index, function (script) {
                script.className = cls;
            });
        },
        //获取浏览器高度
        getViewportHeight:function () {
            var B = -1;
            var C = document.compatMode;
            if ((C || this.isIE) && !this.isOpera) {
                if (C === "CSS1Compat") {
                    B = document.documentElement.clientHeight;
                } else {
                    B = document.body.clientHeight;
                }
            }
            return B;
        },
        //获取浏览器宽度
        getViewportWidth:function () {
            var B = -1;
            var C = document.compatMode;
            if (C || this.isIE) {
                if (C === "CSS1Compat") {
                    B = document.documentElement.clientWidth;
                } else {
                    B = document.body.clientWidth;
                }
            }
            return B;
        },
        getOffsetTop:function (a) {
            var x = 0;
            while (a) {
                x += a.offsetTop;
                a = a.offsetParent;
            }
            return x;
        },
        trim:function (str) {
            if (str.trim) {
                str = str.trim();
            } else {
                str = str.replace(/ /g, '');
            }
            return str;
        },
        //判断是否是图片链接
        getChildImg:function (ele) {
            var _this = this;
            var inner = ele.innerHTML;
            inner = _this.trim(inner);
            if (!(ele && ele.nodeType && ele.nodeType === 1))
                return false;
            var child = ele.firstChild;
            var haveImg = false;
            while (child) {
                if (child.nodeType === 1 && child.tagName.toLowerCase() === 'img') {
                    haveImg = true;
                }
                child = child.nextSibling;
            }
            if (inner.length === 0) {
                haveImg = true;
            }
            return haveImg;
        },
        //初始化
        init:function (wbLink, wbId) {
            var _self = this,
                title = document.title,
                keyTitle,
                arr,
                getCPS,
                arrLink = document.getElementsByTagName('a');
            keyTitle = new RegExp("^([^-_]*)[-|_]?(.*)$", "i").exec(title)[1];
            getCPS = _self.getCPS();
            var haveBox = false,
                showTime,
                hidTime,
                clientH,
                clientW;
            var past = -1;//记录上次展示链接
            var webId = wbId;
            clientH = _self.getViewportHeight();
            clientW = _self.getViewportWidth();
            var ttk_box = document.getElementById('J_ttklink_con'),
                ttk_point = document.getElementById('J_ttklink_point'),
                ttk_iframe = document.getElementById('J_ttklink_iframe'),
                ttk_close = document.getElementById('J_ttklink_close');
            var _showBox = function () {
                ttk_box.style.visibility = 'visible';
                ttk_box.style.display = 'block';
                ttk_box.style.zIndex = '999999';
                haveBox = true;
                _self.statistics('ttkL_AdF_APV');
            };
            var _hidBox = function () {
                ttk_box.style.visibility = 'hidden';
                ttk_box.style.display = 'none';
                ttk_box.style.zIndex = '99998';
                haveBox = false;
            };
            //链接筛选
            var itemWbLink = wbLink;
            arr = webId ? itemWbLink : _self.matchLink(arrLink);
            if (arr.length > 0) {
                ttklink.statistics('ttkL_Mark_PV');
            }
            //交互 修改
            tts.forEach(arr, function (item, i) {
                item.index = i;
                _self.createConImg(item);
                _self.statistics('ttkL_Mark_Link_PV', i);
                tts.addEvent(item, 'click', function () {
                    _self.statistics('ttkL_Mark_Link_CK');
                });
                tts.addEvent(item, 'mouseover', function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement,
                        relateNode = e.relatedTarget || e.fromElement;
                    if (past === this.index) {
                        //do something more
                        haveBox = true;
                    } else {
                        haveBox = false;
                    }
                    if (hidTime) clearTimeout(hidTime);
                    while (relateNode && relateNode.className !== 'ttklink_con') {
                        relateNode = relateNode.parentNode;
                    }
                    while (target && target.nodeName !== 'A') {
                        target = target.parentNode;
                    }
                    var sTop = document.body.scrollTop || document.documentElement.scrollTop;
                    var cLeft,
                        cHeight,
                        itemId,
                        offsetTop;
                    //商品ID
                    if (webId) {
                        itemId = webId[i];
                    } else if (target && target.nodeName === 'A') {
                        itemId = _self.getItemId(item);
                    }
                    cLeft = e.clientX;
                    cHeight = e.clientY;
                    offsetTop = _self.getOffsetTop(item);
                    var showPop,
                        url;
                    url = _self.getDataUrl(itemId, keyTitle, getCPS);
                    if (haveBox && past === this.index) {
                        return;
                    }
                    showPop = function () {
                        _showBox();
                        //判断是否从弹出框移入链接
                        if (!haveBox || past !== this.index) {
                            if (cLeft < clientW / 2) {
                                ttk_box.style.left = cLeft + 25 + 'px';
                                ttk_point.className = 'ttklink_point_left';
                                if ((offsetTop - sTop) < 245) {
                                    ttk_box.style.top = (cHeight + sTop) - 100 + 'px';
                                    ttk_point.style.top = 85 + 'px';
                                }
                                else if ((clientH - offsetTop) + sTop < 245) {
                                    ttk_box.style.top = (cHeight + sTop) - 385 + 'px';
                                    ttk_point.style.top = 380 + 'px';
                                }
                                else {
                                    ttk_box.style.top = (cHeight + sTop) - 240 + 'px';
                                    ttk_point.style.top = 225 + 'px';
                                }
                            } else {
                                ttk_box.style.left = cLeft - 300 + 'px';
                                ttk_point.className = 'ttklink_point_right';
                                if ((offsetTop - sTop) < 245) {
                                    ttk_box.style.top = (cHeight + sTop) - 100 + 'px';
                                    ttk_point.style.top = 85 + 'px';
                                } else if ((clientH - offsetTop) + sTop < 245) {
                                    ttk_box.style.top = (cHeight + sTop) - 385 + 'px';
                                    ttk_point.style.top = 380 + 'px';
                                }
                                else {
                                    ttk_box.style.top = (cHeight + sTop) - 230 + 'px';
                                    ttk_point.style.top = 225 + 'px';
                                }
                            }
                        }
                        haveBox = true;
                    };
                    if (showTime) clearTimeout(showTime);
                    showTime = setTimeout(function () {
                        showPop();
                        if (ttk_iframe) {
                            ttk_iframe.innerHTML = '<iframe frameborder="0" allowTransparency="true" width="280" height="480" src="' + url + '"></iframe>';
                        }
                    }, 500);
                });
                tts.addEvent(item, 'mouseout', function () {
                    //e = e || window.event;
                    //var relateNode = e.relatedTarget || e.toElement;
                    //存在弹出层，记录当前index
                    if (haveBox) {
                        past = this.index;
                    }
                    if (showTime) clearTimeout(showTime);
                    var hiddBox = function () {
                        _hidBox();
                        haveBox = false;
                    };
                    hidTime = setTimeout(function () {
                        hiddBox();
                    }, 500);
                });
            });
            tts.addEvent(ttk_box, 'mouseover', function () {
                if (hidTime) clearTimeout(hidTime);
                var showBox = function () {
                    if (!haveBox) {
                        _showBox();
                    }
                };
                showTime = setTimeout(function () {
                    showBox();
                }, 500);
            });
            tts.addEvent(ttk_box, 'mouseout', function (e) {
                e = e || window.event;
                if (showTime) clearTimeout(showTime);
                var hidBox = function () {
                    if (haveBox) {
                        _hidBox();
                    }
                };
                hidTime = setTimeout(function () {
                    hidBox();
                }, 500);

            });
            tts.addEvent(ttk_close, 'click', function () {
                _hidBox();
            });
        },
        wbinit:function (arrLink) {
            var _self = this,
                url = '',
                itemArr = [],
                itemWbId = [],
                linkUrl;
            var aLink = arrLink;
            tts.forEach(aLink, function (item, i) {
                linkUrl = item.href;
                url += ',' + encodeURIComponent(linkUrl);
                _self.statistics('ttkL_Jpl_All_Num', i);
            });
            tts.loadJS(_self.api.linktrans + '/transfer.do?' +
                'surl=' + url.substring(1), function () {
                if (!tts.isArray(ttl_ids)) {
                    return;
                }
                tts.forEach(ttl_ids, function (item, i) {
                    if (item > 0) {
                        itemArr.push(aLink[i]);
                        itemWbId.push(item);
                        _self.statistics('ttkL_Jpl_Tbl_Num', i);
                    }
                });
                _self.init(itemArr, itemWbId);
            });
        },
        matchQQ:function () {
            var _self = this,
                arr = [],
                url = '',
                itemArr = [],
                itemWbId = [],
                linkUrl;
            var inner;
            var arrLink = document.getElementsByTagName('a');
            tts.forEach(arrLink, function (item) {
                inner = item.innerHTML;
                if (inner.match(/url.cn/)) {
                    if (!_self.getChildImg(item)) {
                        arr.push(item);
                    }
                }
            });
            tts.forEach(arr, function (item, i) {
                linkUrl = item.innerHTML;
                url += ',' + encodeURIComponent(linkUrl);
                _self.statistics('ttkL_Jpl_All_Num', i);
            });
            tts.loadJS(_self.api.linktrans + '/transfer.do?' +
                'surl=' + url.substring(1), function () {
                if (!tts.isArray(ttl_ids)) {
                    return;
                }
                tts.forEach(ttl_ids, function (item, i) {
                    if (item > 0) {
                        itemArr.push(arr[i]);
                        itemWbId.push(item);
                        _self.statistics('ttkL_Jpl_Tbl_Num', i);
                    }
                });
                _self.init(itemArr, itemWbId);
            });
        },
        matchNetEasy:function () {
            var _self = this,
                arr = [],
                url = '',
                itemArr = [],
                itemWbId = [],
                linkUrl;
            var inner;
            var arrLink = document.getElementsByTagName('a');
            tts.forEach(arrLink, function (item) {
                inner = item.innerHTML;
                if (inner.match(/163.fm/)) {
                    if (!_self.getChildImg(item)) {
                        arr.push(item);
                    }
                }
            });
            tts.forEach(arr, function (item, i) {
                linkUrl = item.innerHTML;
                url += ',' + encodeURIComponent(linkUrl);
                _self.statistics('ttkL_Jpl_All_Num', i);
            });
            tts.loadJS(_self.api.linktrans + '/transfer.do?' +
                'surl=' + url.substring(1), function () {
                if (!tts.isArray(ttl_ids)) {
                    return;
                }
                tts.forEach(ttl_ids, function (item, i) {
                    if (item > 0) {
                        itemArr.push(arr[i]);
                        itemWbId.push(item);
                        _self.statistics('ttkL_Jpl_Tbl_Num', i);
                    }
                });
                _self.init(itemArr, itemWbId);
            });
        },
        //筛选页面所有的淘宝商品a链接,不包括图片链接。
        matchLink:function (arrLink) {
            var _self = this,
                arr = [];
            tts.forEach(arrLink, function (item) {
                var href = item.href,
                    atitle = item.title;
                if (_self.matchHost(href)) {
                    if (_self.getItemId(item)) {
                        if (!_self.getChildImg(item)) {
                            arr.push(item);
                        }
                    }
                } else if (_self.matchHost(atitle)) {
                    if (_self.getItemId(item)) {
                        if (!_self.getChildImg(item)) {
                            arr.push(item);
                        }
                    }
                }
            });
            return arr;
        },
        matchHost:function (obj) {

            if (!obj) return;
            if (obj.match(/item.taobao/) || obj.match(/detail.tmall/) || obj.match(/item.tmall/)) {
                return true;
            } else {
                return false;
            }
        },
        //标注成功连接
        createConImg:function (obj) {

            var oimg = document.createElement('img');
            oimg.src = 'http://browser.re.taotaosou.com/images/ttlink/tts_icon.png';
            oimg.className = 'tts_icon';
            tts.setCSS(oimg, {
                height:'12px',
                width:'14px',
                verticalAlign:'top'
            });
            obj.appendChild(oimg);
        },
        createTpl:function () {
            if (this.onload) return;
            var oWrap = document.createElement('div');
            oWrap.id = 'ttklink_box';
            var str = '<div id="J_ttklink_con" class="ttklink_con">' + '<div class="ttklink_header">' +
                '<a href="http://tk.taotaosou.com" class="ttklink_logo" target="_blank">' + '<img src="http://browser.re.taotaosou.com/images/ttlink/ttk_logo.jpg" alt="">' + '</a>' +
                '<a id="J_ttklink_close" href="javascript:void(0)" onclick="return false;" class="ttklink_close">' + '<img src="http://browser.re.taotaosou.com/images/ttlink/ttk_close.jpg" alt="">' + '</a>' + '</div>' +
                '<div id = "J_ttklink_iframe" class="ttklink_iframe">' + '</div> ' +
                '<div id="J_ttklink_point" class=""></div>' +
                '</div>';
            oWrap.innerHTML = str;
            document.body.appendChild(oWrap);
        },
        //取链接商品Id
        getItemId:function (item) {
            var _self = this,
                ahref = item.href,
                _id,
                sliceID,
                atitle = item.title;
            ahref = unescape(ahref);
            atitle = unescape(atitle);
            sliceID = function (str) {
                str = str.split('&');
                for (var i = 0, len = str.length; i < len; i++) {
                    if (str[i] && str[i].match(/id=/)) {
                        str = str[i];
                    }
                }
                return str.slice(str.indexOf('id=') + 3, str.length);
            };
            if (_self.matchHost(ahref)) {
                _id = sliceID(ahref);
            } else if (_self.matchHost(atitle)) {
                _id = sliceID(atitle);
            }
            if (typeof parseInt(_id, 10) && !!parseInt(_id, 10)) {
                return _id;
            } else {
                return undefined;
            }
        },
        //获取iframe地址
        getDataUrl:function (item_id, key_title, cps) {
            var _self = this,
                url;
            if (!item_id) return;
            if (key_title) {
                url = _self.api.browser + '/getTtkLinkItems.do?itemId=' + item_id +
                    '&title=' + encodeURIComponent(key_title) +
                    '&cpsid=' + cps +
                    '&ditch=' + tts.getDitchId();
            } else {
                url = _self.api.browser + '/getTtkLinkItems.do?itemId=' + item_id +
                    '&cpsid=' + cps +
                    '&ditch=' + tts.getDitchId();
            }
            return url;
        },
        getCPS:function () {
            var cpsPid = '', agent = navigator.userAgent;
            //枫树浏览器
            if (agent.match(/CoolNovo/)) {
                cpsPid = 'mm_30234426_2674428_9928618';
            }
            //搜狗高速浏览器
            else if (agent.match(/SE/)) {
                cpsPid = 'mm_30234426_2674428_9928625';
            }
            //360极速浏览器
            else if (agent.match(/QIHU 360EE/)) {
                cpsPid = 'mm_30234426_2674428_9928614';
            }
            //Chrome浏览器
            else if (agent.match(/Chrome/)) {
                cpsPid = 'mm_30234426_2674428_9928604';
            }
            //360安全浏览器
            else if (window.external.twGetRunPath && window.external.twGetRunPath.match(/360se/)) {
                cpsPid = 'mm_30234426_2674428_9928627';
            }
            //IE浏览器
            else if (agent.match(/MSIE/)) {
                cpsPid = 'mm_30234426_2674428_9928630';
            }
            return cpsPid;
        }
    };
    var host = document.location.host;
    if (!host.match(/taobao|tmall|etao|meilishuo|taotaosou|alipay|zhifubao|alimama|alibaba/)) {
        tts.loadCSS(tts.api.browser + 'css/ttklink.css?v=@@timestamp');
        ttklink.createTpl();
        if (!tts.getCookie().TTKlinkFirst || tts.getCookie().TTKlinkFirst !== '1') {
            tts.setCookie({
                name:'TTKlinkFirst',
                value:'1',
                day:365,
                path:'/',
                domain:host
            });
            ttklink.statistics('ttkL_Mark_UV');
        }
        if (host.match(/weibo/)) {
            ttklink.init();
            var wbBox,
                wbBoxLen,
                wbflag = false;
            if (tts.getByClassName('WB_feed_type')) {
                wbBox = tts.getByClassName('WB_feed_type');
                wbBoxLen = wbBox.length;
            }
            tts.addEvent(window, 'scroll', function () {
                var nwbBox,
                    nwbBoxLen;
                if (tts.getByClassName('WB_feed_type')) {
                    nwbBox = tts.getByClassName('WB_feed_type');
                    nwbBoxLen = nwbBox.length;
                }
                if (wbBoxLen !== nwbBoxLen && wbflag === false) {
                    wbBoxLen = nwbBoxLen;
                    wbflag = true;
                }
                if (wbflag) {
                    ttklink.init();
                    wbflag = false;
                }
            });
        } else if (host.match(/t.163/)) {
            ttklink.matchNetEasy();
            if (tts.getByClassName('mainBox-page')[0]) {
                var pageMain = tts.getByClassName('mainBox-page')[0];
                tts.addEvent(pageMain, 'click', function () {
                    ttklink.matchNetEasy();
                });
            }
        } else if (host.match(/t.qq/)) {
            ttklink.matchQQ();
            var qqBoxLen,
                qqflag = false;
            if (document.getElementById('talkList')) {
                qqflag = document.getElementById('talkList');
                qqBoxLen = qqflag.getElementsByTagName('li').length;
            }
            tts.addEvent(window, 'scroll', function () {
                var nwbBox,
                    nwbBoxLen;
                if (document.getElementById('talkList')) {
                    nwbBox = document.getElementById('talkList');
                    nwbBoxLen = nwbBox.getElementsByTagName('li').length;
                }
                if (qqBoxLen !== nwbBoxLen && qqflag === false) {
                    qqBoxLen = nwbBoxLen;
                    qqflag = true;
                }
                if (qqflag) {
                    ttklink.matchQQ();
                    qqflag = false;
                }
            });
        } else if (host.match(/t.sohu/)) {
            ttklink.init();
            var sohubox,
                sohuboxLen,
                sohuflag = false;
            if (tts.getByClassName('twi')) {
                sohubox = tts.getByClassName('twi');
                sohuboxLen = sohubox.length;
            }
            tts.addEvent(window, 'scroll', function () {
                var nwbBox,
                    nwbBoxLen;
                if (tts.getByClassName('twi')) {
                    nwbBox = tts.getByClassName('twi');
                    nwbBoxLen = nwbBox.length;
                }
                if (sohuboxLen !== nwbBoxLen && sohuflag === false) {
                    sohuboxLen = nwbBoxLen;
                    sohuflag = true;
                }
                if (sohuflag) {
                    ttklink.init();
                    sohuflag = false;
                }
            });
        } else {
            ttklink.init();
        }
    } else if (host.match(/love.taobao/)) {
        tts.loadCSS(tts.api.browser + 'css/ttklink.css?v=' + window.TTSVersion);
        ttklink.createTpl();
        ttklink.init();
        var loveBox,
            loveBoxLen,
            taobaoflag = false;
        if (document.getElementById('J_Lazyfall')) {
            loveBox = tts.getByClassName('lazyfall');
            loveBoxLen = loveBox.length;
        }
        tts.addEvent(window, 'scroll', function () {
            var nloveBox,
                nloveBoxLen;
            if (document.getElementById('J_Lazyfall')) {
                nloveBox = tts.getByClassName('lazyfall');
                nloveBoxLen = nloveBox.length;
            }
            if (loveBoxLen !== nloveBoxLen && taobaoflag === false) {
                loveBoxLen = nloveBoxLen;
                taobaoflag = true;
            }
            if (taobaoflag) {
                ttklink.init();
                taobaoflag = false;
            }
        });
    } else if (document.location.href.match(/www.meilishuo.com\/share/)) {
        tts.loadCSS(tts.api.browser + 'css/ttklink.css?v=' + window.TTSVersion);
        ttklink.createTpl();
        var goodTitle = tts.getByClassName('goods_title')[0],
            goodLink = goodTitle.getElementsByTagName('a')[0],
            tobuy = tts.getByClassName('tobuy')[0],
            tobuyLink = tobuy.getElementsByTagName('a')[0];
        var arrUrl = [goodLink, tobuyLink];
        ttklink.wbinit(arrUrl);
    } else {
        return;
    }
})(window.tts);