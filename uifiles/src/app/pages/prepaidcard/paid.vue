<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.tnum" size="small" class="cell widthX250"  placeholder="易停订单号"></el-input>
                    <el-input v-model.trim="search.related_tnum" size="small" class="cell widthX250"  placeholder="预付单号"></el-input>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell" width="180px" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.source" size="small" class="cell widthX100"  placeholder="来源" clearable>
                        <el-option v-for="(v,k)  in source" :label="v" :value="k" :key='k'></el-option>
                    </el-select>
                    
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                <el-select v-model="search.status" placeholder="状态" size="small" class="widthX120"  clearable>
                    <el-option v-for="(val,key) in statusmap" :key="key" :label="val" :value="key"></el-option>
                </el-select>
                <el-input v-model.trim="search.third_tnum" size="small" class="cell widthX250"  placeholder="第三方订单号"></el-input>
                <el-date-picker v-model="search.begintime" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.endtime" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>

            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="预付单号:"><span>{{ props.row.related_tnum }}</span></el-form-item>
                                <el-form-item label="第三方单号:"><span>{{ props.row.third_tnum }}</span></el-form-item> 
                                <el-form-item label="手机:"><span>{{ props.row.user_phone }}</span></el-form-item>
                                <el-form-item v-if="props.row.source == 'WECHAT' || props.row.source == 'WX_AGUA'" label="微信openID:"><span>{{ props.row.user_openid }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="tnum" label="易停订单号" min-width="210"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column label="支付来源" min-width="130">
                        <template slot-scope="props">
                            <span>{{source[props.row.source]||props.row.source}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="60"></el-table-column>
                    <el-table-column prop="balance_begin" label="充值前余额" min-width="70"></el-table-column>
                    <el-table-column prop="user_name" label="用户" min-width="110"></el-table-column>
                    <el-table-column prop="paytime" label="支付时间" min-width="120"></el-table-column> 
                    <el-table-column label="状态" min-width="100">
                        <template slot-scope="scope">
                            <span :class="{'yellow':(scope.row.status=='nolock'),'green':(scope.row.status=='paid')}">{{statusmap[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data:function(){
        return{
            source:utils.config.payMethod,
            statusmap:{"created":"已创建,未支付" ,"paid":"已支付","return":"退款","nolock":"已支付，未分配" },
            search:{status:'',third_tnum:'',related_tnum:'',tnum:'',source:'',begintime:'',endtime:'',dept:'',station_id:''},
            shade:false,
            search_more:false,
            tableData:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
        }
    },
    methods: {
        setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
        btnSearch:function(){
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo:function(){
            this.search = {status:'',third_tnum:'',related_tnum:'',tnum:'',source:'',begintime:'',endtime:'',dept:'',station_id:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
        btnMore:function(){
            this.search_more = !this.search_more;
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = "/balance/rechargeLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            let {...searchs}=vm.search;
            let searchQueryString=searchs;
            var querystr = utils.setQueryString(searchQueryString);
            var connect = url.indexOf('?')>0?'&':'?';
            url+=querystr?connect+querystr:'';
            utils.fetch(url).then(function(res){
                vm.shade=false;
                if(res.code==0 && res.content!== undefined){
                    vm.tableData = res.content.lists||[];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            })
        },
        
    },
    beforeRouteEnter:function(to, from, next){
            next(function(vm){
                var data = utils.getCache();
                var obj = data == '' ? {} : JSON.parse(data);
                if(obj.tableData && obj.tableData.length > 0){
                    utils.getCacheItem(vm,obj);
                }else{
                    vm.getData();
                }
            });
        },
}
</script>
