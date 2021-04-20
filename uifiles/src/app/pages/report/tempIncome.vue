<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <!-- <my-linkage-dept v-model="search.dept" type="2"></my-linkage-dept> -->
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX170" placeholder="项目名称"></my-select-station>
                    <el-date-picker v-model="daterange" size="small" type="monthrange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format='yyyy-MM'>
                    </el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportHandler" size="small"><i class="fa fa-external-link"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%">
                    <!-- <el-table-column prop="" label="绩效提升中心" min-width="90"></el-table-column> -->
                    <el-table-column prop="dept_name" label="事业部" width="90"></el-table-column>
                    <el-table-column prop="station_name" label="项目名称" width="90"></el-table-column>
                    <el-table-column prop="data_time" label="年月" width="90"></el-table-column>
                    <el-table-column prop="receivable" label="系统应收" width="90"></el-table-column>
                    <el-table-column prop="received" label="系统实收" width="90"></el-table-column>
                    <el-table-column prop="temp_difference" label="系统差异" width="90"></el-table-column>
                    <el-table-column prop="discount_amount" label="优惠券使用" width="90"></el-table-column>
                    <el-table-column prop="finance_receivable" label="财务实收(收费系统)" width="180"></el-table-column>
                    <el-table-column prop="year" label="财务实收-收费方式">
                        <el-table-column prop="ep_online" label="EP渠道">
                        </el-table-column>
                        <el-table-column prop="czy_online" label="彩之云">
                        </el-table-column>
                        <el-table-column prop="summary" label="日报上缴">
                        </el-table-column>
                        <el-table-column prop="online_purchase_amount" label="优惠券购买">
                        </el-table-column>
                    </el-table-column>
                    <el-table-column prop="offline_income" label="线下录入" width="80"></el-table-column>
                    <el-table-column label="操作" width="70" fixed='right'>
                        <template slot-scope="scope">
                            <el-button @click="updateHandler(scope.row)" plain type="primary" size="mini">线下录入</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="编辑线下录入金额" :visible.sync="editor.show" width='30%'>
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item label="线下录入金额:">
                        <el-input v-model="editor.info.offline_income" size="small" placeholder="最多两位小数"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.loading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<style>
.el-date-editor .el-range-separator {
    width: 10%;
}
</style>
<script>
import utils from '../../../utils/utils.js'
export default {
    data: function() {
        let cfg = {
            filenametype: '临停收入',
            url: {
                list: '/tempincome/lists',
                down: '/tempincome/export',
                update: '/tempincome/update'
            }
        }
        return {
            cfg,
            shade: false,
            daterange: [],
            search: {
                dept: '',
                station_id: '',
                station_ids: '',
                begin_time: '',
                end_time: ''
            },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            search_more: false,
            editor: { show: false, info: { offline_income: '' }, loading: false }
        }
    },
    methods: {
        updateHandler(row) {
            this.editor.show = true;
            this.editor.info.id = row.id;
            this.editor.info.offline_income = row.offline_income;
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
        editSubmit() {
            let vm = this;
            let url = vm.cfg.url.update;
            let info = vm.editor.info;
            if (info.offline_income === '') {
                vm.$message({ showClose: true, message: '线下收入录入金额不能为空', type: 'error' });
                return;
            }
            if (!utils.isMoney(info.offline_income.trim())) {
                vm.$message({ showClose: true, message: '线下收入录入金额只能是正数且最多带两位小数', type: 'error' });
                return;
            }
            let data = {
                id: info.id,
                offline_income: info.offline_income
            }
            vm.editor.loading = true;
            utils.fetch(url, { method: 'POST', body: data }).then(res => {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.editor.show = false;
                        setTimeout(function() { vm.getData() }, 1000);
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                    vm.editor.loading = false;
                }
            })
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
                vm.tableData =
                    typeof json != "undefined" && json.code == 0 ?
                    json.content.lists : [];
                vm.pagination.total =
                    typeof json != "undefined" && json.code == 0 ? json.content.total : 0;
                if (typeof json != "undefined" && json.code != 0) {
                    vm.$message({ showClose: true, message: json.message, type: 'error' });
                    return
                }
            });
        },
        setPageData(pageObj) {
            this.pagination = pageObj
            this.getData()
        },
        btnSearch() {
            this.pagination.page = 1
            this.getData()
        },
        btnUndo() {
            this.search = {
                station_id: '',
                station_ids: ''
            }
            this.daterange = [];
            this.getData()
        },
        btnMore() {
            this.search_more = !this.search_more
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            vm.getData()
        })
    }
}
</script>