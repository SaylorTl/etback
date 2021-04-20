 <!-- /station.vue -->
 <template>
    <div class="station-case-log">
        <div class="tip" v-show='hasCase'><i class="fa fa-frown-o"></i>当前case记录为空</div>
        <div class="vertical-container light-timeline" v-loading="caseLogInfo.loading" v-if="contentShow">

            <div class="vertical-timeline-block" v-for='(item,index) in caseLogInfo.data' :key="index">
                <div :class="['vertical-timeline-icon', bgStyle[index%(bgStyle.length)]+'-bg']">
                    <div :class="['timeline-calendar', bgStyle[index%(bgStyle.length)]+'-bg']"><i class="fa fa-calendar"></i></div>
                    <div class="time-text">{{item.createTime}}</div>
                </div>
                <div class="vertical-timeline-content">
                    <div class="timeline-head">
                        <div class="head-wrap">
                            <ul class="head-info" v-html='headInfo(item.lists,index)'></ul>
                            <el-button plain size="mini" @click='showContent(item)'> 查看详情</el-button>
                        </div>
                        <div class='timeline-contrast' v-html="changeContent(item.lists)"></div>
                    </div>
                    <div class="timeline-table-wrap" v-html='opDetail(item.lists)' v-show='item.show'>
                    </div>
                </div>
            </div>

        </div>
        <my-paginator @change='setCaseLogPageData($event)' :pagination='dialogPagination'></my-paginator>
    </div>
</template>
 <script>
import utils from "../../utils/utils.js";
export default {
    name: "stationCaseLog",
    components: {

    },
    props: ["stationInfo", "payChannel"],
    data() {
        return {
            caseLogInfo: {
                loading: false,
                data: []
            },
            bgStyle: ["blue", "lazur", "navy", "yellow"],
            dialogPagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            hasCase: false,
        }
    },
    beforeCreate() { },
    created() {
        this.getCaseLogData();
        if (!!this.stationInfo) {
            this.contentShow = true;
        }
    },
    beforeMount() { },
    mounted() { },
    beforeUpdate() { },
    updated() { },
    beforeDestroy() { },
    destroyed() { },
    watch: {},
    directives: {},
    methods: {
        setCaseLogPageData(pageObj) {
            this.dialogPagination = pageObj;
            this.getCaseLogData();
        },
        getCaseLogData() {
            this.hasCase = false;
            this.caseLogInfo.loading = true;
            let url = `/station/operateHistory?station_id=${this.stationInfo.id}&page=${this.dialogPagination.page}&pagesize=${this.dialogPagination.pagesize}`;
            utils.fetch(url).then((res) => {
                this.caseLogInfo.data =
                    typeof res != "undefined" && res.code == 0 && res.content != ""
                        ? res.content.data.map(function (i) {
                            i.show = false;
                            return i;
                        })
                        : [];
                this.dialogPagination.total =
                    typeof res != "undefined" && res.code == 0 ? res.content.total : 0;
                this.caseLogInfo.loading = false;
                if (this.caseLogInfo.data.length == 0) {
                    this.hasCase = true;
                }
            });
        },
        headInfo: function (r, index) {
            if (!r) return "";
            let cls = this.bgStyle[index % this.bgStyle.length];
            let name = r.username === "yxkj" ? r.content.operator : r.username;
            return `<li><i class='fa fa-user-o ${cls}'></i>操作人:${name}</li>
                        <li><i class='fa fa-wrench ${cls}'></i>操作类型:${
                r.title
                }</li>
                        <li><i class='fa fa-spinner ${cls}'></i>操作结果:${
                r.result
                }</li>`;
        },
        getPayWayNames(value) {
            let oArr = this.payChannel.filter(item => (item.value & value) !== 0);
            let nameArr = oArr.map(item => item.name);
            return nameArr.join(',');
        },
        showContent(item) {
            item.show = !item.show;
        },
        changeContent(lists) {
            let result = "";
            if (!lists || !lists.change_data || this._isEmptyArray(lists.change_data)) {
                return "";
            } else {
                let type = lists.type;
                if (type == "sendMsg") {
                    console.log("当前新旧数据为推送消息");
                    return;
                } //sendMsg没有新旧数据对比
                let newData = lists.change_data.new_data;
                let oldData = lists.change_data.old_data;
                //新数据
                let newStr = this.getConcatStr(lists, newData[type], type);
                let oldStr = this.getConcatStr(lists, oldData[type], type);
                if (newStr !== "") {
                    result += `<div><span class="c_green">新数据:</span>${newStr}</div>`;
                }
                if (oldStr !== "") {
                    result += `<div><span class="c_red">旧数据:</span>${oldStr}</div>`;
                }

                return result;
            }
        },
        opDetail: function (r) {
            let str = "";
            let map = {
                blacklist: "黑名单",
                device: "设备",
                rule: "规则",
                sendMsg: "月卡推送消息",
                station: "停车场"
            };
            if (r && r.content) {
                
                let tempObj = JSON.parse(JSON.stringify(r));
                if (tempObj.content.station && tempObj.content.station.final_property) {
                    tempObj.content.station.final_property = this.dealWithProperty(tempObj.content.station.final_property);
                }
                if (tempObj.content.station && tempObj.content.station.pay_channel) {   
                    tempObj.content.station.pay_channel = this.getPayWayNames(tempObj.content.station.pay_channel);    
                }else if(tempObj.content.station && tempObj.content.station.pay_channel === 0){
                    tempObj.content.station.pay_channel = '无';
                }
                let item = tempObj.content.station;
                let tableObj_station = this._getModifydData(tempObj, "station", true);
                let tableObj_modify = this._getModifydData(tempObj, tempObj.type, true);
                let str_station = '';
                if(!!tableObj_station){
                    str_station = utils.tableTemplate(tableObj_station, 5);
                }
                
                let N = tempObj.type == "sendMsg" ? 2 : 5;
                let str_modify = '';
                if(!!tableObj_modify){
                   str_modify = utils.tableTemplate(tableObj_modify, N);
                } 
                let title1 = "<p class='mod_info'>停车场信息:</p>";
                let title2 = "<p class='mod_info'>" + map[r.type] + "信息:</p>";
                str += title1 + str_station + title2 + str_modify;
                return tempObj.type == "station" ? str_station : str;
            } else {
                return "查询不到内容";
            }
        },
        dealWithProperty(obj) {
            let str = "";
            let propertyArr = JSON.parse(obj);
            if (propertyArr.length > 0) {
                let tempArr = propertyArr.map(item => {
                    return utils.config.stationProperty.filter(item2 => {
                        return item === item2.key;
                    })
                })

                let valArr = tempArr.map(item => {
                    if(!!item[0]){
                        return item[0].value;
                    }else{
                        return '';
                    }
                    
                });
                if(!!valArr[0]){
                    str = valArr.join(',');
                }else{
                    str = '无';
                }
                
            } else {
                str = "无"
            }
            return str;
        },
        getConcatStr(lists, obj, type) {
            let concatStr = "", str = "";
            let keymap = this._revKeyVal(lists, type);
            if (obj && !this._isEmptyArray(obj)) {
                for (let i in obj) {

                    str = i == "paymethod" ? this.getPayMethodMapStr(obj[i]) : obj[i];
                    if (i === "pay_channel") {
                        if (!!str) {
                            str = this.getPayWayNames(str);
                        } else if (str === 0) {
                            str = '无'
                        } else if (str === '') {
                            str = '无'
                        }
                    }

                    if (i === "final_property") {
                        if (obj[i] && JSON.parse(obj[i])) {
                            let propertyArr = JSON.parse(obj[i]);
                            if (propertyArr.length > 0) {
                                let tempArr = propertyArr.map(item => {
                                    return utils.config.stationProperty.filter(item2 => {
                                        return item === item2.key;
                                    })
                                })

                                let valArr = tempArr.map(item => {
                                    if(!!item[0]){
                                       return  item[0].value
                                    }else{
                                        return ''
                                    }
                                });
                                if(!!valArr[0]){
                                    str = valArr.join(',');
                                }else{
                                    str = "无"
                                }
                                
                            } else {
                                str = "无"
                            }
                        } else {
                            str = "无"
                        }

                    }
                    concatStr += keymap[i] + " : " + str + ";";
                }
                return concatStr;
            } else {
                return "";
            }
        },
        _getModifydData: function (lists, type, flag) {
            //根据flag处理成两种不同的数据
            let item = lists && lists.content[type]; //默认是对象
            //当type = sendMsg时，item是对象数组
            let _setval = function () {
                let cc = {};
                for (let i in item) {
                    cc[i] = i;
                }
                item = cc;
            };
            !flag && _setval();
            switch (type) {
                case "blacklist":
                    let blacklist = {
                        车牌号: item.plate,
                        开始时间: item.begin_time,
                        结束时间: item.end_time,
                        状态: item.status,
                        创建时间: item.creationtime,
                        修改时间: item.modifiedtime
                    };
                    return blacklist;
                    break;
                case "rule":
                    let rule = {
                        规则名称: item.name,
                        类型: item.type,
                        设备: item.device_info,
                        车型: item.model,
                        N1: item.N1,
                        N2: item.N2,
                        N3: item.N3,
                        N4: item.N4,
                        N5: item.N5,
                        N6: item.N6,
                        N7: item.N7,
                        状态: item.status,
                        创建时间: item.creationtime,
                        修改时间: item.modifytime,
                        最大缴费数: item.paymax,
                        最小缴费数: item.paymin,
                        规则类型: item.payunit,
                        缴费渠道: item.paymethod
                    };
                    return rule;
                    break;
                case "device":
                    let device = {
                        设备名称: item.name,
                        厂商编码: item.extcode,
                        厂商: item.vendor_name,
                        方向: item.direction,
                        类型: item.type,
                        状态: item.status,
                        创建时间: item.creationtime,
                        修改时间: item.modifytime
                    };
                    return device;
                    break;
                case "sendMsg":
                    let sendMsg = { 手机号: item.mobile, 车牌号: item.plate };
                    let arr = [];
                    //sendMsg发过来的是一个对象数组
                    if (flag && Array.isArray(item)) {
                        item.forEach(function (i) {
                            arr.push({ 手机号: i.mobile, 车牌号: i.plate });
                        });
                        return arr;
                    }
                    return sendMsg;
                    break;
                case "station":
                    let station = {
                        停车场: item.name,
                        UUID: item.uuid,
                        省份: item.province,
                        城市: item.city_name,
                        地址: item.address,
                        公司名字: item.company_name,
                        所属事业部: item.dept_name,
                        改造年份: item.time_yy,
                        改造月份: item.time_mm,
                        改造设备套数: item.devices,
                        最大月卡数: item.members,
                        管理人员OA: item.admin_name,
                        纬度: item.longitude,
                        经度: item.latitude,
                        维修人员OA: item.maintain,
                        车位数: item.total,
                        车场设备商: item.vendor_name,
                        修改时间: item.modifytime,
                        当前状态: item.status,
                        EAS: item.EAS,
                        彩之云商户号: item.baccount,
                        是否强制锁车: item.forcedLocking,
                        是否允许线上缴费: item.visiable,
                        是否允许跨月续费: item.month_pay_kind,
                        类型: item.type,
                        停车场场地属性: item.final_property,
                        支付方式: item.pay_channel
                    };
                    return station;
                    break;
                default:
                    return '';
                    break;
            }
        },
        _revKeyVal(lists, type) {
            let newObj = {};
            let obj = this._getModifydData(lists, type, false);
            for (let i in obj) {
                newObj[obj[i]] = i;
            }
            return newObj;
        },
        _isEmptyArray(a) {
            return Array.isArray(a) && a.length == 0;
        },
        getPayMethodMapStr(str) {
            let map = {
                APP: "彩之云APP",
                iPos: "iPos",
                manual: "现金",
                TCB: "停车宝",
                CWB: "车位宝",
                EFT: "E费通"
            };
            let arr = str.split(",");
            return arr.map((item) => {
                return map[item];
            });
        },
    }
}
</script>
 
 