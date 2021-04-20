import rpc from './rpc.js';
let config = window.etback.config;
var et_oauth = {
    getUrlCode:function(query){
        if( typeof(query.code) != 'undefined' && query.code != '' ){
            return query.code;
        }
        return false;
    },
    getAccessToken:function(code){
        if( code === false || code == "") return Promise.resolve(false);
        var dat = "type=auth2.0&code="+code;
        return fetch(config.v2host+"/token", {method:'POST',body:dat,headers:{'Content-Type':'application/x-www-form-urlencoded'},mode:'cors'}).then(
            function(response){
                if(response.ok) return response.json();
                return false;
            },function(error){
                console.error('网络异常！' + url,error);
            }
        );
    },
    refreshToken:function(token){

    },
    getConfig:function(token){
        if( token === false || token == "") return Promise.resolve(false);
        var url = config.v2host+"/member/config";
        var header = {'Content-Type':'application/x-www-form-urlencoded'};
        header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token, New-Access-Token';
        header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        header['Access-Token'] = token;
        header['New-Access-Token'] = window.localStorage.getItem('new_access_token') || '';
        return fetch(url, {method:'GET', headers:header}).then(
            function(response){
                if(response.ok) return response.json();
                return false;
            },function(error){
                console.error('网络异常！' + url,error);
            }
        );
    }
}

var oauth = { eting:et_oauth,czy:"",wechat:""};

export default oauth;
