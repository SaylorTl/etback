<template>
        <div id='box' class="menu-hide">
            <div class="qrWrap">
                <div class="qr_header">
                    <template v-if="station_id">当前车场为: <span class="green">{{station_name}}</span></template>
                    <template v-else>查询不到停车场!请从'停车场'页面跳转到当前页面</template>
                </div>
                <div class="qr_select">
                    <el-select size="small" v-model="type" clearable placeholder="二维码类型" class="widthX250" @change='showDevice'>
                        <el-option v-for="(k,v) in cfg.names" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="device" v-if='hasDevice' clearable placeholder="道闸选择" class="cell widthX200"   @change='clearQrstr'>
                        <el-option v-for="item in listsData" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                    <el-button type="primary" round class='right' @click="qrRender" size="small"><i class="fa fa-refresh"></i>生成二维码</el-button>
                </div>
                <div class="qr_show">
                    <div v-if='qrStr' class="qrContent">
                        <qrcode id='id_qr' :value="qrStr" :options="{ size: 470 }"></qrcode>
                        <div class="urlstr">{{qrName}}</div>
                        <div class="copyUrl">
                            <el-input v-model.trim="qrStr" size="small" placeholder="二维码网址"></el-input>
                        </div>
                        <el-button @click="downloadQr" type="primary" size="small"><i class="fa fa-cloud-download"></i>下载二维码</el-button>
                    </div>
                    <div v-else class="qrContent ">
                        暂无二维码！
                    </div>
                    <div class="tips">
                        <p>说明</p>
                        <p>请根据需求下载使用相应的物料。</p>
                        <p>1. <span>快速出场临停</span>缴费二维码：贴在停车场出口道闸旁边，每个出口有唯一的二维码。车主扫码确认车牌号后直接支付出场。</p>
                        <p>2.<span>车场专用临停</span>缴费二维码：贴在停车场内，每个车场车主出场前提前扫码输入车牌号支付后出场</p>
                        <p>3.<span>车场通用临停</span>缴费二维码：贴在停车场内，所有车场通用</p>
                        <p>4.<span>无牌车进场专用</span>二维码：贴在停车场入口道闸旁边，每个道闸有专用二维码。无牌车扫码验证后入场。需要配合快速出场二维码使用。</p>
                        <p>下载，能保存图片，图片名称为 xx车场-xxx二维码-xx道口</p>
                    </div>
                </div>
            </div>
        </div>
    </template>
    <script>
    import utils from '../../utils/utils.js';
    export default {
        data: function() {
            let cfg = {
                names: {
                    'a': '快速出场临停缴费二维码',
                    'b': '车场通用临停缴费二维码',
                    'c': '车场专用临停缴费二维码',
                    'd': '无牌车进场专用二维码'
                },
                storageName: 'station_qrcode_params'
            };
            return {
                cfg,
                qrcodeType: {},
                shade: false,
                hasDevice: false,
                listsData: [],
                allData: [],
                device: '',
                qrStr: '',
                qrName: '',
                type: '',
                CZF_channel: [1, 2, 4, 8, 16], //彩支付的ID集合
                hasCZF: false,
                station_id: '',
                station_name: '',
                pay_channel: '',
            }
        },
        computed: {},
        beforeMount() {
            let rParams = this.$route.params;
            if (rParams.station_id) {
                this.setStationVal(rParams);
                this.setStorage4Station();
            } else {
                let params = this.getStorage4Station();
                params && this.setStationVal(params);
            }
            this.checkHasCZF();
        },
        mounted() {
            let url = this.hasCZF ? 'https://c.aparcar.cn' : 'https://w.aparcar.cn';
            this.listsData = [];
            this.qrcodeType = {
                '快速出场临停缴费二维码': 'https://w.aparcar.cn/p/qr/',
                '车场通用临停缴费二维码': url + '/p/q',
                '车场专用临停缴费二维码': url + '/p/q/' + this.station_id || '',
                '无牌车进场专用二维码': 'https://w.aparcar.cn/p/qr/'
            };

        },
        methods: {
            setStationVal(params) {
                let { station_id, station_name, pay_channel } = params;
                this.station_id = station_id;
                this.station_name = station_name;
                this.pay_channel = pay_channel;
            },
            setStorage4Station() {
                let vm = this;
                let params = JSON.stringify(vm.$route.params);
                window.sessionStorage.setItem(vm.cfg.storageName, params)
            },
            getStorage4Station() {
                let vm = this;
                return JSON.parse(window.sessionStorage.getItem(vm.cfg.storageName))
            },
            downloadQr() {
                let vm = this;
                this.downloadCanvasIamge('#id_qr', vm.qrName)
            },
            downloadCanvasIamge(selector, name) {
                var canvas = document.querySelector(selector)
                var url = canvas.toDataURL('image/jpeg')
                var a = document.createElement('a')
                var event = new MouseEvent('click')
                a.download = name + '.jpg' || 'defaultPic.jpg'
                a.href = url
                a.dispatchEvent(event)
            },
            showDevice(val) {
                let vm = this;
                vm.device = '';
                vm.clearQrstr();
                vm.setOptions(vm.allData);
                vm.hasDevice = !!!(val === 'b' || val === 'c');
            },
            clearQrstr() {
                this.qrStr = '';
            },
            getData() {
                let vm = this;
                if (!vm.station_id) return;
                let url = `/device/lists?page=1&pagesize=200&station_id=${vm.station_id}&type=1`
                utils.fetch(url).then(function(res) {
                    if(typeof(res) != 'undefined' && res.code == 0 && Array.isArray(res.content.lists) && res.content.lists.length > 0){
                        vm.allData = res.content.lists.filter(item=>item.status==='Y');
                    }else{
                        vm.allData = [];
                    }
                    vm.setOptions(vm.allData);
                });
            },
            setOptions(arr) {
                let vm = this;
                if (arr.length === 0) {
                    vm.listsData = [];
                    return;
                }
                let inData = vm.formatArr(arr.filter(item => item.direction === 'in'));
                let outData = vm.formatArr(arr.filter(item => item.direction === 'out'));
                if (vm.type === 'a') {
                    vm.listsData = outData
                } else if (vm.type === 'd') {
                    vm.listsData = inData
                }
            },
            formatArr(arr) {
                if (arr && arr.length === 0) return [];
                return arr.map(item => {
                    return {
                        name: item.type_name + '-' + item.name,
                        id: item.id
                    }
                })
            },
            qrRender() {
                let vm = this;
                if (!vm.type) {
                    vm.$message({ showClose: true, message: "请选择二维码类型", type: 'error' });
                    return;
                }
                if (vm.type === 'c' && !vm.station_id) {
                    vm.$message({ showClose: true, message: "当前车场ID丢失", type: 'error' });
                    return;
                }
                if ((vm.type === 'a' || vm.type === 'd') && !vm.device) {
                    vm.$message({ showClose: true, message: "请选择道闸", type: 'error' });
                    return;
                }
                let name = vm.cfg.names[vm.type];
                vm.qrStr = name ? vm.qrcodeType[name] + vm.device || '' : '';
                vm.setQrName();
            },
            setQrName() {
                let vm = this;
                let qr = vm.cfg.names[vm.type];
                let name = '';
                let station_name = vm.type === 'b' ? '所有车场' : vm.station_name;
                name += station_name + '-';
                name += qr;
                if (vm.device) {
                    let deviceName = vm.listsData.find(item => item.id === vm.device).name;
                    name += '-' + deviceName || '';
                }
                vm.qrName = name;
            },
            // 检查是不是含有彩支付的付款方式
            checkHasCZF() {
                let vm = this;
                let pays = vm.pay_channel;
                if (!pays || pays.length === 0) {
                    vm.hasCZF = false;
                    return
                }
                let flag = pays.every(item => {
                    return vm.CZF_channel.indexOf(item) < 0
                })
                vm.hasCZF = !flag;
            },
        },
        beforeRouteEnter: function(to, from, next) {
            next(function(vm) {
                vm.getData();
                utils.getTingYunScript();
            });
        },
    }
    </script>
