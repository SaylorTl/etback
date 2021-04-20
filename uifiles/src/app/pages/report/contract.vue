<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class="trend">
                
                        <div class="trend-left">
                            <div class="heightX60">
                                <my-select-station  v-model="chartOneStation" class="cell widthX150 left"  placeholder="停车场"></my-select-station>
                                <div class="left ml5">
                                    <el-date-picker v-model="year" align="right" type="year" size="small" placeholder="选择年">
                                    </el-date-picker>
                                </div>
                            </div>
                            <div v-show="!ech1noData" v-loading="ech1Loading" ref="echarts1" class="trend-charts"></div>
                            <div v-show="ech1noData" class="trend-nodata">暂无数据</div>
                        </div>
                    
                    
                        <div class="trend-right">
                            <!-- <div :style="{display: 'inline-block', position: 'relative'}">
                      <my-select-station v-model="chartTwoStation"  size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                      <i @click="clearChartTwo" v-if="chartTwoStation" :style="{position: 'absolute',right: '2px', top: '8px',fontSize: '16px'}" class="el-icon-circle-close"></i>
                    </div> -->
                            <!-- <div class="inline-block" >
                      <el-date-picker v-model="month" type="month" size="small" placeholder="选择月"></el-date-picker>
                    </div> -->
                            <div class="heightX60">
                            </div>
                            <div v-show="!ech2noData" v-loading="ech2Loading" ref="echarts2" class="trend-charts" ></div>
                            <div v-show="ech2noData" class="trend-nodata">暂无数据</div>
                        </div>
                        <div class="trend-elimiter"></div>
                <div class="trend-table">
                    <el-table :data="lists" class="widthP100">
                        <el-table-column prop="name" label="月份"></el-table-column>
                        <el-table-column prop="num" label="月卡数"></el-table-column>
                        <el-table-column prop="income" label="收入"></el-table-column>
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
var myChart1 = null;
var myChart2 = null;
export default {
    data: function() {
        return {
            chartOneStation: '11',
            year: new Date(),
            lists: [],
            ech1Loading: true,
            ech2Loading: true,
            ech1noData: false,
            ech2noData: false,
        };
    },
    watch: {
        chartOneStation: function() {
            this.chart1();
        },
        year: function() {
            this.chart1();
        }
    },
    methods: {
        arraySum: function(array, type) {
            var sum = 0;
            for (var i = 0; i < array.length; i++) {
                sum += Number(array[i][type]);
            }
            return sum % 1 == 0 ? sum : sum.toFixed(2);
        },
        noData: function() {
            var option = {
                color: ['#3398DB'],
                xAxis: [{
                    type: 'category',
                    data: [],
                    axisTick: {
                        alignWithLabel: true
                    }
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: '直接访问',
                    type: 'bar',
                    barWidth: '60%',
                    data: []
                }]
            };
            var myChart1 = echarts.init(this.$refs.echarts1);
            var myChart2 = echarts.init(this.$refs.echarts2);
            myChart1.clear();
            myChart2.clear();
            myChart1.setOption(option);
            myChart2.setOption(option);
            this.ech1noData = true;
            this.ech2noData = true;
            this.lists = [];
        },
        chart1: function() {
            var vm = this;
            if (!vm.chartOneStation) {
                vm.ech1noData = true;
                vm.ech2noData = true;
                return
            }
            let url = "/contractreport/contractAnalysiscopy?station_id=" + vm.chartOneStation + '&year=' + vm.year.getFullYear();
            utils.fetch(url)
                .then(function(json) {
                    if (json.code == 0) {
                        if (!json.content) {
                            vm.noData();
                            return;
                        }
                        var lists = [];
                        var x_axis_data = json.content.xAxis;
                        var series = [];
                        var legend = [];
                        var numObj = [];
                        var totalIncome = [];
                        var totalNum = [];
                        for (var key in json.content.lists) {
                            var item = json.content.lists[key];
                            legend.push(item.name);
                            series.push({
                                name: item.name,
                                type: "bar",
                                stack: "收入",
                                data: item.data['receivable'],
                            });
                            numObj[key] = item.data['num'];

                            // lists[key]['income'] = 0;
                            // lists[key]['num'] = 0;
                            for (var i = 0; i < item.data['receivable'].length; i++) {
                                //各个规则总收入总数量和
                                totalIncome[i] = totalIncome[i] || 0;
                                totalNum[i] = totalNum[i] || 0;
                                totalNum[i] += item.data['num'][i];
                                totalIncome[i] += item.data['receivable'][i];

                                //1到12月总收入总数量和
                                // lists[key]['num'] += item.data['num'][i];
                                // lists[key]['income'] += item.data['receivable'][i];
                            }
                            // console.log(totalNum);
                            // lists[key]['income'] = lists[key]['income'].toFixed(2);
                        }

                        for (var key in x_axis_data) {
                            lists.push({
                                name: x_axis_data[key],
                                income: totalIncome[key] && totalIncome[key].toFixed(2),
                                num: totalNum[key]
                            })
                        }
                        lists.push({
                            name: "统计",
                            income: vm.arraySum(lists, 'income'),
                            num: vm.arraySum(lists, 'num')
                        })
                        vm.lists = lists;
                        var option = {
                            title: {
                                text: '月卡规则收入',
                                // subtext: '纯属虚构'
                            },
                            tooltip: {
                                trigger: "axis",
                                axisPointer: { type: "cross", crossStyle: { color: "#999" } },
                                formatter: function(param, ticket) {
                                    var str = '';
                                    for (var key in param) {
                                        if (numObj[key]) {
                                            str += param[key].marker + param[key].seriesName + "：" + param[key].data + '(' + numObj[key][param[key].dataIndex] + '张)<br/>';
                                        }
                                    }
                                    return str;
                                }
                            },
                            legend: { data: legend, bottom: 0, },
                            grid: { bottom: 120 },//月卡规则收入中各种卡的色块定位
                            xAxis: [{
                                type: "category",
                                data: x_axis_data,
                                axisPointer: { type: "shadow" }
                            }],
                            // color: [
                            //     "#893448",
                            //     "#d95850",
                            //     "#eb8146",
                            //     "#ffb248",
                            //     "#f2d643",
                            //     "#ebdba4"
                            // ],
                            yAxis: [{
                                type: "value",
                                name: "",
                                axisLabel: { formatter: "{value}" }
                            }],
                            series: series
                        };
                        if (!myChart1) {
                            myChart1 = echarts.init(vm.$refs.echarts1);
                        } else {
                            myChart1.clear();
                        }
                        myChart1.setOption(option);

                        var option2 = {
                            title: {
                                text: '月卡总收入',
                                // subtext: '纯属虚构'
                            },
                            tooltip: {
                                trigger: "axis",
                                axisPointer: { type: "cross", crossStyle: { color: "#999" } },
                                formatter: function(param, ticket) {
                                    var str = '';
                                    for (var key in param) {
                                        str += param[key].marker + param[key].seriesName + "：" + param[key].data.toFixed(2) + '(' + totalNum[param[0].dataIndex] + '张)<br/>';
                                    }
                                    return str;
                                }
                            },
                            legend: { data: legend, bottom: 0, },
                            grid: { bottom: 120 },
                            xAxis: [{
                                type: "category",
                                data: x_axis_data,
                                axisPointer: { type: "shadow" }
                            }],
                            color: [
                                "#893448",
                                "#d95850",
                                "#eb8146",
                                "#ffb248",
                                "#f2d643",
                                "#ebdba4"
                            ],
                            yAxis: [{
                                type: "value",
                                name: "",
                                axisLabel: { formatter: "{value}" }
                            }],
                            series: [{
                                name: '总收入',
                                stack: "收入",
                                type: "line",
                                data: totalIncome
                            }]
                        };
                        vm.ech1noData = false;
                        vm.ech2noData = false;
                        if (!myChart2) {
                            myChart2 = echarts.init(vm.$refs.echarts2);
                        } else {
                            myChart2.clear();
                        }
                        myChart2.setOption(option2);
                    } else {
                        myChart1.clear();
                        vm.ech1noData = true;
                        myChart2.clear();
                        vm.ech2noData = true;
                        vm.lists = [];
                    }
                });
        },
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            vm.chart1();
        });
    }
};
</script>