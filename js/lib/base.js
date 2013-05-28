
(function(win) {
    var tts = {
        /**
         * 后台接口
         */
        api: {
            //图媒体大站
            re: 'http://re.taotaosou.com/',
            //淘同款
            browser: 'http://browser.re.taotaosou.com/',
            //又拍静态资源
            upai: 'http://ttsmedia.b0.upaiyun.com/',
            //统计埋点接口
            log: 'http://log.taotaosou.com',
            //返回HTML源码
            tpl: 'http://re.taotaosou.com/data/getTemplateContent.do?',
            //广告系统接口
            ad: 'http://show.kc.taotaosou.com/adShowJson.do?',
            //打点系统接口
            mark: 'http://re.taotaosou.com/data/getTagInfoByUrls.do?'
        },

        /**
         * 加载JS
         * @param {String} url js路径
         * @param {Function} callback 回函
         */
        loadJS: function(url, callback) {
            var script = document.createElement("script");
            script.type = 'text/javascript';
            script.charset = 'utf-8';

            // 标准浏览器 加载状态判断
            script.onload = function() {
                if (callback) {
                    callback(script);
                }
            };

            // IE 加载状态判断
            script.onreadystatechange = function() {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    if (callback) {
                        callback(script);
                    }
                }
            };

            script.src = url;
            document.body.appendChild(script);
        },

        /**
         * 加载CSS
         */
        loadCSS: function(url) {
            var head = document.head || document.getElementsByTagName('head')[0],
                link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;

            head.appendChild(link);
        },

        /**
         * 加载文件
         * @param {String} url css/js 路径
         * @param {Function} callback 加载js后的回调函数
         */
        load: function(url, callback) {
            if (url.match(/.js/)) {
                this.loadJS(url, callback);
            } else if (url.match(/.css/)) {
                this.loadCSS(url);
            }
        },

        /**
         * 添加一个事件模型
         * @param {Element} elm dom节点
         * @param {String} type 事件种类
         * @param {Function} fn 回调函数
         */
        addEvent: function(elm, type, fn) {
            if (elm.addEventListener) {
                elm.addEventListener(type, fn, false);
                return true;
            } else if (elm.attachEvent) {
                elm['e' + type + fn] = fn;
                elm[type + fn] = function() {
                    elm['e' + type + fn](win.event);
                };
                elm.attachEvent('on' + type, elm[type + fn]);
                return true;
            }
            return false;
        },

        /**
         * 删除一个事件模型
         * @param {Element} elm dom节点
         * @param {string} type 事件种类
         * @param {Function} fn 回调函数
         */
        removeEvent: function(elm, type, fn) {
            if (win.removeEventListener) {
                return function(elm, type, fn, capture) {
                    elm.removeEventListener(type, fn, !! capture);
                };
            } else if (win.detachEvent) {
                return function(elm, type, fn) {
                    elm.detachEvent("on" + type, fn);
                };
            } else {
                return function() {};
            }
        },

        /**
         * 根据class返回nodeList
         * 返回数组
         *
         * @param {String} cls class
         * @param {Object} root 父级节点，可选参数
         */
        getByClassName: function(cls, root) {
            root = root || document;
            var arr = [];

            if (root.querySelectorAll) {
                arr = root.querySelectorAll('.' + cls);
            } else if (root.getElementsByClassName) {
                arr = root.getElementsByClassName(cls);
            } else {
                var elm = root.getElementsByTagName('*');

                for (var i = 0, len = elm.length; i < len; i++) {
                    if (elm[i].className.match(cls)) {
                        arr.push(elm[i]);
                    }
                }
            }

            return arr;
        },

        /**
         * 设置属性
         * @param {Element} elm dom节点
         * @param {Object} opt 包含 key:val 的对象
         */
        setAttr: function(elm, opt) {
            for (var i in opt) {
                elm.setAttribute(i, opt[i]);
            }
        },

        /**
         * 检测元素是否包含 class
         * @param {Element} elm dom节点
         * @param {String} cls 名称
         */
        hasClass: function(elm, cls) {
            try {
                if (elm.className.match(cls)) {
                    return true;
                } else {
                    return false;
                }
            } catch(e) {
                if (typeof console !== 'undefined') {
                    console.error('adClass: ' + e);
                } else {
                    return false;
                }
            }
        },

        /**
         * 添加一个 class
         * @param {Element} elm dom节点
         * @param {String} cls 名称
         */
        addClass: function(elm, cls) {
            try {
                if (!this.hasClass(elm, cls)) {
                    elm.className === "" ? elm.className = cls : elm.className += " " + cls;
                }
            } catch(e) {
                if (typeof console !== 'undefined') {
                    console.error('adClass error: ' + e);
                } else {
                    return false;
                }
            }
        },

        /**
         * 删除一个 class
         * @param {Element} elm dom节点
         * @param {String} cls 名称
         */
        removeClass: function(elm, cls) {
            try {
                if (elm.className.length > cls.length) {
                    cls = " " + cls;
                }
                elm.className = elm.className.replace(cls, "");
            } catch(e) {
                if (typeof console !== 'undefined') {
                    console.error('adClass: ' + e);
                } else {
                    return false;
                }
            }
        },

        /**
         * 添加css样式
         * @param {Element} elm dom节点
         * @example
         * setStyle(elm, {
         * 	css: {
         * 		"width": "10px",
         * 		"height": "20px"
         * 	}
         * })
         */
        setCSS: function(elm, styles) {
            var setStyle = function(prop, val) {
                elm.style[prop] = val;
            };

            for (var prop in styles) {
                if (!styles.hasOwnProperty(prop)) continue;
                setStyle(prop, styles[prop]);
            }
        },

        /**
         * 返回节点的x/y座标
         * @param {Element} elm dom节点
         * @return {Object} 返回一个包含x/y座标的对象
         */
        offset: function(elm) {
            var left = 0;
            var top = 0;
            while (elm) {
                left += elm.offsetLeft;
                top += elm.offsetTop;
                elm = elm.offsetParent;
            }	
            return {x: left, y: top};
        },

        /**
         * 返回节点的宽度
         * @param {Element} elm dom节点
         * @return {Number} 返回一个数字
         */
        width: function(elm) {
            var box = elm.getBoundingClientRect();
            return box.width || (box.right - box.left);
        },

        /**
         * 返回节点的高宽
         * @param {Element} elm dom节点
         * @return {Number} 返回一个数字
         */
        height: function(elm) {
            var box = elm.getBoundingClientRect();
            return box.height || (box.bottom - box.top);	    
        },

        /**
         * 返回对象在数组中的序号
         * @param {Object}
         * @param {Array}
         * @return {Number}
         */
        index: function(obj, arr) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i] === obj) {
                    return i;
                }
            }
        },

        /**
         * AJAX
         * @param {String} url 文件路径
         * @param {Function} success 文件请求成功后回调函数
         * @param {String} type POST/GET请求方式
         * @example
         * ajax({
         *     url: '//example.com/test.json',
         *     type: 'GET',
         *     success: function(data) {
         *         console.log(data);
         *     }
         * });
         */
        ajax: function(opt) {
            var XMLHttpFactories = [
                function () {return new XMLHttpRequest();},
                function () {return new ActiveXObject("Msxml2.XMLHTTP");},
                function () {return new ActiveXObject("Msxml3.XMLHTTP");},
                function () {return new ActiveXObject("Microsoft.XMLHTTP");}
            ];

            var req = (function() {
                var xmlhttp = false;
                for (var i = 0; i < XMLHttpFactories.length; i++) {
                    try {
                        xmlhttp = XMLHttpFactories[i]();
                    }
                    catch (e) {
                        continue;
                    }
                    break;
                }
                return xmlhttp;
            })();

            if (!req) {
                return;
            }

            req.open(opt.type, opt.url, true);
            req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');

            if (opt.type) {
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }

            req.onreadystatechange = function () {
                if (req.readyState != 4) return;
                if (req.status != 200 && req.status != 304) {
                    return;
                }
                opt.success(req.responseText);
            };

            if (req.readyState == 4) {
                return;
            }

            req.send(opt.type);
        },

        /**
         * 判断对象是否为数组
         * @param {Object} arr 对象
         */
        isArray: function(arr) {
            if (arr.pop && arr.push && arr.reverse && arr.shift && arr.sort &&
                arr.splice && arr.unshift && arr.concat && arr.join &&
                arr.slice) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * 解码 Unicode
         */
        hexToDec: function(str) {
            str = str.replace(/\\/g,"%");
            return unescape(str).replace(/%/g, '');
        },

        /**
         * 取推广渠道ID
         */
        getDitchId:function() {
            var script = document.getElementsByTagName("script"),
                i,
                len,
                item,
                _id;
            for (i = 0, len = script.length; i < len; i++) {
                item = script[i];
                if (item.src && item.src.match(/_tts_browser_center/)) {
                    _id = script[i].src.match(new RegExp("[\?\&]id=([^\&]*)(\&?)", "i" ));
                    return _id ? _id[1] : "0000000000000000";
                }
            }
        },

        /**
         * 以名/值的形式存储cookie
         * 同时采用encodeURIComponent()函数进行编码，来转义分号、逗号和空白符
         * day是一个数字，代表天数，day是0就表示删除cookie
         * @param {String} name 名
         * @param {String} value 值
         * @param {String} day 天数
         * @param {String} path 路径(可选)
         * @param {String} domain 域(可选)
         */
        setCookie: function(opt) {
            var cookie = opt.name + '=' + encodeURIComponent(opt.value);
            if (typeof opt.day === 'number') {
                //IE不支持max-age，使用expires
                if (!-[1,]) {
                    var date = new Date();
                    date.setTime(new Date().getTime() + opt.day * 24 * 3600 * 1000);
                    cookie += '; expires=' + date.toGMTString();
                } else {
                    cookie += '; max-age=' + (opt.day * 60 * 60 * 24);
                }

                if (opt.path) {
                    cookie += '; path=' + opt.path;
                }
                if (opt.domain) {
                    cookie += '; domain=' + opt.domain;
                }
            }
            document.cookie = cookie;
        },

        /**
         * 将document.cookie的值以名/值对组成的一个对象返回
         */
        getCookie: function() {
            var cookie = {},
                all = document.cookie,
                list,
                i,
                len,
                item,
                index;

            if (all === '') {
                return cookie;
            }

            list = all.split('; ');

            for (i = 0, len = list.length; i < len; i++) {
                item = list[i];
                index = item.indexOf('=');
                var cookieNow;
                try{
                    cookieNow=decodeURIComponent(item.substring(index + 1));
                }catch(e){
                    cookieNow=item.substring(index + 1);
                }
                cookie[item.substring(0, index)] = cookieNow;
            }

            return cookie;
        },

        /**
         * @param {Array} arr 数组对象
         * @param {Function} 回调函数
         */
        forEach: function(arr, success) {
            for (var i = 0, len = arr.length; i < len; i++) {
                success(arr[i], i);
            }
        },

        /**
         * 发送一个JSONP请求
         */
        getJSONP: function(url, success) {
            var cbnum = 'cb' + this.getJSONP.counter++,
                cbname = 'tts.getJSONP.' + cbnum,
                script = document.createElement('script');

            //使用jsonp作为参数名
            !url.match(/\?/) ? url += '?' : url += '&'
            url += 'jsonp=' + cbname;

            this.getJSONP[cbnum] = function(response) {
                try {
                    success(response);
                } finally {
                    delete tts.getJSONP[cbnum];
                    script.parentNode.removeChild(script);
                }
            };

            script.charset = 'utf-8';
            script.src = url;
            document.body.appendChild(script);
        },

        /**
         * 请求一个HTML模板页面，插入到当前页面中
         */
        tpl: function(opt) {
            var api = opt.debug ? '//199.155.122.206:9390/' : this.api.re;
            opt.url = opt.url.match(/http/) ? opt.url : 'http:' + opt.url;
            this.getJSONP(api + 'data/getTemplateContent.do?' +
                'path=' + encodeURIComponent(opt.url) +
                '&t=' + new Date().getTime(),
                function(str) {
                    if (str === 'undefined' && typeof console !== 'undefined') {
                        console.error('\u6587\u4ef6\u83b7\u53d6\u5931\u8d25\uff1a' + opt.url);
                    }
                    var elm = document.createElement('div');
                    elm.className = 'TTS-hide';
                    elm.innerHTML = str;
                    document.body.appendChild(elm);

                    if (opt.success) {
                        opt.success(elm);
                    }
                }
            );
        },

        /**
         * 查询样式的值
         */
        getStyle: function(elm, key) {
            if (typeof getComputedStyle !== 'undefined') {
                return getComputedStyle(elm, null)[key];
            } else {
                return elm.currentStyle.key;
            }
        },

        /**
         * 图片载入事件
         * 360安全浏览器下加入延迟器
         */
        imgload: function(img, success) {
            var media = new Image();
            media.onload = function() {
                if (window.external.twGetRunPath && window.external.twGetRunPath.match(/360se/)) {
                    setTimeout(success, 100);
                } else {
                    success();
                }
            }
            media.src = img.src;
        },

        /**
         * 返回指定的父级元素
         * @param {Element} elm 当前元素
         * @param {String} node 父级nodeName，还可以是父级className
         */
        parent: function(elm, node) {
            var result = elm.parentNode,
                rule;
            //node = node[0] === '.' ? node.slice(1, node.length) : node;

            /**
             * 区分className和nodeName
             */
            rule = function() {
                if (node.charAt(0) === '.') {
                    return '.' + result.className !== node;
                } else {
                    return result.nodeName !== node.toUpperCase();
                }
            };


            while (result && rule()) {
                result = result.parentNode;
            }

            return result;
        },

        /**
         * 返回元素的属性
         * @param {Element} elm 当前元素
         * @param {String} attr 属性名称
         */
        attr: function(elm, attr) {
            var result;

            if (elm) {
                result = elm.getAttribute(attr);
            } else {
                result = '';
            }

            return result;
        },

        /**
         * 返回元素文本
         * @param {Element} elm 当前元素
         */
        text: function(elm) {
            var result;

            if (elm) {
                result = elm.innerText;
            } else {
                result = '';
            }

            return result;
        }
    };

    if (!win.tts) {
        //创建唯一回函名称的计数器
        tts.getJSONP.counter = 0;
        win.tts = tts;
    }
})(window);
