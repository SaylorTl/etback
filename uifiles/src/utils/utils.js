import rpc from "./rpc.js";
import config from "./const.js";
import eptimes from "./eptimes.js";
import validator from "./validator.js";
import COS from "cos-js-sdk-v5";
const BUCKET = "cdn-1256130579";
const REGION = "ap-shanghai";
var utils = {
    hasRouteParams(obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i]) {
                    return true;
                }
            }
        }
        return false;
    },
    _getCacheKey() {
        let prefix = window.location.pathname.slice(1).replace("/", "_"); //vm.$route.path
        let token = window.localStorage.getItem("access_token");
        let key = `${prefix}_${token}`;
        return key;
    },
    setCache(vm, extra) {
        let key = this._getCacheKey();
        let cacheObj = this.setCacheItem(vm, extra);
        window.sessionStorage[key] = JSON.stringify(cacheObj);
    },
    getCache() {
        let key = this._getCacheKey();
        return window.sessionStorage[key] || "";
    },
    clearCache_active() {
        let key = this._getCacheKey();
        window.sessionStorage.removeItem(key);
    },
    /**
     * [setCacheItem 设置要存的字段 默认为 'search','tableData','pagination' 三个]
     * @param {[type]} vm    [description]
     * @param {[array]} extra [额外要存的字段]
     */
    setCacheItem(vm, extra) {
        //
        let obj = {};
        let arr = ["search", "tableData", "pagination"];
        if (extra) {
            arr = arr.concat(extra);
        }
        for (let item of arr) {
            if (vm[item]) {
                obj[item] = vm[item];
            }
        }
        return obj;
    },
    getCacheItem(vm, obj) {
        //取出已经存的字段 赋值到VM上
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                vm[i] = obj[i];
            }
        }
    },
    /**
     * [getRulesByStationID 通过停车场的ID获取当前车场所有规则]
     * @param  {[Number]}   id [停车场的ID]
     * @return {[Array]}      [返回所有规则的对象数组]
     */
    getRulesByStationID: function(id) {
        var url = "/rule/lists?station_id=" + id + "&page=1&pagesize=999";
        var array = [];
        return rpc.fetch(url).then(function(json) {
            //获取规则列表
            if (typeof json != "undefined" && json.code == 0) {
                array = json.content.lists;
                return array ? array : [];
            }
        });
    },
    /**
     * [tableTemplate 返回一个指定列数的表格]
     * @param  {obj} obj [{key:value} 可传对象也可以是对象数组]
     * @param  {number} col [表格列数]
     * @return {str}     ['']
     */
    tableTemplate: function(obj, col) {
        let wrap = '<table class="opdetail">placeholder</table>';
        let strTr = "<tr>placeholder</tr>";
        if (Array.isArray(obj)) {
            // var msgTD = '';
            // var msgTR='';
            // obj.forEach(function(item){
            //     for(var i in item){
            //         msgTD += '<td>' + i + ':' + item[i] + '</td>';
            //     }
            //     msgTR += strTr.replace('placeholder', msgTD);
            //     msgTD = ''
            // })
            // return wrap.replace('placeholder', msgTR)
            let arrHtml = obj
                .map(item => {
                    let str = [];
                    for (let o in item) {
                        str.push(`<td>${o}:${item[o]}</td>`);
                    }
                    return `<tr>${str.join("")}</tr>`;
                })
                .join("");
            return `<table class="opdetail">${arrHtml}</table>`;
        }
        let _addEmptyTd = function(k) {
            let strTd = [];
            for (let j = 0; j < k; j++) {
                strTd.push(`<td></td>`);
            }
            return strTd.join("");
        };
        // let trAll = '',newTr = '',strTd = '',n = 0,k=0;
        // for (let i in obj) {
        //     n++;
        //     strTd += '<td>' + i + ':' + obj[i] + '</td>';
        //     if (n % col == 0) {
        //         newTr = strTr.replace('placeholder', strTd);
        //         strTd = '';
        //     }
        //     trAll += newTr;
        //     newTr = '';
        // }
        let objStr = [];
        let count = 1;
        let objHtml = "";
        let objLen = Object.keys(obj).length;
        for (let o in obj) {
            if (count % col === 0) {
                objStr.push(`<td>${o}:${obj[o]}</td></tr><tr>`);
            } else {
                objStr.push(`<td>${o}:${obj[o]}</td>`);
            }
            count++;
        }
        let emptyTd = "";
        let k = col - (count % col);
        for (let i = 0; i <= k; i++) {
            emptyTd += `<td></td>`;
        }
        let totalCol =
            objLen % col === 0 ? parseInt(objLen / col) : parseInt(objLen / col) + 1;
        if (objLen % col === 0) {
            objHtml = `<tr>${objStr.join("")}</tr>`;
            objHtml = objHtml.replace("<tr></tr>", "");
        } else {
            objStr = objStr.concat(emptyTd);
            objHtml = `<tr>${objStr.join("")}</tr>`;
        }
        return `<table class="opdetail">${objHtml}</table>`;
        // if(strTd!=''){
        //     k = col - n % col;
        //     strTd += _addEmptyTd(k);
        //     newTr = strTr.replace('placeholder', strTd);
        //     trAll += newTr;
        // }
        // return (wrap.replace('placeholder', trAll))
    },
    isMobile(tel) {
        let tel_regexp = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/;
        return tel_regexp.test(tel);
    },
    //金额必须是正数且最多有两位小数
    isMoney(s) {
        var exp = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if (exp.test(s)) {
            return true;
        } else {
            return false;
        }
    },
    isEmptyObject: function(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    },
    in_array: function(val, obj) {
        for (var i in obj) {
            if (val == obj[i]) return true;
        }
        return false;
    },
    /* 加法 calc(n,m) 减法 calc(n,m,'-') */
    calc: (arg1, arg2, flag) => {
        var r1, r2, m;
        arg1 = parseFloat(arg1);
        arg2 = parseFloat(arg2);
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        let result = !flag ? arg1 * m + arg2 * m : arg1 * m - arg2 * m;
        return result / m;
    },
    /*
          调用：utils.authCheck(this,['str',…])
          调用：utils.authCheck(this,'str')
       */
    authCheck: function(self, tag) {
        var s,
            tags = self.$store.state.global.login.tags;
        if (typeof tag == "string") {
            s = tags.findIndex(function(k) {
                return k == tag;
            });
            return s > -1;
        } else if (Array.isArray(tag) && tag.length != 0) {
            s = tag.every(function(item) {
                return tags.indexOf(item) > -1;
            });
            return s;
        }
    },
    /**
     * [releaseTime 时间差]
     * @param  {[type]} time [毫秒数]
     * @param  {[type]} type [是否需要天,时,分,秒]
     * @return {[type]}      [description]
     */
    differenceTime(time, type) {
        var c = function(n) {
            return n > 9 ? n : "0" + n;
        };
        //计算出相差天数
        var days = Math.floor(time / (24 * 3600 * 1000));
        //计算出小时数
        var leave1 = time % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000));
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000));
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
        var seconds = Math.round(leave3 / 1000);
        let str1 =
            days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒";
        let str2 = days + "天";
        let str3 = c(hours) + ": " + c(minutes) + " :" + c(seconds);
        if (type === 1) {
            return str1;
        }
        if (type === 2) {
            return str2;
        }
        if (type === 3) {
            return str3;
        }
    },
    diffTime: function(sTime, type) {
        var time = "";
        var s = sTime;
        sTime = Math.floor(sTime / (1000 * 60));
        var m = sTime % 60;
        sTime = Math.floor(sTime / 60);
        var h = sTime % 24;
        sTime = Math.floor(sTime / 24);
        var d = sTime % 30;
        sTime = Math.floor(sTime / 30);
        var M = sTime % 12;
        sTime = Math.floor(sTime / 12);
        var y = sTime;

        if (type == "hour") {
            time = (s / (1000 * 60 * 60)).toFixed(1);
        } else {
            time =
                (y ? y + "年" : "") +
                (M ? M + "月" : "") +
                (d ? d + "天" : "") +
                (h ? h + "小时" : "") +
                (m ? m + "分" : "");
        }
        return time;
    },
    /*
          不带时分秒：timeParse(time,'-',false);
          带时分秒：timeParse(time);
       */
    timeParse: function(t, delimiter, hasHMS) {
        if (t === "") {
            return "";
        }
        t = new Date(t);
        var delimiter = delimiter || "-";
        var c = function(n) {
            return n > 9 ? n : "0" + n;
        };
        var ymd =
            t.getFullYear() +
            delimiter +
            c(t.getMonth() + 1) +
            delimiter +
            c(t.getDate());
        var hms =
            c(t.getHours()) + ":" + c(t.getMinutes()) + ":" + c(t.getSeconds());
        return !!hasHMS ? ymd + " " + hms : ymd;
    },
    //基于当前时间计算半年前的时间
    getHalfYear: function(hasHMS) {
        var c = function(n) {
            return n > 9 ? n : "0" + n;
        };
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        if (month < 6) {
            month = 6 + month;
            year = year - 1;
        } else {
            month = month - 6;
        }
        var ymd = year + "-" + c(month + 1) + "-" + c(day);
        var hms =
            c(now.getHours()) + ":" + c(now.getMinutes()) + ":" + c(now.getSeconds());
        return !!hasHMS ? ymd + " " + hms : ymd;
    },
    strTime: function(str) {
        var arr = str.split(/[- : \/]/),
            date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
        return date;
    },
    cookie: {
        set: function(name, value, expires) {
            var cookieString = name + "=" + escape(value);
            if (expires > 0) {
                var date = new Date();
                date.setTime(date.getTime + expires * 1000);
                cookieString = cookieString + "; expires=" + date.toGMTString();
            }
            document.cookie = cookieString;
        },
        get: function(name) {
            var strCookie = document.cookie;
            var arrCookie = strCookie.split("; ");
            for (var i = 0; i < arrCookie.length; i++) {
                var arr = arrCookie[i].split("=");
                if (arr[0] == name) return unescape(arr[1]);
            }
            return "";
        },
        del: function(name) {
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            document.cookie = name + "=0; expires=" + date.toGMTString();
        }
    },
    format: function(num) {
        return (num.toFixed(0) + "").replace(
            /\d{1,3}(?=(\d{3})+(\.\d*)?$)/g,
            "$&,"
        );
    },
    deepCopy: function(data) {
        return JSON.parse(JSON.stringify(data));
    },
    setQueryString: function(obj) {
        var query = "";
        for (var key in obj) {
            if (
                obj[key] !== "" &&
                typeof obj[key] !== "undefined" &&
                obj[key] !== null
            ) {
                query += key + "=" + obj[key] + "&";
            }
        }
        query = query.substring(0, query.length - 1);
        return query;
    },
    setDeptQuery: function(obj) {
        let _checkVali = function(val) {
            return val !== "" && typeof val !== "undefined" && val !== null;
        };
        let map = { company: "company_id", area: "area_id", department: "dept_id" };
        let objArr = ["department", "area", "company"];
        for (var i = 0; i < objArr.length; i++) {
            let key = objArr[i];
            if (obj && _checkVali(obj[key])) {
                return `${map[key]}=${obj[key]}`;
            }
        }
        return "";
    },
    unique: function(data, type) {
        let hash = {};
        data = data.reduce((preVal, curVal) => {
            hash[curVal[type]] ?
                "" :
                (hash[curVal[type]] = true && preVal.push(curVal));
            return preVal;
        }, []);
        return data;
    },
    addScript: function(id, path) {
        const _id = document.getElementById(id);
        if (_id) {
            _id.parentNode.removeChild(_id);
        }
        const Header = document.getElementsByTagName("head")[0];
        const _script = document.createElement("script");
        _script.src = `${path}?time=${new Date().getTime()}`;
        _script.id = id;
        Header.appendChild(_script);
    },
    getTingYunScript: function() {
        var TY = document.getElementById("tingyun");
        if (TY) {
            TY.parentNode.removeChild(TY);
        }
        var Header = document.getElementsByTagName("head")[0];
        var ty = document.createElement("script");
        ty.src = "/static/js/tingyun-eting-new.js?time=" + new Date().getTime();
        ty.id = "tingyun";
        Header.appendChild(ty);
    },
    getEditorScript() {
        const PATH = "/static/ueditor/";
        let uelists = {
            ue_config: "ueditor.config.js",
            ue_all: "ueditor.all.js",
            ue_parse: "ueditor.parse.js",
            ue_addimg: "addInsertImage.js"
        };
        let Header = document.getElementsByTagName("head")[0];
        for (let i in uelists) {
            let node = document.getElementById(i);
            if (node) {
                node.parentNode.removeChild(node);
            }
            var ue = document.createElement("script");
            let time = new Date().getTime();
            ue.src = `${PATH}${uelists[i]}?time=${time}`;
            ue.id = `${i}`;
            Header.appendChild(ue);
        }
        this.getEditorCss();
    },
    getEditorCss() {
        const PATH = "/static/ueditor/";
        let Header = document.getElementsByTagName("head")[0];
        let linksheet = document.getElementById("ue_sheet");
        if (linksheet) {
            linksheet.parentNode.removeChild(linksheet);
        }
        let ue_link = document.createElement("link");
        ue_link.rel = "stylesheet";
        ue_link.href = `${PATH}themes/iframe.css`;
        ue_link.id = "ue_sheet";
        Header.appendChild(ue_link);
    },
    removeEditorScript() {
        //ue_sheet是样式表的ID 其它是JS
        let ueIds = ["ue_config", "ue_all", "ue_parse", "ue_addimg", "ue_sheet"]; //'ue_lang',
        ueIds.forEach(item => {
            let node = document.getElementById(item);
            if (node) {
                node.parentNode.removeChild(node);
            }
        });
    },
    getDaysInOneMonth: function(year, month) {
        month = parseInt(month, 10);
        var d = new Date(year, month, 0); //这个是都可以兼容的
        var date = new Date(year + "/" + month + "/0"); //IE浏览器可以获取天数，谷歌浏览器会返回NaN
        return d.getDate();
    },
    strToDate: function(str) {
        var y = str.substr(0, 4);
        var m = str.substr(4, 2);
        var d = str.substr(6, 2);
        var h = str.substr(8, 2);
        var i = str.substr(10, 2);
        var s = str.substr(12, 2);
        return y + "-" + m + "-" + d + " " + h + ":" + i + ":" + s;
    },
    dealRouteParams(vm) {
        let params = vm.$route.params;
        let search = vm.search;
        if (params.queryFlag === 'fastQuery') {
            let { queryFlag, car_id } = params;
            vm.search.car_id = car_id;
            return vm.search;
        }

        if (JSON.stringify(params) === "{}") {
            return search;
        }
        for (var i in params) {
            if (i && params[i] !== "" && search[i] === "") {
                search[i] = params[i];
            }
        }
        return search;
    },
    cosFileInit() {
        let url = `/Qcloud/getTempkey?bucket=${BUCKET}&region=${REGION}`;
        const getTempKey = function(options, callback) {
            rpc.fetch(url).then(res => {
                let credentials = res.content.credentials;
                let expiredTime = res.content.expiredTime;
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    XCosSecurityToken: credentials.sessionToken,
                    ExpiredTime: expiredTime
                });
            });
        };
        const cos = new COS({
            getAuthorization: getTempKey
        });
        utils.cos = cos;
    },
    cosFileUpload(files, callback) {
        let filename = files[0].name;

        utils.cos.putObject({
                Bucket: BUCKET,
                Region: REGION,
                Key: filename,
                Body: files[0],
                onProgress: function(info) {
                    getCosImageURL(filename, info, callback);
                }
            },
            (err, data) => {
                if (err) {
                    console.log("图片上传结果：", err, data);
                    fn(false);
                }
            }
        );
    },
    getCosImageURL(filename, info, callback) {
        let args = arguments;
        if (args.length === 2) {
            filename = args[0];
            callback = args[1];
            info = "";
        }
        utils.cos.getObjectUrl({
                Bucket: BUCKET,
                Region: REGION,
                Key: filename,
                Expires: 7200,
                Sign: true
            },
            function(err, data) {
                let url = data.Url;
                let result = { filename, info, err, url };
                callback(result);
            }
        );
    },
    cosFileInitNew(method, biz_content) {
        const getTempKey = function(options, callback) {
            rpc.fetchNew(method, biz_content).then(res => {
                let credentials = res.content.credentials;
                let expiredTime = res.content.expiredTime;
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    XCosSecurityToken: credentials.sessionToken,
                    ExpiredTime: expiredTime
                });
            });
        };
        const cos = new COS({
            getAuthorization: getTempKey
        });
        utils.cos = cos;
    },
    getCosImageURLNew(filename, biz_content, info, callback) {
        let args = arguments;
        if (args.length === 3) {
            filename = args[0];
            callback = args[2];
            info = "";
        }
        utils.cos.getObjectUrl({
                Bucket: biz_content.bucket,
                Region: biz_content.region,
                Key: filename,
                Expires: 7200,
                Sign: true
            },
            function(err, data) {
                let url = data.Url;
                let result = { filename, info, err, url };
                callback(result);
            }
        );
    },
    //页面输入框输入，金额格式
    amountBlur(v) {
        if (!v) return "";
        v = String(v);
        v = v.split(".");
        if (v[1] && v[1].length > 2) {
            v[1] = v[1].substring(0, 2);
            v = v[0] + "." + v[1];
            v = Number(v);
        } else {
            v = v[0] + "." + v[1];
        }
        return parseFloat(v);
    },
    //金额向上取整保留两位
    upWhole: function(k) {
        k = k || 0;
        k = Number(k);
        k = Math.ceil(k * 100) / 100;
        k = k.toFixed(2);
        return k;
    },
    _throttle: function(func, wait, options) {
        var timeout, context, args, result;
        var previous = 0;
        if (!options) options = {};

        var later = function() {
            previous = options.leading === false ? 0 : new Date().getTime();
            timeout = null;
            func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function() {
            var now = new Date().getTime();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
        };

        throttled.cancel = function() {
            clearTimeout(timeout);
            previous = 0;
            timeout = null;
        };

        return throttled;
    },
    _debounce: function(func, wait, immediate) {
        var timeout, result;
        var debounced = function() {
            var context = this;
            var args = arguments;

            if (timeout) clearTimeout(timeout);
            if (immediate) {
                // 如果已经执行过，不再执行
                var callNow = !timeout;
                timeout = setTimeout(function() {
                    timeout = null;
                }, wait);
                if (callNow) result = func.apply(context, args);
            } else {
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            }

            return result;
        };

        debounced.cancel = function() {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
    },
    isVehicleNumber(vehicleNumber) {
        var reg7 = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领E]{1}[A-Za-z]{1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳领]{1}$/;
        var reg8 = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-Za-z]{1}[A-Za-z0-9]{5}[A-Za-z0-9]{1}$/;
        if (vehicleNumber.length === 7) {
            // console.log('7位',vehicleNumber,reg7.test(vehicleNumber))
            return reg7.test(vehicleNumber);
        } else if (vehicleNumber.length === 8) {
            //  console.log('8位',vehicleNumber,reg8.test(vehicleNumber))
            return reg8.test(vehicleNumber);
        } else {
            //  console.log('其他',vehicleNumber)
            return false;
        }
    },
    unicode(str) {
        let value = '';
        const left_zero_4 = (str) => {
            if (str != null && str != '' && str != 'undefined') {
                if (str.length == 2) {
                    return '00' + str;
                }
            }
            return str;
        }
        for (var i = 0; i < str.length; i++) {
            value += '\\u' + left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
        }
        return value;
    },
    //加法
    accAdd(arg1, arg2) {
        var r1, r2, m, result = '';
        try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
        try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
        m = Math.pow(10, Math.max(r1, r2));
        result = (arg1 * m + arg2 * m) / m;
        return result;
    },
    //减法
    accDel(arg1, arg2) {
        var r1, r2, m, result = '';
        arg1 = parseFloat(arg1);
        arg2 = parseFloat(arg2);
        try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
        try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
        m = Math.pow(10, Math.max(r1, r2));
        result = (arg1 * m - arg2 * m) / m;
        return result;
    },
    //乘法函数
    accMul(arg1, arg2) {
        var m = 0,
            s1 = arg1.toString(),
            s2 = arg2.toString(),
            result = '';
        try { m += s1.split(".")[1].length; } catch (e) { console.log('') }
        try { m += s2.split(".")[1].length; } catch (e) { console.log('') }
        result = Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        return result;
    },
    //除法函数
    accDiv(arg1, arg2) {
        var t1 = 0,
            t2 = 0,
            r1, r2,
            result = '';
        try { t1 = arg1.toString().split(".")[1].length; } catch (e) { console.log('') }
        try { t2 = arg2.toString().split(".")[1].length; } catch (e) { console.log('') }
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        result = (r1 / r2) * Math.pow(10, t2 - t1);
        return result;
    },
};

utils.fetch = rpc.fetch;
utils.fetchNew = rpc.fetchNew;
utils.rpc = rpc;
utils.eptimes = eptimes;
utils.config = config;
utils.validator = validator;

export default utils;