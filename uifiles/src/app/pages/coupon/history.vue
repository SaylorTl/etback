<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.name" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model="search.station" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.status" size="small" class="cell widthX100" placeholder="状态">
                        <el-option label="未领取" value="0"></el-option>
                        <el-option label="已领取" value="1"></el-option>
                        <el-option label="已使用" value="2"></el-option>
                    </el-select>
                    <el-date-picker v-model="search.lq_start_time" value-format="yyyy-MM-dd" type="date" placeholder="领取开始时间" size="small" style="width:130px"></el-date-picker>
                    <el-date-picker v-model="search.lq_end_time" value-format="yyyy-MM-dd" type="date" placeholder="领取结束时间" size="small" style="width:130px"></el-date-picker>
                    <el-input v-model="search.batch" small='size' placeholder="优惠券批次" class="widthX100" size="small"></el-input>
                    <el-input v-model="search.plate" small='size' placeholder="车牌" class="widthX100" size="small"></el-input>
                    <el-button @click="btnMore" class="cell" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" class="cell" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' class="cell" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class='right'>
                    <!-- <el-button v-if="authCheck('优惠劵列表批量生成')" size="small" @click="makeClick">批量生成</el-button> -->
                    <el-button size="small" @click="exportCoupon" :loading="btnLoading">导出</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                <my-select-type v-model.trim="search.type" size="small" class="cell" style="width:135px" placeholder="优惠券类型"></my-select-type>
                <el-input v-model="search.cnum" small='size' placeholder="优惠券编码" class="widthX120" size="small"></el-input>
                <el-date-picker v-model="search.sy_start_time" value-format="yyyy-MM-dd" type="date" placeholder="使用开始日期" size="small" style="width:145px"></el-date-picker>
                <el-date-picker v-model="search.sy_end_time" value-format="yyyy-MM-dd" type="date" placeholder="使用结束日期" size="small" style="width:145px"></el-date-picker>
                <el-select v-model="search.recevie_type" filterable clearable placeholder="领取方式" size="small">
                    <el-option v-for="(item,index) in recevieOPtion" :key="index" :label="item" :value="index"></el-option>
                </el-select>
            </div>
            <!--优惠券表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="dataLoading">
                    <el-table-column label="#" prop='id' width='60' type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand" v-loading="loadInfo">
                                <el-form-item label="大区/事业部">
                                    <span>{{ props.row.area_name+"/"+props.row.dept_name }}</span>
                                </el-form-item>
                                <el-form-item v-show="!(props.row.type_kind== '放行券')" label="已用/总数">
                                    <span>{{ props.row.used_num + "/" + props.row.groupNum }}</span>
                                </el-form-item>
                                <el-form-item label="有效期">
                                    <span>{{props.row.start_time + "-" + props.row.end_time }}</span>
                                </el-form-item>
                                <el-form-item label="创建方式">
                                    <span>{{ props.row.create_type }}</span>
                                </el-form-item>
                                <el-form-item label="编码">
                                    <span>{{ props.row.cnum }}</span>
                                </el-form-item>
                                <el-form-item label="进场时间">
                                    <span>{{ props.row.arrival_time }}</span>
                                </el-form-item>
                                <el-form-item label="出场时间">
                                    <span>{{ props.row.departure_time }}</span>
                                </el-form-item>
                                <el-form-item label="进场道闸">
                                    <span>{{ props.row.arrival_device_name}}</span>
                                </el-form-item>
                                <el-form-item label="出场道闸">
                                    <span>{{ props.row.departure_device_name}}</span>
                                </el-form-item>
                                <el-form-item label="领取方式">
                                    <span>{{ props.row.recevie_type}}</span>
                                </el-form-item>
                                <el-form-item label="应收金额">
                                    <span>{{ props.row.temp}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="批次" prop='batch' min-width='50'></el-table-column>
                    <el-table-column label="商家" prop='merchant_name' min-width='150'></el-table-column>
                    <el-table-column label="车场" prop='station_name' min-width='100'></el-table-column>
                    <el-table-column label="名称" prop='type_name' min-width='130'></el-table-column>
                    <el-table-column label="优惠券面额" prop='denomination' min-width='90'></el-table-column>
                    <el-table-column label="购买金额" prop='buy_amount' min-width='60'></el-table-column>
                    <el-table-column label="车牌" prop='plate' min-width='80'></el-table-column>
                    <el-table-column label="领取时间" prop='assign_time' min-width='150'></el-table-column>
                    <el-table-column label="使用时间" prop='use_time' min-width='150'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='80'></el-table-column>
                    <el-table-column label="操作" fixed="right" width="60">
                        <template slot-scope="scope">
                            <el-button v-show="scope.row.status===1" @click="back(scope.row)" plain size="mini">撤回</el-button>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column label="停车时间" prop='' min-width="180"></el-table-column>                             -->
                </el-table>
            </div>
            <!--分页部分-->
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item label="分配商家:">
                        <my-select-merchant v-model.trim="editInfo.name" @change="merchantChange" size="small" class="cell" width="193px" placeholder="商家名" @select='getDeviceByStationId($event)'></my-select-merchant>
                    </el-form-item>
                    <el-form-item label="优惠券类型:">
                        <el-select v-model="editInfo.type" filterable clearable placeholder="优惠券类型">
                            <el-option v-for="item in couponList" :key="item.id" :label="item.coupon_type" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="永久有效:">
                        <el-radio-group v-model="radio">
                            <el-radio :label="2">是</el-radio>
                            <el-radio :label="1">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="有效日期:" v-if="radio==1">
                        <!-- 开始时间 -->
                        <el-date-picker v-model="editInfo.start_time" type="date" value-format="yyyy-MM-dd" placeholder="开始日期" size="small">
                        </el-date-picker>
                        <!-- 结束日期 -->
                        <el-date-picker v-model="editInfo.end_time" type="date" value-format="yyyy-MM-dd" placeholder="结束日期" size="small">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="生成数量:">
                        <el-input v-model="editInfo.num" width='193px' size="small" class="cell" trigger-on-focus=false placeholder="生成数量"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">生成</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog title='导出成功' :visible.sync="goDialog.show" width='30%'>
                <p>{{goDialog.msg}}</p>
                <div class="tc">
                    <el-button type="primary" @click="goTodolist">前往待办</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import store from "../../store/store.js";
import utils from "../../../utils/utils.js";
import moment from "moment";
export default {
    data: function () {
        return {
            radio: "1",
            recevieOPtion: { business: '商户分发', owner: '扫码领取', activity: '活动领取', scanticket: '扫小票', auto: '自动领取' },
            shade: false,
            search_more: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            inputVisible: false,
            inputValue: "",
            updateVisible: false,
            updateTitle: "",
            editInfo: {
                num: "",
                end_time: "",
                start_time: "",
                type: "",
                name: "",
                merchant_id: ""
            },
            dataLoading: false,
            search: {
                recevie_type:"",
                type: "",
                phone: "",
                status: "",
                vendor: "",
                name: "",
                plate: "",
                start_time: "",
                end_time: "",
                cnum: "",
                batch: "",
                station: "",
                dept: "",
                lq_start_time: "",
                lq_end_time: "",
                sy_start_time: "",
                sy_end_time: ""
            },
            tableData: [],
            merchantItem: {},
            typeData: [],
            couponList: [],
            statusText: {
                "1": "未领取",
                "2": "禁止领取",
                "3": "过期",
                "4": "已领取",
                "5": "已使用"
            },
            merchantData: [],
            btnLoading: false,
            loadInfo: false,
            filterArr: [],
            couponOptions: [],
            goDialog: { show: false, msg: '' }
        };
    },
    mounted: function () {
        this.getType();
        this.getmerchant();
        this.getCouponLists();
    },
    methods: {
        getCouponLists() {
            let url =  '/coupon/couType_lists?page=1&pagesize=1000';
            utils.fetch(url).then((json) => {
                if (typeof json != "undefined" && json.code == 0) {
                    this.couponOptions = json.content.lists.map(function (k) {
                        return { value: k.id, label: k.coupon_type, kind: k.kind };
                    });
                    this.filterArr = this.couponOptions;
                }
            });
        },
        merchantChange: function (item) {
            this.merchantItem.coupontype = item.type || item.coupon_type_kind == '3' ? 1 : undefined;
            this.couponFilter();
        },
        couponFilter: function () {
            let typeData = utils.deepCopy(this.typeData);
            if (!Array.isArray(typeData)) return;
            let res = [];
            let arr = [];
            if (this.merchantItem.coupontype == '1') {
                typeData.forEach(el => {
                    if (el.kind === '3') {
                        arr.push(el);
                    }
                });
            } else {
                typeData.forEach(el => {
                    if (el.kind !== '3') {
                        arr.push(el);
                    }
                });
            }
            this.editInfo.type = arr[0].id
            this.couponList = arr;
        },
        back: function (row) {
            let vm = this;
            this.$confirm('此操作将撤回已领优惠劵, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let url = "/couponreclaim/execute";
                let param = 'source=oa&coupon_id=' + row.id;
                utils.fetch(url, { method: 'post', body: param }).then(function (res) {
                    if (res && res.code === 0) {
                        vm.$notify({
                            type: 'success',
                            message: '撤回成功!'
                        });
                        vm.getData();
                    } else {
                        vm.$notify({
                            type: 'warning',
                            message: res.message
                        });
                    }
                })

            })
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnMore: function () {
            this.search_more = !this.search_more;
        },
        getmerchant: function () {
            var vm = this;
            vm.shade = true;
            utils
                .fetch(
                    "/coupon/merchant_lists?page=" +
                    vm.pagination.page +
                    "&pagesize=" +
                    vm.pagination.pagesize
                )
                .then(function (res) {
                    vm.merchantData = res.content.lists;
                    vm.shade = false;
                });
        },
        getType: function () {
            let url = '/coupon/couType_lists?page=1&pagesize=1000';
            utils.fetch(url).then((json) => {
                if (json && json.content && json.content.lists) {
                    this.typeData = json.content.lists;
                }
            });
        },
        getData: function () {
            var vm = this;
            vm.dataLoading = true;
            var url = "/coupon/lists?";
            var param = {
                recevie_type:vm.search.recevie_type,
                station_ids: vm.search.station,
                merchant_id: vm.search.name,
                type: vm.search.type,
                plate: vm.search.plate,
                cnum: vm.search.cnum,
                status: vm.search.status,
                sy_start_time: vm.search.sy_start_time,
                sy_end_time: vm.search.sy_end_time,
                batch: vm.search.batch ? vm.search.batch : "all",
                page: vm.pagination.page,
                pagesize: vm.pagination.pagesize,
                dept_ids: vm.search.dept,
                lq_start_time: vm.search.lq_start_time,
                lq_end_time: vm.search.lq_end_time
            };
            vm.tableData=[];
            utils.fetch(url + utils.setQueryString(param)).then(function (res) {
                for (var key in res.content.lists) {
                    res.content.lists[key]["statusText"] =
                        vm.statusText[res.content.lists[key].status];
                    if (res.content.lists[key].start_time == null) {
                        res.content.lists[key].start_time = "永久有效";
                        res.content.lists[key].end_time = "永久有效";
                    }
                }
                vm.tableData = res.content.lists;
                vm.dataLoading = false;
                vm.pagination.total =
                    typeof res != "undefined" && res.code == 0 ? res.content.total : 0;
                utils.setCache(vm);
            });
        },
        getDeviceByStationId: function (obj) {
            var vm = this;
            vm.getDeviceData(obj.value);
            vm.editInfo.station_id = obj.value;
            if (obj.type === 0) {
                vm.filterArr = vm.couponOptions.filter(item => {
                    return item.kind !== '3'
                })
            } else {
                vm.filterArr = vm.couponOptions.filter(item => {
                    return item.kind === '3'
                })
            }
        },
        getDeviceData: function (id) {
            var vm = this;
            vm.deviceshade = true;
            return utils
                .fetch("/device/getDatas?station_id=" + id)
                .then(function (res) {
                    vm.currentStationDevices =
                        typeof res != "undefined" && res.code == 0 ? res.content : [];
                    vm.deviceshade = false;
                });
        },
        makeClick: function () {
            this.updateVisible = true;
        },
        exportCoupon: function () {
            var vm = this;
            let url = '/couponexport/deliver?';
            var obj = {
                station_ids: vm.search.station,
                merchant_id: vm.search.name,
                type: vm.search.type,
                plate: vm.search.plate,
                cnum: vm.search.cnum,
                status: vm.search.status,
                sy_start_time: vm.search.sy_start_time,
                sy_end_time: vm.search.sy_end_time,
                batch: vm.search.batch || "all",
                dept_ids: vm.search.dept,
                lq_start_time: vm.search.lq_start_time,
                lq_end_time: vm.search.lq_end_time
            };
            var param = utils.setQueryString(obj);
            url += param ? param : '';
            //   var filename = moment().format("YYYYMMDD") + "优惠券.csv";
            utils.fetch(url).then(function (res) {
                if (res.code === 0) {
                    //vm.$message({ showClose:true, message:res.message, type:'success' });
                    vm.goDialog.show = true;
                    vm.goDialog.msg = res.message;
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
            });
        },
        goTodolist() {
            this.$router.push({ path: '/todolist' })
        },
        //查看批次
        // showBatch:function(id){
        //     this.$router.push({ name:'优惠券批次',path:'/coupon/batch', params:{merchant_id:id} })
        // },
        //重置按钮
        btnUndo: function () {
            this.times = [];
            (this.search = {
                recevie_type:"",
                type: "",
                phone: "",
                status: "",
                vendor: "",
                name: "",
                start_time: "",
                end_time: "",
                cnum: "",
                batch: "",
                station: "",
                dept: "",
                lq_start_time: "",
                lq_end_time: "",
                sy_start_time: "",
                sy_end_time: ""
            }),
                (this.pagination.page = 1);
            this.getData();
        },
        //查找
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        //提交处理的程序；
        editSubmit: function () {
            var vm = this,
                data;
            var edit = vm.editInfo;
            var url = "/coupon/batch_create";
            if (edit.name == "") {
                vm.$message({ message: "商户名不能为空", type: "error" });
                return;
            }
            if (edit.type == "") {
                vm.$message({ message: "优惠券类型不能为空", type: "error" });
                return;
            }
            if (vm.radio == 1) {
                if (edit.start_time == "") {
                    vm.$message({ message: "开始时间不能为空", type: "error" });
                    return;
                }
                if (edit.end_time == "") {
                    vm.$message({ message: "结束时间不能为空", type: "error" });
                    return;
                }
            }
            if (vm.radio != 1) {
                var data = {
                    merchant_id: vm.editInfo.station_id,
                    num: Number(vm.editInfo.num),
                    type: Number(vm.editInfo.type)
                };
            } else {
                var data = {
                    end_time: edit.end_time,
                    merchant_id: vm.editInfo.station_id,
                    num: Number(vm.editInfo.num),
                    start_time: edit.start_time,
                    type: Number(vm.editInfo.type)
                };
            }
            utils.fetch(url, { method: "post", body: data }).then(function (res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.updateVisible = false;
                        vm.getData();
                    } else {
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                }
            });
        },
        authCheck: function (tag) {
            return utils.authCheck(this, tag);
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            var data = utils.getCache();
            var obj = data == "" ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        })
    }
};
</script>
<style scope>
.pagination {
    margin: 15px auto;
}
</style>
