<template>

    <div id='box' class="menu-hide">
        <div class="worker car">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-plate v-model="search.car" size="small" class="cell widthX120" placeholder="车牌"></my-select-plate>
                    <el-input v-model="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addMultipleClick" size="small"><i class="fa fa-user-circle"></i>批量添加</el-button>
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index"  width="40"></el-table-column>
                    <el-table-column prop="plate" label="车牌"  min-width="90"></el-table-column>
                    <el-table-column prop="user" label="车主"  min-width="90"></el-table-column>
                    <el-table-column prop="phone" label="手机号"  width="150"></el-table-column>
                    <el-table-column prop="creationtime" label="创建时间"  width="250"></el-table-column>
                    <el-table-column label="操作" fixed="right"  width="100">
                        <template slot-scope="scope">
                            <el-button plain size="mini" @click="updateClick(scope.$index,scope.row)"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
           <el-dialog :title="edit.title" :visible.sync="edit.show">
                 <el-form :model="edit.info" v-if='!addMultiple' label-width="130px">
                    <el-form-item label="车牌:" v-if='!isadd'>
                       <my-select-plate v-model="edit.info.id" size="small" v-if='!isadd' width='100%' :disabled='true'></my-select-plate>
                    </el-form-item>
                    <el-form-item label="车牌:" v-if='isadd'>
                        <el-input v-model="edit.info.plate"  placeholder="车牌"></el-input>
                    </el-form-item>
                    <el-form-item label="车主:">
                        <el-input v-model="edit.info.user"  placeholder="车主"></el-input>
                    </el-form-item>
                    <el-form-item label="手机:">
                        <el-input v-model="edit.info.phone"  placeholder="手机"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="updateSubmit" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
                <el-form  v-if='addMultiple' label-width="130px">
                    <el-form-item label="数量:">
                        <el-input v-model="edit.total" type='number' min="1"  placeholder="批量生成数量"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="addSubmit" type="primary" size="small">提交</el-button>
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
            let url = {
                add:'/untruecar/add',
                lists:'/untruecar/lists',
                update:'/untruecar/update',
                batchadd:'/untruecar/batchAdd',
            }
            return {
                url,
                shade:false,
                search:{car:'',phone:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                edit:{title:'',show:false,info:{phone:'',user:'',car:''}},
                isadd:false,
                addMultiple:false,
            };
        },
        computed:{
     
        },
        methods:{
            addMultipleClick(){
                this.addMultiple = true;
                this.edit= {title:'批量添加虚拟车牌',show:true, total:''}
            },
            addClick:function(){
                var vm = this;
                vm.isadd = true;
                vm.addMultiple = false;
                vm.edit= {title:'添加虚拟车牌',show:true,info:{plate:'',phone:'',user:''}}
            },
            updateClick:function(index,row){
                var vm = this;
                vm.edit.title= '编辑虚拟车牌'
                vm.edit.show = true;
                vm.isadd = false;
                vm.addMultiple = false;
                vm.edit.total = '';
                let {id,phone,user} = row;
                vm.edit.info= {id,user,phone};
            },
            addSubmit(){
                let vm = this;
                let url =vm.url.batchadd;
                let number = vm.edit.total;
                utils.fetch(url,{method:'POST',body:{number}}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.edit.show = false;
                            vm.$message({ showClose:true, message:res.message, type:'success' });
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            updateSubmit:function(){
                var vm = this;
                var url = vm.isadd?vm.url.add:vm.url.update;
                var editData={
                    user : vm.edit.info.user,
                    phone : vm.edit.info.phone,
                }; 
                if(vm.isadd){editData.plate=vm.edit.info.plate}else{
                    editData.id=vm.edit.info.id
                }
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.edit.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.car) dat += "&car_id="+this.search.car;
                if(this.search.phone) dat += "&phone="+this.search.phone;
                var url = '/untruecar/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0 && json.content !='') ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
            },
            setPageData(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {car:'',phone:''};
                this.getData();
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
