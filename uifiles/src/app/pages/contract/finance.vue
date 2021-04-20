
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists finance'>
            <div class='mainbox'>
                
                        <div :class="monthShow?'finance-main-top450':'finance-main-top0'">
                            <div class="left search_header finance-main-top-left">
                                <my-linkage-dept v-model="searchAll.dept" type='2'></my-linkage-dept>
                                <my-select-station v-model.trim="searchAll.station" size="small" class="cell widthX150 mr5"   placeholder="停车场" ></my-select-station>
                                <el-date-picker v-model="searchAll.month" placeholder="选择年份" size="small" class="cell widthX150"  type='year' value-format="yyyy" v-if='monthShow'></el-date-picker>
                                <el-date-picker v-model="searchAll.month" placeholder="选择月份" size="small" class="cell widthX150"  type='month' v-if='!monthShow' value-format="yyyy-MM"></el-date-picker>
                                <el-button @click="btnSearchUp" size="small"><i class="fa fa-search"></i>查找</el-button>
                                <el-button @click="reset" size="small"><i class="fa fa-search"></i>重置</el-button>
                            </div>
                            <div class='right'>
                                <el-button @click="change" size="small">{{monthShow?'切换当月增收页':'切换收入详情页'}}</el-button>
                            </div>
                            <div class="echart_wrap" v-loading='echart1Loading' v-if='monthShow'>
                                <div id='finance_wrap1' ref="echarts1" class="finance-table-cell1" ></div>
                                <div id='finance_wrap2' ref="echarts2" class="finance-table-cell1" ></div>
                                <div class="finance-table-cell2" v-if="messagetip">暂无数据</div>
                            </div>
                            
                        </div>
                <div class="finance-main-content" >
                    <h2 :style="{ color:'#3F3F3F', margin:monthShow ? '5px':'-50px 5px 5px 5px'}">{{monthShow?'收入详情页':'当月增收信息'}}</h2>
                    <el-table :data="yearCome" border style="width: 100%" show-summary height="620"  v-show="!monthShow" v-loading='monthLoading' :style="{'marginTop':monthShow ?'auto':'0'}">
                        <el-table-column prop="year" label="年份"></el-table-column>
                        <el-table-column prop="month" label="月份">
                            <template slot-scope="scope">
                                {{scope.row.month + '月'}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="dept_name" label="事业部"></el-table-column>
                        <el-table-column prop="station_name" label="停车场"></el-table-column>
                        <el-table-column prop="start_pay_time" label="开始支付时间"></el-table-column>
                        <el-table-column prop="monthbase" label="基数"></el-table-column>
                        <el-table-column prop="dept_name" label="事业部">
                            </el-table-column>
                            <el-table-column prop="increasing" label="当月增收"></el-table-column>
                            <el-table-column prop="amount" label="当月总收入"></el-table-column>
                            <el-table-column fixed="right" label="操作">
                                <template slot-scope="scope">
                                    <el-button @click="handleClick(scope.row)" type="text" size="small">修改</el-button>
                                </template>
                            </el-table-column>
                    </el-table>
                    <el-dialog :visible.sync="updateVisible" width='40%'>
                        <el-form :model="editInfo" label-width="80px">
                            <el-form-item label="事业部:">
                                <el-input v-model="editInfo.dept" placeholder="事业部" :disabled='plateFlag'></el-input>
                            </el-form-item>
                            <el-form-item label="停车场:">
                                <el-input v-model="editInfo.station" placeholder="停车场" :disabled='plateFlag'></el-input>
                            </el-form-item>
                            <el-form-item label="基数:">
                                <el-input v-model="editInfo.monthbase" size="small" trigger-on-focus=false placeholder="基数"></el-input>
                            </el-form-item>
                            <el-form-item label="总收入:">
                                <el-input v-model="editInfo.amount" size="small" trigger-on-focus=false placeholder="总收入"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button @click="addSubmit" type="primary" size="small">提交</el-button>
                            </el-form-item>
                        </el-form>
                    </el-dialog>
                    <el-table :data="yearCome" style="width: 100%" show-summary height='500' border v-show="monthShow" v-loading='monthLoading'>
                        <el-table-column prop="year" min-width="80" label="年份"></el-table-column>
                        <el-table-column prop="dept_name" min-width="120" label="事业部"></el-table-column>
                        <el-table-column prop="station_name" min-width="130" label="停车场"></el-table-column>
                        <el-table-column prop="start_pay_time" min-width="140" label="开始支付时间"></el-table-column>
                        <el-table-column prop="last_year_income" min-width="140" label="车场去年总收入"></el-table-column>
                        <el-table-column prop="grandtotal" min-width="100" label="累计增收"></el-table-column>
                        <el-table-column prop="realincome" min-width="100" label="兜底增收"></el-table-column>
                        <el-table-column prop="monthbase" min-width="100" label="每月基数"></el-table-column>
                        <el-table-column prop="total" min-width="110" label="合计收入"></el-table-column>
                        <el-table-column prop="total1" min-width="100" label="1月"></el-table-column>
                        <el-table-column prop="total2" min-width="100" label="2月"></el-table-column>
                        <el-table-column prop="total3" min-width="100" label="3月"></el-table-column>
                        <el-table-column prop="total4" min-width="100" label="4月"></el-table-column>
                        <el-table-column prop="total5" min-width="100" label="5月"></el-table-column>
                        <el-table-column prop="total6" min-width="100" label="6月"></el-table-column>
                        <el-table-column prop="total7" min-width="100" label="7月"></el-table-column>
                        <el-table-column prop="total8" min-width="100" label="8月"></el-table-column>
                        <el-table-column prop="total9" min-width="100" label="9月"></el-table-column>
                        <el-table-column prop="total10" min-width="100" label="10月"></el-table-column>
                        <el-table-column prop="total11" min-width="100" label="11月"></el-table-column>
                        <el-table-column prop="total12" min-width="100" label="12月"></el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import echarts from "echarts";
import utils from "../../../utils/utils.js";
export default {
  data: function() {
    return {
      lists: [],
      searchAll: { station: 11, month: '2017', dept: "" },
      echart1Loading: false,
      echart2Loading: false,
      messagetip: false,
      monthbase: [],
      increasing: [],
      amount: [],
      yearCome: [],
      monthShow: true,
      monthLoading: false,
      stationHeight: false,
      updateVisible: false,
      plateFlag: true,
      editInfo: {
        amount: "",
        monthbase: "",
        dept: "",
        station: "",
        station_id: "",
        year: "",
        month: ""
      }
    };
  },
  methods: {
    addSubmit: function() {
      var vm = this;
      var edit = vm.editInfo;
      var url = "/finance/update";
      let { amount, monthbase, year, month, station_id } = edit;
      let data = { amount, monthbase, year, month, station_id };
      utils.fetch(url, { method: "post", body: data }).then(function(res) {
        if (typeof res != "undefined") {
          if (res.code == 0) {
            vm.updateVisible = false;
            vm.getData();
          } else {
            vm.$message({
              showClose: true,
              message: res.message,
              type: "error"
            });
          }
        }
      });
    },
    handleClick: function(row) {
      var vm = this;
      vm.updateVisible = true;
      vm.editInfo = {
        amount: row.amount,
        monthbase: row.monthbase,
        dept: row.dept_name,
        station: row.station_name,
        station_id: row.station_id,
        year: row.year,
        month: row.month
      };
    },
    change: function() {
      var vm = this;
      vm.monthShow = !vm.monthShow;
      vm.searchAll.month = "";
      vm.getData();
      vm.charts();
    },
    btnSearchUp: function() {
      this.yearCome = [];
      this.charts();
      this.getData();
    },
    getData: function() {
      var vm = this;
      vm.monthLoading = true;
      var url;
      if (!vm.monthShow) {
        url = "/finance/monthreport?page=1&pagesize=9999";
        url += vm.searchAll.month?`&time=${vm.searchAll.month}`:'';
      } else {
        url = "/finance/annualreport?page=1&pagesize=9999";
        url += vm.searchAll.month?`&year=${vm.searchAll.month}`:'';
      }
      if (vm.searchAll.station) {
        url +=`&station_id=${vm.searchAll.station}`;
      }
      if (vm.searchAll.dept && JSON.stringify(vm.searchAll.dept) !='{}'){
        let deptStr = utils.setDeptQuery(vm.searchAll.dept);
            url += deptStr ? `&${deptStr}`: '';
      }
      vm.messagetip = false;
      utils.fetch(url).then(function(res) {
        vm.monthLoading = false;
        if (0 == res.code) {
          if (!vm.monthShow) {
            vm.yearCome = res.content.lists || [];
          } else {
            if (res.content == "") {
              vm.$message({
                showClose: true,
                message: res.message||'没有数据',
                type: "error"
              });
            } else {
              vm.yearCome = res.content.lists || [];
              for (var num = 0; num < vm.yearCome.length; num++) {
                for (var ind in vm.yearCome[num].amountData) {
                  vm.yearCome[num]["total" + ind] =
                    vm.yearCome[num].amountData[ind];
                }
              }
            }
          }
        } else {
          vm.$message({ showClose: true, message: res.message||'没有数据', type: "error" });
        }
      });
    },
    //图标渲染
    charts: function() {
      var vm = this;
      vm.echart1Loading = true;
      vm.echart2Loading = true;
      var url = "/finance/lists?page=1&pagesize=9999";
      let {station:station_id,month:year} = vm.searchAll;
      var data = utils.setQueryString({year,station_id});
      url += data ?`&${data}`:'';
      if (vm.searchAll.dept && JSON.stringify(vm.searchAll.dept) !='{}'){
        let deptStr = utils.setDeptQuery(vm.searchAll.dept);
        url += deptStr ? `&${deptStr}`: '';
      }
      utils.fetch(url).then(function(res) {
        var mychart1 = echarts.init(document.getElementById("finance_wrap1"));
        var mychart2 = echarts.init(document.getElementById("finance_wrap2"));
        if (0 == res.code) {
          vm.echart1Loading = false;
          vm.echart2Loading = false;
          var monthbase = [];
          var amount = [];
          var increasing = [];
          for (var index in res.content.lists) {
            let itemObj = res.content.lists[index];
            vm.lists.push(itemObj);
            itemObj.id = index + "月";
            monthbase.push(parseInt(itemObj.monthbase) / 10000);
            increasing.push(parseInt(itemObj.increasing) / 10000);
            amount.push(parseInt(itemObj.amount) / 10000);
          }
          vm.monthbase = monthbase;
          vm.amount = amount;
          vm.increasing = increasing;
          
          var colors = ["#B2A4DA", "#F6BB89", "#5FC4C7", "#6CB1EA"];
          var option = {
            noDataLoadingOption: {
              text: "暂无数据",
              effect: "bubble",
              effectOption: {
                effect: {
                  n: 0
                }
              }
            },
            color: colors,
            title: {
              text: "停车场每月增收对比",
              x: "center",
              textStyle: {
                color: "#3F3F3F"
              }
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "cross"
              }
            },
            grid: {
              right: "5%",
              left: "8%"
            },
            toolbox: {
              x: "80%",
              y: "top",
              feature: {
                dataView: {
                  show: true,
                  readOnly: true,
                  optionToContent: function(opt) {
                    var colName = "月份";
                    var dataview = opt.toolbox[0].feature.dataView; //获取dataview
                    var table = vm.getTable(opt, colName); //'<div style="position:absolute;top: 5px;left: 0px;right: 0px;line-height: 1.4em;text-align:center;font-size:14px;" class="xx-oo">'+dataview.title+'</div>'
                    return table;
                  }
                },
                // restore: {show: true},//update
                saveAsImage: { show: true }
              }
            },
            legend: {
              data: ["月份", "基数", "实际收入"],
              x: "center",
              y: "bottom"
            },
            xAxis: [
              {
                type: "category",
                axisTick: {
                  alignWithLabel: true
                },
                data: [
                  "1月",
                  "2月",
                  "3月",
                  "4月",
                  "5月",
                  "6月",
                  "7月",
                  "8月",
                  "9月",
                  "10月",
                  "11月",
                  "12月"
                ]
              }
            ],
            yAxis: [
              {
                type: "value",
                name: "万元",
                position: "left",
                axisLine: {
                  lineStyle: {
                    color: "#000000"
                  }
                },
                axisLabel: {
                  show: true
                }
              }
            ],
            series: [
              {
                name: "基数",
                type: "bar",
                data: vm.monthbase
              },
              {
                name: "实际收入",
                type: "bar",
                data: vm.amount
              }
            ]
          };
          mychart1.clear();
          mychart1.setOption(option, true);
          vm.fullscreenLoading = false;
          //折线图
          var option2 = {
            color: colors,
            title: {
              text: "停车场每月增收",
              x: "center"
            },
            tooltip: {
              trigger: "axis"
            },
            legend: {
              data: ["每月增收"],
              x: "center",
              y: "bottom"
            },
            toolbox: {
              x: "80%",
              show: true,
              feature: {
                dataView: {
                  show: true,
                  readOnly: true,
                  optionToContent: function(opt) {
                    //console.info(opt);
                    var dataview = opt.toolbox[0].feature.dataView;
                    var axisData = opt.xAxis[0].data;
                    var series = opt.series;
                    var tdHeaders = "<th>月份</th>"; //表头
                    series.forEach(function(item) {
                      tdHeaders += "<th>" + item.name + "</th>"; //组装表头
                    });
                    var table =
                      '<table class="et-finace-chart-table" style="text-align:center"><thead>' +
                      tdHeaders +
                      "</thead><tbody>";
                    var bodyStr = "";
                    var tdBodys = ""; //数据
                    for (let i = 0, l = axisData.length; i < l; i++) {
                      for (let j = 0; j < series.length; j++) {
                        tdBodys += "<td>" + series[j].data[i] + "</td>"; //组装表数据
                      }
                      bodyStr +=
                        '<tr><td style="padding: 0 10px">' +
                        axisData[i] +
                        "</td>" +
                        tdBodys +
                        "</tr>";
                      tdBodys = "";
                    }
                    table += bodyStr;
                    table += "</tbody></table>";
                    return table;
                  }
                },
                // restore: {show: true},
                saveAsImage: { show: true }
              }
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: [
                "1月",
                "2月",
                "3月",
                "4月",
                "5月",
                "6月",
                "7月",
                "8月",
                "9月",
                "10月",
                "11月",
                "12月"
              ]
            },
            yAxis: {
              type: "value",
              name: "万元",
              axisLabel: {}
            },
            series: [
              {
                name: "每月增收",
                type: "line",
                data: vm.increasing,
                markLine: {
                  data: [
                    { type: "average", name: "平均值" },
                    [
                      {
                        symbol: "none",
                        x: "90%",
                        yAxis: "max"
                      },
                      {
                        symbol: "circle",
                        label: {
                          normal: {
                            position: "start",
                            formatter: "最大值"
                          }
                        },
                        type: "max",
                        name: "最高点"
                      }
                    ]
                  ]
                }
              }
            ]
          };
          mychart2.clear();
          mychart2.setOption(option2, true);
        } else {
          
          // vm.$message({ showClose: true, message: res.message, type: "error" });
          vm.echart1Loading = false;
          vm.echart2Loading = false;
          mychart1.clear();
          mychart2.clear();
          vm.messagetip = true;
        }
      });
    },
    getTable(opt, colName) {
      //渲染数据视图
      var axisData = opt.xAxis[0].data; //获取图形的data数组
      var series = opt.series; //获取series
      var sum = new Array(); //获取合计数组（根据对应的系数生成相应数量的sum）
      for (var i = 0; i < series.length; i++) {
        sum[i] = 0;
      }
      var table =
        '<table class="et-finace-chart-table" style="text-align:center"><thead><tr>' +
        "<th>" +
        colName +
        "</th>";
      for (var i = 0; i < series.length; i++) {
        table += "<th>" + series[i].name + "</th>";
      }
      table += "</tr></thead><tbody>";
      for (var i = 0, l = axisData.length; i < l; i++) {
        for (var n = 0; n < series.length; n++) {
          if (series[n].data[i]) {
            sum[n] += Number(series[n].data[i]);
          } else {
            sum[n] += Number(0);
          }
        }
        table += "<tr>" + "<td>" + axisData[i] + "</td>";
        for (var j = 0; j < series.length; j++) {
          if (series[j].data[i]) {
            table += "<td>" + series[j].data[i] + "</td>";
          } else {
            table += "<td>" + 0 + "</td>";
          }
        }
        table += "</tr>";
      }
      table += "</tr></tbody></table>";
      return table;
    },
    //导入按钮跳转
    contractImport: function() {
      this.$router.push({ path: "/contract/difference" });
    },
    reset: function() {
      this.searchAll = { station: "", month: "", dept: "" };
      this.getData();
      this.charts();
    }
  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
      utils.getTingYunScript();
    });
  },
  beforeMount: function() {
    this.charts();
    this.getData();
  }
};
</script>
<style scoped>
.echart_wrap {
  height: 400px;
  width: 1200px;
  margin-top: 55px;
  display: flex;
  flex-flow: nowrap row;
  position:relative;
}
.echart_wrap > div {
  height: 380px;
  width: 50%;
}
.search_header {
  display: flex;
  justify-content: end;
  align-items: baseline;
}
.search_Bottom {
  display: flex;
  justify-content: end;
  align-items: baseline;
  position: relative;
}
</style>
<style>
/*==============  财务报表 ===============*/
.et-finace-chart-table {
  width: 100%;
}
.et-finace-chart-table th,
.et-finace-chart-table td {
  line-height: 36px;
  color: #333;
  font-size: 14px;
}
.et-finace-chart-table thead tr {
  background: #94d5fb;
}
.et-finace-chart-table tbody tr:nth-child(2n) {
  background: #cce8f9;
}
.et-finace-chart-table tbody tr:nth-child(2n-1) {
  background: #eaf0f9;
}
#finance_wrap1 > div:nth-child(3) {
  z-index: 10;
}
</style>
