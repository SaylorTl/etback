<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class="condition clearfix box-width">
                <div class="left">
                    <el-date-picker v-model="search.createTime" size="small" type="daterange" start-placeholder="创建开始时间" end-placeholder="创建结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.orderType" size="small" class="cell widthX100" clearable placeholder="工单类型">
                        <el-option v-for="(v, k) in orderType" :label="v" :value="k" :key="k"></el-option>
                    </el-select>
                    <el-select v-model="search.status" size="small" class="cell widthX100" clearable placeholder="订单状态">
                        <el-option v-for="(v, k) in cfg.status" :label="v" :value="k" :key="k"></el-option>
                    </el-select>
                    <el-button @click="getData()" size="small"> <i class="fa fa-search"></i>查找 </el-button>
                    <el-button @click="btnUndo" size="small"> <i class="fa fa-undo"></i>重置 </el-button>
                </div>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" @expand-change="expandChange" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <div v-if="props.row.expanded">
                                <!-- 拥堵订单 -->
                                <el-row v-if="orderType[props.row.expandInfo.basic.category] === '拥堵订单'">
                                    <el-col :span="22">
                                        <el-form label-position="left" inline class="demo-table-expand">
                                            <el-form-item label="工单类型:">
                                                <span>{{ orderType[props.row.expandInfo.basic.category] }}</span>
                                            </el-form-item>
                                            <el-form-item label="拥堵位置:">
                                                <span>{{ props.row.expandInfo.basic.device_name }}</span>
                                            </el-form-item>
                                            <el-form-item label="设备名称:">
                                                <span>{{ props.row.expandInfo.basic.device_name }}</span>
                                            </el-form-item>
                                            <el-form-item label="编号/道闸ID:">
                                                <span>{{ props.row.expandInfo.basic.device_id }}</span>
                                            </el-form-item>

                                            <el-form-item label="进场状态:">
                                                <span>{{ props.row.expandInfo.extends.arrival_id && props.row.expandInfo.extends.arrival_id > 0 ? "已进场" : "未进场" }}</span>
                                            </el-form-item>
                                            <el-form-item label="进场时间:">
                                                <span>{{ props.row.expandInfo.extends.arrival_at }}</span>
                                            </el-form-item>
                                            <el-form-item label="出场状态:">
                                                <span>{{ props.row.expandInfo.extends.departure_status }}</span>
                                            </el-form-item>
                                            <el-form-item label="出场时间:">
                                                <span>{{ props.row.expandInfo.extends.departure_at }}</span>
                                            </el-form-item>
                                        </el-form>

                                        <el-form label-position="left" inline class="demo-table-expand">
                                            <template v-for="(item, index) in props.row.expandInfo.extends.station_contract">
                                                <el-form-item label="停车场负责人:" :key="'1-' + index">
                                                    <span>{{ item.name }}</span>
                                                </el-form-item>
                                                <el-form-item label="负责人电话:" :key="'2-' + index">
                                                    <span>{{ item.mobile }}</span>
                                                </el-form-item>
                                            </template>
                                        </el-form>

                                        <el-form label-position="left" inline class="demo-table-expand demo-table-expand-handle">
                                            <template v-for="(item, index) in props.row.expandInfo.extends.process_remark">
                                                <el-form-item label="处理人信息:" :key="'a-' + index">
                                                    <span>{{ item.name }}</span>
                                                </el-form-item>
                                                <el-form-item label="处理时间:" :key="'b-' + index">
                                                    <span>{{ item.time }}</span>
                                                </el-form-item>
                                                <el-form-item label="处理方式:" :key="'c-' + index">
                                                    <span>{{ item.mode }}</span>
                                                </el-form-item>
                                            </template>
                                        </el-form>
                                    </el-col>
                                    <el-col :span="2">
                                        <template v-for="(item, index) in props.row.expandImg">
                                            <div v-loading="item.loading" style="height:110px;min-width:80px;line-height:110px" :key="index + 'img'">
                                                <el-image v-if="item.show && item.url" style="height:110px" fit="cover" :src="item.url" @click="previewImg(item.lists)"></el-image>
                                                <div class="expand-imgbox" v-if="item.show && !item.url">
                                                    <p>暂无图片</p>
                                                </div>
                                                <div class="expand-imgbox" v-if="!item.loading && !item.show">
                                                    <p>网络超时</p>
                                                </div>
                                            </div>
                                        </template>
                                    </el-col>
                                </el-row>
                                <!-- 违停订单 -->
                                <el-row v-if="orderType[props.row.expandInfo.basic.category] === '违停订单'">
                                    <el-col :span="20">
                                        <el-form label-position="left" inline class="demo-table-expand">
                                            <el-form-item label="工单类型:">
                                                <span>{{ orderType[props.row.expandInfo.basic.category] }}</span>
                                            </el-form-item>
                                            <el-form-item label="违停位置:">
                                                <span>{{ props.row.expandInfo.extends.mixed_name }}</span>
                                            </el-form-item>
                                            <el-form-item label="违停时间:">
                                                <span>{{ props.row.create_time }}</span>
                                            </el-form-item>
                                            <el-form-item>
                                                <span></span>
                                            </el-form-item>

                                            <template v-for="(item, index) in props.row.expandInfo.extends.car_owner">
                                                <el-form-item label="车主姓名:" :key="'car1-' + index">
                                                    <span>{{ item.name }}</span>
                                                </el-form-item>
                                                <el-form-item label="车主联系方式:" :key="'car2-' + index">
                                                    <span>{{ item.mobile }}</span>
                                                </el-form-item>
                                            </template>
                                        </el-form>

                                        <el-form label-position="left" inline class="demo-table-expand">
                                            <template v-for="(item, index) in props.row.expandInfo.extends.station_contract">
                                                <el-form-item label="停车场负责人:" :key="'1-' + index">
                                                    <span>{{ item.name }}</span>
                                                </el-form-item>
                                                <el-form-item label="负责人电话:" :key="'2-' + index">
                                                    <span>{{ item.mobile }}</span>
                                                </el-form-item>
                                            </template>
                                        </el-form>

                                        <el-form label-position="left" inline class="demo-table-expand demo-table-expand-handle">
                                            <template v-for="(item, index) in props.row.expandInfo.extends.process_remark">
                                                <el-form-item label="处理人信息:" :key="'a-' + index">
                                                    <span>{{ item.name }}</span>
                                                </el-form-item>
                                                <el-form-item label="处理时间:" :key="'b-' + index">
                                                    <span>{{ item.time }}</span>
                                                </el-form-item>
                                                <el-form-item label="处理方式:" :key="'c-' + index">
                                                    <span>{{ item.mode }}</span>
                                                </el-form-item>
                                            </template>
                                        </el-form>

                                        <div class="text-center">
                                            <el-button type="primary" @click="handleNotify(props.row)">短信通知</el-button>
                                        </div>
                                    </el-col>
                                    <el-col :span="4">
                                        <div class="flex flex-between">
                                            <template v-for="(item, index) in props.row.expandImg">
                                                <div v-loading="item.loading" style="width:48%;line-height:100px" :key="index + 'img1'">
                                                    <el-image v-if="item.show && item.url" style="min-width:80px;min-height:100px" fit="cover" :src="item.url" @click="previewImg(item.lists)"></el-image>
                                                    <div class="expand-imgbox" v-if="item.show && !item.url">
                                                        <p>暂无图片</p>
                                                    </div>
                                                    <div class="expand-imgbox" v-if="!item.loading && !item.show">
                                                        <p>网络超时</p>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                            <el-row v-else>
                                <el-col :span="24">
                                    <div class="detail-loading" v-loading="detailLoading"></div>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="工单ID" min-width="40"></el-table-column>
                    <el-table-column prop="id" label="工单类型" min-width="100">
                        <template slot-scope="scope">{{ orderType[scope.row.category] }}</template>
                    </el-table-column>
                    <el-table-column prop="station" label="停车场" min-width="110"></el-table-column>
                    <el-table-column prop="create_time" label="创建时间" min-width="90"></el-table-column>
                    <el-table-column prop="status" label="订单状态" min-width="90"></el-table-column>
                    <el-table-column prop="plate" label="车辆" min-width="80"></el-table-column>
                    <el-table-column prop="complete_time" label="完成时间" min-width="180"></el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button :disabled="handleButtonDisable(scope.row)" @click="handleCancel(scope.row)" plain size="mini" icon="el-icon-edit">取消</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator v-if="tableData.length != 0" @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
        </div>
        <el-dialog title="确认取消" :visible.sync="cancelDialog.show" width="30%">
            <span>{{ cancelDialog.msg }}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelDialog.show = false">取 消</el-button>
                <el-button type="primary" @click="cancelDialogConfirm">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="短信通知" :visible.sync="notifyDialog.show" width="33%">
            <div class="notify-dialog">
                <el-form label-position="left" inline style="width:100%">
                    <template v-if="notifyDialog.ownerMobile.length > 0">
                        <el-form-item label="车主手机号:">
                            <el-checkbox-group v-model="ownerMobileChecked">
                                <el-checkbox :label="item" v-for="(item, index) in notifyDialog.ownerMobile" :key="'owner' + index"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                        <p class="notify-message">{{ notifyDialog.ownerMsg }}</p>
                    </template>

                    <template v-if="notifyDialog.managerMobile.length > 0">
                        <el-form-item label="负责人手机号:">
                            <el-checkbox-group v-model="managerMobileChecked">
                                <el-checkbox :label="item" v-for="(item, index) in notifyDialog.managerMobile" :key="'manager' + index"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                        <p class="notify-message" style="margin-bottom:0">{{ notifyDialog.managerMsg }}</p>
                    </template>
                </el-form>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="notifyDialogConfirm">确认发送</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
import previewImg from "../../component/previewImg/index.vue";
let config = window.etback.config;
export default {
    data: function() {
        let cfg = {
            status: {
                waiting: "未完成",
                completed: "已完成",
                canceled: "取消"
            }
        };
        return {
            cfg,
            orderType: {},
            shade: false,
            detailLoading: false,
            search_more: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            search: {
                createTime: [],
                station_id: "",
                orderType: "",
                status: ""
            },
            tableData: [],
            images: { show: false, lists: [] },
            cancelDialog: { info: null, show: false, msg: "取消后,对应状态将变为已取消" },
            notifyDialog: { show: false, ownerMobile: [], ownerMsg: "", managerMobile: [], managerMsg: "" },
            ownerMobileChecked: [],
            managerMobileChecked: []
        };
    },
    components: {
        "preview-img": previewImg
    },
    methods: {
        init() {
            // 获取工单类型
            let url = "et_admin.service.order.category";
            utils.fetchNew(url).then(json => {
                if (json.code === 0 && json.content) {
                    let obj = json.content.reduce((acc, cur) => {
                        acc[cur.id] = cur.name;
                        return acc;
                    }, {});
                    this.orderType = obj;
                } else {
                    this.orderType = {};
                }
            });
        },
        expandChange(row) {
            if (!row.expanded) {
                this.getCongestionOrderDetail(row);
            }
        },
        // 获取所有工单详细信息
        getCongestionOrderDetail(row) {
            let url = "et_admin.service.order.detail";
            let params = {
                category: row.category,
                id: row.id
            };
            this.detailLoading = true;
            utils.fetchNew(url, params).then(json => {
                row.expanded = !row.expanded;
                if (json.code === 0 && json.content) {
                    row.expandInfo = json.content;
                    let orderType = this.orderType[row.category];
                    orderType === "拥堵订单" && this.getCongestionOrderExpandImage(row);

                    let images = !!json.content.extends.images;
                    images && orderType === "违停订单" && this.handleViolateParkImage(row);
                } else {
                    row.expandInfo = {};
                }
                this.detailLoading = false;
            });
        },
        // 拥堵订单图片获取
        async getCongestionOrderExpandImage(row) {
            // 获取图片
            let url = "et_client.image.show";
            let params = {
                type: "out", //一期只做出场
                id: row.expandInfo.extends.departure_id
            };

            row.expandImg = [{ loading: true }];
            let overTimeout = setTimeout(() => {
                row.expandImg = [{ loading: false, show: false }];
            }, 4000);
            let json = await utils.fetchNew(url, params);
            clearTimeout(overTimeout);
            if (json.code === 0 && json.content && Array.isArray(json.content.vendor)) {
                let result = json.content.vendor;
                let url = result[0] || "";
                let lists = result.map((item, index) => {
                    return {
                        href: item,
                        title: index
                    };
                });
                row.expandImg = [{ loading: false, show: true, url, lists }];
            }
        },
        // 违停订单详情图片 单独处理
        handleViolateParkImage(row) {
            let option = {
                bucket: "yindao-1256130579",
                region: "ap-guangzhou"
            };
            row.expandImg = [];

            let { platePicUrl, vehiclePicUrl } = row.expandInfo.extends.images;
            //只有两个 不封装成函数了
            if (platePicUrl) {
                row.expandImg.push({ loading: true });
                let index = row.expandImg.length - 1;
                let overTimeout = setTimeout(() => {
                    row.expandImg[index] = { loading: false, show: false };
                }, 4000);
                utils.getCosImageURLNew(platePicUrl, option, result => {
                    console.log("result", result);
                    clearTimeout(overTimeout);
                    let url = result.url || "";
                    let lists = [{ href: url, title: "车牌信息" }];
                    row.expandImg[index] = { loading: false, show: true, url, lists };
                });
            }

            if (vehiclePicUrl) {
                row.expandImg.push({ loading: true });
                let index = row.expandImg.length - 1;
                let overTimeout = setTimeout(() => {
                    row.expandImg[index] = { loading: false, show: false };
                }, 4000);
                utils.getCosImageURLNew(vehiclePicUrl, option, result => {
                    clearTimeout(overTimeout);
                    let url = result.url || "";
                    let lists = [{ href: url, title: "车场信息" }];
                    row.expandImg[index] = { loading: false, show: true, url, lists };
                });
            }
        },
        previewImg(lists) {
            this.images = { show: true, lists };
        },
        handleButtonDisable(row) {
            return row.status === "取消" || row.status === "已完成";
        },
        handleNotify(row) {
            let { plate, station, id } = row;
            const expandExtends = row.expandInfo.extends;
            let { car_owner, station_contract } = expandExtends;
            let { owner: ownerMsg, station: managerMsg } = expandExtends.sms_contents;
            let ownerMobile = Array.isArray(car_owner) ? car_owner.map(item => item.mobile) : [];
            let managerMobile = Array.isArray(station_contract) ? station_contract.map(item => item.mobile) : [];

            this.ownerMobileChecked = ownerMobile;
            this.managerMobileChecked = managerMobile;
            if (ownerMobile.length > 0 || managerMobile.length > 0) {
                this.notifyDialog = {
                    show: true,
                    ownerMsg,
                    managerMsg,
                    ownerMobile,
                    managerMobile,
                    plate,
                    station,
                    id
                };
            } else {
                this.$message({
                    showClose: true,
                    message: "无可用手机号，无法发送信息",
                    type: "error"
                });
            }
        },
        notifyDialogConfirm() {
            let { id, plate, station } = this.notifyDialog;

            let params = {
                id,
                plate,
                station,
                car_owner: this.ownerMobileChecked,
                station_contract: this.managerMobileChecked
            };

            let url = "et_admin.service.send.msg";
            utils.fetchNew(url, params).then(json => {
                this.notifyDialog.show = false;
                if (json && json.code === 0) {
                    this.$message({
                        showClose: true,
                        message: "发送成功",
                        type: "success"
                    });
                    this.getData();
                } else {
                    this.$message({
                        showClose: true,
                        message: json.message,
                        type: "error"
                    });
                }
            });
        },

        handleCancel(row) {
            this.cancelDialog.show = true;
            this.cancelDialog.info = row;
        },
        cancelDialogConfirm() {
            let id = this.cancelDialog.info.id;
            let url = "et_admin.service.order.cancel";
            utils.fetchNew(url, { id }).then(json => {
                this.cancelDialog.show = false;
                if (json && json.code === 0) {
                    this.$message({
                        showClose: true,
                        message: "取消成功",
                        type: "success"
                    });
                    this.getData();
                } else {
                    this.$message({
                        showClose: true,
                        message: json.message,
                        type: "error"
                    });
                }
            });
        },
        imgClose() {
            this.images.show = false;
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            const { page, pagesize } = this.pagination;
            this.getData(page, pagesize);
        },
        btnUndo: function() {
            this.search = {
                createTime: [],
                station_id: "",
                orderType: "",
                status: ""
            };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        getData: function() {
            this.shade = true;
            let url = "et_admin.service.order.list";
            let { orderType, createTime, ...others } = this.search;
            let [start_time, end_time] = createTime;

            let params = {
                page: this.pagination.page,
                pagesize: this.pagination.pagesize,
                category: orderType,
                old_member_id: this.$store.state.global.login.data.user_id,
                start_time,
                end_time,
                ...others
            };
            utils.fetchNew(url, params).then(json => {
                if (json.code === 0 && json.content) {
                    let tableData = json.content.lists || [];
                    tableData.map(item => {
                        item.expanded = false;
                        item.expandInfo = {};
                        item.expandImg = [];
                        return item;
                    });
                    this.tableData = tableData;
                    this.pagination.total = parseInt(json.content.total);
                } else {
                    this.tableData = [];
                    this.pagination.total = 0;
                }
                this.shade = false;
            });
        }
    },
    created() {
        this.init();
        this.getData();
        utils.cosFileInitNew("et_client.tencent.oss", {
            bucket: "yindao-1256130579",
            region: "ap-guangzhou"
        });
    }
};
</script>

<style scoped lang="scss">
.demo-table-expand > .el-form-item {
    width: 25%;
}
.demo-table-expand-handle {
    margin-top: 10px;
    width: 100%;
}
.demo-table-expand-handle > .el-form-item {
    width: 33.3%;
}
.detail-loading {
    height: 200px;
    width: 100%;
}
.notify-dialog > .el-input {
    margin-bottom: 6px;
}
.notify-dialog {
    .notify-message {
        padding: 20px 15px;
        border: 1px solid #e4e7ed;
        margin-bottom: 30px;
    }
    .el-form-item {
        margin-left: 2px;
        margin-bottom: 0;
    }
}
.expand-imgbox {
    height: 110px;
    min-width: 80px;
    line-height: 110px;
    text-align: center;
}
</style>
