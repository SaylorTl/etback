<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.name" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <my-select-type v-model.trim="search.type" size="small" class="cell widthX120" placeholder="优惠券类型"></my-select-type>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button size="small" @click="makeClick">购买生成</el-button>
                </div>
            </div>
            <!--优惠券表格信息-->
            <div class='table box-width'>
                <div class='table box-width'>
                    <el-table :data="tableData" border style="width: 100%" v-loading="shade">
                        <el-table-column label="#" width="60" type="index"></el-table-column>
                        <el-table-column label="商户" prop='merchants_name'></el-table-column>
                        <el-table-column label="停车场" prop='amount' width='100'>
                            <template slot-scope="scope">
                                <span v-for="(item,index) in scope.row.merchant_arr" :key="index"><span v-if="index>0">,</span>{{item.station_name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="优惠券类型" width="150" prop='type_name'></el-table-column>
                        <el-table-column label="优惠券名称" width="150" prop='type_name'></el-table-column>
                        <el-table-column label="单价/折扣" prop='amount' width='80'>
                            <template slot-scope="scope">
                            {{scope.row.amount}}{{scope.row.type_kind=='3'?'%':'元'}}
                            </template>
                        </el-table-column>
                        <el-table-column label="开始日期" prop='start_time' width='110'>
                            <template slot-scope="scope">
                                <span>{{scope.row.start_time === 0?'永久':scope.row.start_time}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="结束日期" prop='end_time' width='110'>
                            <template slot-scope="scope">
                                <span>{{scope.row.end_time === 0?'永久':scope.row.end_time}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间" prop='create_time'></el-table-column>
                        <el-table-column fixed="right" label="操作" width="150">
                            <template slot-scope="scope">
                                <el-button @click="changeSubmit(scope.$index,scope.row)" size="small">编辑</el-button>
                                <el-button @click="showCoupon(scope.row)" size="small">查看订单</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <!--分页部分-->
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- 生产优惠券的接口 -->
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item label="可购买商家:">
                        <my-select-merchant v-model="editInfo.merchantsId" @change="merchantChange" size="small" class="widthP100" placeholder="可购买商家"></my-select-merchant>
                    </el-form-item>
                    <el-form-item label="优惠券类型:">
                        <el-select v-model="editInfo.coupon_type" placeholder="优惠券类型" class="widthP100" size="small" filterable>
                            <el-option v-for="item in couponList" :key="item.id" :label="item.coupon_type" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="永久有效:">
                        <el-radio-group v-model="editInfo.radio">
                            <el-radio :label='2'>是</el-radio>
                            <el-radio :label='1'>否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="有效日期:" v-if="editInfo.radio == 1">
                        <!-- 开始时间 -->
                        <el-date-picker v-model="editInfo.start_time" value-format="yyyy-MM-dd" type="date" placeholder="开始日期" size="small">
                        </el-date-picker>
                        <!-- 结束日期 -->
                        <el-date-picker v-model="editInfo.end_time" value-format="yyyy-MM-dd" type="date" placeholder="结束日期" size="small">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="merchantItem.type=='1'?'折扣:':'单价:'">
                        <el-input v-model="editInfo.amount" size="small" :placeholder="merchantItem.type=='1'?'折扣（0~100）':'单价'">
                            <template slot="append">{{merchantItem.type=='1'?'%':'元'}}</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
export default {
    data: function () {
        return {
            changeVisible: false,
            shade: false,
            inputVisible: false,
            inputValue: "",
            updateVisible: false,
            updateTitle: "",
            merchantItem: {},
            typeData: [],
            couponList: [],
            editInfo: {
                coupon_type: "",
                start_time: "",
                end_time: "",
                amount: "",
                merchants: "",
                id: "",
                radio: 2
            },
            search: { station_id: '', name: "", type: "" },
            tableData: [],
            vendorData: [], //所有的优惠券类型
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            action: "",
            editStatus: false
        };
    },
    methods: {
        //查看订单
        showCoupon: function (row) {
            let arr = row.merchant_arr;
            if (row.merchant_arr.length === 1) {
                let id = arr[0].merchant_id;
                this.$router.push({
                    name: "优惠券订单",
                    path: "/coupon/order",
                    params: { merchant: id }
                });
            } else {
                this.$router.push({ name: "优惠券订单", path: "/coupon/order" });
            }
        },
        getData: function () {
            var vm = this;
            vm.shade = true;
            var url =
                "/coupon/buycreate_lists?page=" +
                vm.pagination.page +
                "&pagesize=" +
                vm.pagination.pagesize;
            if (this.search.name) url += "&merchant_id=" + vm.search.name;
            if (this.search.type) url += "&coupon_type=" + vm.search.type;
            if (this.search.station_id) url += "&station_id=" + vm.search.station_id;
            vm.tableData = [];
            utils.fetch(url).then(function (res) {
                vm.tableData = res.content.lists;
                vm.shade = false;
                vm.pagination.total =
                    typeof res != "undefined" && res.code == 0 ? res.content.total : 0;
            });
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        merchantChange: function (item) {
            //接口命名（coupon/merchant_lists，/coupon/buycreate_lists，/coupon/couType_lists）   属性名和属性值都不统一 ，修改请注意，不要改出bug
            ///  coupon/merchant_lists 时  coupontype=='1'为放行劵
            //   coupon/buycreate_lists时  type_kind=='3'表示放行劵
            //   coupon/couType_lists  时  kind =='3' 表示放行劵
            //   组件  my-select-merchant  type=='1'表示放行劵
            this.merchantItem.type = item.type || item.type_kind == '3' ? 1 : undefined;
            this.couponFilter();
        },
        couponFilter: function () {
            let typeData = utils.deepCopy(this.typeData);
            if (!Array.isArray(typeData)) return;
            let res = [];
            let arr = [];
            //merchantItem.type == '1'表示放行劵
            if (this.merchantItem.type == '1') {
                typeData.forEach(el => {
                    //el.kind === '3'表示放行劵
                    if (el.kind === '3') {
                        arr.push(el);
                    }
                });
                this.editInfo.coupon_type = arr[0].id
            } else {
                typeData.forEach(el => {
                    if (el.kind !== '3') {
                        arr.push(el);
                    }
                });
            }

            this.couponList = arr;
        },
        makeClick: function () {
            this.editStatus = false;
            this.updateVisible = true;
            this.updateTitle = "添加可购买商家";
            this.editInfo = {
                coupon_type: "",
                start_time: "",
                end_time: "",
                amount: "",
                merchantsId: "",
                id: "",
                radio: 2
            };
            this.action = "add";
        },
        getCouponLists: function () {
            let url =  '/coupon/couType_lists?page=1&pagesize=1000';
            utils.fetch(url).then((json) => {
                if (json && json.content && json.content.lists) {
                    this.typeData = json.content.lists;
                }
            });
        },
        //搜索查找
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = {};
            this.pagination.page = 1;
            this.getData();
        },
        //表单提交
        editSubmit: function () {
            var vm = this;
            var edit = vm.editInfo;
            var data, url;
            if (edit.merchantsId == "") {
                vm.$notify({ message: "商户名不能为空", type: "error" });
                return;
            }
            if (edit.coupon_type == "") {
                vm.$notify({ message: "优惠券类型不能为空", type: "error" });
                return;
            }
            if (vm.merchantItem.type == '1') {
                if ((edit.amount < 0||edit.amount == 0)&& edit.amount > 100) {
                    vm.$notify({ message: "折扣范围：大于0，小于等于100", type: "error" });
                    return;
                }
            } else {
                if (edit.amount == "") {
                    vm.$notify({ message:'金额不能为空', type: "error" });
                    return;
                }
            }
            if (vm.merchantItem.type === 1 && (edit.amount > 100)) {
                vm.$notify({ message: "折扣不能大于100", type: "error" });
                vm.editInfo.amount = 100;
                return;
            }
            if (edit.radio == "1") {
                if (edit.start_time == "") {
                    vm.$notify({ message: "开始时间不能为空", type: "error" });
                    return;
                }
                if (edit.end_time == "") {
                    vm.$notify({ message: "结束时间不能为空", type: "error" });
                    return;
                }
            }
            if (vm.action == "add") {
                url = "/coupon/buycreate_add";
                if (vm.editInfo.radio != 1) {
                    data = {
                        coupon_type: edit.coupon_type,
                        merchants: edit.merchantsId,
                        amount: edit.amount
                    };
                } else {
                    data = {
                        coupon_type: edit.coupon_type,
                        end_time: edit.end_time,
                        merchants: edit.merchantsId,
                        start_time: edit.start_time,
                        amount: edit.amount
                    };
                }
            } else {
                url = "/coupon/buycreate_edit";
                if (vm.editInfo.radio != 1) {
                    data = {
                        coupon_type: edit.coupon_type,
                        end_time: 0,
                        merchants: edit.merchantsId,
                        start_time: 0,
                        amount: edit.amount,
                        id: edit.id
                    };
                } else {
                    data = {
                        coupon_type: edit.coupon_type,
                        end_time: edit.end_time,
                        merchants: edit.merchantsId,
                        start_time: edit.start_time,
                        amount: edit.amount,
                        id: edit.id
                    };
                }
            }
            utils.fetch(url, { method: "post", body: data }).then(function (res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.$notify({ message: vm.action == "edit" ? '修改成功' : '添加成功', type: 'success' });
                        vm.getData();
                        vm.updateVisible = false;
                    } else {
                        vm.$notify({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                }
            });
        },
        changeSubmit: function (index, row) {
            var vm = this;
            vm.editStatus = true;
            vm.action = "edit";
            vm.updateVisible = true;
            vm.updateTitle = "编辑可购买商家信息";
            var idarr = row.merchant_arr.map(function (i) {
                return parseInt(i.merchant_id);
            });
            vm.merchantChange(row);
            var sTime = row.start_time,
                eTime = row.end_time;
            if (row.start_time == "永久") {
                vm.editInfo = {
                    id: row.id,
                    coupon_type: row.coupon_type,
                    amount: row.amount,
                    merchants: row.merchants_name,
                    merchantsId: row.merchants,
                    radio: 2
                };
            } else {
                vm.editInfo = {
                    id: row.id,
                    coupon_type: row.coupon_type,
                    start_time: sTime,
                    end_time: eTime,
                    amount: row.amount,
                    merchants: row.merchants_name,
                    merchantsId: row.merchants,
                    radio: 1
                };
            }
        }
    },
    mounted: function () {
        this.getCouponLists();
        this.getData();
    }
};
</script>
<style scoped>
.lastCell {
    /*margin-right: 680px;*/
}

.pagination {
    margin: 15px auto;
}
</style>
