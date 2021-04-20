<template>
    <div id='box' class="menu-hide">
        <div class="mainbox ptb10">
            <div class="bind_box" v-loading="getSeatLoading">
                <div class="bind_text">已绑定坐席号:{{seat_id||'未绑定'}}</div>
                <el-button @click="seatShow" size="small"><i class="fa fa-link"></i>{{seat_id?'修改':'绑定'}}</el-button>
            </div>
            <div class='service_map mt10'>
                <div id="amap_container" v-loading="markerShade"></div>
                <div class="s_right_text">
                    <div class="label_seat">
                        <ul>
                            <li>
                                <my-select-station v-model="station_id" size="small" class="lineblock widthX150" placeholder="查找停车场"></my-select-station>
                                <el-button class="label_seat_switch" @click="changeStationClick" size="small"><i class="fa fa-search"></i>查找</el-button>
                            </li>
                            <template v-if="station.name" v-loading="stationShade">
                                <li><span class="ls_title">停车场:</span><span class="ls_text">{{station.name}}</span></li>
                                <li><span class="ls_title">地址:</span><span class="ls_text">{{station.address}}</span></li>
                                <li><span class="ls_title">总车位数:</span><span class="ls_text">{{station.total}}</span></li>
                                <li><span class="ls_title">空余车位数:</span><span class="ls_text">{{station.free_park}}</span></li>
                                <li class="red"><span class="ls_title">是否允许外来车辆进入:</span><span class="ls_text">{{station.allowOthers}}</span></li>
                                <li><span class="ls_title">临停收费规则:</span><span class="ls_text">{{station.rule_remark}}</span></li>
                                <li><span class="ls_title">车场紧急联系人:</span><span class="ls_text">{{station.admin_name||''}}</span></li>
                            </template>
                        </ul>
                    </div>
                </div>
            </div>
            <el-dialog :title="bindSeat.title" :visible.sync="bindSeat.show" width='40%'>
                <el-form label-width="100px">
                    <el-form-item label="账号:">
                        <span>{{global_oa}}</span>
                    </el-form-item>
                    <el-form-item label="绑定坐席号:">
                         <el-select v-model="bindSeat.id" size="small"   placeholder="请输入绑定坐席号">
                            <el-option v-for="v in seatId" :label="v" :value="v" :key='v'></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size='small' :loading='bindSeat.btnLoading' @click="bindClick">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function() {
        let cfg = {
            url:{
                bindSeat:'/custom/bindSeat',
                getSeat:'/custom/lists',
                stationInfo:'/custom/stationInfo',
                stationlists:'/station/lists?page=1&pagesize=10000&status=active'
            }
        };
        return {
            cfg,
            station_id: '',
            map:null,
            station: {name: '', address: '', total: '', free_park: '',allowOthers: '', rule_remark: '30分钟内免费，1小时内5元，之后每小时3元，30元封顶。',admin_name: '',admin_phone:''},
            global_oa: '',
            markerShade: false,
            stationShade: false,
            getSeatLoading: false,
            stationsData: {list: [], detail: []},
            seat_id: '',
            seatId:[],
            seatRange:{b:2066,e:2076},
            bindSeat: { show: false, title: '绑定坐席号', id: '', btnLoading: false }
        }
    },
    mounted() {
        let store = this.$store.state.global.login.data;
        this.global_oa = store.user_name;
        this.global_name = store.user_realname;
        for(let i = this.seatRange.b;i<=this.seatRange.e;i++){this.seatId.push(i)}
    },
    methods: {
        seatShow() {
            this.bindSeat.show = true;
            this.bindSeat.id = this.seat_id;
        },
        bindClick() {
            let vm = this;
            let url = vm.cfg.url.bindSeat;
            let id = vm.bindSeat.id ;
            if(id === '' || id ==='0'){
                vm.$message({ showClose:true, message:'坐席号不能为空或零', type:'error' });return;
            }
            let data = {name:vm.global_name,oa:vm.global_oa,seat:vm.bindSeat.id}
            url+='?'+ utils.setQueryString(data);
            utils.fetch(url).then((res)=>{
                if(typeof res != "undefined"){
                    if(res.code===0){
                        vm.$message({ showClose:true, message:res.message, type:'success' })
                        vm.bindSeat.show = false;
                        vm.getSeat();
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' })
                    }
                }
            })
        },
        getSeat(){
            let vm = this;
            let url = `${vm.cfg.url.getSeat}?oa=${vm.global_oa}`;
            vm.getSeatLoading = true;
            utils.fetch(url).then((res)=>{
                if(typeof res != "undefined"){
                    if(res.code===0){
                        vm.seat_id= res.content.seat || '';
                        vm.getSeatLoading = false;
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' })
                    }
                }
            })
        },
        changeStationClick() {
            let vm = this;
            if (this.station_id) {
                //this.stationShade = true;
                //清除所有marker
                vm.clearMarker();
                vm.markerShade = true;
                vm.getStationInfo()
            }
        },
        getStationInfo(){
            let vm = this;
            if(!vm.station_id){
                return;
            }

            let url = `${vm.cfg.url.stationInfo}?station_id=${vm.station_id}`;
            return utils.fetch(url).then(function(res) {
                if(res.code === 0&&res.content.name){
                    let con = res.content;
                    vm.station =  {...con}
                    vm.stationsData.detail = [vm.station];
                    vm.setStationsStorage();
                    vm.addMarker()
                }
            });
        },
        getStationsData() {
            var vm = this;
            var url = vm.cfg.url.stationlists;
            return utils.fetch(url).then(function(json) {
                vm.stationsData.list = typeof json != "undefined" && json.code == 0 ? json.content.lists : [];
                if (vm.stationsData.list.length > 0) {
                    vm.setStationsStorage()
                }
            });
        },
        setSingleInfo() { window.sessionStorage['info-station'] = JSON.stringify(this.station) },
        getSingleInfo() { return window.sessionStorage['info-station'] ||''},
        setStationsStorage() { window.sessionStorage['map-stations'] = JSON.stringify(this.stationsData) },
        getStationsStorage() { return window.sessionStorage['map-stations'] ||''},
        getMarker(item) {
            return new AMap.Marker({
                position: new AMap.LngLat(item.longitude, item.latitude),
                title: item.name
            });
        },
        setMarkerList() {
            let markerList = [];
            if(this.stationsData.detail.length) {
                markerList = this.stationsData.detail.map(item => this.getMarker(item));

                let element = this.stationsData.detail[0];
                 // 设置地图级别，级别为数字。PC上，参数zoom可设范围：[3,18]；移动端：参数zoom可设范围：[3,19]
                this.map.setZoomAndCenter(12, [element.longitude, element.latitude]);
            } else {
                markerList = this.stationsData.list.map(item => this.getMarker(item));
            }

            this.map.add(markerList);
            this.markerShade = false;
        },
        clearMarker(){
            let vm = this;
            vm.map.clearMap();
        },
        addMarker() {
            // TODO
            let vm = this;
            vm.markerShade = true;
            let stationStorage = vm.getStationsStorage();
            if(stationStorage){
                vm.stationsData = JSON.parse(stationStorage);
                vm.setMarkerList()
            }else {
                vm.getStationsData().then(() => {
                    if (vm.stationsData.list.length > 0) {
                        vm.setMarkerList()
                    }
                })
            }
        },
        loadAmap() {
            let vm = this;
            window.onLoad = function() {
                vm.map = new AMap.Map('amap_container');
                vm.map.setZoomAndCenter(5, [116.205467, 39.907761]);
                vm.addMarker();
            }
            var url = 'https://webapi.amap.com/maps?v=1.4.12&key=59ded1ab181ee9844441354b2d757990&callback=onLoad';
            var jsapi = document.createElement('script');
            jsapi.charset = 'utf-8';
            jsapi.src = url;
            jsapi.id = 'pulgin_amap_gd';
            document.head.appendChild(jsapi);
        },
        unloadAmap() {
            let amap = document.getElementById('pulgin_amap_gd');
            amap && amap.parentNode.removeChild(amap)
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            vm.loadAmap();
            vm.getSeat();
            utils.getTingYunScript();
            vm.$store.commit('setCServiceTag', vm.$vnode.tag);
        });
    },
    beforeRouteLeave: function(to, from, next) {
        this.unloadAmap();
        next();
    },
}
</script>
