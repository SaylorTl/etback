<template>
    <div id="box" class="menu-hide">
        <div class="worker inlists">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" :isFocus="!!!search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.control_type" size="small" class="cell widthX100" placeholder="类型" clearable>
                        <el-option label="系统" value="S"></el-option>
                        <el-option label="遥控器" value="R"></el-option>
                    </el-select>
                    <el-date-picker v-model="search.table_time" size="small" class="cell" type="month" placeholder="选择月" value-format="yyyyMM"></el-date-picker>
                    <el-button @click="btnMore" size="small"><i :class="['fa', search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                <el-select v-model="search.direction" size="small" class="cell widthX100" placeholder="方向" clearable>
                    <el-option label="进场" value="in"></el-option>
                    <el-option label="出场" value="out"></el-option>
                </el-select>
                <el-date-picker v-model="search.begintime" value-format="yyyy-MM-dd HH:mm:ss" size="small" type="datetime" placeholder="开始时间"></el-date-picker>
                <el-date-picker v-model="search.endtime" value-format="yyyy-MM-dd HH:mm:ss" size="small" type="datetime" placeholder="结束时间"></el-date-picker>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{ props.row.area_name }}/{{ props.row.dept_name }}</span></el-form-item>
                                <el-form-item label="操作员:"><span>{{ props.row.admin }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="55"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column prop="city_name" label="城市" min-width="70"></el-table-column>
                    <el-table-column label="类型" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.control_type == 'S'">系统</span>
                            <span v-if="scope.row.control_type == 'R'">遥控器</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="device_name" label="道闸" width="150"></el-table-column>
                    <el-table-column prop="plate" label="车牌" width="90"></el-table-column>
                    <el-table-column label="方向" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.device_direction == 'in'">进场</span>
                            <span v-else-if="scope.row.device_direction == 'out'">出场</span>
                            <span v-else>未知</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="resaon" label="理由" min-width="85">
                        <template slot-scope="scope">
                            <span>{{ cfg.reason[scope.row.resaon] || "" }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="departure_temp" label="应收" width="50"></el-table-column>
                    <el-table-column prop="time" label="异常时间" width="130"></el-table-column>
                    <el-table-column label="操作" width="80">
                        <template slot-scope="scope">
                            <el-button @click="imgshow(scope.$index, scope.row)" plain size="mini"><i class="fa fa-picture-o"></i>照片</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <!-- <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists> -->
        </div>
    </div>
</template>

<script>
import utils from "../../../utils/utils.js";
import previewImg from "../../component/previewImg/index.vue";
export default {
    data: function () {
        var config = {
            reason: {
                nodata: "无理由",
                special: "特殊车辆",
                noplate: "无车牌",
                manual: "人工识别车牌",
                reenter: "重复入场",
                others: "其他",
                privilege: "特殊车辆",
                expire: "过期月卡",
                bigwigs: "特殊人员",
                norecord: "无入场记录"
            }
        };
        return {
            cfg: config,
            shade: false,
            search_more: false,
            search: { station_id: "", car_id: "", phone: "", control_type: "", table_time: "", begintime: "", endtime: "", dept: "", direction: "out" },
            pagination: { page: 1, pagesize: 20, showTotal: false },
            tableData: [],
            images: { show: false, lists: [] }
        };
    },
    components: {
        "preview-img": previewImg
    },
    methods: {
        getData: function () {
            const { queryFlag } = this.$route.params;
            let url = `/inout/exception?page=${this.pagination.page}&pagesize=${this.pagination.pagesize}`;
            let nowMonth = utils.eptimes.outTime(new Date(), 'yyyy-MM')
            let nowDate = utils.eptimes.outTime(new Date(), 'yyyy-MM-dd')

            if (queryFlag && queryFlag === 'fastQuery') {
                url = `/inout/exception?page=1&pagesize=10`;
                this.search = {};
                this.search.direction = '';
                this.search.table_time = nowMonth.split('-').join('');
                this.search.begintime = `${nowMonth}-01 00:00:00`;
                this.search.endtime = `${nowDate} 23:59:59`;
                this.search_more = true;
            }
            let { dept, ...others } = utils.dealRouteParams(this);
            var smap = {
                dept_ids: dept,
                ...others
            };
            var querystr = utils.setQueryString(smap);
            url += querystr ? '&' + querystr : '';
            this.shade = true;
            utils.fetch(url).then((json) => {
                this.clearRouteParams();
                this.tableData = (typeof (json) != 'undefined' && json.code == 0) ? json.content : [];
                utils.setCache(this);
                this.shade = false;
            });
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = { station_id: '', car_id: '', phone: '', control_type: '', table_time: '', begintime: '', endtime: '', dept: '' };
            this.clearRouteParams();
            this.getData();
        },
        btnMore: function () {
            this.search_more = this.search_more ? false : true;
        },
        imgshow: function (index, row) {
            var vm = this;
            var id = row.id;
            var type = 'exception';
            if (row.control_type == 'S') {
                id = row.tid;
                if (row.direction == 'IN') type = 'in';
                if (row.direction == 'OUT') type = 'out';
            }
            utils.fetch('/inout/images?type=' + type + '&station_id=' + row.station + '&id=' + id + '&date=' + row.time.substr(0, 7)).then(function (json) {
                if (typeof (json) != 'undefined' && json.code == 0 && json.content.length > 0) {
                    vm.images = { show: true, lists: json.content };
                } else {
                    vm.images.show = false;
                    vm.$message({ showClose: true, message: '没有图片', type: 'error' });
                }
            });
        },
        imgClose: function () {
            this.images = { show: false, lists: [] };
        },
        clearRouteParams() {
            let params = this.$route.params;
            for (let i in params) {
                params[i] = "";
            }
        }
    },
    created() {
        utils.getTingYunScript();
        this.getData();
    },
    activated() {
        if (Object.keys(this.$route.params).length > 0) {
            const { car_id } = this.$route.params;
            this.search.car_id = car_id;
            this.getData();
        }
    }
}


</script>
