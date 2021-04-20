<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept_ids"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-select v-model="search.type" size="small" class="cell widthX100"  placeholder="操作类型">
                        <el-option v-for='(v,k) in opertype' :label='v' :key='k' :value='k'></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportUpdate" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.time_begin" value-format="yyyy-MM-dd HH:mm:ss" size="small" type="datetime" placeholder="开始时间"></el-date-picker>
                <el-date-picker v-model="search.time_end" value-format="yyyy-MM-dd HH:mm:ss" size="small" type="datetime" placeholder="结束时间"></el-date-picker>
                <el-select v-model="search.title"  size="small" class="cell widthX100"  placeholder="标题">
                    <el-option v-for='(item,index) in titleLists' :label='item' :key='index' :value='item'></el-option>
                </el-select>
                <el-input v-model="search.name" size="small" class="cell widthX100" placeholder="操作人"></el-input>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区事业部:">
                                    <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                                </el-form-item>
                                <el-form-item label="创建时间:">
                                    <span>{{scope.row.creationtime}}</span>
                                </el-form-item>
                                <el-form-item label="修改时间:">
                                    <span>{{scope.row.moditytime}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="70"></el-table-column>
                    <el-table-column prop="name" label="操作人名称" min-width="70"></el-table-column>
                    <el-table-column prop="title" label="标题" min-width="100"></el-table-column>
                    <el-table-column prop="type_name" label="操作类型" min-width="60"></el-table-column>
                    <el-table-column prop="result" label="操作结果" min-width="100"></el-table-column><el-table-column prop="old_data" label="旧数据" min-width="200"></el-table-column>
                    <el-table-column prop="new_data" label="新数据" min-width="200"></el-table-column>
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
            return {
                opertype:{"station":"停车场","rule":"月卡规则","device":"设备","blacklist":"黑白名单","contract":"月卡"},
                shade:false,
                search:{dept_ids:'',station_id:'',time_begin:'',time_end:'',title:'',type:'',name:''},
                search_more:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                titleLists:['月卡下发','修改月卡','月卡续费申请同意','清空本地','本地月卡删除','更换规则申请同意']
            }
        },
        methods:{
            exportUpdate(){
                let vm=this;
                let url = '/case/export';
                let {time_begin,time_end} = vm.search;
                if(!time_begin||!time_end){
                    vm.$message({ showClose:true, message:'开始和结束时间不能为空', type:'error' });return;
                }
                let querystr = utils.setQueryString({time_begin,time_end});
                url+=querystr?'?'+querystr:'';
                let nowdate = vm.search.time_begin.substr(0,10).split('-').join('');
                let filename = nowdate+'客服操作日志.csv';
                utils.rpc.loadfile(url,null,filename).then(function(res){
                     if(res&&res.code === 0){
                        vm.$message({ showClose:true, message:res.message, type:'success' })
                     }else{
                        vm.$message({ showClose:true, message:res.message||'no data', type:'error' })
                     }
                });
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            getData:function(){
                var vm = this;
                var url = '/case/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs} = vm.search;
                let querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {dept_ids:'',station_id:'',time_begin:'',time_end:'',title:'',type:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            btnMore(){
                this.search_more = !this.search_more;
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

