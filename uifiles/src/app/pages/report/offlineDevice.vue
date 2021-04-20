<template>
    <div id='box' class="menu-hide offline-device">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_ids" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.vendor_ids" clearable filterable placeholder="设备商" class="widthX120" size="small">
                        <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                    </el-select>
                    <el-select v-model="search.province_id" class="widthX100" clearable size="small" filterable placeholder="省份">
                        <el-option v-for="item in provinceOption" :key="item.value" :label="item.name" :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select v-model="search.city_id" class="widthX100" clearable size="small" filterable placeholder="城市">
                        <el-option v-for="item in cities" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                    <el-select v-model="day" class="widthX100" clearable size="small" filterable placeholder="时间段" @change="selectDay">
                        <el-option v-for="(v,k) in dayScope" :key="k" :label="v" :value="k">
                        </el-option>
                    </el-select>
                    <el-date-picker v-if="showDatePick" v-model="duringDay" clearable size="small" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" @change="setTimes">
                    </el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportForm" size="small"><i class="fa fa-arrow-down"></i>导出</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" :summary-method="getSummaries" show-summary border fit>
                    <el-table-column type="index" label="#" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="device_name" label="设备名称" min-width="150"></el-table-column>
                    <el-table-column prop="vendor_name" label="设备商" min-width="120"></el-table-column>
                    <el-table-column prop="province_name" label="省份" min-width="120"></el-table-column>
                    <el-table-column prop="city_name" label="城市" min-width="120"></el-table-column>
                    <el-table-column prop="times" label="掉线次数" min-width="120"></el-table-column>
                    <el-table-column prop="total_hour" label="掉线总时长(s)" min-width="120"></el-table-column>
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
    name: 'offlineDevice',
    data: function () {
        return {
            statusmap: { '1': '开票中', '2': '成功', '3': '失败', '4': '已红冲', '5': '待签章' },
            shade: false,
            search: { station_ids: '', vendor_ids: '', province_id: '', city_id: '' },
            province: '',
            day: '',
            begin_time: '',
            end_time: '',
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            vendorData: [],
            provinceOption: [],
            cities: [],
            dayScope: { 3: '近三天', 7: '近七天', 30: '近三十天', 9999: '自定义' },
            showDatePick: false,
            duringDay: '',
            totalSecond: '',
            totalTimes: ''
        }
    },
    methods: {
        setTimes(event) {
            if (!!event) {
                this.begin_time = event[0];
                this.end_time = event[1];
            } else {
                this.begin_time = '';
                this.end_time = '';
                this.duringDay = '';
            }
        },
        selectDay(event) {
            let time = new Date().getTime();
            if (event === '9999') {
                this.showDatePick = true;
            } else if (event === '3') {
                let tempTime = time - 3 * 24 * 60 * 60 * 1000;
                this.begin_time = utils.eptimes.outTime(tempTime, 'yyyy-MM-dd');
                this.end_time = utils.eptimes.outTime(time, 'yyyy-MM-dd');
                this.showDatePick = false;
            } else if (event === '7') {
                let tempTime = time - 7 * 24 * 60 * 60 * 1000;
                this.begin_time = utils.eptimes.outTime(tempTime, 'yyyy-MM-dd');
                this.end_time = utils.eptimes.outTime(time, 'yyyy-MM-dd');
                this.showDatePick = false;
            } else if (event === '30') {
                let tempTime = time - 30 * 24 * 60 * 60 * 1000;
                this.begin_time = utils.eptimes.outTime(tempTime, 'yyyy-MM-dd');
                this.end_time = utils.eptimes.outTime(time, 'yyyy-MM-dd');
                this.showDatePick = false;
            } else {
                this.showDatePick = false;
                this.begin_time = '';
                this.end_time = '';
                this.duringDay = '';
            }
            console.log("时间段：", this.begin_time + ',' + this.end_time);
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getSummaries(param) {
            let vm = this;
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计';
                    return;
                }
                if (column.property === 'times') {
                    sums[index] = vm.totalTimes
                } else if (column.property === 'total_hour') {
                    sums[index] = vm.totalSecond
                } else {
                    sums[index] = ''
                }
            })
            return sums;
        },
        getData: function () {
            var vm = this;
            let url = `/disconnect/count?`;
            let params = {
                ...vm.search,
                begin_time: vm.begin_time,
                end_time: vm.end_time,
                page: vm.pagination.page,
                pagesize: vm.pagination.pagesize
            }
            url += utils.setQueryString(params)
            vm.shade = true;
            utils.fetch(url).then((res) => {
                if (!!res) {
                    if (res.code === 0 && !!res.content && !!res.content.lists && Array.isArray(res.content.lists)) {
                        vm.tableData = res.content.lists;
                        vm.pagination.total = res.content.total;
                        vm.totalSecond = res.content.sum_hour;
                        vm.totalTimes = res.content.sum_times;
                        let cacheFields = ['totalSecond','totalTimes'];
                        utils.setCache(vm,cacheFields);

                    } else {
                        vm.tableData = [];
                        vm.pagination.total = 0;
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                    vm.shade = false
                }
            });
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = { station_ids: '', vendor_ids: '', province_id: '', city_id: '' };
            this.day = '';
            this.begin_time = '';
            this.end_time = '';
            this.duringDay = '';
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        getProvince() {
            let vm = this;
            let url = `/city/province`;
            return utils.fetch(url).then(function (res) {
                vm.provinceOption =
                    typeof res != "undefined" && res.code == 0 ? res.content : [];
            });
        },
        getCity() {
            let vm = this;
            let url = `/city/lists`;
            return utils.fetch(url).then(function (res) {
                if (!!res) {
                    if (res.code === 0 && !!res.content && !!res.content.lists && Array.isArray(res.content.lists)) {
                        vm.cities = res.content.lists;
                    } else {
                        vm.cities = [];
                    }
                } else {
                    vm.cities = [];
                }
            });
        },
        getVendorData: function () {
            let vm = this;
            let url = `/vendor/getDatas`;
            return utils.fetch(url).then(function (res) {
                vm.vendorData =
                    typeof res != "undefined" && res.code == 0 ? res.content : [];
            });
        },
        exportForm() {
            var vm = this;
            let url = `/disconnect/export?`;
            let params = {
                ...vm.search,
                begin_time: vm.begin_time,
                end_time: vm.end_time,
                type: 'count'
            }
            url += utils.setQueryString(params)
            console.log("url:", url, utils.setQueryString(params));
            let filename = utils.eptimes.outTime(new Date(), 'YYYYMMDD') + '设备掉线表.xls';
            utils.rpc.loadfile(url, null, filename,(err) => {
                vm.$message({ showClose:true, message:err.message, type:'error' })
            }).then(function (data) {

            })
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            vm.getProvince();
            vm.getCity();
            vm.getVendorData();
            utils.getTingYunScript();
            let data = utils.getCache();
            let obj = data == '' ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    },
}

</script>
