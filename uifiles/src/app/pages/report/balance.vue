
<template>
    <div id='box' class="menu-hide balance">
        <div class='worker inlists'>
            <div class='mainbox'>
              
                    <div class="">
                      <my-linkage-dept  @input="getArea" v-model="dept"></my-linkage-dept>

                      <div class="inline-block" >
                        <el-date-picker v-model="beginMonth" :clearable="false" type="month" size="small" placeholder="选择开始月"></el-date-picker>
                      </div>
                      <div class="inline-block" >
                        <el-date-picker v-model="endMonth"  :clearable="false" type="month" size="small" placeholder="选择结束月"></el-date-picker>
                      </div>
                    </div>
                      <div v-show="!chaNoD" v-loading="chaLoading" ref="echarts1" class="balance-charts"></div>
                      <el-button class="change-type-btn" type="primary" @click="changeType" size="small">{{chartConfig[chartType]['btn']}}</el-button>
                      <div v-show="chaNoD"  class="balance-nodata">暂无数据</div>
              <div class="balance-table">
                <el-table
                  @cell-mouse-enter='rowClick'
                  :data="lists"
                  style="width: 100%"
                  >
                  <el-table-column :type="areaData.department?'':'expand'">
                   <template slot-scope="props">
                     <el-table
                     v-if="!areaData.department"
                     class="son-table"
                     :data="sonTable[props.row.detail_id] || linSonTable"
                     :show-header="showHeader"
                     >
                     <el-table-column
                       v-for="item in tHead"
                       :key="item.key"
                       :prop="item.key"
                       :show-header="showHeader"
                       min-width="150"
                       :label="item.name">
                     </el-table-column>
                    </el-table>
                   </template>
                 </el-table-column>
                  <el-table-column
                    v-for="item in tHead"
                    :key="item.key"
                    :prop="item.key"
                    min-width="150"
                    :label="item.name">
                  </el-table-column>

                </el-table>
              </div>
            </div>
        </div>
    </div>

</template>

<script>
import echarts from "echarts";
import utils from "../../../utils/utils.js";
import moment from "moment";
export default {
  data: function() {
    return {
      chartOneStation: "11",
      chartTwoStation: "",
      chartTwoContent: {},
      beginMonth: moment().format("YYYY-MM"),
      endMonth: moment().format("YYYY-MM"),
      lists: [],
      chartType: "receivable",
      chartConfig: {
        receivable: {
          name: "receivable",
          title: "月卡收入对比",
          btn: "切换至数量对比"
        },
        num: {
          name: "receivable",
          title: "月卡数量对比",
          btn: "切换至收入对比"
        }
      },
      areaData: {},
      chaLoading: true,
      chaNoD: false,
      dept: "",
      deptloading: false,
      monthN: "",
      monthB: "",
      requestStatus: false,
      tHead: [],
      sonTable: {},
      showHeader: false,
      data: {},
      linSonTable: [],
      rowOff: {}
    };
  },
  watch: {
    beginMonth: function() {
      this.beginMonth = moment(this.beginMonth).format("YYYY-MM");
      this.chart2();
    },
    endMonth: function() {
      this.endMonth = moment(this.endMonth).format("YYYY-MM");
      this.chart2();
    }
  },
  methods: {
    rowClick: function(item) {
      // var rowOff = this.rowOff[item.name]
      // this.rowOff[item.name] = !rowOff;

      // rowOff || this.areaData.department
      if(this.areaData.department){
        return;
      }
      var vm = this;
      vm.linSonTable = [{}];
      var param = {
        end_time: this.endMonth,
        begin_time: this.beginMonth
      };
      if (vm.areaData.area) {
        param.area_id = vm.areaData.area;
      }
      param.detail_id = item.detail_id;
      
      if(vm.sonTable[param.detail_id]){
        return true;
      }
      var paramStr = utils.setQueryString(param);
      utils
        .fetch("/contractreport/takeStationIncomecopy?" + paramStr)
        .then(function(json) {
          if (json.code == 0 && json.content) {
            var data = json.content;

            var arr = [];
            for (var key in data.xAxis) {
              var obj = {};
              obj.name = data.xAxis[key];

              for (var lkey in data.lists) {
                var item = data.lists[lkey]["data"];
                var preIncome =
                  "income" +
                  data.lists[lkey].year +
                  "_" +
                  data.lists[lkey].month;
                var preNum =
                  "num" + data.lists[lkey].year + "_" + data.lists[lkey].month;

                obj[preIncome] = item.receivable[key] || 0;
                obj[preNum] = item.num[key] || 0;
              }
              arr.push(obj);
            }
            vm.sonTable[param.detail_id] = arr;
            vm.linSonTable = arr;
          }
        });
    },
    getArea: function(evtValue) {
      this.areaData = evtValue;
      this.chart2();
    },
    dailogSelectDeptShow: function() {
      this.deptloading = this.deptloading ? false : true;
    },
    dailogSelectDeptClose: function() {
      this.deptloading = false;
    },
    dailogSelectDeptChang: function(obj) {
      this.chartTwoStation = obj.value;
      this.dept = obj;
      this.stationIncome();
    },
    arraySum: function(array, type) {
      var sum = 0;
      for (var i = 0; i < array.length; i++) {
        sum += Number(array[i][type]);
      }
      return sum % 1 == 0 ? sum : sum.toFixed(2);
    },
    chart2: function() {
      var vm = this;
      if (vm.requestStatus) {
        return false;
      }
      vm.requestStatus = true;
      // 收入对比
      var param = {
        end_time: this.endMonth,
        begin_time: this.beginMonth
      };
      console.log(vm.dept);
      
      if (vm.dept) {
        param.detail_id = vm.dept;
      }
      var paramStr = utils.setQueryString(param);
      utils
        .fetch("/contractreport/takeStationIncomecopy?" + paramStr)
        .then(function(json) {
          if (json.code == 0 && json.content) {
            vm.stationIncome(json);
            vm.rowOff = {};
            vm.data = json;
            vm.requestStatus = false;
          } else {
            vm.chaNoD = true;
          }
        });
    },
    clearChartTwo: function() {
      this.dept = {};
      this.chartTwoStation = "";
      this.stationIncome();
    },
    stationIncome: function(json) {
      var vm = this;
      var xAxis = [];
      var series = [];
      var data;
      var legendData = [];
      var lists = [];
      var tHead = [{ name: "停车场", key: "name" }];
      if (json && json.code == 0 && json.content) {
        data = json.content;
        var xIndex = 0;
        for (var key in data.xAxis) {
          xAxis.push(data.xAxis[key]);

          var obj = {};
          obj.name = data.xAxis[key];
          for (var lkey in data.lists) {
            var item = data.lists[lkey]["data"];
            var preIncome =
              "income" + data.lists[lkey].year + "_" + data.lists[lkey].month;
            var preNum =
              "num" + data.lists[lkey].year + "_" + data.lists[lkey].month;

            obj[preIncome] = item.receivable[key] || 0;
            obj[preNum] = item.num[key] || 0;
            obj.detail_id = key;
          }
          lists.push(obj);
        }

        for (var key in data.lists) {
          var item = data.lists[key];
          legendData.push(
            data.lists[key]["year"] +
              "-" +
              (data.lists[key]["month"] > 9
                ? data.lists[key]["month"]
                : "0" + data.lists[key]["month"])
          );

          var itemData = [];
          for (var iDKey in item.data[vm.chartType]) {
            itemData.push(item.data[vm.chartType][iDKey]);
          }

          series.push({
            name:
              item.year +
              "-" +
              (item.month > 9 ? item.month : "0" + item.month),
            type: "bar",
            data: itemData
          });

          var incomeKey = "income" + item.year + "_" + item.month;
          var numKey = "num" + item.year + "_" + item.month;

          tHead.push(
            {
              name: item.year + "-" + item.month + "月卡收入",
              key: incomeKey
            },
            {
              name: item.year + "-" + item.month + "月卡数",
              key: numKey
            }
          );
        }

        vm.tHead = tHead;
        vm.lists = lists;

        var option = {
          title: {
            text: vm.chartConfig[vm.chartType]["title"]
            // subtext: '纯属虚构'
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
              crossStyle: {
                color: "#999"
              }
            }
          },
          legend: {
            data: legendData
          },
          dataZoom: { show: true, realtime: true, start: 40, end: 60 },
          xAxis: [
            {
              type: "category",
              data: xAxis,
              axisPointer: {
                type: "shadow"
              }
            }
          ],
          color: [
            "#ff0000",
            "#ff3300",
            "#ff6600",
            "#ff9900",
            "#ffff00",
            "#99ff00",
            "#00ff00",
            "#00ffff",
            "#0000ff",
            "#6600ff",
            "#ff00ff",
            "#ff0066"
          ],
          yAxis: [
            {
              type: "value",
              name: "",
              axisLabel: { formatter: "{value}" }
            },
            {
              type: "value",
              name: "",
              axisLabel: { formatter: "{value}" }
            }
          ],
          series: series
        };
        if (series.length == 0) {
          vm.chaNoD = true;
        } else {
          vm.chaNoD = false;
        }
        var myChart = echarts.init(vm.$refs.echarts1);

        myChart.clear();
        myChart.setOption(option);
      }
    },
    changeType: function() {
      if (this.chartType == "receivable") {
        this.chartType = "num";
      } else {
        this.chartType = "receivable";
      }
      this.stationIncome(this.data);
    }
  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
        utils.getTingYunScript();
      vm.chart2();
    });
  }
};
</script>
<style media="screen">
.balance .change-type-btn {
  position: absolute;
  right: 50px;
  top: 80px;
}
.balance .el-table__expanded-cell {
  padding: 10px 0px 20px 50px;
}
</style>
