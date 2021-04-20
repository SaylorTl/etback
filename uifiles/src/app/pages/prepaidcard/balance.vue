<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.username" size="small" class="cell widthX150"   placeholder="用户名"></el-input>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX150"   placeholder="手机号"></el-input>
                    
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
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="name" label="账户名称" width="120"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="150"></el-table-column>
                    <el-table-column label="用户" min-width="110">
                        <template slot-scope="scope">
                            <span>{{scope.row.user_name+'/'+scope.row.phone}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="balance" label="余额" min-width="60"></el-table-column>
                    <!-- <el-table-column prop="client" label=" " min-width="70"></el-table-column> -->
                    <el-table-column label="自动付款" min-width="70">
                        <template slot-scope="scope">
                            <span>{{cfg.paid[scope.row.auto_paid]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="110"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="120"></el-table-column> 
                    <el-table-column label="操作" width="140">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini" ><i class="fa fa-pencil-square-o"></i>授权</el-button>
                            <el-button @click="modifyClick(scope.row)" plain size="mini" ><i class="fa fa-pencil-square-o"></i>修改</el-button>
                           <!--  <el-button @click="updateClick(scope.row)" plain size="mini" ><i class="fa fa-pencil-square-o"></i>授权信息</el-button> -->
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form label-width="120px">
                    <el-form-item label="车牌:">
                        <my-select-plate v-model.trim="editor.info.car_id" size="small" width="100%" placeholder="请输入车牌" @select="select($event,'plate')"></my-select-plate>
                    </el-form-item>
                    <el-form-item label="车牌列表:" v-if="plates.length>0">
                        <el-tag v-for="(tag,index) in plates" :key="tag.name" @close="reduce(index,'plate')" closable :value="tag.value"> {{tag.name}} </el-tag>
                    </el-form-item>
                    <el-form-item label="停车场:">
                        <my-select-station v-model.trim="editor.info.station_id" size="small" width="100%" placeholder="停车场" :disabled='true'>
                        </my-select-station>
                    </el-form-item>
                    <el-form-item label="停车场列表:" v-if="stations.length>0">
                        <el-tag v-for="(tag,index) in stations" :key="tag.name" @close="reduce(index,'station')" closable :value="tag.value"> {{tag.name}} </el-tag>
                    </el-form-item>
                    <el-form-item label="金额:">
                        <el-input v-model="editor.info.amount" size="small" placeholder="金额"></el-input>
                    </el-form-item>
                    <el-form-item label="代扣类型:">
                        <el-radio-group v-model="editor.info.type">
                            <el-radio v-for="(val,key) in cfg.typemap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.btnloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="modify.title" :visible.sync="modify.show">
                <el-form label-width="120px">
                    <el-form-item label="账户名称:">
                        <el-input v-model="modify.info.name" size="small" placeholder="账户名称"></el-input>
                    </el-form-item>
                    <el-form-item label="停车场:">
                        <my-select-station v-model.trim="modify.info.station_id" size="small" width="100%" placeholder="停车场">
                        </my-select-station>
                    </el-form-item>
                   <!--  <el-form-item label="手机号:" v-if="!isAdd">
                        <el-input v-model="modify.info.new_mobile" size="small" placeholder="授权手机号"></el-input>
                    </el-form-item> -->
                    <el-form-item label="手机号:" v-if="isAdd">
                        <el-input v-model="modify.info.mobile" size="small" placeholder="授权手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="自动付款:" v-if="isAdd">
                        <el-radio-group v-model="modify.info.auto_paid">
                            <el-radio v-for="(val,key) in cfg.paid" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="modifySubmit" type="primary" size="small" :loading='modify.btnloading'>提交</el-button>
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
            paid:{'N':'否','Y':'是'},
            statusmap:{"Y":"启用" ,"N":"禁用"},
            typemap:{"all":"全额" ,"ration":"定额"},
            url:{
                list:'/balance/lists',
                show:'/balance/show',
                update:'/balance/update',
                add:'/balance/add',
                authadd:'/balance/authAdd',
            }
        }
        return{
            cfg,
            source:utils.config.payMethod,
            search:{username:'',mobile:'',dept:'',station_id:''},
            shade:false,
            tableData:[],
            plates:[],
            stations:[],
            isAdd:false,
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            editor:{title:'',show:false,btnloading:false,info:{car_id:'',station_id:'',mobile:'',amount:'',type:'',client_id:''}},
            modify:{title:'',show:false,btnloading:false,info:{name:'',phone:''}}
        }
    },
     
    methods: {
        addclick(){
            this.isAdd = true;
            this.plates=[];
            this.stations=[];
            this.modify = {title:'添加信息',show:true,btnloading:false,info:{name:'',mobile:'',auto_paid:'N'}}
        },
        modifyClick(row){
            this.isAdd = false;
            this.modify = {title:'修改信息',show:true,btnloading:false,info:{name:row.name,id:row.id,station_id:row.station}}
        },
        modifySubmit(){
            let vm = this;
            let url = vm.isAdd?vm.cfg.url.add:vm.cfg.url.update;
            let data = vm.modify.info;
            if(data.station_id===''||data.station_id===0){
                vm.$message({ showClose:true, message:'停车场必填', type:'error' });return
            }
            vm.modify.btnloading = true
            utils.fetch(url,{method:'post',body:data}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0) {
                        vm.modify.btnloading= false;
                        vm.modify.show = false;
                        vm.getData();
                    }else{
                        vm.$message({showClose:true, message:res.message, type:'error' });
                    }
                }
            })
        },
        select(obj,type){
            let array = type === 'plate'?this.plates:this.stations;
            let index = array.findIndex((item)=>{
                return item.value === obj.value
            });
            if(index === -1){
                array.push(obj);
            }
        },
        reduce(index,type){
            let array = type === 'plate'?this.plates:this.stations;
            if (index !== -1) {
                array.splice(index, 1)
            }
        },
        getIds(array){
            let ids = [];
            array.forEach(item=>{ids.push(item.value)});
            return ids.join(',');
        },
        editSubmit(){
            let vm = this;
            let {station_id,amount,type,client_id} = vm.editor.info;
            if(vm.plates.length===0){
                vm.$message({ showClose:true, message:'车牌必填', type:'error' });return
            }
            //非必填
            // if(vm.stations.length===0){
            //     vm.$message({ showClose:true, message:'停车场必填', type:'error' });return
            // }
            let url = vm.cfg.url.authadd;
            let car_ids = vm.getIds(vm.plates);
            //let station_ids =vm.getIds(vm.stations);
            let data = {amount,type,car_ids,station_id,client_id}
            vm.editor.btnloading = true
            utils.fetch(url,{method:'post',body:data}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0) {
                        vm.editor.btnloading= false;
                        vm.editor.show = false;
                        vm.getData();
                    }else{
                        vm.$message({showClose:true, message:res.message, type:'error' });
                    }
                }
            })
        },
        updateClick(row){
            let vm = this;
            vm.editor.title='授权';
            vm.editor.show = true;
            vm.plates = [];
            vm.editor.btnloading= false;
            vm.editor.info={car_id:'',client_id:row.client,station_id:row.station, mobile:'',amount:'',type:'all'};

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
            this.search = {username:'',mobile:'',dept:'',station_id:''};
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
            var url = vm.cfg.url.list+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
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
<style>
    .el-tag+.el-tag {
    margin-left: 10px;
}
</style>
