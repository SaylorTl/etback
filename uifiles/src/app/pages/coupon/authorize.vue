<template>
    <div id='box' class="menu-hide">
        <div class="worker coupon-authorize">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.name" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX170" placeholder="手机号"></el-input>
                    <el-button size="small" @click="getList"><i class="fa fa-search"></i>查找</el-button>
                    <el-button size="small" @click="btnUndo"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button v-if="authCheck('优惠劵授权增加')" size="small" @click="openEdit">增加授权</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="loading" element-loading-text="拼命加载中" :data="limitList" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column property="merchant_name" label="商家名称"></el-table-column>
                    <el-table-column property="mobile" label="手机号"></el-table-column>
                    <el-table-column property="permission_type" label="管理员类型"></el-table-column>
                    <el-table-column property="modifytime" label="授权时间"></el-table-column>
                    <el-table-column label="授权状态" property="newStatus"></el-table-column>
                    <el-table-column label="操作" v-if="authCheck('优惠劵授权编辑')&&authCheck('优惠劵授权删除')">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('优惠劵授权编辑')" size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button v-if="authCheck('优惠劵授权删除')" size="mini" type="danger" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="增加授权" :visible.sync="dialogTableVisible">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="商家名称">
                        <my-select-merchant @select="merchantSelect" v-model.trim="form.merchant_name" size="small" class="cell" width="100%" placeholder="商家名称"></my-select-merchant>
                    </el-form-item>
                    <el-form-item label="被授手机">
                        <el-input v-model="form.mobile"></el-input>
                    </el-form-item>
                    <el-form-item label="管理类型">
                        <el-select v-model="form.permission" placeholder="请选管理类型">
                            <el-option label="普通管理员" value="lower"></el-option>
                            <el-option label="超级管理员" value="super"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="授权">
                        <el-switch v-model="form.status">
                        </el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submit" type="primary">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog title="编辑授权" :visible.sync="editVisible">
                <el-form ref="form" :model="editForm" label-width="80px">
                    <el-form-item label="商家名称">
                        <el-input :disabled="true" v-model.trim="editForm.merchant_name" width="100%" placeholder="商家名称"></el-input>
                    </el-form-item>
                    <el-form-item label="被授手机">
                        <el-input :disabled="true" v-model="editForm.mobile"></el-input>
                    </el-form-item>
                    <el-form-item label="管理类型">
                        <el-select v-model="editForm.permission" placeholder="请选管理类型">
                            <el-option label="普通管理员" value="lower"></el-option>
                            <el-option label="超级管理员" value="super"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="授权">
                        <el-switch v-model="editForm.status">
                        </el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function () {
        return {
            loading: false,
            search: {},
            tableData_search: [],
            dialogTableVisible: false,
            editVisible: false,
            limitList: [],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            typeNameList: [],
            form: {},
            editForm: {}
        }
    },
    mounted: function () {
        this.getList();
    },
    methods: {
        openEdit: function () {
            this.dialogTableVisible = true;
            this.form = {};
        },
        getList: function () {
            var that = this;
            var param = utils.setQueryString({
                page: this.pagination.page,
                pagesize: this.pagination.pagesize,
                mobile: this.search.phone,
                merchant: this.search.name
            })
            utils.fetch('/merchantauthor/lists?' + param).then(function (data) {
                if (data && 0 == data.code) {
                    that.limitList = data.content.lists;
                    that.pagination.total = data.content.total;
                    if (that.limitList && Array.isArray(that.limitList)) {
                        for (var i = 0; i < that.limitList.length; i++) {
                            if (that.limitList[i].status == 'Y') {
                                that.limitList[i]["newStatus"] = "已授权"
                            } else {
                                that.limitList[i]["newStatus"] = "未授权"
                            }
                        }
                    }
                }
            })
        },
        handleEdit: function (index, item) {
            this.editVisible = true;
            this.editForm = item;
            this.editForm.status = item.status == "Y" ? true : false;
        },
        handleDel: function (index, item) {
            let that = this;
            let param = utils.setQueryString({
                id: item.id
            })
            this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                utils.fetch('/merchantauthor/delete', { method: 'POST', body: param }).then(function (data) {
                    if (0 === data.code) {
                        that.getList();
                        that.$notify({
                            title: '成功',
                            message: data.message,
                            type: 'success'
                        });
                        that.getList();
                    } else {
                        that.$notify({
                            title: '失败',
                            message: data.message
                        });
                    }
                })
            })

        },
        btnSearch: function () {

        },
        btnUndo: function () {
            this.search = {};
            this.pagination = { page: 1, pagesize: 20, total: 0, showTotal: true };
            this.getList();
        },
        addClick: function () {

        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getList();
        },
        merchantSelect: function (obj) {
            this.form.merchant_id = obj.value;
            this.getCouponList()
        },
        getCouponList: function () {
            var that = this;
            var param = utils.setQueryString({
                merchant_id: this.form.merchant_id,
                page: 1,
                pagesize: 100
            })
            if ("buy" === this.form.limit_type) {
                utils.fetch('/coupon/buycreate_lists?' + param).then(function (data) {
                    if (0 === data.code) {
                        var arr = [];
                        for (var key in data.content.lists) {
                            arr.push({
                                'value': data.content.lists[key].id,
                                'label': data.content.lists[key].type_name
                            })
                        }
                        that.typeNameList = arr;
                    }
                })
            } else if ("assign" === this.form.limit_type) {
                utils.fetch('/coupon/merchant_couType?' + param).then(function (data) {
                    if (0 === data.code) {
                        var arr = [];
                        for (var key in data.content) {
                            arr.push({
                                'value': data.content[key].id,
                                'label': data.content[key].coupon_type
                            })
                        }
                        that.typeNameList = arr;
                    }
                })
            }

        },
        submit: function () {
            var that = this;
            if (this.form.submit) {
                return
            }
            var param = utils.setQueryString({
                merchant: this.form.merchant_id,
                mobile: this.form.mobile,
                status: this.form.status ? 'Y' : 'N',
                permission: this.form.permission
            })
            this.form.submit = true;
            utils.fetch('/merchantauthor/add', { method: 'POST', body: param }).then(function (data) {
                that.form.submit = false;
                if (0 === data.code) {
                    that.$notify({
                        title: '成功',
                        message: data.message,
                        type: 'success'
                    });
                    that.getList();
                    that.dialogTableVisible = false;
                } else {
                    that.$notify.error({
                        title: '错误',
                        message: data.message
                    });
                }
            }).catch(() => {
                that.form.submit = false;
            })
        },
        editSubmit: function () {
            var that = this;
            if (this.editForm.submit) {
                return
            }
            var param = utils.setQueryString({
                id: this.editForm.id,
                permission: this.editForm.permission,
                status: this.editForm.status ? "Y" : "N"
            })
            this.editForm.submit = true;
            utils.fetch('/merchantauthor/update', { method: 'POST', body: param }).then(function (data) {
                that.editForm.submit = false;
                if (0 === data.code) {
                    that.$notify({
                        title: '成功',
                        message: data.message,
                        type: 'success'
                    });
                    that.getList();
                    that.editVisible = false;
                } else {
                    that.$notify.error({
                        title: '错误',
                        message: data.message
                    });
                }
            }).catch(() => {
                that.editForm.submit = false;
            })
        },
        authCheck: function (tag) {
            return utils.authCheck(this, tag);
        }
    }
}    
</script>
<style>
.coupon-authorize .el-form-item {
    margin-bottom: 15px;
}
.coupon-authorize .el-form-item .el-select {
    width: 100%;
}
.coupon-authorize .el-form-item .select-staion .val-input {
    height: 40px;
    line-height: 40px;
}
</style>

