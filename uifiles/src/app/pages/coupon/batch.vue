
<template>
    <div id="box"  class="menu-hide">
        <div class="worker station">
                 <div class='condition clearfix box-width'>
                    <div class="left">
                        <el-select v-model="search.status" size="small" class="cell widthX100"   placeholder="状态">
                            <el-option label="未领取" value=0></el-option>
                            <el-option label="已过期" value=4></el-option>
                            <el-option label="已领取" value=1></el-option>
                            <el-option label="已使用" value=2></el-option>
                            <el-option label="已失效" value=3></el-option>
                        </el-select>
                        <el-input v-model="search.batch" size="small" class="cell widthX120"  placeholder="批次号"></el-input>
                        <el-input v-model="search.plate" size="small" class="cell widthX120"  placeholder="车牌"></el-input>
                        <el-input v-model="search.cnum" size="small" class="cell widthX200"  placeholder="编码"></el-input>
                        <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                        <el-button @click='btnUndo' size="small"><i class="fa fa-undo"></i>重置</el-button>
                    </div>
                 </div>
                    <div class='table box-width'>
                       <el-table :data="tableData" border style="width: 100%" v-loading="shade">
                            <el-table-column label="#" prop='id' width='65'></el-table-column>
                            <el-table-column label="商家" prop='merchant_name'></el-table-column>
                            <el-table-column label="批次" prop='batch' width='50'></el-table-column>
                            <el-table-column label="编码" prop='cnum' width="250"></el-table-column>
                            <el-table-column label="优惠类型" prop='type_name' width='120'></el-table-column>
                            <el-table-column label="开始日期" prop='start_time' width='75'></el-table-column>
                            <el-table-column label="结束日期" prop='end_time' width='75'></el-table-column>
                            <el-table-column label="领取时间" prop='assign_time' width='185'></el-table-column>
                            <el-table-column label="车牌" prop='plate' width='75'></el-table-column>
                            <el-table-column label="使用时间" prop='use_time' width='185'></el-table-column>
                            <el-table-column label="分发人" prop='distributor' width='80'></el-table-column>
                            <el-table-column prop="status_name" label="状态" width="60"></el-table-column>
                            <el-table-column label="优惠面值" prop='price' width="55"></el-table-column>
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
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="pagination.total">
                    </el-pagination>
                    </div> -->

        </div>
    </div>
</template>
<script>
import store from '../../store/store.js';
import utils from '../../../utils/utils.js';
export default  {
    data:function() {
        return {
            shade:false,
            pagination:{ page: 1, pagesize: 20, total: 0, showTotal: true },
            editInfo:{num:'',end_time:'',start_time:'',type:'',name:'',merchant_id:''},
            search:{status:'',batch:'',cnum:'',plate:""},
            tableData:[],
            typeData:[],
            merchantData:[]
        }
    },
    watch:{
        '$route':function(to, from) {
            if(to.fullPath != from.fullPath){
                this.pagination.page = 1;
                this.search.batch=this.$route.query.batch;
                this.getData();
            }
        }
    },
    created() {},
    mounted:function(){
        this.search.batch=this.$route.query.batch;
    },
    methods:{
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var param = utils.setQueryString({
                    page:vm.pagination.page,
                    pagesize:vm.pagination.pagesize,
                    status:vm.search.status,
                    batch:vm.search.batch,
                    cnum:vm.search.cnum,
                    plate:vm.search.plate
            })
            // vm.search.batch = vm.$router.currentRoute.query.merchant_id;
            var url = "/coupon/lists?"+param;
            // if(vm.search.status) url += "&status=" + vm.search.status;
            utils.fetch(url).then(function(res){
                vm.shade=false;
                if(res && res.content){
                    vm.tableData = res.content.lists||[];
                    vm.pagination.total = res.content.total||0;
                    utils.setCache(vm);
                }else {
                    vm.tableData = [];
                    vm.pagination.total = 0;
                }
            })
        },
        //改变页数的时候数据变
        handleSizeChange:function(val){
            this.pagination.page = 1;
            this.pagination.pagesize = val;
            this.getData();
        },
        handleCurrentChange:function(val){
            this.pagination.page = val;
            this.getData();
        },
        //重置按钮
        btnUndo:function(){
            this.search={};
            this.pagination.page = 1;
            this.getData();
        },
        //查找
        btnSearch:function(){
            this.pagination.page = 1;
            this.getData();
        }
    },
    beforeRouteEnter:function(to, from, next){
        next(function(vm){
            utils.getTingYunScript();
            var data = utils.getCache();
            var obj = data == '' ? {} : JSON.parse(data);
            if(obj.tableData && obj.tableData.length > 0){
                utils.getCacheItem(vm,obj);
            }else{
                vm.search.batch=vm.$route.query.batch;
                vm.getData();
            }
        });
    }
}
</script>
