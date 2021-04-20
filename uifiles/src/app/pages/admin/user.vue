
<template>

    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-input v-model="search.oa"  size="small" class="cell widthX100" placeholder="oa账号"></el-input>
                    <el-input v-model="search.username"  size="small" class="cell widthX100" placeholder="私有账号"></el-input>
                    <el-input v-model="search.phone"  size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-select v-model="search.role" filterable clearable size="small" class="cell widthX100" placeholder="角色">
                        <el-option v-for="k in roles" :key="k.id" :label="k.name" :value="k.id"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="所属停车场:">
                                    <span v-if="props.row.station_type == '2'" class="red">（仅包含）</span>
                                    <span v-if="props.row.station_type == '3'" class="red">（不包含）</span>
                                    <span v-if="props.row.station_type == '1'" class="red">（所有）</span>
                                    <span v-if="props.row.station_type != '1'">{{props.row.station_name}}</span>
                                </el-form-item>
                                <el-form-item label="大区事业部:">
                                    <span>{{props.row.dept_name}}</span>
                                </el-form-item>
                                <el-form-item label="二维码:">
                                <qrcode :value="'https://feedback.aparcar.cn/index/checkqrcode?token='+token+'&client='+props.row.id"></qrcode>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID" width="60"></el-table-column>
                    <el-table-column label="登陆类型" width="90">
                        <template slot-scope="scope">
                            <span>{{acount[scope.row.type]||''}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="oa" label="OA账号" width="120"></el-table-column>
                    <el-table-column prop="username" label="私有账号" width="100"></el-table-column>
                    <el-table-column prop="mobile" label="手机号" width="90"></el-table-column>
                    <el-table-column prop="fullname" label="全名" min-width="100"></el-table-column>
                    <el-table-column prop="email" label="email" min-width="150"></el-table-column>
                    <el-table-column prop="role_name" label="角色" width="90"></el-table-column>
                    <el-table-column prop="is_lock" label="是否禁用" width="70">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.is_lock == '1'" type="danger">是</el-tag>
                            <el-tag v-else type="primary">否</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="last_login_time" label="上次登录时间" width="130"></el-table-column>
                    <el-table-column label="操作" fixed="right" width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                            <el-button @click="delClick(scope.$index,scope.row)" plain size="mini" ><i class="fa fa-trash-o"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="userform" label-width="120px">
                    <el-form-item v-if="userform.id == 0" label="账号:">
                        <el-input v-if="userform.type==1" v-model="userform.oa" placeholder="请输入您的oa账号"></el-input>
                        <el-input  v-else-if="userform.type==2" v-model="userform.username" placeholder="请输入您的私有账号"></el-input> 
                       
                    </el-form-item>
                    <el-form-item v-if="userform.id == 0 && userform.type==2" label="用户名:">
                        <el-input v-model="userform.fullname" placeholder="请输入您的用户名"></el-input>
                    </el-form-item>
                    <el-form-item v-if="userform.id > 0 || userform.type==2" label="手机号:">
                        <el-input v-model="userform.phone" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item  v-if="userform.type==2 && userform.id==0" label="密码:">
                        <el-input v-model="userform.password" type="text" placeholder="6位以上数字或字母组合账号密码"></el-input>
                    </el-form-item>
                    <el-form-item v-if="userform.id==0" label="账号类型:" >
                    <el-radio-group v-model="userform.type">
                        <el-radio :label="'1'">oa账号</el-radio>
                        <el-radio :label="'2'">私有账号</el-radio>
                    </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="userform.id > 0" label="邮箱:">
                        <el-input v-model="userform.email" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                    <el-form-item label="角色:">
                        <el-select v-model="userform.role_id" @clear="roleClear" filterable clearable placeholder="请选择角色">
                            <el-option v-for="k in roles" :key="k.id" :label="k.name" :value="k.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="事业部:">
                        <el-input type="textarea" v-model="departmentStr" :rows="2" @focus="showTree('department')" readonly placeholder="请选择事业部"></el-input>
                        <my-tree-department :show="department.show" v-model="department.value" @clear="clearTree('department')" @close="closeTree('department')"  :level="2"></my-tree-department>
                    </el-form-item> 
                    <el-form-item label="停车场:">
                        <el-radio-group v-model="userform.station_type">
                            <el-radio v-for="(val,key) in stationTypeMap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                        <div>
                            <el-input type="textarea" v-model="stationStr" :rows="2" @focus="showTree('stations')" readonly placeholder="当选择 “所有” 时,可以为空"></el-input>
                            <my-tree-department :show="stations.show" v-model="stations.value" @clear="clearTree('stations')" @close="closeTree('stations')" :level="3"></my-tree-department>
                        </div>
                    </el-form-item>

                    <el-form-item label="萤石设备:">
                        <div>
                            <el-input type="textarea" v-model="ysDeviceStr" :rows="2" @focus="showTree('ysDevice')" readonly placeholder="请选择萤石设备"></el-input>
                            <my-tree-ysdevice :show="ysDevice.show" v-model="ysDevice.value" @clear="clearTree('ysDevice')" @close="closeTree('ysDevice')"></my-tree-ysdevice>
                        </div>
                    </el-form-item>

                    <el-form-item label="是否禁用:">
                        <el-switch v-model="userform.lock"></el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitUser" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                acount:{'1':'oa账号登陆','2':'私有账号登陆','3':'手机验证码登陆'},
                stationTypeMap:{'1':'所有','2':'仅包含','3':'不包含'},
                shade:false,
                updateVisible:false,
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{oa:'',username:'',role:'',phone:'',station:''},
                roles:[],
                userform:{id:0,oa:'',username:'',type:'',role_id:'',phone:'',email:'',station_type:'',lock:'',password:'',fullname:''},
                department:{show:false,value:[]},
                stations:{show:false,value:[]},
                ysDevice:{show:false,value:[]},
                token:'',
            }
        },
        computed:{
            departmentStr:function(){
                var data = this.departmentUnique();
                return this.concatResult(data,'name');
            },
            departmentVal:function(){
                var data = this.departmentUnique();
                return this.concatResult(data,'value');
            },
            stationStr:function(){
                var data = this.stationUnique();
                return this.concatResult(data,'name');
            },
            stationVal:function(){
                var data = this.stationUnique();
                return this.concatResult(data,'value');
            },
            ysDeviceStr:function(){
                var data = this.ysDeviceUnique();
                return this.concatResult(data,'name');
            },
            ysDeviceVal:function(){
                var data = this.ysDeviceUnique();
                return this.concatResult(data,'value');
            },
        },
        mounted:function(){
            var vm=this;
            vm.token = vm.token || window.localStorage.getItem('access_token');
        }, 

        methods:{
            concatResult:function(data,val){
                return data.map(i=>i[val]).join(',');
            },
            showTree:function(val){
                this.closeAllTree();
                this[val].show = true;
            },
            closeTree:function(val){
                this[val].show = false;
            },
            clearTree:function(val){
                this[val].value = '';
            },
            closeAllTree:function(){
                this.department.show = false;
                this.stations.show = false;
                this.ysDevice.show = false;
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            getData:function(){
                var vm = this;
                var url = "/user/lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {role:role_id,...searchs} = vm.search;
                let searchmap = {role_id,...searchs}
                let querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {oa:'',role:'',phone:'',station:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            delClick:function(index,row){
                var vm = this;
                var name = ""
                if(parseInt(row.type) == 1){
                    name = "OA账号:"+row.oa;
                }else if(parseInt(row.type) == 2){
                    name = "用户名:"+row.username;
                }
                this.$msgbox({ title:'提示', message:'您确定要删除 “' + name + '”',
                    showCancelButton:true,
                    confirmButtonText:'确定',
                    cancelButtonText:'取消',
                    type:'warning',
                    beforeClose:function(action, instance, done){
                        if(action === 'confirm'){
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '正在删除...';
                            vm.del_user(index,row);
                            instance.confirmButtonLoading = false;
                            done();
                        } else {
                            done();
                        }
                    }
                });
            },
            del_user:function(index,row){
                var vm = this;
                utils.fetch("/user/delete?id="+row.id,{ method:'get' }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            addClick:function(){
                this.userform = {id:0,oa:'',type:'1',role_id:'',phone:'',email:'',station_type:'',lock:false,password:'',fullname:'',username:''};
                this.updateVisible = true;
                this.updateTitle = "用户添加";
                this.department = {show:false,value:[]};
                this.stations = {show:false,value:[]};
                this.ysDevice = {show:false,value:[]};
            },
            updateClick:function(index,row){
                var vm = this;
                this.department = {show:false,value:[]};
                this.stations = {show:false,value:[]};
                this.ysDevice = {show:false,value:[]};

                let {id,oa,username,password,fullname,type,role_id,email,station_type,mobile:phone} = row;
                this.userform = {phone,id,oa,username,password,fullname,type,role_id,email,station_type,lock:row.is_lock == '1'};
                if(row.dept){
                    this.getRowDepartment(row.dept).then(function(data){
                        if(typeof(data) != 'undefined'){
                            vm.department.value = data
                        };
                    });
                }
                if(row.stations){
                    this.getRowStation(row.stations).then(function(data){
                        if(typeof(data) != 'undefined'){
                           vm.stations.value =  data.map(item=>{
                                return {name:item.name,value:utils.config.ID_PREFIX+item.value - 0,level:item.level}
                            })//加前缀，编辑时勾选状态 
                        }
                    });
                }
                if(row.ysDevice){
                    this.getRowDevice(row.ysDevice).then(function(data){
                        if(typeof(data) != 'undefined'){
                            vm.ysDevice.value =  data;//加前缀，编辑时勾选状态
                        }
                    });
                }
                this.updateVisible = true;
                var name = row.oa;
                if( row.type == 2 ) name = row.username;
                if( row.type == 3 ) name = row.mobile;
                this.updateTitle = row.fullname + " (" + name + ") 用户修改";
            },
            submitUser:function(){
                var vm = this; var url = "";
                let info = vm.userform;
                let reduceIdsPrefix = vm.stationVal.split(',').map(item=>(item+'').replace(utils.config.ID_PREFIX,'')).join(',');// stationVal 要去掉前缀
                let {role_id,station_type,type,password,fullname,phone } = info;
                let data = {
                    role_id,station_type,type,password,fullname,phone,
                    is_lock:info.lock?1:0,
                    dept:vm.departmentVal,
                    stations:reduceIdsPrefix,
                    ysDevice: vm.ysDeviceVal,
                }
                if(info.type=='2'&&info.password == ''){
                    vm.$message({ showClose:true, message:'您的密码不能为空', type:'error' });return;
                }
                if(info.id == 0){
                    url = "/user/add";
                    if(info.type == '1'){
                        data.oa = info.oa;
                    }else if(info.type == '2'){
                        data.username = info.username;
                    }
                }else{
                    url = "/user/update&id="+info.id;
                    data.mobile = info.phone;
                    data.email = info.email;
                }
                utils.fetch(url,{ method:'post',body:data }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                            vm.updateVisible = false;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            getRoles:function(){
                var vm = this;
                utils.fetch("/role/lists").then(function(json){
                    vm.roles = (typeof(json) != 'undefined' && json.code == 0) ? json.content : [];
                });
            },
            roleClear:function(){
                this.userform.role_id = '';
            },
            getRowDepartment:function(str){
                return utils.fetch("/department/lists?dep_ids="+str).then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        var data = [];
                        if(json.content){
                            data = json.content.map(function(k){
                                return {value:k.id,name:k.name,level:k.level,pid:k.parent};
                            });
                        }
                        return data;
                    }
                });
            },
            getRowStation:function(str){
                return utils.fetch("/station/lists?station_ids="+str+"&page=0&pagesize=0").then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        var data = [];
                        if(json.content){
                            data = json.content.lists.map(function(k){
                                return {value:k.id,name:k.name,level:3};
                            });
                        }
                        return data;
                    }
                });
            },

            getRowDevice:function(str){
                return utils.fetch("/device/lists?extcode="+str+"&page=0&pagesize=0").then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        var data = [];
                        if(json.content){
                            data = json.content.lists.map(function(k){
                                return {value:k.extcode,name:k.name,level:4,pid:k.station};
                            });
                        }
                        return data;
                    }
                });
            },

            departmentUnique:function(){
                var data = [];
                var lists = this.department.value;
                var level0 = []; var level1 = []; var temp = [];
                if(lists.length > 0){
                    for(var i in lists){
                        if(lists[i].level == 0){
                            data.push({value:lists[i].value,name:lists[i].name});
                            level0.push(lists[i].value);
                            temp.push(lists[i].value);
                        }else if(lists[i].level == 1){
                            if(typeof(lists[i].pid) != 'undefined' && utils.in_array(lists[i].pid,level0) == false){
                                data.push({value:lists[i].value,name:lists[i].name});
                                level1.push(lists[i].value);
                            }
                            if(typeof(lists[i].pid) != 'undefined' && utils.in_array(lists[i].pid,temp)){
                                temp.push(lists[i].value);
                            }
                        }else if(lists[i].level == 2){
                            if(typeof(lists[i].pid) != 'undefined' && utils.in_array(lists[i].pid,level1) == false && utils.in_array(lists[i].pid,temp) == false){
                                data.push({value:lists[i].value,name:lists[i].name});
                            }
                        }
                    }
                }
                return data;
            },
            stationUnique:function(){
                var data = [];
                var lists = this.stations.value;
                if(lists.length > 0){
                    for(var i in lists){
                        if(lists[i].level == 3){
                            data.push({value:lists[i].value,name:lists[i].name});
                        }
                    }
                }
                return data;
            },
            ysDeviceUnique:function(){
                var data = [];
                var lists = this.ysDevice.value;
                if(lists.length > 0){
                    for(var i in lists){
                        if(lists[i].level == 4){
                            data.push({value:lists[i].pid+':'+lists[i].value,name:lists[i].name});
                        }
                    }
                }
                return data;
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                vm.getRoles();
                var data = utils.getCache();
                var obj = data == '' ? {} : JSON.parse(data);
                if(obj.tableData && obj.tableData.length > 0){
                    utils.getCacheItem(vm,obj);
                }else{
                    vm.getData();
                }
            });
        },
    }

</script>
