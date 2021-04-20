<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                   <!--  <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-input v-model="search.name" size="small" class="cell widthX120" placeholder="名称"></el-input>
                    <el-input v-model="search.number" size="small" class="cell widthX120" placeholder="编码"></el-input>
                    <el-input v-model="search.mobile" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button> -->
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <!-- <el-table-column prop="id" label="#" min-width="40"></el-table-column> -->
                    <el-table-column prop="robot_mid" label="机器人编号" min-width="90"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="110"></el-table-column>
                    <el-table-column prop="device_name" label="进出口" min-width="120"></el-table-column>
                    <el-table-column label="等待时间" min-width="150">
                        <template slot-scope="scope">{{calwaitTime(scope.row.time)}}</template>
                    </el-table-column>
                    <el-table-column prop="robot_mobile" label="电话" min-width="150"></el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button @click="callClick(scope.row)" plain size="mini">呼叫</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
             <el-dialog :title="seatDialog.title" :visible.sync="seatDialog.show" width="30%">
                <div class="tc">{{seatDialog.content}}</div>
                <span slot="footer" class="dialog-footer">
                <el-button @click="seatDialog.show = false">取 消</el-button>
                <el-button type="primary" @click="goBindSeat">绑定坐席号</el-button>
              </span>
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
                getSeat: '/custom/lists',
            }
        }
        return {
            cfg,
            btnText: { '1': '开闸', '2': '显示' },
            seatDialog: { title: '提示', show: false, content: '' },
            shade: false,
            seat:'',
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            search: { station_id: '', name: '', number: '', mobile: '' },
            tableData: [],
            user: { user_id: '', global_oa: '', global_name: '' },
        }
    },
    mounted() {
        let store = this.$store.state.global.login.data;
        this.user = { user_id: store.user_id, global_oa: store.user_name, global_name: store.user_realname };
        this.getSeatId()
    },
    methods: {
        goBindSeat() {
            let r = { path: '/cService/index' };
            this.$router.push(r);
        },
        getSeatId() {
            let vm = this;
            let url = `${vm.cfg.url.getSeat}?oa=${vm.user.global_oa}`;
            return utils.fetch(url).then((res) => {
                if (typeof res != "undefined") {
                    if (res.code === 0) {
                        if (res.content.length === 0) {
                            vm.seatDialog = { title: '提示', show: true, content: '您未绑定坐席号！' };
                        } else {
                            vm.seat = res.content.seat || '';
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' })
                    }
                }
            })
        },
        calwaitTime(time) {
            let now = new Date().getTime();
            let diff = now - time * 1000;
            return utils.differenceTime(diff, 3)
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        callClick(row) {
            let vm = this;
            let url = '/custom/exhaleHandle';
            let data = { seat:vm.seat, robot_mobile: row.robot_mobile }
            utils.fetch(url, { method: "POST", body: data }).then(res => {
                if(res.code ===0){
                    vm.$message({ showClose: true, message: res.message, type: 'success' })
                    vm.$router.push({ path: '/cService/server', name: '新版智能客服'})
                }else{
                    vm.$message({ showClose: true, message: res.message, type: 'error' })
                }
            })
        },
        btnUndo: function() {
            this.search = { station_id: '', name: '', number: '', mobile: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        getData: function() {
            var vm = this;
            var url = "/custom/exhaleLists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            let searchStr = utils.setQueryString({ ...vm.search });
            url += searchStr ? '&' + searchStr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.tableData = res.content.lists;
                        vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    }
                }
                vm.shade = false;
            })
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
<style>
.el-form-item {
    margin-bottom: 12px;
}
</style>
