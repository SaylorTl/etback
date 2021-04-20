
<template>
    <div id='box' class="menu-hide">
        <div class='worker vendor'>
            <div class='condition clearfix box-width'>

            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="id" width="70"></el-table-column>
                    <el-table-column prop="name" label="名称" min-width="110"></el-table-column>
                    <!-- <el-table-column v-if="login.data.user_roleid == 1" prop="account" label="key" min-width="120"></el-table-column>
                    <el-table-column v-if="login.data.user_roleid == 1" prop="secret" label="secret" min-width="180"></el-table-column> -->
                    <el-table-column prop="status" label="状态" min-width="50"></el-table-column>
                    <el-table-column prop="cache" label="cache" min-width="50"></el-table-column>
                    <el-table-column prop="unicode" label="unicode" min-width="65"></el-table-column>
                    <el-table-column prop="ip" label="ip" min-width="130"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="150"></el-table-column>
                    <!-- <el-table-column prop="url" label="url" width="310"></el-table-column> -->
                    <!-- <el-table-column prop="cache_url" label="cache_url" width="230"></el-table-column> -->
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click='jumpto(scope.row)' plain size="mini">厂家平台</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
        <el-dialog title="选择停车场" center :visible.sync="updateVisible" width="2%" custom-class="minwidth300">
            <div>
                <my-select-station v-model.trim="select_station_id" size="small" class="cell widthX250" placeholder="停车场"></my-select-station>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateVisible = false">取消</el-button>
                <el-button type="primary" @click="jumpto(currentRow,'select_station')">跳转厂家平台</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
import utils from '../../utils/utils.js';
export default {
    data: function () {
        return {
            select_station_id: '',
            updateVisible: false,
            shade: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
        }
    },
    computed: {
        login: function () {
            return this.$store.state.global.login;
        }
    },
    created: function () {
        this.getData();
    },
    methods: {
        jumpto: function (row, type) {
            let vm = this;
            if (type === 'select_station' && !this.select_station_id) {
                return vm.$notify({ message: "请选择停车场", type: "error" });
            }
            if ((row.id == '2' && !this.select_station_id) || (row.id == '2' && !type)) {
                this.select_station_id = '';
                this.currentRow = row;
                this.updateVisible = true;
                return
            }
            let url = `/vendor/freeJump?vendor_id=${row.id || this.currentRow.id}&station_id=${this.select_station_id}`;
            utils.fetch(url).then((json) => {
                if (typeof (json) != 'undefined') {
                    if (json.code == 0) {
                        this.select_station_id = '';
                        this.updateVisible = false;
                        var openNewWindow = window.open(json.content, '_blank');
                        if (!openNewWindow || openNewWindow.closed || typeof openNewWindow.closed === 'undefined') {
                            var h = vm.$createElement;
                            vm.$msgbox({
                                title: '提示',
                                message: h('p', null, [
                                    h('span', null, '当前跳转已被拦截，请'),
                                    h('a', {                                        attrs: {
                                            'href': json.content,
                                            'target': "_blank",
                                            'class': 'red'
                                        }                                    }, '点击此处'),
                                    h('span', null, '以进入厂家平台')
                                ])
                            }).catch(e => { console.log(e) })
                        }
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: 'error' });
                    }
                }
            }).catch(() => {
                this.select_station_id = '';
            })
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function () {
            var vm = this;
            var url = '/vendor/lists?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            vm.shade = true;
            utils.fetch(url).then(function (json) {
                vm.tableData = (typeof (json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                vm.pagination.total = (typeof (json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                vm.shade = false;
            });
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function () {
            utils.getTingYunScript();
        });
    },
}

</script>
