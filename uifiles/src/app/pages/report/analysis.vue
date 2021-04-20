
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model.trim="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-date-picker v-model="search.begintime" size="small" type="datetime" placeholder="申请时间"></el-date-picker>
                    <el-date-picker v-model="search.endtime" size="small" type="datetime" placeholder="申请时间"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo"  size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" width="45"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" width="180"></el-table-column>
                    <el-table-column prop="count" label="申请总数" width="90">
                    </el-table-column>
                    <el-table-column prop="total_state" label="已审批数" width="110">
                    </el-table-column>
                    <el-table-column prop="state_rate" label="审批率" width="110"></el-table-column>
                    <el-table-column prop="unstateCount" label="未审批数" width="110">
                    </el-table-column>
                    <el-table-column prop="unstate_rate" label="未审批率" width="110">
                    </el-table-column>
                    <el-table-column prop="avarage_time" label="平均处理时间(h)" width="110"></el-table-column>
                    <el-table-column prop="overNight" label="超过8小时处理数" width="150">
                    </el-table-column>
                    <el-table-column prop="overFour" label="超过24小时未处理数" min-width="150">
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- <div class="pagination">
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="pagination.page"
                    :page-sizes="[20,50,100]"
                    :page-size="pagination.pagesize"
                    :total="pagination.total"
                    layout="total,sizes,prev,pager,next,jumper">
                </el-pagination>
            </div> -->
        </div>
    </div>

</template>


<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                search:{station:'',dept:'',begintime:'',endtime:''},
                pagination:{ page: 1, pagesize: 20, total: 0, showTotal: true },
                tableData:[]      }
        },
        methods:{
            setPageData: function (pageObj) {
                this.pagination = pageObj;
                this.getData();
            },
            getData:function(){
                var vm = this;
                vm.shade = true;
                var url = '/examine/applyAnalysis?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize;
                if( vm.search.station ) url += "&station_id="+vm.search.station;
                if(vm.search.dept) url += "&dept="+vm.search.dept;
                if(vm.search.begintime){
                    url += "&begintime=" + utils.timeParse(vm.search.begintime,'-',false);
                }
                if(vm.search.endtime){
                    url += "&endtime=" + utils.timeParse(vm.search.endtime,'-',false);
                }
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    vm.shade = false;
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
                this.search = {station:'',car:'',state:'',type:'',dept:''};
                this.getData();
            },
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.getData();
            });
        },
    }

</script>
