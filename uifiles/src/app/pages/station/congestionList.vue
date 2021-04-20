<template>
    <div id="box" class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station> 
                    <el-date-picker v-model="search.date" size="small" type="date" placeholder="选择日期" value-format="yyyyMMdd"></el-date-picker>  
                    <el-select v-model="search.asc" placeholder="排列" size="small">
                        <el-option label="正序" value="1" selected>
                        </el-option>
                        <el-option label="倒序" value="">
                        </el-option>
                    </el-select>                 
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%;">
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="station_name" label="停车场"></el-table-column>
                    <el-table-column prop="device_name" label="道闸"></el-table-column>
                    <el-table-column label="时间">
                        <template slot-scope="scope">
                            <span>{{strToDate(scope.row.time)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="拥堵指数">
                        <template slot-scope="scope">
                            <span>{{scope.row.congestion+'%'}}</span>
                        </template>
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
    data() {
        return {
            tableData:[],
            shade:false,
            search:{station:'',date:'',asc:""},
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
        }
    },
    methods: {
        getData:function(){
            var vm = this;
            var data = utils.setQueryString({
                station:vm.search.station,
                time:vm.search.date,
                asc:vm.search.asc,
            })
            utils.fetch('/station/congestionList?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize+'&'+data).then(function(res){
                if(res.code == 0 && typeof(res.content)!='undefined'){
                    vm.shade = false;
                    vm.tableData = res.content
                    vm.pagination.total = res.content.total;
                }else{
                    vm.shade = false;
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        strToDate: function (str) {
            var arr = [];
            arr[0] = str.substr(0, 4);
            arr[1] = str.substr(4, 2);
            arr[2] = str.substr(6, 2);
            arr[3]= str.substr(8, 2);
            arr[4] = str.substr(10, 2);
            arr[5]= str.substr(12, 2);
            arr.forEach(function(item,index){
                if(arr[index]===''){
                    arr[index]="00"
                }
            })
            return arr[0] + "-" + arr[1] + "-" + arr[2] + " " + arr[3] + ":" + arr[4] + ":" + arr[5];
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = {};
            this.getData();
        },
        setPageData:function(pageObj){
            this.pagination = pageObj;
            this.getData();
        },
    },
    mounted:function(){
        var vm = this;
        // console.log(utils)
        vm.getData();
    }
}
</script>
<style scoped>
   
</style>

