<template>
    <div id="tab-bar" v-show="data.length > 1 ? true : false">
        <div v-for="(item, index) in data" :key="index" class="tab-item" :class="{ active: item.active }" v-on:contextmenu.stop.prevent="contextmenu($event, item.path)" v-on:click="checked(item.path)">
            <div class="tab-item-label">{{ item.name }}</div>
            <div class="tab-item-close" v-if="item.path != '/welcome'" v-on:click.stop="close(item.path)"><i class="el-icon-close"></i></div>
            <i class="tab-item-loading el-icon-loading" :class="{ hide: item.status == 'loading' ? false : true }"></i>
            <i class="tab-item-error el-icon-warning" :class="{ hide: item.status == 'error' ? false : true }"></i>
        </div>
        <div class="tab-filling"></div>
        <div class="pop" ref="pop" v-show="tips.show" :style="{ left: tips.left + 'px', top: tips.top + 'px' }">
            <div v-on:click.stop.prevent="popClick('me')" class="row">关闭标签页</div>
            <div v-on:click.stop.prevent="popClick('all')" class="row">关闭全部标签页</div>
            <div v-on:click.stop.prevent="popClick('other')" class="row">关闭其他标签页</div>
        </div>
        <div class="offline_notify clearfix box-width">
            <span>有{{ offline_num }}个车场掉线了,点击查看详情</span>
        </div>
    </div>
</template>

<script>
import utils from "../../utils/utils.js";
export default {
    data: function() {
        return {
            offline_num: 0
        };
    },
    computed: {
        login: function() {
            return this.$store.state.global.login;
        },
        data: function() {
            return this.$store.state.bar.lists;
        },
        tips: function() {
            return this.$store.state.bar.tips;
        }
    },
    mounted: function() {
        // this.handleKeydown()
        this.listenMouse();

        if (parseInt(this.login.data.user_roleid) != 1 && parseInt(this.login.data.user_roleid) != 10) {
            return;
        }

        // var vm = this;
        // var socket = window.io('https://channel.aparcar.cn:1813');
        // socket.on('connect', function(){
        //     socket.emit('login', window.localStorage['user_id']);
        // });
        // socket.on('new_msg',function(message){
        //     var msg = JSON.parse(message);
        //     var data = msg.data;
        //     var path = vm.$router.currentRoute.path;
        //
        //     if(msg.event == 'offline'){
        //         // console.log(data);
        //         // vm.$notify({ duration:0,title:'车场掉线',message:data.station_name + " 掉线了",type:'warning' });
        //     }
        //
        //     if(msg.event == 'sendtovendor_temp'){   //临停缴费开闸失败
        //         var str = "车牌:" + data.plate + ", 停车场:" + data.station_name + ", 供应商:" + data.vendor_name;
        //         str += ", 时间:" + data.paytime + ", 厂家返回:" + JSON.stringify(data.return_result);
        //         vm.$notify({ duration:0,title:'临停开闸失败',message:str });
        //     }
        //
        //     if(msg.event == 'sendtovendor_month'){   //月卡缴费下发失败
        //         var str = "车牌:" + data.plate + ", 停车场:" + data.station_name + ", 供应商:" + data.vendor_name;
        //         str += ", 时间:" + data.paytime + ", 厂家返回:" + JSON.stringify(data.return_result);
        //         vm.$notify({ duration:0,title:'月卡缴费下发失败',message:str });
        //     }
        //
        //     if( path == '/welcome' ){
        //         // console.log(msg);
        //     }
        // });
    },
    methods: {
        checked: function(path) {
            this.$store.commit("bar_active", path);
            this.$root._router.push({
                path: path
            });
        },
        contextmenu: function(e, path) {
            if (path != "/welcome") {
                this.$store.commit("bar_tips", {
                    show: true,
                    path: path,
                    left: e.clientX,
                    top: e.clientY
                });
            } else {
                this.$store.commit("bar_tips", {
                    show: false,
                    path: ""
                });
            }
        },
        close: function(path) {
            var obj = this.$store.state.bar.lists.concat();
            utils.clearCache_active();
            var len = obj.length;
            for (var i in obj) {
                if (obj[i].path == path && obj[i].active == true) {
                    var index = 0;
                    if (i < len - 1 && i > 0) {
                        index = parseInt(i) + 1;
                    } else if (i == len - 1 && i > 0) {
                        index = parseInt(i) - 1;
                    }
                    this.$root._router.push({
                        path: obj[index].path
                    });
                }
            }
            this.$store.commit("bar_close_me", path);
            // 清除 keepAlive 缓存
            if (path === "/cService/index") {
                const stationsData = JSON.parse(window.sessionStorage.getItem("map-stations"));
                stationsData.detail = [];
                window.sessionStorage.setItem("map-stations", JSON.stringify(stationsData));
                const cServiceTag = this.$store.state.global.cServiceTag;
                const childrenNodes = this.$router.app.$children;
                const vmComponent = childrenNodes.filter(item => item.$vnode.tag === cServiceTag)[0];
                if (vmComponent.$vnode && vmComponent.$vnode.data.keepAlive) {
                    if (vmComponent.$vnode.parent && vmComponent.$vnode.parent.componentInstance && vmComponent.$vnode.parent.componentInstance.cache) {
                        if (vmComponent.$vnode.componentOptions) {
                            const key = vmComponent.$vnode.key == null ? vmComponent.$vnode.componentOptions.Ctor.cid + (vm.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : "") : vmComponent.$vnode.key;
                            const cache = vmComponent.$vnode.parent.componentInstance.cache;
                            const keys = vmComponent.$vnode.parent.componentInstance.keys;
                            if (cache[key]) {
                                if (keys.length) {
                                    var index = keys.indexOf(key);
                                    if (index > -1) {
                                        keys.splice(index, 1);
                                    }
                                }
                                delete cache[key];
                            }
                        }
                    }
                }
            }
        },
        popClick: function(t) {
            if (t == "me") {
                var obj = this.$store.state.bar.lists.concat();
                var len = obj.length;
                for (var i in obj) {
                    if (obj[i].path == this.$store.state.bar.tips.path && obj[i].active == true) {
                        var index = 0;
                        if (i < len - 1 && i > 0) {
                            index = parseInt(i) + 1;
                        } else if (i == len - 1 && i > 0) {
                            index = parseInt(i) - 1;
                        }
                        this.$root._router.push({
                            path: obj[index].path
                        });
                    }
                }
                this.$store.commit("bar_close_me", this.$store.state.bar.tips.path);
            } else if (t == "all") {
                this.$store.commit("bar_close_all");
                this.$root._router.push({
                    path: "/welcome"
                });
            } else if (t == "other") {
                this.$store.commit("bar_close_other", this.$store.state.bar.tips.path);
                this.$root._router.push({
                    path: this.$store.state.bar.tips.path
                });
            }
            this.$store.commit("bar_tips", {
                show: false,
                path: ""
            });
        },
        handleKeydown() {
            document.onkeydown = event => {
                let e = event || window.event || arguments.callee.caller.arguments[0];
                if (e && e.keyCode == 37) {
                    // 按 左
                    this.changeBar("left");
                }
                if (e && e.keyCode == 39) {
                    // 按 左
                    this.changeBar("right");
                }
            };
        },
        listenMouse() {
            let tabBar = document.getElementById("tab-bar");
            tabBar.addEventListener("mouseover", () => {
                this.handleKeydown();
            });
            tabBar.addEventListener("mouseout", () => {
                document.onkeydown = null;
            });
        },
        changeBar(direction) {
            let step = direction == "left" ? -1 : 1;
            let dataLength = this.data.length;

            let nextIndex = 0;
            this.data.forEach((item, index) => {
                if (item.active) {
                    nextIndex = index + step;
                }
            });

            if (nextIndex < 0) {
                nextIndex = dataLength - 1;
            }
            if (nextIndex > dataLength - 1) {
                nextIndex = 0;
            }
            let nextBarPath = this.data[nextIndex].path;
            this.checked(nextBarPath);
        }
    }
};
</script>
