<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="times" clearable size="small" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期（使用时间）" end-placeholder="结束日期（使用时间）"></el-date-picker>
                    <my-select-station v-model="station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select size='small' clearable v-model="discount" placeholder="金额" class="cell widthX100">
                        <el-option label="5元" value="5"></el-option>
                        <el-option label="15元" value="15"></el-option>
                    </el-select>
                    <el-select size='small' clearable v-model="status" placeholder="状态" class="cell widthX100">
                        <el-option v-for="(item,index) in statusOption" :key='index' :label="item" :value="index"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <!-- 状态，使用时间，金额，停车场 -->
                </div>
                <div class="right">
                    <el-button @click="importFile" size="small"><i class="fa fa-refresh"></i>导入</el-button>
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column label="订单号" min-width="120" prop="tnum"></el-table-column>
                    <el-table-column label="停车场" prop='station_name' min-width='120'></el-table-column>
                    <el-table-column label="车牌" prop='plate' min-width='100'></el-table-column>
                    <el-table-column label="手机号" prop='mobile' min-width='100'></el-table-column>
                    <el-table-column label="金额" prop='discount' min-width='100'></el-table-column>
                    <el-table-column label="认证时间" prop='issue_date' min-width='110'></el-table-column>
                    <el-table-column label="使用时间" prop='use_time' min-width='110'></el-table-column>
                    <el-table-column label="状态" prop='source' min-width='60'>
                        <template slot-scope="scope">
                            {{statusOption[scope.row.status]}}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- 导入 S-->
            <el-dialog :title="importer.title" :visible.sync="importer.show" width='60%'>
                <el-upload drag :action="upload_url" :headers="header" :limit="1" :on-exceed="exceedHandle" :on-success="importSuccess" :on-error='importError' :file-list="fileList" auto-upload class='tc' accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
                </el-upload>
                <div v-show='successFlag' class="tc green">导入成功</div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
let config = window.etback.config;
import utils from '../../../../utils/utils.js';
export default {
    data: function () {
        let header = {};
        header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        header['Access-Token'] = window.localStorage.getItem('access_token');
        return {
            header: this.header,
            times: '',
            station_id: '',
            status: '',
            discount: '',
            loading: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            typeData: [],
            search: {},
            fileList: [],
            successFlag: false,
            upload_url: '',
            importer: { title: '抵扣金导入', show: false },
            statusOption: { Y: '已使用', N: '未使用', C: '已失效' },
            tableData: [],
        }
    },
    methods: {
        getData: function () {
            var vm = this;
            vm.loading = true;
            let use_begin = '';
            let use_end = '';
            let url = "/wechatactivity/discountLists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (vm.discount) { url = url + '&discount=' + vm.discount; }
            if (vm.status) { url = url + '&status=' + vm.status; }
            if (vm.station_id) { url = url + '&station_id=' + vm.station_id; }
            if (vm.times && vm.times[1]) {
                url = url + '&use_begin=' + vm.times[0] + '&use_end=' + vm.times[1];
            }
            vm.tableData = [];
            utils.fetch(url).then(function (res) {
                vm.loading = false;
                if (res && res.content && res.content.lists) {
                    vm.tableData = res.content.lists || [];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm, 'times', 'station_id', 'status', 'discount');
                }
            });
        },
        importFile() {
            this.importer.show = true;
            this.successFlag = false;
            this.upload_url = config.host + '/wechatactivity/discountImport';
        },
        importSuccess(res, file, fileList) {
            let vm = this;
            if (res && res.code === 0) {
                vm.successFlag = true;
                vm.getData()
            } else {
                vm.successFlag = false;
                vm.$message({ showClose: true, message: res.message, type: 'error' });
            }
        },
        importError(err, file, fileList) {
            this.$message({ showClose: true, message: err || 'upload error', type: 'error' });
        },
        exceedHandle() {
            this.$message({ showClose: true, message: '单次只能传一个文件', type: 'error' });
        },
        exportFile() {
            var vm = this;
            var url = '/wechatactivity/discountExport';
            let use_begin = '';
            let use_end = '';
            if (vm.discount) { url = url + '&discount=' + vm.discount; }
            if (vm.status) { url = url + '&status=' + vm.status; }
            if (vm.station_id) { url = url + '&station_id=' + vm.station_id; }
            if (vm.times && vm.times[1]) {
                url = url + '&use_begin=' + vm.times[0] + '&use_end=' + vm.times[1];
            }
            window.location.href = config.host + url;
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.times = '';
            this.discount = '';
            this.status = '';
            this.station_id = '';
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
