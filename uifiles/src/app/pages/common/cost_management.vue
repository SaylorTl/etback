<template>
    <div class="cost_management">
        <div id='box' class="menu-hide">
            <div class='worker log'>
                <div class='condition clearfix box-width'>
                    <div class="left">
                        <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                        <el-select v-model="search.type" clearable filterable size="small" class="cell widthX120" placeholder="类型">
                            <el-option v-for="(item,index) in  typeOption" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                        <el-select v-model="search.category" clearable filterable size="small" class="cell widthX120" placeholder="类别">
                            <el-option v-for="(item,index) in  categoriesOption" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                        <div class="cell widthX350">
                            <el-date-picker v-model="times" size="small" type="daterange" range-separator="-" value-format="yyyy-MM-dd" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                        </div>
                        <el-button @click="search_more=!search_more" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                        <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    </div>
                    <div class="right">
                        <el-button @click="initEditInfo();fromMode='add';fromOpen=true;" size="small">添加</el-button>
                        <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                        <el-button @click="exportTabel" size="small">导出</el-button>
                    </div>
                </div>
                <div v-show="search_more" class='condition-more clearfix box-width'>
                    <my-linkage-dept type='2' v-model="search.dept_ids"></my-linkage-dept>
                    <my-select-domain v-model="search.domain_id" size="small" clearable class="cell widthX150" placeholder="易停区域"></my-select-domain>
                    <el-input v-model="search.city.alias" size="small" class="cell widthX100" @focus="select.city.loading=!select.city.loading" trigger-on-focus=false suffix-icon="el-icon-more" placeholder="城市"></el-input>
                    <my-select-cities v-if="select.city.loading" :hot=true :dept=2 @change="SelectCityChang" @close="select.city.loading=false" :style="{left:'243px'}"></my-select-cities>
                </div>
                <div class='table box-width'>
                    <el-table :summary-method="getSummaries" show-summary v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit max-height='550'>
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <el-form label-position="left" inline class="demo-table-expand">
                                    <el-form-item label="公司/大区/事业部:" class="widthX150"><span>{{ props.row.company_name}}/{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                                    <el-form-item label="易停区域:"><span>{{ props.row.domain_name}}</span></el-form-item>
                                    <el-form-item label="添加人:"><span>{{ props.row.created_by_fullname }}</span></el-form-item>
                                    <el-form-item label="添加时间:"><span>{{props.row.created_at}}</span></el-form-item>
                                    <el-form-item label="城市:"><span>{{ props.row.city_name }}</span></el-form-item>
                                    <el-form-item label="修改人:"><span>{{ props.row.updated_by_fullname }}</span></el-form-item>
                                    <el-form-item label="修改时间:"><span>{{props.row.updated_at}}</span></el-form-item>
                                </el-form>
                            </template>
                        </el-table-column>
                        <el-table-column label="序号" min-width="40" prop="id"></el-table-column>
                        <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                        <el-table-column prop="cost" label="成本" min-width="70"></el-table-column>
                        <el-table-column prop="type_name" label="类型" min-width="50"></el-table-column>
                        <el-table-column prop="categories_name" label="类别" min-width="60"> </el-table-column>
                        <el-table-column prop="time" label="发生时间" min-width="60"></el-table-column>
                        <el-table-column label="说明" min-width="170">
                            <template slot-scope="scope">
                                <el-popover placement="bottom" width="600" trigger="click" :content="scope.row.extra">
                                    <div slot="reference" class="max-cel">{{scope.row.extra}}</div>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button size="mini" @click="initEditInfo();editInfo=scope.row;fromOpen=true;">编辑</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <!-- 添加/编辑 E-->
                    <el-dialog :title="fromMode==='add'?'添加':'编辑'" :visible.sync="fromOpen" custom-class="minwidth">
                        <el-form :model="editInfo" label-width="150px">
                            <el-form-item label="停车场:">
                                <span v-show="editInfo.id">{{editInfo.station_name}}</span>
                                <my-select-station v-model="editInfo.station_id" v-show="!editInfo.id" size="small" class="widthP100" placeholder="停车场"></my-select-station>
                            </el-form-item>
                            <el-form-item label="类型:">
                                <el-select v-model="editInfo.type" @change="editInfo.category=''" placeholder="类型" class="widthP100" size="small" filterable>
                                    <el-option v-for="(item,index) in  typeOption" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="类别:">
                                <el-select v-model="editInfo.category" placeholder="类别" class="widthP100" size="small" filterable>
                                    <el-option v-for="(item,index) in  categoriesOption" v-show="editInfo.type==item.type" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="成本:">
                                <el-input v-model="editInfo.cost" @blur="amountBlur" size="small" placeholder="成本"></el-input>
                            </el-form-item>
                            <el-form-item :label="(editInfo.type==1||editInfo.type==3)?'发生时间:':'时间:' ">
                                <el-date-picker v-model="editInfo.time" class="cell widthX120" size="small" type="date" value-format="yyyy-MM-dd" :placeholder="(editInfo.type==1||editInfo.type==3)?'发生时间':'时间' "></el-date-picker>
                            </el-form-item>
                            <el-form-item label="说明:">
                                <el-input v-model="editInfo.extra" type="textarea" :autosize="{ minRows: 2, maxRows: 6}" :placeholder="'请输入'+(textOption[editInfo.type]||'详情')+'，限300字'"></el-input>
                            </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="fromOpen = false">取消</el-button>
                            <el-button type="primary" @click="edit">保存</el-button>
                        </span>
                    </el-dialog>
                    <my-paginator v-show="tableData.length>0" @change='setPageData($event)' :pagination='pagination'></my-paginator>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import utils from '../../../utils/utils.js';
export default {
    data() {
        return {
            search_more: false,
            shade: false,
            typeOption: [],
            categoriesOption: [],
            textOption: { 1: '资产明细', 2: '故障描述', 3: '备件购买详情', 4: '详情' },
            select: { city: { loading: false } },
            search: { type: '', category: '', begin: '', end: '', station_id: '', domain_id: '', city: { alias: '' }, area_id: '', dept_id: '', company_id: '', dept_ids: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            fromMode: null,
            fromOpen: false,
            editInfo: { station_id: '', type: '', category: '', cost: '', time: '', extra: '' },
            times: [],
            tableData: [],
            tableDataTal: [],
        }
    },
    created() {
        this.typeList();
        this.categoriesList();
    },
    methods: {
        amountBlur() {
            this.editInfo.cost = utils.amountBlur(this.editInfo.cost);
        },
        initEditInfo() {
            this.editInfo = { station_id: '', type: '', category: '', cost: '', time: '', extra: '' };
        },
        getData() {
            this.tableData = [];
            this.shade = true;
            let url = '/stationcost/lists?page=' + this.pagination.page + "&pagesize=" + this.pagination.pagesize;
            let data = { ...this.search };

            if (data.city) {
                data.city = data.city.value;
            }
            if (this.times) {
                data.begin = this.times[0];
                data.end = this.times[1];
            }
            if (data.dept_ids) {
                let deptStr = utils.setDeptQuery(this.search.dept_ids);
                url += deptStr ? '&' + deptStr : '';
            }
            data.dept_ids = undefined;
            for (let index in data) {
                if (data[index]) url += "&" + index + "=" + data[index];
            }

            utils.fetch(url).then((res) => {
                if (res && res.code == 0) {
                    this.pagination.total = res.content.total;
                    this.tableDataTal = res.content.sum;
                    this.tableData = res.content.lists;
                    utils.setCache(this);
                }
                this.shade = false;
            });
        },
        //获取类型列表
        typeList() {
            let url = "/stationcost/types";
            utils.fetch(url).then((res) => {
                if (res && res.content) {
                    this.typeOption = res.content;
                }
            });
        },
        //获取类别列表
        categoriesList() {
            let url = '/stationcost/categories';
            utils.fetch(url).then((res) => {
                if (res && res.content) {
                    this.categoriesOption = res.content;
                }
            });
        },
        //添加、编辑
        edit() {
            let editItem = this.editInfo;
            if (!editItem.station_id) { this.$notify({ message: '停车场不能为空', type: 'error' }); return; }
            if (!editItem.type) { this.$notify({ message: '类型不能为空', type: 'error' }); return; }
            if (!editItem.category) { this.$notify({ message: '类别不能为空', type: 'error' }); return; }
            if (!utils.validator.isMoneyMinus.test(editItem.cost)) { this.$notify({ message: '成本请输入数字，保留2位小数', type: 'error' }); return; }
            if (!editItem.time) { this.$notify({ message: '时间不能为空', type: 'error' }); return; }
            let url = editItem.id ? '/stationcost/update' : '/stationcost/add';
            this.shade = true;
            utils.fetch(url, { method: 'post', body: editItem }).then((res) => {
                this.shade = false;
                if (res && res.code === 0) {
                    this.$notify({ message: editItem.id ? '修改成功' : '添加成功', type: 'success' });
                    this.fromOpen = false;
                    this.getData();
                } else {
                    this.$notify({ showClose: true, message: res.message, type: 'error' });
                }
            });
        },
        //合计列
        getSummaries(param) {
            const { columns } = param;
            let sums = [];
            columns.forEach((column, index) => {
                if (index === 0) { sums[index] = '总计'; return; }
                if (this.tableDataTal && this.tableDataTal[column.property]) {
                    sums[index] = this.tableDataTal[column.property];
                } else {
                    sums[index] = '';
                }
            });
            return sums;
        },
        SelectCityChang(obj) {
            this.search.city = obj;
            this.select.city.loading = false;
        },
        setPageData(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo() {
            this.search = { type: '', category: '', begin: '', end: '', station_id: '', domain_id: '', city: { alias: '' }, area_id: '', dept_id: '', company_id: '', dept_ids: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.times = '';
            this.$forceUpdate();
            this.getData();
        },
        //导出
        exportTabel() {
            let url = '/stationcost/export?page=' + this.pagination.page + "&pagesize=" + this.pagination.pagesize;
            let data = { ...this.search };
            data.dept_ids = undefined;
            if (data.city) {
                data.city = data.city.value;
            }
            if (this.times) {
                data.begin = this.times[0];
                data.end = this.times[1];
            }
            if (data.dept_ids) {
                let deptStr = utils.setDeptQuery(this.search.dept_ids);
                url += deptStr ? '&' + deptStr : '';
            }
            for (let index in data) {
                if (data[index]) url += "&" + index + "=" + data[index];
            }
            const loading = this.$loading({
                lock: true,
                text: '报表导出中……',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            utils.fetch(url).then(res => {
                loading.close();
                if (res && res.code === 0) {
                    this.$confirm(res.message, '导出成功', {
                        confirmButtonText: '前往待办',
                        cancelButtonText: '取消',
                        type: 'success'
                    }).then(() => {
                        this.$router.push({ path: '/todolist' });
                    }).catch(() => { });
                } else {
                    this.$message({
                        showClose: true,
                        message: res.message || "no data",
                        type: "error"
                    });
                }
            });
        },
    },
    beforeRouteEnter(to, from, next) {
        next(function (vm) {
            utils.getTingYunScript();
            var data = utils.getCache();
            var obj = data == '' ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
                console.log("vm.search ", vm.search)
            } else {
                vm.getData();
            }
        });
    },
}

</script>
<style>
.cost_management {
}
.cost_management .demo-table-expand label {
    width: 122px;
}
.cost_management .el-range-editor--small.el-input__inner {
    line-height: 23px;
    width: 100%;
}
.cost_management .el-date-editor.el-input {
    width: 100%;
}
</style>

