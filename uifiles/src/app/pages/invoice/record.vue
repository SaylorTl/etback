<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.plate" size="small" class="cell widthX120" placeholder="车牌号"></el-input>
                    <el-input v-model.trim="search.fpdm" size="small" class="cell widthX120" placeholder="发票代码"></el-input>
                    <el-input v-model.trim="search.fphm" size="small" class="cell widthX120" placeholder="发票号码"></el-input>
                    <el-input v-model.trim="search.tnum" size="small" class="cell widthX120" placeholder="订单号"></el-input>
                    <el-input v-model.trim="search.xfmc" size="small" class="cell widthX120" placeholder="开票人"></el-input>
                    <el-select class="widthX100" size="small" v-model="search.status" clearable placeholder="状态">
                        <el-option v-for="(v,k) in statusmap" :key="k" :label="v" :value="k">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="90"></el-table-column>
                    <el-table-column prop="fpdm" label="发票代码" min-width="100"></el-table-column>
                    <el-table-column prop="fphm" label="发票号码" min-width="100"></el-table-column>
                    <el-table-column prop="tnum" label="订单号" min-width="160"></el-table-column>
                    <el-table-column prop="xfmc" label="开票人" width="120"></el-table-column>
                    <el-table-column prop="sehj" label="税额" width="80"></el-table-column>
                    <el-table-column prop="amount" label="订单金额" width="80"></el-table-column>
                    <el-table-column prop="kprq" label="开票时间" min-width="120"></el-table-column>
                    <el-table-column label="状态" width="60">
                        <template slot-scope="scope">
                            <span>{{statusmap[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.status === 2" @click="downloadhandler(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>下载PDF</el-button>
                            <el-button v-if='scope.row.status === 2 || scope.row.status === 5' @click="delInvoice(scope.row)" plain size="mini"><i class="fa fa-trash-o"></i>发票红冲</el-button>
                            <el-button v-if="scope.row.status === 1" @click="findInvoice(scope.row)" plain size="mini"><i class="fa fa-search"></i>手动查询</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- 发票红冲 S -->
            <el-dialog :title="invoice.title" width='50%' :visible.sync="invoice.show">
                <template v-if='hasInvoiceRule'>
                    <el-table v-loading="shade" element-loading-text="拼命加载中" :data="invoice.data" border fit>
                        <el-table-column type="index" width="50"></el-table-column>
                        <el-table-column prop="spmc" label="商品名称" min-width="180"></el-table-column>
                        <el-table-column prop="spbm" label="商品编码" min-width="150"></el-table-column>
                        <el-table-column prop="je" label="金额" min-width="100"></el-table-column>
                        <el-table-column prop="slv" label="税率" min-width="100"></el-table-column>
                    </el-table>
                    <el-form :model="invoice.info" label-width="120px" class='mt10'>
                        <el-form-item label="抬头类型:">
                            <el-radio-group v-model="invoice.info.type" @change='getInvoiceType'>
                                <el-radio label="G">企业</el-radio>
                                <el-radio label="P">个人</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="发票抬头:">
                            <el-input v-if="!isG" v-model="invoice.info.gfmc" size="small" placeholder="发票抬头"></el-input>
                            <el-select v-if="isG" v-model="invoice.info.gfmc" size="small" class="widthX300" placeholder="发票抬头" filterable remote :remote-method="getCompanyInfo" v-loading='company_loading' @change='setSbh'>
                                <el-option v-for="item in companyArray" :key="item.nsrsbh" :value="item.nsrmc" :label="item.nsrmc"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item v-if="isG" label="税号:">
                            <el-input v-model="invoice.info.nsrsbh" size="small" placeholder="纳税人识别号" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="订单号:">
                            <el-input v-model="invoice.info.tnum" size="small" disabled></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size='small' :loading='invoice.btnloading' @click="setInvoice">确认</el-button>
                        </el-form-item>
                    </el-form>
                </template>
                <template v-else>
                    <div>该车场暂不支持开电子发票，如有疑问请联系管理处</div>
                </template>
            </el-dialog>
            <!-- 发票红冲 E-->
        </div>
    </div>

</template>

<script>
import utils from '../../../utils/utils.js';
let config = window.etback.config;
export default {
    data: function () {
        let url = {
            lists: '/invoice/lists',
            down: '/invoice/download',
            del: '/invoice/delete', //发票红冲
            spobj: '/invoice/spobj',//  获取商品信息接口
            taxget: '/invoice/taxGetList'//查询纳税人信息
        }
        return {
            url,
            statusmap: { '1': '开票中', '2': '成功', '3': '失败', '4': '已红冲', '5': '待签章' },
            shade: false,
            search: { station: '', plate: '', fpdm: '', fphm: '', tnum: '', xfmc: '', status: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            isG: true, //开发票的发票抬头类型为企业
            invoice: { title: '', show: false, data: [], info: { type: '', gfmc: '', nsrsbh: '', tnum: '' }, btnloading: false },
            companyArray: [],
            company_loading: false,
            hasInvoiceRule: true,
        }
    },
    methods: {
        delInvoice(row) {
            this.hasInvoiceRule = true;
            this.getInvoiceMsg(row);
            this.invoice.title = '发票信息';
            this.invoice.show = true;
            this.invoice.info.tnum = row.tnum;
            this.invoice.info.gfmc = '';
            this.invoice.info.nsrsbh = '';
            this.invoice.info.type = 'G';
            this.invoice.btnloading = false;
        },
        getInvoiceMsg(row) {
            let vm = this;
            let url = vm.url.spobj;
            let { amount, rule: rule_id, station } = row;
            let data = { amount, rule_id, station };
            utils.fetch(url, { method: 'POST', body: data }).then(function (res) {
                if(typeof (res) != 'undefined'){
                    if (res.code == 0) {
                        vm.invoice.data = res.content || [];
                    } else {
                        vm.hasInvoiceRule = false;
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        setInvoice(row) {
            let vm = this;
            let url = vm.url.del;
            let { data: spobj, info: { tnum, gfmc, nsrsbh } } = vm.invoice;
            if (!gfmc) {
                vm.$message({ showClose: true, message: '购方名称不能为空', type: 'error' }); return;
            }
            if (vm.isG && !nsrsbh) {
                vm.$message({ showClose: true, message: '企业税号不能为空', type: 'error' }); return;
            }
            let spobjstr = JSON.stringify(spobj);
            let data = { tnum, gfmc, spobj: spobjstr };
            vm.invoice.btnloading = true;
            utils.fetch(url, { method: 'POST', body: data }).then(function (res) {
                if(typeof (res) != 'undefined'){
                    if (res.code == 0) {
                        vm.invoice.btnloading = false;
                        vm.invoice.show = false;
                        vm.$message({ showClose: true, message: '红冲需要一定时间,请30秒后手动刷新查看开票状态', type: 'success' });
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        getInvoiceType(val) {
            this.isG = !!(val === 'G');
        },
        getCompanyInfo(query) {
            let vm = this;
            let url = `${vm.url.taxget}?key=${query}`;
            vm.company_loading = true;
            utils.fetch(url).then(function (json) {
                if (json && json.code == 0) {
                    vm.companyArray = json.content.lists || [];
                }
                vm.company_loading = false;
            });
        },
        setSbh(value) {
            if (!value) return;
            let selected = this.companyArray.find(item => item.nsrmc === value)
            this.invoice.info.nsrsbh = selected.nsrsbh
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        downloadhandler: function (row) {
            let vm = this;
            let url = vm.url.down + '?url=' + row.url;
            utils.rpc.loadfile(url, null, row.url).then(function (res) {
                if (res && res.code === 0) {
                    vm.$message({ showClose: true, message: res.message, type: 'success' })
                } else {
                    vm.$message({ showClose: true, message: res.message || 'no data', type: 'error' })
                }
            });
        },
        getData: function () {
            var vm = this;
            var url = vm.url.lists + '?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            let { ...searchs } = vm.search;
            let searchmap = searchs;
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function (res) {
                vm.tableData = (typeof (res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                vm.pagination.total = (typeof (res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                utils.setCache(vm);
                vm.shade = false
            });
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = { station: '', plate: '', fpdm: '', fphm: '', tnum: '', xfmc: '', status: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        findInvoice(item) {
            let that = this;
            let data = {
                invguid: item.invguid
            }
            let url = `/invoice/handle`;
            utils.fetch(url, { method: 'POST', body: data }).then((res) => {
                if (res.code === 0 && !!res.content) {
                    that.$alert(JSON.stringify(res.content), '开票结果', {
                        confirmButtonText: '确定',
                        callback: action => {
                            that.getData();
                        }
                    });
                }
            });
        }

    },
    beforeRouteEnter: function (to, from, next) {
        next(function (vm) {
            utils.getTingYunScript();
            var data = utils.getCache();
            var obj = data == '' ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    },
}

</script>

