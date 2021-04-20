<template>
    <div id="box" class="menu-hide">
        <div class="worker inlists">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-domain v-model="search.et_region_id" size="small" class="cell widthX170" placeholder="易停区域"></my-select-domain>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX170" placeholder="停车场" @input='getCurrentStationRules'></my-select-station>
                    <el-select v-model="search.station_status" size="small" class="cell widthX120"  clearable placeholder="停车场状态">
                        <el-option v-for='(val,key) in status_map' :label='val' :key='key' :value='key' />
                    </el-select>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell widthX120" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.rule_id" size="small" class="cell widthX100" placeholder="规则名称" clearable v-show='ruleSearch.show' v-loading='getRulesLoading'>
                        <el-option v-for="item in rulesInStation" :key="item.id" :value="item.id" :label="item.name">
                            <span class="left">{{item.name}}</span>
                            <span class="ruleN1">¥:{{item.N1}}</span>
                        </el-option>
                    </el-select>
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
                <el-date-picker v-model="search.begin_time" size="small" type="year" placeholder="开始日期" value-format='yyyy'>
                </el-date-picker>
                <el-date-picker v-model="search.end_time" size="small" type="year" placeholder="结束日期" value-format='yyyy'>
                </el-date-picker>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height="550" style="width:100%">
                    <el-table-column prop="et_region_name" fixed label="易停区域" min-width="90"></el-table-column>
                    <el-table-column prop="station_name" fixed label="停车场" min-width="90"></el-table-column>
                    <el-table-column label="公司/大区/事业部" fixed min-width="180">
                        <template slot-scope="scope">
                            <span>{{`${scope.row.company_name}-${scope.row.area_name}-${scope.row.dept_name}`}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="user_name" label="业主姓名" min-width="90"></el-table-column>
                    <el-table-column prop="mobile" label="联系方式" min-width="90"></el-table-column>
                    <el-table-column prop="unit_name" label="楼栋号" min-width="90"></el-table-column>
                    <el-table-column prop="room_name" label="房号" min-width="90"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="90"></el-table-column>
                    <el-table-column prop="rule_name" label="规则名称" min-width="90"></el-table-column>
                    <el-table-column prop="fees" label="收费标准" min-width="90"></el-table-column>
                    <el-table-column prop="begin_time" label="开始时间" min-width="140"></el-table-column>
                    <el-table-column prop="end_time" label="结束时间" min-width="140"></el-table-column>
                    <el-table-column prop="year" label="年份" min-width="90"></el-table-column>
                    <el-table-column v-for="i in 12" :key="i" :label="`${i}月`" min-width="60">
                        <template slot-scope="scope">
                            {{scope.row[`m${i}`]}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="current_year_received" label="本年实收" min-width="90"></el-table-column>
                    <el-table-column prop="arrears" label="往年收入" min-width="90"></el-table-column>
                    <el-table-column prop="precollected" label="往后预收" min-width="90"></el-table-column>
                    <!--  <el-table-column prop="creationtime" label="创建时间" min-width="90"></el-table-column>
                    <el-table-column prop="modifiedtime" label="更新时间" min-width="90"></el-table-column> -->
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
        </div>
    </div>
</template>
<style>
.el-date-editor .el-range-separator {
    width: 10%;
}
</style>
<script>
import utils from "../../../utils/utils.js";
import config from '../../../utils/const.js';
export default {
    data: function() {
        let cfg = {
            filenametype: "月卡台账报表",
            areaType: { 'station': "停车场", 'merchant': "商户" },
            dateType: { 'month': "月报", 'day': "日报" },
            url: {
                list: "/contractaccount/lists",
                down: "/contractaccount/export"
            }
        };
        return {
            cfg,
            shade: false,
            search: {
                dept: "",
                station_id: "",
                et_region_id: '',
                begin_time: "",
                end_time: "",
                car_id: "",
                rule_id: "",
                station_status: ''
            },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            search_more: false,
            showMmerchant: false,
            ruleSearch: { show: false, loading: false },
            getRulesLoading: false,
            rulesInStation: [],
            status_map: config.statusMap
        };
    },
    methods: {
        getCurrentStationRules(id) {
            var vm = this;
            if (!id) {
                vm.ruleSearch.show = false;
                vm.rulesInStation = [];
                vm.search.rule_id = '';
                return;
            }
            vm.ruleSearch.show = true;
            vm.getRulesLoading = true;
            utils.getRulesByStationID(id).then(arr => {
                vm.getRulesLoading = false;
                vm.rulesInStation = arr;
            })
        },
        dealParams(url) {
            let vm = this;
            if (parseInt(vm.search.begin_time) > parseInt(vm.search.end_time)) {
                vm.$message({ showClose: true, message: '开始日期不能大于结束日期', type: "error" });
                return;
            }
            let { dept, ...searchs } = vm.search;
            let querystr = utils.setQueryString(searchs);
            url += querystr ? `&${querystr}` : '';

            if (dept && JSON.stringify(dept) != "{}") {
                let deptStr = utils.setDeptQuery(dept);
                url += deptStr ? `&${deptStr}` : '';
            }
            return url;
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
            let url = vm.dealParams(apiurl);
            vm.shade = true;
            utils.fetch(url).then(json => {
                vm.shade = false;
                if (json.code === 0) {
                    if (json.content) {
                        vm.tableData = json.content.lists || [];
                        vm.pagination.total = json.content.total || 0;
                    } else {
                        vm.tableData = [];
                        this.pagination.total = 0;
                    }
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
                dept: "",
                station_id: "",
                et_region_id: '',
                begin_time: "",
                end_time: "",
                car_id: "",
                rule_id: "",
            };
            this.ruleSearch.show = false;
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