<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场"  min-width="120"></el-table-column>
                    <el-table-column prop="date" label="更改日期"  min-width="90"></el-table-column>
                    <el-table-column prop="total" label="总数"  min-width="90"></el-table-column>
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
            return {
                shade:false,
                updateVisible:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{station:'',status:''},
                tableData:[]
             }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnUndo:function(){
                this.search = {station:''};
                this.pagination.page=1;
                this.pagination.pagesize=20;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = "/contract/changePlateList?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(this.search.station) url += "&station_id=" + this.search.station;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined'&&res.code == 0)?res.content.lists:[];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                })
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
        },
    }
</script>
<style>

    .el-checkbox{
        margin-left: 10px;
    }
    .el-checkbox+.el-checkbox{
        margin-left: 10px;
    }
</style>
