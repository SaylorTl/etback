
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model="search.name"  size="small" class="cell widthX120"  placeholder="机器人名称"></el-input>
                    <el-input v-model="search.number"  size="small" class="cell widthX120"  placeholder="机器人编码"></el-input>
                    <el-input v-model="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-button @click="getData()" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData()" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="#" min-width="40"></el-table-column>
                     <el-table-column label="在线" width="60">
                        <template slot-scope="scope">
                            <i class="fa fa-star red" v-if="scope.row.online"></i>
                            <i class="fa fa-star-o" v-else></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="机器人名称" min-width="90"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="110"></el-table-column>
                    <el-table-column label="方向" width="60">
                        <template slot-scope="scope">{{scope.row.type == 'in'?'进场':'出场'}}</template>
                    </el-table-column> 
                    <el-table-column label="状态" min-width="60">
                        <template slot-scope="scope">{{scope.row.status == 'Y'?'激活':'禁止'}}</template>
                    </el-table-column>
                    <el-table-column prop="mobile" label="手机号" min-width="80"></el-table-column>
                    <el-table-column prop="number" label="机器人编码" min-width="120"></el-table-column>
                    <el-table-column prop="creationtime" label="分配时间" min-width="150"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="150"></el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator v-if="tableData.length!=0" @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item  label="机器人名称:" >
                        <el-input v-model="editInfo.name" placeholder="名称"></el-input>
                    </el-form-item>
                    <el-form-item  label="停车场:">
                        <my-select-station v-model="editInfo.station_id" size="small" class="cell" width="100%" placeholder="停车场" style='top:0'></my-select-station>
                    </el-form-item>
                    <el-form-item  label="编码:">
                        <el-input v-model.trim="editInfo.number" placeholder="编码"></el-input>
                    </el-form-item>
                    <el-form-item  label="机器人手机号码:">
                        <el-input v-model.trim="editInfo.robot_mobile" placeholder="机器人手机号码"></el-input>
                    </el-form-item>
                    <el-form-item  label="方向:">
                    <el-radio-group v-model="editInfo.type">
                        <el-radio :label="'in'">进场</el-radio>
                        <el-radio :label="'out'">出场</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item  label="状态:" v-if='editInfo.id'>
                        <el-radio-group v-model="editInfo.status">
                            <el-radio :label="'Y'">激活</el-radio>
                            <el-radio :label="'N'">禁止</el-radio>
                          </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
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
            return {
                inputlength:150,
                btnText:{'1':'开闸','2':'显示'},
                shade:false,
                loadVendor:false,
                updateVisible:false,
                remoteInfo:{title:'',cmd:'',show:false,info:{}},
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{station_id:'',name:'',number:'',mobile:''},
                tableData:[],
                editInfo:{name:'',station_id:'',number:'',robot_mobile:'',status:''},
             }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              const { page, pagesize } = this.pagination;
              this.getData(page, pagesize);
            },
            updateClick:function(index,row){
                var vm = this;
                vm.updateVisible = true;
                vm.updateTitle = "编辑机器人信息";
                let {id,number,name,type,status,station:station_id,mobile:robot_mobile,...others} = row;
                vm.editInfo={id,number,name,type,status,station_id,robot_mobile};
            },
            addClick:function(){
                var vm = this;
                vm.updateVisible = true;
                vm.updateTitle = "添加机器人信息";
                vm.editInfo={name:'',station_id:'',number:'',robot_mobile:'',type:'in'};
            },
            editSubmit:function(){
                var vm = this;
                var msgMap = {'name':'机器人名称','station_id':'停车场','number':'机器人编码','robot_mobile':'机器人手机号'};
                for(var i in msgMap){
                    if(!vm.editInfo[i]){
                    vm.$message({ showClose:true, message:msgMap[i]+'不能为空', type:'error' }); return;
                    }
                }
                if(!utils.isMobile(vm.editInfo.robot_mobile)){
                    vm.$message({ showClose:true, message:'手机号格式不正确', type:'error' }); return;
                }
                let {id,...others} = vm.editInfo;
                var editData={...others};
                var url = id?"/device/robotUpdate":'/device/robotAdd';
                if(id){editData.robot_id = id;}
                utils.fetch(url,{method:'POST',body:editData}).then((res)=>{
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.updateVisible = false;
                            vm.$message({ showClose:true, message:res.message, type:'success' });
                            setTimeout(function(){vm.getData()},2000)
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })

            },
            btnUndo:function(){
                this.search = {station_id:'',name:'',number:'',mobile:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData:function(page=1, pagesize=20){
                var vm = this;
                var url = "/device/robotLists?page="+page+"&pagesize="+pagesize;
                if(vm.search.mobile&&!utils.isMobile(vm.search.mobile)){
                    vm.$message({ showClose:true, message:'手机号格式不正确', type:'error' }); return;
                }
                if(vm.search.name&&vm.search.name.length>vm.inputlength){
                    vm.$message({ showClose:true, message:'机器人名称过长', type:'error' }); return;
                }
                if(vm.search.number&&vm.search.number.length>vm.inputlength){
                    vm.$message({ showClose:true, message:'机器人编码过长', type:'error' }); return;
                }
                let searchStr = utils.setQueryString({...vm.search});
                url += searchStr ? '&' + searchStr : '';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.tableData = res.content.lists;
                            vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                            utils.setCache(vm);
                        }
                    }
                    vm.shade = false;
                })
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

<style>
    .el-form-item{
        margin-bottom: 12px;
    }
</style>
