<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.key" size="small" class="cell widthX150"  placeholder="路径(英文)"></el-input>
                    <el-input v-model.trim="search.app_id" size="small" class="cell widthX150"  placeholder="来源(英文)"></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select v-model="time_type" size="small" class="cell widthX200"  placeholder="时间选择"  clearable>
                    <el-option label="开始和结束" value="dd"></el-option>
                    <el-option label="固定月份" value="mm"></el-option>
                </el-select>
                <template v-if='time_type==="dd"'>
                    <el-date-picker v-model="search.time_begin"  size="small" type="date" placeholder="开始时间" value-format="yyyy-MM-dd"></el-date-picker>
                    <el-date-picker v-model="search.time_end"  size="small" type="date" placeholder="结束时间" value-format="yyyy-MM-dd"></el-date-picker>
                </template>
                <el-date-picker v-model="search.month_date" v-if='time_type==="mm"' size="small" type="month" placeholder="月份搜索" value-format="yyyyMM"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   border fit style="width:100%">
                    <el-table-column type='index' width="70"></el-table-column>
                    <el-table-column prop="key" label="路径" min-width="100"></el-table-column>
                    <el-table-column label="路径说明" min-width="100">
                        <template slot-scope="scope">
                            <span>{{clickmap[scope.row.key]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="app_id" label="来源" min-width="100"></el-table-column>
                    <el-table-column  label="来源说明" min-width="100">
                        <template slot-scope="scope">
                            <span>{{clickmap[scope.row.app_id]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop='count' label="浏览次数" min-width="120">
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
           
        </div>
    </div>
</template>

<script>
    import utils from '../../utils/utils.js';
      export default {
        data:function(){
            let clickmap = utils.config._click_count;
            let cfg = {
                url:{
                    lists:'/pagerate/getRate',
                },
            }
            return {
                cfg,
                clickmap,
                shade:false,
                search_more:false,
                time_type:'dd',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{key:"",app_id:"",time_begin:"",time_end:"",month_date:""},
            }
        },
        methods:{
            setPageData(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo(){
                this.search_more = false;
                this.time_type = 'dd'
                this.search = {key:"",app_id:"",time_begin:"",time_end:"",month_date:""};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            getData(){
                var vm = this;
                if(vm.time_type === 'dd'){
                    vm.search.month_date = '';
                }else{
                    vm.search.time_begin = '';
                    vm.search.time_end = '';
                }
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

