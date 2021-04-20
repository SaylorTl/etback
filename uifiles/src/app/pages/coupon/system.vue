<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.merchant_id" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <my-select-type v-model.trim="search.ctype_id" size="small" class="cell" style="width:135px" placeholder="优惠券类型"></my-select-type>
                    <el-select size="small" v-model="search.status" clearable placeholder="状态" class="widthX100">
                        <el-option label="启用" value="Y"></el-option>
                        <el-option label="禁用" value="N"></el-option>
                    </el-select>
                    <el-button @click="search_more=!search_more" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button size="small" @click="addClick">增加</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select size="small" v-model="search.type" clearable placeholder="时间类型" class="widthX100">
                    <el-option label="创建时间" value="1"></el-option>
                    <el-option label="修改时间" value="2"></el-option>
                </el-select>
                <el-date-picker v-model="searchtimes" size="small" type="daterange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
            </div>
            <!--商家表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="添加人:"><span>{{ props.row.adder }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{props.row.modifytime}}</span></el-form-item>
                                <el-form-item label="修改人:"><span>{{props.row.modifier}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="商家" prop='merchant_name' min-width='160'></el-table-column>
                    <el-table-column label="停车场" prop='station_name' min-width='100'></el-table-column>
                    <el-table-column label="优惠券类型" prop='coupon_type' min-width='110'></el-table-column>
                    <el-table-column label="张数/金额" prop='quantity' min-width='60'>
                        <template slot-scope="scope">
                        {{scope.row.quantity}}{{scope.row.coupon_type_kind=='3'?'元':'张'}}
                        </template>
                    </el-table-column>
                    <el-table-column label="优惠劵有效期" prop='creationtime' min-width='140'>
                        <template slot-scope="scope">
                            <span class="flex-column" v-if="scope.row.expiry_date=='COUSTOM'">
                                <span>{{scope.row.start_time}}</span>
                                <span>{{scope.row.end_time}}</span>
                            </span>
                            <span v-if="scope.row.expiry_date!='COUSTOM'">{{scope.row.expiry_date_detail}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop='creationtime' min-width='140'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='50'>
                        <template slot-scope="scope">
                            <span>{{scope.row.status==='Y'?'启用':'禁用'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button plain @click="changeClick(scope.$index,scope.row)" size="mini">修改</el-button>
                            <el-button plain size="mini" @click="seeAction(scope.row)">查看记录</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible" custom-class="minwidth">
                <el-form :model="editInfo" label-width="150px">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="商家名称:">
                                <my-select-merchant v-model="editInfo.merchant_id" @change="merchantChange" size="small" class="widthP100" placeholder="商家名称"></my-select-merchant>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="触发时间:">
                                <el-radio-group v-model="editInfo.trigger_date">
                                    <el-radio label="DAY">每日</el-radio>
                                    <el-radio label="WEEK">每周</el-radio>
                                    <el-radio label="MONTH">每月</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="优惠劵类型:" size="small">
                                <el-select v-model="editInfo.ctype_id" placeholder="优惠券类型" class="widthP100" size="small" filterable>
                                    <el-option v-for="item in couponList" :key="item.id" :label="item.coupon_type" :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="merchantItem.coupontype=='1'?'金额:':'领取数量:'">
                                <el-input v-model="editInfo.quantity" size="small" :placeholder="merchantItem.coupontype=='1'?'金额':'领取数量'"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="有效期:" size="small">
                                <el-select size="small" class="widthP100" v-model="editInfo.expiry_date" clearable placeholder="有效期">
                                    <el-option v-for="(item,index) in dateOption" :key="index" :label="item" :value="index">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="状态:">
                                <el-radio-group v-model="editInfo.status">
                                    <el-radio label="Y">启用</el-radio>
                                    <el-radio label="N">禁用</el-radio>
                                </el-radio-group>
                            </el-form-item>

                        </el-col>
                    </el-row>
                    <el-row v-show="editInfo.expiry_date=='COUSTOM'">
                        <el-col :span="12">
                            <el-form-item label="有效时间:">
                                <el-date-picker v-model="times" class="widthP100" size="small" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateVisible = false">取消</el-button>
                    <el-button type="primary" @click="edit">保存</el-button>
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
            merchantItem: {},
            typeData: [],
            couponList: [],
            search_more: false,
            times: [],
            searchtimes: [],
            dateOption: { DAY: '每日', WEEK: '每周', MONTH: '每月', FOREVER: '永久', COUSTOM: '自定义' },
            loading: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            updateVisible: false,
            updateTitle: '',
            editInfo: { merchant_id: '', expiry_date: 'MONTH', trigger_date: 'MONTH', ctype_id: '', quantity: '', status: 'Y' },
            search: { type: '', station_id: '', merchant_id: '', ctype_id: '', status: '' },
            tableData: [],  //遍历得到的所有商家信息的数组；
        }
    },
    mounted: function () {
        this.getCouponLists();
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
            if (data.type && vm.searchtimes) {
                let timeType = data.type === '1' ? 'create_' : 'modify_';
                data[timeType + 'start_time'] = vm.searchtimes[0];
                data[timeType + 'end_time'] = vm.searchtimes[1];
            }
            data.type=undefined;
            var url = "/couponregular/lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            for (let index in data) {
                if (data[index]) url += "&" + index + "=" + data[index];
            }
            vm.tableData = [];
            utils.fetch(url).then(function (res) {
                vm.loading = false;
                if (res && res.content && res.content.lists) {
                    vm.tableData = res.content.lists || [];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }
            });
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
                this.editInfo.ctype_id = arr[0].id
            } else {
                typeData.forEach(el => {
                    if (el.kind !== '3') {
                        arr.push(el);
                    }
                });
            }
            this.couponList = arr;
        },
        addClick: function () {
            var vm = this;
            vm.times = [];
            vm.updateVisible = true;
            vm.updateTitle = "添加--商户系统发劵";
            vm.editInfo = { merchant_id: '', expiry_date: 'MONTH', trigger_date: 'MONTH', ctype_id: '', quantity: '', status: 'Y' }
        },
        //修改时，用户的详细信息都是显示在网页上的
        changeClick: function (index, row) {
            var vm = this;
            vm.times = [];
            vm.updateVisible = true;
            vm.updateTitle = "修改--商户系统发劵";
            vm.editInfo = utils.deepCopy(row);
            if (row.expiry_date == 'COUSTOM') {
                vm.times = [row.start_time, row.end_time]
            }
            vm.merchantChange(row);
        },
        seeAction: function (row) {
            if (row.coupon_type_kind === '3') {
                this.$router.push({ path: '/merchantAccount', query: { merchant_id: row.merchant_id } })

            } else {
                this.$router.push({ path: '/coupon/systemquota', query: { merchant_id: row.merchant_id } })
            }
        },
        edit: function () {
            let vm = this;
            let edit = vm.editInfo;
            let a = /^([1-9]\d*|[0]{1,1})$/;
            let url = "";
            if (edit.expiry_date === 'COUSTOM' && vm.times[1]) {
                edit.start_time = vm.times[0];
                edit.end_time = vm.times[1];
            }
            console.log('vm.editInfo', vm.editInfo)
            if (edit.merchant_id == '') {
                vm.$notify({ message: '商户不能为空', type: 'error' });
                return;
            }
            if (edit.ctype_id == '') {
                vm.$notify({ message: '优惠劵类型不能为空', type: 'error' });
                return;
            }
            if (edit.quantity == '') {
                vm.$notify({ message: '张数/金额不能为空', type: 'error' });
                return;
            }
            if (edit.expiry_date === 'COUSTOM' && !edit.start_time) {
                vm.$notify({ message: '开始日期不能为空', type: 'error' });
                return;
            }
            if (edit.expiry_date === 'COUSTOM' && !edit.start_time) {
                vm.$notify({ message: '结束日期不能为空', type: 'error' });
                return;
            }
            url = edit.id ? '/couponregular/update' : '/couponregular/add';
            utils.fetch(url, { method: 'post', body: edit }).then(function (res) {
                if (res && res.code == 0) {
                    vm.$notify({ message: edit.id ? '修改成功' : '添加成功', type: 'success' });
                    vm.updateVisible = false;
                    vm.getData();
                } else {
                    vm.$notify({ showClose: true, message: res.message, type: 'error' });
                }

            });
        },
        merchantChange: function (item) {
            this.merchantItem.coupontype = item.type || item.coupon_type_kind == '3' ? 1 : undefined;
            this.couponFilter();
        },
        getCouponLists: function () {
            let url  = '/coupon/couType_lists?page=1&pagesize=1000';
            utils.fetch(url).then((json) => {
                if (json && json.content && json.content.lists) {
                    this.typeData = json.content.lists;
                }
            });
        },
        btnSearch: function () {
            this.loading = true;
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.loading = true;
            this.searchtimes = [];
            this.search = { type: '', station_id: '', merchant_id: '', ctype_id: '', status: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData()
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        }
    },
    watch: {
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
