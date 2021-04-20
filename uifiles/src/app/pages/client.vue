
<template>
    <div id='box' class="menu-hide">
        <div class="worker client">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.openid" size="small" class="cell widthX250" placeholder="微信openid"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-refresh"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <!-- <el-form-item label="用户ID:"><span>{{ props.row.id }}</span></el-form-item> -->
                                <el-form-item label="性别:"><span>{{ getSex(props.row.sex) }}</span></el-form-item>
                                <el-form-item label="房号:"><span>{{ props.row.room_name }}</span></el-form-item>
                                <!-- <el-form-item label="停车场:"><span>{{ props.row.station_id }}</span></el-form-item> -->
                                <el-form-item label="楼栋号:"><span>{{ props.row.unit_name }}</span></el-form-item>
                                <el-form-item label="住址:"><span>{{ props.row.address }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index"  width="40"></el-table-column>
                    <el-table-column prop="id" label="用户ID"  min-width="110"></el-table-column>
                    <el-table-column prop="name" label="名称"  min-width="180"></el-table-column>
                    <el-table-column prop="mobile" label="手机号"  width="120"></el-table-column>
                    <el-table-column prop="openid" label="微信openid"  width="280"></el-table-column>
                    <el-table-column prop="creationtime" label="分配时间"  width="140"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间"  min-width="140"></el-table-column>
                    <el-table-column label="操作" fixed="right"  width="130">
                        <template slot-scope="scope">
                            <el-button @click='updataClick(scope.row)' plain size="mini">修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="edit.title" width='60%' :visible.sync="edit.show">
                <el-form :model="edit.data" label-width="110px">
                    <el-form-item label="用户名:">
                         <el-input v-model="edit.data.name" placeholder="用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="性别:">
                         <el-select v-model="edit.data.sex" size="small" class="widthP100" placeholder="性别">
                            <el-option v-for="item in sexData" :key="item.value" :value="item.value" :label="item.name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="地址:" >
                        <el-input v-model="edit.data.address" placeholder="地址"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号:">
                        <el-input v-model="edit.data.mobile" placeholder="手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="身份证号:">
                        <el-input v-model="edit.data.govid" placeholder="身份证号"></el-input>
                    </el-form-item>
                    <el-form-item label="房号:">
                        <el-input v-model="edit.data.room" placeholder="房号"></el-input>
                    </el-form-item>
                    <el-form-item label="楼栋号:">
                         <el-input v-model="edit.data.unit" placeholder="楼栋号"></el-input>
                    </el-form-item>
                    <el-form-item label="停车场:">
                         <my-select-station v-model="edit.data.station" size="small" class="cell" width='100%' placeholder="停车场" style='top:0'></my-select-station>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitOk" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                search:{phone:'',openid:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                sexData:[{name:'男',value:'M'},{name:'女',value:'F'},{name:'未知',value:'X'}],
                edit:{title:'',show:false,data:{name:'',sex:'',address:'',govid:'',room:'',unit:'',station:''}},
            };
        },
        computed:{

        },
        methods:{
            getSex:function(str){
               var val = this.sexData.find(function(item){
                    return item.value == str;
                })
                return val.name;
            },
            submitOk:function(){
                var vm = this,postData={};
                var url = '/client/add';
                if(vm.edit.data.name == ''){
                    vm.$message({ showClose:true, message:'用户名不能为空', type:'error' }); return;
                }
                if(vm.edit.data.mobile == ''){
                    vm.$message({ showClose:true, message:'手机号不能为空', type:'error' }); return;
                }
                if(vm.edit.data.room != '' && vm.edit.data.station ==''){
                    vm.$message({ showClose:true, message:'停车场不能为空', type:'error' }); return;
                }
                postData = {address: vm.edit.data.address,
                            govid  :vm.edit.data.govid,
                            mobile  :vm.edit.data.mobile,
                            isAdd : vm.edit.action,
                            name : vm.edit.data.name,
                            room : vm.edit.data.room,
                            sex : vm.edit.data.sex,
                            unit:vm.edit.data.unit,
                            station_id:vm.edit.data.station || 0,
                        };
                if('edit'==vm.edit.action){postData.client_id = vm.edit.data.client}
               utils.fetch(url,{ method:'POST',body:postData}).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                    vm.edit.show = false;
                });

            },
            addClick:function(){
                this.edit.show = true;
                this.edit.title = '添加会员信息';
                this.edit.data = {name:'',sex:'M',address:'',govid:'',room:'',unit:''}
                this.edit.action='add';
            },
            updataClick:function(row){
                this.edit.show = true;
                this.edit.title = '修改会员信息';
                this.edit.action='edit';
                this.edit.data={name:row.name,sex:row.sex,address:row.address,govid:row.govid,room:row.room_name,unit:row.unit_name,mobile:row.mobile,client:row.id}
            },
            getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.phone != '') dat += "&phone="+this.search.phone;
                if(this.search.openid != '') dat += "&openid="+this.search.openid;
                var url = '/client/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            handleSizeChange:function(val){
                this.pagination.page = 1;
                this.pagination.pagesize = val;
                this.getData();
            },
            handleCurrentChange:function(val) {
                this.pagination.page = val;
                this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {phone:'',openid:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                var data = utils.getCache();
                var obj = data == '' ? {} : JSON.parse(data);
                if(obj.tableData && obj.tableData.length > 0){
                    utils.getCacheItem(vm,obj);
                }else{
                    vm.getData();
                }
            });
        }
    }
</script>
