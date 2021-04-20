<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-domain v-model="search.et_region_id" size="small" class="cell widthX150" placeholder="易停区域"></my-select-domain>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.station_status" size="small" class="cell widthX120"  clearable placeholder="停车场状态">
                        <el-option v-for='(val,key) in status_map' :label='val' :key='key' :value='key' />
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportHandler" size="small"><i class="fa fa-external-link"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept" type="2"></my-linkage-dept>
                <el-date-picker v-model="search.begin_time" size="small" type="year" placeholder="开始日期" value-format='yyyy'>
                </el-date-picker>
                <el-date-picker v-model="search.end_time" size="small" type="year" placeholder="结束日期" value-format='yyyy'>
                </el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%">
                    <el-table-column prop="et_region_name" fixed label="EP区域" min-width="90"></el-table-column>
                    <el-table-column label="公司/大区/事业部" fixed min-width="180">
                        <template slot-scope="scope">
                            <span>{{`${scope.row.company_name}-${scope.row.area_name}-${scope.row.dept_name}`}}</span>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column prop="" label="绩效中心" fixed min-width="90"></el-table-column> -->
                    <el-table-column prop="station_name" fixed label="停车场" min-width="90"></el-table-column>
                    <el-table-column prop="year" label="年份" min-width="90"></el-table-column>
                    <el-table-column label="有效月卡数量">
                        <el-table-column v-for="i in 12" :key="i" :label="`${i}月`" min-width="60">
                            <template slot-scope="scope">
                                {{scope.row.contract_num[`m${i}`]}}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="月卡应收">
                        <el-table-column v-for="i in 12" :key="i" :label="`${i}月`" min-width="60">
                            <template slot-scope="scope">
                                {{scope.row.receivable[`m${i}`]}}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="权责实收">
                        <el-table-column v-for="i in 12" :key="i" :label="`${i}月`" min-width="60">
                            <template slot-scope="scope">
                                {{scope.row.income_share[`m${i}`]}}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="收付实收">
                        <el-table-column v-for="i in 12" :key="i" :label="`${i}月`" min-width="60">
                            <template slot-scope="scope">
                                {{scope.row.received[`m${i}`]}}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column prop="contract_num_avg" label="平均月卡数" min-width="65"></el-table-column>
                    <el-table-column prop="total_receivable" label="总应收" min-width="65"></el-table-column>
                    <el-table-column prop="total_income_share" label="权责总实收" min-width="65"></el-table-column>
                    <el-table-column prop="total_received" label="收付总实收" min-width="65"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import config from '../../../utils/const.js';
export default {
    data: function() {
        let cfg = {
            filenametype: '月卡收入汇总报表',
            url: {
                list: '/contractincomesummary/lists',
                down: '/contractincomesummary/export'
            }
        }
        return {
            cfg,
            shade: false,
            search: {
                dept: "",
                station_id: "",
                et_region_id: '',
                begin_time: "",
                end_time: "",
                station_status: ''
            },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            search_more: false,
            status_map: config.statusMap
        }
    },
    methods: {
        dealParams(url) {
            if (parseInt(this.search.begin_time) > parseInt(this.search.end_time)) {
                this.$message({ showClose: true, message: '开始日期不能大于结束日期', type: "error" });
                return;
            }
            let { dept, ...searchs } = this.search;
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
            var apiurl = `${this.cfg.url.list}?page=${this.pagination.page}&pagesize=${this.pagination.pagesize}`;
            let url = this.dealParams(apiurl)
            this.shade = true;
            utils.fetch(url).then(json => {
                this.shade = false;
                if (json.code === 0) {
                    if (json.content) {
                        this.tableData = json.content.lists || [];
                        this.pagination.total = json.content.total || 0;
                    } else {
                        this.tableData = [];
                        this.pagination.total = 0;
                    }
                } else {
                    this.$message({ showClose: true, message: json.message, type: 'error' });
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
                begin_time: "",
                end_time: "",
                et_region_id: '',
            };
            this.daterange = [];
            this.getData();
        },
        btnMore() {
            this.search_more = !this.search_more;
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(vm => {
            utils.getTingYunScript();
            vm.getData();
        });
    }
};
</script>