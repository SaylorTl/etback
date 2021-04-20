<template>
    <div id="box" class="menu-hide">
        <div class="worker inlists">
            <div class="condition clearfix box-width">
                <div class="left">
                    <el-select v-model="search.area_type" size="small" class="cell widthX100" placeholder="报表类型" @change="switchTypeOfSheet">
                        <el-option v-for="(v,k) in cfg.areaType" :label="v" :key="k" :value="k"></el-option>
                    </el-select>
                    <my-select-domain v-model="search.et_region_id" size="small" class="cell widthX170" placeholder="易停区域"></my-select-domain>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX170" placeholder="停车场"></my-select-station>
                    <my-select-merchant v-model.trim="search.merchant_id" size="small" class="cell widthX275" placeholder="商家名称" v-if='search.area_type==="merchant"'></my-select-merchant>
                    <el-button @click="btnMore" size="small">
                        <i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选
                    </el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportHandler" size="small"><i class="fa fa-external-link"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <my-linkage-dept v-model="search.dept" type="2"></my-linkage-dept>
                <el-date-picker v-model="daterange" size="small" :type='search.area_type==="station"?"monthrange":"daterange"' range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :value-format='search.area_type==="station"?"yyyy-MM":"yyyy-MM-dd"'>
                </el-date-picker>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit height="550" style="width:100%">
                    <el-table-column prop="station_name" label="停车场" min-width="90"></el-table-column>
                    <el-table-column prop="merchant_name" label="商户" min-width="90" v-if='showMmerchant'></el-table-column>
                    <el-table-column label="公司/大区/事业部" min-width="180">
                        <template slot-scope="scope">
                            <span>{{`${scope.row.company_name}-${scope.row.area_name}-${scope.row.dept_name}`}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="data_time" label="数据日期" min-width="90"></el-table-column>
                    <el-table-column prop="t_receivable" label="临停应收" min-width="80"></el-table-column>
                    <el-table-column prop="discount_amount" label="优惠券使用金额" min-width="90"></el-table-column>
                    <el-table-column prop="payment_amount" label="用户支付" min-width="90"></el-table-column>
                    <el-table-column prop="face_amount" label="优惠券面额" min-width="90"></el-table-column>
                    <el-table-column prop="online_purchase_amount" label="优惠券线上购买金额" min-width="90"></el-table-column>
                    <el-table-column prop="discount_difference" label="折扣差异" min-width="90"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
        </div>
    </div>
</template>
<style>
#minwidth .el-dialog {
    min-width: 620px;
}

.el-date-editor .el-range-separator {
    width: 10%;
}
</style>
<script>
import utils from "../../../utils/utils.js";
export default {
    data: function() {
        let cfg = {
            filenametype: "优惠券使用汇总报表",
            areaType: { 'station': "停车场", 'merchant': "商户" },
            dateType: { 'month': "月报", 'day': "日报" },
            url: {
                list: "/couponsummary/lists",
                down: "/couponsummary/export"
            }
        };
        return {
            cfg,
            shade: false,
            daterange: [],
            search: {
                area_type: "station",
                date_type: "month",
                dept: "",
                station_id: "",
                et_region_id: '',
                merchant_id:''
            },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            search_more: false,
            showMmerchant: false,
        };
    },
    methods: {
        switchTypeOfSheet() {
            this.daterange = [];
            this.tableData = [];
            this.search.merchant_id = '';
            this.search.et_region_id = '';
            this.search.station_id = '';
            this.search.dept = '';
            this.search.date_type = this.search.area_type === "station" ? 'month' : 'day';
            this.pagination.page = 1; //每次切换重置页码为1
            this.getData();
        },
        dealParams(url) {
            let vm = this;
            if (vm.daterange && vm.daterange.length === 2) {
                let [begin, end] = vm.daterange;
                vm.search.begin_time = begin;
                vm.search.end_time = end;
            } else {
                vm.search.begin_time = '';
                vm.search.end_time = '';
            }
            let { dept, ...searchs } = vm.search;
            let querystr = utils.setQueryString(searchs);
            url += querystr ? `&${querystr}` : '';

            if (dept && JSON.stringify(dept) != "{}") {
                let deptStr = utils.setDeptQuery(dept);
                url += deptStr ? `&${deptStr}` : '';
            }
            return url
        },
        exportHandler() {
            let vm = this;
            let apiurl = `${vm.cfg.url.down}?timestamp=1`;
            let url = vm.dealParams(apiurl);
            const loading = vm.$loading({
                lock: true,
                text: '报表导出中……',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            utils.fetch(url).then(res => {
                loading.close();
                 if (res && res.code === 0) {
                    vm.$confirm(res.message, '导出成功', {
                        confirmButtonText: '前往待办',
                        cancelButtonText: '取消',
                        type: 'success'
                    }).then(() => {
                        vm.$router.push({ path: '/todolist' });
                    }).catch(() => {});
                } else {
                    vm.$message({
                        showClose: true,
                        message: res.message || "no data",
                        type: "error"
                    });
                }
            });
        },
        getData() {
            var vm = this;
            var apiurl = `${vm.cfg.url.list}?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
            let url = vm.dealParams(apiurl)
            vm.shade = true;
            vm.showMmerchant = vm.search.area_type === "merchant" ? true : false;
            utils.fetch(url).then(json => {
                vm.shade = false;
                if (json.code === 0 && json.content !== '') {
                    vm.tableData = json.content.lists || [];
                    vm.pagination.total = json.content.total || 0;
                } else {
                    vm.$message({ showClose: true, message: json.message, type: 'error' });
                }
            });
        },
        setPageData(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo() {
            this.search = {
                area_type: "station",
                date_type: "month",
                dept: "",
                station_id: "",
                et_region_id: '',
                merchant_id:''
            };
            this.daterange = [];
            this.getData();
        },
        btnMore() {
            this.search_more = !this.search_more;
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            vm.getData();
        });
    }
};
</script>