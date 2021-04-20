import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './utils/mixin.js'

Vue.use(ElementUI)

require('./css/admin.css');

//播放器插件 start
import VideoPlayer from 'vue-video-player';
Vue.use(VideoPlayer)
import 'video.js/dist/video-js.css'

//播放器插件 end
import store from './app/store/store.js';
import router from './router.js';
import worker_header from './app/component/worker_header.vue';
import worker_bar from './app/component/worker_bar.vue';
import VueQrcode from '@xkeshi/vue-qrcode'

var components=[
    {name:'my-loading', path:'loading.vue'},
    {name:'my-select-cities', path:'select-cities.vue'},
    {name:'my-select-station', path:'select-station.vue'},
    {name:'my-select-plate', path:'select-plate.vue'},
    {name:'my-select-domain', path:'select-domain.vue'},
    {name:'my-add-plate', path:'add-plate.vue'},
    {name:'my-select-vendor', path:'select-vendor.vue'},
    {name:'my-select-department', path:'select-department.vue'},
    {name:'my-tree-department', path:'tree-department.vue'},
    {name:'my-image-lists', path:'image-lists.vue'},
    {name:'my-paginator', path:'paginator.vue'},
    {name:'my-linkage-dept', path:'linkage-dept.vue'},
    {name:'my-select-merchant', path:'select-merchant.vue'},
    {name:'my-select-type', path:'select-type.vue'},
    {name:'dept-btn', path:'deptBtn.vue'},
    {name:'hls-player', path:'hls-player.vue'},
    {name:'my-upload', path:'upload-file.vue'},
    {name:'ueditor', path:'ueditor.vue'},
    {name:'my-tree-ysdevice', path:'tree-ysdevice.vue'},
];

var componentRoot = './utils/';
components.forEach(function(item){
    Vue.component(item.name, require(''+componentRoot+item.path));
})
Vue.component('qrcode', VueQrcode);

var app = new Vue({
    el:'#app',
    store,
    components:{
        workerHeader:worker_header,
        workerBar:worker_bar,
    },
    computed:{
        rendering:function(){
            return store.state.global.rendering;
        },
        islogin:function(){
            return store.state.global.login.islogin;
        }
    },
    router:router,
    mounted:function(){
        store.commit('getWindowViewSize');  //获取页面可视区域大小
        window.onresize = function(){
            store.commit('getWindowViewSize');
        }
    },
    methods:{
        globalClick:function(e){
            if(typeof(this.$refs.bar) != 'undefined' && this.$refs.bar.$refs.pop.contains(e.target) == false){
                store.commit('bar_tips',{show:false,path:''});
            }
            if(typeof(this.$refs.header) != 'undefined' && this.$refs.header.$refs.pop.children[0].contains(e.target) == false){
                if(store.state.global.popWnd.edit == true){
                    this.$msgbox({message:'你确定要放弃此操作吗？',showCancelButton:true,confirmButtonText:'确定',cancelButtonText:'取消'}).then(
                        action => {
                            if(action == 'confirm'){ //确定放弃操作
                                store.commit('header_pop_event',{show:false,edit:false,selected:[]});
                            }else{
                                store.commit('header_pop_event',{show:true,edit:true});
                            }
                        }
                    );
                }else{
                    store.commit('header_pop_event',{show:false,edit:false});
                }
            }
        }
    }
});

