<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <!-- <el-input v-model.trim="search.code" size="small" class="cell widthX120"  placeholder="券码"></el-input> -->
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.amount" size="small" class="cell widthX100"  placeholder="金额"></el-input>
                    <el-select size="small" v-model="search.state" clearable placeholder="购买状态" class="widthX100" >
                        <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="search.channel" clearable placeholder="渠道搜索" class="widthX100" >
                        <el-option v-for="(k,v) in channelOptions" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="importClick" size="small"><i class="fa fa-arrow-up"></i>导入</el-button>
                    <el-button @click="exportClick" size="small"><i class="fa fa-arrow-down"></i>导出</el-button>
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept" :hideDefault='true'></my-linkage-dept>
                <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                <el-date-picker v-model="search.start_buy_date" size="small" type="datetime" placeholder="购买开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.end_buy_date" size="small" type="datetime" placeholder="购买结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-input v-model.trim="search.tnum" size="small" class="cell widthX250"  placeholder="易停订单号"></el-input>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="订单号:"><span>{{ props.row.tnum }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="渠道:"><span>{{channelOptions[props.row.channel]}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="40"></el-table-column>
                    <!-- <el-table-column prop="code" label="券码" min-width="120"></el-table-column> -->
                    <el-table-column label="用户" min-width="140">
                        <template slot-scope="scope">
                            <span>{{scope.row.user_name+'/'+scope.row.user_phone}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="store_link" label="门店链接" min-width="120"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column prop="state_name" label="状态" min-width="50"></el-table-column>
                    <el-table-column prop="buy_date" label="购买时间" min-width="110"></el-table-column>
                    <el-table-column prop="expiry_date" label="过期时间" min-width="90"></el-table-column>
                    <el-table-column prop="used_date" label="使用时间" min-width="110"></el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改</el-button>
                            <el-button @click="delClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show">
                <el-form :model="editInfo.info" label-width="120px">
                   <!--  <el-form-item label="券码:">
                        <el-input v-model="editInfo.info.code" :disabled='!isadd'></el-input>
                    </el-form-item> -->
                    <el-form-item label="金额:">
                        <el-input v-model="editInfo.info.amount"></el-input>
                    </el-form-item>
                    <el-form-item label="门店链接:">
                        <el-input v-model="editInfo.info.store_link"></el-input>
                    </el-form-item>
                    <el-form-item label="状态:">
                        <el-select size="small" v-model="editInfo.info.state" :disabled='!isadd' clearable placeholder="请选择">
                            <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="过期时间:">
                        <el-date-picker v-model="editInfo.info.expiry_date" size="small" type="date" placeholder="选择日期" class="widthP100" value-format="yyyy-MM-dd">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="uploadFile.title" :visible.sync="uploadFile.show">
                <el-radio-group v-model="uploadFile.type" @change='typeChange'>
                    <el-radio label="all">洗车券导入</el-radio>
                    <el-radio label="paid">已购洗车券导入</el-radio>
                </el-radio-group>
                <el-upload class='tc' drag :action="actionurl" :headers="cfg.header" :file-list="fileList" :on-success='importSuccess' :on-error='importError'>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                </el-upload>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import moment from 'moment';
let config = window.etback.config;
export default {
    data: function() {
        let header = {};
        header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        header['Access-Token'] = window.localStorage.getItem('access_token');
        let cfg = {
            url: {
                list: '/carwash/lists',
                update: '/carwash/update',
                add: '/carwash/add',
                del: '/carwash/delete',
                import: '/carwash/upload', //args:file
                userimport: '/carwash/otherupload', //用户信息导入
            },
            header
        }
        return {
            config,
            cfg,
            actionurl: config.host + cfg.url.import,
            shade: false,
            search_more: false,
            isadd: true,
            editInfo: { show: false, title: '', saveloading: false, info: { code: '', amount: '', store_link: '', state: '', expiry_date: '' } },
            uploadFile: { show: false, title: '洗车券导入', type: '' },
            search: { code: '', mobile: '', amount: '', state: '', dept: '', station_id: '', start_buy_date: '', tnum: '', channel: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            fileList: [],
            stateOptions: [{ value: 0, label: '未购买' }, { value: 1, label: '已购买' }, { value: 2, label: '已使用' }],
            channelOptions: { 'et': 'E停', 'czy': '彩之云' }
        }
    },
    methods: {
        typeChange() {
            this.fileList = [];
            let url = this.uploadFile.type == 'all' ? this.cfg.url.import : this.cfg.url.userimport;
            this.actionurl = this.config.host + url;
        },
        importSuccess(res, file, fileList) {
            let vm = this;
            if(typeof(res) != 'undefined'){
                if (res.code === 0) {
                    vm.$message({ showClose: true, message: res.message, type: 'success' });
                    vm.uploadFile.show = false;
                    vm.getData();
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
            }
        },
        importError(err, file, fileList) {
            this.$message({ showClose: true, message: err || 'upload error', type: 'error' });
        },
        importClick() {
            this.uploadFile.show = true;
            this.uploadFile.type = 'all';
            this.fileList = [];
        },
        exportClick(){
            let vm = this;
            let { ...searchs } = vm.search;
            var param = utils.setQueryString(searchs)
            var filename = moment().format('YYYYMMDD') + '洗车券列表.xls';
            utils.rpc.loadfile('/carwash/export?'+ param, null, filename).then(function(data){

            })
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        delClick: function(row) {
            var vm = this;
            var editData = { id: row.id };
            utils.fetch(vm.cfg.url.del, { method: 'POST', body: editData }).then(function(res) {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.$message({ showClose: true, message: '删除成功', type: 'error' });
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        updateClick(row) {
            let vm = this;
            vm.isadd = false;
            let {   amount, store_link, state, expiry_date, id } = row;
            vm.editInfo = { show: true, title: '修改信息', saveloading: false, info: { id,  amount, store_link, state, expiry_date } };
        },
        addClick: function() {
            var vm = this;
            vm.isadd = true;
            vm.editInfo = { show: true, title: '添加信息', saveloading: false, info: {   amount: '', store_link: '', state: '', expiry_date: '' } };
        },
        editSubmit: function() {
            var vm = this;
            var editData = vm.editInfo.info;
            var url = vm.isadd ? vm.cfg.url.add : vm.cfg.url.update;
            if (editData.store_link==='') {
                vm.$message({ showClose: true, message: '门店链接不能为空', type: 'error' });
                return;
            }
            if (!editData.amount) {
                vm.$message({ showClose: true, message: '洗车券金额不能为空', type: 'error' });
                return;
            }
            if (!editData.expiry_date) {
                vm.$message({ showClose: true, message: '过期时间不能为空', type: 'error' });
                return;
            }
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
                vm.shade = false
            });
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = {   mobile: '', amount: '', state: '', dept: '', station_id: '', start_buy_date: '', tnum: '', channel: '' };
            this.search_more = false;
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },

    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            vm.getData();
        });
    },
}
</script>
