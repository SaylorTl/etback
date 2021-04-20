import { Message } from 'element-ui'
let config = window.etback.config;
export default {
    fetch:function(){
        var vm = this;
        var url = '';
        var params = {};
        var host = config.host;
        var hooks = [101,102,103];
        var len = arguments.length;
        if(len == 1){
            url = arguments[0]; params = {method:'GET'};
        }else if(len == 2){
            url = arguments[0]; params = arguments[1];
        }else{
            return false;
        }
        var _setQueryString = function(obj){
            var query = '';
            for(var key in obj){
              if( typeof obj[key]!=='undefined'){
                query += key + "=" + obj[key] + "&";
              }
            }
            query = query.substring(0,query.length-1);
            return query;
        }
        var token = window.localStorage.getItem('access_token') || '';
        if(typeof(params.headers) == 'undefined' ){
           params.headers = {};
           params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        params.headers['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        params.headers['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        params.headers['Access-Token'] = token;
        if( typeof(params.body) == 'object' && !(params.body instanceof FormData)) params.body = _setQueryString(params.body);
        if( typeof(params.mode) == 'undefined' ) params.mode = 'cors';
        url = host + url;
        return fetch(url,params).then(
            function(response){
                if(response.ok) return response.json();
                console.error('执行错误！' + url);
            },function(error){
                console.error('网络异常！' + url);
            }
        ).then(function(json){
            if(typeof(json) != 'undefined'){
                if(parseInt(json.code) == 103){
                    console.error("您无权访问:" + url);
                    //window.location.href = "/login"; return '';
                }
                if(hooks.indexOf(parseInt(json.code)) != -1){
                    Message({ showClose:true, message:json.message, type:'error' }); 
                    console.error(json.message);
                    return json;
                }else{
                    return json;
                }
            }
        });
    },
    loadfile:function(){
        var vm = this;
        var url = '';
        var params = {};
        var host = config.host;
        var hooks = [101,102,103];
        var len = arguments.length;
        if(len == 1){
            url = arguments[0]; params = {method:'GET'};
        }else if(len == 2){
            url = arguments[0]; params = arguments[1];
        }else if(len == 3 && !arguments[1]){
          url = arguments[0]; params = {method:'GET'};
          var filename = arguments[2];
        }else if(len == 3 && arguments[1]) {
          url = arguments[0]; params = arguments[1];
          var filename = arguments[2];
        }
        else if(len == 4 && !arguments[1]) {
            url = arguments[0]; params = {method:'GET'};
            var filename = arguments[2];
            var callback=arguments[3];
        }
        else{
            return false;
        }

        var token = window.localStorage.getItem('access_token') ||'';
        if(typeof(params.headers) == 'undefined' ){
           params.headers = {};
           params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        params.headers['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        params.headers['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        params.headers['Access-Token'] = token;
        if( typeof(params.headers['Content-Type']) == 'undefined' ) params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        if( typeof(params.mode) == 'undefined' ) params.mode = 'cors';
        url = host + url;
        return fetch(url,params).then(
            function(response){
                if(response.ok){
                     return response.blob().then(function(blob){
                        if(blob.type === 'application/json'){
                            var fr = new FileReader();
                            fr.readAsText(blob);
                            var result= '';
                            fr.onload = function() {
                                result = JSON.parse(this.result);
                                if(callback){callback(result);}
                            };
                            return result||fr.result;
                        }else{
                            var a = document.createElement('a');
                            var url = window.URL.createObjectURL(blob);
                            // var filename = response.headers.get('Content-Disposition');
                            a.href = url;
                            a.download = filename || "file.xls";
                            a.click();
                            window.URL.revokeObjectURL(url);
                            return {code:0,message:'下载成功!'};
                        }
                    })
                }else{
                    console.error('执行错误！' + url);
                }
            },function(error){
                console.error('网络异常！' + url);
            }
        );
    },
    login:function(username,password,client_type){
        var data = "username="+username+"&password="+password+"&client_type="+client_type;
        data += "&type=web";
        data += "&user_agent="+encodeURIComponent(navigator.userAgent);
        data += "&origin="+encodeURIComponent(window.location.origin);
        var vm = this;
        return vm.fetch('/index/location').then(function(json){
            data += "&ip="+json.content.ip;
            return vm.fetch('/login/index',{ method:'POST',body:data});
        });
    },
    logout:function(){
        return this.fetch('/index/logout');
    },
    config:function(){
        return this.fetch('/login/config?time=' + new Date().getTime());
    },
 
    my_catalog: function(data) {
        return this.fetch('/user/catalog', { method: 'POST', body: data })
    },
    fetchNew (method,biz_content) {
        const token = window.localStorage.getItem('new_access_token') || '';
        console.info(token);
        const now_time = parseInt(new Date().getTime() / 1000);
        const app_id = "G8b875FDhzW0";
        let body = "app_id=" + app_id + "&method=" + method + "&format=json&charset=utf8&timestamp=" + now_time + "&token=" + token + "&biz_content=";
        if (biz_content) {
            body = body + JSON.stringify(biz_content);
        }
        let headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        headers['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        headers['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS' ;
        let url = config.middleware + '/gateway';
        let params = {
                method: 'post', 
                headers,
                body
            };
        return new Promise((resolve)  => {
            fetch(url, params).then(
                response => {
                    if (response.ok) {
                        return response.json()
                    }
                    console.error('执行错误！' + url)
                },
                error => {
                    console.error('网络异常！' + url)
                }
            ).then(json => {
                if (json.code !== 0) {
                    console.log("request:", method, json.message)
                        // Vue.$vux.toast.text(response.data.message, 'middle')
                }
                resolve(json);
            }).catch(error => {
                console.log('错误')
                console.error(error);
            });
        }) 
    }
}