
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.plate" size="small" class="cell widthX120"  placeholder="车牌"></el-input>
                    <el-input v-model.trim="search.czy_order" size="small" class="cell widthX300" placeholder="订单号"></el-input>
                    <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态">
                        <el-option v-for="(k,v) in cfg.statustype" :label="k" :value="v" :key="v"></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                <el-input v-model.trim="search.tollunitid" size="small" class="cell widthX150"  placeholder="楼栋号"></el-input>
                <el-date-picker v-model="search.datetimerange" size="small" type="datetimerange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期"
      end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <!-- <el-form-item label="大区/事业部">
                                    <span>{{props.row.area_name}}/{{props.row.dept_name}}</span>
                                </el-form-item> -->
                                <el-form-item label="小区UUID:"><span>{{ props.row.sregion_uuid }}</span></el-form-item>
                                <el-form-item label="楼栋号:"><span>{{ props.row.tollunitid }}</span></el-form-item>
                                <el-form-item label="购买时间段:"><span>{{ props.row.time_slot }}</span></el-form-item>
                                <el-form-item label="返回信息:">
                                    <span>{{ props.row.message }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="大区/事业部" min-width="120">
                        <template slot-scope="props">{{props.row.area_name}}/{{props.row.dept_name}}</template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌"  min-width="75"></el-table-column>
                    <el-table-column prop="czy_order" label="订单号" min-width="120"></el-table-column>
                    <el-table-column prop="pay_val" label="支付金额" min-width="60"></el-table-column>
                    <el-table-column prop="status" label="下发状态"  width="80">
                        <template slot-scope="props">
                            <span :class="{'red':(props.row.status=='0'),'green':(props.row.status=='1')}">{{cfg.statustype[props.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="charge_date" label="支付时间" width="140" ></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    import moment from 'moment';
    export default {
        data:function(){
            let cfg = {
                sourcetype:utils.config.payMethod,
                statustype:{'0':'失败','1':'成功'}
            }
            let url = {lists:'/message/chargelists'};
            return {
                cfg,url,
                shade:false,
                search_more:false,
                search:{station_id:'',dept:'',plate:'',status:'',czy_order:'',datetimerange:'',tollunitid:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[]
            }
        },
        methods:{
            getData:function(){
                var vm = this;
                var url = vm.url.lists+'?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize;
                let {datetimerange,...other}=vm.search;
                if(vm.search.datetimerange && vm.search.datetimerange.length===2){
                    let [begin,end] = vm.search.datetimerange;
                    if( begin == end ){
                        vm.$message({ showClose:true, message:'开始时间和结束时间不能一样', type:'error' }); return ;
                    }
                    other.begin_time = begin;
                    other.end_time = end;
                }else{
                    other.begin_time = '';
                    other.end_time = '';
                }
                var querystr = utils.setQueryString(other);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    vm.shade = false;
                    utils.setCache(vm);
                });
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search_more = false;
                this.search = {station_id:'',dept:'',plate:'',status:'',czy_order:'',datetimerange:'',tollunitid:''};
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            sendMessage:function(row){
                var vm = this;
                utils.fetch('/order/notify?tnum='+row.tnum).then(function(res){
                    if(res.code==0){
                        vm.$message({message:res.message,type:'success'})
                    }else{
                        vm.$message({message:res.message,type:'error'})
                    }
                })
            },
            exportFile: function() {
                var vm = this.search;
                var that = this;
                var obj = {
                    station_id: vm.station_id,
                    dept: vm.dept,
                    plate: vm.plate,
                    status: vm.status,
                    czy_order: vm.czy_order,
                    datetimerange: vm.datetimerange,
                    tollunitid: vm.tollunitid
                    };
                var param = utils.setQueryString(obj);
                var filename = moment().format("YYYYMMDD") + "银行代扣订单.csv";
                utils.rpc.loadfile("/message/export?" + param, null, filename).then(function(data) {
                    console.log('message/export',data)
                if (data.code != 0) {
                    that.$message({
                    message: "超过导出最大数据量30000条，请筛选条件后再导出！",
                    type: "error"
                    });
                return;
                }
                });
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
                    vm.getData();
                }
            });
        },
    }

</script>
