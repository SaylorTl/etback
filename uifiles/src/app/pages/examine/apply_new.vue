<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.apply_status" size="small" class="cell widthX100" placeholder="状态">
                        <el-option label="待审核" value="waiting"></el-option>
                        <el-option label="已同意" value="agree"></el-option>
                        <el-option label="已拒绝" value="refuse"></el-option>
                    </el-select>
                    <el-date-picker v-model="search.creationtime" size="small" type="date" placeholder="申请时间" value-format="yyyy-MM-dd"></el-date-picker>
                    <!-- <el-date-picker v-model="search.apply_end_time" size="small" type="datetime" placeholder="申请截止时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker> -->
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">

                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="申请时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifiedtime }}</span></el-form-item>
                                <el-form-item label="楼栋-单元:"><span>{{ props.row.build_name }}<span> {{ props.row.build_name!='' && props.row.unitname!=''?'-':''}} </span>{{props.row.unitname}}</span></el-form-item>
                                <el-form-item label="楼层-房号:"><span>{{ props.row.floor }}<span> {{ props.row.floor!='' && props.row.room_name!=''?'-':''}} </span>{{props.row.room_name}}</span></el-form-item>
                                <el-form-item label="车位编号:"><span>{{ props.row.space_name?props.row.space_name:'虚拟车位'}}</span></el-form-item>
                                <template v-if="props.row.apply_status!=='waiting'">
                                    <el-form-item v-if="props.row.approver_full_name" label="审批人:"><span>{{ props.row.approver_full_name }}</span></el-form-item>
                                    <el-form-item v-if="props.row.approver_mobile" label="审批人手机:"><span>{{ props.row.approver_mobile }}</span></el-form-item>
                                    <el-form-item label="审批时间"><span>{{ props.row.approval_time }}</span></el-form-item>
                                </template>
                                <el-form-item v-if="props.row.state==2" label="拒绝理由:"><span>{{ props.row.detail }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="45"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column>
                    <el-table-column prop="plate" label="车牌" width="90"></el-table-column>
                    <el-table-column label="状态" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.apply_status=='waiting'">待审核</span>
                            <span v-if="scope.row.apply_status=='agree'" class="green">已同意</span>
                            <span v-if="scope.row.apply_status=='refuse'" class="red">已拒绝</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="mobile" label="月卡使用人手机" min-width="110"></el-table-column>
                    <el-table-column prop="creationtime" label="申请时间" min-width="110"></el-table-column>
                    <el-table-column prop="full_name" label="月卡使用人姓名" min-width="90"></el-table-column>
                    <el-table-column label="操作" width="260">
                        <template slot-scope="scope">
                            <el-button @click="imgshow(scope.row,'xsz_img')" plain size="mini"><i class="fa fa-picture-o"></i>行驶证</el-button>
                            <el-button @click="imgshow(scope.row,'jsz_img')" plain size="mini"><i class="fa fa-picture-o"></i>驾驶证</el-button>
                            <el-button v-if="authCheck('月卡申请证件信息')" @click="driverInfoClick(scope.row)" plain size="mini"><i class="fa address-card-o"></i>证件信息</el-button>
                            <el-button v-if="authCheck('同意月卡申请') && scope.row.apply_status=='waiting'" @click="agreeClick(scope.$index,scope.row)" plain type="success" size="mini"><i class="fa fa-check"></i>同意</el-button>
                            <el-button v-if="authCheck('拒绝月卡申请') && scope.row.apply_status=='waiting'" @click="refuseClick(scope.$index,scope.row)" plain type="danger" size="mini"><i class="fa fa-times"></i>拒绝</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="月卡同意" :visible.sync="agreeWnd.show" width='40%' custom-class="minwidth500">
                <el-form :model="agreeWnd.info" label-width="130px">
                    <el-form-item label="月卡规则:">
                        <el-select v-model="agreeWnd.info.rule_id" size="small" class="cell widthX220" placeholder="月卡规则" filterable>
                            <el-option v-for="item in agreeWnd.info.rules" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{item.name}}</span>
                                <span class="ruleN1">¥:{{item.N1}}</span>
                            </el-option>
                        </el-select>
                        <span v-if="isOA===1" class="success">&nbsp;&nbsp;&nbsp;&nbsp;该用户为员工。</span>
                        <span v-if="isOA===2" class="danger">&nbsp;&nbsp;&nbsp;&nbsp;该用户不是员工！</span>
                    </el-form-item>
                    <el-form-item label="开始时间:">
                        <el-date-picker v-model="agreeWnd.info.begin_time" size="small" class="cell widthX200" type="date" placeholder="开始日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="agreeOne" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="remoteInfo.title" width='80%' :visible.sync="remoteInfo.show">
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        <span>{{remoteInfo.info.result}}</span>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="driverInfo.title" width='80%' :visible.sync="driverInfo.show">
                <div class="driver_info_box">
                    <div class="driver_info_show">
                        <h3>行驶证信息</h3>
                        <el-table :data="driverInfo.img1" style="width: 90%" border>
                            <el-table-column prop="item" label="名称" width="90">
                            </el-table-column>
                            <el-table-column prop="itemstring" label="值" min-width="180">
                            </el-table-column>
                            <el-table-column label="置信度">
                                <template slot-scope="scope">
                                    <span>{{scope.row.confidence.slice(0, 4)}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div class="driver_info_show">
                        <h3>驾驶证信息</h3>
                        <el-table :data="driverInfo.img2" style="width: 90%" border>
                            <el-table-column prop="item" label="名称" width="90">
                            </el-table-column>
                            <el-table-column prop="itemstring" label="值" min-width="180">
                            </el-table-column>
                            <el-table-column label="置信度">
                                <template slot-scope="scope">
                                    <span>{{scope.row.confidence.slice(0, 4)}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-dialog>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
        </div>
    </div>

</template>


<script>
import utils from "../../../utils/utils.js";
import previewImg from "../../component/previewImg/index.vue";
export default {
    data: function() {
        return {
            isOA: 3, //1员工   2不是员工  3未知
            shade: false,
            search: { station_id: "", car_id: "", apply_status: "", type: "", dept: "" },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            images: { show: false, lists: [] },
            remoteInfo: { title: "", show: false, info: {} },
            agreeWnd: {
                show: false,
                info: {
                    rules: [],
                    id: "",
                    rule_id: "",
                    name: "",
                    phone: "",
                    begin_time: ""
                }
            },
            driverInfo: { img1: [], img2: [], title: "", show: false },
            identity: {
                owner: "业主",
                owner_family: "业主家属",
                tenant: "租客",
                staff: "员工",
                other: "其他"
            }
        };
    },
    components: {
        "preview-img": previewImg
    },
    methods: {
        accountCheck(mobile) {
            this.isOA = 3;
            if (!mobile) {
                return;
            }
            let url = "et_admin.contract.apply.accountSearch";
            let params = {
                mobile
            };
            utils.fetchNew(url, params).then(res => {
                if (res && res.content && res.content.is_staff) {
                    this.isOA = 1; //是员工
                } else {
                    this.isOA = 2;
                }
            });
        },
        driverInfoClick(row) {
            let driver1 = row.xsz_info; //对应行驶证
            let driver2 = row.jsz_info; //对应驾驶证
            this.driverInfo.img1 = this._infoProcess(driver1);
            this.driverInfo.img2 = this._infoProcess(driver2);
            this.driverInfo.show = true;
            this.driverInfo.title = "证件信息";
        },
        _infoProcess(arr) {
            if (!arr || (Array.isArray(arr) && arr.length === 0)) return [];
            let newArr = arr.map(i => {
                return {
                    item: i.item,
                    confidence: i.confidence + "",
                    itemstring: i.itemstring
                };
            });
            return newArr;
        },
        getData: function() {
            this.shade = true;
            const {queryFlag} = this.$route.params;
            if (queryFlag && queryFlag === 'fastQuery') {
                this.search = {};
            }
            let {car_id,...others} = utils.dealRouteParams(this);
            let url = "et_admin.contract.apply.lists";
            let params = {
                page: this.pagination.page,
                pagesize: this.pagination.pagesize,
                old_member_id: this.$store.state.global.login.data.user_id,
                old_car_id:car_id,
                ...others
            };
            utils
                .fetchNew(url, params)
                .then((json)  => {
                    this.clearRouteParams();
                    if (json && json.code === 0 && json.content) {
                        this.tableData = json.content.lists;
                        this.pagination.total = parseInt(json.content.total);
                    } else {
                        this.tableData = [];
                        this.pagination.total = 0;
                    }
                    this.shade = false;
                })
                .then(() => {
                    if (
                        this.search.car_id &&
                        !this.search.dept &&
                        !this.search.station_id &&
                        !this.search.apply_status &&
                        Array.isArray(this.tableData) &&
                        this.tableData.length === 0
                    ) {
                        const loading = this.$loading({
                            lock: true,
                            text: "查询旧版接口中",
                            spinner: "el-icon-loading"
                        });
                        let url = `/examine/applylists?page=${
                            this.pagination.page
                        }&pagesize=${this.pagination.pagesize}&car_id=${
                            this.search.car_id
                        }`; //仅当车牌搜索无结果时请求旧版接口
                        utils.fetch(url).then(json => {
                            loading.close();
                            if (json && json.code === 0 && json.content) {
                                const tableData = json.content.lists;
                                const total = json.content.total;
                                if (
                                    tableData &&
                                    total &&
                                    tableData.length > 0
                                ) {
                                    this.$router.push({
                                        name: "月卡申请",
                                        params: {
                                            car_id: this.search.car_id,
                                            queryFlag:'fastQuery'
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.search = {
                station_id: "",
                car_id: "",
                apply_status: "",
                type: "",
                dept: ""
            };
            this.clearRouteParams();
            this.getData();
        },
        imgshow: function(row, type) {
            let url = "et_admin.contract.apply.image",
                params = {
                    key: row[type]
                },
                title = "";
            if (type == "xsz_img") {
                title = "行驶证";
            } else if (type == "jsz_img") {
                title = "驾驶证";
            }
            utils.fetchNew(url, params).then(json => {
                if (json && json.code === 0 && json.content) {
                    this.images = {
                        show: true,
                        lists: [{ title, href: json.content }]
                    };
                }else{
                    this.$message({
                        showClose: true,
                        message: "没有图片",
                        type: "error"
                    });
                }
            });
        },
        imgClose: function() {
            this.images = { show: false, lists: [] };
        },
        agreeClick: function(index, row) {
            var vm = this,
                rulelist = [];
            vm.agreeWnd = {
                show: false,
                info: {
                    rules: [],
                    apply_id: row.apply_id,
                    rule_id: "",
                    name: "",
                    phone: "",
                    begin_time: "",
                    apply_status: row.apply_status,
                    end_time: row.end_time
                }
            };
            vm.agreeWnd.show = true;
            this.accountCheck(row.mobile);
            utils.getRulesByStationID(row.station_id).then(function(arr) {
                if (Array.isArray(arr) && arr.length > 0) {
                    rulelist = arr;
                    vm.agreeWnd.info.rules = rulelist.filter(item => {
                        return (
                            item.name.indexOf("员工") === -1 &&
                            item.status === "Y" &&
                            item.N1 > 3
                        );
                    });
                }
            });
        },
        agreeOne: function() {
            let vm = this,
                info = vm.agreeWnd.info,
                data = "",
                url = "et_admin.contract.apply.audit";
            if(vm.agreeWnd.info&&vm.agreeWnd.info.submit){
                return
            }
            if (info.rule_id == "") {
                vm.$message({
                    showClose: true,
                    message: "请选择月卡规则",
                    type: "error"
                });
                return;
            }
            if (info.begin_time == "") {
                vm.$message({
                    showClose: true,
                    message: "请选择开始时间",
                    type: "error"
                });
                return;
            }
            info.begin_time =
                typeof info.begin_time != "string"
                    ? utils.timeParse(info.begin_time, "-", false)
                    : info.begin_time;
            let params = {
                apply_id: info.apply_id,
                apply_status: "agree",
                rule_id: info.rule_id,
                begin_time: info.begin_time,
                end_time: info.begin_time
            };
            vm.agreeWnd.info.submit=true;
            utils.fetchNew(url, params).then(json => {
                 vm.agreeWnd.info.submit=false;
                if (json && json.code === 0) {
                    vm.$message({
                        showClose: true,
                        message: json.message,
                        type: "success"
                    });
                    vm.agreeWnd.show = false;
                    vm.getData();
                } else {
                    vm.$message({
                        showClose: true,
                        message: json.message,
                        type: "error"
                    });
                    return;
                }
            }).catch(()=>{
                vm.agreeWnd.info.submit=false;
            })
        },
        refuseClick: function(index, row) {
            let vm = this;
            this.$prompt("请输入拒绝理由", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
            }).then(
                function(obj) {
                    let url = "et_admin.contract.apply.audit",
                        params = {
                            apply_id: row.apply_id,
                            apply_status: "refuse",
                            detail: obj.value
                        };
                    utils.fetchNew(url, params).then(function(json) {
                        if (typeof json != "undefined" && json.code != 0) {
                            vm.$message({
                                showClose: true,
                                message: json.message,
                                type: "error"
                            });
                        } else {
                            vm.getData();
                        }
                    });
                },
                function(obj) {
                    console.log(obj);
                }
            );
        },
        authCheck:function(tag){
            return utils.authCheck(this,tag);
        },
        clearRouteParams(){
            let params = this.$route.params;
            for (let i in params) {
                params[i] = "";
            }   
        }
    },
    created() {
        utils.getTingYunScript();
        this.getData();
    },
    activated(){
        if(Object.keys(this.$route.params).length > 0){
            this.getData();
        }
    },
    deactivated() {
        
    }
};
</script>
