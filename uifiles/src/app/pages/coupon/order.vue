<template>
    <div id="box" class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept_ids"></my-linkage-dept>
                    <my-select-merchant v-model.trim="search.merchant" @change="merchantChange" size="small" class="cell widthX170"  placeholder="商家名称"></my-select-merchant>

                    <!-- <el-input v-model.trim="search.phone" size="small" class="cell widthX120"  placeholder="手机号"></el-input> -->
                    <my-select-station v-model="search.station_ids" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.id" size="small" class="cell widthX100"  placeholder="订单ID" v-show='isOpenUrl'></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportData" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select v-model="search.source" size="small" class="cell widthX100"  placeholder="来源" clearable>
                    <el-option v-for="(v,k)  in cfg.source" :label="v" :value="k" :key='k'></el-option>
                </el-select>
                <el-select v-model="search.paid" size="small" class="cell widthX100"  placeholder="是否支付" clearable>
                    <el-option label="是" value="Y"></el-option>
                    <el-option label="否" value="N"></el-option>
                </el-select>
                <el-input v-model.trim="search.tnum" size="small" class="cell widthX200"  placeholder="易停订单号"></el-input>
                <el-input v-model.trim="search.third_tnum" size="small" class="cell widthX250"  placeholder="第三方订单号"></el-input>
                <el-input v-model.trim="search.related_tnum" size="small" class="cell widthX250"  placeholder="预付单号"></el-input>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.begin_time" type="date" size="small" placeholder="开始时间"  value-format="yyyy-MM-dd"></el-date-picker>
                <el-date-picker v-model="search.end_time" type="date" size="small" placeholder="结束时间"  value-format="yyyy-MM-dd"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="用户名称:"><span>{{ props.row.user_name }}</span></el-form-item>
                                <el-form-item label="用户手机号:"><span>{{ props.row.user_phone }}</span></el-form-item>
                                <el-form-item label="第三方单号:"><span>{{ props.row.third_tnum }}</span></el-form-item>
                                <el-form-item label="预付单号:"><span>{{ props.row.related_tnum }}</span></el-form-item>
                                <!-- <el-form-item label="停车场:"><span>{{ props.row.station_name }}</span></el-form-item> -->
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="tnum" label="易停订单号" width="140"></el-table-column>
                    <el-table-column prop="merchant_name" label="商户名" width="110"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" width="120"></el-table-column>
                    <el-table-column prop="type_name" label="优惠券名称" width="120"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="60"></el-table-column>
                    <el-table-column prop="num" label="原价/数量" width="60"></el-table-column>
                    <el-table-column label="来源" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.source[scope.row.source]||scope.row.source}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="50">
                        <template slot-scope="scope">
                            <span v-if="scope.row.paid == 'N'">未支付</span>
                            <span v-if="scope.row.paid == 'Y'" class="green" >已支付</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="140"></el-table-column>
                    <el-table-column prop="paytime" label="支付时间" min-width="140"></el-table-column>
                    <el-table-column label="操作" min-width="150">
                        <template slot-scope="scope">
                            <el-button size="mini" v-if="authCheck('收费系统推送') && scope.row.paid == 'Y'" @click="notifycoupon(scope.row)">推送收费</el-button>
                            <el-button size="mini" v-if="scope.row.paid == 'Y'&& scope.row.coupon_type_kind!='3'" @click="batch_show(scope.row.batch)">查看批次</el-button>
                            <el-button size="mini" v-if="scope.row.paid == 'Y' && (scope.row.invoice === 'N' || scope.row.invoice == '3')" @click="invoiceOnline(scope.row)">在线开票</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
        <!-- 备注 S-->
        <el-dialog ref="invoiceDialog" :title="invoiceInfo.title" width='60%' :visible.sync="invoiceInfo.show" @close="invoiceClose">
            <coupon-invoice v-if="invoiceInfo.show" :invoiceInfo="invoiceInfo.rowData" @handleClose="invoiceClose"></coupon-invoice>
        </el-dialog>
        <!-- 备注 E-->
    </div>
</template>
<script>
import store from '../../store/store.js';
import utils from '../../../utils/utils.js';
import moment from 'moment';
import couponInvoice from '../../bussiness/couponInvoice.vue';
export default {
    data: function() {
        let config = {
            source: utils.config.payMethod,
        }
        return {
            cfg: config,
            shade: false,
            search_more: false,
            isOpenUrl: false,
            merchantItem:{},
            tableData: [],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            search: {
                tnum: '',
                third_tnum: '',
                related_tnum: '',
                phone: '',
                source: '',
                merchant: '',
                paid: '',
                id: '',
                begin_time: '',
                end_time: '',
                station_ids: '',
                dept_ids: ''
            },
            invoiceInfo:{show:false,title:'',rowData:''}
        }
    },
    components:{
        "coupon-invoice":couponInvoice
    },
    methods: {
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function() {
            var vm = this;
            var url = '/coupon/order_lists?page=' + vm.pagination.page + '&pagesize=' + vm.pagination.pagesize;
            var id = this.$route.params.id;
            var merchant = this.$route.params.merchant;
            if (merchant) { this.search.merchant = merchant};
            if (id) { this.search.id = id;
                this.isOpenUrl = true; }
            var searchmap = {
                "tnum": vm.search.tnum,
                "third_tnum": vm.search.third_tnum,
                "related_tnum": vm.search.related_tnum,
                "phone": vm.search.phone,
                "source": vm.search.source,
                "paid": vm.search.paid,
                "coupon": vm.search.id,
                "merchant": vm.search.merchant,
                "station_ids": vm.search.station_ids,
                "dept_ids": vm.search.dept_ids,
                "begin_time": vm.search.begin_time,
                "end_time": vm.search.end_time,
            }
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(json) {
                vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                utils.setCache(vm);
                vm.shade = false
            });
        },
        merchantChange:function(item){
            this.merchantItem=item;
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search_more = false;
            this.isOpenUrl = false;
            this.search = { tnum: '', third_tnum: '', related_tnum: '', phone: '', source: '',merchant: '', paid: '', id: '', begin_time: '', end_time: '', station_ids: '', dept_ids: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.$route.params.id = '';
            this.$route.params.merchant = '';
            this.getData();
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        batch_show: function(id) {
            this.$router.push({ name: '优惠券批次', path: '/coupon/batch',query: { batch: id }})
        },
        notifycoupon: function (row) {
            let vm=this;
            let url='/coupon/notifycoupon?tnum='+row.tnum
            utils.fetch(url).then(function (json) {
                if (json && json.message) {
                    vm.$message({ message: json.message }); return;
                }
            })
        },
        authCheck: function (tag) {
            return utils.authCheck(this, tag);
        },
        exportData: function () {
            var vm = this;
            vm.btnLoading = true;
            var obj = {
                tnum: vm.search.tnum,
                third_tnum:  vm.search.third_tnum,
                related_tnum:  vm.search.related_tnum,
                phone:  vm.search.phone,
                source:  vm.search.source,
                merchant:  vm.search.merchant,
                paid:  vm.search.paid,
                id:  vm.search.id,
                begin_time: utils.timeParse(vm.search.begin_time,'-',false),
                end_time: utils.timeParse(vm.search.end_time,'-',false),
                station_ids:  vm.search.station_ids,
                dept_ids:  vm.search.dept_ids
            }
            var param = utils.setQueryString(obj)
            var filename = moment().format('YYYYMMDD') + '优惠券订单.csv';
            utils.rpc.loadfile('/coupon/order_lists?page=1&pagesize=1&isexport=export&'+param, null ,filename).then(function(data){
                vm.btnLoading = false;
                if(data.code != 0 ){
                    vm.$message({ message:"超过导出最大数据量20000条，请筛选条件后再导出！", type:'error' }); return ;
                }
            })
        },
        invoiceOnline(rowData){
            this.invoiceInfo.title = '发票信息';
            this.invoiceInfo.show = true;
            this.invoiceInfo.rowData = rowData;
        },
        invoiceClose(){
            this.invoiceInfo.show = false;
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            var data = utils.getCache();
            var obj = data == '' ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    },
}
</script>
