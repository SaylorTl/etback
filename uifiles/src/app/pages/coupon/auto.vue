<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.merchant_id" size="small" class="cell widthX150" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" size="small" class="cell widthX100" placeholder="车牌"></my-select-plate>
                    <my-select-type v-model.trim="search.ctype_id" size="small" class="cell" style="width:135px" placeholder="优惠券类型"></my-select-type>
                    <el-select size="small" v-model="search.status" clearable placeholder="状态" class="widthX100">
                        <el-option v-for="(item,index) in statusOption" :key="index" :label="item" :value="index"></el-option>
                    </el-select>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX100" placeholder="车主手机号"></el-input>
                    <el-input v-model.trim="search.name" size="small" class="cell widthX100" placeholder="车主姓名"></el-input>
                    <el-button @click="search_more=!search_more" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>

                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button size="small" @click="addClick">添加</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select size="small" v-model="search.type" clearable placeholder="时间类型" class="widthX100">
                    <el-option label="创建时间" value="1"></el-option>
                    <el-option label="修改时间" value="2"></el-option>
                </el-select>
                <el-date-picker v-model="searchtimes" size="small" type="daterange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
                <el-input v-model.trim="search.adder" size="small" class="cell widthX150" placeholder="添加人手机号"></el-input>
                <el-input v-model.trim="search.modifier" size="small" class="cell widthX150" placeholder="修改人手机号"></el-input>
            </div>
            <!--商家表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="修改人:"><span>{{ props.row.modifier }}</span></el-form-item>
                                <el-form-item label="添加人:"><span>{{ props.row.adder }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{props.row.modifytime}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="#" min-width="40" prop="id"></el-table-column>
                    <el-table-column label="商家" prop='merchant_name' min-width='160'></el-table-column>
                    <el-table-column label="车牌" prop='plate' min-width='80'></el-table-column>
                    <el-table-column label="停车场" prop='station_name' min-width='100'></el-table-column>
                    <el-table-column label="优惠券类型" prop='coupon_type' min-width='110'></el-table-column>
                    <el-table-column label="创建人员" prop='adder' min-width='80'></el-table-column>
                    <el-table-column label="张数/金额" prop='num' min-width='60'>
                        <template slot-scope="scope">
                            {{scope.row.num}}{{scope.row.coupon_type_kind=='3'?'元':'张'}}
                        </template>
                    </el-table-column>
                    <el-table-column label="车主" prop='name' min-width='80'></el-table-column>
                    <el-table-column label="车主手机号" min-width='100' prop='mobile'></el-table-column>
                    <el-table-column label="创建时间" prop='creationtime' min-width='140'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='50'>
                        <template slot-scope="scope">
                            <span>{{statusOption[scope.row.status]||''}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="80">
                        <template slot-scope="scope">
                            <el-button plain @click="changeClick(scope.$index,scope.row)" size="mini">修改</el-button>
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
                            <el-form-item label="车牌号:">
                                <my-select-plate v-model="editInfo.car_id" size="small" placeholder="车牌"></my-select-plate>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="优惠劵类型:" size="small">
                                <el-select v-model="editInfo.ctype_id" placeholder="优惠券类型" class="widthP100" size="small" filterable>
                                    <el-option v-for="item in typeData" :key="item.id" :label="item.coupon_type" :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="merchantItem.coupontype=='1'?'金额:':'领取数量:'">
                                <el-input v-model="editInfo.num" size="small" @blur="numBlur" :placeholder="merchantItem.coupontype=='1'?'0表示不限制':'领取数量'"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="姓名:">
                                <el-input v-model="editInfo.name" size="small" placeholder="姓名"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="手机号:">
                                <el-input v-model="editInfo.mobile" size="small" placeholder="手机号"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="状态:">
                                <el-radio-group v-model="editInfo.status">
                                    <el-radio label="Y">启用</el-radio>
                                    <el-radio label="N">禁用</el-radio>
                                    <el-radio label="D">删除</el-radio>
                                </el-radio-group>
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
            search_more: false,
            searchtimes: [],
            loading: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            updateVisible: false,
            updateTitle: '',
            merchantItem: {},
            typeData: [],
            couponList: [],
            statusOption: { Y: '启用', N: '禁用', D: '删除' },
            editInfo: { merchant_id: '', ctype_id: '', car_id: '', num: '', name: '', mobile: '', status: 'Y' },
            search: { type: '', station_id: '', merchant_id: '', ctype_id: '', car_id: '', name: '', mobile: '', adder: '', modifier: '', status: '' },
            tableData: [],  //遍历得到的所有商家信息的数组；
        }
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
            data.type = undefined;
            var url = "/couponauto/lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
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
        addClick: function () {
            var vm = this;
            vm.updateVisible = true;
            vm.updateTitle = "添加自动领劵车牌";
            vm.editInfo = { merchant_id: '', ctype_id: '', car_id: '', num: '', name: '', mobile: '', status: 'Y' }
        },
        //修改时，用户的详细信息都是显示在网页上的
        changeClick: function (index, row) {
            var vm = this;
            vm.updateVisible = true;
            vm.updateTitle = "修改自动领劵车牌";
            //coupon/merchant_lists  coupontype==1是放行劵商家
            //couponauto/lists     coupon_type_kind==3是放行劵商家
            //本页面将采用  merchantItem.coupontype==1为放行劵商家
            let temp = {
                id: row.merchant_id,
                type: row.coupon_type_kind == '3' ? '1' : '0'
            }
            vm.merchantChange(temp);
            vm.editInfo = utils.deepCopy(row);
        },
        edit: function () {
            let vm = this;
            let edit = vm.editInfo;
            let a = /^([1-9]\d*|[0]{1,1})$/;
            let url = "";
            if (edit.merchant_id == '') {
                vm.$notify({ message: '商户不能为空', type: 'error' });
                return;
            }
            if (edit.car_id == '') {
                vm.$notify({ message: '车牌不能为空', type: 'error' });
                return;
            }
            if (vm.merchantItem.coupontype == '1' && edit.num == '') {
                edit.num = 0;//用户不填写，表示不限制，默认给0
            }
            if (vm.merchantItem.coupontype != '1' && (!(a.test(edit.num)) || edit.num < 1)) {
                vm.$notify({ message: '张数需要输入正整数', type: 'error' });
                return;
            }
            if (vm.merchantItem.coupontype == '1' && (!utils.validator.isMoney.test(edit.num))) {
                vm.$notify({ message: '金额需要大于等于0', type: 'error' });
                return
            }
            if (edit.name == '') {
                vm.$notify({ message: '车主姓名不能为空', type: 'error' });
                return;
            }
            if (edit.mobile == '') {
                vm.$notify({ message: '车主手机号不能为空', type: 'error' });
                return;
            }
            url = edit.id ? '/couponauto/update' : '/couponauto/add';
            utils.fetch(url, { method: 'post', body: edit }).then(function (res) {
                if (res && res.code === 0) {
                    vm.$notify({ message: edit.id ? '修改成功' : '添加成功', type: 'success' });
                    vm.updateVisible = false;
                    vm.getData();

                } else {
                    vm.$notify({ showClose: true, message: res.message, type: 'error' });
                }
            });
        },
        merchantChange: function (item) {
            this.merchantItem.coupontype = item.type;
            this.merchantItem.merchant_id = item.id;
            this.editInfo.ctype_id = '';
            this.getCouponLists();
        },
        numBlur: function () {
            let v = this.editInfo.num;
            v = String(v);
            v = v.split('.');
            if (v[1] && v[1].length > 2) {
                v[1] = v[1].substring(0, 2);
                v = v[0] + '.' + v[1];
                v = Number(v);
                this.editInfo.num = v;
            }
        },
        getCouponLists: function () {
            let vm = this;
            vm.typeData = [];
            if (vm.merchantItem.coupontype == '1') {
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
        btnSearch: function () {
            this.loading = true;
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.loading = true;
            this.searchtimes = [];
            this.search = { type: '', station_id: '', merchant_id: '', ctype_id: '', car_id: '', name: '', mobile: '', adder: '', modifier: '', status: '' };
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
