
<template>
    <div id="box" class="menu-hide">
        <div class="worker inlists">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-domain v-model.trim="search.domain_id" size="small" class="cell" width="150px" placeholder="易停区域"></my-select-domain>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.sn" size="small" class="cell widthX300" placeholder="订单号"></el-input>
                    <el-button @click="btnMore" size="small">
                        <i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选
                    </el-button>
                    <el-button @click="btnSearch" size="small">
                        <i class="fa fa-search"></i>查找
                    </el-button>
                    <el-button @click="btnUndo" size="small">
                        <i class="fa fa-undo"></i>重置
                    </el-button>
                </div>
                <div class="right">
                    <!-- <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button> -->
                    <el-button @click="exportFile" size="small">
                        <i class="fa fa-download"></i>导出
                    </el-button>
                </div>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <my-linkage-dept v-model="search.dept" type="2"></my-linkage-dept>
                <select-property v-model="search.property_id" size="small" class="cell widthX150" placeholder="物业公司名称"></select-property>
                <el-select v-model="search.type" size="small" class="cell widthX100" placeholder="类型">
                    <el-option label="月卡" value="MONTH"></el-option>
                    <el-option label="临停" value="TEMP"></el-option>
                </el-select>
                <el-select v-model="search.source" size="small" class="cell widthX100" placeholder="来源">
                    <el-option v-for="(k,v) in cfg.sourcetype" :label="k" :value="v" :key="v"></el-option>
                </el-select>
                <el-select v-model="search.status" size="small" class="cell widthX100" placeholder="状态">
                    <el-option v-for="(k,v) in cfg.statustype" :label="k" :value="v" :key="v"></el-option>
                </el-select>
                <el-date-picker v-model="search.datetimerange" size="small" type="datetimerange" class="widthX300" placeholder="选择时间范围" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" show-summary :summary-method="getSummaries" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="订单号:">
                                    <span>{{props.row.related_tnum}}</span>
                                </el-form-item>
                                <el-form-item label="大区/事业部">
                                    <span>{{props.row.area_name}}/{{props.row.dept_name}}</span>
                                </el-form-item>
                                <el-form-item label="支付来源:">
                                    <span v-if="props.row.source == 'WECHAT'">彩之云微信公众号</span>
                                    <span v-else-if="props.row.source == 'WX_AGUA'">阿瓜微信公众号</span>
                                    <span v-else>{{ props.row.source }}</span>
                                </el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="用户名:">
                                    <span>{{ props.row.user_name }}</span>
                                </el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="手机号:">
                                    <span>{{ props.row.user_phone }}</span>
                                </el-form-item>
                                <el-form-item v-if="props.row.source == 'WECHAT' || props.row.source == 'WX_AGUA'" label="微信openID:">
                                    <span>{{ props.row.user_openid }}</span>
                                </el-form-item>
                                <el-form-item label="创建时间:">
                                    <span>{{ props.row.creationtime }}</span>
                                </el-form-item>
                                <el-form-item label="修改时间:">
                                    <span>{{ props.row.modifytime }}</span>
                                </el-form-item>
                                <el-form-item label="购买时间段:">
                                    <span>{{props.row.arrival }} {{props.row.departure}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="85"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="65"></el-table-column>
                    <el-table-column prop="kind_name" label="缴费类型" min-width="90"></el-table-column>
                    <el-table-column label="类型" min-width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type == 'MONTH'">月卡</span>
                            <span v-else-if="scope.row.type == 'TEMP'">临停</span>
                            <span v-else>未知</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" min-width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status == 'created'" class="red">未支付</span>
                            <span v-else-if="scope.row.status == 'paid'" class="green">已支付</span>
                            <span v-else>未知</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="140"></el-table-column>
                    <el-table-column prop="paytime" label="支付时间" min-width="140"></el-table-column>
                    <el-table-column label="操作" fixed="right" min-width="140">
                        <template slot-scope="scope">
                            <el-button type="plain" size="mini" @click="sendMessage(scope.row)">推送收费系统</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
        </div>
        <el-dialog title="导出成功" :visible.sync="goDialog.show" width="30%">
            <p>{{goDialog.msg}}</p>
            <div class="tc">
                <el-button type="primary" @click="goTodolist">前往待办</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import utils from "../../../utils/utils.js";
import selectProperty from "../../../utils/select-property.vue";
export default {
    data: function() {
        let cfg = {
            sourcetype: utils.config.payMethod,
            statustype: utils.config.payStatus
        };
        return {
            cfg,
            shade: false,
            search_more: false,
            search: {
                domain_id: "",
                station_id: "",
                car_id: "",
                type: "",
                sn: "",
                status: "",
                source: "",
                phone: "",
                datetimerange: [],
                dept: {},
                property_id: ""
            },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            summariesData: { total_amount: "" },
            tableData: [],
            goDialog: { show: false, msg: "" }
        };
    },
    components: {
        "select-property": selectProperty
    },
    methods: {
        getData: function() {
            const {queryFlag} = this.$route.params;
            if (queryFlag && queryFlag === 'fastQuery') {
                this.search = {};
            }
            var vm = this;
            var url =
                "/order/apply?page=" +
                vm.pagination.page +
                "&pagesize=" +
                vm.pagination.pagesize;
            let { dept, ...params } = utils.dealRouteParams(vm);;
            let searchmap = { ...params };
            if (
                vm.search.datetimerange &&
                vm.search.datetimerange.length === 2
            ) {
                let [begin, end] = vm.search.datetimerange;
                if (begin == end) {
                    vm.$message({
                        showClose: true,
                        message: "开始时间和结束时间不能一样",
                        type: "error"
                    });
                    return;
                }
                searchmap.begintime = begin;
                searchmap.endtime = end;
            } else {
                searchmap.begintime = "";
                searchmap.endtime = "";
            }
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? "&" + querystr : "";
            let deptStr = utils.setDeptQuery(dept);
            url += deptStr ? "&" + deptStr : "";
            vm.shade = true;
            console.log("get url");
            console.log(url);
            vm.summaries();
            utils.fetch(url).then(function(json) {
                vm.clearRouteParams();
                vm.tableData =
                    typeof json != "undefined" &&
                    json.code == 0 &&
                    json.content &&
                    json.content.lists
                        ? json.content.lists
                        : [];
                vm.pagination.total =
                    typeof json != "undefined" && json.code == 0 && json.content
                        ? json.content.total
                        : 0;
                utils.setCache(vm, "summariesData");
                vm.shade = false;
            });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function() {
            this.pagination.page = 1;
            // this.summaries();
            this.getData();
        },
        btnUndo: function() {
            this.search_more = false;
            this.search = {
                station_id: "",
                car_id: "",
                type: "",
                sn: "",
                status: "",
                source: "",
                phone: "",
                datetimerange: [],
                dept: "",
                property_id: ""
            };
            this.clearRouteParams();
            this.getData();
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        sendMessage: function(row) {
            var vm = this;
            utils.fetch("/order/notify?tnum=" + row.tnum).then(function(res) {
                if (res.code == 0) {
                    vm.$message({ message: res.message, type: "success" });
                } else {
                    vm.$message({ message: res.message, type: "error" });
                }
            });
        },
        getSummaries: function(param) {
            var total = this.summariesData.total_amount;
            var result = [];
            result[0] = "合计";
            result[3] = total ? total.toFixed(3) : 0; //续费订单金额合计
            return result;
        },
        summaries: function() {
            var vm = this;
            var url =
                "/order/sum?page=" +
                vm.pagination.page +
                "&pagesize=" +
                vm.pagination.pagesize;
            let {
                station: station_id,
                car: car_id,
                phone,
                type,
                sn,
                status,
                source,
                dept
            } = vm.search;
            let searchmap = {
                station_id,
                car_id,
                phone,
                type,
                sn,
                status,
                source
            };
            if (
                vm.search.datetimerange &&
                vm.search.datetimerange.length === 2
            ) {
                let [begin, end] = vm.search.datetimerange;
                if (begin == end) {
                    vm.$message({
                        showClose: true,
                        message: "开始时间和结束时间不能一样",
                        type: "error"
                    });
                    return;
                }
                searchmap.begintime = begin;
                searchmap.endtime = end;
            } else {
                searchmap.begintime = "";
                searchmap.endtime = "";
            }
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? "&" + querystr : "";
            let deptStr = utils.setDeptQuery(dept);
            url += deptStr ? "&" + deptStr : "";
            utils.fetch(url).then(function(json) {
                vm.summariesData =
                    typeof json != "undefined" && json.code == 0 && json.content
                        ? json.content[0]
                        : { total_amount: "" };
            });
        },
        exportFile: function() {
            var vm = this;
            if (vm.tableData && vm.tableData.length === 0) {
                vm.$message({
                    showClose: true,
                    message: "无数据,不可导出",
                    type: "error"
                });
                return false;
            }

            let url = "/order/applyExport?";
            let {
                car: car_id,
                station: station_id,
                datetimerange,
                dept,
                ...searchmap
            } = this.search;
            searchmap.station_id = station_id;
            searchmap.car_id = car_id;
            if (datetimerange && datetimerange.length === 2) {
                searchmap.begintime = datetimerange[0];
                searchmap.endtime = datetimerange[1];
                searchmap.datetimerange = datetimerange.join(",");
            }

            var querystr = utils.setQueryString(searchmap);
            url += querystr ? "&" + querystr : "";
            let deptStr = utils.setDeptQuery(dept);
            url += deptStr ? "&" + deptStr : "";
            console.log("export url");
            console.log(url);
            utils.fetch(url).then(function(res) {
                if (res.code === 0) {
                    vm.goDialog.show = true;
                    vm.goDialog.msg = res.message;
                } else {
                    vm.$message({
                        showClose: true,
                        message: res.message,
                        type: "error"
                    });
                }
            });
        },
        goTodolist() {
            this.$router.push({ path: "/todolist" });
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
    activated(){
      if(Object.keys(this.$route.params).length > 0){
        this.getData();
      }
    },
    deactivated() {
      this.getData();
    }
};
</script>
