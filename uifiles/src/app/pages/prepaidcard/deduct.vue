<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell" width="120px" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-input v-model.trim="search.username" size="small" class="cell widthX100"  placeholder="用户名"></el-input>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态" clearable>
                    <el-option v-for="(v,k) in status" :label="v" :value="k" :key='k'></el-option>
                </el-select>
                <el-date-picker v-model="search.time_begin" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.time_end" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区事业部" min-width="150">
                                    <span>{{props.row.area_name}}/{{props.row.dept_name}}</span>
                                </el-form-item>
                                <el-form-item label="进场时间:"><span>{{ props.row.time_begin}}</span></el-form-item>
                                <el-form-item label="出场时间:"><span>{{ props.row.time_end}}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime}}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="80"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="80"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="60"></el-table-column>
                    <el-table-column label="状态" min-width="80">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status=='N'),'green':(scope.row.status=='Y')}">{{status[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="扣款类型" min-width="80">
                        <template slot-scope="scope">
                            <span>{{auth[scope.row.auth_type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="扣款账户" min-width="130">
                        <template slot-scope="scope">
                            <span>{{scope.row.account_name+'/'+scope.row.account_phone}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="balance_begin" label="扣款前余额" min-width="70"></el-table-column>
                    <el-table-column label="用户" min-width="130">
                        <template slot-scope="scope">
                            <span>{{scope.row.user_name+'/'+scope.row.user_phone}}</span>
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
            auth:{'all':'全额','ration':'定额'},
            status:{'Y':'已支付','N':'未支付'},
            source:utils.config.payMethod,
            search:{dept:'',status:'',station_id:'',car_id:'',username:'',mobile:'',time_begin:'',time_end:''},
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
            this.search = {dept:'',status:'',station_id:'',car_id:'',username:'',mobile:'',time_begin:'',time_end:''};
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
            var url = "/balance/deductLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
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
