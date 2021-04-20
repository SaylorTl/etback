<template>
    <div id="box" class="menu-hide page-memberRules">
        <div class="worker station">
            <div class="condition clearfix box-width">
                <div class="left">
                    <el-date-picker v-model="search.time_begin" value-format="yyyy-MM-dd" type="date" placeholder="创建开始时间" size="small" class="cell widthX150"></el-date-picker>
                    <el-date-picker v-model="search.time_end" value-format="yyyy-MM-dd" type="date" placeholder="创建结束时间" size="small" class="cell widthX150"></el-date-picker>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX120" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.convert_type" size="small" class="cell widthX100" placeholder="兑换类型" clearable>
                        <el-option v-for="(val,key) in convert_types" :key="key" :label="val" :value="key">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" class="cell" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' class="cell" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button class="cell" size="small" @click="addInit();editShow=true">新增</el-button>
                </div>
            </div>
            <div class="table box-width">
                <el-table :data="tableData" border fit size="small" max-height="100%" v-loading="shade">
                    <el-table-column type="index" label="#" min-width="50"></el-table-column>
                    <el-table-column label="商户ID" prop='merchant' min-width='80'></el-table-column>
                    <el-table-column label="商户名称" prop='merchant_name' min-width='150'></el-table-column>
                    <el-table-column label="会员等级" prop='level' min-width='80'></el-table-column>
                    <el-table-column label="创建时间" prop='creationtime' min-width='180'></el-table-column>
                    <el-table-column label="兑换类型" prop='convert_type' min-width='100'>
                        <template slot-scope="scope">{{convert_types[scope.row.convert_type]}}</template>
                    </el-table-column>
                    <el-table-column label="初始有效积分" prop='init_integral' min-width='120'></el-table-column>
                    <el-table-column label="兑换积分" prop='convert_integral' min-width='120'></el-table-column>
                    <el-table-column label="兑换金额(元)" prop='convert_amount' min-width='120'></el-table-column>
                    <el-table-column label="兑换时长(分钟)" prop='convert_time' min-width='120'></el-table-column>
                    <el-table-column label="兑换限制(%)" prop='convert_limit' min-width='120'>
                        <template slot-scope="scope">{{scope.row.convert_limit}}%</template>
                    </el-table-column>
                    <el-table-column label="使用限制" prop='use_limit' min-width='150'>
                        <template slot-scope="scope">{{usetimeOption[scope.row.use_limit]||useOption[scope.row.use_limit]}}</template>
                    </el-table-column>
                    <el-table-column label="可兑换时段" prop='convert_use_limit' min-width='220'></el-table-column>
                    <el-table-column label="启用状态" prop='status' min-width='80'>
                        <template slot-scope="scope">{{statusmap [scope.row.status]}}</template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" min-width="170">
                        <template slot-scope="scope">
                            <el-button plain @click="editInit(scope.row)" size="mini">修改</el-button>
                            <el-button plain v-if="scope.row.status==='U'||scope.row.status==='N'" @click="editStatus(scope.row,'Y')" size="mini">启用</el-button>
                            <el-button plain v-else type="danger" @click="editStatus(scope.row,'N')" size="mini">禁用</el-button>
                            <el-button plain v-if="scope.row.status!=='Y'" type="danger" @click="del(scope.row)" size="mini">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!--分页部分-->
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>

        <el-dialog :title="formData.title" :visible.sync="editShow" custom-class="minwidth">
            <el-form label-width="120px">
                <el-form-item label="商户:">
                    <my-select-merchant v-model="merchantId" size="small" class="widthX250" placeholder="商户名称"></my-select-merchant>
                </el-form-item>
                <el-form-item label="优惠劵类型:" size="small">
                    <el-checkbox v-model="formData.coupon" label="COUPON" disabled>优惠券</el-checkbox>
                    <el-checkbox v-model="formData.integral" label="INTEGRAL" disabled>积分</el-checkbox>
                </el-form-item>
                <el-form-item label="兑换类型:" size="small">
                    <!-- <el-checkbox v-model="formData.amount" label="AMOUNT">兑换金额</el-checkbox> -->
                    <el-checkbox v-model="formData.time" label="TIME">兑换时长</el-checkbox>
                </el-form-item>
                <div class="table-box">
                    <div class="tab-box">
                        <!-- <span v-if="formData.amount" @click="selectType='amount'" :class="{active:selectType==='amount'}">兑换金额</span>
                        <span v-if="formData.amount&&formData.time" class="col"></span> -->
                        <span v-if="formData.time" @click="selectType='time'" class="active">兑换时长</span>
                    </div>
                    <!-- 兑换积分规则 -->
                    <!-- 第二个迭代显示 -->
                    <!-- <el-table v-if="formData.amount&&selectType==='amount'" :data="formData.amountRule" border fit size="small" max-height="100%">
                        <el-table-column label="会员等级" min-width='50'>
                            <template slot-scope="scope">
                                <el-input @blur="intBlur('amountRule',scope.$index,'level',scope.row.level)" v-model="scope.row.level" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="初始有效积分" min-width='80'>
                            <template slot-scope="scope">
                                <el-input @blur="intzeroBlur('amountRule',scope.$index,'init_integral',scope.row.init_integral)" v-model="scope.row.init_integral" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="兑换积分" min-width='80'>
                            <template slot-scope="scope">
                                <el-input @blur="intBlur('amountRule',scope.$index,'convert_integral',scope.row.convert_integral)" v-model="scope.row.convert_integral" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="兑换金额" min-width='80'>
                            <template slot-scope="scope">
                                <el-input @blur="intBlur('amountRule',scope.$index,'convert_amount',scope.row.convert_amount)" v-model="scope.row.convert_amount" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="兑换限制（%）" min-width='80'>
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.convert_limit" size="small" placeholder="兑换限制">
                                    <el-option v-for="(val,key) in 10" :key="key" :label="(val*10)+'%'" :value="(val*10)">
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用限制" min-width='80'>
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.use_limit" size="small" placeholder="使用限制">
                                    <el-option v-for="(val,key) in useOption" :key="key" :label="val" :value="key">
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="可用时间段" min-width='90'>
                            <template slot-scope="scope">
                                <time-input :times="scope.row.convert_use_limit" v-model="scope.row.convert_use_limit" size="small"></time-input>
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" label="操作" min-width="56">
                            <template slot-scope="scope">
                                <el-button plain v-if="(formData.amountRule.length-1)==scope.$index" @click="addLocationRule('amountRule')" size="small">添加</el-button>
                                <el-button plain type="danger" v-else @click="delLocationRule('amountRule',scope.$index)" size="small">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table> -->
                    <!-- 兑换时长规则 -->
                    <el-table v-if="formData.time&&selectType==='time'" :data="formData.timeRule" border fit size="small" max-height="100%">
                        <el-table-column label="会员等级" min-width='50'>
                            <template slot-scope="scope">
                                <el-input :disabled="!addMode" @blur="intBlur('timeRule',scope.$index,'level',scope.row.level)" v-model="scope.row.level" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="初始有效积分" min-width='80'>
                            <template slot-scope="scope">
                                <el-input @blur="intzeroBlur('timeRule',scope.$index,'init_integral',scope.row.init_integral)" v-model="scope.row.init_integral" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="兑换积分" min-width='80'>
                            <template slot-scope="scope">
                                <el-input @blur="intBlur('timeRule',scope.$index,'convert_integral',scope.row.convert_integral)" v-model="scope.row.convert_integral" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="兑换时长（分钟）" min-width='90'>
                            <template slot-scope="scope">
                                <el-input @blur="intBlur('timeRule',scope.$index,'convert_time',scope.row.convert_time)" v-model="scope.row.convert_time" size="small"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="兑换限制（%）" min-width='80'>
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.convert_limit" size="small" placeholder="兑换限制">
                                    <el-option v-for="(val,key) in 10" :key="key" :label="(val*10)+'%'" :value="(val*10)">
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用限制" min-width='80'>
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.use_limit" size="small" :disabled="true" placeholder="使用限制">
                                    <el-option v-for="(val,key) in usetimeOption" :key="key" :label="val" :value="key">
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="可用时间段" min-width='90'>
                            <template slot-scope="scope">
                                <time-input :times="scope.row.convert_use_limit" v-model="scope.row.convert_use_limit" size="small"></time-input>
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" v-if="addMode" label="操作" min-width="50">
                            <template slot-scope="scope">
                                <el-button plain v-if="(formData.timeRule.length-1)==scope.$index" @click="addLocationRule('timeRule')" size="small">添加</el-button>
                                <el-button plain type="danger" v-else @click="delLocationRule('timeRule',scope.$index)" size="small">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="edit">确定</el-button>
                <el-button @click="editShow=false">取消</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import timeInput from '../../component/time-input.vue'
export default {
    data() {
        return {
            useOption: { NA: '不限', INT: '1', FOAT: '0.5' },
            usetimeOption: { NA: '不限', BEGIN: '起始点使用', END: '结束点使用' },
            editShow: false,
            merchantListdata: [],
            addMode: false,
            shade: false,
            search_more: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            selectType: 'time',
            formData: { title: '添加', timeRule: [], amountRule: [], merchant: '', coupon: true, integral: true, amount: false, time: true, convert_type: ['AMOUNT', 'TIME'], },
            editInfo: { num: '', end_time: '', start_time: '', type: '', name: '', merchant_id: '' },
            search: { time_begin: '', time_end: '', station_id: '', merchant_id: '', convert_type: '' },
            tableData: [],
            convert_types: { AMOUNT: '兑换金额', TIME: '兑换时长', ALL: '兑换金额/兑换时长' },
            statusmap: { U: '待启用', Y: '启用', N: '禁用' },
            merchantId: '',
            merchantName: '',
        }
    },
    components: {
        timeInput
    },
    computed: {},
    watch: {},
    created() {
        this.tableData = [{}]
    },
    methods: {
        addInit() {
            this.merchantId = '';
            let amountRule = [];
            let timeRule = [];
            this.formData.amountRule = [];
            this.formData.timeRu = [];
            for (let i = 1; i < 4; i++) {
                let amountItem = { level: i, init_integral: 100, convert_integral: 100, convert_amount: 1, convert_limit: 100, use_limit: "END", convert_use_limit: false, convert_type: 'TIME', coupon_type: 'ALL', }
                let timeItem = Object.assign({}, amountItem);
                timeItem.convert_time = 1;
                timeItem.convert_amount = undefined;
                //第二个迭代启用
                //amountRule.push(amountItem);
                timeRule.push(timeItem);
            }
            this.formData.amountRule = amountRule;
            this.formData.timeRule = timeRule;
            this.formData.integral_rule_id = undefined;
            this.addMode = true;
        },
        editInit(row) {
            let timeItem = Object.assign({}, row);
            this.merchantId = row.merchant;
            this.merchantName = row.merchant_name;
            this.formData = { title: '编辑', timeRule: [], amountRule: [], merchant: '', coupon: true, integral: true, amount: false, time: true, convert_type: row.convert_type, integral_rule_id: row.id, }
            this.formData.timeRule = [timeItem];
            //console.log('row', row);
            this.addMode = false;
            this.editShow = true;
        },
        intBlur(type, index, item, val) {
            if (!(utils.validator.isInteger.test(val) && val > 0)) { this.formData[type][index][item] = ''; return }
            this.formData[type][index][item] = val;
            if (item === 'level') {
                let have = this.formData[type].some((el, index2) => {
                    if (index === index2) {
                        return false
                    } else {
                        return val === el.level.toString()
                    }
                })
                if (have) { this.formData[type][index][item] = ''; return }
            }
        },

        intzeroBlur(type, index, item, val) {
            if (!utils.validator.isInteger.test(val)) { this.formData[type][index][item] = ''; return }
            this.formData[type][index][item] = val;
        },
        //格式化成接口需要的结构格式
        dataFormat() {
            let formData = this.formData;
            let list = [];
            list = list.concat(formData.amountRule, formData.timeRule);
            list = list.map(el => {
                el.merchant = this.merchantId;
                //第二个迭代启用
                // el.coupon_type = formData.coupon_type;
                // el.convert_type = formData.convert_type;
                return el;
            })
            return list;
        },
        delLocationRule(type, index) {
            this.formData[type] = this.formData[type].filter((el, index2) => { if (index !== index2) { return el } });
            // console.log('this.formData', type, this.formData)
        },
        addLocationRule(type) {
            let item = { level: '', init_integral: 100, convert_integral: 100, convert_limit: 100, use_limit: "END", convert_use_limit: false, convert_type: 'TIME', coupon_type: 'ALL', }
            if (type === 'timeRule') {
                item.convert_time = 1;
                item.convert_amount = undefined;
            } else if (type === 'amountRule') {
                item.convert_time = undefined;
                item.convert_amount = 1;
            }
            if (this.formData[type].length > 4) {
                this.$notify({ showClose: true, message: '会员等级最多支持5级', type: 'error' });
            } else {
                this.formData[type].push(item);
            }
        },

        //批量添加/编辑规则
        edit() {
            if (this.shade) { return }
            if (!this.merchantId) { this.$notify({ showClose: true, message: '请选择商户', type: 'error' }); return; }
            let timeRule = this.formData.timeRule;
            let nopass = timeRule.some(el => {
                if (this.addMode) { return el.level == '' || el.init_integral == '' || el.convert_integral == '' || el.convert_time == ''; } else {
                    return el.level == '' || el.init_integral == '' || el.convert_integral == '' || el.convert_time == '';
                }
            })
            if (!this.formData.time) {
                this.$notify({ showClose: true, message: '请选择兑换类型', type: 'error' }); return;
            }
            if (nopass) {
                this.$notify({ showClose: true, message: '请检查表格数据是否有空值', type: 'error' }); return;
            }
            let list = this.dataFormat();
            let postData = '';
            let url = '/integral/integral_rule_add?';
            if (this.addMode) {
                postData = 'json_data=' + JSON.stringify(list);
            } else {
                url = '/integral/integral_rule_update?';
                list[0].integral_rule_id = list[0].id;
                list[0].convert_use_limit = JSON.stringify(list[0].convert_use_limit);
                // console.log('list[0]', list[0])
                postData = utils.setQueryString(list[0]);
            }
            this.shade = true;
            utils.fetch(url, { method: 'post', body: postData }).then(res => {
                setTimeout(() => { this.shade = false; }, 500);
                if (res && res.code === 0) {
                    this.$notify({ message: this.formData.integral_rule_id ? '修改成功' : '添加成功', type: 'success' });
                    this.getData();
                    this.editShow = false;
                } else {
                    this.$notify({ message: res.message, type: 'error' });
                }
            });
        },
        editStatus(row, value) {
            let name = this.statusmap[value];
            this.$confirm(`此操作将${name}规则, 是否继续?`, '提示', {                confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
            }).then(() => {
                const url = '/integral/integral_rule_update?';
                let postData = `integral_rule_id=${row.id}&&status=${value}`;
                utils.fetch(url, { method: 'post', body: postData }).then(res => {
                    if (res && res.code === 0) {
                        this.$message({ type: 'success', message: name + '成功!' });
                        this.getData();
                    } else {
                        this.$notify({ message: res.message, type: 'error' });
                    }
                });
            })
        },
        //删除
        del(row) {
            this.$confirm(`此操作将彻底删除数据且不可恢复, 是否继续?`, '提示', {                confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
            }).then(() => {
                const url = '/integral/integral_rule_del?';
                let postData = `integral_rule_id=${row.id}`;
                utils.fetch(url, { method: 'post', body: postData }).then(res => {
                    if (res && res.code === 0) {
                        this.$message({ type: 'success', message: '删除成功!' });
                        this.getData();
                    } else {
                        this.$notify({ message: res.message, type: 'error' });
                    }
                });
            })
        },
        getData() {
            let search = Object.assign({}, this.search);
            search.page = this.pagination.page;
            search.pagesize = this.pagination.pagesize;
            if (search.time_begin && search.time_end && search.time_begin > search.time_end) {
                this.$notify({ message: '使用结束时间必须大于使用开始时间', type: 'error' }); return;
            }
            let url = "/integral/integral_rule_lists?" + utils.setQueryString(search);
            this.shade = true;
            this.tableData = [];
            utils.fetch(url).then(res => {
                this.shade = false;
                if (res && res.code === 0) {
                    this.tableData = res.content.lists || [];
                    this.pagination.total = res.content.total || 0;
                } else {
                    this.pagination.total = 0;
                    this.$notify({ message: res.message, type: 'error' });
                }
            })
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch() {
            this.pagination.page = 1;
            this.getData();
        },
        btnMore() {
            this.search_more = !this.search_more;
        },
        btnUndo() {
            this.search = { time_begin: '', time_end: '', station_id: '', merchant_id: '', convert_type: '' };
            this.pagination.page = 1;
            this.getData();
        },
    },
    mounted() {
        this.getData();
    },
}
</script>
<style lang="css"  scoped>
.table-box {
    border-top: solid 1px #ccc;
}
.table-box .tab-box {
    padding: 10px 0;
    cursor: pointer;
}
.table-box .col {
    display: inline-block;
    width: 2px;
    height: 10px;
    background-color: #ccc;
}
.table-box .active {
    color: #409eff;
}
</style>