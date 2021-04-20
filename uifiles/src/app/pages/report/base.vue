<template>
    <div id='box' class="menu-hide">
        <div class='worker log'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-select v-model="search.area_type" @change="getData" filterable size="small" class="cell widthX120" placeholder="报表类型">
                        <el-option v-for="(item,index) in typeOption" :key="index" :label="item" :value="index"></el-option>
                    </el-select>
                    <my-select-station v-if="search.area_type==='station'" v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-if="search.area_type==='station'" v-model="search.station_status" size="small" class="cell widthX120"  clearable placeholder="停车场状态">
                        <el-option v-for='(val,key) in status_map' :label='val' :key='key' :value='key' />
                    </el-select>
                    <my-select-domain v-if="search.area_type==='et_region'" filterable v-model="search.et_region_id" size="small" class="cell widthX150" placeholder="易停区域"></my-select-domain>
                    <el-select v-model="search.date_type" size="small" @change="typeChange" class="cell widthX95" placeholder="请选择">
                        <el-option label="日报" value="day"></el-option>
                        <el-option label="月报" value="month"></el-option>
                    </el-select>
                    <div class="cell widthX150">
                        <el-date-picker v-model="search.begin_time" size="small" :value-format="search.date_type == 'month' ? 'yyyy-MM' : 'yyyy-MM-dd'" :type="search.date_type == 'month' ? 'month' : 'date'" placeholder="数据开始时间"></el-date-picker>
                    </div>
                    <div class="cell widthX150">
                        <el-date-picker v-model="search.end_time" size="small" :value-format="search.date_type == 'month' ? 'yyyy-MM' : 'yyyy-MM-dd'" :type="search.date_type == 'month' ? 'month' : 'date'" placeholder="数据结束时间"></el-date-picker>
                    </div>
                    <el-button v-if="search.area_type!=='et_region'" @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button @click="download" size="small">导出</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-if="search.area_type!=='et_region'" type='2' v-model="search.dept_ids"></my-linkage-dept>
            </div>
            <div class='table box-width'>
                <!-- 由于element表格宽度是组件初始化计算产生，直接在表格内隐藏/显示列数据会导致样式错乱（表格各列宽度不会从新计算），因此  写多个表格模板 -->
                <!-- 停车场类型报表模板 -->
                <el-table v-show="search.area_type==='station'" :summary-method="getSummaries" show-summary v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%">
                    <!-- <el-table-column prop="et_region_name" fixed label="EP停车平台数据" min-width="100"></el-table-column> -->
                    <el-table-column label="EP停车平台数据" fixed min-width="350">
                        <template slot-scope="scope">
                            <span v-if="scope.row.dept_name != ''  && scope.row.station_name == ''"> {{ scope.row.area_name + '/' + scope.row.dept_name}} </span>
                            <span v-else-if="scope.row.station_name != ''">{{ scope.row.area_name + '/' + scope.row.dept_name + '/' + scope.row.station_name}}</span>
                            <span v-else-if="scope.row.dept_name == ''">{{ scope.row.area_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="date" label="时间" fixed min-width="70"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column prop="t_receivable" label="临停应收" min-width="70"></el-table-column>
                    <el-table-column label="临停实收" min-width="70">
                        <el-table-column prop="t_received" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_received_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="t_income_gap" label="系统临停差异" min-width="70"></el-table-column>
                    <el-table-column prop="t_abnormal_amount_rate" label="异常金额差率" min-width="70"></el-table-column>
                    <el-table-column label="临停线上" min-width="70">
                        <el-table-column prop="t_online_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_online_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column label="优惠券使用" min-width="70">
                        <el-table-column prop="discount_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="discount_num" label="总单数" min-width="70"></el-table-column>
                        <el-table-column prop="fully_deductible_num" label="全抵扣单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_num" label="月卡单数" min-width="70"></el-table-column>
                    <el-table-column label="月卡线上" min-width="70">
                        <el-table-column prop="m_online_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="m_online_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_app_num" label="月卡APP" min-width="70"></el-table-column>
                    <el-table-column prop="m_ipos_num" label="月卡ipos" min-width="70"></el-table-column>
                    <el-table-column prop="renew_num" label="续费延期" min-width="70"></el-table-column>
                    <el-table-column label="临停线上缴费率" min-width="70">
                        <el-table-column prop="t_online_payment_amount_rate" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_online_payment_num_rate" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_online_payment_num_rate" label="月卡线上缴费率（单数）" min-width="70"></el-table-column>
                    <el-table-column label="异常开闸次数" min-width="70">
                        <el-table-column prop="system_exception_num_in" label="电脑开闸进场" min-width="50"></el-table-column>
                        <el-table-column prop="system_exception_num_out" label="电脑开闸出场" min-width="50"></el-table-column>
                        <el-table-column prop="remote_exception_num_in" label="遥控器开闸进场" min-width="50"></el-table-column>
                        <el-table-column prop="remote_exception_num_out" label="遥控器开闸出场" min-width="50"></el-table-column>
                        <el-table-column prop="exception_total_in" label="进场合计" min-width="50"></el-table-column>
                        <el-table-column prop="exception_total_out" label="出场合计" min-width="50"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="d_num" label="总出场数" min-width="50"></el-table-column>
                    <el-table-column prop="exception_rate" label="异常开闸比例" min-width="50"></el-table-column>
                    <el-table-column prop="projects_num" label="项目数" min-width="50"></el-table-column>
                </el-table>
                <!-- 事业部报表模板 -->
                <el-table v-show="search.area_type==='dept'" :summary-method="getSummaries" show-summary v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%">
                    <el-table-column label="EP停车平台数据" fixed min-width="350">
                        <template slot-scope="scope">
                            <span v-if="scope.row.dept_name != ''  && scope.row.station_name == ''"> {{ scope.row.area_name + '/' + scope.row.dept_name}} </span>
                            <span v-else-if="scope.row.station_name != ''">{{ scope.row.area_name + '/' + scope.row.dept_name + '/' + scope.row.station_name}}</span>
                            <span v-else-if="scope.row.dept_name == ''">{{ scope.row.area_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="date" label="时间" fixed min-width="70"></el-table-column>
                    <el-table-column prop="t_receivable" label="临停应收" min-width="70"></el-table-column>
                    <el-table-column label="临停实收" min-width="70">
                        <el-table-column prop="t_received" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_received_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="t_income_gap" label="系统临停差异" min-width="70"></el-table-column>
                    <el-table-column prop="t_abnormal_amount_rate" label="异常金额差率" min-width="70"></el-table-column>
                    <el-table-column label="临停线上" min-width="70">
                        <el-table-column prop="t_online_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_online_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column label="优惠券使用" min-width="70">
                        <el-table-column prop="discount_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="discount_num" label="总单数" min-width="70"></el-table-column>
                        <el-table-column prop="fully_deductible_num" label="全抵扣单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_num" label="月卡单数" min-width="70"></el-table-column>
                    <el-table-column label="月卡线上" min-width="70">
                        <el-table-column prop="m_online_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="m_online_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_app_num" label="月卡APP" min-width="70"></el-table-column>
                    <el-table-column prop="m_ipos_num" label="月卡ipos" min-width="70"></el-table-column>
                    <el-table-column prop="renew_num" label="续费延期" min-width="70"></el-table-column>
                    <el-table-column label="临停线上缴费率" min-width="70">
                        <el-table-column prop="t_online_payment_amount_rate" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_online_payment_num_rate" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_online_payment_num_rate" label="月卡线上缴费率（单数）" min-width="70"></el-table-column>
                    <el-table-column label="异常开闸次数" min-width="70">
                        <el-table-column prop="system_exception_num_in" label="电脑开闸进场" min-width="50"></el-table-column>
                        <el-table-column prop="system_exception_num_out" label="电脑开闸出场" min-width="50"></el-table-column>
                        <el-table-column prop="remote_exception_num_in" label="遥控器开闸进场" min-width="50"></el-table-column>
                        <el-table-column prop="remote_exception_num_out" label="遥控器开闸出场" min-width="50"></el-table-column>
                        <el-table-column prop="exception_total_in" label="进场合计" min-width="50"></el-table-column>
                        <el-table-column prop="exception_total_out" label="出场合计" min-width="50"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="d_num" label="总出场数" min-width="50"></el-table-column>
                    <el-table-column prop="exception_rate" label="异常开闸比例" min-width="50"></el-table-column>
                    <el-table-column prop="projects_num" label="项目数" min-width="50"></el-table-column>
                </el-table>
                <!-- EP区域报表模板 -->
                <el-table v-show="search.area_type==='et_region'" :summary-method="getSummaries" show-summary v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%">
                    <el-table-column prop="et_region_name" label="EP停车平台数据" fixed min-width="100"></el-table-column>
                    <el-table-column prop="date" label="时间" fixed min-width="70"></el-table-column>
                    <el-table-column prop="t_receivable" label="临停应收" min-width="70"></el-table-column>
                    <el-table-column label="临停实收" min-width="70">
                        <el-table-column prop="t_received" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_received_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="t_income_gap" label="系统临停差异" min-width="70"></el-table-column>
                    <el-table-column prop="t_abnormal_amount_rate" label="异常金额差率" min-width="70"></el-table-column>
                    <el-table-column label="临停线上" min-width="70">
                        <el-table-column prop="t_online_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_online_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column label="优惠券使用" min-width="70">
                        <el-table-column prop="discount_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="discount_num" label="总单数" min-width="70"></el-table-column>
                        <el-table-column prop="fully_deductible_num" label="全抵扣单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_num" label="月卡单数" min-width="70"></el-table-column>
                    <el-table-column label="月卡线上" min-width="70">
                        <el-table-column prop="m_online_amount" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="m_online_num" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_app_num" label="月卡APP" min-width="70"></el-table-column>
                    <el-table-column prop="m_ipos_num" label="月卡ipos" min-width="70"></el-table-column>
                    <el-table-column prop="renew_num" label="续费延期" min-width="70"></el-table-column>
                    <el-table-column label="临停线上缴费率" min-width="70">
                        <el-table-column prop="t_online_payment_amount_rate" label="金额" min-width="70"></el-table-column>
                        <el-table-column prop="t_online_payment_num_rate" label="单数" min-width="70"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="m_online_payment_num_rate" label="月卡线上缴费率（单数）" min-width="70"></el-table-column>
                    <el-table-column label="异常开闸次数" min-width="70">
                        <el-table-column prop="system_exception_num_in" label="电脑开闸进场" min-width="50"></el-table-column>
                        <el-table-column prop="system_exception_num_out" label="电脑开闸出场" min-width="50"></el-table-column>
                        <el-table-column prop="remote_exception_num_in" label="遥控器开闸进场" min-width="50"></el-table-column>
                        <el-table-column prop="remote_exception_num_out" label="遥控器开闸出场" min-width="50"></el-table-column>
                        <el-table-column prop="exception_total_in" label="进场合计" min-width="50"></el-table-column>
                        <el-table-column prop="exception_total_out" label="出场合计" min-width="50"></el-table-column>
                    </el-table-column>
                    <el-table-column prop="d_num" label="总出场数" min-width="50"></el-table-column>
                    <el-table-column prop="exception_rate" label="异常开闸比例" min-width="50"></el-table-column>
                    <el-table-column prop="projects_num" label="项目数" min-width="50"></el-table-column>
                </el-table>
            </div>
            <my-paginator v-show="tableData.length>0" @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import config from '../../../utils/const.js';
export default {
    data: function() {
        return {
            search_more: false,
            status_map: config.statusMap,
            typeOption: { station: '停车场报表', dept: '事业部报表', et_region: 'EP区域报表' },
            shade: false,
            search: { area_type: 'station', dept_id: '', dept_ids: {}, station_id: '', et_region_id: '', date_type: 'day', begin_time: '', end_time: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            tableDataTal: []
        }
    },
    methods: {
        btnMore () {
            this.search_more = !this.search_more;
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function() {
            let vm = this;
            vm.tableData = [];
            vm.shade = true;
            let url = '/basicoperation/lists?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (vm.search.area_type === 'station') {
                vm.search.et_region_id = '';
            } else if (vm.search.area_type === 'dept') {
                vm.search.station_id = '';
                vm.search.et_region_id = '';
            } else if (vm.search.area_type === 'et_region') {
                vm.search.station_id = '';
                vm.search.dept_id = '';
            }
            let data = utils.deepCopy(vm.search);
            for (let index in data) {
                if (data[index] && index !== 'dept_ids') {
                    url += "&" + index + "=" + data[index];
                }
            }
            let deptStr = ''
            if (vm.search.dept_ids && !utils.isEmptyObject(vm.search.dept_ids)) {
                deptStr = utils.setDeptQuery(vm.search.dept_ids);
                url += deptStr ? '&' + deptStr : '';
            }
            utils.fetch(url).then(function(json) {
                if (json && json.code == 0) {
                    vm.pagination.total = json.content.total;
                    vm.tableData = json.content.lists;
                }
                vm.shade = false;
            });
            this.getTableDataTal(data, deptStr);
        },
        getTableDataTal (search, deptStr) {
            let talUrl = '/basicoperation/summations?';
            for (let attr in search) {
                if (search[attr]) {
                    if (search[attr] && attr !== 'dept_ids') {
                        talUrl += `&${attr}=${search[attr]}`;
                    }
                }
            }
            talUrl += deptStr ? '&' + deptStr : '';
            utils.fetch(talUrl).then(json => {
                if (json && json.content) {
                    this.tableDataTal = json.content;
                }
            });
        },
        getSummaries: function(param) {
            let vm = this;
            const { columns, data } = param;
            let sums = [];
            columns.forEach((column, index) => {
                if (index === 0) { sums[index] = '总计'; return; }
                if (vm.tableDataTal && (vm.tableDataTal[column.property] + '')) {
                    sums[index] = vm.tableDataTal[column.property];
                } else {
                    sums[index] = '';
                }
            });
            return sums;
        },
        typeChange: function() {
            let vm = this;
            //日期类型，月切换成日   日切换成月时需要格式化时间，要不然组件会出bug不能选择时间
            if (vm.search.begin_time) {
                vm.search.begin_time = utils.eptimes.outTime(vm.search.begin_time, vm.search.date_type == 'month' ? 'yyyy-MM' : 'yyyy-MM-dd');
            }
            if (vm.search.end_time) {
                vm.search.end_time = utils.eptimes.outTime(vm.search.end_time, vm.search.date_type == 'month' ? 'yyyy-MM' : 'yyyy-MM-dd')
            }
        },
        btnSearch: function() {
            let search = this.search;
            if (search.begin_time && search.end_time && search.begin_time > search.end_time) {
                this.$notify({ message: '开始时间不能大于结束时间', type: 'error' });
                return;
            }
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { area_type: 'station', dept_id: '', dept_ids: '', station_id: '', et_region_id: '', date_type: 'day', begin_time: '', end_time: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.$forceUpdate();
            this.getData();
        },
        download: function() {
            let vm = this;
            let url = '/basicoperation/export?';
            if (vm.search.area_type === 'station') {
                vm.search.et_region_id = '';
            } else if (vm.search.area_type === 'dept') {
                vm.search.station_id = '';
                vm.search.et_region_id = '';
            } else if (vm.search.area_type === 'et_region') {
                vm.search.station_id = '';
                vm.search.dept_id = '';
            }
            let data = utils.deepCopy(vm.search);
            for (let index in data) {
                if (data[index]) url += "&" + index + "=" + data[index];
            }
            if (vm.search.dept_ids) {
                let deptStr = utils.setDeptQuery(vm.search.dept_ids);
                url += deptStr ? '&' + deptStr : '';
            }
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
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            vm.getData();
        });
    }
}
</script>
<style scoped>
.el-date-editor.el-input {
    width: 100%;
}
</style>
