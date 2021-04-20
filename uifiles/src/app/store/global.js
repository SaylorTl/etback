
export default {
    state:{
        rendering:true,
        loading:false,
        login:{
            islogin:false,
            data:{},
            tags:[],
        },
        catalog:[],    //顶部栏目
        popWnd:{show:false,edit:false,selected:[],catalog:[]},  //顶部更多弹出框
        WindowViewSize:{width:0,height:0},  //页面可视区域大小
        error:'',
        cServiceTag: ''
    },
    mutations:{
        endrender(state){
            state.rendering = false;
        },
        loading(state,obj){
            if(typeof(obj) == 'boolean') state.loading = obj;
        },
        sign_in(state,obj){
            state.login = obj;
        },
        sign_out(state){
            state.login = {islogin:false,data:[],tags:[]};
            window.localStorage.removeItem('user_id');
            window.localStorage.removeItem('access_token');
        },
        catalog(state,obj){
            state.catalog = obj;
        },
        header_pop_event(state,obj){
            if(typeof(obj.show) != 'undefined') state.popWnd.show = obj.show;
            if(typeof(obj.edit) != 'undefined') state.popWnd.edit = obj.edit;
            if(typeof(obj.selected) != 'undefined') state.popWnd.selected = obj.selected;
            if(typeof(obj.catalog) != 'undefined') state.popWnd.catalog = obj.catalog;
        },
        getWindowViewSize(state){
            state.WindowViewSize.width = window.innerWidth ? window.innerWidth : ((document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : document.body.offsetWidth);
            state.WindowViewSize.height = window.innerHeight ? window.innerHeight : ((document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : document.body.offsetHeight);
        },
        error_page(state,obj){
            state.error = obj;
            window.location.href="/error";
        },
        setCServiceTag(state, tag) {
            state.cServiceTag = tag;
        }
    },

}
