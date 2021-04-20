<template>
    <div id="box" class="menu-hide">
        <div class="worker inlists">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" :isFocus="!!!search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.ismonth" size="small" class="cell widthX100" placeholder="类型" clearable>
                        <el-option v-for="(v, k) in monthMap" :key="k" :label="v" :value="k"></el-option>
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
                <my-linkage-dept v-model="search.dept" :hideDefault="true"></my-linkage-dept>
                <el-date-picker v-model="search.begintime" value-format="yyyy-MM-dd HH:mm:ss" size="small" type="datetime" placeholder="开始时间"></el-date-picker>
                <el-date-picker v-model="search.endtime" value-format="yyyy-MM-dd HH:mm:ss" size="small" type="datetime" placeholder="结束时间"></el-date-picker>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"
                                    ><span>{{ props.row.area_name }}/{{ props.row.dept_name }}</span></el-form-item
                                >
                                <el-form-item label="车辆品牌:"
                                    ><span>{{ props.row.car_brand }}</span></el-form-item
                                >
                                <el-form-item label="车辆颜色:"
                                    ><span>{{ props.row.car_color }}</span></el-form-item
                                >
                                <el-form-item label="车辆类型:"
                                    ><span>{{ props.row.car_type }}</span></el-form-item
                                >
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="55"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="160"></el-table-column>
                    <el-table-column label="是否在场" min-width="80">
                        <template slot-scope="scope">
                            <span>{{ scope.row.parking ? "在场" : "不在场" }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="city_name" label="城市" min-width="85"></el-table-column>
                    <el-table-column prop="device_name" label="道闸" min-width="150"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="120"></el-table-column>
                    <el-table-column prop="car_serial" label="车型" min-width="95"></el-table-column>
                    <el-table-column label="类型" width="160">
                        <template slot-scope="scope">
                            <span>{{ monthMap[scope.row.month] }}{{ !!scope.row.contract_expires ? "(" + scope.row.contract_expires + ")" : "" }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="进场时间" width="180"></el-table-column>
                    <el-table-column label="操作" width="80">
                        <template slot-scope="scope">
                            <el-button @click="imgshow(scope.$index, scope.row)" plain size="mini"><i class="fa fa-picture-o"></i>照片</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <!--<my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists>-->
        </div>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
import previewImg from "../../component/previewImg/index.vue";
export default {
    data: function() {
        return {
            monthMap: { Y: "月卡", N: "临停", U: "未知" },
            shade: false,
            search_more: false,
            search: { station_id: "", car_id: "", ismonth: "", phone: "", table_time: "", begintime: "", endtime: "", dept: "" },
            pagination: { page: 1, pagesize: 20, showTotal: false },
            tableData: [],
            images: { show: false, lists: [] }
        };
    },
    components: {
        "preview-img": previewImg
    },

    methods: {
        getData: function() {
            const {queryFlag} = this.$route.params;
            let url = `/inout/inlists?page=${this.pagination.page}&pagesize=${this.pagination.pagesize}`;
            let nowMonth = utils.eptimes.outTime(new Date(),'yyyy-MM')
            let nowDate = utils.eptimes.outTime(new Date(),'yyyy-MM-dd')
            
            if(queryFlag && queryFlag === 'fastQuery'){
                url = `/inout/inlists?page=1&pagesize=10`;
                this.search = {};
                this.search.table_time = nowMonth.split('-').join('');
                this.search.begintime = `${nowMonth}-01 00:00:00`;
                this.search.endtime = `${nowDate} 23:59:59`;
                this.search_more = true;
            }
            let {dept,...others} = utils.dealRouteParams(this);
            var smap={
                dept_ids:dept,
                ...others
            };
            var querystr = utils.setQueryString(smap);
            url += querystr ? "&" + querystr : "";
            this.shade = true;
            utils.fetch(url).then((json) => {
                this.clearRouteParams();
                this.tableData = typeof json != "undefined" && json.code == 0 ? json.content : [];
                utils.setCache(this);
                this.shade = false;
            });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { station_id: '', car_id: '', ismonth: '', phone: '', table_time: '', begintime: '', endtime: '', dept: '' };
            this.clearRouteParams();
            this.getData();
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        imgshow: function(index, row) {
            var vm = this;
            // vm.images = {show:true,lists:[]};
            utils.fetch("/inout/images?type=in&station_id=" + row.station + "&id=" + row.id + "&date=" + row.time_recv.substr(0, 7)).then(function(json) {
                if (typeof json != "undefined" && json.code == 0 && json.content.length > 0) {
                    vm.images = { show: true, lists: json.content };
                    // vm.images.lists = json.content
                } else {
                    vm.images.show = false;
                    vm.$message({ showClose: true, message: "没有图片", type: "error" });
                }
            });
        },
        imgClose: function() {
            this.images = { show: false, lists: [] };
        },
        clearRouteParams(){
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
};
</script>
