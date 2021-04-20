<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150" placeholder="停车场" clearable></my-select-station>
                    <el-input v-model="search.extcode" size="small" class="cell widthX150" placeholder="硬件编码"></el-input>
                    <el-input v-model="search.etcode" size="small" class="cell widthX150" placeholder="易停编码"></el-input>
                    <el-input v-model="search.position" size="small" class="cell widthX150" placeholder="车位编码"></el-input>
                    <el-button @click="btnMore" class="cell" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" class="cell" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" class="cell" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" class="cell" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="addPlatformClick" class="cell" size="small"><i class="fa fa-plus"></i>添加平台运营商</el-button>
                    <el-button @click="getData" class="cell" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                <el-input v-model="search.name" size="small" class="cell widthX120" placeholder="设备名称"></el-input>
                <my-select-vendor v-model="search.vendor_id" size="small" class="cell widthX150" placeholder="供应商"></my-select-vendor>
                <el-select v-model="search.status" placeholder="状态" size="small" class="widthX120">
                    <el-option v-for="(val,key) in statusMap" :key="key" :label="val" :value="key"></el-option>
                </el-select>
                <el-input v-model="search.ble" size="small" class="cell widthX150" placeholder="蓝牙锁广播编码"></el-input>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column min-width="50" type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" label-width='150' inline class="demo-table-expand parkinglock_devicemanage">
                                <el-form-item label="硬件编码："><span>{{props.row.extcode}}</span></el-form-item>
                                <el-form-item label="厂商："><span>{{props.row.vendor_name}}</span></el-form-item>
                                <el-form-item label="创建时间："><span>{{props.row.creationtime}}</span></el-form-item>
                                <el-form-item label="设备名称:"><span>{{props.row.name}}</span></el-form-item>
                                <el-form-item label="产权人:"><span>{{props.row.owners}}</span></el-form-item>
                                <el-form-item label="蓝牙锁广播编码："><span>{{props.row.ble}}</span></el-form-item>
                                <el-form-item label="车位锁价格："><span>{{props.row.price}}</span></el-form-item>
                                <el-form-item label="平台运营商："><span>{{props.row.platforms}}</span></el-form-item>
                                <el-form-item label="二维码：">
                                    <qrcode :value="'https://app.aparcar.cn/l/'+props.row.etcode"></qrcode>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" min-width="60"></el-table-column>
                    <el-table-column label="大区/事业部" min-width="200">
                        <template slot-scope="scope">{{scope.row.area_name}}/{{scope.row.dept_name}}</template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="position" label="车位" min-width="70"></el-table-column>
                    <el-table-column prop="etcode" label="易停编码" min-width="100"></el-table-column>
                    <el-table-column prop="vendor_name" label="厂商" min-width="80"></el-table-column>
                    <el-table-column label="状态" min-width="60">
                        <template slot-scope="scope">{{statusMap[scope.row.status]||'未知'}}</template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="380">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini">编辑</el-button>
                            <el-button @click="downLock(scope.row)" :disabled="(scope.row.status == 'unknown' ? false : !!(scope.row.status == 'open'))||scope.row.lockflag" :type="scope.row.status=='open'? 'info':'success'" size="mini">降下</el-button>
                            <el-button @click="upLock(scope.row)" :disabled="(scope.row.status == 'unknown' ? false : !!(scope.row.status == 'close'))||scope.row.lockflag" :type="scope.row.status=='close'? 'info':'success'" size="mini">升起</el-button>
                            <el-button @click="authorize(scope.row)" plain size="mini">授权</el-button>
                            <el-button @click="sync(scope.$index,scope.row)" plain size="mini">同步状态</el-button>
                            <el-button @click="dailyCase(scope.row)" plain size="mini">case日志</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- 添加 编辑E -->
            <!-- 添加 编辑S -->
            <el-dialog :title="updateTitle" :visible.sync="updateVisible" width='50%'>
                <el-form label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model="addData.station" size="small" placeholder="停车场" width='100%'></my-select-station>
                    </el-form-item>
                    <el-form-item label="车位锁名称:">
                        <el-input placeholder="车位锁名称" size="small" v-model="addData.name" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="厂商:">
                        <my-select-vendor v-model="addData.vendor" size="small" class="cell widthP100" placeholder="供应商"></my-select-vendor>
                    </el-form-item>
                    <el-form-item label="硬件编码:">
                        <el-input v-model="addData.extcode" size="small" placeholder="硬件编码"></el-input>
                    </el-form-item>
                    <el-form-item label="易停编码:">
                        <el-input size="small" v-model="addData.etcode" placeholder="易停编码"></el-input>
                    </el-form-item>
                    <el-form-item label="蓝牙锁广播编码:">
                        <el-input size="small" v-model="addData.ble" placeholder="蓝牙锁广播编码"></el-input>
                    </el-form-item>
                    <el-form-item label="车位:">
                        <el-input size="small" v-model="addData.position" placeholder="车位"></el-input>
                    </el-form-item>
                    <el-form-item label="车位锁价格:">
                        <el-input size="small" v-model="addData.price" placeholder="车位锁价格"></el-input>
                    </el-form-item>
                    <el-form-item label="平台运营商:">
                        <!-- <el-input size="small" v-model="addData.platform_ids" placeholder="平台运营商"></el-input> -->
                        <el-checkbox-group v-model="addData.platform_ids">
                            <el-checkbox v-for="item in platforms" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="车位锁类型:">
                        <el-radio v-model="addData.lock_type" label="1" border>普通车位锁</el-radio>
                        <el-radio v-model="addData.lock_type" label="2" border>乐开车位锁</el-radio>
                        <el-radio v-model="addData.lock_type" label="3" border>彩之云乐开车位锁 </el-radio>
                    </el-form-item>
                    <div v-show="addData.lock_type!='1'" class="">
                        <el-form-item label="MAC:">
                            <el-input size="small" v-model="addData.mac" placeholder="MAC"></el-input>
                        </el-form-item>
                        <el-form-item label="协议版本:">
                            <el-input size="small" v-model="addData.protocol_version" placeholder="协议版本"></el-input>
                        </el-form-item>
                        <el-form-item label="密码编号:">
                            <el-input size="small" v-model="addData.cipher_id" placeholder="密码编号"></el-input>
                        </el-form-item>
                        <el-form-item label="型号:">
                            <el-input size="small" v-model="addData.model" placeholder="型号"></el-input>
                        </el-form-item>
                    </div>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 添加 编辑E -->
            <!-- 授权 S -->
            <el-dialog :title="updateTitle" :visible.sync="authVisible">
                <el-form label-width="120px">
                    <el-form-item label="手机号:">
                        <el-input width='193px' size="small" v-model="authData.mobile" trigger-on-focus=false placeholder="手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="区域:" v-show="authData.client_type=='admin'">
                        <el-input type="textarea" v-model="stationStr" :rows="2" @focus="showTree" readonly placeholder="车场列表"></el-input>
                        <my-tree-department :show="stations.show" v-model="stations.data" @clear="clearTree" @close="closeTree" :level="3"></my-tree-department>
                    </el-form-item>
                    <el-form-item label="权限类型:">
                        <el-select v-model="authData.client_type" placeholder="请选择" size="small" width='100%'>
                            <el-option label="管理员" value="admin"></el-option>
                            <el-option label="共享人" value="share"></el-option>
                            <el-option label="产权人" value="owner"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态:">
                        <el-radio-group v-model="authData.radio">
                            <el-radio label="Y">启用状态</el-radio>
                            <el-radio label="N">禁止状态</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="addAuth" type="primary" :loading='btnloading' size="small">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 授权 E -->
            <!-- case日志 S -->
            <el-dialog :title="opHistory.title" :visible.sync="opHistory.show" width='80%'>
                <div class="tip" v-show='hasCase'><i class="fa fa-frown-o"></i>当前case记录为空</div>
                <div class="vertical-container light-timeline" v-loading="opHistory.loading">
                    <template v-for='(item,index) in opHistory.data'>
                        <div class="vertical-timeline-block" :key="index">
                            <div :class="['vertical-timeline-icon', bgStyle[index%(bgStyle.length)]+'-bg']">
                                <div :class="['timeline-calendar', bgStyle[index%(bgStyle.length)]+'-bg']"><i class="fa fa-calendar"></i></div>
                                <div class="time-text">{{item.createTime}}</div>
                            </div>
                            <div class="vertical-timeline-content">
                                <div class="timeline-head">
                                    <div class="head-wrap">
                                        <ul class="head-info" v-html='headInfo(item.lists,index)'></ul>
                                        <el-button plain size="mini" @click='showContent(item)'> 查看详情</el-button>
                                    </div>
                                    <div class='timeline-contrast' v-html="changeContent(item.lists)"></div>
                                </div>
                                <div class="timeline-table-wrap" v-html='opDetail(item.lists)' v-show='item.show'>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <my-paginator @change='setDialogPageData($event)' :pagination='dialogPagination'></my-paginator>
            </el-dialog>
            <!-- case日志 E -->
            <!-- 授权 S -->
            <el-dialog :title="pfdata.title" :visible.sync="pfdata.show" width='30%'>
                <el-form label-width="120px">
                    <el-form-item label="平台运营商:">
                        <el-input size="small" v-model="pfdata.name" placeholder="平台运营商"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitPlatformClick" type="primary" size="small">添加</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 授权 E -->
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function () {
        return {
            statusMap: { "open": "降下", "close": '升起', "unknown": '未知', "broken": '断开链接' },
            hasCase: false,
            opHistory: { title: '', show: false, loading: false, data: [] },
            search: { vendor_id: '', extcode: '', lock_id: '', name: '', status: '', station: '', dept: '', ble: '', position: '' },
            shade: false,
            tableData: [],
            updateTitle: '',
            updateVisible: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            addData: { name: '', vendor: '', extcode: '', lock_id: '', station: "", etcode: '', ble: '', position: '', price: '', platform_ids: '',lock_type:'1',mac:'',cipher_id:'',protocol_version:'' },
            lockControl: { direction: '', user_type: '', user_key: '', code: '' },//开关状态，用户类型，用户类型对应的值，易停编码
            authVisible: false,
            authData: { mobile: '', etcode: '', client_type: '', lock_id: '', radio: "Y" },
            currentPage: 1,
            historyTitle: '车位锁case日志',
            dialogPagination: { page: 1, pagesize: 20, total: 0, showTotal: true },//日志分页
            search_more: false,
            platforms: [],
            pfdata: { title: '', show: false, name: '' },
            stations: { show: false, data: [] },
            btnloading: false,
            lockVisible: false,
            lockItem: {},
            submiting:false

        }
    },
    mounted: function () {
        let vm = this;
        var data = utils.getCache();
        var obj = data == '' ? {} : JSON.parse(data);
        if (obj.tableData && obj.tableData.length > 0) {
            utils.getCacheItem(vm, obj);
        } else {
            vm.getData();
        }
    },
    watch: {
        filterText: function (val) {
            this.$refs.tree.filter(val);
        }
    },
    computed: {
        stationStr() {
            return this.setStationVal('name')
        },
        stationIds() {
            return this.setStationVal('value')
        }
    },
    methods: {
        setStationVal(type) {
            let sData = this.stations.data;
            let stationLists = sData.filter(item => item.level === 3); //id带前缀
            if (type === 'value') {
                let ids = stationLists.map(item => {
                    return (item.value + '').replace(utils.config.ID_PREFIX, '') - 0 //id去前缀
                });
                return ids.join(',');
            } else {
                return stationLists.map(item => item[type]).join(',');
            }
        },
        showTree() {
            this.stations.show = true;
        },
        closeTree() {
            this.stations.show = false;
        },
        clearTree() {
            this.stations.data = [];
        },
        addPlatformClick() {
            var vm = this;
            vm.pfdata = { title: '添加平台运营商', show: true, name: '' }
        },
        submitPlatformClick() {
            let vm = this;
            let url = '/lock/platformAdd';
            if (vm.pfdata.name === '') {
                vm.$message({ showClose: true, message: '平台运营商名称不能为空', type: 'error' });
                return
            }
            let data = {
                name: vm.pfdata.name
            };
            utils.fetch(url, { method: 'post', body: data }).then(function (json) {
                if (json && json.code == 0) {
                    vm.pfdata.show = false
                    vm.getData();
                } else {
                    m.$message({ showClose: true, message: json.message, type: 'error' });
                }
            })
        },
        getPlatforms: function () {
            var vm = this;
            return utils.fetch('/lock/platformLists?page=1&pagesize=1000').then(function (res) {
                if (res != undefined) {
                    if (res.code == 0) {
                        vm.platforms = res.content.lists;
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        btnMore: function () {
            this.search_more = !this.search_more;
        },
        getData: function () {
            var vm = this;
            vm.shade = true;
            var url = "/lock/lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            let { station: station_id, ...others } = vm.search;
            let smap = { station_id, ...others };
            var querystr = utils.setQueryString(smap);
            url += querystr ? '&' + querystr : '';
            utils.fetch(url).then(function (res) {
                vm.shade = false;
                if (res && res.code == 0 && res.content) {
                    let lists = res.content.lists || [];
                    vm.tableData = lists.map(item => { item.lockflag = false; return item });
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                } else {
                    vm.tableData = [];
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
            })
        },
        addClick: function () {
            var vm = this;
            vm.getPlatforms();
            vm.updateVisible = true;
            vm.updateTitle = "添加车位锁信息"
            vm.addData = {                name: '', vendor: '', extcode: '', lock_id: '',lock_type:'1',mac:'',cipher_id:'',protocol_version:'',model:'',
                station: "", etcode: '', position: '', ble: '', price: '', platform_ids: []            }
        },
        updateClick: function (row) {
            var vm = this;
            let item={...row};
            vm.updateVisible = true;
            vm.getPlatforms();
            vm.updateTitle = "编辑车位锁信息";
            if(item.attach){
                item.attach=item.attach;
                item.mac=item.attach.mac;
                item.protocol_version=item.attach.protocol_version;
                item.cipher_id=item.attach.cipher_id;
                item.model=item.attach.model;
            }
            vm.addData = {                name: item.name, vendor: item.vendor, extcode: item.extcode, ble: item.ble, lock_id: item.id, station: item.station, position: item.position,lock_type:item.lock_type.toString(),mac:item.mac,cipher_id:item.cipher_id,protocol_version:item.protocol_version,model:item.model,
                etcode: item.etcode,
                price: item.price,
                platform_ids: item.platform_ids            };
        },
        editSubmit: function () {
            var vm = this;
            var data = vm.addData;
            var validatemap = { 'station': '停车场', 'name': '车位锁名称', 'vendor': '厂商', 'extcode': '硬件编码', 'etcode': '易停编码', 'ble': '蓝牙锁广播编码', 'position': '车位','lock_type':'车位锁类型' }
            if(data.lock_type!='1'){
                validatemap.mac="MAC";
                validatemap.cipher_id="密码编号";
                validatemap.protocol_version="协议版本";
                validatemap.model="型号";
            }

            for (var key in validatemap) {
                if (data[key] === '') {
                    vm.$message({ showClose: true, message: validatemap[key] + '不能为空', type: 'error' });
                    return
                }
            }

            var url = data.lock_id !== '' ? "/lock/update" : "/lock/add";
            var addData = {
                station_id: data.station,
                name: data.name,//车位锁名称
                vendor_id: data.vendor,//厂商ID
                extcode: data.extcode,//小马内部编码
                ble: data.ble,
                etcode: data.etcode,//易停编码
                position: data.position,
                price: data.price,
                lock_type:data.lock_type,

                platform_ids: data.platform_ids.join(','),
            }
            if(data.lock_type!='1'){
                addData.mac=data.mac;
                addData.protocol_version=data.protocol_version;
                addData.cipher_id=data.cipher_id;
                addData.model=data.model;
            }
            if (data.lock_id !== '') { addData.lock_id = data.lock_id };
            utils.fetch(url, { method: 'post', body: addData }).then(function (res) {
                if (typeof (res) != 'undefined') {
                    if (res.code == 0) {
                        vm.updateVisible = false;
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            });
        },
        authorize: function (row) {
            var vm = this;
            vm.authVisible = true;
            vm.updateTitle = "车位锁授权";
            vm.btnloading = false;
            vm.authData = { mobile: '', etcode: '', client_type: 'owner', lock_id: row.id, radio: 'Y' };
        },
        addAuth: function () {
            var vm = this;
            var addData = {
                mobile: vm.authData.mobile,
                client_type: vm.authData.client_type,
                disable: vm.authData.radio
            }
            var url = "/lock/extraAdd";
            if (vm.authData.client_type == 'admin') {
                addData.lock_id = vm.stationIds
            } else {
                addData.lock_id = vm.authData.lock_id
            }
            if (vm.authData.mobile === '') {
                vm.$message({ showClose: true, message: '手机号必填', type: 'error' }); return
            }
            vm.btnloading = true;
            utils.fetch(url, { method: 'post', body: addData }).then(function (res) {
                if (typeof (res) != 'undefined') {
                    if (res.code == 0) {
                        vm.authVisible = false;
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                    vm.btnloading = false;
                }
            });
        },
        //升起，关锁
        upLock: function (row) {
            var vm = this;
            vm.lockControl = {
                direction: 'close',
                user_type: 3,
                user_key: 'lock_monitor',
                code: row.etcode
            }
            row.lockflag = true;
            utils.fetch('/lock/cmd', { method: 'post', body: vm.lockControl }).then(function (json) {
                if (json.code == 0) {
                    vm.success('关锁')
                    vm.getData();
                } else {
                    vm.fail('关锁', json.message.message)
                }
                row.lockflag = false;
            })
        },
        //降落，开锁
        downLock: function (row) {
            var vm = this;
            vm.lockControl = {
                direction: 'open',
                user_type: 3,
                user_key: 'lock_monitor',
                code: row.etcode
            }
            row.lockflag = true;
            utils.fetch('/lock/cmd', { method: 'post', body: vm.lockControl }).then(function (json) {
                if (json.code == 0) {
                    vm.success('开锁')
                    vm.getData();
                } else {
                    vm.fail('开锁', json.message.message)
                }
                row.lockflag = false;
            })
        },
        success(a) {
            this.$notify.success({
                title: '成功',
                message: a + '成功，等待刷新',
                offset: 40,
                duration: 2000
            });
        },
        successStatus(a) {
            this.$notify.success({
                title: '成功',
                message: a + '成功',
                offset: 40,
                duration: 2000
            });
        },
        fail(a, res) {
            this.$notify.error({
                title: '失败',
                message: res,
                offset: 40,
                duration: 2000
            });
        },
        setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function () {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function () {
            this.search = { vendor_id: '', extcode: '', lock_id: '', name: '', status: '', station: '', dept: '', ble: '', position: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },

        sync: function (index, row) {
            var vm = this;
            vm.lockControl = {
                direction: 'status',
                user_type: 3,
                user_key: 'lock_monitor',
                code: row.etcode
            }
            utils.fetch('/lock/cmd', { method: 'post', body: vm.lockControl }).then(function (json) {
                if (json.code == 0) {
                    vm.successStatus('同步');
                    setTimeout(function () {
                        vm.getData();
                    }, 3000)
                } else {
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
            })
        },
        //日志方法；
        headInfo: function (r, index) {
            var vm = this;
            var cls = vm.bgStyle[index % (vm.bgStyle.length)];
            return r ? "<li><i class='fa fa-user-o " + cls + "'></i>操作人:" + r.username + "</li>" +
                "<li><i class='fa fa-wrench " + cls + "'></i>操作类型:" + r.type + "</li>" +
                "<li><i class='fa fa-spinner " + cls + "'></i>操作结果:" + r.result + "</li>"
                : "";
        },
        opDetail: function (r) {
            var map = { "apply": "apply", "created": "已创建", "working": "使用中", "locked": "已禁用", "expired": "已过期", "delayed": "delayed", "canceled": "已删除" };
            if (r && r.content) {
                var app = r.content.visiable == 'Y' ? '是' : '否';
                var tableObj = { '子车牌': r.content.plates, '月卡规则': r.content.rule_name, '手机号': r.content.phone, '开始时间': r.content.time_begin, '结束时间': r.content.time_end, '车位': r.content.position, '房号': r.content.room, '楼栋号': r.content.unit, '是否允许app续费': app, '状态': map[r.content.status], '锁车状态': r.content.lockStatus, 车辆当前状态: r.content.nolock }
                var str = utils.tableTemplate(tableObj, 5);
                return str;
            } else {
                return '查询不到内容'
            }
        },
        changeContent: function (obj) {
            var result = '', vm = this;
            if (!obj || !obj.change_data || vm._isEmptyArray(obj.change_data)) {
                return '';
            } else {
                var newData = obj.change_data.new_data;
                var oldData = obj.change_data.old_data;
                //新数据
                var newStr = vm.getConcatStr(newData);
                var oldStr = vm.getConcatStr(oldData);
                if (newStr != '') {
                    result += '<div><span class="c_green">新数据</span>:' + newStr + '</div>'
                };
                if (oldStr != '') {
                    result += '<div><span class="c_red">旧数据</span>:' + oldStr + '</div>';
                }
                return result;
            }
        },
        showContent: function (item) {
            item.show = !item.show
        },
        dailyCase: function (row) {
            var vm = this;
            // vm.opHistory.title='月卡操作历史记录';
            vm.dialogPagination.page = 1;
            vm.dialogPagination.pagesize = 20;
            vm.opHistory.show = true;
            vm.activeId = row.id;
            vm.getDialogData();
        },
        getDialogData: function () {
            var vm = this;
            vm.hasCase = false;
            vm.opHistory.loading = true;
            var url = '/lock/operateHistory?page=' + vm.dialogPagination.page + "&pagesize=" + vm.dialogPagination.pagesize + "&lock_id=" + vm.activeId;
            utils.fetch(url).then(function (res) {
                vm.opHistory.data = (typeof (res) != 'undefined' && res.code == 0 && res.content != '') ? res.content.data.map(function (i) {
                    return Object.defineProperty(i, 'show', { //todo
                        value: false,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }) : [];
                vm.dialogPagination.total = (typeof (res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                vm.opHistory.loading = false;
                if (vm.opHistory.data.length == 0) { vm.hasCase = true }
            })
        }
    }
}
</script>
