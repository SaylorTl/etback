<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="times" clearable size="small" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期(更新时间)" end-placeholder="结束日期(更新时间)"></el-date-picker>
                    <el-input v-model.trim="source" size="small" class="cell widthX100" placeholder="来源"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                </div>
            </div>
            <!--商家表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column label="序号" min-width="40" prop="id"></el-table-column>
                    <el-table-column label="车牌" prop='plate' min-width='100'></el-table-column>
                    <el-table-column label="手机号" prop='mobile' min-width='100'></el-table-column>
                    <el-table-column label="openid" prop='openid' min-width='150'></el-table-column>
                    <el-table-column label="创建时间" prop='created_at' min-width='110'></el-table-column>
                    <el-table-column label="更新时间" prop='updated_at' min-width='110'></el-table-column>
                    <el-table-column label="来源" prop='source' min-width='60'></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
let config = window.etback.config;
import utils from '../../../../utils/utils.js';
export default {
    data: function () {
        return {
            loading: false,
            times: [],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            typeData: [],
            source:'',
            tableData: [],
        }
    },
    methods: {
        getData: function () {
            let vm = this;
            vm.loading = true;
            let updated_begin = '';
            let updated_end = '';
            let url = "/wechatactivity/userLists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (vm.source) {
                url = url + '&source=' + vm.source;
            }
            if (vm.times && vm.times[1]) {
                url = url + '&updated_begin=' + vm.times[0]+'&updated_end='+vm.times[1];
            }
            vm.tableData = [];
            utils.fetch(url).then(function (res) {
                vm.loading = false;
                if (res && res.content && res.content.lists) {
                    vm.tableData = res.content.lists || [];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm,['times','source']);
                }
            });
        },
        exportFile() {
            var vm = this;
            var url = '/wechatactivity/userExport';
            let updated_begin = '';
            let updated_end = '';
            if (vm.source) {
                url = url + '&source=' + vm.source;
            }
            if (vm.times && vm.times[1]) {
                url = url + '&updated_begin=' + vm.times[0]+'&updated_end='+vm.times[1];
            }
            window.location.href = config.host + url;
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.source='';
            this.times='';
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
