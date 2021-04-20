<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell widthX120" placeholder="车牌"></my-select-plate>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-select v-model="search.status" placeholder="状态" size="small" class="widthX120">
                        <el-option v-for="(val,key) in statusmap" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column label="大区/事业部" min-width="180">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="device_name" label="进场道闸" min-width="90"></el-table-column>
                    <el-table-column prop="device_out_name" label="出场道闸" min-width="90"></el-table-column>
                    <el-table-column prop="mobile" label="手机号" min-width="80"></el-table-column>
                    <el-table-column prop="enter_time" label="进场时间" min-width="140"></el-table-column>
                    <el-table-column prop="out_time" label="出场时间" min-width="140"></el-table-column>
                    <el-table-column label="状态" width="80">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status=='N'),'green':(scope.row.status=='Y')}">{{statusmap[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.status=='Y'&&authCheck('无牌车清除纪录')" @click="clearClick(scope.row)" plain size="mini">清除</el-button>
                            <el-button @click="switchClick(scope.row)" plain size="mini">关联</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../utils/utils.js';
export default {
    data: function() {
        return {
            statusmap: { 'N': '离场', "Y": '场内' },
            search: { status: '', mobile: '', station_id: '', car_id: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: false },
            tableData: [],
            shade: false,
        }
    },
    methods: {
        switchClick(row) {
             var r = {
                name: "交易订单",
                path: "/order/payment",
                params: { phone:row.mobile }
            };
            this.$router.push(r);
        },
        clearClick: function(row) {
            var vm = this;
            var str = '您确定清除该用户此次进场纪录';
            this.$msgbox({
                title: '提示',
                message: str,
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: function(action, instance, done) {
                    if (action === 'confirm') {
                        vm.confirmClick(row)
                        done();
                    } else {
                        done();
                    }
                }
            }).catch(e => { console.log(e) });
        },
        confirmClick(row) {
            var vm = this;
            var url = '/unlicense/update';
            utils.fetch(url, { method: "POST", body: "unlicense_id=" + row.id }).then(function(json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            })
        },
        authCheck: function(tag) {
            return utils.authCheck(this, tag);
        },
        getData: function() {
            var vm = this;
            var url = '/carport/unlicenseLists?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            let { ...searchs } = vm.search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
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
            this.search = { status: '', mobile: '', station_id: '', car_id: '' };
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