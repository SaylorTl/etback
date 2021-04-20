<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div v-if="!hideCon" class='condition clearfix box-width'>
                <div class="left">
                    <el-select v-model="search.data_step" placeholder="请选择" size="small" class="cell widthX120">
                        <el-option v-for="(val,key) in cfg.dataMap1" :key="key" :value="key" :label="val">
                        </el-option>
                    </el-select>
                    <el-select v-model="search.area_step" clearable size="small" class="cell widthX120" placeholder="文件类型">
                        <el-option v-for="(k,v) in cfg.dataMap3" :label="k" :value="v" :key="v"></el-option>
                    </el-select>
                </div>
            </div>
            <div v-if="!hideCon" class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept type='2' v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX120" placeholder="停车场" :disabled="search.area_step !='station' && search.area_step !=''"></my-select-station>
                    <el-select @change="stepChange" v-model="search.date_step" clearable size="small" class="cell widthX120" placeholder="日期类型">
                        <el-option v-for="(k,v) in cfg.dataMap2" :label="k" :value="v" :key="v"></el-option>
                    </el-select>
                    <template v-if="search.date_step=='day'">
                        <el-date-picker v-model="search.begin_time" type="date" size="small" placeholder="数据开始时间" style="width:160px" value-format='yyyy-MM-dd'></el-date-picker>
                        <el-date-picker v-model="search.end_time" type="date" size="small" placeholder="数据结束时间" style="width:160px" value-format='yyyy-MM-dd'></el-date-picker>
                    </template>
                    <template v-if="search.date_step=='Nmonth'">
                        <el-date-picker v-model="search.begin_time" type="month" size="small" placeholder="选择月" style="width:160px" value-format='yyyy-MM'></el-date-picker>
                        <el-date-picker v-model="search.end_time" type="month" size="small" placeholder="选择月" style="width:160px" value-format='yyyy-MM'></el-date-picker>
                    </template>
                    <el-button @click="btnSearch" size="small">搜索</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column label="集团/大区/事业部/停车场" min-width="300">
                        <template slot-scope="scope">
                            <span v-if="scope.row.company_name != '' && scope.row.area_name == ''"> {{scope.row.company_name}} </span>
                            <span v-if="scope.row.dept_name != ''&& scope.row.station_name == ''"> {{ scope.row.area_name + '/' + scope.row.dept_name}} </span>
                            <span v-else-if="scope.row.station_name != ''">{{ scope.row.area_name + '/' + scope.row.dept_name + '/' + scope.row.station_name}}</span>
                            <span v-else-if="scope.row.dept_name == ''">{{ scope.row.area_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!hideCon" prop="user_name" label="导出用户" width="90"></el-table-column>
                    <el-table-column prop="data_time" label="数据日期" width="130"></el-table-column>
                    <el-table-column v-if="!hideCon" label="时间类型" width="70">
                        <template slot-scope="scope">
                            <span>{{cfg.dataMap2[scope.row.date_step]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="hideCon" label="文件类型" width="90">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_step==='station'?'月卡文件':'临停文件'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!hideCon" label="文件类型" width="90">
                        <template slot-scope="scope">
                            <span>{{filetypeOpt[scope.row.area_step]||'集团文件'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!hideCon" prop="download" label="下载次数" width="70"></el-table-column>
                    <el-table-column v-if="!hideCon" prop="status" label="状态" width="90">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status == 'FINISHED'">成功</span>
                            <span v-if="scope.row.status == 'ERROR'" class="red">失败</span>
                            <span v-if="scope.row.status == 'RUNING'" class="green">运行中...</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!hideCon" prop="begin_exc" label="执行时间" width="140"></el-table-column>
                    <el-table-column v-if="!hideCon" prop="end_exc" label="结束时间" width="140"></el-table-column>
                    <el-table-column label="操作" min-width="70">
                        <template slot-scope="scope">
                            <el-button :loading="scope.row.downing" ref='downBtn' v-show="scope.row.status != 'RUNING' && scope.row.status != 'ERROR'" @click="download(scope.row,scope.$index)" plain size="mini">{{scope.row.downing?'正在':''}}下载</el-button>
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
let config = window.etback.config;
export default {
    data: function () {
        let config = {
            dataMap1: { 'order': "交易订单", 'summary': "日报订单", 'apply': "续费订单", 'income': "收入报表", 'contract': "月卡", 'in': "进场数据", 'out': "出场数据", 'exception': "异常开闸", 'offline': "车场掉线" },
            dataMap2: { 'day': "日报", 'Nmonth': "自然月报" },
            dataMap3: { "station": "停车场文件", "dept": "事业部文件", "area": "大区文件", "group": "集团文件" },
        }
        return {
            cfg: config,
            shade: false,
            hideCon: false,
            monthShow: true,
            search: { data_step: "order", type: '', dept: '', station_id: '', date_step: '', begin_time: '', end_time: '', create_type: '', area_step: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            downloadCount: 0,
            filetypeOpt: { 'dept': '事业部文件', 'area': '大区文件', 'station': '停车场文件' }
        }
    },
    created() {
        if (location.host == 'new.eptingche.cn' || location.host == 'new.caitingche.com') {
            this.hideCon = true;
        }
    },
    methods: {
        //通过传参获取不同的数据
        getData: function (sid) {
            var vm = this;
            vm.shade = true;
            if (sid) {
                vm.search.data_step = "contract";
                vm.search.station_id = sid;
            }
            let { page, pagesize } = vm.pagination;
            let { data_step, dept, station_id, date_step, begin_time, end_time, create_type, area_step } = vm.search;
            var url = `/export/lists?page=${page}&pagesize=${pagesize}`;
            let smap = { data_step, date_step, begin_time, end_time, create_type, area_step, station_id };
            let querystr = utils.setQueryString(smap);
            url += querystr ? `&${querystr}` : '';
            if (dept && JSON.stringify(dept) != "{}") {
                let deptStr = utils.setDeptQuery(dept);
                url += deptStr ? `&${deptStr}` : '';
            }
            if (data_step == 'income' && date_step) {
                let map = { 'day': "detail", 'Nmonth': 'gather' };
                url += `&type=${map[date_step]}`;
            }
            if (begin_time != '' && date_step == '') {
                this.open();
                return;
            }
            vm.shade = true;
            vm.tableData = [] //参数更换，无数据时，页面数据还是之前的，容易歧义
            utils.fetch(url).then(function (json) {
                if (json && json.code == 0) {
                    if (typeof (sid) != "undefined" && json.content == '') {
                        vm.infoShow();
                    }
                    if (json.content) {
                        vm.pagination.total = json.content.total || 0;
                        vm.tableData = json.content.lists || [];
                        utils.setCache(vm);
                    }
                }
                vm.shade = false;
            });
        },
        handleClose(done) {
            this.$confirm('确认关闭？')
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            var vm = this
            vm.pagination.page = 1;
            vm.pagination.pagesize = 20;
            vm.$route.params.station_id = undefined;
            vm.search = { data_step: "order", dept: '', station_id: '', date_step: '', begin_time: '', end_time: '', create_type: '', area_step: '' }
            vm.getData()
        },
        infoShow: function () {
            this.$notify.info({
                title: '消息',
                message: '脚本正在运行或无月卡数据,请稍后刷新',
                duration: 2000
            });
        },
        open: function () {
            this.$alert('必须填写日期类型', {
                confirmButtonText: '确定',
            });
            this.shade = false;
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        stepChange() {
            this.search.begin_time = '';
            this.search.end_time = '';
        },
        download: function (row, index) {
            var vm = this;
            if (typeof (index) === 'number') {
                if (!vm.tableData[index].downing) {
                    row.downing = true;
                    vm.tableData.splice(index, 1, row);
                    var filetype = vm.cfg.dataMap1[vm.search.data_step];
                    var datetype = vm.cfg.dataMap2[row.date_step];
                    let typemap = {
                        'station': row.station_name,
                        'dept': row.dept_name,
                        'area': row.area_name,
                        'group': row.company_name,
                    }
                    let areatype = typemap[row.area_step];
                    var filename = areatype + '_' + filetype + '_' + (filetype == '月卡' ? '' : datetype) + '_' + (filetype == '月卡' ? row.end_exc.slice(0, 10) : row.data_time.slice(0, 10));
                    let downurl = row.url || row.file || '';

                    utils.fetch('/export/download?url=' + downurl + '&file_name=' + filename).then((res) => {
                        setTimeout(function () {
                            row.downing = false;
                            vm.tableData.splice(index, 1, row);
                        }, 2000)
                        if (res && res.code == 0) {
                            let url = res.content.url;
                            window.location.href = url;
                        } else {
                            vm.$message({ message: '下载失败', type: 'error' });
                        }
                    })
                }
            }
        },
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            let data = utils.getCache(),
                obj = data == '' ? {} : JSON.parse(data),
                sid = vm.$route.params.station_id;
            if (!sid && obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData(sid);
            }
        });
    }
}
</script>
<style>
</style>