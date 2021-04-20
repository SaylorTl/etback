<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-station @input="selectStation" v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-show="outin && outin.length>0" v-model="search.entrance_name" placeholder="出入口" size="small" class="widthX120" clearable>
                        <el-option v-for="k in outin" :key="k.id" :label="k.entrance_name" :value="k.entrance_name">{{k.entrance_name}}</el-option>
                    </el-select>
                    <el-input v-show="outin && outin.length === 0" v-model.trim="search.entrance_name" size="small" class="widthX120" placeholder="出入口" clearable></el-input>
                    <el-select v-model="search.is_main_exit" placeholder="主出入口" size="small" class="widthX120" clearable>
                        <el-option label="是" value="Y">是</el-option>
                        <el-option label="否" value="N">否</el-option>
                    </el-select>
                    <el-select v-model="search.direction" placeholder="方向" size="small" class="widthX120" clearable>
                        <el-option label="进场" value="in">进场</el-option>
                        <el-option label="出场" value="out">出场</el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button @click="entranceExport" size="small"><i class="fa fa-undo"></i>导出</el-button>
                </div>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="entrance_name" label="出入口" min-width="130"></el-table-column>
                    <el-table-column label="主出入口" min-width="130">
                        <template slot-scope="props">
                            <span>{{props.row.is_main_exit === 'Y'?"是":"否"}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="方向" min-width="130">
                        <template slot-scope="props">
                            <span>{{directionMap[props.row.direction]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="created_at" label="添加时间" min-width="130"></el-table-column>
                    <el-table-column prop="updated_at" label="修改时间" min-width="130"></el-table-column>
                    <el-table-column label="操作" width="160">
                        <template slot-scope="scope">
                            <el-button @click="manageShow(scope.row)" size="mini"><i class="el-icon-setting"></i>编辑</el-button>
                            <el-button @click="imgshow(scope.$index,scope.row)" plain size="mini"><i class="fa fa-picture-o"></i>照片</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 编辑出入口信息弹窗 -->
                <el-dialog title="编辑出入口信息" :visible.sync="manageDialog.show" width="40%">
                    <el-form ref="form" :model="manageDialog" label-width="100px">
                        <el-form-item label="停车场">
                            <el-input v-model="manageDialog.formInfo.station_name" placeholder="请输入停车场名字" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="出入口名称">
                            <el-input v-model="manageDialog.formInfo.entrance_name" placeholder="请输入出入口名称"></el-input>
                        </el-form-item>
                        <el-form-item label="方向">
                            <el-radio-group v-model="manageDialog.formInfo.direction">
                                <el-radio label="in">入口</el-radio>
                                <el-radio label="out">出口</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="主出入口">
                            <el-radio-group v-model="manageDialog.formInfo.is_main_exit">
                                <el-radio label="Y">是</el-radio>
                                <el-radio label="N">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="设备关联">
                            <div v-if="manageDialog.deviceLists && manageDialog.deviceLists.length>0">
                                <el-checkbox-group v-model="manageDialog.linkedDevices">
                                    <el-checkbox v-for="item in manageDialog.deviceLists" :label="item.id" :key="item.id" :disabled="manageDisabled(item)">{{item.name}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                            <div v-else>暂无设备</div>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <!-- <el-button @click="manageDialog.show = false">取 消</el-button> -->
                        <el-button type="primary" @click="manageDialogConfirm" :loading="manageDialog.loading">提 交</el-button>
                    </span>
                </el-dialog>
            </div>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import previewImg from '../../component/previewImg/index.vue';
import OSS from 'cos-js-sdk-v5';
export default {
    data: function() {
        return {
            directionMap: { in: "进场", out: "出场" },
            search: {
                entrance_name: "",
                direction: "",
                station_id: "",
                is_main_exit: "",
                entrance: ""
            },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            vendorData: [],
            outin: [],
            tableData: [], // 出入口列表
            shade: false,
            images: { show: false, lists: [] },
            manageDialog: {
                //出入口设备管理
                show: false,
                loading: false,
                deviceLists: [],
                linkedDevices: [],
                currentLinkedDevices: [],
                formInfo: {}
            }
        };
    },
    components: {
        "preview-img": previewImg
    },
    created() {
        utils.cosFileInit();
    },
    methods: {
        // 选择停车场
        selectStation(num) {
            console.log(num);
            // if (toString.call(num) === "[object Number]") {
            this.getEntranceLists(num);
            // }
        },
        imgshow(index, row) {
            var vm = this;
            console.log(index, row);
            let ext = row.extra;
            if (!!ext) {
                ext = JSON.parse(ext);
                ext.map(item => {
                    utils.getCosImageURL(item.key, info => {
                        this.images.lists.push({ href: info.url });
                        if (this.images.lists.length == ext.length) {
                            this.images.show = true;
                        }
                    });
                });
            }
        },
        imgClose: function() {
            this.images = { show: false, lists: [] };
        },
        // 导出
        entranceExport() {
            var vm = this;
            let url = "/station/entranceExport";
            // vm.btnLoading = true;
            let search = utils.dealRouteParams(vm);
            let { ...searchs } = search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? "?" + querystr : "";

            utils.rpc.loadfile(url).then(function(res) {
                // vm.btnLoading = false;
                if (res.code != 0) {
                    vm.$message({ message: res.message, type: "error" });
                    return;
                }
            });
        },
        // 获取停车场的entrance_name 名称   联动input组件
        getEntranceLists(station_id = "") {
            let params = `?page=1&pagesize=999&station_id=${station_id}`;
            const url = `/station/entranceLists${params}`,
                vm = this;
            utils.fetch(url).then(function(res) {
                if (typeof res != "undefined" && res.code == 0) {
                    vm.outin = res.content.lists;
                } else {
                    vm.outin = [];
                }
            });
        },
        getData: function() {
            var vm = this;
            var url =
                "/station/entranceLists?page=" +
                vm.pagination.page +
                "&pagesize=" +
                vm.pagination.pagesize;
            let search = utils.dealRouteParams(vm);
            let { ...searchs } = search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? "&" + querystr : "";
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                // vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                // vm.pagination.total = res.content.total;
                if (typeof res != "undefined" && res.code == 0) {
                    vm.tableData = res.content.lists;
                    vm.pagination.total = res.content.total;
                } else {
                    vm.tableData = [];
                    vm.pagination.total = 0;
                }
                utils.setCache(vm);
                vm.shade = false;
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
            this.search = {};
            this.outin = [];
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        // 弹出设备管理层
        manageShow: function(data) {
            this.manageDialog.formInfo = Object.assign({}, data);
            this.manageDialog.deviceLists = [];
            let linkedDevices = [];
            this.manageDialog.formInfo.devices.forEach((item, index) => {
                if (item.id) { linkedDevices.push(item.id); }
            });
            this.manageDialog.linkedDevices = linkedDevices;
            this.manageDialog.currentLinkedDevices = linkedDevices;
            this.getDeviceLists();
            this.manageDialog.show = true;
        },
        manageDisabled: function(item) {
            return item.entrance_id != 0 && !this.manageDialog.currentLinkedDevices.includes(item.id)
        },
        getDeviceLists: function() {
            let params = `station_id=${this.manageDialog.formInfo.station_id}&page=1&pagesize=9999`;
            utils.fetch("/device/listsV2?" + params).then(res => {
                if (typeof res != "undefined" && res.code == 0 && res.content.lists) {
                    this.manageDialog.deviceLists = res.content.lists;
                    console.log(this.manageDialog);
                } else {
                    this.$message({
                        showClose: true,
                        message: res.message,
                        type: "error"
                    });
                }
            });
        },
        manageDialogConfirm: function() {
            if (this.manageDialog.formInfo.entrance_name == "") {
                this.$message({
                    showClose: true,
                    message: "出入口名称不能为空",
                    type: "error"
                });
                return false;
            }

            this.manageDialog.loading = true;

            let {
                id,
                station_id,
                is_main_exit,
                direction,
                entrance_name
            } = this.manageDialog.formInfo;

            let params = {
                id,
                station_id,
                is_main_exit,
                direction,
                entrance_name,
                device_ids: this.manageDialog.linkedDevices.join(",")
            };

            console.log(params);
            utils
                .fetch("/station/entranceUpdate", { method: "POST", body: params })
                .then(res => {
                    if (typeof res != "undefined" && res.code == 0) {
                        this.manageDialog.loading = false;
                        this.manageDialog.show = false;

                        this.$message({
                            showClose: true,
                            message: "修改成功",
                            type: "success"
                        });

                        this.btnSearch();
                    } else {
                        this.manageDialog.loading = false;
                        this.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                });
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            // utils.getTingYunScript();
            // var hasParams = utils.hasRouteParams(vm.$route.params);
            // if(hasParams){vm.getData();return};
            // var data = utils.getCache();
            // var obj = data == '' ? {} : JSON.parse(data);
            // if (obj.tableData && obj.tableData.length > 0) {
            //     utils.getCacheItem(vm, obj);
            // } else {
            //     vm.getData();
            // }
            vm.getData();
        });
    }
};
</script>
