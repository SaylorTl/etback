<template>
    <div class="inline">
        <!-- 占位 -->
        <div class="el-form-item" v-show="spaceLists.length === 0">
            <label class="el-form-item__label">车位编号:</label>
            <div class="el-form-item__content" v-loading="loading">虚拟车位</div>
        </div>

        <div class="el-form-item">
            <label class="el-form-item__label">车位编号:</label>
            <div class="el-form-item__content">
                <template v-if="spaceLists.length > 0">
                    <span class="content-span">{{ spaceLists[0].space_area_name }}</span>
                    <span v-if="spaceLists[0].is_true === 'Y'">{{ spaceLists[0].space_name }}</span>
                    <span v-if="spaceLists[0].is_true === 'N'">虚拟车位</span>
                    <template v-if="spaceLists.length > 1">
                        <el-button size="mini" type="primary" plain @click="seeMore" class="inline-block" icon="el-icon-view">查看更多</el-button>
                    </template>
                </template>
            </div>
        </div>
        <el-dialog title="车位信息" :visible.sync="isMoreSpace" width="580px">
            <div class="contract-plate-search">
                <el-input placeholder="请输入车位号" v-model="search" clearable>
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
            <div class="space-content" v-show="!search">
                <div class="space-item" v-for="(item, index) in spaceLists" :key="index">
                    <div class="space-index">{{ `${index + 1}` }}</div>
                    <div class="space-info">
                        <div>区域:{{ item.space_area_name }}</div>
                        <span v-if="item.is_true === 'Y'">{{ item.space_name }}</span>
                        <span v-if="item.is_true === 'N'">虚拟车位</span>
                    </div>
                </div>
            </div>
            <div class="space-content" v-show="!!search">
                <div class="space-item" v-for="(item, index) in searchLists" :key="index">
                    <div class="space-index">{{ `${index + 1}` }}</div>
                    <div class="space-info">
                        <div>区域:{{ item.space_area_name }}</div>
                        <span v-if="item.is_true === 'Y'">{{ item.space_name }}</span>
                        <span v-if="item.is_true === 'N'">虚拟车位</span>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import utils from "../../../utils/utils.js";
export default {
    name: "SpaceInfo",
    props: {
        old_contract_id: {
            type: [String, Number],
            default: ""
        },
        expanded: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            search: "",
            isMoreSpace: false,
            loading: false,
            spaceLists: [],
            searchLists: []
        };
    },
    methods: {
        getSpaceLists() {
            this.loading = true;
            utils
                .fetchNew("et_admin.contract.spaceshow", {
                    old_contract_id: this.old_contract_id
                })
                .then(res => {
                    this.loading = false;
                    if (res && res.code === 0 && res.content) {
                        const space_list = res.content.space_list;
                        this.spaceLists = space_list
                            .sort((firstEl, secondEl) => {
                                const T1 = new Date(firstEl.creationtime).getTime(),
                                    T2 = new Date(secondEl.creationtime).getTime();
                                return T1 - T2;
                            })
                            .map(item => {
                                return {
                                    space_id: item.space_id,
                                    space_name: item.space_name.includes('虚拟车位')?'虚拟车位':item.space_name,
                                    space_area_id: item.space_area_id,
                                    space_area_name: item.space_area_name,
                                    is_true: item.is_true
                                };
                            });
                    } else {
                        this.spaceLists = [];
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
        seeMore() {
            this.isMoreSpace = true;
        },
        handleSearch(val) {
            this.searchLists = this.spaceLists.filter(item => {
                return item.space_name.toLowerCase().includes(val.toLowerCase());
            });
        }
    },
    watch: {
        expanded: {
            handler(val) {
                if (val) {
                    //展开更新数据
                    this.getSpaceLists();
                }
            },
            immediate: true
        },
        search(newVal, oldVal) {
            if (newVal === "") {
                this.searchLists = [];
            } else if (newVal === oldVal) {
                return;
            } else {
                this.handleSearch(newVal);
            }
        }
    }
};
</script>

<style scoped>
.inline {
    display: inline;
}
.content-span {
    padding-right: 20px;
}
.space-content {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    margin-left: -15px;
    margin-right: -15px;
    justify-content: left;
    max-height: 400px;
    overflow: auto;
}
.space-item {
    position: relative;
    width: 160px;
    height: 100px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    margin: 10px 15px;
}
.space-index {
    position: absolute;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    background: #2299ee;
    color: #fff;
}
.space-info {
    margin: 25px 0 0 50px;
}
</style>
