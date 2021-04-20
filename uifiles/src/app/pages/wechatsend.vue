
<template>
    <div id='box' class="menu-hide">
        <div class='worker vendor'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.mark" size="small" class="cell widthX150"  placeholder="微信公众号标识"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <div class="imgNews">
                                    <ul>
                                        <li v-for="item in scope.row.articles" :key="item.id">
                                            <el-card :body-style="{ padding: '0px'}" shadow="never">
                                                <img :src="item.cover_img">
                                                <div class="title_info">
                                                    <p class="newstitle">{{item.title}}</p>
                                                    <div class="newsedit">
                                                        <span class="author">{{item.author}}</span>
                                                    </div>
                                                </div>
                                            </el-card>
                                        </li>
                                    </ul>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"  width="40"></el-table-column>
                        <el-table-column prop="app_name" label="公众号标识"  min-width="110"></el-table-column>
                        <el-table-column prop="news_id" label="图文ID"  min-width="80"></el-table-column>
                        <el-table-column prop="local_article_id" label="图文素材ID"  min-width="80"></el-table-column>
                        <el-table-column prop="send_detail" label="群发详情"  min-width="280"></el-table-column>
                        <el-table-column prop="send_type_name" label="群发类型名称"  min-width="110"></el-table-column>
                        <el-table-column prop="send_time" label="发送时间"  width="140"></el-table-column>
                        <el-table-column label="状态"  min-width="80">
                            <template slot-scope="scope">
                               <span  :class="{'red':(scope.row.status=='1'),'green':(scope.row.status=='0')}">{{cfg.status[scope.row.status]}}</span> 
                            </template>
                        </el-table-column>
                </el-table> 
                <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            </div>
        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data(){
            var config = {
                status:{'0':'成功','1':'失败'},
                url:{
                    lists:'/wechatnews/recordlists'
                }
            };
            return {
                cfg:config,
                shade:false,
                search:{mark:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
            }
        },
        computed:{

        },
        methods:{
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(vm.search.mark){url+='&mark='+vm.search.mark}
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists: [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
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

