<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.tnum" size="small" class="cell widthX250"  placeholder="订单号"></el-input>
                    <el-select size="small" v-model="search.source" clearable placeholder="来源" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.source" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="search.state" clearable placeholder="设备状态" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.state" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="search.status" clearable placeholder="订单状态" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.status" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more"  class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.begintime" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.endtime" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="第三方订单号:"><span>{{ props.row.third_tnum }}</span></el-form-item>
                                <el-form-item label="支付时间:"><span>{{ props.row.paytime }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="net_name" label="网点名称" min-width="120"></el-table-column>
                    <el-table-column prop="tnum" label="订单号" min-width="110"></el-table-column>
                    <el-table-column label="订单状态" min-width="100">
                        <template slot-scope="scope">
                            <span>{{cfg.status[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="设备状态" min-width="100">
                        <template slot-scope="scope">
                            <span>{{cfg.state[scope.row.state]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="订单来源" min-width="100">
                        <template slot-scope="scope">
                            <span>{{cfg.source[scope.row.source]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="40"></el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show" width="40%">
                <el-form :model="editInfo.info" label-width="120px">
                   
                    <el-form-item label="订单状态:">
                       <el-select size="small" v-model="editInfo.info.status" clearable placeholder="订单状态" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.status" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function() {
        let cfg = {
            url: {
                list: '/flashbox/orderLists',
                update: '/flashbox/orderUpdate',
            },
            source: { 'EPWECHAT': '双乾微信', 'CZY': '彩之云' },
            state: { 'Y': '启动成功', 'N':'启动失败'  },
            status: { 'paid': '支付成功', 'created': '已创建', 'invalid': '失效订单', 'refund': '退款', 'canceld': '已取消' },
            type: { 'maintain': '保养' },
        }
        return {
            cfg,
            shade: false,
            search_more: false,
            editInfo: { show: false, title: '', saveloading: false, info: {status: '' } },
            search: { code: '', mobile: '', amount: '', state: '', dept: '', station_id: '', start_buy_date: '', tnum: '', channel: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
        }
    },
    methods: {
        btnMore:function(){
                this.search_more = !this.search_more;
            },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },

        updateClick(row) {
            let vm = this;
            vm.isadd = false;
            let { status, tnum } = row;
            vm.editInfo = { show: true, title: '修改信息', saveloading: false, info: { status, tnum } };
        },
        editSubmit: function() {
            var vm = this;
            var editData = vm.editInfo.info;
            var url =  vm.cfg.url.update;
            vm.editInfo.saveloading = true;
            utils.fetch(url, { method: 'POST', body: editData }).then(function(res) {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.editInfo.show = false;
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                    vm.editInfo.saveloading = false;
                }
            })
        },
        getData: function() {
            var vm = this;
            var url = vm.cfg.url.list + '?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            var { ...searchs } = vm.search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                vm.shade = false;
                utils.setCache(vm);
            });
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { code: '', mobile: '', amount: '', state: '', dept: '', station_id: '', start_buy_date: '', tnum: '', channel: '' };
            this.search_more = false;
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },


    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
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