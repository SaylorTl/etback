<!--  /coupon/order.vue   -->
<template>
    <div class="coupon-invoice">
        <el-table v-loading="loading" element-loading-text="拼命加载中" :data="invoice.data" class="widthP100" border fit>
            <el-table-column prop="spmc" label="商品名称" min-width="180"></el-table-column>
            <el-table-column prop="spbm" label="商品编码" min-width="150"></el-table-column>
            <el-table-column prop="je" label="金额" min-width="100"></el-table-column>
            <el-table-column label="税率" min-width="100">
                <template slot-scope="scope">
                    <span>{{(scope.row.slv*100) + '%'}}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-form :model="invoice.info" label-width="120px" class='mt10'>
            <el-form-item label="抬头类型:">
                <el-radio-group v-model="invoice.info.type" @change='getInvoiceType'>
                    <el-radio label="G">企业</el-radio>
                    <el-radio label="P">个人</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="发票抬头:">
                <el-input v-if="!isEnterprise" v-model="invoice.info.gfmc" size="small" placeholder="发票抬头"></el-input>
                <el-select v-if="isEnterprise && !isShow" v-model="invoice.info.gfmc" size="small" class="widthX300" placeholder="发票抬头" filterable remote :remote-method="getCompanyInfo" v-loading='company_loading' @change='setSbh'>
                    <el-option v-for="item in companyArray" :key="item.nsrsbh" :value="item.nsrmc" :label="item.nsrmc"></el-option>
                </el-select>
                <el-input v-if="isShow" v-model="invoice.info.gfmc" class="widthX300" size="small" placeholder="发票抬头"></el-input>
                <el-button @click="addInfo" class="widthX100" size="small">{{isShow?'输入选择':'手动输入'}}</el-button>
            </el-form-item>
            <el-form-item v-if="isEnterprise" label="税号:">
                <el-input v-model="invoice.info.gfnsrsbh" size="small" placeholder="纳税人识别号"></el-input>
            </el-form-item>
            <el-form-item label="订单号:">
                <el-input v-model="invoice.info.tnum" size="small" disabled></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" size='small' :loading='invoice.btnLoading' @click="setInvoice">开票</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import utils from '../../utils/utils.js';
export default {
    name: 'couponInvoice',
    components: {},
    props: {
        invoiceInfo: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            loading: true,
            isEnterprise: true,
            company_loading:false,
            companyArray:[],
            invoice: { data: [], btnLoading: false, info: { type: '', gfmc: '', gfnsrsbh: '', tnum: '' } },
            isShow:false,
        }
    },
    beforeCreate() { },
    created() {
        this.initForm();
        this.getGoodsInfo();
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
        initForm() {
            if (!!this.invoiceInfo) {
                this.invoice = { btnloading: false, info: { type: 'G', gfmc: '', gfnsrsbh: '', tnum: this.invoiceInfo.tnum } };
            }

        },
        getCompanyInfo(query) {
            let vm = this;
            if (query === '') { return }
            let url = `/invoice/taxGetList?key=${query}`;
            vm.company_loading = true;
            utils.fetch(url).then(function (json) {
                if (json && json.code == 0) {
                    vm.companyArray = json.content.lists || [];
                }
                vm.company_loading = false;
            });
        },
        addInfo(){
            this.isShow = !this.isShow;
        },
        setSbh(value) {
            if (!value) return;
            let selected = this.companyArray.find(item => item.nsrmc === value)
            this.invoice.info.gfnsrsbh = selected.nsrsbh
        },
        getInvoiceType(value) {
            this.isEnterprise = !!(value === 'G');
        },
        getGoodsInfo() {
            console.log("%c 优惠券信息：%O", "font-size:14px;font-weight:700;color:blue", this.invoiceInfo);
            let params = {
                amount: this.invoiceInfo.amount,
                rule_id: 'tmp',
                station: this.invoiceInfo.station_id
            }

            utils.fetch('/invoice/spobj', { method: 'POST', body: params }).then((res) => {
                if (typeof (res) != 'undefined' && res.code == 0) {
                    this.invoice.data = res.content || [];
                    console.log("%c 商品信息：%O", "font-size:14px;font-weight:700;color:blue", this.invoice.data);
                    this.loading = false;
                } else {
                    // this.hasInvoiceRule = false;
                    this.$message({ showClose: true, message: '车场规则未配置，无法开票', type: 'error' });
                    this.$emit('handleClose');
                }
            })
        },
        setInvoice() {
            let { data: spobj, info: { tnum, gfmc, gfnsrsbh } } = this.invoice;
            if (!gfmc) {
                this.$message({ showClose: true, message: '购方名称不能为空', type: 'error' }); return;
            }
            if (this.isEnterprise && !gfnsrsbh) {
                this.$message({ showClose: true, message: '企业税号不能为空', type: 'error' }); return;
            }
            let spobjstr = JSON.stringify(spobj);
            let data = { tnum, gfmc, spobj: spobjstr, gfnsrsbh, order_type: 'coupon' };
            this.invoice.btnLoading = true;
            utils.fetch('/invoice/add', { method: 'POST', body: data }).then((res) => {
                if(typeof (res) != 'undefined'){
                    if (res.code == 0) {
                        this.invoice.btnLoading = false;
                        this.$message({ showClose: true, message: '开票需要一定时间,请30秒后手动刷新查看开票状态', type: 'success' });
                    } else {
                        this.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        }
    }
}
</script>
