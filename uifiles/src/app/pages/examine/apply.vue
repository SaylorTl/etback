<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.type" size="small" class="cell widthX100" placeholder="类型">
                        <el-option label="月卡" value="mon"></el-option>
                        <el-option label="临时" value="tmp"></el-option>
                    </el-select>
                    <el-select v-model="search.state" size="small" class="cell widthX100" placeholder="状态">
                        <el-option label="待审核" value="0"></el-option>
                        <el-option label="已同意" value="1"></el-option>
                        <el-option label="已拒绝" value="2"></el-option>
                    </el-select>
                    <el-select v-model="search.is_czy_staff" size="small" class="cell widthX100" placeholder="是否员工">
                        <el-option label="是" value="Y"></el-option>
                        <el-option label="否" value="N"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="申请人手机:"><span>{{ props.row.mobile }}</span></el-form-item>
                                <el-form-item label="申请人姓名:"><span>{{ props.row.mobile_name }}</span></el-form-item>
                                <el-form-item label="申请时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item v-if="props.row.type=='mon'" label="月卡类型:">
                                    <span v-if="props.row.cardtype==0">一卡多车</span>
                                    <span v-if="props.row.cardtype==1">字母车</span>
                                    <span v-if="props.row.owner==0">主卡</span>
                                    <span v-if="props.row.owner!=0">副卡</span>
                                </el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifiedtime }}</span></el-form-item>
                                <el-form-item label="车位编码:"><span>{{ props.row.position }}</span></el-form-item>
                                <el-form-item label="楼栋号:"><span>{{ props.row.unit_name }}</span></el-form-item>
                                <el-form-item label="房号:"><span>{{ props.row.room_name }}</span></el-form-item>
                                <el-form-item v-if="props.row.state==2" label="拒绝理由:"><span>{{ props.row.detail }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="45"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="140"></el-table-column>
                    <el-table-column label="大区/事业部" width="220">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="carcode" label="车牌" width="90"></el-table-column>
                    <el-table-column label="类型" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type=='mon' && scope.row.owner==0">主月卡</span>
                            <span v-if="scope.row.type=='mon' && scope.row.owner!=0">副月卡</span>
                            <span v-if="scope.row.type=='tmp'">临时</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.state==0">待审核</span>
                            <span v-if="scope.row.state==1" class="green">已同意</span>
                            <span v-if="scope.row.state==2" class="red">已拒绝</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="月卡使用人手机" min-width="110"></el-table-column>
                    <el-table-column prop="phone_name" label="月卡使用人姓名" min-width="90"></el-table-column>
                    <el-table-column label="是否员工" min-width="65">
                        <template slot-scope="scope">
                            <span>{{scope.row.is_czy_staff==='Y'?'是':'否'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="260">
                        <template slot-scope="scope">
                            <el-button @click="imgshow(scope.row,1)" plain size="mini"><i class="fa fa-picture-o"></i>行驶证</el-button>
                            <el-button @click="imgshow(scope.row,2)" plain size="mini"><i class="fa fa-picture-o"></i>驾驶证</el-button>
                            <el-button v-if="authCheck('月卡申请证件信息')" @click="driverInfoClick(scope.row)" plain size="mini"><i class="fa address-card-o"></i>证件信息</el-button>
                            <el-button v-if="authCheck('同意月卡申请') && scope.row.state==0" @click="agreeClick(scope.$index,scope.row)" plain type="success" size="mini"><i class="fa fa-check"></i>同意</el-button>
                            <el-button v-if="authCheck('拒绝月卡申请') && scope.row.state==0" @click="refuseClick(scope.$index,scope.row)" plain type="danger" size="mini"><i class="fa fa-times"></i>拒绝</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="月卡同意" :visible.sync="agreeWnd.show" width='40%'>
                <el-form :model="agreeWnd.info" label-width="130px">
                    <el-form-item label="月卡规则:">
                        <el-select v-model="agreeWnd.info.rule_id" size="small" class="cell widthX200" placeholder="月卡规则" filterable>
                            <el-option v-for="item in agreeWnd.info.rules" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{item.name}}</span>
                                <span class="ruleN1">¥:{{item.N1}}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="月卡使用人姓名:">
                        <el-input v-model="agreeWnd.info.name" size="small" class="cell widthX200" placeholder="不填不修改"></el-input>
                    </el-form-item>
                    <el-form-item label="月卡使用人手机号:">
                        <el-input v-model="agreeWnd.info.phone" size="small" class="cell widthX200" placeholder="不填不修改"></el-input>
                    </el-form-item>
                    <el-form-item label="开始时间:">
                        <el-date-picker v-model="agreeWnd.info.begin_time" size="small" class="cell widthX200" type="date" placeholder="开始日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="agreeOne" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="remoteInfo.title" width='80%' :visible.sync="remoteInfo.show">
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        <span>{{remoteInfo.info.result}}</span>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="driverInfo.title" width='80%' :visible.sync="driverInfo.show">
                <div class="driver_info_box">
                    <div class="driver_info_show">
                        <h3>行驶证信息</h3>
                        <el-table :data="driverInfo.img1" style="width: 90%" border>
                            <el-table-column prop="item" label="名称" width="90">
                            </el-table-column>
                            <el-table-column prop="itemstring" label="值" min-width="180">
                            </el-table-column>
                            <el-table-column label="置信度">
                                <template slot-scope="scope">
                                    <span>{{scope.row.itemconf.slice(0, 4)}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div class="driver_info_show">
                        <h3>驾驶证信息</h3>
                        <el-table :data="driverInfo.img2" style="width: 90%" border>
                            <el-table-column prop="item" label="名称" width="90">
                            </el-table-column>
                            <el-table-column prop="itemstring" label="值" min-width="180">
                            </el-table-column>
                            <el-table-column label="置信度">
                                <template slot-scope="scope">
                                    <span>{{scope.row.itemconf.slice(0, 4)}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-dialog>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <!-- <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists> -->
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import previewImg from '../../component/previewImg/index.vue';
export default {
    data: function() {
        return {
            shade: false,
            search: { station_id: '', car_id: '', state: '', type: '', dept: '', is_czy_staff: '' },
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            images: { show: false, lists: [] },
            remoteInfo: { title: '', show: false, info: {} },
            agreeWnd: { show: false, owner: 0, info: { rules: [], id: '', rule_id: '', name: '', phone: '', begin_time: '' } },
            driverInfo: { img1: [], img2: [], title: '', show: false }
        }
    },
    components: {
        "preview-img": previewImg
    },
    methods: {
        driverInfoClick(row) {
            let driver1 = row.img1_info; //对应行驶证
            let driver2 = row.img2_info; //对应驾驶证
            this.driverInfo.img1 = this._infoProcess(driver1);
            this.driverInfo.img2 = this._infoProcess(driver2);
            this.driverInfo.show = true;
            this.driverInfo.title = '证件信息';
        },
        _infoProcess(arr) {
            if (!arr || Array.isArray(arr) && arr.length === 0) return [];
            let newArr = arr.map((i) => {
                return { item: i.item, itemconf: i.itemconf + '', itemstring: i.itemstring }
            })
            return newArr;
        },
        getData: function() {
            var vm = this;
            vm.shade = true;
            const {queryFlag} = this.$route.params;
            if (queryFlag && queryFlag === 'fastQuery') {
                this.search = {};
            }
            const {dept, state, car_id} = utils.dealRouteParams(this);
            if (state && this.search.state == '') { this.search.state = state }
            if (dept && this.search.dept == '') { this.search.dept = dept }
            var url = '/examine/applylists?page=' + this.pagination.page + '&pagesize=' + this.pagination.pagesize;
            if (this.search.station_id) url += "&station_id=" + vm.search.station_id;
            if (this.search.car_id) url += "&car_id=" + this.search.car_id;
            if (this.search.state != '') url += "&state=" + this.search.state;
            if (this.search.type) url += "&type=" + this.search.type;
            if (this.search.dept) url += "&dept=" + this.search.dept;
            if (this.search.is_czy_staff) url += "&is_czy_staff=" + this.search.is_czy_staff;
            utils.fetch(url).then((json) => {
                this.clearRouteParams();
                this.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                this.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                this.shade = false;
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
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.search = { station_id: '', car_id: '', state: '', type: '', dept: '' };
            this.clearRouteParams();
            this.getData();
        },
        imgshow: function(row, type) {
            if (type == 1) {
                this.images = { show: true, lists: [{ title: '行驶证', href: row.img1 }] };
            } else if (type == 2) {
                this.images = { show: true, lists: [{ title: '驾驶证', href: row.img2 }] };
            }
        },
        imgClose: function() {
            this.images = { show: false, lists: [] };
        },
        agreeClick: function(index, row) {
            var vm = this,
                rulelist = [];
            vm.agreeWnd = { show: false, station: row.station, car: row.car, owner: row.owner, info: { rules: [], id: row.id, rule_id: '', name: '', phone: '', begin_time: '' } };
            if (row.owner == 0) {
                vm.agreeWnd.show = true;
                utils.getRulesByStationID(row.station).then(function(arr) {
                    if (Array.isArray(arr) && arr.length > 0) {
                        if (row.is_czy_staff === 'Y') {
                            //员工卡不做选择限制，其他不允许选择规则名称中含有“员工”字样的规则
                            rulelist = arr.filter(item => {
                                return item.status === 'Y' && item.N1 > 3
                            });
                        } else if (row.is_czy_staff === 'N') {
                            //筛选出包含“员工”字样的规则
                            rulelist = arr.filter(item => {
                                return item.name.indexOf('员工') === -1 && item.status === 'Y' && item.N1 > 3
                            })
                        }
                    }
                    vm.agreeWnd.info.rules = rulelist.filter(item => item.status === 'Y')
                })
            } else {
                this.$msgbox({
                    title: '提示',
                    message: '您确定要同意 “' + row.station_name + "  " + row.carcode + ' 成为副卡”',
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    beforeClose: function(action, instance, done) {
                        if (action === 'confirm') {
                            instance.confirmButtonLoading = true;
                            instance.confirmButtonText = '正在同意...';
                            vm.agreeOne();
                            instance.confirmButtonLoading = false;
                            done();
                        } else {
                            done();
                        }
                    }
                });
            }
        },
        agreeOne: function() {
            var vm = this;
            var info = vm.agreeWnd.info;
            var url = "/examine/applyagree";
            var data = "";
            if (vm.agreeWnd.owner == 0) {
                if (info.rule_id == '') {
                    vm.$message({ showClose: true, message: '请选择月卡规则', type: 'error' });
                    return;
                }
                if (info.begin_time == '') {
                    vm.$message({ showClose: true, message: '请选择开始时间', type: 'error' });
                    return;
                }
                info.begin_time = typeof(info.begin_time) != 'string' ? utils.timeParse(info.begin_time, '-', false) : info.begin_time;
                data = "id=" + info.id + "&owner=0&rule_id=" + info.rule_id + "&begin_time=" + info.begin_time + "&name=" + info.name + "&phone=" + info.phone;
            } else {
                data = "id=" + info.id + "&owner=" + vm.agreeWnd.owner;
            }
            utils.fetch(url, { method: 'POST', body: data }).then(function(json) {
                if (!json.code) {
                    vm.oneCommond({ station: vm.agreeWnd.station, car: vm.agreeWnd.car, rule: vm.agreeWnd.info.rule_id }, 'add').then(function(result) {
                        if (result) {
                            vm.agreeWnd.show = false;
                            vm.remoteInfo.show = true;
                            vm.getData();
                        }
                    });
                } else {
                    vm.$message({ showClose: true, message: json.message, type: 'error' });
                    return;
                }

            });
        },
        refuseClick: function(index, row) {
            var vm = this;
            this.$prompt('请输入拒绝理由', '提示', { confirmButtonText: '确定', cancelButtonText: '取消' }).then(function(obj) {
                utils.fetch('/examine/applyrefuse?id=' + row.id + '&detail=' + obj.value).then(function(json) {
                    if (typeof(json) != 'undefined' && json.code != 0) {
                        vm.$message({ showClose: true, message: json.message, type: 'error' });
                    } else {
                        vm.getData();
                    }
                });
            }, function(obj) {
                console.log(obj);
            })
        },
        oneCommond: function(row, cmd) {
            var vm = this;
            vm.shade = true;
            vm.remoteInfo = { show: false, title: '', info: {} };
            return utils.fetch("/contract/commond?cmd=" + cmd + "&station_id=" + row.station + "&car_id=" + row.car + "&rule_id=" + row.rule).then(function(json) {
                if (typeof(json) != 'undefined') {
                    if (json.code == 0) {
                        vm.remoteInfo.info = json.content.info;
                        vm.remoteInfo.title = json.content.title;
                        return true;
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: 'error' });
                    }
                }
                vm.shade = false;
                return false;
            });
        },
        authCheck: function(tag) {
            return utils.authCheck(this, tag);
        },
        clearRouteParams(){
            let params = this.$route.params;
            for (let i in params) {
                params[i] = "";
            }   
        }
    },
    created() {
        utils.getTingYunScript();
        this.getData();
    },
    activated(){
        if(Object.keys(this.$route.params).length > 0){
            this.getData();
        }
    },
    deactivated() {
        
    }
}
</script>