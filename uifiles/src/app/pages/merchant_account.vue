<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.merchant_id" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <el-select size="small" v-model="search.type" clearable placeholder="账户类型" class="widthX100">
                        <el-option label="购买" value="buyPond"></el-option>
                        <el-option label="系统" value="sysPond"></el-option>
                    </el-select>
                    <el-button @click="search_more=!search_more" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>

                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button @click="ininAdd();updateVisible=true" size="small">手动生成</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select size="small" v-model="search.timeType" clearable placeholder="时间类型" class="widthX100">
                    <el-option label="创建时间" value="1"></el-option>
                    <el-option label="修改时间" value="2"></el-option>
                </el-select>
                <el-date-picker v-model="searchtimes" size="small" type="daterange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
            </div>
            <!--表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column label="Id" min-width="40" prop="id">
                    </el-table-column>
                    <el-table-column label="商家" prop='merchant_name' min-width='160'></el-table-column>
                    <el-table-column label="停车场" prop='station_name' min-width='120'></el-table-column>
                    <el-table-column label="优惠券类型" prop='coupon_type' min-width='100'></el-table-column>
                    <el-table-column label="账户类型" prop='type_name' min-width='60'></el-table-column>
                    <el-table-column label="总金额" prop='total' min-width='60'></el-table-column>
                    <el-table-column label="余额" prop='balance' min-width='60'></el-table-column>
                    <el-table-column label="有效期" min-width='170'>
                        <template slot-scope="scope">
                            <span v-show="scope.row.start_time == '永久'">永久</span>
                            <span v-show="scope.row.start_time != '永久'">
                                <span>{{scope.row.start_time}} ~</span>
                                <span>{{scope.row.end_time}}</span>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop='creationtime' min-width='140'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='50'>
                        <template slot-scope="scope">
                            <span>{{scope.row.status==='Y'?'启用':'禁用'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="80">
                        <template slot-scope="scope">
                            <el-button plain @click="edit(scope.row)" :type="scope.row.status==='Y'?'danger':'success'" size="mini">{{scope.row.status==='Y'?'禁用':'启用'}}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="手动生成" :visible.sync="updateVisible" custom-class="minwidth">
                <el-form :model="editInfo" label-width="150px">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="商家名称:">
                                <my-select-merchant v-model="editInfo.merchant_id" @change="merchantChange" size="small" class="widthP100" placeholder="商家名称"></my-select-merchant>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="优惠劵类型:" size="small">
                                <el-select v-model="editInfo.ctype_id" placeholder="优惠券类型" class="widthP100" size="small" filterable>
                                    <el-option v-for="item in typeData" :key="item.id" :label="item.coupon_type" :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="金额:">
                                <el-input v-model="editInfo.total" @blur="numBlur" size="small" placeholder="请输入金额"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="有效期:">
                                <el-date-picker v-model="times" size="small" type="datetimerange" class="widthP100" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>

                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateVisible = false">取消</el-button>
                    <el-button type="primary" @click="add">保存</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../utils/utils.js';
export default {
    data: function () {
        return {
            times: [],
            searchtimes: [],
            search_more: false,
            loading: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            updateVisible: false,
            editInfo: this.ininAdd(),
            merchantItem: {},
            typeData: [],
            couponList: [],
            search: { timeType: '', type: '', station_id: '', merchant_id: '', },
            tableData: []
        }
    },
    created() {
        this.search.merchant_id = this.$route.query.merchant_id;
        this.getData();
    },
    mounted: function () {

    },
    methods: {
        getData: function () {
            var vm = this;
            vm.loading = true;
            let data = utils.deepCopy(vm.search);
            data.create_start_time = '';
            data.modify_start_time = '';
            data.create_end_time = '';
            data.modify_end_time = '';
            if (data.timeType && vm.searchtimes) {
                let timeType = data.timeType === '1' ? 'create_' : 'modify_';
                data[timeType + 'start_time'] = vm.searchtimes[0] || '';
                data[timeType + 'end_time'] = vm.searchtimes[1] || '';
            }
            data.timeType = undefined;
            var url = "/couponpond/lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            for (let index in data) {
                if (data[index]) url += "&" + index + "=" + data[index];
            }
            vm.tableData = [];
            utils.fetch(url).then(function (res) {
                vm.loading = false;
                if (typeof (res) != 'undefined' && res.code == 0) {
                    vm.tableData = res.content.lists || [];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }
            });
        },
        ininAdd: function () {
            this.times = [];
            this.editInfo = { merchant_id: '', ctype_id: '', total: '', start_time: '', end_time: '' }
            return this.editInfo;
        },
        add: function () {
            let vm = this;
            let url = '/couponpond/add';
            let a = /[0-9.]$/;
            let edit = Object.assign({}, vm.editInfo);
            if (vm.times[1]) {
                edit.start_time = vm.times[0];
                edit.end_time = vm.times[1];
            }
            if (!edit.merchant_id) {
                vm.$notify({ message: '商户不能为空', type: 'error' });
                return;
            }
            if (!edit.ctype_id) {
                vm.$notify({ message: '优惠劵不能为空', type: 'error' });
                return;
            }
            if ((!utils.validator.isMoney.test(edit.total))||!(edit.total > 0)) {
                vm.$notify({ message: '金额需要大于0', type: 'error' });
                return
            }
            if (!edit.start_time) {
                vm.$notify({ message: '开始日期不能为空', type: 'error' });
                return;
            }
            if (!edit.start_time) {
                vm.$notify({ message: '结束日期不能为空', type: 'error' });
                return;
            }
            utils.fetch(url, { method: 'post', body: edit }).then(function (res) {
                if (res && res.code === 0) {
                    vm.getData();
                    vm.$notify({ message: '生成成功', type: 'success' });
                    vm.updateVisible = false;
                    vm.ininAdd();
                } else {
                    vm.$notify({ showClose: true, message: res.message, type: 'error' });
                }
            });
        },
        edit: function (row) {
            let status = row.status === 'Y' ? 'N' : 'Y';
            let id = row.id;
            let label = status === 'Y' ? '启用' : '禁用';
            var vm = this;
            var str = '您确定要' + label + '吗?';
            this.$msgbox({
                title: '提示',
                message: str,
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: function (action, instance, done) {
                    if (action === 'confirm') {
                        let url = '/couponpond/update';
                        let data = { id: id, status: status }
                        utils.fetch(url, { method: 'post', body: data }).then(function (res) {
                            if (typeof (res) != 'undefined') {
                                if (res.code === 0) {
                                    vm.$notify({ message: label + '成功', type: 'success' });
                                    vm.updateVisible = false;
                                    vm.getData();
                                } else {
                                    vm.$notify({ showClose: true, message: res.message, type: 'error' });
                                }
                            }
                        });
                        done();
                    } else {
                        done();
                    }
                }
            });
        },
        merchantChange: function (item) {
            this.merchantItem = {
                merchant_id: item.id,
                type: item.type
            };
            this.getCouponLists();
        },
        getCouponLists: function () {
            let vm = this;
            vm.editInfo.ctype_id = '';
            vm.typeData = [];
            if (vm.merchantItem.type == '1') {
                let url = '/coupon/couType_lists?page=1&pagesize=1000&kind=3';
                utils.fetch(url).then((json) => {
                    if (json && json.content && json.content.lists) {
                        vm.typeData = json.content.lists;
                    }
                });
            } else {
                let url = '/coupon/merchant_couType?page=1&pagesize=1000';
                if (vm.merchantItem.merchant_id) {
                    url = url + '&merchant_id=' + vm.merchantItem.merchant_id
                }
                utils.fetch(url).then((json) => {
                    if (json && json.content) {
                        vm.typeData = json.content;
                    }
                });
            }
        },
        numBlur: function () {
            let v = this.editInfo.total;
            v = String(v);
            v = v.split('.');
            if (v[1] && v[1].length > 2) {
                v[1] = v[1].substring(0, 2);
                v = v[0] + '.' + v[1];
                v = Number(v);
                this.editInfo.total = v;
            }
        },
        btnSearch: function () {
            this.loading = true;
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.loading = true;
            this.searchtimes = [];
            this.search = { timeType: '', type: '', station_id: '', merchant_id: '', };
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

