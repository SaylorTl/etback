<template>
  <div id="box" class="menu-hide">
    <div class="worker station">
      <div class="condition clearfix box-width">
        <div class="left">
          <my-select-domain
            v-model.trim="search.domain_id"
            size="small"
            class="cell"
            width="150px"
            placeholder="易停区域"
          ></my-select-domain>
          <my-select-station
            v-model.trim="search.station"
            size="small"
            class="cell"
            width="150px"
            placeholder="停车场"
          ></my-select-station>
          <el-input
            v-model.trim="search.fullname"
            size="small"
            class="cell widthX120"
            placeholder="用户"
          ></el-input>
          <el-input
            v-model.trim="search.tnum"
            size="small"
            class="cell widthX200"
            placeholder="易停单号"
          ></el-input>
          <el-input
            v-model.trim="search.sn"
            size="small"
            class="cell widthX200"
            placeholder="第三方单号"
          ></el-input>
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
          <el-button @click="exportFile" size="small">
            <i class="fa fa-download"></i>导出
          </el-button>
        </div>
      </div>
      <div v-show="search_more" class="condition-more clearfix box-width">
        <my-linkage-dept v-model="search.dept" type="2"></my-linkage-dept>
        <select-property
          v-model="search.property_id"
          size="small"
          class="cell widthX150"
          placeholder="物业公司名称"
        ></select-property>
        <el-select v-model="search.type" size="small" class="cell widthX100" placeholder="选择类型">
          <el-option label="月卡" value="MONTH"></el-option>
          <el-option label="临停" value="TEMP"></el-option>
        </el-select>
        <el-select v-model="search.cash" size="small" class="cell widthX100" placeholder="是否现金">
          <el-option label="是" value="Y"></el-option>
          <el-option label="否" value="N"></el-option>
        </el-select>
        <el-select v-model="search.paid" size="small" class="cell widthX100" placeholder="是否支付">
          <el-option label="是" value="Y"></el-option>
          <el-option label="否" value="N"></el-option>
        </el-select>
        <el-date-picker
          v-model="search.datetimerange"
          size="small"
          type="datetimerange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="widthX350"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </div>
      <div class="table box-width">
        <el-table
          v-loading="shade"
          element-loading-text="拼命加载中"
          :data="tableData"
          show-summary
          :summary-method="getSummaries"
          border
          fit
          style="width:100%"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand">
                <el-form-item label="第三方单号:">
                  <span>{{ props.row.czy_sn }}</span>
                </el-form-item>
                <el-form-item label="预付单号:">
                  <span>{{ props.row.related_tnum }}</span>
                </el-form-item>
                <el-form-item label="上报时间段:">
                  <span>{{ props.row.time_begin }} ～ {{ props.row.time_end }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="id" width="70"></el-table-column>
          <el-table-column label="大区/事业部" min-width="180">
            <template slot-scope="scope">{{scope.row.area_name}}/{{scope.row.dept_name}}</template>
          </el-table-column>
          <el-table-column prop="station_name" label="停车场" min-width="160"></el-table-column>
          <el-table-column prop="fullname" label="用户" min-width="110"></el-table-column>
          <el-table-column label="类型" width="60">
            <template slot-scope="scope">{{getType(scope.row.type)}}</template>
          </el-table-column>
          <el-table-column label="支付" width="50">
            <template slot-scope="scope">
              <span v-if="scope.row.paid == 'Y'" class="green">是</span>
              <span v-if="scope.row.paid == 'N'">否</span>
            </template>
          </el-table-column>
          <el-table-column label="现金" width="50">
            <template slot-scope="scope">{{(scope.row.cash == 'Y')?'是':'否'}}</template>
          </el-table-column>
          <el-table-column prop="tnum" label="易停订单号" width="160"></el-table-column>
          <el-table-column prop="amount" label="金额" width="65"></el-table-column>
          <el-table-column prop="creationtime" label="时间" width="130"></el-table-column>
          <el-table-column fixed="right" label="操作" width="110">
            <template slot-scope="scope">
              <el-button
                v-if="authCheck('收费系统推送') && scope.row.paid == 'Y'"
                size="mini"
                @click="iposnotify(scope.row.tnum)"
              >收费系统推送</el-button>
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
    return {
      shade: false,
      loadstation: false,
      updateVisible: false,
      pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
      summariesData: { total_amount: "" },
      tableData: [],
      dailyDataInfo: {
        id: "",
        area_name: "",
        dept_name: "",
        station_name: "",
        fullname: "",
        type: "",
        paid: "",
        cash: "",
        czy_sn: "",
        amount: "",
        paidtime: ""
      }, //each row data
      search_more: false,
      search: {
        domain_id: "",
        station: "",
        car: "",
        type: "",
        tnum: "",
        sn: "",
        paid: "",
        cash: "",
        fullname: "",
        datetimerange: [],
        dept: {},
        property_id: ""
      },
      goDialog: { show: false, msg: "" }
    };
  },
  components: {
    "select-property": selectProperty
  },
  methods: {
    setPageData: function(pageObj) {
      this.pagination = pageObj;
      this.getData();
    },
    getType: function(type) {
      var typeMap = { MONTH: "月卡", TEMP: "临停" };
      return typeMap[type];
    },
    btnSearch: function() {
      this.pagination.page = 1;
      // this.summaries();
      this.getData();
    },
    btnUndo: function() {
      this.search_more = false;
      this.search = {
        domain_id: "",
        station: "",
        car: "",
        type: "",
        tnum: "",
        sn: "",
        paid: "",
        cash: "",
        fullname: "",
        datetimerange: [],
        dept: {},
        property_id: ""
      };
      this.pagination.page = 1;
      this.pagination.pagesize = 20;
      // this.summaries();
      this.getData();
    },
    btnMore: function() {
      this.search_more = !this.search_more;
    },
    getData: function() {
      var vm = this;
      var url =
        "/summary/lists?page=" +
        vm.pagination.page +
        "&pagesize=" +
        vm.pagination.pagesize +
        "&debug=1";
      let search = utils.dealRouteParams(vm);
      let {
        domain_id: domain_id,
        station: station_id,
        car: car_id,
        fullname,
        type,
        tnum,
        sn,
        paid,
        cash,
        dept,
        property_id
      } = search;
      let searchmap = {
        domain_id,
        station_id,
        car_id,
        fullname,
        type,
        tnum,
        sn,
        paid,
        cash,
        property_id
      };

      if (vm.search.datetimerange && vm.search.datetimerange.length === 2) {
        let [begin, end] = vm.search.datetimerange;
        if (begin == end) {
          vm.$message({
            showClose: true,
            message: "开始时间和结束时间不能一样",
            type: "error"
          });
          return;
        }
        searchmap.begin_time = begin;
        searchmap.end_time = end;
      } else {
        searchmap.begin_time = "";
        searchmap.end_time = "";
      }
      var querystr = utils.setQueryString(searchmap);
      url += querystr ? "&" + querystr : "";
      let deptStr = utils.setDeptQuery(dept);
      url += deptStr ? "&" + deptStr : "";
      vm.shade = true;
      // 合计 金额
      vm.summaries();
      console.log("get url");
      console.log(url);
      utils.fetch(url).then(function(res) {
        vm.tableData =
          typeof res != "undefined" &&
          res.code == 0 &&
          res.content &&
          res.content.lists
            ? res.content.lists
            : [];
        vm.pagination.total =
          typeof res != "undefined" &&
          res.code == 0 &&
          res.content &&
          res.content.total
            ? res.content.total
            : 0;

        vm.shade = false;
        utils.setCache(vm, "summariesData");
      });
    },
    getSummaries: function(param) {
      var total = this.summariesData.total_amount;
      var result = [];
      result[0] = "合计";
      result[9] = total ? total.toFixed(2) : 0; //日报金额合计
      return result;
    },
    summaries: function() {
      var vm = this;
      var url =
        "/summary/sum?page=" +
        vm.pagination.page +
        "&pagesize=" +
        vm.pagination.pagesize +
        "&debug=1";
      let {
        station: station_id,
        car: car_id,
        fullname,
        type,
        tnum,
        sn,
        paid,
        cash,
        dept
      } = vm.search;
      let searchmap = {
        station_id,
        car_id,
        fullname,
        type,
        tnum,
        sn,
        paid,
        cash
      };
      if (vm.search.datetimerange && vm.search.datetimerange.length === 2) {
        let [begin, end] = vm.search.datetimerange;
        if (begin == end) {
          vm.$message({
            showClose: true,
            message: "开始时间和结束时间不能一样",
            type: "error"
          });
          return;
        }
        searchmap.begin_time = begin;
        searchmap.end_time = end;
      } else {
        searchmap.begin_time = "";
        searchmap.end_time = "";
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
    iposnotify: function(tnum) {
      var vm = this;
      utils.fetch("/summary/notifyipos?tnum=" + tnum).then(function(json) {
        if (typeof json != "undefined") {
          vm.$message({
            showClose: true,
            message: json.message,
            type: "success"
          });
        }
      });
    },
    authCheck: function(tag) {
      return utils.authCheck(this, tag);
    },
    exportFile: function() {
      var vm = this;
      if ((vm.tableData && vm.tableData.length === 0) || vm.tableData == "") {
        vm.$message({
          showClose: true,
          message: "无数据,不可导出",
          type: "error"
        });
        return false;
      }
      console.log("vm.tableData.length === 0");
      console.log(vm.tableData);
      let url = "/summary/export?";
      let {
        dept,
        datetimerange,
        station: station_id,
        ...searchmap
      } = this.search;
      searchmap.station_id = station_id;
      if (datetimerange && datetimerange.length === 2) {
        searchmap.begin_time = datetimerange[0];
        searchmap.end_time = datetimerange[1];
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
          vm.$message({ showClose: true, message: res.message, type: "error" });
        }
      });
    },
    goTodolist() {
      this.$router.push({ path: "/todolist" });
    }
  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
      utils.getTingYunScript();
      var hasParams = utils.hasRouteParams(vm.$route.params);
      if (hasParams) {
        vm.getData();
        return;
      }
      var data = utils.getCache();
      var obj = data == "" ? {} : JSON.parse(data);
      if (obj.tableData && obj.tableData.length > 0) {
        utils.getCacheItem(vm, obj);
      } else {
        vm.getData();
      }
    });
  }
};
</script>
