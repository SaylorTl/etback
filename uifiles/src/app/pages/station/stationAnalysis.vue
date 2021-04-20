<template>
    <div class="station-analysis">
        <div class="station-analysis-searchbar">
            <my-select-station v-model="search.station_id" size="small" class="cell widthX150 mr5" placeholder="停车场"></my-select-station>
            <el-date-picker v-model="search.time" size="small" type="month" format="yyyyMM" value-format="yyyyMM" class="mr5" placeholder="时间" :clearable="false"></el-date-picker>
            <el-button @click="handleSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
            <el-button @click="handleReset" size="small"><i class="fa fa-undo"></i>重置</el-button>
            <el-button @click="showCalc" size="small" type="primary">计算器</el-button>
        </div>
        <div class="station-analysis-main">
            <div class="station-analysis-main__left">
                <field-set title="基本信息">
                    <div class="station-analysis-baseinfo">
                        <div class="station-analysis-item col-width-2">
                            <div class="station-analysis-item__label">停车场具体位置</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.address || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">停车场负责人</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.admin || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">手机号</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.admin_mobile || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">车位总数</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.space_total || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">地库车位数</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.underground_space_total || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">月卡车位数</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.month_space_total || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">临停车位数</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.temp_space_total || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">地面车位数</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.ground_space_total || '--'">
                        </div>
                        <div class="station-analysis-item col-width-1">
                            <div class="station-analysis-item__label">本地设备商</div>
                            <input class="station-analysis-item__content" type="text" readonly :value="stationInfo.local_vendor_name || '--'">
                        </div>
                    </div>
                </field-set>
                <field-set title="车辆统计TOP10">
                    <car-table :topten="topten" v-loading="toptenLoading"></car-table>
                </field-set>
                <field-set title="车场统计/月">
                    <div class="station-analysis-monthcount">
                        <div class="station-analysis-monthcount__left">
                            <div class="station-analysis-monthcount__left-permonth" v-loading="timeLoading">
                                <time-line color="green" :timeDesc="item.status" :time="item.modifytime" v-for="(item,index) in timeLines" :key="index" :isRotate="index%2 === 1" :isArrow="index === (timeLines.length - 1)"></time-line>
                                <!-- <time-line color="green" timeDesc="建设中" time="2017-11-10" ></time-line>
                                <time-line color="green" timeDesc="运营中" time="2017-12-10"></time-line>
                                <time-line color="green" timeDesc="已退场" time="2019-10-10" :isRotate="true"></time-line> -->
                            </div>
                            <count-table :tableData="tableData" v-loading="priceLoading"></count-table>
                        </div>
                        <div class="station-analysis-monthcount__right">
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">历史用户数</div>
                                <div class="station-analysis-item__content">{{historyUser || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">有效月卡总数</div>
                                <div class="station-analysis-item__content">{{analysisInfo.contract_count || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">月卡发行比</div>
                                <div class="station-analysis-item__content">{{analysisInfo.contract_lss_ratio || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">停车场利用率</div>
                                <div class="station-analysis-item__content">{{station_use_rate || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">泊位周转率</div>
                                <div class="station-analysis-item__content">{{around_rate || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">全场道口缴费率</div>
                                <div class="station-analysis-item__content">{{barrier_pay_rate || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">地面场内缴费率</div>
                                <div class="station-analysis-item__content">{{ground_pay_rate || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">地库场内缴费率</div>
                                <div class="station-analysis-item__content">{{underground_pay_rate || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">临停线上缴费率</div>
                                <div class="station-analysis-item__content">{{analysisInfo.t_online_payment_num_rate || '--'}}</div>
                            </div>
                            <div class="station-analysis-monthcount__right-item">
                                <div class="station-analysis-item__label">异常金额率</div>
                                <div class="station-analysis-item__content">{{analysisInfo.t_abnormal_amount_rate || '--'}}</div>
                            </div>
                        </div>
                    </div>
                </field-set>
            </div>
            <div class="station-analysis-main__right"></div>
        </div>
        <el-dialog title="停车场预估计算器" width="60%" :visible.sync="calcDialog" :close-on-click-modal="false">
            <calc v-if="calcDialog"></calc>
        </el-dialog>
    </div>
</template>
<script>
import {
    FieldSet,
    CarTable,
    TimeLine,
    CountTable,
    Calc
} from "./component/index";
import utils from "../../../utils/utils.js";
export default {
    name: "station_analysis",
    components: {
        FieldSet,
        CarTable,
        TimeLine,
        CountTable,
        Calc
    },
    data() {
        return {
            search: {
                station_id: "",
                time: utils.eptimes.outTime(new Date(), "yyyyMM")
            },
            stationInfo: {},
            topten: {},
            toptenLoading: false,
            tableData: [],
            calcDialog: false,
            timeLoading: false,
            timeLines: [],
            priceLoading: false,
            historyUser: "",
            analysisInfo: {
                contract_count: "",
                contract_lss_ratio: "",
                t_online_payment_num_rate: "",
                t_abnormal_amount_rate: ""
            },
            around_rate: "",
            station_use_rate: "",
            barrier_pay_rate: "",
            ground_pay_rate: "",
            underground_pay_rate: ""
        };
    },
    methods: {
        async handleSearch() {
            let { station_id, time } = this.search;
            if (!station_id) {
                this.$message({
                    message: "请选择停车场",
                    type: "error",
                    showClose: true
                });
                return;
            }
            //停车场基本信息
            const station = await this.getStationInfoByStation(station_id);
            if (station) {
                this.stationInfo = station;
            }
            const local = await this.getLocalVentorByStation(station_id);
            if (local) {
                this.stationInfo.local_vendor_name = local.local_vendor_name;
            }
            this.$forceUpdate();
            //Top10
            const topten = await this.getTopTen(station_id, time);
            if (topten) {
                this.topten = topten;
            }
            //运营时间线
            const timeline = await this.getTimeLine(station_id);
            if (timeline) {
                this.timeLines = timeline;
            }
            //停车场运营成本
            const managePrice = await this.getManagePrice(station_id);
            if (managePrice) {
                this.tableData = managePrice;
            }
            //历史用户及订单
            const his = await this.getHistoryUser(station_id);
            if (his) {
                this.historyUser = his.user_count;
            }
            //停车场数据分析
            const analysis = await this.getDataAnalysis(station_id, time);
            if (analysis) {
                this.analysisInfo = analysis;
            }
        },
        getStationInfoByStation(station_id) {
            const url = `/stationsurvey/baseinfo?station_id=${station_id}`;
            return utils.fetch(url).then(res => {
                if (res.code === 0) {
                    return res.content;
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        getLocalVentorByStation(station_id) {
            const url = `/station/lists?page=1&pagesize=20&station_id=${station_id}`;
            return utils.fetch(url).then(res => {
                if (
                    res.code === 0 &&
                    res.content &&
                    Array.isArray(res.content.lists) &&
                    res.content.lists.length > 0
                ) {
                    const result = res.content.lists;
                    return result.pop();
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        getTopTen(station_id, time) {
            this.toptenLoading = true;
            const url = `/stationsurvey/carRank?station_id=${station_id}&time=${time}`;
            return utils.fetch(url).then(res => {
                this.toptenLoading = false;
                if (res.code === 0 && res.content) {
                    return res.content;
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        /**
         * 固定顺序显示4项：ready，计划中，建设中，运营中，如果有退场显示退场，如果四项之前有缺失则时间显示为空
         */
        getTimeLine(station_id) {
            this.timeLoading = true;
            const url = `/stationsurvey/caseRecord?station_id=${station_id}`;
            return utils.fetch(url).then(res => {
                this.timeLoading = false;
                if (res.code === 0 && Array.isArray(res.content)) {
                    const result = res.content.sort(
                        (a, b) =>
                            new Date(a.modifytime).getTime() -
                            new Date(b.modifytime).getTime()
                    );
                    //筛选出所有已退场的状态，并找出时间最大的项的索引
                    //如果存在已退场并且已退场不是结果中时间最大的一个则截取从已退场到后面的部分显示
                    const allExit = result.filter(item => item.status === '已退场');
                    let maxExit = {};
                    if(allExit.length > 0){
                        maxExit = allExit.pop();
                        const index = result.findIndex(item => item.modifytime === maxExit.modifytime);
                        return (index !== result.length -1)?result.slice(index+1):result;
                    }else{
                        return result;
                    }
                    
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        getManagePrice(station_id) {
            this.priceLoading = true;
            const year = this.search.time.substring(0, 4);
            const month = this.search.time.substring(4);
            const begin = `${year}-${month}-01`;
            const end = `${year}-${month}-${this.mGetDate(year, month)}`;
            const url = `/stationcost/lists?page=1&pagesize=999&station_id=${station_id}&begin=${begin}&end=${end}`;
            return utils.fetch(url).then(res => {
                this.priceLoading = false;
                if (
                    res.code === 0 &&
                    res.content &&
                    Array.isArray(res.content.lists)
                ) {
                    return res.content.lists;
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        getHistoryUser(station_id) {
            const url = `/stationsurvey/statisticsOrder?station_id=${station_id}&status=paid`;
            return utils.fetch(url).then(res => {
                if (res.code === 0 && res.content) {
                    return res.content;
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        getDataAnalysis(station_id, time) {
            const url = `/stationsurvey/statistics?station_id=${station_id}&time=${time}`;
            return utils.fetch(url).then(res => {
                if (res.code === 0 && res.content) {
                    return res.content;
                } else {
                    this.$message({ message: res.message, type: "error" });
                    return false;
                }
            });
        },
        handleReset() {
            (this.search = {
                station_id: "",
                time: utils.eptimes.outTime(new Date(), "yyyyMM")
            }),
                (this.stationInfo = {}),
                (this.topten = {}),
                (this.toptenLoading = false),
                (this.tableData = []),
                (this.calcDialog = false),
                (this.timeLoading = false),
                (this.timeLines = []),
                (this.priceLoading = false),
                (this.historyUser = ""),
                (this.analysisInfo = {
                    contract_count: "",
                    contract_lss_ratio: "",
                    t_online_payment_num_rate: "",
                    t_abnormal_amount_rate: ""
                }),
                (this.around_rate = ""),
                (this.station_use_rate = ""),
                (this.barrier_pay_rate = ""),
                (this.ground_pay_rate = ""),
                (this.underground_pay_rate = "");
        },
        showCalc() {
            this.calcDialog = true;
        },
        mGetDate(year, month) {
            let d = new Date(year, month, 0);
            return d.getDate();
        }
    }
};
</script>
<style lang="scss" scoped>
.station-analysis {
    margin: 10px;
    &-searchbar {
        display: flex;
        padding: 20px 40px;
        border-bottom: 1px solid #ddd;
    }
    &-main {
        display: flex;
        width: 100%;
        &__left {
            width: 100%;
            .col-width-2 {
                width: 40%;
            }
            .col-width-1 {
                width: 20%;
            }
        }
        &__right {
            flex: 1;
        }
    }
    &-baseinfo {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
    }
    &-item {
        display: flex;
        height: 40px;
        line-height: 40px;
        margin-top: 5px;
        font-size: 14px;
        &__label {
            width: 120px;
            text-align: right;
            color: #666;
        }
        &__content {
            margin-left: 15px;
            color: #333;
            flex: 1;
            background: #f7f7f7;
            border-radius: 5px;
            padding-left: 10px;
            border: none;
            outline: none;
            width:100%;
        }
    }
    &-monthcount {
        display: flex;
        &__left {
            width: 1000px;
            &-permonth {
                width: 1000px;
                height: 274px;
                margin-top: 20px;
                overflow: hidden;
                overflow-x: scroll;
                white-space: nowrap;
            }
            &-table {
                margin-top: 20px;
                .el-table {
                    font-size: 12px;
                }
            }
        }
        &__right {
            width: 300px;
            &-item {
                max-width: 100%;
                display: flex;
                align-items: center;
                height: 40px;
                font-size: 14px;
                line-height: 40px;
                margin-top: 10px;
            }
        }
    }
}
</style>