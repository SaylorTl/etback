<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.tnum" size="small" class="cell widthX200"  placeholder="易停单号"></el-input>
                    <el-input v-model.trim="search.sn" size="small" class="cell widthX200"  placeholder="第三方单号"></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-input v-model.trim="search.third_tnum" size="small" class="cell widthX250"  placeholder="第三方订单号"></el-input>
                <el-input v-model.trim="search.related_tnum" size="small" class="cell widthX250"  placeholder="预付单号"></el-input>
                <el-select v-model="search.source" size="small" class="cell widthX150"  placeholder="选择来源">
                     <el-option v-for="(val,key) in cfg.map.source" :key="key" :label="val" :value="key"></el-option>
                </el-select>
                <el-select v-model="search.status" size="small" class="cell widthX150"  placeholder="选择状态">
                     <el-option v-for="(val,key) in cfg.map.status" :key="key" :label="val" :value="key"></el-option>
                </el-select>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="第三方单号:"><span>{{ scope.row.third_tnum }}</span></el-form-item>
                                <el-form-item label="预付单号:"><span>{{ scope.row.related_tnum }}</span></el-form-item>
                                <el-form-item label="退款单号:"><span>{{ scope.row.quit_tnum}}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ scope.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ scope.row.modifytime }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="70"></el-table-column>
                    <el-table-column  label="用户/手机号" min-width="180">
                    <template slot-scope="scope">{{scope.row.user_name}}/{{scope.row.user_phone}}</template>
                    </el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="80"></el-table-column>
                    <el-table-column label="来源" min-width="110">
                        <template slot-scope="scope">
                            <span>{{cfg.map.source[scope.row.source]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="tnum" label="易停订单号" width="210"></el-table-column>
                    <el-table-column prop='register_code' label="报名码" width="100">
                    </el-table-column>
                    <el-table-column label="状态" min-width="90">
                        <template slot-scope="scope">
                            <span :class="{'green':(scope.row.status=='paid'),'red':(scope.row.status=='return'),'gray':(scope.row.status=='refund')}">{{cfg.map.status[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="paytime" label="支付时间" min-width="120"></el-table-column>
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
            let cfg = {
                url:{lists:'/insurance/order_lists'},
                map:{
                    source:utils.config.payMethod,
                    status:{'created':"已创建,未支付",'paid':"已支付",'return':"已退款",'refund':"退款中"},
                }
            }
            return {
                cfg,
                shade:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search_more:false,
                search:{car_id:'',client_id:'',phone:'',related_tnum:'',sn:'',source:'',status:'',third_tnum:'',tnum:''},
            }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search_more = false;
                this.search = {car_id:'',client_id:'',phone:'',related_tnum:'',sn:'',source:'',status:'',third_tnum:'',tnum:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                let searchmap=Object.assign({},searchs);
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
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
