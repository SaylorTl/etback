
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell" width="200px" placeholder="选择停车场查询数据"></my-select-station>
                    <el-input v-model.trim="search.min_doc_count" size="small" class="cell widthX200"  placeholder="最小进出场次数默认为2" type='number' clearable></el-input>
                    <el-input v-model.trim="search.size" size="small" class="cell widthX120"  placeholder="数据条数" type='number' clearable></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
             
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" min-width="55"></el-table-column>
                    <!-- <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column> -->
                    <el-table-column prop="plate" label="车牌" min-width="120"></el-table-column>
                     
                    <el-table-column prop="doc_count" label="进出场次数"  min-width="130"></el-table-column>
                    
                </el-table>
            </div>
            
        </div>
    </div>

</template>

<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                search:{station:'',min_doc_count:'',size:100},
                tableData:[],
                url:{lists:'/elasticsearch/inoutCount'}
            }
        },
        methods:{
            getData:function(){
                var vm = this;
                var url = vm.url.lists+'?month=N&page=1';
                var {...searchs} = vm.search;
                var querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content : [];
                    utils.setCache(vm);
                    vm.shade = false;
                });
            },
           
            btnSearch:function(){
                this.getData();
            },
            btnUndo:function(){
                this.search = {station:'',min_doc_count:'',size:''};
                this.getData();
            },
            
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
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
