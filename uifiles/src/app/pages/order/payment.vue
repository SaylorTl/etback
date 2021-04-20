<template>
    <div id="box" class="menu-hide">
        <div class="worker inlists">
            <div class="condition clearfix box-width">
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" :isFocus="!!!search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.tnum" size="small" class="cell widthX250" placeholder="易停订单号"></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa', search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="importFile" size="small"><i class="fa fa-upload"></i>导入</el-button>
                    <el-button @click="exportFile" size="small"><i class="fa fa-download"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <my-linkage-dept v-model="search.dept" :hideDefault="true" type="2"></my-linkage-dept>
                <el-select v-model="search.type" size="small" class="cell widthX100" placeholder="类型" clearable>
                    <el-option v-for="(v, k) in cfg.type" :label="v" :value="k" :key="k"></el-option>
                </el-select>
                <el-select v-model="search.source" size="small" class="cell widthX100" placeholder="来源" clearable>
                    <el-option v-for="(v, k) in cfg.source" :label="v" :value="k" :key="k"></el-option>
                </el-select>
                <el-select v-model="search.status" size="small" class="cell widthX100" placeholder="状态" clearable>
                    <el-option label="已创建" value="created"></el-option>
                    <el-option label="已支付" value="paid"></el-option>
                    <el-option label="退款" value="return"></el-option>
                </el-select>
                <el-select v-model="search.download" size="small" class="cell widthX120" placeholder="下发/开闸状态" clearable>
                    <el-option label="成功" value="Y"></el-option>
                    <el-option label="失败" value="N"></el-option>
                </el-select>
                <el-input v-model.trim="search.third_tnum" size="small" class="cell widthX200" placeholder="第三方订单号"></el-input>
                <el-input v-model.trim="search.related_tnum" size="small" class="cell widthX200" placeholder="预付单号"></el-input>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <el-select v-model="search.sort_type" size="small" class="cell widthX150" placeholder="类型" clearable>
                    <el-option v-for="(v, k) in cfg.sortType" :label="v" :value="k" :key="k"></el-option>
                </el-select>
                <el-date-picker v-model="search.begintime" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.endtime" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <select-property v-model="search.property_id" size="small" class="cell widthX150" placeholder="物业公司名称"></select-property>
                <my-select-domain v-model.trim="search.domain_id" size="small" class="cell widthX150" placeholder="易停区域"></my-select-domain>
                <el-select class="widthX100" size="small" v-model="search.invoice" clearable placeholder="开票状态">
                    <el-option v-for="(v, k) in cfg.invoice" :key="k" :label="v" :value="k"></el-option>
                </el-select>
                <el-input v-model.trim="search.unit_name" size="small" class="cell widthX120" placeholder="楼栋号"></el-input>
            </div>
            <div v-show="search_more" class="condition-more clearfix box-width">
                <el-input v-model.trim="search.room_name" size="small" class="cell widthX120" placeholder="房间号"></el-input>
                <!--  预发布环境及彩停车环境显示   -->
                <el-date-picker v-if="showMonthPicker" v-model="search.table_time" size="small" class="cell" type="month" placeholder="选择月" value-format="yyyyMM"></el-date-picker>
            </div>
            <div class="table box-width">
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%" show-summary :summary-method="getSummaries">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{ props.row.area_name }}/{{ props.row.dept_name }}</span></el-form-item>
                                <el-form-item label="支付来源:">
                                    <span>{{ cfg.source[props.row.source] || props.row.source }}</span>
                                </el-form-item>
                                <el-form-item label="供应商:"><span>{{ props.row.vendor_name }}</span></el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="用户名:"><span>{{ props.row.user_name }}</span></el-form-item>
                                <el-form-item label="第三方单号:"><span>{{ props.row.third_tnum }}</span></el-form-item>
                                <el-form-item label="预付单号:"><span>{{ props.row.related_tnum }}</span></el-form-item>
                                <el-form-item v-if="!!props.row.cost_price" :label="props.row.discount_type + '/原价:'"><span>{{ props.row.cost_price }} </span></el-form-item>
                                <el-form-item label="月卡价格:" v-if="props.row.type == 'MONTH'"><span>{{ props.row.rent }}</span></el-form-item>
                                <el-form-item v-if="props.row.source != 'WECHAT' && props.row.source != 'WX_AGUA'" label="手机号:"><span>{{ props.row.user_phone }}</span></el-form-item>
                                <el-form-item v-if="props.row.source == 'WECHAT' || props.row.source == 'WX_AGUA'" label="微信openID:"><span>{{ props.row.user_openid }}</span></el-form-item>
                                <el-form-item label="月卡规则:"><span>{{ props.row.rule_name }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                                <el-form-item label="开票状态:"><span>{{ cfg.invoice[props.row.invoice] }}</span></el-form-item>
                                <el-form-item v-if="props.row.type == 'MONTH'" label="购买时间段:"><span>{{ props.row.arrival + "    " + props.row.departure }}</span></el-form-item>
                                <el-form-item label="付款二维码:" v-if="props.row.qrcode">
                                    <qrcode :value="props.row.qrcode"></qrcode>
                                </el-form-item>
                                <div>
                                    <el-form-item v-if="props.row.download == 'N'" label="下发失败原因:"><span>{{ props.row.content }}</span></el-form-item>
                                </div>
                                <el-form-item label="优惠类型:">
                                    <span>{{ props.row.discount_type }}</span>
                                </el-form-item>
                                <el-form-item label="楼栋号:" v-if="props.row.type == 'MONTH'">
                                    <span>{{ props.row.unit_name }}</span>
                                </el-form-item>
                                <el-form-item label="房间号:" v-if="props.row.type == 'MONTH'">
                                    <span>{{ props.row.room_name }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="30"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="tnum" label="易停订单号" min-width="200"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="50"></el-table-column>
                    <el-table-column label="来源" min-width="80">
                        <template slot-scope="scope">
                            <span>{{ cfg.source[scope.row.source] || scope.row.source }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型" width="55">
                        <template slot-scope="scope">
                            <span>{{ cfg.type[scope.row.type] || "未知" }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="status" label="状态" width="88">
                        <template slot-scope="scope">
                            <span v-if="scope.row.prepay === 'Y' && scope.row.status === 'created'">已离场,未支付</span>
                            <span v-else :class="{ green: scope.row.status == 'paid' }">{{ cfg.status[scope.row.status] || "未知" }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="开闸/下发" min-width="65">
                        <template slot-scope="scope" v-if="scope.row.vendor_id != 0 && scope.row.status == 'paid'">
                            <span v-if="scope.row.type === 'NONVEHICLE'">成功</span>
                            <span v-else-if="scope.row.type !== 'BOOKING'" :class="{ red: scope.row.download == 'N' }">{{ cfg.send[scope.row.type] + cfg.send[scope.row.download] }}</span>
                            <span v-else></span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="paytime" label="支付时间" min-width="140">
                        <template slot-scope="scope" v-show="scope.row.paytime">
                            <span v-if="scope.row.status == 'paid'">{{ scope.row.paytime }}</span>
                            <span v-else>
                                <el-button @click="checkStatus(scope.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>检测</el-button>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="140">
                        <template slot-scope="scope">
                            <el-button size="mini" v-if="authCheck('退款') && scope.row.status == 'paid' && scope.row.type == 'MONTH'" @click="setrefund(scope.row)">退款</el-button>
                            <el-button v-if="authCheck('收费系统推送') && (scope.row.status == 'paid' || scope.row.type !== 'NONVEHICLE')" size="mini" @click="iposnotify(scope.row.tnum)">收费系统推送</el-button>
                            <el-button size="mini" v-if="scope.row.invoice == 'N' && scope.row.status == 'paid' && scope.row.type !== 'NONVEHICLE' && scope.row.invoice_ready === 1" @click="showInvoice(scope.row)">开发票</el-button>
                            <el-button size="mini" v-if="scope.row.invoice == 2 && scope.row.type !== 'NONVEHICLE'" @click="downloadInvoice(scope.row)">下载发票</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <el-dialog :title="this.editTitle" width="40%" :visible.sync="orderStatus.show">
                <el-form :model="orderStatus">
                    <el-form-item label="支付状态:" label-width="120px">
                        <el-radio-group v-model="orderStatus.status">
                            <el-radio :label="'paid'">已支付</el-radio>
                            <el-radio :label="'created'">未支付</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="cancelClick">取 消</el-button>
                    <el-button type="primary" @click="editSubmit">保存</el-button>
                </div>
            </el-dialog>
            <el-dialog :title="paywin.payTitle" :visible.sync="paywin.renoCzy" v-loading="lipton">
                <div v-if="paywin.isSuccess">{{ paywin.successInfo }}</div>
                <div v-else>{{ paywin.json }}</div>
            </el-dialog>
            <!-- 换车牌  月卡报停 取消报停 后下发 S -->
            <el-dialog :title="refund.title" width="80%" :visible.sync="refund.show">
                <el-form :model="refund.add" label-width="100px">
                    <h3 class="mtb5">{{ refund.add.title }}</h3>
                    <el-form-item label="请求结果:">
                        <span>{{ refund.add.info.result || "" }}</span>
                    </el-form-item>
                </el-form>
                <div v-show="refund.delShow">
                    <el-form :model="refund.del" label-width="100px">
                        <h3 class="mtb5">{{ refund.del.title }}</h3>
                        <el-form-item label="请求结果:">
                            <span>{{ refund.del.info.result || "" }}</span>
                        </el-form-item>
                    </el-form>
                </div>
            </el-dialog>
            <!-- 退款 E -->
            <!-- 开发票 S -->
            <el-dialog :title="invoice.title" width="50%" :visible.sync="invoice.show">
                <template v-if="hasInvoiceRule">
                    <el-table v-loading="shade" element-loading-text="拼命加载中" :data="invoice.data" border fit>
                        <el-table-column type="index" width="50"></el-table-column>
                        <el-table-column prop="spmc" label="商品名称" min-width="180"></el-table-column>
                        <el-table-column prop="spbm" label="商品编码" min-width="150"></el-table-column>
                        <el-table-column prop="je" label="金额" min-width="100"></el-table-column>
                        <el-table-column label="税率" min-width="100">
                            <template slot-scope="scope">
                                <span>{{ scope.row.slv * 100 + "%" }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-form :model="invoice.info" label-width="120px" class="mt10">
                        <el-form-item label="抬头类型:">
                            <el-radio-group v-model="invoice.info.type" @change="getInvoiceType">
                                <el-radio label="G">企业</el-radio>
                                <el-radio label="P">个人</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="发票抬头:">
                            <el-input v-if="!isG" v-model="invoice.info.gfmc" size="small" placeholder="发票抬头"></el-input>
                            <el-select v-if="isG && !isShow" v-model="invoice.info.gfmc" size="small" class="widthX300" placeholder="发票抬头" filterable remote :remote-method="getCompanyInfo" v-loading="company_loading" @change="setSbh">
                                <el-option v-for="item in companyArray" :key="item.nsrsbh" :value="item.nsrmc" :label="item.nsrmc"></el-option>
                            </el-select>
                            <el-input v-if="isG && isShow" v-model="invoice.info.gfmc" size="small" class="widthX300" placeholder="发票抬头"></el-input>
                            <el-button @click="isShow = !isShow" size="small">{{ isShow ? "输入筛选" : "手动输入" }}</el-button>
                        </el-form-item>
                        <el-form-item v-if="isG" label="税号:">
                            <el-input v-model="invoice.info.gfnsrsbh" size="small" placeholder="纳税人识别号"></el-input>
                        </el-form-item>
                        <el-form-item label="订单号:">
                            <el-input v-model="invoice.info.tnum" size="small" disabled></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size="small" :loading="invoice.btnloading" @click="setInvoice">开票</el-button>
                        </el-form-item>
                    </el-form>
                </template>
                <template v-else>
                    <div>该车场暂不支持开电子发票，如有疑问请联系管理处</div>
                </template>
            </el-dialog>
            <!-- 开发票 E-->
            <!-- 导入 S-->
            <el-dialog :title="importer.title" :visible.sync="importer.show" width="60%">
                <el-upload drag :action="upload_url" :headers="cfg.header" :limit="1" :on-exceed="exceedHandle" :on-success="importSuccess" :on-error="importError" :file-list="fileList" auto-upload class="tc" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
                </el-upload>
                <div v-loading="importshade">
                    <el-table v-if="importData.length > 0" :data="importData" border height="350" style="width:100%">
                        <el-table-column prop="A" label="订单类型" width="100"></el-table-column>
                        <el-table-column prop="B" label="支付渠道" min-width="80"></el-table-column>
                        <el-table-column prop="C" label="E停单号" min-width="90"></el-table-column>
                        <el-table-column prop="D" label="第三方单号" min-width="60"></el-table-column>
                        <el-table-column prop="E" label="金额" min-width="60"></el-table-column>
                        <el-table-column prop="F" label="创建时间" min-width="60"></el-table-column>
                        <el-table-column prop="G" label="支付时间" min-width="60"></el-table-column>
                        <el-table-column prop="H" label="订单名" min-width="140"></el-table-column>
                        <el-table-column prop="tip" label="错误提示" min-width="140"></el-table-column>
                    </el-table>
                </div>
                <div v-show="successFlag" class="tc green">导入成功</div>
            </el-dialog>
            <!-- 导入 E-->
            <el-dialog title="导出成功" :visible.sync="goDialog.show" width="30%">
                <p>{{ goDialog.msg }}</p>
                <div class="tc">
                    <el-button type="primary" @click="goTodolist">前往待办</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import utils from "../../../utils/utils.js";
let config = window.etback.config;
import selectProperty from "../../../utils/select-property.vue";
export default {
    data: function () {
        let header = {};
        header["Access-Control-Request-Headers"] = "Origin, X-Requested-With, Content-Type, Access-Token";
        header["Access-Control-Request-Method"] = "POST, GET, PUT, DELETE, OPTIONS";
        header["Access-Token"] = window.localStorage.getItem("access_token");
        let config = {
            source: utils.config.payMethod,
            status: utils.config.payStatus,
            type: { MONTH: "月卡", TEMP: "临停", BOOKING: "车位锁预约", NOFEEL: "无感支付", NONVEHICLE: "非机动车停车费" },
            send: { MONTH: "下发", TEMP: "开闸", BOOKING: "下发", NOFEEL: "开闸", Y: "成功", N: "失败" },
            invoice: { "1": "开票中", "2": "成功", "3": "失败", "4": "已红冲", "5": "待签章", N: "未开票" },
            sortType: { "1": "支付时间搜索", "2": "创建时间搜索", "3": "最后更新时间搜索" },
            url: {
                down: "/invoice/download", // 下载发票
                spobj: "/invoice/spobj", //  获取商品信息接口
                show: "/invoice/show", // 开发票查询到url
                add: "/invoice/add", //  提交发票
                taxget: "/invoice/taxGetList" //查询纳税人信息
            },
            header
        };
        return {
            cfg: config,
            shade: false,
            search_more: false,
            lipton: false,
            isG: true, //开发票的发票抬头类型为企业
            dialogTableVisible: false,
            dialogFormVisible: false,
            editTitle: "",
            search: { domain_id: "", station_id: "", car_id: "", type: "", download: "", third_tnum: "", tnum: "", related_tnum: "", status: "", source: "", phone: "", sort_type: "3", begintime: "", endtime: "", dept: "", property_id: "", invoice: "", unit_name: "", room_name: "", table_time: "" },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            paywin: { renoCzy: false, payTitle: "", successInfo: "", json: "" },
            orderStatus: { show: false, status: "", tnum: "", related_tnum: "" },
            refund: { title: "", show: false, add: { title: "", info: { url: "", params: "", result: "" } }, del: { title: "", info: { url: "", params: "", result: "" } }, delShow: false },
            invoice: { title: "", show: false, data: [], info: { type: "", gfmc: "", gfnsrsbh: "", tnum: "" }, btnloading: false },
            companyArray: [],
            company_loading: false,
            hasInvoiceRule: true,
            goDialog: { show: false, msg: "" },
            importer: { title: "交易订单导入", show: false },
            upload_url: "",
            importshade: false,
            successFlag: false,
            importData: [],
            fileList: [],
            isShow: false,
            sum: 0,
            showMonthPicker: window.location.host === "new.eptingche.cn" || window.location.host === "new.caitingche.com"
        };
    },
    components: {
        "select-property": selectProperty
    },
    methods: {
        importFile() {
            this.importer.show = true;
            this.importshade = false;
            this.successFlag = false;
            this.importData = [];
            this.upload_url = config.host + "/import/order";
        },
        importSuccess(res, file, fileList) {
            let vm = this;
            if (res && res.code === 0) {
                if (res.content.length > 0) {
                    vm.importData = res.content;
                } else {
                    vm.successFlag = true;
                    vm.importData = [];
                }
            } else {
                vm.$message({ showClose: true, message: res.message, type: "error" });
            }
        },
        importError(err, file, fileList) {
            this.$message({ showClose: true, message: err || "upload error", type: "error" });
        },
        exceedHandle() {
            this.$message({ showClose: true, message: "单次只能传一个文件", type: "error" });
        },
        exportFile() {
            var vm = this;
            var url = "/export/orderExport?";
            var download_p = vm.$route.params.download;
            var status_p = vm.$route.params.status;
            var tnum_p = vm.$route.params.tnum;
            if (download_p && vm.search.download == "") {
                vm.search.download = download_p;
            }
            if (status_p && vm.search.status == "") {
                vm.search.status = status_p;
            }
            if (tnum_p && vm.search.tnum == "") {
                vm.search.tnum = tnum_p;
            }
            let { dept, ...others } = vm.search;
            let searchmap = { ...others };
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? querystr : "";
            if (vm.search.dept != "" && typeof vm.search.dept.company == "number" && vm.search.dept.area == "") url += "&company_id=" + vm.search.dept.company;
            if (vm.search.dept != "" && vm.search.dept.area != "" && vm.search.dept.department == "") url += "&area_id=" + vm.search.dept.area;
            if (vm.search.dept != "" && vm.search.dept.department != "") url += "&dept_id=" + vm.search.dept.department;
            utils.fetch(url).then(function (res) {
                if (res.code === 0) {
                    //vm.$message({ showClose:true, message:res.message, type:'success' });
                    vm.goDialog.show = true;
                    vm.goDialog.msg = res.message;
                } else {
                    vm.$message({ showClose: true, message: res.message, type: "error" });
                }
            });
        },
        goTodolist() {
            this.$router.push({ path: "/todolist" });
        },
        showInvoice(row) {
            this.hasInvoiceRule = true;
            this.getInvoiceMsg(row);
            this.invoice.title = "发票信息";
            this.invoice.show = true;
            this.invoice.info.tnum = row.tnum;
            this.invoice.info.gfmc = "";
            this.invoice.info.gfnsrsbh = "";
            this.invoice.info.type = "G";
            this.invoice.btnloading = false;
        },
        downloadInvoice(row) {
            let vm = this;
            let url = `${vm.cfg.url.show}?tnum=${row.tnum}`;
            let invoiceurl = "";
            utils.fetch(url).then(function (res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        invoiceurl = res.content.url;
                        let c_url = vm.cfg.url.down + "?url=" + invoiceurl;
                        utils.rpc.loadfile(c_url, null, invoiceurl);
                        //window.location.href=c_url;
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        getInvoiceMsg(row) {
            let vm = this;
            let url = vm.cfg.url.spobj;
            let { amount, rule: rule_id, station } = row;
            let data = { amount, rule_id, station };
            utils.fetch(url, { method: "POST", body: data }).then(function (res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.invoice.data = res.content || [];
                    } else {
                        vm.hasInvoiceRule = false;
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        setInvoice(row) {
            let vm = this;
            let url = vm.cfg.url.add;
            let {
                data: spobj,
                info: { tnum, gfmc, gfnsrsbh }
            } = vm.invoice;
            if (!gfmc) {
                vm.$message({ showClose: true, message: "购方名称不能为空", type: "error" });
                return;
            }
            if (vm.isG && !gfnsrsbh) {
                vm.$message({ showClose: true, message: "企业税号不能为空", type: "error" });
                return;
            }
            let spobjstr = JSON.stringify(spobj);
            let data = { tnum, gfmc, spobj: spobjstr, gfnsrsbh };
            vm.invoice.btnloading = true;
            utils.fetch(url, { method: "POST", body: data }).then(function (res) {
                if (typeof res != "undefined") {
                    if (res.code == 0) {
                        vm.invoice.btnloading = false;
                        vm.invoice.show = false;
                        vm.$message({ showClose: true, message: "开票需要一定时间,请30秒后手动刷新查看开票状态", type: "success" });
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: "error" });
                    }
                }
            });
        },
        getInvoiceType(val) {
            this.isG = !!(val === "G");
        },
        getCompanyInfo(query) {
            let vm = this;
            if (query === "") {
                return;
            }
            let url = `${vm.cfg.url.taxget}?key=${query}`;
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
            let selected = this.companyArray.find(item => item.nsrmc === value);
            this.invoice.info.gfnsrsbh = selected.nsrsbh;
        },
        setrefund: function (row) {
            var vm = this;
            var url = "/order/refund";
            var data = {
                tnum: row.tnum,
                creationtime: row.creationtime
            };
            vm.$confirm("确认要退款？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            })
                .then(action => {
                    if (action == "confirm") {
                        utils.fetch(url, { method: "post", body: data }).then(function (json) {
                            if (typeof json != "undefined") {
                                if (json.code == 0) {
                                    if (json.content) {
                                        vm.showRefund(json);
                                    } else {
                                        vm.$message({ showClose: true, message: json.message, type: "success" });
                                    }
                                    vm.getData();
                                    window.sessionStorage.clear();
                                } else {
                                    vm.$message({ showClose: true, message: json.message, type: "error" });
                                }
                            }
                        });
                    }
                })
                .catch(() => {
                    vm.$message({ type: "warning", message: "已取消退款操作" });
                });
        },
        showRefund: function (res) {
            var vm = this;
            vm.refund.title = "退款下发和删除信息";
            vm.refund.show = true;
            vm.refund.delShow = true;
            vm.refund.add = res.content.add;
            vm.refund.del = res.content.del;
        },
        editClick: function (row) {
            var vm = this;
            vm.editTitle = "订单支付状态编辑";
            vm.orderStatus = { show: true, status: row.status, tnum: row.tnum, related_tnum: row.related_tnum };
        },
        editSubmit: function () {
            var vm = this;
            var url = "/order/orderStatus";
            var dat = "sn=" + vm.orderStatus.tnum + "&related_tnum=" + vm.orderStatus.related_tnum + "&status=" + vm.orderStatus.status;
            utils.fetch(url, { method: "post", body: dat }).then(function (json) {
                if (typeof json != "undefined") {
                    if (json.code == 0) {
                        vm.getData();
                        vm.orderStatus.show = false;
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: "error" });
                    }
                }
            });
        },
        cancelClick: function () {
            var vm = this;
            vm.orderStatus.show = false;
        },
        isCZY(row) {
            return !!(row.related_tnum && row.related_tnum.indexOf("_") > -1);
        },
        isEPOS(row) {
            let reg = /^[0-9]*$/;
            return !!(!row.related_tnum && reg.test(row.third_tnum));
        },
        isSQ(row) {
            let isb = row.related_tnum.indexOf("wx") === 0;
            //let isc = row.third_tnum.indexOf('168') ===0;
            return isb ? "SQ" : "EPWECHAT";
        },
        checkStatus: function (row) {
            if (row.source !== "CZY" && row.source !== "EPOS" && row.source !== "ETPOS" && row.source !== "EPWECHAT" && row.source !== "WECHAT") {
                this.$message({ showClose: true, message: "暂时只支持彩之云微信、懿轩微信、双乾、易停POS和IPOS检测", type: "error" });
                return;
            }
            var vm = this;
            var time1 = new Date("2017/12/07 00:00:00").getTime();
            var time2 = new Date(row.creationtime.replace(/-/g, "\/")).getTime();
            if (time2 < time1) {
                vm.$message({ showClose: true, message: "检测时间要在2017/12/07之后", type: "error" });
                return;
            }
            if (vm.isCZY(row) || vm.isEPOS(row) || row.source == "EPWECHAT" || row.source == "WECHAT") {
                let type = row.source == "EPWECHAT" ? vm.isSQ(row) : row.source;
                var url = "/order/query?related_tnum=" + row.related_tnum + "&station_id=" + row.station + "&is_change=true" + "&sn=" + row.tnum + "&source=" + type + "&third_tnum=" + row.third_tnum;
                vm.paywin.renoCzy = true;
                utils.fetch(url).then(function (res) {
                    if (typeof res != "undefined") {
                        if (res.code == 0) {
                            vm.paywin.isSuccess = res.content.status == 2;
                            vm.paywin.payTitle = res.content.status == 2 ? "支付成功" : "支付未成功";
                            vm.paywin.json = res.content;
                        } else {
                            vm.$message({ showClose: true, message: res.message, type: "error" });
                        }
                    }
                });
                vm.getData();
            } else {
                vm.$message({ showClose: true, message: "检测类型错误", type: "error" });
            }
        },
        iposnotify: function (tnum) {
            var vm = this;
            var url = "/order/notifyipos?tnum=" + tnum;
            utils.fetch(url).then(function (json) {
                if (typeof json != "undefined") {
                    vm.$message({ showClose: true, message: json.message, type: "success" });
                }
            });
        },
        authCheck: function (tag) {
            return utils.authCheck(this, tag);
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function () {
            const { queryFlag } = this.$route.params;
            let url = `/order/payment?page=${this.pagination.page}&pagesize=${this.pagination.pagesize}`;
            let nowMonth = utils.eptimes.outTime(new Date(), 'yyyy-MM')
            let nowDate = utils.eptimes.outTime(new Date(), 'yyyy-MM-dd')

            if (queryFlag && queryFlag === 'fastQuery') {
                url = `/order/payment?page=1&pagesize=10`;
                this.search = {};
                this.search.begintime = `${nowMonth}-01 00:00:00`;
                this.search.endtime = `${nowDate} 23:59:59`;
                this.search_more = true;
            }
            let search = utils.dealRouteParams(this);
            let { dept, ...others } = search;
            var querystr = utils.setQueryString(others);
            url += querystr ? '&' + querystr : '';
            let deptStr = utils.setDeptQuery(dept);
            url += deptStr ? '&' + deptStr : '';
            this.shade = true;
            utils.fetch(url).then((json) => {
                this.clearRouteParams();
                this.tableData = (typeof (json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                this.sum = json.content.sum ? json.content.sum.amount : 0;
                this.pagination.total = (typeof (json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                this.shade = false;
                utils.setCache(this, 'sum');
            });
        },
        getSummaries(params) {
            let result = []
            if (params.data.length > 0) {
                result[0] = "合计";
                result[5] = this.sum ? this.sum.toFixed(2) : 0;
            }
            return result
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search_more = false;
            this.search = { domain_id: '', station_id: '', car_id: '', type: '', download: '', third_tnum: '', tnum: '', related_tnum: '', status: '', source: '', phone: '', sort_type: '', begintime: '', endtime: '', dept: '', property_id: '', invoice: '', unit_name: '', room_name: '', table_time: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.clearRouteParams();
            this.getData();
        },
        btnMore: function () {
            this.search_more = !this.search_more;
        },
        clearRouteParams() {
            let params = this.$route.params;
            for (let i in params) {
                params[i] = "";
            }
        },
    },
    created() {
        utils.getTingYunScript();
        this.getData();
    },
    activated() {
        if (Object.keys(this.$route.params).length > 0) {
            const { car_id } = this.$route.params;
            this.search.car_id = car_id;
            this.getData();
        }

    }
}

</script>
