<template>
     <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150 mr5"  placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.status" placeholder="状态" size ="small"  class="widthX120" >
                        <el-option v-for="(val,key) in statusmap" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-button @click="btnMore"  size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                    <el-input v-model="search.mobile" size="small" class="cell widthX150"  placeholder="电话"></el-input>
                    <el-input v-model="search.etcode" size="small" class="cell widthX150"  placeholder="易停编码"></el-input>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column  label="大区/事业部" min-width="180">
                        <template slot-scope="scope">{{scope.row.area_name}}/{{scope.row.dept_name}}</template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column> 
                    <el-table-column prop="plate" label="授权车牌号" width="80"></el-table-column>
                    <el-table-column prop="etcode" label="易停编码" width="90"></el-table-column>
                    <el-table-column prop="lock_name" label="车位锁名称" min-width="110"></el-table-column>
                    <el-table-column prop="" label="产权人" min-width="110">
                         <template slot-scope="scope">{{scope.row.owner_name}}/{{scope.row.owner_phone}}</template>
                    </el-table-column>
                    <el-table-column prop="phone" label="共享人" min-width="110">
                         <template slot-scope="scope">{{scope.row.user_name}}/{{scope.row.user_phone}}</template>
                    </el-table-column>
                    <el-table-column label="状态" width="50">
                        <template slot-scope="scope" >
                            <span :class="[{'red':scope.row.status==='N'},{'green':scope.row.status==='Y'}]">{{statusmap[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                   <el-table-column prop="time_begin" label="授权开始时间" min-width="110"></el-table-column>
                   <el-table-column prop="time_end" label="授权结束时间" min-width="110"></el-table-column>
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
            statusmap:{"N":"禁止","Y":"启用"},
            search:{station:'',dept:'',car_id:'',mobile:'',status:'',etcode:''},
            shade:false,
            search_more:false,
            tableData:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
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
            this.search = {station:'',dept:'',car_id:'',mobile:'',status:'',etcode:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
        btnMore:function(){
            this.search_more = !this.search_more;
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = "/lock/authorizeLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;

            var searchQueryString={
                        "station_id":vm.search.station,
                        "mobile":vm.search.mobile,
                        "dept":vm.search.dept,      
                        "car_id":vm.search.car_id,      
                        "status":vm.search.status,       
                        "etcode":vm.search.etcode
                };
            var querystr = utils.setQueryString(searchQueryString);
            var connect = url.indexOf('?')>0?'&':'?';
            url+=querystr?connect+querystr:'';
            utils.fetch(url).then(function(res){
                if(res.code==0 && res.content!== undefined){
                    vm.tableData = res.content.lists;
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
                vm.shade=false;
            })
        },
        
    }
}
</script>
