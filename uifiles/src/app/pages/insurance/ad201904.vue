<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   border fit style="width:100%">
                    <el-table-column prop="id" width="70"></el-table-column>
                    <el-table-column prop="plate" label="车牌号" min-width="100"></el-table-column>
                    <el-table-column prop="tel" label="电话" min-width="100"></el-table-column>
                    <el-table-column prop="code" label="验证码" min-width="100"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    let config = window.etback.config;
      export default {
        data:function(){
            return {
                search:{},
                shade:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
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
                this.search = {tel:'',holdermobilephone:'',insuredmobilephone:'',licenseno:'',status:'',creationtime_begin:'',creationtime_end:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData(){
                var vm = this;
                var url = `/insurance/adv201904Lists?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
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
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            exportFile(){
                var vm = this;
                var url = vm.cfg.url.export;
                var querystr = utils.setQueryString(vm.search);
                var connect = url.indexOf('?')>0?'&':'?';
                url+=querystr?connect+querystr:'';
                window.location.href = config.host + url;
            },
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
