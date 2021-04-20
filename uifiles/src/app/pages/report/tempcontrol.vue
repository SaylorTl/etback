<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell" width="154px" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.time_type" size="small" class="cell widthX100" placeholder="时间类型" @change='changeTimeType'>
                        <el-option v-for="(val,key) in cfg.time_type" :key="key" :label="val" :value="key">
                        </el-option>
                    </el-select>
                    <el-date-picker v-model="datetimerange" v-if="switchRange" size="small" type="daterange" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="widthX350" value-format="yyyy-MM-dd"></el-date-picker>
                    <el-date-picker v-model="datetimerange" v-if="!switchRange" size="small" type="datetimerange" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="widthX350" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                    <el-select v-model="search.daily_type" size="small" class="cell widthX100" placeholder="是否合理">
                        <el-option v-for="(val,key) in cfg.daily_type" :key="key" :label="val" :value="key">
                        </el-option>
                    </el-select>
                    <el-select v-model="search.daily_status" size="small" class="cell widthX100" placeholder="状态">
                        <el-option v-for="(val,key) in cfg.daily_status" :key="key" :label="val" :value="key">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550' style="width:100%" show-summary :summary-method="getSum">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="审批时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                                <el-form-item label="上报人:"><span>{{ props.row.report_name }}</span></el-form-item>
                                <el-form-item label="审批人:"><span>{{ props.row.user_name }}</span></el-form-item>
                                <el-form-item label="异常原因:"><span>{{ props.row.remark }}</span></el-form-item>
                                <el-form-item label="上报时间段:"><span>{{ props.row.time_begin }} ～ {{ props.row.time_end }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="140"></el-table-column>
                    <el-table-column prop="time_begin" label="开始时间" width="85"></el-table-column>
                    <el-table-column prop="time_end" label="结束时间" width="85"></el-table-column>
                    <el-table-column prop="sys_rec" label="系统应收" width="64"></el-table-column>
                    <el-table-column prop="sys_real" label="系统实收" width="64"></el-table-column>
                    <el-table-column prop="local_rec" label="本地应收" width="64"></el-table-column>
                    <el-table-column prop="cash_rec" label="现金实收" width="64"></el-table-column>
                    <el-table-column prop="online_rec" label="线上实收" width="64"></el-table-column>
                    <el-table-column prop="coupon_amount" label="优惠券金额" min-width="70"></el-table-column>
                    <el-table-column prop="error_money" label="异常金额" width="64"></el-table-column>
                    <el-table-column label="系统判断" width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.type==="Y"?"合理":"不合理"}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="50">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status=='R'),'green':(scope.row.status=='A')}">{{cfg.daily_status[scope.row.status]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="160">
                        <template slot-scope="scope">
                            <el-button @click="imgshow(scope.row)" plain size="mini"><i class="fa fa-picture-o"></i>凭证</el-button>
                            <el-button v-if="scope.row.status=='C'" @click="opClick(scope.row,'agree')" plain type="success" size="mini"><i class="fa fa-check"></i>同意</el-button>
                            <el-button v-if="scope.row.status=='C'" @click="opClick(scope.row,'refuse')" plain type="danger" size="mini"><i class="fa fa-times"></i>拒绝</el-button>
                            <el-button @click="switchClick(scope.row)" plain size="mini">订单</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
        </div>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
import previewImg from "../../component/previewImg/index.vue";
import compress from "../../../utils/compress.js";
export default {
    data: function() {
        var config = {
            daily_status: { 'R': "已拒绝", 'A': "已同意", 'C': "待审核" },
            daily_type: { 'Y': "合理", 'N': "不合理" },
            time_type: { 'created': '创建时间', 'report': '上报时间', 'agreed': '审批时间' },
        };
        return {
            cfg: config,
            shade: false,
            datetimerange: '',
            search: { station_id: "", daily_status: "", daily_type: "", time_type: "created" },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            sum: [],
            images: { show: false, lists: [] },
            switchRange: false
        };
    },
    components: {
        "preview-img": previewImg
    },
    methods: {
        switchClick(row) {
            // const datetimerange = [`${row.time_begin} 00:00:00`, `${row.time_end} 23:59:59`];
            var r = {
                name: "日报订单",
                path: "order/daily",
                params: { station: row.station, datetimerange: [row.time_begin], paid: 'Y'}
            };
            this.$router.push(r);
        },
        getSum(param) {
            let vm = this;
            if (vm.sum && vm.sum.length === 0) { return [''] }
            let map = { 'cash_rec': 'cash_rec_total', 'coupon_amount': 'coupon_amount_total', 'error_money': 'error_money_total', 'local_rec': 'local_rec_total', 'online_rec': 'online_rec_total', 'sys_real': 'sys_real_total', 'sys_rec': 'sys_rec_total' }
            const { columns } = param;
            const sums = [];
            let obj = vm.sum[0];
            columns.forEach((column, index) => {
                if (index === 1) {
                    sums[index] = '合计';
                    return;
                }
                if (column.property) {
                    let valKey = map[column.property];
                    if (valKey) {
                        sums[index] = obj[valKey]
                    }
                }
            });
            return sums;
        },
        changeTimeType() {
            this.datetimerange = [];
            this.search.begin_time = '';
            this.search.end_time = '';
            if (this.search.time_type === 'report') {
                this.switchRange = true;
            } else {
                this.switchRange = false;
            }
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function() {
            var vm = this;
            var url = "/daily/lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (vm.datetimerange && vm.datetimerange.length === 2) {
                let [begin, end] = vm.datetimerange;
                if (begin == end) {
                    vm.$message({ showClose: true, message: '开始时间和结束时间不能一样', type: 'error' });
                    return;
                }
                vm.search.begin_time = begin;
                vm.search.end_time = end;
            }else {
                vm.search.begin_time = '';
                vm.search.end_time = '';
            }
            let searchStr = utils.setQueryString({ ...vm.search });
            url += searchStr ? '&' + searchStr : '';
            vm.shade = true;
            utils.fetch(url).then(function(json) {
                if (typeof json != "undefined" && json.code == 0) {
                    vm.tableData = json.content.lists;
                    vm.sum = json.content.sum || [];
                    vm.pagination.total = json.content.total;
                } else {
                    vm.tableData = [];
                    vm.sum = [];
                    vm.pagination.total = 0;
                }
                vm.shade = false;
            });
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { station_id: "", daily_status: "", daily_type: "", time_type: "created" };
            this.datetimerange = [];
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        imgshow: function(row) {
            var lists = [];
            try {
                row.images.forEach(function(url, idx) {
                    if (url) {
                        lists.push({ title: "凭证" + (idx + 1), href: url });
                    }
                });
            } catch (e) {
                console.log(e + "凭证下载出错了");
            }
            this.images = { show: true, lists: lists };
        },
        imgClose: function() {
            this.images = { show: false, lists: [] };
        },
        opClick: function(row, type) {
            var vm = this;
            var operate = type === "agree" ? "同意" : "拒绝";
            var str = `您确定要${operate}这条纪录吗?`;
            this.$msgbox({
                title: '提示',
                message: str,
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: function(action, instance, done) {
                    if (action === 'confirm') {
                        vm.agree(row, type)
                        done();
                    } else {
                        done();
                    }
                }
            }).catch(e => { console.log(e) });
        },
        agree: function(row, type) {
            var vm = this;
            let daily_status = type === 'agree' ? 'A' : 'R';
            let body = { daily_id: row.id, daily_status }
            utils.fetch("/daily/update", { method: "POST", body }).then(json => {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.$message({ showClose: true, message: json.message, type: "success" });
                        setTimeout(function() { vm.getData(); }, 1000)
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            })
        },
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            vm.getData();
        });
    }
}
</script>
<style scoped>
.el-form-item {
    margin-bottom: 12px;
}

.el-form-item {
    margin-bottom: 12px;
}
</style>
