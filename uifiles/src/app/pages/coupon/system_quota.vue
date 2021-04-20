<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.merchant_id" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <!-- <my-select-type v-model.trim="search.ctype_id" size="small" class="cell" style="width:135px" placeholder="优惠券类型"></my-select-type> -->
                    <el-select v-model="search.ctype_id" placeholder="优惠券类型" class="widthX120" size="small" filterable>
                        <el-option v-for="item in couponList" :key="item.id" :label="item.coupon_type" :value="item.id">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="search.status" clearable placeholder="状态" class="widthX100">
                        <el-option label="成功" value="Y">
                        </el-option>
                        <el-option label="失败" value="N">
                        </el-option>
                    </el-select>
                    <el-input v-model.trim="search.c_user" size="small" class="cell widthX100" placeholder="创建人员"></el-input>
                    <el-input v-model.trim="search.batch" size="small" class="cell widthX100" placeholder="批次号"></el-input>
                    <el-button @click="search_more=!search_more" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button size="small" @click="generate">手动生成</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select size="small" v-model="search.type" clearable placeholder="时间类型" class="widthX100">
                    <el-option label="创建时间" value="1">
                    </el-option>
                    <el-option label="修改时间" value="2">
                    </el-option>
                </el-select>
                <el-date-picker v-model="searchtimes" size="small" type="daterange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
            </div>
            <!--商家表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border v-loading="loading">
                    <el-table-column label="批号" prop='batch' min-width='50'></el-table-column>
                    <el-table-column label="商家" prop='merchant_name' min-width='150'></el-table-column>
                    <el-table-column label="停车场" prop='station_name' min-width='100'></el-table-column>
                    <el-table-column label="优惠券类型" prop='coupon_type' min-width='90'></el-table-column>
                    <el-table-column label="创建人员" prop='c_user' min-width='80'></el-table-column>
                    <el-table-column label="张数" prop='groupNum' min-width='80'></el-table-column>
                    <el-table-column label="剩余张数" min-width='80'>
                        <template slot-scope="scope">
                            {{(scope.row.groupNum-scope.row.used_num)||'-'}}
                        </template>
                    </el-table-column>
                    <el-table-column label="优惠劵有效期" min-width='150'>
                        <template slot-scope="scope">
                            <span v-if="scope.row.start_time === '永久'">永久</span>
                            <span class="flex-column" v-if="scope.row.start_time !== '永久'">
                                <span>{{scope.row.start_time}}</span>
                                <span>{{scope.row.end_time}}</span>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop='creationtime' min-width='150'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='50'>
                        <template slot-scope="scope">
                            <span>{{scope.row.status==='Y'?'成功':'失败'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button plain @click="seeBatch(scope.row)" size="mini">查看批次</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible" custom-class="minwidth">
                <el-form :model="editInfo" label-width="120px">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="分配商家:">
                                <my-select-merchant v-model.trim="editInfo.merchant_id" @change="merchantChange" size="small" placeholder="商家名"></my-select-merchant>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="优惠券类型:">
                                <el-select v-model="editInfo.type" placeholder="优惠券类型" class="widthP100" size="small" filterable>
                                    <el-option v-for="item in couponList" :key="item.id" :label="item.coupon_type" :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="永久有效:">
                                <el-radio-group v-model="radio">
                                    <el-radio :label="2">是</el-radio>
                                    <el-radio :label="1">否</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="生成张数:">
                                <el-input v-model="editInfo.num" width='193px' size="small" class="cell" trigger-on-focus=false placeholder="生成张数"></el-input>
                            </el-form-item>

                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="有效日期:" v-if="radio==1">
                                <el-date-picker v-model="times" class="widthP100" size="small" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateVisible = false">取消</el-button>
                    <el-button type="primary" @click="editSubmit">生成</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function () {
        return {
            radio: 1,
            search_more: false,
            searchtimes: [],
            times: [],
            dateOption: { 1: '每日', 2: '每周', 3: '每月', 4: '永久', 5: '自定义' },
            loading: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            updateVisible: false,
            updateTitle: '',
            merchantItem: {},
            typeData: [],
            couponList: [],
            editInfo: { num: "", end_time: "", start_time: "", type: "", name: "", merchant_id: "" },
            search: { c_user: '', type: '', batch: '', station_id: '', car_id: '', merchant_id: '', ctype_id: '' },
            tableData: [],  //遍历得到的所有商家信息的数组；
        }
    },
    created() {
        this.search.merchant_id = this.$route.query.merchant_id;
        this.getData();
    },
    mounted: function () {
        this.getCouponLists();
    },
    methods: {
        getData: function () {
            var vm = this;
            vm.loading = true;
            vm.tableData = [];
            let data = utils.deepCopy(vm.search);
            data.create_start_time = '';
            data.modify_start_time = '';
            data.create_end_time = '';
            data.modify_end_time = '';
            if (data.type && vm.searchtimes) {
                let timeType = data.type === '1' ? 'create_' : 'modify_';
                data[timeType + 'start_time'] = vm.searchtimes[0];
                data[timeType + 'end_time'] = vm.searchtimes[1];
            }
            data.type=undefined;
            var url = "/couponregular/history?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            for (let index in data) {
                if (data[index]) url += "&" + index + "=" + data[index];
            }
            utils.fetch(url).then(function (res) {
                vm.loading = false;
                if (typeof (res) != 'undefined' && res.code == 0) {
                    vm.tableData = res.content.lists || [];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }
            });
        },
        getCouponLists() {
            let url  = '/coupon/couType_lists?page=1&pagesize=1000&kind=1';
            utils.fetch(url).then((json) => {
                if (json && json.content && json.content.lists) {
                    this.typeData = json.content.lists;
                }
                this.couponFilter();
            });
        },
        generate: function () {
            var vm = this;
            vm.updateVisible = true;
            vm.updateTitle = "手动生成";
            vm.radio = 1;
            vm.times = [];
            vm.editInfo = { num: "", end_time: "", start_time: "", type: "", name: "", merchant_id: "" };
        },
        seeBatch: function (row) {
            this.$router.push({ path: '/coupon/batch', query: { batch: row.batch } })
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
                this.editInfo.type = arr[0].id
            } else {
                typeData.forEach(el => {
                    if (el.kind !== '3') {
                        arr.push(el);
                    }
                });
            }
            this.couponList = arr;
        },
        editSubmit: function () {
            let vm = this;
            let editInfo = vm.editInfo;
            let data = {};
            if (editInfo.editSubmit) {
                console.log('拒绝请求')
                return
            }
            //     console.log('vm.editInfo', vm.editInfo)
            var url = "/coupon/batch_create";
            if (!editInfo.merchant_id) {
                vm.$notify({ message: "商户名不能为空", type: "error" });
                return;
            }
            if (!editInfo.type) {
                vm.$notify({ message: "优惠券类型不能为空", type: "error" });
                return;
            }
            if (!editInfo.num) {
                vm.$notify({ message: "生成数量不能为空", type: "error" });
                return;
            }
            if (vm.radio == 1) {
                if (!vm.times[0]) {
                    vm.$notify({ message: "开始时间不能为空", type: "error" });
                    return;
                }
                if (!vm.times[1]) {
                    vm.$notify({ message: "结束时间不能为空", type: "error" });
                    return;
                }
                // 时间组件已  value-format="yyyy-MM-dd" format="yyyy-MM-dd"
                data = {
                    merchant_id: editInfo.merchant_id,
                    num: Number(editInfo.num),
                    start_time: utils.eptimes.outTime(vm.times[0], 'YYYY-MM-dd'),
                    end_time: utils.eptimes.outTime(vm.times[1], 'YYYY-MM-dd'),
                    type: Number(editInfo.type)
                };
            }
            else {
                data = {
                    merchant_id: editInfo.merchant_id,
                    num: Number(editInfo.num),
                    type: Number(editInfo.type)
                };
            }
            vm.editInfo.editSubmit = true;
            utils.fetch(url, { method: "post", body: data }).then(function (res) {
                vm.editInfo.editSubmit = false;
                if (res && res.code == 0) {
                    vm.updateVisible = false;
                    vm.$notify({ showClose: true, message: '操作成功！', type: "success" });
                    vm.getData();
                } else {
                    vm.$notify({ showClose: true, message: res.message, type: "error" });
                }
            }).catch(() => {
                vm.editInfo.editSubmit = false;
            })
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.searchtimes = [];
            this.search = { station: '', car_id: '', merchant_id: '', distributor: '', ctype_id: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData()
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
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
 <style scoped>
.widthP100 {
    width: 100%;
}
</style>


