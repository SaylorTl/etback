<template>
    <div class="station-overview">
        <div id='box'>
            <div class='worker'>
                <div class='condition clearfix box-width'>
                    <div class="station-overview-searchbar">
                        <el-input v-model="plate" autofocus placeholder="车牌号" @input.native="checkPlate">
                            <div :class="isSpecil?'station-overview-searchbar__yellow':'station-overview-searchbar__blue'" slot="prepend" @click="isSpecil = !isSpecil">{{isSpecil?'特':'普'}}</div>
                            <el-button slot="append" icon="el-icon-search" @click="getAllInfoByPlate"></el-button>
                        </el-input>
                        <div class="station-overview-searchbar__err" v-if="!!errmsg">{{errmsg}}</div>
                    </div>
                    <div class="station-overview-tagsbar">
                        <div class="station-overview-tagsbar__title">
                            <div>快捷标签</div>
                        </div>
                        <div class="station-overview-tagsbar__content">
                            <template v-for="(item,index) in menus">
                                <el-tag class="station-overview-tagsbar__content-tags" :key="item.path" @click="redirectPage(item)">{{item.name}}</el-tag>
                            </template>
                        </div>
                    </div>
                    <div class="station-overview-detail">
                        <div class="station-overview-detail__title">
                            <div>用户信息</div>
                        </div>
                        <div class="station-overview-detail__content" v-loading="dataLoading">
                            <ul>
                                <li v-if="contractInfo">
                                    <span>月卡车</span>
                                </li>
                                <li v-if="contractInfo">
                                    <span>{{contractInfo.station_name}}</span>
                                </li>
                                <li v-if="contractInfo && contractInfo.car_serial">
                                    <span>{{contractInfo.car_serial}}</span>
                                </li>
                                <li v-if="contractInfo">
                                    <span>{{contractInfo.phone}}</span>
                                </li>
                                <li v-if="contractInfo">
                                    <span>月卡结束时间</span>
                                    <span>{{contractInfo.time_end}}</span>
                                </li>
                                <li v-if="contractInfo && contractInfo.local_vendor_name">
                                    <span>本地供应商</span>
                                    <span>{{contractInfo.local_vendor_name}}</span>
                                </li>
                                <li v-if="contractInfo && contractInfo['xsz']">
                                    <span>行驶证</span>
                                    <span class="link" @click="showImg('xsz')">查看</span>
                                </li>
                                <li v-if="contractInfo && contractInfo['jsz']">
                                    <span>驾驶证</span>
                                    <span class="link" @click="showImg('jsz')">查看</span>
                                </li>
                                <!-- <template v-if="userInfo">
                                    <li v-for="item in userInfo" :key="item.openid">
                                        <span>{{item.kind}}</span>
                                        <span class="center">{{item.app_id}}</span>
                                        <span>{{item.openid}}</span>
                                    </li>
                                </template> -->
                                <template v-if="!contractInfo">
                                    <li v-if="tempInfo">
                                        <span>临停车</span>
                                    </li>
                                    <li v-if="tempInfo">
                                        <span>{{tempInfo.station_name}}</span>
                                    </li>
                                    <li v-if="tempInfo && tempInfo.car_serial">
                                        <span>{{tempInfo.car_serial}}</span>
                                    </li>
                                    <li v-if="tempInfo && tempInfo.creationtime">
                                        <span>进场时间</span>
                                        <span>{{tempInfo.creationtime}}</span>
                                    </li>

                                    <li v-if="tempInfo && tempInfo.local_vendor_name">
                                        <span>本地供应商</span>
                                        <span>{{tempInfo.local_vendor_name}}</span>
                                    </li>
                                    <li v-if="tempInfo && !tempInfo.station_name">
                                        <span>未入场</span>
                                    </li>
                                </template>
                                <li v-if="!contractInfo && !tempInfo">
                                    <span>未查到相关信息</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
    </div>
</template>
<script>
import utils from "../../../utils/utils";
import {
    getContractList,
    getPicByOldContract,
    getPicByNewContract,
    getImgURLByKey,
    // getOpenIDByPlate,
    getStationInfoByStation,
    isInStation
} from "./stationOverview";
import previewImg from "../../component/previewImg/index.vue";
export default {
    name: "station_overview",
    components: {
        "preview-img": previewImg
    },
    data() {
        return {
            plate: "",
            carInfo: "",
            isSpecil: false,
            tags: [
                "进场记录",
                "出场记录",
                "交易订单",
                "月卡",
                "月卡申请(新)",
                "异常开闸",
                "月卡明细台账",
                "续费订单"
            ],
            errmsg: "",
            contractInfo: "",
            tempInfo: "",
            userInfo: "",
            images: { show: false, lists: [] },
            dataLoading: false
        };
    },
    computed: {
        menus() {
            let result = [];
            this.$store.state.global.popWnd.catalog.map(item => {
                let _list = item.lists;
                let filterList = _list.filter(it => it.is_display !== "0");
                result = result.concat(filterList);
            });
            if (this.plate === "非机动车") {
                return result.filter(item => item.name === "交易订单");
            }
            return result.filter(item => this.tags.includes(item.name));
        }
    },
    watch: {},
    methods: {
        //根据车牌号获取car_id
        getCarInfoByPlate() {
            if (!this.plate) {
                this.errmsg = "请输入车牌号";
                return;
            }
            this.errmsg = "";
            let url = `/car/lists?plate=${this.plate}&page=1&pagesize=1000`;
            return utils.fetch(url).then(res => {
                if (res.code === 0 && Array.isArray(res.content)) {
                    return res.content[0];
                } else {
                    return false;
                }
            });
        },
        //车牌输入防抖
        checkPlate: utils._debounce(
            function() {
                if (!!this.plate) {
                    if (this.plate === "非机动车") {
                        this.errmsg = "";
                    } else {
                        if (
                            !this.isSpecil &&
                            !utils.isVehicleNumber(this.plate)
                        ) {
                            this.errmsg = "车牌格式错误";
                        } else if (this.isSpecil && this.plate.length > 10) {
                            this.errmsg = "车牌格式错误";
                        } else {
                            this.errmsg = "";
                        }
                    }
                }
            },
            1000,
            false
        ),
        //页面跳转
        async redirectPage(item) {
            const carInfo = await this.getCarInfoByPlate();
            if (carInfo && carInfo.id) {
                this.carInfo = carInfo;
                /**
                 * 需要将即将跳转的页面的车牌搜索参数修改为car_id
                 */
                let transParams = { car_id: carInfo.id, queryFlag: "fastQuery" };
                this.$router.push({
                    name: item.name,
                    params: transParams
                });
            } else if (!!this.plate) {
                this.$message({
                    showClose: true,
                    message: "未查到该车辆记录",
                    type: "error"
                });
            }
        },
        //根据车牌获取车辆相关信息
        async getAllInfoByPlate() {
            this.dataLoading = true;
            this.contractInfo = "";
            this.tempInfo = "";
            const carInfo = await this.getCarInfoByPlate();
            if (carInfo && carInfo.id) {
                const contractInfo = await getContractList(carInfo.id);
                if (contractInfo) {
                    const {
                        id,
                        station,
                        station_name,
                        car_serial,
                        phone,
                        time_begin,
                        time_end
                    } = contractInfo;
                    this.contractInfo = {
                        id,
                        station,
                        station_name,
                        car_serial,
                        phone,
                        time_begin,
                        time_end
                    };
                    const oldApply = await getPicByOldContract(
                        station,
                        carInfo.id
                    );
                    if (oldApply) {
                        const { img1, img2 } = oldApply;
                        this.contractInfo.xsz = !!img1 && {
                            title: "行驶证",
                            href: img1
                        };
                        this.contractInfo.jsz = !!img2 && {
                            title: "驾驶证",
                            href: img2
                        };
                    } else {
                        const newApply = await getPicByNewContract(
                            this.$store.state.global.login.data.user_id,
                            station,
                            carInfo.id
                        );
                        if (newApply) {
                            const { xsz_img, jsz_img } = newApply;
                            const xszURL = await getImgURLByKey(
                                xsz_img,
                                "xsz_img"
                            );
                            const jszURL = await getImgURLByKey(
                                jsz_img,
                                "jsz_img"
                            );
                            this.contractInfo.xsz = xszURL;
                            this.contractInfo.jsz = jszURL;
                            this.$forceUpdate();
                        }
                    }
                    const stationInfo = await getStationInfoByStation(station);
                    if (stationInfo) {
                        this.contractInfo.local_vendor_name =
                            stationInfo.local_vendor_name;
                    }
                } else {
                    const tempInfo = await isInStation(carInfo.id);
                    if (tempInfo) {
                        const {
                            car_serial,
                            station,
                            station_name,
                            creationtime
                        } = tempInfo;
                        this.tempInfo = {
                            car_serial,
                            station,
                            station_name,
                            creationtime
                        };
                        const stationInfo = await getStationInfoByStation(
                            station
                        );
                        if (stationInfo) {
                            this.tempInfo.local_vendor_name =
                                stationInfo.local_vendor_name;
                        }
                    }
                }
            }

            this.dataLoading = false;
            // const openInfo = await getOpenIDByPlate(this.plate);
            // if(openInfo){
            //     this.userInfo = openInfo;
            // }
        },
        showImg(type) {
            this.images = { show: true, lists: [this.contractInfo[type]] };
        },
        imgClose() {
            this.images.show = false;
        }
    }
};
</script>
<style lang="scss" scoped>
.station-overview {
    &-searchbar {
        width: 600px;
        margin: auto;
        &__yellow {
            cursor: pointer;
            color: #e6a23c;
            cursor: pointer;
        }
        &__blue {
            cursor: pointer;
            color: #409eff;
            cursor: pointer;
        }
        &__err {
            color: #f00;
            margin-top: 10px;
        }
    }
    &-tagsbar {
        margin-top: 20px;
        padding: 10px;
        &__title {
            border-bottom: 1px solid #ddd;
            & > div {
                line-height: 40px;
                font-size: 16px;
                font-weight: 600;
                border-bottom: 4px solid #4dbafd;
                max-width: 100px;
            }
        }
        &__content {
            &-tags {
                width: 120px;
                text-align: center;
                margin: 10px 10px 10px 0px;
                cursor: pointer;
            }
        }
    }
    &-detail {
        padding: 10px;
        &__title {
            border-bottom: 1px solid #ddd;
            & > div {
                line-height: 40px;
                font-size: 16px;
                font-weight: 600;
                border-bottom: 4px solid #4dbafd;
                max-width: 100px;
            }
        }
        &__content {
            min-height: 120px;
            ul {
                margin: 10px 0 0;
                li {
                    line-height: 30px;
                    // border-bottom: 1px solid #ddd;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 0 20px;
                    // &:nth-child(2n){
                    //     background:#f7f7f7;
                    // }
                    // &:hover{
                    //     background:rgba(210, 235, 251, 0.4);
                    // }
                    span {
                        font-size: 14px;
                        color: #999;
                        display: block;
                        &:nth-child(2) {
                            padding-left: 20px;
                            color: #666;
                        }
                        &.link {
                            text-decoration: underline;
                            cursor: pointer;
                        }
                    }
                }
            }
        }
    }
}
</style>