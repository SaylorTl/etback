
<template>
    <div id='box' class="menu-hide offline">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="search.day" size="small" :pickerOptions="pickerOptions" class="cell" type="date" placeholder="选择日期"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                </div>
            </div>
            <div class="map-box">
                <div id="offline-china" style="width: 600px;height:600px;"></div>
                <div id="offline-province" style="width: 600px;height:600px;"></div>
            </div>
            <el-tabs class="tab-panel tab-bottom" v-model="activeName">
                <el-tab-pane label="掉线明细" name="first">
                    <div class="" style="width: 1100px; margin: 25px auto 50px auto;">
                        <div class="">
                            <div class="station-table widthX200 left mr40">
                                <div class="station-box-offline">点击停车场显示掉线明细</div>
                                <div class="search-box">
                                    <el-input size="small" v-model="filterText" placeholder="请输入内容"></el-input>
                                </div>
                                <div class="station-box">
                                    <div v-show="stationTables.length>0" :key="index" v-for="(item,index) in stationTables" v-bind:class="{ 'active': stationActiveName==item.name }" class="station-cell" @click="stationClick(item.name)">
                                        {{(index+1)+'.'+item.name+'('+item.num+')'}}
                                    </div>
                                    <div class="text-center" v-show="!(stationTables.length>0)">没有数据</div>
                                </div>
                            </div>
                            <div class="station-box-top" v-loading="tabloading">
                                <div class="station-box-offline-detail">{{detaile_name}} 掉线明细</div>
                                <div class="box-X-box">
                                    <div v-for="(j,i) in 24" v-show="i%2==1" :key="i" class="box-X">{{(i>9?'':'0')+i+'时'}}</div>
                                </div>
                                <div :key="index" v-for="(item,index) in tableData" class="grid-box">
                                    <div class="box-Y" v-show="index%2==0">{{(index>1?'':'0')+index*5+'分'}}</div>
                                    <div class="grid" v-for="(j,i) in 24" :key="i" :class="{gridgray:item['active'+i] === 1,gridred:item['active'+i] === 2}">
                                        <div class="t">{{tableData[index][i]}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="概况" name="second">
                    <div class='table box-width clearfix'>
                        <div class="station-box-content">
                            <div class="widthP100 left">
                                <div class="station-box-intro">概况</div>
                                <el-table :data="survey_table" v-loading="survey_shade" element-loading-text="拼命加载中" border fit class="widthP100">
                                    <el-table-column prop="memo" label="掉线高峰时间段" width="180"></el-table-column>
                                    <el-table-column prop="count" label="数量" width="50"></el-table-column>
                                    <el-table-column prop="lists" label="停车场"></el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane :label="'最近'+recentValue+'天'" name="recent" v-loading="recentLoading">
                    <el-select v-model="province" clearable size="small" filterable placeholder="请选择" @change="selectProvince">
                        <el-option v-for="item in provinceOption" :key="item.name" :label="item.name" :value="item.name">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="recentValue" placeholder="请选择" @change="recent">
                        <el-option v-for="item in recentOptions" size="small" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                    <el-table :data="recentList" min-height="468" style="width: 100%">
                        <el-table-column prop="station_name" label="停车场">
                        </el-table-column>
                        <el-table-column prop="province_name" label="省份">
                        </el-table-column>
                        <el-table-column prop="city_name" label="城市">
                        </el-table-column>
                        <el-table-column prop="vendor_name" label="厂家">
                        </el-table-column>
                        <el-table-column prop="num" :label="'最近'+recentValue+'天掉线次数'">
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>

        </div>
    </div>

</template>

<script>
import echarts from "echarts";
import moment from "moment";
import utils from "../../../utils/utils.js";
var pie = null;
var map = null;
var myChart = null;
var monthChart = null;
var weekChart = null;
export default {
    data: function () {
        return {
            filterText: '',
            shade: false,
            search: { day: new Date() },
            tableData: [],
            detaile_name: "",
            detaile_show: false,
            survey_table: [],
            survey_shade: false,
            provinceOption: [],
            province: '',
            city: '',
            stationTable: [],
            activeName: 'first',
            drop_week: 0,
            drop_month: 0,
            tabloading: false,
            stationActiveName: '',
            recentList: [],
            recentOptions: [
                {
                    value: '3',
                    label: '最近3天'
                }, {
                    value: '7',
                    label: '最近7天'
                }, {
                    value: '30',
                    label: '最近30天'
                }
            ],
            recentValue: '3',
            recentLoading: false,
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > new Date();
                }
            }
        };
    },
    computed: {
        stationTables() {
            let key = this.filterText;
            let stationTable = this.stationTable;
            if (key) {
                let newarr = [];
                stationTable.forEach(el => {
                    if (el.name.indexOf(key) > -1) {
                        newarr.push(el);
                    }
                });
                return newarr;
            }
            return stationTable;
        }
    },
    destroyed: function () {
        map = null;
        pie = null;
    },
    methods: {
        selectProvince: function () {
            this.city = '';
            this.recent();
            //   this.chart();
        },
        chart: function () {
            var vm = this;
            var y_max = 10;
            var chart_name = "掉线次数";
            vm.detaile_show = false;
            var stationTable = []; //车场
            var url = "/offlinereport/computer?step=daytime";
            if (vm.search.day != "") {
                url += "&daytime=" + vm.timeParse(this.search.day, "-");
            }
            utils.fetch(url).then(function (json) {
                if (typeof json != "undefined" && json.code == 0) {
                    Array.sort.call(json.content, function (a, b) {
                        return (b.num - a.num)
                    })
                    for (var i in json.content) {
                        if (json.content[i]) {
                            // 省市过滤
                            if (json.content[i].province_name.indexOf(vm.province) != -1) {
                                if (vm.city) {
                                    if (json.content[i].city_name.indexOf(vm.city) != -1) {
                                        if (json.content[i].num > y_max) y_max = json.content[i].num;
                                        stationTable.push({ 'name': json.content[i].station_name, 'num': json.content[i].num });
                                    }
                                } else {
                                    if (json.content[i].num > y_max) y_max = json.content[i].num;
                                    stationTable.push({ name: json.content[i].station_name, 'num': json.content[i].num })
                                }
                            }
                        }
                        vm.tableData = [];
                    }
                    vm.mapChart(json.content);
                    vm.stationTable = stationTable;
                    //默认展示第一个车场
                    stationTable[0] && vm.stationClick(stationTable[0].name);
                }
            });
        },
        stationClick: function (name) {
            this.stationActiveName = name;
            this.detaile(name);
        },
        clearChart: function () {
            if (monthChart) {
                monthChart.clear();
            }
            if (weekChart) {
                weekChart.clear();
            }
        },
        mapChart: function (data) {
            var that = this;
            var province = [
                { name: "北京" },
                { name: "天津" },
                { name: "上海" },
                { name: "重庆" },
                { name: "河北" },
                { name: "河南" },
                { name: "云南" },
                { name: "辽宁" },
                { name: "黑龙江" },
                { name: "湖南" },
                { name: "安徽" },
                { name: "山东" },
                { name: "新疆" },
                { name: "江苏" },
                { name: "浙江" },
                { name: "江西" },
                { name: "湖北" },
                { name: "广西" },
                { name: "甘肃" },
                { name: "山西" },
                { name: "内蒙古" },
                { name: "陕西" },
                { name: "吉林" },
                { name: "福建" },
                { name: "贵州" },
                { name: "广东" },
                { name: "青海" },
                { name: "西藏" },
                { name: "四川" },
                { name: "宁夏" },
                { name: "海南" },
                { name: "台湾" },
                { name: "香港" },
                { name: "澳门" }
            ]
            that.provinceOption = province;
            for (var dKey in data) {
                for (var pKey in province) {
                    if (data[dKey].province_name.indexOf(province[pKey].name) != -1) {
                        province[pKey].value = (province[pKey].value || 0) + data[dKey].num;
                        break;
                    }
                }
            }
            if (!map) {
                map = echarts.init(document.getElementById("offline-china"));
                map.on("click", function (params) {
                    var city = params.name;
                    that.province = city;
                    that.city = '';
                    that.showCity(city, data);
                    that.chart();
                    that.clearChart();
                    that.recent();
                });
            }
            var option = {
                title: {
                    text: "车场掉线次数",
                    x: "center",
                    y: 10
                },
                tooltip: {
                    trigger: "item"
                },
                dataRange: {
                    min: 0,
                    max: 600,
                    x: "left",
                    y: "bottom",
                    text: ["高", "低"], // 文本，默认为数值文本
                    calculable: true,
                    color: ['#fe0002', '#46ce02']
                },
                series: [
                    {
                        name: "车场掉线次数",
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
            map.setOption(option, true);
            this.showCity(that.province, data);
        },
        showCity: function (city, data) {
            var that = this;
            var arr = [];
            for (var dKey in data) {
                if (data[dKey].province_name.indexOf(city) != -1) {
                    arr.push({ name: data[dKey].city_name, value: data[dKey].num })
                }
            }
            var showCity = function () {
                if (!pie) {
                    pie = echarts.init(document.getElementById("offline-province"));
                    pie.on("click", function (params) {
                        that.city = params.name;
                        that.clearChart();
                        that.recent();
                        setTimeout(() => {
                            that.chart();
                        })

                    });
                }
                pie.setOption({
                    title: {
                        text: city,
                        x: "center",
                        y: 50
                    },
                    tooltip: {
                        trigger: "item"
                    },
                    backgroundColor: "",
                    dataRange: {
                        min: 0,
                        max: 300,
                        x: "left",
                        y: "center",
                        text: ["高", "低"], // 文本，默认为数值文本
                        calculable: true,
                        color: ['#fe0002', '#46ce02']
                    },
                    series: [
                        {
                            name: "车场掉线次数",
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
                }, true);
            };

            showCity();
        },
        detaile: function (station) {
            var vm = this;
            vm.detaile_name = station;
            vm.shade = true;
            var url = "/station/show?station_name=" + station;
            utils.fetch(url).then(function (json) {
                if (typeof json != "undefined" && json.code == 0) {
                    var bid = json.content.id;
                    var day = vm.timeParse(vm.search.day, "-");
                    var url =
                        "/offlinereport/lists?station_id=" + bid + "&daytime=" + day;
                    utils.fetch(url).then(function (result) {
                        var data =
                            typeof result != "undefined" && result.code == 0
                                ? result.content.reverse()
                                : [];
                        vm.tableData = vm.buildtwelveData(data);
                        vm.shade = false;
                        vm.detaile_show = true;
                    });
                }
            });
        },
        settwelveData: function () {
            var secondTime = 12;
            var hour = 24;
            var arr = [];
            var hw, sw;

            for (var s = 0; s < secondTime; s++) {
                for (var h = 0; h < 24; h++) {
                    if (h < 10) {
                        hw = '0' + h
                    } else {
                        hw = h;
                    };
                    sw = 5 * s < 10 ? '0' + 5 * s : 5 * s;
                    var json = {};
                    json['time'] = hw + ':' + sw + ':00';
                    // json['active'+s] = 1;
                    arr.push(json);
                }
            }
            return arr;
        },
        buildtwelveData: function (data) {
            var arrModel = this.settwelveData();
            var arr = [];
            var json = {};
            var arrD = [];
            let dataTime = new Date(this.search.day);
            let nowTime = new Date();
            let oldData=!(utils.timeParse(dataTime,'-',false)<utils.timeParse(nowTime,'-',false));
            let h = nowTime.getHours();
            let m = nowTime.getMinutes();
            h = h > 9 ? h : '0' + h;
            m = m > 9 ? m : '0' + m;
            nowTime = h + ':' + m;
            // 遍历生成数据结构
            for (var i = 0; i < arrModel.length; i++) {
                // 遍历得到掉线数据
                for (var j = 0; j < data.length; j++) {
                    let timeindex = arrModel[i].time.substr(0, 5);
                    let time = data[j].time.substr(0, 5);
                    if (timeindex == data[j].time.substr(0, 5)) {
                        arrModel[i]['active' + i % 12] = 2;//红色
                        break;
                    } else if (timeindex > nowTime &&  oldData) {
                        arrModel[i]['active' + i % 12] = 1;//灰色
                    }
                }
            }
            for (var i = 0; i < arrModel.length; i++) {
                var index = i % 24;
                if (index == 0) {
                    if (i != 0) {
                        arrD.push(json);
                    }
                    json = { 0: arrModel[i].time, active0: arrModel[i].active0 };
                } else {
                    json[index] = arrModel[i].time;
                    json['active' + index] = arrModel[i]['active' + (i % 12)];
                }
            }
            arrD.push(json);
            return arrD;
        },
        survey: function () {
            var vm = this;
            vm.survey_shade = true;
            var url = "/offlinereport/survey";
            if (vm.search.day != "") {
                url += "?daytime=" + vm.timeParse(this.search.day, "-");
            }
            utils.fetch(url).then(function (result) {
                if (typeof result != "undefined" && result.code == 0) {
                    var lists = [];
                    var step = result.content.step;
                    var data = result.content.result;
                    for (var i in data) {
                        // var tmp = data[i]
                        //   .filter(function(k) {
                        //     if (parseInt(k.num) >= step[i].num && k.station_vendor > 0) {
                        //       return true;
                        //     }
                        //     return false;
                        //   })
                        //   .map(function(k) {
                        //     return k.station_name;
                        //   });
                        var item = data[i];
                        var tmp = [];
                        for (var key in item) {
                            tmp.push(item[key].station_name);
                        }
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
        recent: function (all) {
            var vm = this;
            var recentList = [];
            vm.recentLoading = true;
            var url = "/offlinereport/computer?step=anyday&day=" + vm.recentValue;
            if (vm.search.day != "") {
                url += "&daytime=" + vm.timeParse(this.search.day, "-");
            }
            utils.fetch(url).then(function (json) {
                vm.recentLoading = false;
                if (json.code == 0 && json.content) {
                    for (var key in json.content) {
                        var item = json.content[key];
                        if (!vm.province) {
                            recentList.push(item);
                            continue;
                        }
                        //城市筛选
                        else if (vm.city) {
                            if (item.city_name.indexOf(vm.city) != -1) {
                                recentList.push(item);
                            }
                        } else if (item.province_name.indexOf(vm.province) != -1) {
                            recentList.push(item);
                        }else{
                            continue;
                        }
                    }
                    vm.recentList = recentList.length > 0?recentList:[];
                    if(vm.city && vm.recentList.length > 0){
                        vm.province = vm.recentList[0].province_name.substring(0,2);
                    }else if(vm.recentList.length === 0 && !!vm.province){
                        return;
                    }
                } else {
                    vm.recentList = [];
                }

            });
        },
        strTime: function (str) {
            var arr = str.split(/[- : \/]/),
                date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
            return date;
        },
        timeParse: function (time, delimiter) {
            var y = time.getFullYear().toString();
            var m = time.getMonth() + 1;
            var d = time.getDate();
            m = m > 9 ? m : "0" + m;
            d = d > 9 ? d : "0" + d;
            return y + delimiter + m + delimiter + d;
        },
        btnSearch: function () {
            this.chart();
            this.survey();
            this.recent();
        },
        btnUndo: function () {
            this.search.day = "";
            this.chart();
            this.survey();
            this.recent();
        }
    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            vm.chart();
            vm.survey();
            vm.recent();
            utils.getTingYunScript();
        });
    }
};
</script>

<style>
.grid-box {
    position: relative;
    width: 840px;
    float: left;
}
.grid-box .box-Y {
    position: absolute;
    left: -34px;
    top: -6px;
}
.box-X-box {
    margin-top: 30px;
    width: 840px;
    height: 22px;
    display: flex;
    justify-content: space-around;
}
.box-X-box .box-X {
    position: relative;
    top: -6px;
}
.box-X-box .box-X::before {
    position: absolute;
    bottom: -8px;
    left: 11px;
    color: #ccc;
    content: "|";
}
.grid-box .box-Y::before {
    content: "--";
    color: #ccc;
    position: absolute;
    right: -10px;
}
.offline #offline-china,
.offline #offline-province {
    float: left;
}
.offline .map-box {
    margin: 0 auto;
    width: 1200px;
    overflow: hidden;
}
.offline .grid {
    width: 35px;
    height: 22px;
    background: #46ce02;
    color: #fff;
    float: left;
    border: 1px solid #fff;
    overflow: hidden;
    padding-top: 4px;
    padding-left: 2px;
}
.offline .grid .t {
    display: none;
}
.offline .gridred .t,
.offline .grid:hover .t {
    display: block;
}

.offline .gridred {
    background-color: #fe0002;
}
.offline .gridgray {
    background-color: #ccc;
}
.offline .station-table td {
    height: 20px;
}
.offline .station-cell {
    line-height: 30px;
    height: 30px;
    padding-left: 8px;
    border-bottom: 1px solid #eaeefb;
}
.offline .station-cell:hover,
.offline .station-cell.active {
    background: #eaeefb;
}
.offline .station-box {
    height: 350px;
    overflow: auto;
    margin-top: 20px;
    border: 1px solid #eaeefb;
}
.offline .tab-panel {
    width: 1200px;
    margin: 20px auto 50px auto;
}
.offline .tab-bottom {
    height: 600px;
}
.search-box {
    padding-top: 10px;
}
</style>
