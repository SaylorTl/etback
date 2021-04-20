
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.plate" size="small" class="cell widthX120" placeholder="车牌"></el-input>
                    <el-select v-model="search.state" size="small" class="cell widthX100" placeholder="状态" clearable>
                        <el-option v-for="(v,k) in stateOption" :key="k" :label="v" :value="k"></el-option>
                    </el-select>
                    <el-select v-model="search.audit_way" size="small" class="cell widthX100" placeholder="审核方式" clearable>
                        <el-option v-for="(v,k) in auditOption" :key="k" :label="v" :value="k"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" min-width="55"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="client_name" label="用户" min-width="85"></el-table-column>
                    <el-table-column label="审核方式" min-width="85">
                        <template slot-scope="scope">
                            <span>{{auditOption[scope.row.audit_way]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="申请时间" min-width="150"></el-table-column>
                    <el-table-column prop="starttime" label="进场开始时间" min-width="120">
                         <template slot-scope="scope">
                          <span :style="{ color:compare(scope.row.starttime)?'#000':'red'}">{{scope.row.starttime}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="stoptime" label="进场结束时间" min-width="130">
                        <template slot-scope="scope">
                           <span :style="{ color:compare(scope.row.stoptime)?'#000':'red'}">{{scope.row.stoptime}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="80">
                        <template slot-scope="scope">
                            <div v-html="statusFmt(scope.row.state)"></div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="120">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.state==0" @click="audit(scope.row,'agree','同意')"  plain size="mini">同意</el-button>
                        <el-button v-if="scope.row.state==0" @click="audit(scope.row,'refuse','拒绝')"  type="danger" plain size="mini">拒绝</el-button>
                        <el-button v-if="scope.row.state==1&&(compare(scope.row.stoptime))" @click="audit(scope.row,'cancel','取消')" type="warning" plain size="mini">取消</el-button>
                               <!-- <el-button v-if="scope.row.state==1" @click="audit(scope.row,'cancel','取消')" type="warning" plain size="mini">取消</el-button> -->
                        <el-button v-if="scope.row.state==1" @click="audit(scope.row,'rewire','重发')"  type="primary" plain size="mini">重发</el-button> 
                        <el-button v-if="scope.row.state!=0" @click="audit(scope.row,'reset','恢复')"  type="primary" plain size="mini">恢复</el-button> 
                    </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>

</template>

<script>
import utils from '../../../utils/utils.js';
export default {
    data: function () {
        return {
            shade: false,
            search: { station_id: '', audit_way: '', state: '', plate: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            stateOption: { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '取消（管理员）',4:'取消（用户）' },
            auditOption: { manual: '人工审核', auto: '系统审核' }
        }
    },
    methods: {
        getData: function () {
            var vm = this;
            vm.shade=true;
            var url = '/bookingentry/lists?page=' + vm.pagination.page + '&pagesize=' + vm.pagination.pagesize;
            var querystr = utils.setQueryString(vm.search);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            vm.tableData = [];
            utils.fetch(url).then(function (json) {
                vm.shade=false;
                if (json && json.content && Array.isArray(json.content.lists)) {
                    vm.tableData = json.content.lists;
                    vm.pagination.total = json.content.total;
                    utils.setCache(vm);
                }
                vm.shade = false;
            });
        },
        compare:function(stime){
            if(!stime) return false;
            let otime=new Date(stime);
            let ntime=new Date();
             return otime>ntime
        },
        statusFmt: function (cellValue) {
            if (cellValue == 3) {
                return '<span style="color:#E6A23C;">取消（管理员）</span>';
            } else if (cellValue == 4) {
                return '<span style="color:#E6A23C;">取消（用户）</span>';
            }else if (cellValue == 1) {
                return '<span style="color:#67C23A;">已通过</span>';
            } else if (cellValue == 2) {
                return '<span style="color:red;">已拒绝</span>';
            } else if (cellValue == 0) {
                return "待审核";
            } else {
                return cellValue;
            }
        },
        audit: function (row, type,t) {
            let vm = this;
            this.$confirm('确认' + t + '审核？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let url = '/bookingentry/audit?id=' + row.id + '&handle=' + type;
                utils.fetch(url).then(function (json) {
                    vm.getData();
                    let msg=json.message||json||'系统异常';
                    vm.$message({ showClose: true, message: msg}); 
                });
            }).catch(() => {
                vm.$message({ type: 'info', message: '已取消' });
            });
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = { station_id: '', audit_way: '', state: '', plate: '' };
            this.getData();
        },
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
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
