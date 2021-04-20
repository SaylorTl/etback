<template>
    <div id="box">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.merchant_id" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.plate" size="small" class="cell widthX100" placeholder="车牌号"></el-input>
                    <my-select-type v-model.trim="search.ctype_id" size="small" class="cell" style="width:135px" placeholder="优惠券类型"></my-select-type>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX100" placeholder="手机号"></el-input>
                    <el-button @click="search_more=!search_more" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select size="small" v-model="search.type" clearable placeholder="时间类型" class="widthX100">
                    <el-option label="领取时间" value="1">
                    </el-option>
                    <el-option label="撤回时间" value="2">
                    </el-option>
                </el-select>
                <el-date-picker v-model="searchtimes" size="small" type="daterange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
                <el-select size="small" v-model="search.source" clearable placeholder="撤回路径" class="widthX100">
                    <el-option v-for="(item,index) in sourceOption" :key="index" :label="item" :value="index">
                    </el-option>
                </el-select>
            </div>
            <!--表格信息-->
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="发劵人:"><span>{{ props.row.distributor }}</span></el-form-item>
                                <el-form-item label="劵码:"><span>{{props.row.cnum}}</span></el-form-item>
                                <el-form-item label="撤回人:"><span>{{ props.row.operator}} </span></el-form-item>
                                <el-form-item label="撤回路径:"><span>{{sourceOption[props.row.source]}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="#" min-width="30" prop="id"></el-table-column>
                    <el-table-column label="商家" prop="merchant_name" min-width="180"></el-table-column>
                    <el-table-column label="停车场" prop="station_name" min-width="180"></el-table-column>
                    <el-table-column label="车牌" prop="plate" min-width="100"></el-table-column>
                    <el-table-column label="优惠劵类型" prop="coupon_type" min-width="120"></el-table-column>
                    <el-table-column label="优惠劵面额" prop="coupon_value" min-width="80"></el-table-column>
                    <el-table-column label="购买金额" prop="buy_amount" min-width="80"></el-table-column>
                    <el-table-column label="领取时间" prop="get_time" min-width="160"></el-table-column>
                    <el-table-column label="撤回时间" prop="ch_time" min-width="160"></el-table-column>
                    <el-table-column label="状态" min-width="50">
                        <template slot-scope="scope">
                            <span>已撤回</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function () {
        return {
            searchtimes: [],
            sourceOption: { app: 'APP', biz: '商户后台', oa: '运营后台' },
            search_more: false,
            loading: false,
            pagination: { page: 1, pagesize: 10, total: 0, showTotal: true },
            search: { station_id: '', type: '', plate: '', merchant_id: '', mobile: '', source: '', ctype_id: '' },
            tableData: [],  //遍历得到的所有商家信息的数组；
        }
    },
    mounted: function () { },
    methods: {
        getData: function () {
            var vm = this;
            vm.loading = true;
            let data = utils.deepCopy(vm.search);
            data.start_get_time = '';
            data.start_back_time = '';
            data.end_get_time = '';
            data.end_back_time = '';
            if (data.type && vm.searchtimes) {
                let timeType = data.type === '1' ? 'get_time' : 'back_time';
                data['start_' + timeType] = vm.searchtimes[0];
                data['end_' + timeType] = vm.searchtimes[1];
            }
            data.type = undefined;
            let url = "/couponreclaim/lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
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
        //删除时
        delClick: function (index, row) {
            var vm = this;
            var str = '您确定要删除商家:“' + row.name + '”的信息吗?';
            this.$msgbox({
                title: '提示',
                message: str,
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: function (action, instance, done) {
                    if (action === 'confirm') {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = '正在删除...';
                        vm.del_plate(index, row);
                        instance.confirmButtonLoading = false;
                        done();
                    } else {
                        done();
                    }
                }
            });
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.searchtimes = [];
            this.search = { station_id: '', type: '', plate: '', merchant_id: '', mobile: '', source: '', ctype_id: '' };
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
