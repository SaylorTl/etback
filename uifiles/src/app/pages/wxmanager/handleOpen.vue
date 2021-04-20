<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.vendor_id" placeholder="设备商" size="small" class="widthX120">
                        <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                    </el-select>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                        <el-date-picker
                            v-model="datetimerange"
                            size="small"
                            unlink-panels
                            type="daterange"
                            class="widthX350"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="yyyy-MM-dd">
                        </el-date-picker>

                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="device_name" label="设备名称" min-width="130"></el-table-column>
                    <el-table-column prop="vendor_name" label="设备商" min-width="130"></el-table-column>
                    <el-table-column label="方向" min-width="80">
                        <template slot-scope="scope">
                            <span v-if="scope.row.direction == 'in'">进场</span>
                            <span v-else-if="scope.row.direction == 'out'">出场</span>
                            <span v-else>未知</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="80">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.is_close=='N'),'green':(scope.row.is_close=='Y')}">{{statusmap[scope.row.is_close]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="username" label="操作人" min-width="80"></el-table-column>
                    <el-table-column prop="mobile" label="操作人手机" min-width="80"></el-table-column>
                    <el-table-column prop="creationtime" label="操作时间" min-width="80"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function() {
        return {
            datetimerange: [],
            statusmap: { 'N': '关闸失败', "Y": '关闸成功' },
            search: { begin_time: '', end_time: '', mobile: '', station_id: '', vendor_id: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            vendorData: [],
            tableData: [],
            shade: false,
        }
    },
    methods: {
        getVendorData: function () {
            var vm = this;
            var url = "/vendor/getDatas";
            return utils.fetch(url).then(function (res) {
                vm.vendorData =
                    typeof res != "undefined" && res.code == 0 ? res.content : [];
            });
        },
        getData: function() {
            var vm = this;
            var url = '/recover/closeLists?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (this.vendorData.length === 0) {
              vm.getVendorData()
            }
            let search = utils.dealRouteParams(vm);
            if (vm.datetimerange && vm.datetimerange.length === 2) {
                let [begin, end] = vm.datetimerange;
                // if (begin == end) {
                //     vm.$message({ showClose: true, message: '开始时间和结束时间不能一样', type: 'error' });
                //     return;
                // }
                vm.search.begin_time = begin;
                vm.search.end_time = end;
            } else {
                vm.search.begin_time = '';
                vm.search.end_time = '';
            }
            let { ...searchs } = search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                // vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                // vm.pagination.total = res.content.total;
                if (typeof res != "undefined" && res.code == 0) {
                    vm.tableData = res.content.lists;
                    vm.pagination.total = res.content.total;
                } else {
                    vm.tableData = [];
                    vm.pagination.total = 0;
                }
                utils.setCache(vm);
                vm.shade = false
            });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { begin_time: '', end_time: '', mobile: '', station_id: '', vendor_id: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.datetimerange = [];
            this.getData();
        },

    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            // utils.getTingYunScript();
            // var hasParams = utils.hasRouteParams(vm.$route.params);
            // if(hasParams){vm.getData();return};
            // var data = utils.getCache();
            // var obj = data == '' ? {} : JSON.parse(data);
            // if (obj.tableData && obj.tableData.length > 0) {
            //     utils.getCacheItem(vm, obj);
            // } else {
            //     vm.getData();
            // }
            vm.getData();
        });
    },
}
</script>
