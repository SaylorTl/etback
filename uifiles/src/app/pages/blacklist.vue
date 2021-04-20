<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.plate" size="small" class="cell widthX150" placeholder="车牌"></my-select-plate>
                    <el-select size="small" v-model="search.status" clearable placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="status" label="状态" width="120">
                        <template slot-scope="scope">
                            <div v-html="checkstatus(scope.row.status)"></div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" width="180"></el-table-column>
                    <el-table-column prop="plate" label="车牌" width="100"></el-table-column>
                    <el-table-column prop="begin_time" label="开始时间" width="110"></el-table-column>
                    <el-table-column prop="end_time" label="结束时间" width="110"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('下发加入黑名单')" @click="delClick(scope.row,'deny')" plain size="mini"><i class="fa fa-credit-card"></i>下发加入黑名单</el-button>
                            <el-button v-if="authCheck('下发解除黑名单')" @click="delClick(scope.row,'cleardenylist')" plain size="mini"><i class="fa fa-credit-card"></i>下发解除黑名单</el-button>
                            <el-button v-if="authCheck('下发加入白名单')" @click="delClick(scope.row,'access')" plain size="mini"><i class="fa fa-credit-card"></i>下发加入白名单</el-button>
                            <el-button v-if="authCheck('下发解除白名单')" @click="delClick(scope.row,'clearaccesslist')" plain size="mini"><i class="fa fa-credit-card"></i>下发解除白名单</el-button>
                            <el-button v-if="authCheck('修改时间')" @click="modifyTime(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改时间</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model="editInfo.station" size="small" class="cell" width='100%' placeholder="停车场" style='top:0' :disabled='!isadd'></my-select-station>
                    </el-form-item>
                    <el-form-item label="车牌号:">
                        <my-select-plate v-model="editInfo.plate" size="small" class="cell" width='100%' placeholder="车牌号" style='top:0' :disabled='!isadd'></my-select-plate>
                    </el-form-item>
                    <el-form-item label="时间范围:">
                        <el-date-picker v-model="editInfo.daterange" :picker-options="pickeroptions" size="small" class="cell widthP100" type="daterange" placeholder="选择时间范围" value-format='yyyy-MM-dd' align="right"></el-date-picker>
                    </el-form-item>
                    <el-form-item v-show='!isadd'>
                        <el-button @click="editSubmit('')" type="primary" size="small">保存</el-button>
                    </el-form-item>
                    <el-form-item v-show='isadd'>
                        <el-button v-if="authCheck('加入白名单')" @click="editSubmit('access')" type="primary" size="small">加入白名单</el-button>
                        <el-button v-if="authCheck('加入黑名单')" @click="editSubmit('deny')" type="primary" size="small">加入黑名单</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show">
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        {{remoteInfo.info.result||''}}
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../utils/utils.js';
export default {
    data: function() {
        return {
            shade: false,
            updateVisible: false,
            updateTitle: '',
            isadd: true,
            modifyTimestatus: '',
            blacklist_id: '',
            remoteInfo: { title: '', show: false, info: {} },
            editInfo: { station: '', plate: '', daterange: '' },
            search: { station: '', plate: '', status: 'deny' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            pickeroptions: { disabledDate(time) { let sday = new Date(Date.now());
                    sday.setDate(sday.getDate() - 1); return time.getTime() < sday; } },
            options: [{ value: 'deny', label: '已在黑名单' }, { value: 'access', label: '已在白名单' }, { value: 'clearaccesslist', label: '不在白名单' }, { value: 'cleardenylist', label: '不在黑名单' }]
        }
    },
    methods: {
        checkstatus: function(cellValue) {
            var opt = this.options;
            return cellValue ? opt.find(function(item) {
                return cellValue == item.value
            }).label : '';
        },
        authCheck: function(tag) {
            return utils.authCheck(this, tag);
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        delClick: function(row, n) {
            var vm = this;
            var editData = {
                blacklist_id: row.id,
                station_id: row.station,
                car_id: row.car,
                cmd: n,
                begin_time: row.begin_time,
                end_time: row.end_time
            };
            utils.fetch('/blacklist/update', { method: 'POST', body: editData }).then(function(res) {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.remoteInfo = { show: true, title: res.content.title, info: res.content.info || {} };
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },

        modifyTime: function(row) {
            var vm = this;
            vm.updateVisible = true;
            vm.isadd = false;
            vm.updateTitle = "修改时间";
            vm.editInfo.station = row.station;
            vm.editInfo.plate = row.car;
            vm.editInfo.daterange = [new Date(row.begin_time), new Date(row.end_time)];
            vm.modifyTimestatus = row.status;
            vm.blacklist_id = row.id;
        },
        addClick: function() {
            var vm = this;
            vm.updateVisible = true;
            vm.isadd = true;
            vm.updateTitle = "添加信息";
            vm.editInfo = { station: '', plate: '', daterange: '' }
        },
        editSubmit: function(status) {
            var vm = this;
            if(vm.editInfo.plate == ''){
                vm.$message({ showClose:true, message:'车牌号不能为空', type:'error' }); return;
            }
            if(vm.editInfo.station == ''){
                vm.$message({ showClose:true, message:'停车场不能为空', type:'error' }); return;
            }
            if (vm.editInfo.daterange.length == 0) {
                vm.$message({ showClose: true, message: '起止时间不能为空', type: 'error' });
                return;
            }
            let [begin_time, end_time] = vm.editInfo.daterange;
            var editData = {
                station_id: vm.editInfo.station,
                car_id: vm.editInfo.plate,
                cmd: status || vm.modifyTimestatus,
                begin_time,
                end_time
            };
            if (!status) { editData.blacklist_id = vm.blacklist_id }
            var url = vm.isadd ? '/blacklist/add' : '/blacklist/update';
            utils.fetch(url, { method: 'POST', body: editData }).then(function(res) {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.updateVisible = false;
                        vm.remoteInfo = { show: true, title: res.content.title, info: res.content.info };
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        getData: function() {
            var vm = this;
            var dat = "";
            var station_id = vm.$route.params.station_id;
            if (station_id && !vm.search.station) { vm.search.station = station_id }
            if (this.search.station) dat += "&station_id=" + this.search.station;
            if (this.search.plate) dat += "&car_id=" + this.search.plate;
            if (this.search.status) dat += "&status=" + this.search.status;
            let { page, pagesize } = vm.pagination;
            var url = `/blacklist/lists?page=${page}&pagesize=${pagesize}${dat}`;
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                utils.setCache(vm);
                vm.shade = false
            });
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { station: '', plate: '', status: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.$route.params.station_id = '';
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