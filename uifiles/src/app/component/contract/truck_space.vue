<template>
    <div ref="truck_space">
        <div class="el-form-item" v-for="(info, index) in spaceLists" :key="index">
            <label class="el-form-item__label" :style="{ width: labelWidth }">{{ index === 0 ? "车位编号:" : "" }}</label>
            <div class="el-form-item__content" :style="{ marginLeft: labelWidth }">
                <div class="form-index" v-if="spaceLists.length > 1">{{ index + 1 }}</div>
                <template v-if="areaLists.length > 1 || type === 'add'">
                    <el-select v-model="info.space_area_id" :disabled="type === 'add'" placeholder="区域" no-data-text="未选择停车场" size="small" class="cell widthX100">
                        <el-option v-for="item in areaLists" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </template>

                <el-input v-model.trim="info.space_name" v-if="info.is_true === 'Y'" :maxlength="15" :disabled="!info.space_area_id" placeholder="车位编码" size="small" class="cell widthX100"></el-input>
                <el-input v-model="virtualPark" v-if="info.is_true === 'N'" :disabled="true" size="small" class="cell widthX100"></el-input>
                <template v-if="type === 'edit'">
                    <el-button :disabled="spaceLists.length == 1" size="mini" type="danger" @click="removeSpace(index)" class="inline-block">删除</el-button>
                    <template v-if="index + 1 === spaceLists.length && type !== 'add'">
                        <el-button size="mini" type="success" @click="addSpace('virtual')" class="inline-block"><i class="el-icon-circle-plus"></i>虚拟车位</el-button>
                        <el-button size="mini" type="success" @click="addSpace('real')" class="inline-block"><i class="el-icon-circle-plus"></i>固定车位</el-button>
                    </template>
                </template>
                <template v-if="type === 'info'">
                    <el-button v-if="info.is_true === 'N'" size="mini" type="success" @click="switchSpace(index)" class="inline-block">切换真实车位</el-button>
                </template>
            </div>
        </div>
        <!--  楼栋房间选择-->
        <build-room ref="buildRoom" v-if="showBuildRoom" :buildInfo="buildInfo" :station_id="station_id" :labelWidth="labelWidth" :old_contract_id="old_contract_id"></build-room>
    </div>
</template>

<script>
import utils from "../../../utils/utils.js";
import BuildRoom from "./build_room.vue";
export default {
    name: "TruckSpace",
    props: {
        type: {
            type: String,
            default: "add"
        },
        station_type: {
            type: [String, Number],
            default: ""
        },
        station_id: {
            type: [String, Number],
            default: ""
        },
        old_contract_id: {
            type: [String, Number],
            default: ""
        },
        rule_id: {
            type: [String, Number],
            default: ""
        }
    },
    components: {
        BuildRoom
    },
    computed: {
        buildOptions() {
            return this.buildLists.map(item => {
                return {
                    value: item.build_id,
                    label: `${item.build_name} - ${item.unitname} `
                };
            });
        }
    },
    data() {
        return {
            showBuildRoom: false,
            labelWidth: "",
            areaLists: [],
            virtual_space_area_id: "",
            inside_space_area_id: "",
            spaceLists: [],
            buildInfo: {},
            needDelete: [],
            originSpaceLists: [],
            virtualPark: "虚拟车位",
            inside: 0, // 外层要用的  内场数量
            areaListsObj: {} //区域的id:名字索引 为之后做自定义区域准备
        };
    },
    methods: {
        getLabelWidth() {
            //使用DOM 更新自定义行label的宽度
            const preNode = this.$refs.truck_space.previousElementSibling;
            const nextNode = this.$refs.truck_space.nextElementSibling;
            if (preNode) {
                this.labelWidth = preNode.querySelector("label").style.width;
            }

            if (nextNode && !this.labelWidth) {
                return (this.labelWidth = nextNode.querySelector("label").style.width);
            }
        },
        getAreaLists() {
            if (!this.station_id) {
                return;
            }

            utils
                .fetchNew("et_admin.contract.spacearealists", {
                    station_id: this.station_id
                })
                .then(res => {
                    if (res && res.code === 0 && res.content) {
                        const lists = Array.isArray(res.content) ? res.content : [];
                        this.areaListsObj = {};
                        this.areaLists = [];
                        lists.forEach(item => {
                            if (item.is_inside === "N") {
                                this.virtual_space_area_id = item.space_area_id; //找到虚拟车位默认区域
                            }
                            if (item.is_inside === "Y") {
                                this.inside_space_area_id = item.space_area_id;
                            }
                            this.areaListsObj[item.space_area_id] = item.space_area_name;

                            this.areaLists.push({
                                value: item.space_area_id,
                                label: item.space_area_name
                            });
                        });
                        this.initSpaceLists();
                        this.getSpaceLists();
                    } else {
                        console.log("res", res);
                    }
                });
        },
        getSpaceLists() {
            if (!this.old_contract_id) {
                return false;
            }
            utils
                .fetchNew("et_admin.contract.spaceshow", {
                    old_contract_id: this.old_contract_id
                })
                .then(res => {
                    if (res && res.code === 0 && res.content) {
                        const space_list = Array.isArray(res.content.space_list) ? res.content.space_list : [];
                        this.buildInfo = res.content.build_list || {};
                        this.showBuildRoom = true;
                        this.spaceLists = space_list
                            .sort((firstEl, secondEl) => {
                                const T1 = new Date(firstEl.creationtime).getTime(),
                                    T2 = new Date(secondEl.creationtime).getTime();
                                return T1 - T2;
                            })
                            .map(item => {
                                return {
                                    space_id: item.space_id,
                                    space_name: item.space_name,
                                    space_area_id: item.space_area_id,
                                    is_true: item.is_true
                                };
                            });
                        this.originSpaceLists = utils.deepCopy(this.spaceLists);
                    } else {
                        this.buildInfo = {};
                        this.showBuildRoom = false;
                        this.spaceLists = [];
                        this.needDelete = [];

                        if (res.code !== 10086) {
                            //code为10086 不报错
                            this.$message({
                                showClose: true,
                                message: res.message,
                                type: "error"
                            });
                        }
                    }
                });
        },
        initSpaceLists() {
            //spcae_id=0表示仅仅只是在前端添加的 同时可以用来区分 是原本已有的车位还是后面新增的
            if (this.type === "add") {
                this.spaceLists = [
                    {
                        space_area_id: this.virtual_space_area_id,
                        space_name: "虚拟车位",
                        space_id: 0,
                        is_true: "N"
                    }
                ];
            } else if (this.type === "edit") {
                this.spaceLists = [
                    {
                        space_area_id: "",
                        space_name: "",
                        space_id: 0,
                        is_true: "Y"
                    }
                ];
            }
        },
        removeSpace(index) {
            //spcae_id=0表示仅仅只是在前端添加的
            if (this.spaceLists[index].space_id !== 0) {
                this.needDelete.push(this.spaceLists[index]);
            }
            this.spaceLists.splice(index, 1);
        },
        addSpace(type) {
            if (type === "virtual") {
                this.spaceLists.push({
                    space_area_id: this.virtual_space_area_id,
                    space_name: "虚拟车位",
                    space_id: 0,
                    is_true: "N"
                });
            } else if (type === "real") {
                this.spaceLists.push({
                    space_area_id: this.virtual_space_area_id,
                    space_name: "",
                    space_id: 0,
                    is_true: "Y"
                });
            }
        },
        switchSpace(index) {
            this.spaceLists[index].is_true = "Y";
            this.spaceLists[index].space_name = "";
        },
        async doSubmit() {
            if (!this.rule_id) {
                this.$message({ showClose: true, message: "请先选择收费规则", type: "error" });
                return;
            }
            this.inside = 0;

            if (this.type == "edit" || this.type == "info") {
                let hasNoInput = false; // 车位信息 未输入判断
                let spaceAddArr = [];
                let spaceUpdateArr = [];
                let realSpaceArray = [];
                this.spaceLists.forEach(item => {
                    if (!item.space_name || !item.space_area_id) {
                        hasNoInput = true;
                    }

                    if (item.space_id === 0) {
                        spaceAddArr.push({
                            space_name: item.space_name,
                            space_area_id: item.space_area_id,
                            rule_id: this.rule_id,
                            is_true: item.is_true
                        });
                    } else {
                        spaceUpdateArr.push({
                            space_id: item.space_id,
                            space_name: item.space_name,
                            is_true: item.is_true,
                            space_area_id: item.space_area_id
                        });
                    }

                    if (item.space_area_id === this.inside_space_area_id) {
                        this.inside += 1;
                    }
                    // 筛选真实车位
                    if (item.is_true === "Y") {
                        realSpaceArray.push(item);
                    }
                });

                if (hasNoInput) {
                    //车位中有信息为空
                    this.$message({
                        showClose: true,
                        message: "请填写车位信息",
                        type: "error"
                    });
                    return false;
                }

                let repeatArray = [];
                let areaListsObj = this.areaListsObj;
                realSpaceArray.forEach(item => {
                    repeatArray.push(`${areaListsObj[item.space_area_id]}-${item.space_name}`);
                });

                let resultRepeatArray = [...new Set(repeatArray)];

                if (repeatArray.length !== resultRepeatArray.length) {
                    let sameArray = [];
                    for (let index = 0; index < repeatArray.length; index++) {
                        const item = repeatArray[index];
                        for (let begin = 1 + index; begin < repeatArray.length; begin++) {
                            let element = repeatArray[begin];
                            if (item === element) {
                                sameArray.push(item);
                                break;
                            }
                        }
                    }

                    let resultSameArray = [...new Set(sameArray)];

                    let resultSameString = resultSameArray.join(",");

                    //车位中相同
                    this.$message({
                        showClose: true,
                        message: `${resultSameString} 车位存在相同项`,
                        type: "error"
                    });
                    return false;
                }

                // 未编辑的 不需要提交
                let resultSpaceUpdateArr = spaceUpdateArr.filter(element => {
                    for (let index = 0; index < this.originSpaceLists.length; index++) {
                        let item = this.originSpaceLists[index];
                        if (item.space_id === element.space_id) {
                            if (item.space_name === element.space_name && item.is_true === element.is_true && item.space_area_id === element.space_area_id) {
                                return false;
                            } else {
                                element.old_space_name = item.space_name;
                                element.old_space_area_id = item.space_area_id;
                                return true;
                            }
                        }
                    }
                });
                let params = {};

                if (this.old_contract_id) {
                    params.old_contract_id = this.old_contract_id;
                }
                if (spaceAddArr.length > 0) {
                    params.spaceAddArr = spaceAddArr;
                }
                if (resultSpaceUpdateArr.length > 0) {
                    params.spaceUpdateArr = resultSpaceUpdateArr;
                }
                if (this.needDelete.length > 0) {
                    let result = this.needDelete.map(item => {
                        return {
                            space_id: item.space_id,
                            space_name: item.space_name,
                            space_area_id: item.space_area_id
                        };
                    });
                    params.spaceDelArr = result;
                }
                if (this.showBuildRoom) {
                    let { build_id, room_id, build_name, room_name, unitname, floor } = this.$refs.buildRoom;

                    let { build_id: bid, room_id: rid, build_name: old_build_name = "", room_name: old_room_name = "", unitname: old_unitname = "", floor: old_floor = "" } = this.buildInfo;
                    if (build_id && room_id) {
                        if (build_id !== bid || room_id !== rid) {
                            let build_unit = unitname == "-1" ? build_name : build_name + "-" + unitname; //用于日志展示 拼接楼栋-单元
                            let floor_room = unitname == "-1" ? room_name : floor + "-" + room_name;
                            let old_build_unit = old_unitname == "-1" ? old_build_name : old_build_name + "-" + old_unitname;
                            let old_floor_room = old_unitname == "-1" ? old_room_name : old_floor + "-" + old_room_name;
                            params.buildArr = { build_id, room_id, build_name: build_unit, room_name: floor_room, old_build_name: old_build_unit, old_room_name: old_floor_room };
                        }
                    }
                }
                params.old_user_id = this.$store.state.global.login.data.user_id || "";
                let res = await utils.fetchNew("et_admin.contract.spaceEdit", params);
                if (res && (res.code === 0 || res.code === 10086)) {
                    this.getSpaceLists(); //更新车位数据
                    return true;
                } else {
                    this.$message({
                        showClose: true,
                        message: res.message,
                        type: "error"
                    });
                    return false;
                }
            }
        }
    },
    created() {
        if (this.type == "add") {
            this.showBuildRoom = false;
            this.$watch("station_id", newVal => {
                if (newVal) {
                    this.getAreaLists();
                }
            });
        }
        this.getAreaLists();
    },
    mounted() {
        this.getLabelWidth();
    }
};
</script>
<style lang="scss">
.form-index {
    height: 32px;
    width: 32px;
    line-height: 32px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    text-align: center;
    display: inline-block;
}
</style>
