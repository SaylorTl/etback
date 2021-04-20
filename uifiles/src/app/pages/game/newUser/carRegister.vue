<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="times" clearable size="small" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期（创建时间）" end-placeholder="结束日期（创建时间）"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column label="序号" min-width="40" prop="id"></el-table-column>
                    <el-table-column label="车牌" prop='plate' min-width='100'></el-table-column>
                    <el-table-column label="手机号" prop='mobile' min-width='100'></el-table-column>
                    <el-table-column label="行驶证" min-width='80'><template slot-scope="scope">
                            <el-button size="small" @click="seeInfo(scope.row,'xsz')">行驶证</el-button>
                        </template></el-table-column>
                    <el-table-column label="驾驶证" min-width='80'><template slot-scope="scope">
                            <el-button size="small" @click="seeInfo(scope.row,'jsz')">驾驶证</el-button>
                        </template></el-table-column>
                    <el-table-column label="创建时间" prop='created_at' min-width='100'></el-table-column>
                    <el-table-column label="来源" prop='source' min-width='60'></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
        <el-dialog title="证件信息" :visible.sync="updateVisible" custom-class="minwidth">
            <div class="flex flex-wrap flex-center">
                <div v-for="(item,index) in info" :key="index" class="flex">
                    <span class="head">{{item.item}}</span>
                    <span class="con">{{item.itemstring}}</span>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateVisible = false">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
let config = window.etback.config;
import utils from '../../../../utils/utils.js';
export default {
    data: function () {
        return {
            updateVisible: false,
            times: '',
            loading: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            info: [],
            tableData: [],
        }
    },
    methods: {
        getData: function () {
            var vm = this;
            vm.loading = true;
            let created_begin = '';
            let created_end = '';
            let url = "/wechatactivity/carLists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (vm.times && vm.times[1]) {
                url = url + '&created_begin=' + vm.times[0] + '&created_end=' + vm.times[1];
            }
            vm.tableData = [];
            utils.fetch(url).then(function (res) {
                vm.loading = false;
                if (res && res.content && res.content.lists) {
                    vm.tableData = res.content.lists || [];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm, ['times']);
                }
            });
        },
        exportFile() {
            var vm = this;
            var url = '/wechatactivity/carExport';
            let created_begin = '';
            let created_end = '';
            if (vm.times && vm.times[1]) {
                url = url + '&created_begin=' + vm.times[0] + '&created_end=' + vm.times[1];
            }
            window.location.href = config.host + url;
        },
        seeInfo(row, type) {
            let vm = this;
            let info = row[type];
            console.log('66')
            vm.info = [];
            if (info) {
                vm.info = info;
            }
            vm.updateVisible = true;
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.times = '';
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData()
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
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
<style scoped>
.flex .head {
    text-align: right;
    padding-right: 20px;
    line-height: 28px;
    width: 110px;
    font-weight: 600;
}
.flex .con {
    line-height: 28px;
    width: 400px;
}
</style>
