<template>
     <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150 mr5" placeholder="停车场"></my-select-station>
                    <el-input v-model="search.mobile" size="small" class="cell widthX150"  placeholder="电话"></el-input>
                    <el-input v-model="search.etcode" size="small" class="cell widthX150"  placeholder="易停编码"></el-input>
                    <el-select v-model="search.disable" placeholder="状态" size ="small"  class="widthX120" >
                        <el-option label="禁止" value="N" ></el-option>
                        <el-option label="启用" value="Y" ></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="id" min-width="50"></el-table-column>
                    <el-table-column  label="大区/事业部" min-width="180">
                        <template slot-scope="scope">{{scope.row.area_name}}/{{scope.row.dept_name}}</template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="username" label="授权人" min-width="110"></el-table-column>
                    <el-table-column label="权限类型" min-width="80">
                        <template slot-scope="scope">{{authTypemap[scope.row.client_type]}}</template>
                    </el-table-column>
                    <el-table-column prop="phone" label="联系方式" min-width="110"></el-table-column>
                    <el-table-column prop="etcode" label="易停编码" min-width="120"></el-table-column>
                    <el-table-column label="状态" min-width="70">
                        <template slot-scope="scope" >
                            <span :class="[{'red':scope.row.disable==='N'},{'green':scope.row.disable==='Y'}]">{{disablemap[scope.row.disable]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作"  min-width="80">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible" width='40%'>
                <el-form label-width="120px" >
                    <el-form-item  label="权限类型:">
                            <el-select v-model="addData.client_name" placeholder="请选择" size="small" width='100%' :disabled="addData.client_name=='admin'">
                                <el-option  label="管理员" value="admin"></el-option>
                                <el-option  label="共享人" value="share"></el-option>
                                <el-option  label="产权人" value="owner"></el-option>
                            </el-select>
                    </el-form-item>
                    <el-form-item  label="状态:">
                            <el-radio  v-model="addData.radio" label="Y">启用状态</el-radio>
                            <el-radio  v-model="addData.radio" label="N">禁止状态</el-radio>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">生成</el-button>
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
        return{
            authTypemap:{'admin':'管理员','unknown':'未知','share':'共享人','owner':'产权人'},
            disablemap:{'N':'禁止','Y':'启用'},
            search:{station:'',dept:'',mobile:'',disable:'',etcode:''},
            shade:false,
            tableData:[],
            updateTitle:'',
            addVisible:false,
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            updateVisible:false,
            addData:{mobile:'',client_type:'',lock_id:'',client_name:'',old_client_type:'',radio:'',id:''}
        }
    },
    mounted:function(){
        let vm = this;
        var data = utils.getCache();
        var obj = data == '' ? {} : JSON.parse(data);
        if(obj.tableData && obj.tableData.length > 0){
            utils.getCacheItem(vm,obj);
        }else{
            vm.getData();
        }
    },
    methods: {
        setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
        btnSearch:function(){
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo:function(){
            this.search = {station:'',dept:'',mobile:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = "/lock/extraLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            if(vm.search.station) url += "&station_id=" + vm.search.station;
            if(vm.search.mobile) url += "&mobile=" + vm.search.mobile;
            if(vm.search.dept ) url += "&dept=" + vm.search.dept;
            if(vm.search.disable ) url += "&disable=" + vm.search.disable;
            if(vm.search.etcode ) url += "&etcode=" + vm.search.etcode;
            utils.fetch(url).then(function(res){
                if(res&& res.code==0){
                    vm.shade=false;
                    vm.tableData = res.content.lists;
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                    vm.shade=false;
                }
            })
        },
        editSubmit:function(){
            var vm = this;
            vm.updateVisible = true;
            var url = "/lock/extraUpdate"
            var addData = {
                mobile:vm.addData.mobile,
                id:vm.addData.id,
                lock_id:vm.addData.lock_id,
                client_type:vm.addData.client_name,
                old_client_type:vm.addData.old_client_type,
                disable:vm.addData.radio
            }
            utils.fetch(url,{ method:'post',body:addData}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0){
                        vm.updateVisible=false;
                        vm.getData();
                    }else{
                        vm.updateVisible=false;
                        vm.$message({ showClose:true, message:res.message, type:'error'});
                    }
                }
            });
        },
        updateClick:function(row){
            var vm = this;
            vm.updateVisible = true;
            vm.updateTitle = "编辑授权信息"
            vm.addData={mobile:row.phone,lock_id:row.lock,client_name:row.client_type,old_client_type:row.client_type,radio:row.disable,id:row.id};
        },
      
    }
}
</script>
