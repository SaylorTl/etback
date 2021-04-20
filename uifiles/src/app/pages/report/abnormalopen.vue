
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists abnormal-open'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="search.day" size="small" class="cell" type="date" placeholder="选择日期"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                </div>
            </div>
            <div class="map-box">
                <div id="offline-china" class="map"></div>
                <div id="offline-province" class="map"></div>
            </div>
            <div class='table box-width clearfix'>
                <div class="clearfix display-table" >
                    <div class="table-row">
                        <div ref="echarts1" class="table-cell"></div>
                    </div>
                </div>
                <div class="clearfix abnormal-content">
                    <div class="widthX200 left">
                        <div :class={hide:detaile_show} class="offline-charts" >点击柱状图显示掉线明细</div>
                        <div :class={hide:!detaile_show} class="offline-detail">{{detaile_name}} 掉线明细</div>
                        <el-table :class={hide:!detaile_show} v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit class="widthP100">
                            <el-table-column type="index" width="60"></el-table-column>
                            <el-table-column prop="time" label="掉线时间"></el-table-column>
                        </el-table>
                    </div>
                    <div class="abnormal-content-right">
                        <div class="abnormal-content-intro">概况</div>
                        <el-table :data="survey_table" v-loading="survey_shade" element-loading-text="拼命加载中" border fit class="widthP100">
                            <el-table-column prop="memo" label="掉线高峰时间段" width="180"></el-table-column>
                            <el-table-column prop="count" label="数量" width="50"></el-table-column>
                            <el-table-column prop="lists" label="停车场"></el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import echarts from "echarts";
import utils from "../../../utils/utils.js";
require("../../map/china.js");
require("../../map/province/shanghai.js");
require("../../map/province/neimenggu.js");
require("../../map/province/xianggang.js");
require("../../map/province/aomen.js");
require("../../map/province/chongqing.js");
require("../../map/province/tianjin.js");
require("../../map/province/xinjiang.js");
require("../../map/province/beijing.js");
require("../../map/province/ningxia.js");
require("../../map/province/qinghai.js");
require("../../map/province/gansu.js");
require("../../map/province/guangxi.js");
require("../../map/province/hainan.js");
require("../../map/province/sichuan.js");
require("../../map/province/guizhou.js");
require("../../map/province/yunnan.js");
require("../../map/province/xizang.js");
require("../../map/province/shanxi1.js");
require("../../map/province/guangdong.js");
require("../../map/province/hunan.js");
require("../../map/province/hubei.js");
require("../../map/province/henan.js");
require("../../map/province/jiangxi.js");
require("../../map/province/fujian.js");
require("../../map/province/liaoning.js");
require("../../map/province/jilin.js");
require("../../map/province/heilongjiang.js");
require("../../map/province/jiangsu.js");
require("../../map/province/zhejiang.js");
require("../../map/province/anhui.js");
require("../../map/province/shanxi.js");
require("../../map/province/hebei.js");
require("../../map/province/shandong.js");
// require("../../map/province/taiwan.js");
var pie = null;
var map = null;

export default {
  data: function() {
    return {
      shade: false,
      search: { day: "" },
      tableData: [],
      detaile_name: "",
      detaile_show: false,
      survey_table: [],
      survey_shade: false
    };
  },
  destroyed: function(){
    map = null;
    pie = null;
  },
  methods: {
    chart: function() {
      var vm = this;
      var x_axis_data = [];
      var y_axis_data = [];
      var y_max = 10;
      var chart_name = "掉线次数";

      var url = "/offlinereport/computer?step=daytime";
      if (vm.search.day != "") {
        url += "&daytime=" + vm.timeParse(this.search.day, "-");
      }
      utils.fetch(url).then(function(json) {
        if (typeof json != "undefined" && json.code == 0) {
          for (var i in json.content) {
            if (json.content[i]) {
              x_axis_data.push(json.content[i].station_name);
              y_axis_data.push(json.content[i].num);
              if (json.content[i].num > y_max) y_max = json.content[i].num;
            }
          }
          vm.mapChart(json.content);
        }
        var option = {
          title: { text: "掉线次数" },
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross", crossStyle: { color: "#999" } }
          },
          toolbox: {
            orient: "vertical",
            x: "right",
            y: "center",
            feature: { magicType: { show: false, type: ["line", "bar"] } }
          },
          legend: { data: [] },
          dataZoom: { show: true, realtime: true, start: 40, end: 60 },
          xAxis: [
            {
              type: "category",
              data: x_axis_data,
              axisPointer: { type: "shadow" }
            }
          ],
          yAxis: [{ type: "value", axisLabel: { formatter: "{value}" } }],
          series: [{ name: chart_name, type: "bar", data: y_axis_data }]
        };
        var myChart = echarts.init(vm.$refs.echarts1);
        myChart.setOption(option);
        myChart.on("click", function(params) {
          if (
            params.componentType == "series" &&
            params.componentSubType == "bar" &&
            params.seriesType == "bar"
          ) {
            vm.detaile(params.name);
          }
        });
      });
    },
    mapChart: function(data) {
      var that = this;
      var city = '广东';
      var province = [
        { name: "北京", value: 0 },
        { name: "天津", value: 0 },
        { name: "上海", value: 0 },
        { name: "重庆", value: 0 },
        { name: "河北", value: 0 },
        { name: "河南", value: 0 },
        { name: "云南", value: 0 },
        { name: "辽宁", value: 0 },
        { name: "黑龙江", value: 0 },
        { name: "湖南", value: 0 },
        { name: "安徽", value: 0 },
        { name: "山东", value: 0 },
        { name: "新疆", value: 0 },
        { name: "江苏", value: 0 },
        { name: "浙江", value: 0 },
        { name: "江西", value: 0 },
        { name: "湖北", value: 0 },
        { name: "广西", value: 0 },
        { name: "甘肃", value: 0 },
        { name: "山西", value: 0 },
        { name: "内蒙古", value: 0 },
        { name: "陕西", value: 0 },
        { name: "吉林", value: 0 },
        { name: "福建", value: 0 },
        { name: "贵州", value: 0 },
        { name: "广东", value: 0 },
        { name: "青海", value: 0 },
        { name: "西藏", value: 0 },
        { name: "四川", value: 0 },
        { name: "宁夏", value: 0 },
        { name: "海南", value: 0 },
        { name: "台湾", value: 0 },
        { name: "香港", value: 0 },
        { name: "澳门", value: 0 }
      ]
      for(var dKey in data){
        for(var pKey in province){
          if( data[dKey].province_name.indexOf( province[pKey].name ) != -1 ){
              province[pKey].value += data[dKey].num;
              break;
          }
        }
      }
      if(!map){
        map = echarts.init(document.getElementById("offline-china"));
      }
      var option = {
        title: {
          text: "车场掉线",
          x: "center",
          y: 10
        },
        tooltip: {
          trigger: "item"
        },
        dataRange: {
          min: 0,
          max: 1000,
          x: "left",
          y: "bottom",
          text: ["高", "低"], // 文本，默认为数值文本
          calculable: true
        },
        series: [
          {
            name: "车场掉线",
            type: "map",
            mapType: "china",
            roam: false,
            label: {
              normal: {
                show: true
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: { label: { show: true } },
              emphasis: { label: { show: true } }
            },
            data: province
          }
        ]
      };
      // 使用刚指定的配置项和数据显示图表。
      map.setOption(option,true);
      this.showCity(city,data);
      map.on("click", function(params) {
        var city = params.name;
        that.showCity(city,data);
      });
    },
    showCity: function(city,data) {
      var arr = [];
      for(var dKey in data){
        if(data[dKey].province_name.indexOf(city) != -1){
          arr.push({name: data[dKey].city_name, value: data[dKey].num})
        }
      }
      var showCity = function() {
        if (!pie) {
          pie = echarts.init(document.getElementById("offline-province"));
        }
        pie.setOption({
          title: {
            text: city,
            x: "center",
            y: 10
          },
          tooltip: {
            trigger: "item"
          },
          backgroundColor: "",
          dataRange: {
            min: 0,
            max: 500,
            x: "left",
            y: "bottom",
            text: ["高", "低"], // 文本，默认为数值文本
            calculable: true
          },
          series: [
            {
              name: "车场掉线",
              type: "map",
              mapType: city,
              label: {
                normal: {
                  show: true
                }
              },
              itemStyle: {
                normal: { label: { show: true } },
                emphasis: { label: { show: true } }
              },
              data: arr
            }
          ]
        },true);
        pie.on("click", function(params) {
          console.log(params);
        });
      };

      showCity("上海");
    },
    detaile: function(station) {
      var vm = this;
      var now = new Date();
      vm.detaile_name = station;
      vm.shade = true;
      var url = "/station/show?station_name=" + station;
      utils.fetch(url).then(function(json) {
        if (typeof json != "undefined" && json.code == 0) {
          var bid = json.content.id;
          var day = vm.timeParse(now, "-");
          var url =
            "/offlinereport/lists?station_id=" + bid + "&daytime=" + day;
          utils.fetch(url).then(function(result) {
            vm.tableData =
              typeof result != "undefined" && result.code == 0
                ? result.content
                : [];
            vm.shade = false;
            vm.detaile_show = true;
          });
        }
      });
    },
    survey: function() {
      var vm = this;
      vm.survey_shade = true;
      var url = "/offlinereport/survey";
      if (vm.search.day != "") {
        url += "?daytime=" + vm.timeParse(this.search.day, "-");
      }
      utils.fetch(url).then(function(result) {
        if (typeof result != "undefined" && result.code == 0) {
          var lists = [];
          var step = result.content.step;
          var data = result.content.result;
          for (var i in data) {
            var tmp = data[i]
              .filter(function(k) {
                if (parseInt(k.num) >= step[i].num && k.station_vendor > 0) {
                  return true;
                }
                return false;
              })
              .map(function(k) {
                return k.station_name;
              });
            lists.push({
              memo: step[i].memo,
              lists: tmp.join(" , "),
              count: tmp.length
            });
          }
          vm.survey_table = lists;
        }
        vm.survey_shade = false;
      });
    },
    strTime: function(str) {
      var arr = str.split(/[- : \/]/),
        date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
      return date;
    },
    timeParse: function(time, delimiter) {
      var y = time.getFullYear().toString();
      var m = time.getMonth() + 1;
      var d = time.getDate();
      m = m > 9 ? m : "0" + m;
      d = d > 9 ? d : "0" + d;
      return y + delimiter + m + delimiter + d;
    },
    btnSearch: function() {
      this.chart();
      this.survey();
    },
    btnUndo: function() {
      this.search.day = "";
      this.chart();
      this.survey();
    }
  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
      vm.chart();
      vm.survey();
    });
  }
};
</script>

<style>
#offline-china,
#offline-province {
  float: left;
}
.map-box{
  margin: 0 auto;
  width: 1200px;
  overflow: hidden;
}
</style>
