<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.plate" size="small" class="cell widthX120"  placeholder="车牌号"></el-input>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.third_tnum" size="small" class="cell widthX250"  placeholder="订单号"></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept" :hideDefault='true' type='2'></my-linkage-dept>
                <el-select v-model="search.status" size="small" class="cell widthX120"  placeholder="开闸状态" clearable>
                    <el-option label="成功" value="1"></el-option>
                    <el-option label="失败" value="0"></el-option>
                </el-select>
                <el-select v-model="search.sort_type" size="small" class="cell widthX150" placeholder="类型" clearable>
                    <el-option v-for="(v,k) in sortType" :label="v" :value="k" :key='k'></el-option>
                </el-select>
                <el-date-picker v-model="search.begintime" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.endtime" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%" show-summary :summary-method="getSummaries">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="用户:">
                                    <span>{{props.row.mobile}}</span>
                                </el-form-item>
                                <el-form-item label="创建时间:">
                                    <span>{{props.row.create_at}}</span>
                                </el-form-item>
                                <el-form-item label="修改时间:">
                                    <span>{{props.row.update_at}}</span>
                                </el-form-item>
                                <el-form-item label="进场时间:">
                                    <span>{{props.row.time_in}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>

                    <el-table-column type="index" width="60"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="third_tnum" label="订单号" min-width="200"></el-table-column>
                    <el-table-column prop="local_amount" label="本地应收" min-width="60"></el-table-column>
                    <el-table-column prop="amount" label="应收金额" min-width="80"></el-table-column>
                    <el-table-column prop="dis_amount" label="优惠金额" width="55"></el-table-column>
                    <el-table-column prop="pay_amount" label="实收金额" width="55"></el-table-column>

                    <el-table-column label="开闸状态" min-width="65">
                        <template slot-scope="scope" >
                            <span v-if="scope.row.status != 0">
                                成功
                            </span>
                            <span v-else>
                                失败
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="pay_time" label="支付时间" min-width="140"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>

</template>

<script>
    import utils from '../../../utils/utils.js';
    let config = window.etback.config;
    export default {
        data:function(){
            return {
                sortType:{'1':'支付时间搜索','2':'创建时间搜索','3':'最后更新时间搜索'},
                search_more:false,
                shade:false,
                search:{station_id:'',plate:'',type:'',download:'',third_tnum:'',status:'',source:'',phone:'',sort_type:'3',begintime:'',endtime:'',dept:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                goDialog:{show:false,msg:''},
            };
        },
        methods:{

             exportFile(){
                let vm=this;
                let url = '/export/thorderExport?';
                 var download_p = vm.$route.params.download;
                 if(download_p && vm.search.download== ''){vm.search.download = download_p}
                 let {dept,...others}=vm.search;
                 let searchmap = {...others};
                 var querystr = utils.setQueryString(searchmap);
                 url+=querystr?querystr:'';
                 if( vm.search.dept != '' && typeof(vm.search.dept.company) == 'number' && vm.search.dept.area == '' ) url += "&company_id=" + vm.search.dept.company;
                 if( vm.search.dept != '' && vm.search.dept.area != '' && vm.search.dept.department == '' ) url += "&area_id=" + vm.search.dept.area;
                 if( vm.search.dept != '' && vm.search.dept.department != '' ) url += "&dept_id=" + vm.search.dept.department;
                let filename = '第三方订单.csv';
                utils.rpc.loadfile(url,null,filename).then(function(res){
                    if(res&&res.code === 0){
                        vm.$message({ showClose:true, message:res.message, type:'success' })
                    }else{
                        vm.$message({ showClose:true, message:res.message||'no data', type:'error' })
                    }
                });
            },
            goTodolist(){
                this.$router.push({path: '/todolist'})
            },
            setSbh(value){
                if(!value)return;
                let selected = this.companyArray.find(item=>item.nsrmc === value)
                this.invoice.info.nsrsbh =  selected.nsrsbh
            },
            setPageData:function(pageObj){
                this.pagination = pageObj;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = '/order/thPartOrder?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize;
                let {dept,...others}=vm.search;
                let searchmap = {...others};
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                if( vm.search.dept != '' && typeof(vm.search.dept.company) == 'number' && vm.search.dept.area == '' ) url += "&company_id=" + vm.search.dept.company;
                if( vm.search.dept != '' && vm.search.dept.area != '' && vm.search.dept.department == '' ) url += "&area_id=" + vm.search.dept.area;
                if( vm.search.dept != '' && vm.search.dept.department != '' ) url += "&dept_id=" + vm.search.dept.department;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    vm.shade = false;
                    utils.setCache(vm);
                });
            },
            getSummaries(params){
                let vm = this;
                let data = params.data;
                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                if(data.length>0){
                    let amountArr = data.map(item=>{
                        return item.amount;
                    });
                    let dis_amount = data.map(item=>{
                        return item.dis_amount;
                    });
                    let local_amount = data.map(item=>{
                        return item.local_amount;
                    });
                    let pay_amount = data.map(item=>{
                        return item.pay_amount;
                    });
                    let localAmount = local_amount.reduce(reducer,0);
                    let totalAmount = amountArr.reduce(reducer,0);
                    let disAmount = dis_amount.reduce(reducer,0);
                    let payAmount = pay_amount.reduce(reducer,0);
                    let result = [];
                    result[0] = "合计";
                    result[5] = localAmount ? localAmount.toFixed(1): 0;
                    result[6] = totalAmount ? totalAmount.toFixed(1): 0;
                    result[7] = disAmount ? disAmount.toFixed(1): 0;
                    result[8] = payAmount ? payAmount.toFixed(1): 0;
                    return result;
                }else{
                    return []
                }
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search_more = false;
                this.search = {station_id:'',plate:'',type:'',download:'',third_tnum:'',status:'',source:'',phone:'',sort_type:'3',begintime:'',endtime:'',dept:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                let params = this.$route.params;
                for(let i in params){params[i]=''};
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                var hasParams = utils.hasRouteParams(vm.$route.params);
                if(hasParams){vm.getData();return};
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
