<template>
    <div id='header'>
        <div class='logo'>EP停车车辆管理后台</div>
        <div class='nav'>
            <div class='nav-list'>
                <router-link v-for="item in showCatalog" :key="item.path" :to="item.path">
                    <i :class="item.icon"></i>{{item.name}}
                </router-link>
            </div>
            <div id='header_nav_more' class='more' v-on:click.stop="showpop"><i class="fa fa-th"> 更多</i></div>
            <search-route></search-route>
        </div>
        <div class='user'>
            <div class='setting'>
                <el-dropdown @command="handleCommand">
                    <span class="el-dropdown-link setting">{{login.data.user_realname ? login.data.user_realname : login.data.user_name}}</span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="todolist">每日待办</el-dropdown-item>
                        <el-dropdown-item command="gotoEmail">企业邮箱</el-dropdown-item>
                        <el-dropdown-item command="clearcache">清除缓存</el-dropdown-item>
                        <el-dropdown-item>{{login.data.user_rolename}}</el-dropdown-item>
                        <el-dropdown-item command="logout" divided>退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div v-show="popWnd.show" ref="pop" class="pop">
            <div class="wrap">
                <div class="center current">
                    <div class='title'>置顶应用</div>
                    <ul>
                        <li v-for="row in popWnd.selected" :key="row.name">
                            <i v-if="popWnd.edit" v-on:click.stop.prevent="iconClick('delete',row)" class="fa fa-minus-circle" aria-hidden="true"></i>
                            <span><i :class="row.icon" aria-hidden="true"></i>{{row.name}}</span>
                        </li>
                    </ul>
                    <el-tabs v-model="activeName" class='defined_tab'>
                        <el-tab-pane v-for="(item,index) in popWnd.catalog" :key="index" :label="item.title" :name="item.title">
                        <!-- <el-button @click.stop="editnav(index)" size="small" class='editbtn'>{{popWnd.edit&&index==catalogIndex?'保存':'编辑'}}</el-button> -->
                        <el-button  @click.stop="editnav(index)" type="primary" icon="el-icon-edit" round size="small" class='editbtn head-edit-button'></el-button>
                            <template>
                                 <ul>
                                    <li v-for="child in item.lists" v-if="child.auth && parseInt(child.is_display) == 1" class="buton">
                                        <i v-if="popWnd.edit && catalogIndex==index" v-on:click.stop.prevent="iconClick('add',child)" class="fa fa-plus-circle" aria-hidden="true"></i>
                                        <span v-on:click.stop="spanClick(child.path)"><i :class="child.icon" aria-hidden="true"></i>{{child.name}}</span>
                                    </li>
                                </ul>
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import utils from '../../utils/utils.js';
    import SearchRoute from './search-route'
    let config = window.etback.config;
    export default {
        data:function(){
            return{
                catalogIndex:'',
                enterIndex:0,
                activeName:'通用'
            }
        },
        components: {
            SearchRoute
        },
        computed:{
            showCatalog:function(){
                let tempCatalog = this.$store.state.global.catalog.filter(item => {
                    if (item.auth && parseInt(item.is_display) == 1) {
                        return item
                    }
                })
                return tempCatalog;
            },
            catalog () {
                return this.$store.state.global.catalog
            },
            login:function(){
                return this.$store.state.global.login;
            },
            popWnd:function(){
                return this.$store.state.global.popWnd;
            }
        },
        methods:{
            // handleClick:function(tab, event){console.log(tab, event);},
            enter:function(index){
                this.enterIndex = index
                this.show=true;
            },
            showpop:function(){
                if(this.popWnd.show == false){  //打开
                    var obj = {show:true,edit:false};
                    if(this.popWnd.selected.length == 0 && this.catalog.length > 0){
                        obj.selected = this.catalog;
                    }
                    this.$store.commit('header_pop_event',obj);
                }else{  //关闭
                    this.$store.commit('header_pop_event',{show:false,edit:false});
                }
            },
            clearcache:function(){
                this.$msgbox({ title:'提示', message:'清除缓存操作也将清除当前用户信息,需要重新登录',
                    showCancelButton:true,
                    confirmButtonText:'确定',
                    cancelButtonText:'取消',
                    type:'warning',
                    beforeClose:function(action, instance, done){
                        if(action === 'confirm'){
                            let url = '/v2/member/clear';
                            utils.fetch(url).then(res => {
                                if (res && res.code === 0) {
                                    window.localStorage.clear();
                                    window.sessionStorage.clear();
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1500);
                                    this.$message({message: '缓存清除成功！', type: 'success' });
                                    done();
                                } else {
                                    this.$message({message: res.message, type: 'error' });
                                }
                            })
                        } else {
                            done();
                        }
                    }
                })
            },
            goTodolist(){
                this.$router.push({path: '/todolist'})
            },
            handleCommand:function(command){
                var vm = this;
                if(command == 'clearcache'){
                    this.clearcache();
                    return
                }
                if(command == 'todolist'){
                    this.goTodolist();
                    return
                }
                if(command == 'gotoEmail'){
                    window.open('https://exmail.qq.com/cgi-bin/loginpage');
                    return
                }
                if(command == 'logout'){
                    utils.rpc.logout().then(function(json){
                        if(typeof(json) != 'undefined' && json.code == 0){
                            vm.$store.commit('sign_out');
                            window.location.href = config.oauthhost+"/member/login?source=web&client_id=G8b875FDhzW0&state=1112324&redirect_uri=" + encodeURIComponent(window.location.protocol + "//" + window.location.host);
                        }else{
                            //出错
                        }
                    });
                }
            },
            //编辑部分
            editnav:function(index){
                this.catalogIndex = index;
                if(this.popWnd.edit){ //保存
                    var vm = this;
                    var t = vm.popWnd.selected.map(function(k){
                        return k.path;
                    });
                    this.unDo=true;
                    var data = "selected="+JSON.stringify(t);
                    utils.rpc.my_catalog(data).then(function(json){
                        if(typeof(json) != 'undefined'){
                            if(json.code == 0){
                                vm.$store.commit('catalog',vm.popWnd.selected);
                                vm.$store.commit('header_pop_event',{show:true,edit:false});
                            }else{
                                vm.$message({ showClose:true, message:json.message, type:'error' });
                            }
                        }
                    });
                }else{ //编辑
                    this.unDo=false;
                    this.$store.commit('header_pop_event',{show:true,edit:true});
                }
            },
            iconClick:function(type,obj){
                var selected = this.popWnd.selected.concat();
                if(type == 'add'){
                    var has = false;
                    for(var i in selected) if(selected[i].path == obj.path) has = true;
                    if(has == false) selected.push(obj);
                }else if(type == 'delete'){
                    var tmp = [];
                    for(var i in selected) if(selected[i].path != obj.path) tmp.push(selected[i]);
                    selected = tmp;
                }
                this.$store.commit('header_pop_event',{selected:selected});
            },
            spanClick:function(path){
                this.$root._router.push({path:path});
                this.$store.commit('header_pop_event',{show:false,edit:false});
            }
        }
    };
</script>
<style scoped>
.head-edit-button{
    position: absolute;
    right: 0px;
    top: -60px;
    padding: 5px;
}
</style>

