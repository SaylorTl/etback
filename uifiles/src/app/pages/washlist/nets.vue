<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.net_name" size="small" class="cell widthX150"  placeholder="网点名称"></el-input>
                    <el-select size="small" v-model="search.action" clearable placeholder="功能" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.actions" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="search.status" clearable placeholder="状态" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.status" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-date-picker v-model="search.begintime" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                    <el-date-picker v-model="search.endtime" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
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
                    <el-table-column prop="cellID" label="网点id" width="50"></el-table-column>
                    <el-table-column prop="net_name" label="网点名称" min-width="120"></el-table-column>
                    <el-table-column prop="address" label="地址" min-width="180"></el-table-column>
                    <el-table-column prop="action_name" label="功能" min-width="100"></el-table-column>
                    <el-table-column label="状态" min-width="100">
                        <template slot-scope="scope">
                            <span>{{cfg.status[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="120"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="120"></el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show">
                <el-form :model="editInfo.info" label-width="120px">
                    <el-form-item label="网点名称:">
                        <el-input size="small"  v-model.trim ="editInfo.info.net_name"></el-input>
                    </el-form-item>
                    <el-form-item label="网点id:">
                        <el-input size="small"  v-model.trim ="editInfo.info.cellID"></el-input>
                    </el-form-item>
                    <el-form-item label="地址:">
                        <el-input size="small"  v-model.trim ="editInfo.info.address"></el-input>
                    </el-form-item>
                    <el-form-item label="功能:">
                        <el-checkbox-group v-model="editInfo.info.action">
                            <el-checkbox v-for="(v,k) in cfg.actions" :value='k' :label="k" :key="k">{{v}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <el-form-item label="状态:">
                        <el-select size="small" v-model="editInfo.info.status"  placeholder="状态" class="widthX100" >
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
                list: '/flashbox/washLists',
                update: '/flashbox/washUpdate',
                add: '/flashbox/washAdd',
            },
            status: { 'Y': '启用', 'N': '禁用' },
            actions: { 'wash': '洗车', 'dust': '除尘', 'disinfect': '消毒' },
        }
        return {
            cfg,
            shade: false,
            isadd: true,
            editInfo: { show: false, title: '', saveloading: false, info: { net_name: '',cellID: '', address: '', action: [], status: '' } },
            search: { net_name: '', action: '', status: '', begintime: '', endtime: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
        }
    },
    methods: {
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        updateClick(row) {
            let vm = this;
            vm.isadd = false;
            let { net_name,cellID, address, action, status, id: wash_id } = row;
            vm.editInfo = { show: true, title: '修改信息', saveloading: false, info: { net_name,cellID, address, action, status, wash_id } };
        },
        addClick() {
            var vm = this;
            vm.isadd = true;
            vm.editInfo = { show: true, title: '添加信息', saveloading: false, info: { net_name: '', cellID: '', address: '', action: [], status: 'Y' } };
        },
        editSubmit() {
            var vm = this;
            var editData = vm.editInfo.info;
            var url = vm.isadd ? vm.cfg.url.add : vm.cfg.url.update;
            if (!editData.net_name || !editData.address|| !editData.cellID) {
                vm.$message({ showClose: true, message: '网点名称、id、地址不能为空', type: 'error' });
                return;
            }
            if (editData.action.length == 0) {
                vm.$message({ showClose: true, message: '请选择功能', type: 'error' });
                return;
            }
            let data = Object.assign({}, editData);
            data.action = editData.action.join(',');
            vm.editInfo.saveloading = true;
            utils.fetch(url, { method: 'POST', body: data }).then(function(res) {
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
            this.search = { net_name: '', action: '', status: '', begintime: '', endtime: '' };
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
