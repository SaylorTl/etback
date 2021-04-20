<template>
    <div>
        <!--  楼栋房间选择-->
        <div class="el-form-item">
            <div class="el-form-item__content" v-if="buildInfoWarning.show">
                <div :style="{ marginLeft: labelWidth }" class="buildTips">
                    <span>楼栋:{{ buildInfo.build_name }}、房间号:{{ buildInfo.room_name }},该信息需要完善</span>
                    <el-button size="mini" type="warning" @click="handleClick('repair')">补全信息</el-button>
                </div>
            </div>
            <label class="el-form-item__label" :style="{ width: labelWidth }">楼栋-单元: </label>
            <div class="el-form-item__content">
                <el-select v-model="uniqueId" filterable placeholder="请选择楼栋号" @change="buildingChanged">
                    <el-option v-for="(item, index) in buildOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                <el-button size="mini" type="success" @click="handleClick('build')"><i class="el-icon-circle-plus"></i>添加楼栋信息</el-button>
            </div>
        </div>

        <div class="el-form-item">
            <label class="el-form-item__label" :style="{ width: labelWidth }">楼层-房号:</label>
            <div class="el-form-item__content">
                <el-select v-model="room_id" filterable placeholder="请选择房号" :disabled="!uniqueId" @change="roomChanged">
                    <el-option v-for="(item, index) in roomOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                <el-button size="mini" type="success" @click="handleClick('room')" v-show="!!uniqueId"><i class="el-icon-circle-plus"></i>添加房间信息</el-button>
            </div>
        </div>

        <el-dialog width="400px" :title="dialogTitle" :visible.sync="openAddDialog" append-to-body>
            <el-form label-width="120px">
                <el-form-item label="楼栋名称:">
                    <el-input v-model.trim="info.build_name" :disabled="type === 'room' && !!uniqueId" placeholder="支持中文、数字、字母" size="small" class="cell widthX200"> </el-input>
                </el-form-item>
                <el-form-item label="单元名称:">
                    <el-input v-model.trim="info.unitname" :disabled="type === 'room' && !!uniqueId" placeholder="支持中文、数字、字母" size="small" class="cell widthX200"> </el-input>
                </el-form-item>
                <el-form-item label="楼层:">
                    <el-input v-model.trim="info.floor" placeholder="支持正数、负数、字母" size="small" class="cell widthX200"> </el-input>
                </el-form-item>
                <el-form-item label="房间号:">
                    <el-input v-model.trim="info.room_name" placeholder="支持中文、数字、字母" size="small" class="cell widthX200"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd" class="cell widthX200">提交</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import utils from "../../../utils/utils";
export default {
    name: "BuildRoom",
    props: {
        labelWidth: {
            type: [String, Number],
            default: ""
        },
        buildInfo: {
            type: Object,
            default: function() {
                return {};
            }
        },
        station_id: {
            type: [String, Number],
            default: ""
        },
        old_contract_id: {
            type: [String, Number],
            default: ""
        }
    },
    data() {
        return {
            build_name: "",
            unitname: "",
            build_id: "",
            room_id: "",
            room_name: "",
            floor: "",
            uniqueId: "",
            openAddDialog: false,
            dialogTitle: "",
            type: "", //用来判断添加楼栋还是房间
            roomLists: [],
            buildLists: [],
            info: {
                build_name: "",
                unitname: "",
                floor: "",
                room_name: ""
            },
            addBuildInfo: { build_id: "", room_id: "" },
            buildOptions: [],
            roomOptions: [],
            buildInfoWarning: { show: false, isRepairAdd: false } //旧版楼栋信息补全提示
        };
    },
    methods: {
        getBuildLists() {
            if (!this.station_id) {
                return;
            }
            this.buildLists = [];
            this.uniqueId = "";
            utils
                .fetchNew("et_admin.etstation.room.building", {
                    station_id: this.station_id
                })
                .then(res => {
                    if (res.code === 0 && res.content) {
                        let buildLists = Array.isArray(res.content.lists) ? res.content.lists : [];
                        let addBuildId = this.addBuildInfo.build_id || "";

                        let resultLists = [];
                        let options = [];

                        let choseUniqueId = "";
                        buildLists.forEach(item => {
                            if (item.unitname != "-1") {
                                // 处理select值
                                item.uniqueId = utils.unicode(`${item.build_id}-${item.unitname}`);
                                resultLists.push(item);
                                options.push({
                                    value: item.uniqueId,
                                    label: `${item.build_name} - ${item.unitname} `
                                });

                                //添加后默认选中
                                if (addBuildId != "" && item.build_id == addBuildId) {
                                    this.uniqueId = item.uniqueId;
                                    choseUniqueId = item.uniqueId;
                                }
                                if (addBuildId == "" && item.build_id === this.buildInfo.build_id && item.unitname === this.buildInfo.unitname) {
                                    // 判断是否应该选中
                                    this.uniqueId = item.uniqueId;
                                    choseUniqueId = item.uniqueId;
                                }
                            }
                        });
                        this.addBuildInfo.build_id = "";
                        this.buildLists = resultLists;
                        this.buildOptions = options;
                        this.buildingChanged(choseUniqueId);
                    } else {
                        this.buildLists = [];
                    }
                });
        },
        buildingChanged(val) {
            if (val) {
                const tempArr = this.buildLists.filter(item => item.uniqueId === val);
                if (tempArr.length > 0) {
                    let { build_id, unitname, build_name } = tempArr[0];
                    this.build_id = build_id;
                    this.unitname = unitname;
                    this.build_name = build_name;
                    this.getRoomLists();
                }
            }
        },
        getRoomLists() {
            if (!(this.build_id && this.unitname)) {
                return false;
            }
            this.room_id = "";
            utils
                .fetchNew("et_admin.etstation.room.units", {
                    building_id: this.build_id,
                    unitname: this.unitname
                })
                .then(res => {
                    if (res && res.code === 0 && res.content) {
                        let lists = Array.isArray(res.content.lists) ? res.content.lists : [];
                        let addRoomId = this.addBuildInfo.room_id || "";
                        let options = [];
                        lists.forEach(item => {
                            //新增后默认选中
                            if (addRoomId != "" && addRoomId == item.room_id) {
                                this.room_id = item.room_id;
                                this.floor = item.floor;
                                this.room_name = item.room_name;
                            }
                            if (addRoomId == "" && item.room_id === this.buildInfo.room_id) {
                                this.room_id = item.room_id;
                                this.floor = item.floor;
                                this.room_name = item.room_name;
                            }
                            options.push({
                                value: item.room_id,
                                label: `${item.floor} - ${item.room_name}`
                            });
                        });
                        this.addBuildInfo.room_id = "";
                        this.roomLists = lists;
                        this.roomOptions = options;
                    } else {
                        this.roomLists = [];
                    }
                });
        },
        roomChanged(roomId) {
            const tempArr = this.roomLists.filter(item => item.room_id === roomId);
            if (tempArr.length > 0) {
                let { room_name, floor } = tempArr[0];
                this.floor = floor || "";
                this.room_name = room_name;
            }
        },
        handleClick(type) {
            this.openAddDialog = true;
            this.type = type;
            if (type === "build") {
                this.dialogTitle = "添加楼栋";
                this.info = {
                    build_name: "",
                    unitname: "",
                    floor: "",
                    room_name: ""
                };
            }
            if (type === "room") {
                this.dialogTitle = "添加房间";

                if (this.uniqueId) {
                    this.buildLists.some(item => {
                        if (item.uniqueId === this.uniqueId) {
                            this.info.build_name = item.build_name;
                            this.info.unitname = item.unitname;
                            return true;
                        }
                    });
                }
                return false;
            }

            if (type === "repair") {
                this.type = "build";
                this.buildInfoWarning.isRepairAdd = true;
                this.dialogTitle = "补全楼栋信息";
                let { build_name, room_name } = this.buildInfo;
                this.info = {
                    build_name: build_name || "",
                    unitname: "",
                    floor: "",
                    room_name: room_name || ""
                };
            }
        },
        verifyForm() {
            let messageObj = {
                build_name: "楼栋名称",
                unitname: "单元名称",
                floor: "楼层",
                room_name: "房间号"
            };
            for (const key in this.info) {
                let currentValue = this.info[key];

                if (!currentValue) {
                    this.$message({
                        showClose: true,
                        message: "请输入" + messageObj[key],
                        type: "error"
                    });
                    return false;
                }
                if (currentValue.length > 15) {
                    this.$message({
                        showClose: true,
                        message: messageObj[key] + "最多输入15个字符",
                        type: "error"
                    });
                    return false;
                }

                if (key === "floor" && !utils.validator.isNumberLetterAndHorizontal.test(currentValue)) {
                    this.$message({
                        showClose: true,
                        message: messageObj[key] + "只能是正数、负数、字母",
                        type: "error"
                    });
                    return false;
                }

                if (key !== "floor" && !utils.validator.isCommon.test(currentValue)) {
                    this.$message({
                        showClose: true,
                        message: messageObj[key] + "只能是中文、数字、字母",
                        type: "error"
                    });
                    return false;
                }
            }
            return true;
        },
        handleAdd() {
            if (!this.verifyForm()) {
                return false;
            }
            let { build_name, unitname, floor, room_name } = this.info;

            let options = null;
            if (this.type == "build") {
                options = {
                    station_id: this.station_id,
                    build_name: build_name,
                    unitname: unitname,
                    floor: floor,
                    room_name
                };
            }
            if (this.type == "room") {
                options = {
                    station_id: this.station_id,
                    build_name: this.build_id,
                    unitname: unitname,
                    floor: floor,
                    room_name
                };
            }
            utils.fetchNew("et_admin.etstation.room.add", options).then(res => {
                if (res && res.code === 0) {
                    let { build_id, room_id } = res.content || {};
                    this.$message({
                        showClose: true,
                        message: "添加成功",
                        type: "success"
                    });
                    this.addBuildInfo = { build_id, room_id };
                    this.openAddDialog = false;
                    this.type === "build" && this.getBuildLists();
                    this.type === "room" && this.getRoomLists();
                    if (this.buildInfoWarning.isRepairAdd) {
                        this.buildInfoWarning.show = false;
                        this.buildInfoWarning.isRepairAdd = false;
                    }
                } else {
                    this.$message({
                        showClose: true,
                        message: res.message,
                        type: "error"
                    });
                }
            });
        }
    },
    created() {
        if (this.buildInfo.unitname && this.buildInfo.unitname == "-1") {
            this.buildInfoWarning.show = true;
        }
    },
    watch: {
        station_id: {
            handler: function(val, oldVal) {
                if (val) {
                    this.getBuildLists();
                }
            },
            immediate: true
        }
    }
};
</script>
<style lang="scss">
.buildTips {
    font-size: 12px;
    color: #e57471;
    line-height: 30px;
}
</style>
