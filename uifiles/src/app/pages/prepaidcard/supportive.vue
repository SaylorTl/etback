<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell" width="180px" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.type" placeholder="类型" size="small" class="widthX120"  clearable>
                        <el-option v-for="(val,key) in cfg.typemap" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addclick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column label="大区事业部" min-width="110">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name+'/'+scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="150"></el-table-column>
                    <el-table-column label="类型" min-width="110">
                        <template slot-scope="scope">
                            <span>{{cfg.typemap[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="110"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template slot-scope="scope">
                            <el-button @click="delClick(scope.row)" plain size="mini" ><i class="fa fa-trash-o"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model.trim="editor.info.station_id" size="small" width="100%" placeholder="停车场" @select="selectHandler">
                        </my-select-station>
                    </el-form-item>
                    <el-form-item label="停车场列表:" v-if="stations.length>0">
                        <el-tag v-for="(tag,index) in stations" :key="tag.name" @close="reduceHandler(index,'station')" closable :value="tag.id"> {{tag.name}} </el-tag>
                    </el-form-item>
                    <el-form-item label="类型:">
                        <el-select v-model="editor.info.type" placeholder="类型" size="small"  clearable>
                            <el-option v-for="(val,key) in cfg.typemap" :key="key" :label="val" :value="key"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.btnloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>

        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data:function(){
        let cfg = {
            typemap:{"ETNOSENSE":"ET无感"},
            url:{
                list:'/supportstation/lists',
                add:'/supportstation/add',
                del:'/supportstation/delete',
            }
        }
        return{
            cfg,
            search:{dept:'',type:'',station_id:''},
            shade:false,
            search_more:false,
            tableData:[],
            stations:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            editor:{title:'',show:false,btnloading:false,info:{station_id:'',type:''}},
        }
    },

    methods: {
        delClick(row){
            let vm = this;
            let url = vm.cfg.url.del;
            let {station:station_id,type} = row;
            let data = {station_id,type};
            utils.fetch(url,{method:'post',body:data}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0) {
                        vm.$message({showClose:true, message:res.message, type:'success' });
                        vm.getData();
                    }else{
                        vm.$message({showClose:true, message:res.message, type:'error' });
                    }
                }
            })
        },
        addclick(){
            this.stations=[];
            this.editor = {title:'添加信息',show:true,btnloading:false,info:{station_id:'',type:''}}
        },
        selectHandler(obj){
            let array =this.stations;
            let index = array.findIndex((item)=>{
                return item.id === obj.id
            });
            if(index === -1){
                array.push(obj);
            }
        },
        reduceHandler(index){
            let array =this.stations;
            if (index !== -1) {
                array.splice(index, 1)
            }
        },
        getIds(array){
            let ids = [];
            array.forEach(item=>{ids.push(item.id)});
            return ids.join(',');
        },
        editSubmit(){
            let vm = this;
            let type = vm.editor.info.type;
            if(!type || vm.stations.length==0){
                vm.$message({showClose:true, message:'请先完善停车场和类型信息', type:'error' });
                return
            }
            let url = vm.cfg.url.add;
            let station_ids =vm.getIds(vm.stations);
            let data = {type,station_ids}
            vm.editor.btnloading = true
            utils.fetch(url,{method:'post',body:data}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0) {
                        vm.editor.show = false;
                        vm.getData();
                    }else{
                        vm.$message({showClose:true, message:res.message, type:'error' });
                    }
                }
                vm.editor.btnloading= false;
            })
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
            this.search = {dept:'',type:'',station_id:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = vm.cfg.url.list+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            let {...searchs}=vm.search;
            var querystr = utils.setQueryString(searchs);
            url+=querystr?'&'+querystr:'';
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
<style>
    .el-tag+.el-tag {
    margin-left: 10px;
}
</style>
