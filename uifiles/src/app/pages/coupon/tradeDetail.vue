<template>

    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class="condition clearfix box-width">
                <div class="left">
                    <el-date-picker v-model="search.time_begin" value-format="yyyy-MM-dd" type="date" placeholder="使用开始时间" size="small" class="cell widthX150"></el-date-picker>
                    <el-date-picker v-model="search.time_end" value-format="yyyy-MM-dd" type="date" placeholder="使用结束时间" size="small" class="cell widthX150"></el-date-picker>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.convert_type" size="small" class="cell widthX100" placeholder="兑换类型" clearable>
                        <el-option v-for="(val,key) in convert_types" :key="key" :label="val" :value="key">
                        </el-option>
                    </el-select>
                    <el-input v-model="search.mobile" size="small" placeholder="手机号" class="cell widthX120"></el-input>
                    <el-button @click="btnSearch" class="cell" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' class="cell" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button class="cell" size="small" @click="handleExport">导出</el-button>
                </div>
            </div>
            <div class="table box-width">
                <el-table :data="tableData" border fit size="small" style="width:100%" max-height="100%" v-loading="shade" header-align="center">
                    <el-table-column label="用户ID" prop='user_id' min-width='100' align='center'></el-table-column>
                    <el-table-column label="用户姓名" prop='username' min-width='90'></el-table-column>
                    <el-table-column label="手机号" prop='mobile' min-width='150'></el-table-column>
                    <el-table-column label="车牌号" prop='plate' min-width='100'></el-table-column>
                    <el-table-column label="停车场" prop='station_name' min-width='180'></el-table-column>
                    <el-table-column label="进场时间" prop='enter_time' min-width='130'></el-table-column>
                    <el-table-column label="出场时间" prop='out_time' min-width='130'></el-table-column>
                    <el-table-column label="停车总时长(分钟)" prop='duration' min-width='130'></el-table-column>
                    <el-table-column label="交易时间" prop='paytime' min-width='130'></el-table-column>
                    <el-table-column label="兑换类型" prop='convert_type' min-width='100'>
                        <template slot-scope="scope">{{convert_types[scope.row.convert_type]}}</template>
                    </el-table-column>
                    <el-table-column label="应收停车费(元)" prop='total_amount' min-width='100'></el-table-column>
                    <el-table-column label="优惠券(元)" prop='coupon_amount' min-width='80'></el-table-column>
                    <el-table-column label="积分兑换金额(元)" prop='integral_convert_amount' min-width='110'></el-table-column>
                    <el-table-column label="积分兑换时长(分钟)" prop='integral_convert_time' min-width='110'></el-table-column>
                    <el-table-column label="兑换时段" prop='convert_use_time' min-width='260'></el-table-column>
                    <el-table-column label="使用总积分" prop='total_use_integral' min-width='80'></el-table-column>
                    <template v-show="scope.row.integral_detail" v-for="(item,index) in 6">
                        <el-table-column :key='"merchant_name"+item' :label="'使用积分来源'+item" min-width='90'>
                            <template v-if="scope.row.integral_detail[index]" slot-scope="scope">{{scope.row.integral_detail[index].merchant_name}}</template>
                        </el-table-column>
                        <el-table-column :key='"integral"+item' :label="'来源积分'+item" min-width='90'>
                            <template v-if="scope.row.integral_detail[index]" slot-scope="scope">{{scope.row.integral_detail[index].integral}}</template>
                        </el-table-column>
                    </template>
                </el-table>
            </div>
            <!--分页部分-->
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>

    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data() {
        return {
            radio: "1",
            shade: false,
            search_more: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            inputVisible: false,
            inputValue: '',
            updateVisible: false,
            updateTitle: '',
            editInfo: { num: '', end_time: '', start_time: '', type: '', name: '', merchant_id: '' },
            search: { time_begin: '', time_end: '', station_id: '', mobile: '', merchant_id: '', convert_type: '' },
            tableData: [],
            typeLists: [],
            convert_types: { AMOUNT: '兑换金额', TIME: '兑换时长', ALL: '兑换金额/兑换时长' },
            merchantData: [],
            btnLoading: false,
            sum: 0,
            merchantId: '',
            merchantPhone: '',
        }
    },
    computed: {},
    watch: {},
    methods: {

        getData() {
            let search = Object.assign({}, this.search);
            search.page = this.pagination.page;
            search.pagesize = this.pagination.pagesize;
            if (search.time_begin && search.time_end && search.time_begin > search.time_end) {
                this.$notify({ message: '使用结束时间必须大于使用开始时间', type: 'error' }); return;
            }
            let url = "/integral/integral_detail_lists?" + utils.setQueryString(search);
            this.shade = true;
            this.tableData = [];
            utils.fetch(url).then(res => {
                this.shade = false;
                if (res && res.code === 0) {
                    this.tableData = res.content.lists || [];
                    this.pagination.total = res.content.total || 0;
                } else {
                    this.pagination.total = 0;
                    this.$message({ message: res.message, type: 'error' })
                }
            })
        },
        handleExport() {
            let search = Object.assign({}, this.search);
            search.page = this.pagination.page;
            search.pagesize = this.pagination.pagesize;
            search = utils.setQueryString(search);
            let url = "/integral/integral_detail_export";
            var filename = utils.eptimes.formatTime(new Date(), 'YYYY-MM-dd') + '导出交易详情.xls';
            utils.rpc.loadfile(url, { method: 'POST', body: search }, filename).then(res => {
                if (res && res.code != '0' && res.message) {
                    this.$notify({ message: res.message, type: 'error' });
                }
            })
        },
        // /integral/integral_detail_export
        makeClick() {
            this.updateVisible = true;
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch() {
            this.pagination.page = 1;
            this.getData();
        },
        btnMore() {
            this.search_more = !this.search_more;
        },
        btnUndo() {
            this.search = { time_begin: '', time_end: '', station_id: '', mobile: '', merchant_id: '', convert_type: '' };
            this.pagination.page = 1;
            this.getData();
        },
    },
    mounted() {
        this.getData();
    },
}
</script>
<style>
.demo-table-expand {
    font-size: 0;
}

.demo-table-expand label {
    width: 90px;
    color: #99a9bf;
}

.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
}

.red {
    color: #f56c6c;
}

.el-table th {
    text-align: center;
}
</style>