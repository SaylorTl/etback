<template>
     <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station" size="small" class="cell" width="140px" placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.etcode" size="small" class="cell widthX120"  placeholder="易停编码"></el-input>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.username" size="small" class="cell widthX120"  placeholder="姓名"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column min-width="60" type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" label-width='150' inline class="demo-table-expand">
                                <el-form-item label="开始时间"><span>{{props.row.time_begin}}</span></el-form-item>
                                <el-form-item label="结束时间"><span>{{props.row.time_end}}</span></el-form-item>
                                <el-form-item label="创建时间"><span>{{props.row.creationtime}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" min-width="60"></el-table-column>
                    <el-table-column  label="大区/事业部" min-width="200">
                        <template slot-scope="scope">{{scope.row.area_name}}/{{scope.row.dept_name}}</template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="150"></el-table-column>
                     <el-table-column prop="lock_name" label="车位锁名称" min-width="100"></el-table-column>
                    <el-table-column prop="etcode" label="易停编码" min-width="100"></el-table-column>
                    <el-table-column  label="开锁人及手机号" min-width="170">
                        <template slot-scope="scope">{{scope.row.open_username}}/{{scope.row.open_phone}}</template>
                    </el-table-column>
                    <el-table-column  label="关锁人及手机号" min-width="170">
                        <template slot-scope="scope">{{scope.row.close_username}}/{{scope.row.close_phone}}</template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
     </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data:function(){
        return{
            statusmap:{"open":"打开","close":"关闭"},
            search:{dept:'',station:'',username:'',mobile:'',etcode:''},
            shade:false,
            tableData:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true}
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
            this.search = {dept:'',station:'',username:'',mobile:'',etcode:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = "/lock/recordLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            if(vm.search.station) url += "&station_id=" + vm.search.station;
            if(vm.search.mobile) url += "&mobile=" + vm.search.mobile;
            if(vm.search.username) url += "&username=" + vm.search.username;
            if(vm.search.dept ) url += "&dept="+vm.search.dept;
            if(vm.search.etcode ) url += "&etcode="+vm.search.etcode;
            utils.fetch(url).then(function(res){
                if(res.code == 0 && typeof(res.content)!='undefined'){
                    vm.tableData = res.content.lists
                    vm.pagination.total = res.content.total || 0;
                    vm.shade=false;
                    utils.setCache(vm);
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }    
            })
        },
        
    }
}
</script>