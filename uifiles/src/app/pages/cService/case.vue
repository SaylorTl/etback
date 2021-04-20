<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.type" size="small" class="cell widthX100" placeholder="操作类型">
                        <el-option v-for='(v,k) in opertype' :label='v' :key='k' :value='k'></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportUpdate" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.datetimerange" size="small" type="datetimerange" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="widthX350" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-input v-model="search.title" size="small" class="cell widthX200" placeholder="标题"></el-input>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="坐席号:">
                                    <span>{{scope.row.seat}}</span>
                                </el-form-item>
                                <el-form-item label="大区事业部:">
                                    <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                                </el-form-item>
                                <el-form-item label="创建时间:">
                                    <span>{{scope.row.creationtime}}</span>
                                </el-form-item>
                                <el-form-item label="修改时间:">
                                    <span>{{scope.row.moditytime}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="70"></el-table-column>
                    <el-table-column prop="name" label="操作人名称" min-width="70"></el-table-column>
                    <el-table-column prop="title" label="标题" min-width="100"></el-table-column>
                    <el-table-column prop="type_name" label="操作类型" min-width="60"></el-table-column>
                    <el-table-column prop="result" label="操作结果" min-width="100"></el-table-column>
                    <el-table-column prop="old_data" label="旧数据" min-width="200"></el-table-column>
                    <el-table-column prop="new_data" label="新数据" min-width="200"></el-table-column>
                </el-table>
            </div>
            <my-paginator v-if="tableData.length!=0" @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function() {
        return {
            opertype: { "station": "停车场", "rule": "月卡规则", "device": "设备", "blacklist": "黑白名单", "contract": "月卡", "open": "开闸"},
            shade: false,
            search: { dept: '', station_id: '', datetimerange: '', title: '', type: '' },
            search_more: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
        }
    },
    methods: {
        exportUpdate() {
            let vm = this;
            let url = '/case/export';
            if (!vm.search.datetimerange) { //'' , null  两种情况
                vm.$message({ showClose: true, message: '开始和结束时间不能为空', type: 'error' });
                return;
            }
            let [begin, end] = vm.search.datetimerange;
            if (begin == end) {
                vm.$message({ showClose: true, message: '开始时间和结束时间不能一样', type: 'error' });
                return;
            }
            vm.search.time_begin = begin;
            vm.search.time_end = end;
            let {datetimerange, ...searchs } = vm.search;
            let querystr = utils.setQueryString(searchs);
            url += querystr ? '?' + querystr : '';
            let nowdate = begin.substr(0, 10).split('-').join('');
            let filename = nowdate + '客服操作日志.csv';
            utils.rpc.loadfile(url, null, filename).then(function(res) {
                if (res && res.code === 0) {
                    vm.$message({ showClose: true, message: res.message, type: 'success' })
                } else {
                    vm.$message({ showClose: true, message: res.message || '没有数据', type: 'error' })
                }
            });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function() {
            var vm = this;
            var url = '/case/lists?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (vm.search.datetimerange && vm.search.datetimerange.length===2) {
                let [begin, end] = vm.search.datetimerange;
                if (begin == end) {
                    vm.$message({ showClose: true, message: '开始时间和结束时间不能一样', type: 'error' });
                    return;
                }
                vm.search.time_begin = begin;
                vm.search.time_end = end;
            }else{
                vm.search.time_begin ='';
                vm.search.time_end = '';
            }
            let { datetimerange,...searchs } = vm.search;
            let querystr = utils.setQueryString(searchs);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                utils.setCache(vm);
                vm.shade = false
            });
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { dept: '', station_id: '', datetimerange: '', title: '', type: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        btnMore() {
            this.search_more = !this.search_more;
        }

    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
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
