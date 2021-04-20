
<template>
    <div id='box' class="menu-hide">
        <div class="callinfo">
            <h2><i class="fa fa-user fa-fw"></i>智能客服</h2>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX150"  placeholder="手机号" clearable></el-input>
                    <my-select-plate v-model="search.car_id" size="small" class="cell widthX150"  placeholder="输入车牌" v-if='!hasPlate' @input='changeCarid'></my-select-plate>
                    <el-select v-model="search.car_id" size="small" class="cell widthX150" v-if='hasPlate'  placeholder="车牌列表" @change='changeCarid'>
                        <el-option v-for="(item,index) in plates" :key="index" :label="item.plate" :value="item.car_id"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <!-- <div class="tip">单独搜索车场,只能获取预出场信息</div> -->
            <el-collapse v-model="activeNames" @change="handleChange" class='collapseStyle'>
                <el-collapse-item title="用户当前信息" name="1">
                    <el-form label-position="left" inline class="demo-table-expand">
                        <el-form-item label="当前车牌:">
                            <span>{{carData.plate}}</span>
                        </el-form-item>
                        <el-form-item label="当前车场:">
                            <span>{{carData.station_name}}</span>
                        </el-form-item>
                        <el-form-item label="月卡类型:">
                            <span>{{month[carData.isMonth]}}</span>
                        </el-form-item>
                        <el-form-item label="月卡信息:" v-if='carData.isMonth==="Y"'>
                            <span>{{carData.rule_name+'/'+carData.rule_N1}}</span>
                        </el-form-item>
                        <el-form-item label="进场时间:">
                            <span>{{carData.arrival}}</span>
                        </el-form-item>
                        <el-form-item label="数据对比:">
                            <el-button :disabled='showdiff' @click="compare" size="small"><i class="fa fa-file-text"></i>对比</el-button>
                        </el-form-item>
                        <el-form-item label="最近进场图片:" v-show='carData.car_id'>
                            <el-button @click="imgshow" size="small"><i class="fa fa-file-text"></i>查看</el-button>
                        </el-form-item>
                    </el-form>
                </el-collapse-item>
                <el-collapse-item title="最近半年缴费记录" name="2">
                    <div class="payHistory">
                        <el-table v-loading="recordShade" element-loading-text="拼命加载中"  :data="recordData" border class='mb10'>
                            <el-table-column prop="station_name" label="停车场"></el-table-column>
                            <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                            <el-table-column label="收费规则" min-width="140">
                                <template slot-scope='props'>
                                    <span>{{month[props.row.month]}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="time_in" label="开始时间" min-width="150"></el-table-column>
                            <el-table-column prop="time_out" label="结束时间" min-width="150"></el-table-column>
                        </el-table>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="当前车场预出场列表" name="3">
                    <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                        <el-table-column prop="station_name" label="停车场"></el-table-column>
                        <el-table-column prop="vendor_name" label="厂商" min-width="130"></el-table-column>
                        <el-table-column prop="name" label="道闸" min-width="160"></el-table-column>
                        <el-table-column prop="plate" label="车牌号码" min-width="90"></el-table-column>
                        <el-table-column prop="departure_time" label="出场时间" min-width="180"></el-table-column>
                        <el-table-column label="操作" min-width="120">
                            <template slot-scope="scope">
                                <el-button v-if="scope.row.type!==2" @click="operateHandler(scope.row)" size="small">抬杆</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-collapse-item>
            </el-collapse>
            <el-dialog :title="localData.title" :visible.sync="localData.show" width='70%'>
                <h3>易停数据</h3>
                <el-table :data="localData.dataET" border fit style="width:100%">
                    <el-table-column prop="plate" label="车牌" width="120"></el-table-column>
                    <el-table-column prop="time_begin" label="申请时间" min-width="120"></el-table-column>
                    <el-table-column prop="time_end" label="到期时间" min-width="120"></el-table-column>
                    <el-table-column prop="rule_N1" label="月卡价格" min-width="80"></el-table-column>
                    <el-table-column prop="rule_name" label="月卡规则" min-width="120"></el-table-column>
                    <el-table-column prop="status" label="月卡状态" min-width="120"></el-table-column>
                </el-table>
                <h3>厂家数据</h3>
                <el-table v-loading="localData.shadeLoc" element-loading-text="拼命加载中" :data="localData.dataLoc" border fit style="width:100%">
                    <el-table-column prop="plate" label="车牌" width="120"></el-table-column>
                    <el-table-column prop="begin" label="申请时间" min-width="120"></el-table-column>
                    <el-table-column prop="end" label="到期时间" min-width="120"></el-table-column>
                    <el-table-column prop="new_money" label="月卡价格" min-width="80"></el-table-column>
                    <el-table-column prop="rule" label="月卡规则" min-width="120"></el-table-column>
                </el-table>
            </el-dialog>
            <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show">
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        {{remoteInfo.info.result||''}}
                    </el-form-item>
                </el-form>
            </el-dialog>
            <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists>
        </div>
    </div>
</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data: function() {
            const url = {
                parkedwhere: '/car/parkedwhere?car_id=', //plate= ''; car_id= '';均可
                lists: '/contract/lists',
                devices: '/device/lists',
                //user:'/car/show',//暂没用上
                //client:'/client/show',//暂没用上
                history: '/inout/outHistory',
            };
            let month = { Y: '月卡', N: '临停', U: '未知' };
            let status = { "apply": "apply", "created": "已创建", "working": "使用中", "locked": "已禁用", "delayed": "delayed", "canceled": "已取消", 'deleted': '已删除' };
            return {
                url,
                month,
                status,
                hasPlate: false,
                activeNames: ['1'],
                tableData: [],
                shade: false,
                showdiff: true,
                search: { car_id: '', phone: '', station: '' },
                plates: [],
                carData: { car_id: '', plate: '', rule: '', rule_name: '', rule_N1: '', station_id: '', station_name: '', arrival: '', isMonth: '' },
                recordData: [],
                recordShade: false,
                remoteInfo: { title: '', cmd: '', show: false, info: {} },
                localData: { show: false, title: '', shadeLoc: false, dataET: [], dataLoc: [] },
                currentCar: '', //{station:'',car:'',rule:''}
                images:{show:false,lists:[]}
            }
        },
        mounted() {
            //this.getData();
        },
        methods: {
            init() {
                //接入电话时，如果有手机号，先把号码填到搜索框，再手动调用getData()
            },
            compare() {
                var vm = this;
                vm.localData.show = true;
                vm.localData.title = '厂家数据和易停数据对比';
                vm.oneCommond(vm.currentCar, 'search');
            },
            oneCommond: function(row, cmd) {
                var vm = this;
                vm.localData.shadeLoc = true;
                return utils.fetch("/contract/commond?cmd=" + cmd + "&station_id=" + row.station + "&car_id=" + row.car + "&rule_id=" + row.rule).then(function(json) {
                    if (typeof(json) != 'undefined') {
                        if (json.code == 0) {
                            vm.localData.shadeLoc = false;
                            vm.localData.dataLoc = json.content.getDates ? json.content.getDates : [];
                        } else {
                            vm.$message({ showClose: true, message: json.message, type: 'error' });
                        }
                    }
                });
            },
            handleChange(val) {},
            /**
             * [getPardedInfo 查询当前车牌的信息]
             * @param  {[type]} id [description]
             */
            getPardedInfo(id) {
                var vm = this;
                var url = vm.url.parkedwhere + id;
                utils.fetch(url).then(function(json) {
                    if (json && json.code == 0) {
                        var res = json.content;
                        vm.carData.arrival = res.arrival || '无数据';
                        vm.carData.plate = res.plate;
                        vm.carData.station_name = res.station_name || '无数据';
                        vm.carData.station_id = res.station_id;
                        vm.carData.car_id = res.car_id;
                        vm.getStationStatus()
                        // .then((res)=>{//判断临停还是月卡
                        //     //拼接用户当前信息
                        // });
                        //获取预出场信息
                        vm.search.station = res.station_id;
                        vm.search.station && vm.getPerOutData();

                    } else {
                        vm.$message({ showClose: true, message: json.message, type: 'error' });
                    }
                });
            },
            /**
             * [getStationStatus 根据车牌，车场，过期时间判断临停还是月卡]
             * @return {[type]} [description]
             */
            getStationStatus() {
                let vm = this;
                let url = vm.url.lists + "?page=1&pagesize=1000";
                let queryStr = `&station_id=${vm.carData.station_id}&car_id=${vm.carData.car_id}&is_expired=N`;
                url += queryStr;
                return utils.fetch(url).then((json) => {
                    if (json && json.code == 0) {
                        let list = json.content.lists;
                        if (list && list.length > 0) {
                            vm.carData.rule_name = list[0].rule_name;
                            vm.carData.rule_N1 = list[0].rule_N1;
                            vm.carData.rule = list[0].rule;
                            vm.carData.isMonth = 'Y';
                            vm.setETdata(list[0]);
                            vm.setCompareBtn();
                            //只有车牌搜索时，查到手机号，应该填入搜索栏
                            if(!vm.search.phone&& list[0].phone){vm.search.phone =list[0].phone }
                        } else {
                            vm.carData.isMonth = 'N';
                        }
                    } else {
                        vm.$message({ showClose: true, message: json.message, type: 'error' });
                    }
                });

            },
            setCompareBtn() {
                var vm = this;
                vm.currentCar = {
                    station: vm.carData.station_id,
                    car: vm.carData.car_id,
                    rule: vm.carData.rule
                }
                for (var i in vm.currentCar) {
                    if (!vm.currentCar[i]) {
                        vm.showdiff = true;
                        return
                    }
                    vm.showdiff = false;
                }
            },
            setETdata(obj) {
                var newobj = {
                    plate: this.carData.plate,
                    time_begin: obj.time_begin,
                    time_end: obj.time_end,
                    rule_N1: obj.rule_N1,
                    rule_name: obj.rule_name,
                    status: this.status[obj.status],
                };
                this.localData.dataET = [newobj];
            },
            /**
             * [getPerOutData 根据车场得到预出场信息；车场可以根据parkedwhere得到也可以根据用户手动输入得到]
             * @return {[type]} [description]
             */
            getPerOutData: function() {
                var vm = this;
                var url = '/inout/appearanceList?page=1&pagesize=1000';
                if (vm.search.station) url += "&station_id=" + vm.search.station;
                //if(vm.search.car) url += "&plate="+vm.search.car; todo?
                vm.shade = true;
                utils.fetch(url).then((json) => {
                    if (json && json.code == 0) {
                        vm.tableData = json.content.lists;
                        vm.shade = false;
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                });
            },
            btnSearch() {
                //手机号搜索的记录可能多条，但车牌只有一条记录
                this.getData()
            },
            btnUndo() {
                this.search = { car_id: '', phone: '', station: '' };
                this.hasPlate = false;
                this.clearVal();
            },
            clearVal() {
                this.carData = { phone: '', plates: '', car_id: '', plate: '', rule: '', rule_name: '', rule_N1: '', station_id: '', station_name: '', location: '' };
                this.localData = { show: false, title: '', shadeLoc: false, dataET: [], dataLoc: [] };
                this.showdiff = true;
                this.recordData = [];
                this.tableData = [];
                this.activeNames = ['1'];
            },
            getRecoder(car_id) {
                let vm = this;
                let url = vm.url.history + "?car_id=" + car_id;
                vm.recordShade = true;
                utils.fetch(url).then((res) => {
                    if (res && res.code == 0) {
                        vm.recordShade = false;
                        vm.recordData = res.content.lists
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    };
                })
            },
            getData() {
                let vm = this;
                let url = vm.url.lists + "?page=1&pagesize=1000";
                //vm.carData.phone=vm.search.phone;
                if (vm.search.phone) { url += '&phone=' + vm.search.phone };
                if (vm.search.car_id) { url += '&car_id=' + vm.search.car_id };
                //只有车场时，只取预出场信息
                if (vm.search.station && !vm.search.phone && !vm.search.car_id) {
                    vm.getPerOutData();
                    vm.activeNames = ['3'];
                    return
                };
                utils.fetch(url).then((res) => {
                    if (res && res.code == 0 && res.content.lists) {
                        vm.plates = vm.concatPlates(res.content.lists);
                        vm.hasPlate = vm.search.car_id ? false : true;
                        if (!vm.search.car_id) {
                            vm.search.car_id = vm.plates[0].car_id;
                            vm.changeCarid(vm.search.car_id);
                        }
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                        vm.clearVal();
                    }
                })
            },
            changeCarid(val) {
                let vm = this;
                this.tableData = [];
                vm.getPardedInfo(val);
                vm.getRecoder(val);
            },
            concatPlates(arr) {
                let newarr = [],
                    platelist = [];
                if (!Array.isArray(arr)) return;
                arr.forEach((k) => {
                    newarr = newarr.concat(k.plates);
                })
                platelist = newarr.map((i) => {
                    return {
                        plate: i.plate,
                        car_id: i.car_id
                    }
                })
                return platelist;
            },

            //抬杆 开闸操作
            operateHandler: function(row) {
                var vm = this;
                var editData = {
                    device_id: row.id,
                    cmd: 'open'
                };
                utils.fetch('/device/open_close', { method: 'POST', body: editData }).then(function(res) {
                    if (typeof(res) != 'undefined') {
                        if (res.code == 0) {
                            vm.remoteInfo = { show: true, title: res.content.title, info: res.content.info };
                        } else {
                            vm.$message({ showClose: true, message: res.message, type: 'error' });
                        }
                    }
                })
            },
            imgshow:function(){
                var vm = this;
                let inlistUrl = '/inout/inlists?page=1&pagesize=20&car_id='+vm.carData.car_id;
                utils.fetch(inlistUrl).then(res=>{
                    if(res.content && Array.isArray(res.content)&& res.content.length>0){
                        return res.content[0]
                    }else{
                        vm.$message({ showClose:true, message:'没有查到当前车牌进场纪录', type:'error' });
                        return false
                    }
                }).then(row=>{
                    if(row){
                        vm.images = {show:true,lists:[]};
                        utils.fetch('/inout/images?type=in&station_id='+row.station+'&id='+row.id+'&date='+row.time_recv.substr(0,7)).then(function(json){
                            if(typeof(json) != 'undefined'){
                                if(json.code == 0 && json.content.length > 0){
                                    vm.images.lists = json.content
                                }else{
                                    vm.images.show = false;
                                    vm.$message({ showClose:true, message:json.message, type:'error' });
                                }
                            }
                        });
                    }
                })
            },
            imgClose:function(){
                this.images = {show:false,lists:[]};
            },
        },
        beforeRouteEnter: function(to, from, next) {
            next(function(vm) {
                utils.getTingYunScript();
            });
        },
    }
</script>
