<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.kw"  size="small" class="cell widthX200"  placeholder="keyword"></el-input>
                    <el-select v-model="search.index" size="small" class="cell widthX100"  placeholder="类型">
                        <el-option v-for="(k,v) in cfg.indexmap" :label="k" :value="v" :key="v"></el-option>
                    </el-select>
                    <el-date-picker v-model="search.date" size="small" type="date" placeholder="日期" value-format="yyyyMMdd" class="widthX150" ></el-date-picker>
                    <el-time-picker is-range  v-model="search.time" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="HH:mm:ss" size="small" clearable arrow-control>
                      </el-time-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="path"><span>{{ props.row.path }}</span></el-form-item>
                                <el-form-item label="cluster_ip"><span>{{ props.row.cluster_ip }}</span></el-form-item>
                                <el-form-item label="host"><span>{{ props.row.host }}</span></el-form-item>
                                <el-form-item label="version"><span>{{ props.row['@version'] }}</span></el-form-item>
                                <el-form-item label="timestamp"><span>{{ props.row['@timestamp']}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="type" min-width="80"></el-table-column>
                    <el-table-column prop="addtime" label="addtime" min-width="120"></el-table-column>
                    <el-table-column prop="message" label="message" min-width="380"></el-table-column>
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
            let url={   
                lists:'/elasticsearch/log', 
            };
            let cfg = {
                indexmap:{
                    "etinout":"etinout","etbackapi":"etbackapi"
                }
            }
            return {
                url,
                cfg,
                shade:false,
                search:{kw:'',index:'etinout',date:'',time:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
            }
        },
        mounted(){
            this.search.date = this.getTime(new Date())
        },
        methods:{
            getTime(t){
                var c = function(n){return n>9?n:'0'+n;}
                return t.getFullYear()+c((t.getMonth()+1))+c(t.getDate());
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            getData:function(){
                var vm = this;
                var url = vm.url.lists+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(!vm.search.date||!vm.search.index){
                    vm.$message({ showClose:true, message:'请选择类型和日期', type:'error' });return
                }
                let {time,...others} = vm.search;
                let [begin,end] = time;
                let query = {begin,end,...others};
                var querystr = utils.setQueryString(query);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.tableData = res.content.lists || [];
                            vm.pagination.total = res.content.total || 0;
                            utils.setCache(vm);
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
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

