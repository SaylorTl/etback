<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                     <my-select-station v-model="search.station_id" size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                    <el-input v-model.trim="search.name" size="small" class="cell widthX150"  placeholder="易停区域名称"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>

            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="name" label="易停区域名称" min-width="90"></el-table-column>
                     <el-table-column prop="station_name" label="停车场" min-width="500"></el-table-column>
                    <el-table-column prop="station_num" label="车场个数" min-width="60"></el-table-column>
                    <el-table-column label="操作" min-width="60">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>

            <!-- 添加弹出层 -->
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show">
                <el-form :model="editInfo.info" label-width="120px">           
                    <el-form-item  label="易停区域名称:">
                        <el-input v-model="editInfo.info.name" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="停车场:">
                            <el-input type="textarea" v-model="stationStr" :rows="2" @focus="showTree('stations')" readonly placeholder="点击可选择停车场"></el-input>
                            <my-tree-department :show="stations.show" v-model="stations.value" @clear="clearTree('stations')" @close="closeTree('stations')" :level="3"></my-tree-department>
                    </el-form-item>

                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    let config = window.etback.config;
    export default {
        data(){
            return {
                config,
                shade:false,
                isadd:true,
                editInfo:{show:false,title:'',saveloading:false,info:{station_id:'',name:'',}},
                search:{name:'',station_id:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                stations:{show:false,value:[]},
            }
        },
        computed:{
    
            stationStr:function(){
                var data = this.stationUnique();
                return this.concatResult(data,'name')
            },
            stationVal:function(){
                var data = this.stationUnique();
                return this.concatResult(data,'value')
            },
        },
        methods:{
            concatResult:function(data,val){
                return data.map(i=>i[val]).join(',');
            },
            showTree:function(val){
                this.closeAllTree();
                this[val].show = true;
            },
            closeTree:function(val){
               // console.log('closeTree',val,this)
                this[val].show = false;
            },
            clearTree:function(val){
                this[val].value = '';
            },
            closeAllTree:function(){
           
                this.stations.show = false;
            },
            updateClick(row){
                let vm = this;
                console.log('hang数据',row)
                let info={
                    id:row.id,
                    name:row.name,
                    station_id:row.station_id
                }
                vm.stations.value=[]
                if(row.station_id){
                    this.getRowStation(row.station_id).then(function(data){
                        if(typeof(data) != 'undefined'){
                           vm.stations.value =  data.map(item=>{
                                return {name:item.name,value:utils.config.ID_PREFIX+item.value - 0,level:item.level}
                            })//加前缀，编辑时勾选状态 
                                console.log('vm.stations.value',vm.stations.value)
                        }
                    });
                }
             
                vm.isadd = false;

                vm.editInfo={show:true,title:'修改信息',saveloading:false,info};
            },
            addClick:function(){
                var vm = this;
                vm.isadd = true;
                vm.editInfo={show:true,title:'添加信息',saveloading:false,info:{}};
                vm.stations= {show:false,value:[]}
            },
            editSubmit:function(){
                var vm = this;
                let reduceIdsPrefix = vm.stationVal.split(',').map(item=>(item+'').replace(utils.config.ID_PREFIX,'')).join(',');// stationVal 要去掉前缀
                if(!vm.editInfo.info.name) return  vm.$message({ showClose:true, message:'车场区域名称不能为空',type:'error'});
                if(!reduceIdsPrefix) return vm.$message({ showClose:true, message:'车场不能为空',type:'error'});
                let submitData={
                    station_id:reduceIdsPrefix,
                    name:vm.editInfo.info.name
                }
                var url = '/domain/add';
                if(!vm.isadd)
                {
                    submitData.id=vm.editInfo.info.id
                    url='/domain/update'
                }
                vm.editInfo.saveloading = true;
                utils.fetch(url,{method:'POST',body:submitData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editInfo.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                         vm.editInfo.saveloading = false;
                    }
                })
            },
            getData:function(){
                var vm = this;
                var url ='/domain/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var {...searchs} = vm.search;
                var querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    vm.shade = false;
                    utils.setCache(vm);
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search ={name:'',station_id:''}
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            stationUnique:function(){
                var data = [];
                var lists = this.stations.value;
                if(lists.length > 0){
                    for(var i in lists){
                        if(lists[i].level == 3){
                            data.push({value:lists[i].value,name:lists[i].name});
                        }
                    }
                }
                return data;
            },
            getRowStation:function(str){
                return utils.fetch("/station/lists?station_ids="+str+"&page=0&pagesize=0").then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        var data = [];
                        if(json.content){
                            data = json.content.lists.map(function(k){
                                return {value:k.id,name:k.name,level:3};
                            });
                        }
                        return data;
                    }
                });
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
