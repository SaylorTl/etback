<template>
<div>
    <div id="login">
        <h1>EP停车车辆管理后台系统</h1>
        <div class="loginBox">
            <h2>管理员登录</h2>
            <div class="form_box">
                <form>
                    <div class="label_wrap">
                        <i class="fa fa-user gray"></i>
                        <input type="text" v-model="ruleForm.username" placeholder="请输入OA账号">
                    </div>
                    <div class="label_wrap">
                        <i class="fa fa-lock gray"></i>
                        <input type="password" v-model="ruleForm.password" placeholder="请输入密码" @keyup.enter='submit'>
                    </div>
                    <div class="radio_wrap">
                        <div class="radio_item">
                            <input type="radio" id="radio_1" class="regular-radio" v-model="ruleForm.client_type" value="1"/>
                            <label for="radio_1"></label><span>OA账号</span>
                        </div>
                        <div class="radio_item">
                            <input type="radio" id="radio_2" class="regular-radio" v-model="ruleForm.client_type" value="2"/>
                            <label for="radio_2"></label><span>私有账号</span>
                        </div>
                    </div>
                    <div class="button_wrap">
                        <div class="submit" @click="submit"><i class="el-icon-loading" v-show="logining"></i>立即登录</div>
                        <div class="reset" @click="reset">重置</div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</template>
<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                logining:false,
                ruleForm:{
                  username:'',
                  password:'',
                  client_type:'1',
                },
            };
        },
        mounted:function(){
            window.localStorage.removeItem("access_token");
        },
        updated:function(){
            window.localStorage.removeItem("access_token");
        },
        methods:{
            submit:function(){
                var vm = this;
                if(this.ruleForm.username == ''){
                    this.$message({ showClose:true, message:'用户名不能为空', type:'error' }); return ;
                }
                if(this.ruleForm.password == ''){
                    this.$message({ showClose:true, message:'密码不能为空', type:'error' }); return ;
                }
                vm.logining = true;
                utils.rpc.login(this.ruleForm.username,this.ruleForm.password,this.ruleForm.client_type).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            window.localStorage['access_token'] = json.content.access_token;
                            window.localStorage['user_id'] = json.content.user_id;
                            window.location.href = "/welcome"
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            reset:function(){
              this.ruleForm = {username:'',password:''}
            },
            checkUA:function(){
                var vm = this;
                var userAgent = navigator.userAgent.toLocaleLowerCase(); 
                var isIE6789 = userAgent.indexOf("msie") > -1;  
                var isIE11 = userAgent.indexOf("wow64; trident/7.0") > -1;
                if(isIE6789||isIE11){
                    var h = vm.$createElement;
                    vm.$msgbox({
                      title: '提示',
                      message: h('p', null, [
                        h('span', null, '当前浏览器可能不支持我们的某些功能，请'),
                        h('a',  {attrs: {
                             'href': 'http://rj.baidu.com/soft/detail/14744.html',
                             'target':"_blank"
                            }}, '下载chrome浏览器')
                      ])
                   })
                }
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.checkUA();
            });
        },
    }
</script>
