<template>
    <div id='box' class="bill-style menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept_ids"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-select v-model="search.station_status" size="small" class="cell widthX120"  clearable placeholder="停车场状态">
                        <el-option v-for='(val,key) in statusMap' :label='val' :key='key' :value='key' />
                    </el-select>
                    <el-select v-model="search.date_type" size="small" class="cell widthX100"  placeholder="日期类型" @change="emptyTime(1)">
                        <el-option v-for='(v,k) in cfg.datetype' :label='v' :key='k' :value='k'></el-option>
                    </el-select>
                    <el-select v-model="search.data_type" size="small" class="cell widthX100"  placeholder="数据类型">
                        <el-option v-for='(v,k) in cfg.datatype' :label='v' :key='k' :value='k'></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportUpdate" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <!-- <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button> -->
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.begin_time" size="small" class="widthX200" placeholder="开始日期" :type="changedatetype(1)" :value-format="changedatetype(2)"></el-date-picker>
                <el-date-picker v-model="search.end_time" size="small" class="widthX200" placeholder="结束日期" :type="changedatetype(1)" :value-format="changedatetype(2)"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" show-summary :summary-method="getSummaries" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%" class='incometable'>
                    <!-- <el-table-column type="expand">
                        <template slot-scope="scope">
                        <el-form label-position="left" inline class="demo-table-expand">
                                <template v-if='search.date_type==="month"'>
                                    <el-form-item label="创建时间:"><span>{{ scope.row.creationtime }}</span></el-form-item>
                                    <el-form-item label="更新时间:"><span>{{ scope.row.modifiedtime }}</span></el-form-item>
                                </template>
                                <el-form-item label="大区/事业部:">
                                    <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column> -->
                    <el-table-column label="大区/事业部" fixed min-width="180">
                         <template slot-scope="scope">
                             <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                         </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" fixed min-width="90"></el-table-column>
                    <el-table-column prop="time" label="时间" width="90" fixed></el-table-column>
                    <el-table-column label="临停">
                        <el-table-column prop="t_received" label="应收" width="65"></el-table-column>
                        <el-table-column label="实收">
                            <el-table-column label="线上收入">
                                <el-table-column prop="t_ep_wechat" label="EP微信" width="60"></el-table-column>
                                <el-table-column prop="t_wechat" label="彩之云微信" width="65"></el-table-column>
                                <el-table-column prop="t_czy" label="彩之云APP" width="65"></el-table-column>
                                <el-table-column prop="t_applet" label="EP小程序" width="65"></el-table-column>
                                <el-table-column prop="t_unionpay" label="银联无感" width="65"></el-table-column>
                                <el-table-column prop="t_buy_coupon" label="优惠券" width="50"></el-table-column>
                                <el-table-column prop="t_others" label="其他" width="65"></el-table-column>
                            </el-table-column>
                            <el-table-column prop="t_online_total" label="线上小计" width="65"></el-table-column>
                            <el-table-column label="线下收入" width="65">
                                <el-table-column prop="t_case_received" label="现金" width="65"></el-table-column>
                            </el-table-column>
                            <el-table-column prop="t_offline_total" label="线下小计" width="65"></el-table-column>
                        </el-table-column>
                        <el-table-column prop="t_return" label="退款金额" width="65"></el-table-column>
                        <el-table-column prop="t_received_total" label="实收合计" width="65"></el-table-column>
                        <el-table-column prop="t_use_coupon" label="优惠券使用金额" width="120"></el-table-column>
                        <el-table-column prop="t_exception" label="异常金额" width="65"></el-table-column>
                        <el-table-column prop="t_coupon" label="优惠券购买金额" width="120"></el-table-column>
                    </el-table-column>
                    <el-table-column label="月卡">
                        <el-table-column label="实收">
                            <el-table-column label="线上收入">
                                <el-table-column prop="m_czy" label="彩之云APP" width="65"></el-table-column>
                                <el-table-column prop="m_ep_wechat" label="EP微信" width="65"></el-table-column>
                                <el-table-column prop="m_applet" label="EP小程序" width="65"></el-table-column>
                                <el-table-column prop="m_ipos" label="IPOS" width="65"></el-table-column>
                                <el-table-column prop="m_tcb" label="停车宝" width="65"></el-table-column>
                                <el-table-column prop="m_others" label="其他" width="65"></el-table-column>
                            </el-table-column>
                            <el-table-column prop="m_online_total" label="线上小计" width="65"></el-table-column>
                            <el-table-column label="线下收入">
                                <el-table-column prop="m_apply" label="续费申请" width="65"></el-table-column>
                            </el-table-column>
                            <el-table-column prop="m_offline_total" label="线下小计" width="65"></el-table-column>
                        </el-table-column>
                        <el-table-column prop="m_return" label="退款" width="50"></el-table-column>
                        <el-table-column prop="m_received_total" label="实收合计" width="65"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="platform_service_fee" label="平台服务费" width="65"></el-table-column>
                    <el-table-column prop="online_settlement" label="线上结算" min-width="65"></el-table-column>
                    <el-table-column prop="online_total" label="线上总计" min-width="65"></el-table-column>
                    <el-table-column prop="service_fee" label="服务费" min-width="65"></el-table-column>
                    <el-table-column prop="taxes" label="税费" min-width="65"></el-table-column>
                    <el-table-column prop="total_income" label="收入总额" min-width="65"></el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="120"></el-table-column>
                    <el-table-column prop="modifiedtime" label="更新时间" min-width="120"></el-table-column>
                    <el-table-column label="操作" width="60">
                        <template slot-scope="scope">
                            <el-button @click="updateHandler(scope.row)" plain size="mini">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
             <el-dialog :title="editor.title" :visible.sync="editor.show" width='30%'>
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item label="平台服务费:">
                        <el-input v-model="editor.info.platform_service_fee" size="small" placeholder="平台服务费" type='number' min='0'></el-input>
                    </el-form-item>
                    <el-form-item label="税费:">
                        <el-input v-model="editor.info.taxes" size="small" placeholder="税费" type='number' min='0'></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.saveloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>

            <el-dialog id="minwidth" :title="export_list.title" :visible.sync="export_list.show" width='45%'>
                <el-form :model="export_list.info" label-width="120px">
                    <div class='condition clearfix box-width'>
                    <my-select-station v-model="export_list.info.station_id" size="small" class="cell widthX150"   placeholder="停车场" @select='selectStation'></my-select-station>
                    <el-select v-model="export_list.info.data_type" size="small" class="cell widthX100"  placeholder="数据类型">
                        <el-option v-for='(v,k) in cfg.datatype' :label='v' :key='k' :value='k'></el-option>
                    </el-select>
                    <el-select v-model="export_list.info.date_type" size="small" class="cell widthX100"  placeholder="日期类型" @change="emptyTime(2)">
                        <el-option v-for='(v,k) in cfg.exportDateType' :label='v' :key='k' :value='k'></el-option>
                    </el-select>
                     <el-date-picker v-model="export_list.info.time" size="small" class="widthX200" placeholder="时间" :type="changedatetype(1,1)" :value-format="changedatetype(2,1)"></el-date-picker>
                     </div>
                     <div class="text-center mt15">
                        <el-button @click="exportSubmit" type="primary" size="small">导出</el-button>
                     </div>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<style>
#minwidth .el-dialog{
    min-width: 620px;
}
</style>
<script>
    import utils from '../../../utils/utils.js';
    import config from '../../../utils/const.js';
    export default {
        data:function(){
            let cfg = {
                filenametype:'收入报表',
                kind : {"app":"app","cash":"现金","coupon":"优惠券","card":"刷卡","wechat":"微信","zfb":"支付宝"},
                source:{'LOCAL':"厂家上报",'CZY':"双乾",'WECHAT':"微信",'WX_AGUA':"阿瓜微信",'APARCAR':"续费"},
                datetype:{'month':"月报", 'day': '日报'},
                exportDateType: {'month':"月报", 'year': '年报'},
                datatype:{'income':"收入"},
                url:{
                    list:'/bill/statisticList',
                    update:'/bill/statisticUpdate',
                    down:'/bill/download',
                    sum: '/bill/statisticSum'
                },
            }
            return {
                cfg,
                shade:false,
                search:{dept_ids:'',station_id:'',station_ids:'',date_type:'day',data_type:'income',begin_time:'',end_time:'', station_status: ''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search_more:false,
                editor:{title:'',show:false,saveloading:false,info:{platform_service_fee:"",taxes:""}
                },
                export_list:{title:'',show:false,info:{station_id:'',date_type:'month',data_type:'income',time:''}},
                currentStationName:'',
                statusMap: config.statusMap,
                sumData: {}
            }
        },
        methods:{
            selectStation(obj){
                this.currentStationName = obj.name;
            },
            exportUpdate(){
                let vm = this;
                vm.export_list.show = true;
                vm.export_list.title = "导出报表";
                let {station_id,data_type} = vm.search;
                let date_type = 'month';
                vm.export_list.info = {station_id,date_type,data_type,time:''};
            },
            exportSubmit(){
                let vm = this;
                let url = vm.cfg.url.down;
                let info = vm.export_list.info;
                if(info.time===''||info.station_id===''){
                    vm.$message({ showClose:true, message:'车场和时间不能为空',type:'error' }); return
                }
                let editData =Object.assign({},info);
                let querystr = utils.setQueryString(editData);
                url+=querystr.indexOf('?')>0?'&'+querystr:'?'+querystr;
                let filename = `${vm.currentStationName}_${vm.cfg.filenametype}_${vm.cfg.datetype[editData.date_type]}_${editData.time}.zip`;//南国丽园_收入报表_年报_2017
                utils.rpc.loadfile(url,null,filename).then(function(res){
                     if(res&&res.code === 0){
                        vm.export_list.show = false;
                        vm.$message({ showClose:true, message:res.message, type:'success' })
                     }else{
                        vm.$message({ showClose:true, message:res.message||'no data', type:'error' })
                     }
                });
            },
            updateHandler(row){
                let vm = this;
                vm.editor.show = true;
                vm.editor.title = "编辑信息";
                vm.editor.saveloading = false;
                vm.editor.info={id:row.id,platform_service_fee:row.platform_service_fee,taxes:row.taxes};
            },
            editSubmit(){
                let vm = this;
                let url = vm.cfg.url.update;
                let info = vm.editor.info;
                if(info.platform_service_fee===''||info.taxes===''){
                    vm.$message({ showClose:true, message:'平台服务费和税费不能为空',type:'error' }); return
                }
                let editData =Object.assign({},info);
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editor.show = false;
                            vm.getDataAndDataSum();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                        vm.editor.saveloading = false;
                    }
                })
            },
            changedatetype(type,flag){
                let val = flag===1 ? this.export_list.info.date_type : this.search.date_type;
                let types = {'month': 'month','day': 'date', 'year': 'year'};
                let format = {'month': 'yyyy-MM','day':'yyyy-MM-dd', 'year': 'yyyy'};
                return type===1 ? types[val] : format[val];
            },
            emptyTime(type){
                if(type ===1){
                    this.search.begin_time = '';
                    this.search.end_time = '';
                }
                if(type ===2){
                    this.export_list.info.time = '';
                }
            },
            getData () {
                var vm = this;
                var url = `${vm.cfg.url.list}?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
                let {...searchs} = vm.search;
                let querystr = utils.setQueryString(searchs);
                url+=querystr ? '&'+querystr : '';
                vm.shade = true;
                return utils.fetch(url).then(json => {
                    if (json) {
                        if (json.code === 0 && json.content) {
                            vm.tableData = json.content.lists || [];
                            vm.pagination.total = json.content.total || 0;
                        } else {
                            vm.tableData = [];
                            vm.pagination.total = 0;
                        }
                    } else {
                        this.$message.error(res.message);
                    }
                    // utils.setCache(vm);
                    // vm.shade = false
                })
            },
            getDataSum () {
                let url = this.cfg.url.sum
                let {...searchs} = this.search
                let queryStr = utils.setQueryString(searchs)
                url += queryStr ? `?${queryStr}` : ''
                return utils.fetch(url).then(res => {
                    if (res && res.code === 0 && res.content) {
                        this.sumData = res.content.sum_data[0]
                    } else {
                        this.$message.error(res.message)
                    }
                })
            },
            getDataAndDataSum () {
                Promise.all([this.getData(), this.getDataSum()])
                .then(res => {
                    utils.setCache(this, 'sumData')
                    this.shade = false
                }).catch(e => {
                    this.shade = false
                    console.log('error', e)
                })
            },
            setPageData:function(pageObj){
                this.pagination = pageObj;
                this.getData().then(res => {
                    utils.setCache(this, 'sumData')
                    this.shade = false
                }).catch(e => {
                    this.shade = false
                    console.log('error', e)
                })
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getDataAndDataSum();
            },
            btnUndo:function(){
                this.search = {dept_ids:'',station_id: '',station_ids:'',date_type:'day',data_type:'income',begin_time:'',end_time:'', station_status: ''};
                this.getDataAndDataSum();
            },
            btnMore(){
                this.search_more = !this.search_more;
            },
            getSummaries(params){
                let result = []
                const { columns, data } = params
                columns.forEach((column, index) => {
                    if (index === 0) { result[index] = '总计'; return; }
                    if (this.sumData && (this.sumData[column.property] + '')) {
                        result[index] = this.sumData[column.property];
                    } else {
                        result[index] = '';
                    }
                })
                return result
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
                    vm.getDataAndDataSum();
                }
            });
        },

    }

</script>
<style lang="scss">

</style>
