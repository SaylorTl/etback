<template>
    <div id='box' class="menu-hide">
        <div class="worker pre-appearance-config">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-merchant v-model="search.merchant_id" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <el-select v-model="search.status" class="cell widthX150" size="small" placeholder="状态">
                        <el-option v-for="(item,index) in configStatus" :value="item.value" :label="item.label" :key="index"></el-option>
                    </el-select>
                    <el-button size="small" @click="getData"><i class="fa fa-search"></i>查找</el-button>
                    <el-button size="small" @click="reset"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button size="small" @click="addTicketRule"><i class="fa fa-plus"></i>添加</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="dataLoading" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <div v-for="(item,index) in props.row.terms" :key="index">
                                满{{item.amount}}元，领取{{item.type_name}}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="90"></el-table-column>
                    <el-table-column prop="merchant_name" label="商家" min-width="100"></el-table-column>
                    <el-table-column prop="name_keyword" label="名称关键字" min-width="100"></el-table-column>
                    <el-table-column prop="time_keyword" label="时间关键字" min-width="100"></el-table-column>
                    <el-table-column prop="money_keyword" label="金额关键字" min-width="100"></el-table-column>
                    <el-table-column prop="tnum_keyword" label="订单关键字" min-width="100"></el-table-column>
                    <el-table-column prop="other_keyword" label="其他关键字" min-width="100"></el-table-column>
                    <el-table-column prop="time_limit" label="有效期（天）" min-width="100"></el-table-column>
                    <el-table-column label="配置状态" min-width="100">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.status === 1?'success':'danger'">{{scope.row.status === 1?'开启':'关闭'}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="editTicketConfig(scope.row)" plain size="mini"><i class="fa fa-edit"></i>编辑</el-button>
                            <el-button @click="deleteTicketConfig(scope.row)" plain size="mini"><i class="fa fa-trash-o"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <el-dialog :title="ticketInfo.title" :visible.sync="ticketInfo.isShow" :close-on-click-modal="false" :close-on-press-escape="false" @close="closeDialog">
                <el-form ref="ticketForm" :model="ticketInfo.form" label-width="120px">
                    <el-form-item label="商户">
                        <my-select-merchant v-model.trim="ticketInfo.form.merchantId" size="small" class="cell widthP100" placeholder="商家名称" @select="getMerchantInfo"></my-select-merchant>
                    </el-form-item>
                    <el-form-item label="名称关键字">
                        <el-input v-model="ticketInfo.form.nameKeyword" placeholder="名称关键字"></el-input>
                    </el-form-item>
                    <el-form-item label="日期关键字">
                        <el-input v-model="ticketInfo.form.dateKeyword" placeholder="日期关键字"></el-input>
                    </el-form-item>
                     <el-form-item label="日期格式">
                        <el-select v-model="ticketInfo.form.dateStyle" placeholder="日期格式">
                            <el-option v-for="item in dateOptions" :lable="item" :value="item" :key="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="金额关键字">
                        <el-input v-model="ticketInfo.form.moneyKeyword" placeholder="金额关键字"></el-input>
                    </el-form-item>
                    <el-form-item label="订单关键字">
                        <el-input v-model="ticketInfo.form.orderKeyword" placeholder="订单关键字"></el-input>
                    </el-form-item>
                    <el-form-item label="其他关键字">
                        <div v-for="(item,index) in keywords" :key="index" class="ticket-other-keyword">
                            <el-input v-model="item.keyword" placeholder="其他关键字" class="widthX350" clearable></el-input>
                            <el-button icon="el-icon-delete" class="widthX200" @click="deleteKeyword(index)">{{index===0?'清空关键字':'删除关键字'}}</el-button>
                        </div>
                        <el-button icon="el-icon-plus" class="widthX200" @click="addKeyword">增加关键字</el-button>
                    </el-form-item>
                    <el-form-item label="领取条件">
                        <div class="ticket-other-keyword" v-for="(item,index) in conditions" :key="index">
                            满&nbsp;&nbsp;<el-input-number v-model="item.amount" :precision="0" :controls="false" :min="1" placeholder="填入整数"></el-input-number>元,领取
                            <el-select v-model="item.type" placeholder="请选择优惠券" :class="index > 0?'widthX200':'widthX300'" @focus="checkMerchant">
                                <el-option v-for="item in couponLists" :key="item.id" :label="item.coupon_type" :value="item.id"></el-option>
                            </el-select>
                            <el-button icon="el-icon-delete" class="widthX95" v-if="index > 0" @click="deleteCondition(index)"></el-button>
                        </div>
                        <el-button :disabled="isFix" icon="el-icon-plus" class="widthX200" @click="addCondition">增加领取条件</el-button>
                    </el-form-item>
                    <el-form-item label="领券时间限制">
                        <el-input-number v-model="ticketInfo.form.dateLimit" :min="1" class="widthP100" placeholder="领券时间限制（1表示当天有效，依次顺延）"></el-input-number>
                    </el-form-item>
                    <el-form-item label="是否启用">
                        <el-switch v-model="ticketInfo.form.isOpen" :active-value="1" :inactive-value="0"></el-switch>
                    </el-form-item>
                    <div class="tc">
                        <el-button type="primary" v-loading="ticketInfo.btnLoading" class="widthX300" size="normal" @click="saveTicketConfig">保存</el-button>
                    </div>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    name: 'scanTicket',
    components: {},
    props: {},
    data() {
        return {
            search: {
                station_id: '',
                merchant_id: '',
                status: ''
            },
            configStatus: [
                {
                    label: '开启',
                    value: 1
                },
                {
                    label: '关闭',
                    value: 0
                }
            ],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            ticketInfo: {
                title: '',
                isShow: false,
                btnLoading: false,
                form: {
                    merchantId: '',
                    nameKeyword: '',
                    dateKeyword: '',
                    moneyKeyword: '',
                    orderKeyword: '',
                    dateStyle:'',
                    dateLimit: 1,
                    isOpen: 1
                }
            },
            couponLists: [],
            dateOptions:['YYYY-MM-DD','YYYY-M-D','YYYY/MM/DD','YYYY/M/D','MM/DD/YYYY','M/D/YYYY','YY-MM-DD','YY/MM/DD','YYYY年MM月DD日','M D,YYYY','D M YYYY'],
            dataLoading: false,
            isFix: false,
            tableData: [],
            keywords: [{ keyword: "" }],
            conditions: [{ amount: 1, type: '' }],
            configId: ''
        }
    },
    beforeCreate() { },
    created() {
        this.initForm();
    },
    beforeMount() { },
    mounted() { },
    beforeUpdate() { },
    updated() { },
    beforeDestroy() { },
    destroyed() { },
    watch: {
        "ticketInfo.form.merchantId"(val) {
            if (!!val) {
                this.getCouponLists();
            }
        }
    },
    directives: {},
    methods: {
        initForm() {
            this.ticketInfo = {
                title: '',
                isShow: false,
                form: {
                    merchantId: '',
                    nameKeyword: '',
                    dateKeyword: '',
                    moneyKeyword: '',
                    orderKeyword: '',
                    dateStyle:'',
                    dateLimit: 1,
                    isOpen: 1
                }
            };
            this.couponLists = [];
            this.keywords = [{ keyword: "" }];
            this.conditions = [{ amount: 1, type: '' }];
            this.configId = "";
        },
        reset() {
            this.search = {
                station_id: '',
                merchant_id: '',
                status: ''
            }
            this.getData();
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        closeDialog() {
            this.initForm();
        },
        addTicketRule() {
            this.ticketInfo.title = '增加小票领券规则';
            this.ticketInfo.isShow = true;
        },
        addKeyword() {
            this.keywords.push({
                keyword: ""
            })
            console.log("afad:", this.keywords);
        },
        deleteKeyword(index) {
            if (index === 0) {
                this.keywords[0].keyword = '';
            } else {
                this.keywords.splice(index, 1);
            }
        },
        addCondition() {
            this.conditions.push({ amount: 1, type: '' })
        },
        deleteCondition(index) {
            this.conditions.splice(index, 1);
        },
        checkMerchant() {
            if (!this.ticketInfo.form.merchantId) {
                this.$message({
                    message: '请先选择商家',
                    type: 'error',
                    showClose: true
                })
            }
        },
        getMerchantInfo(obj) {
            if (obj.type === 1) {
                this.isFix = true;
            }
        },
        getCouponLists() {
            let url = `/coupon/merchant_couType?merchant_id=${this.ticketInfo.form.merchantId}`;
            utils.fetch(url).then(res => {
                if (!!res.content && res.content.length > 0) {
                    this.couponLists = res.content
                }
            })
        },
        getData() {
            let vm = this;
            let url = `/couponreceipt/lists?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
            let searchParam = { ...vm.search };
            let querystr = utils.setQueryString(searchParam);
            url += querystr ? '&' + querystr : '';
            vm.dataLoading = true;
            utils.fetch(url).then(res => {
                if (!!res.content && !!res.content.lists && res.content.lists.length > 0) {
                    vm.tableData = res.content.lists;
                    vm.pagination.total = typeof res != "undefined" && res.code == 0 ? res.content.total : 0;
                    utils.setCache(vm);
                } else {
                    vm.tableData = [];
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
                vm.dataLoading = false;
            })
        },
        saveTicketConfig() {
            let vm = this;
            let keywords = vm.keywords.filter(item => {
                return !!item.keyword
            });
            let keywordString = keywords.map(item => item.keyword).join(',');
            let couponConditions = vm.conditions.map(item => {
                if(!!item.type && !!item.amount){
                    return {
                        type:item.type,
                        amount:item.amount
                    }
                }
            })
            let param = {
                merchant_id: vm.ticketInfo.form.merchantId,
                money_keyword: vm.ticketInfo.form.moneyKeyword,
                name_keyword: vm.ticketInfo.form.nameKeyword,
                time_keyword: vm.ticketInfo.form.dateKeyword,
                time_format:vm.ticketInfo.form.dateStyle,
                tnum_keyword: vm.ticketInfo.form.orderKeyword,
                time_limit: vm.ticketInfo.form.dateLimit,
                status: vm.ticketInfo.form.isOpen,
                other_keyword: keywordString,
                terms: JSON.stringify(couponConditions)
            }
            let url = '';
            if (!!vm.configId) {
                param.id = vm.configId;
                url = '/couponreceipt/update';
            } else {
                url = '/couponreceipt/add';
            }

            if (!vm.checkForm()) {
                return false;
            } else {
                utils.fetch(url, { method: 'POST', body: utils.setQueryString(param) }).then(res => {
                    if (res.code === 0) {
                        vm.getData();
                        vm.ticketInfo.isShow = false;
                    }else{
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                    vm.ticketInfo.btnLoading = false;
                })
            }
        },
        checkForm() {
            let vm = this;
            if (!vm.ticketInfo.form.merchantId) {
                vm.$message({ showClose: true, message: '请选择商家', type: 'error' });
                return false;
            } else if (!vm.ticketInfo.form.nameKeyword) {
                vm.$message({ showClose: true, message: '请输入名称关键字', type: 'error' });
                return false;
            } else if (!vm.ticketInfo.form.dateKeyword) {
                vm.$message({ showClose: true, message: '请输入日期关键字', type: 'error' });
                return false;
            } else if (!vm.ticketInfo.form.moneyKeyword) {
                vm.$message({ showClose: true, message: '请输入金额关键字', type: 'error' });
                return false;
            } else if (!vm.ticketInfo.form.orderKeyword) {
                vm.$message({ showClose: true, message: '请输入订单关键字', type: 'error' });
                return false;
            } else if (!(/^[1-9]\d*/.test(vm.ticketInfo.form.dateLimit))) {
                vm.$message({ showClose: true, message: '请输入正确的优惠券时间限制', type: 'error' });
                return false;
            } else {
                return true;
            }
        },
        editTicketConfig(rowData) {
            let vm = this;
            if (rowData) {
                vm.configId = rowData.id;
                vm.ticketInfo = {
                    title: '修改小票领券规则',
                    isShow: true,
                    form: {
                        id:rowData.id,
                        merchantId: rowData.merchant_id,
                        nameKeyword: rowData.name_keyword,
                        dateKeyword: rowData.time_keyword,
                        dateStyle: rowData.time_format,
                        moneyKeyword: rowData.money_keyword,
                        orderKeyword: rowData.tnum_keyword,
                        dateLimit: rowData.time_limit,
                        isOpen: rowData.status
                    }
                }
                if (rowData.terms.length > 0) {
                    vm.conditions = rowData.terms;
                }
                if (!!rowData.other_keyword) {
                    vm.keywords = rowData.other_keyword.split(',').map(item => {
                        return { keyword: item }
                    })
                }
            }
        },
        deleteTicketConfig(rowData) {
            this.$msgbox({
                title: "提示",
                message: "您确定要删除本条配置吗？",
                showCancelButton: true,
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = "正在删除...";
                        utils.fetch("/couponreceipt/delete", { method: "post", body: { id: rowData.id } }).then((json) => {
                                if (typeof json != "undefined") {
                                    if (json.code == 0) {
                                        this.getData();
                                    } else {
                                        this.$message({
                                            showClose: true,
                                            message: json.message,
                                            type: "error"
                                        });
                                    }
                                }
                            });
                        instance.confirmButtonLoading = false;
                        done();
                    } else {
                        done();
                    }
                }
            });
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            utils.getTingYunScript();
            let data = utils.getCache();
            let obj = data == "" ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    },
}
</script>
