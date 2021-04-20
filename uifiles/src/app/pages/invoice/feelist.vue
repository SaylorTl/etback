<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.name"  size="small" class="cell widthX120"  placeholder="费用名称"></el-input>
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
                    <el-table-column prop="name" label="费用名称" width="400"></el-table-column>
                    <el-table-column prop="spbm" label="商品编码" width="250"></el-table-column>
                    <el-table-column prop="rate" label="费用定比" min-width="160"></el-table-column>
                    <el-table-column prop="fee" label="费用定额" min-width="160"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                            <!-- <el-button @click="delClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>删除</el-button> -->
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item label="费用名称:">
                        <el-input v-model="editor.info.name" size="small" placeholder="费用名称"></el-input>
                    </el-form-item>
                    <el-form-item label="商品编码:">
                        <el-input v-model="editor.info.spbm" size="small" placeholder="商品编码"></el-input>
                    </el-form-item>
                    <el-form-item label="收取方式:">
                        <el-select class="widthX100"  size="small" v-model="editor.info.type" placeholder="费用">
                            <el-option v-for="(v,k) in feemap" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                        <el-input v-model="editor.info.value" size="small" placeholder="税率" class="widthX200" ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.saveloading'>{{editor.btnText}}</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>


</template>

<script>
    import utils from '../../../utils/utils.js';
    let config = window.etback.config;
    export default {
        data:function(){
            let url={
                feelists:'/invoice/listsFee',
                add:'/invoice/addFee',
                update:'/invoice/updateFee',
                del:'/invoice/deleteFee'
            };
            let feemap = {'rate':'定比','fee':'定额'};
            return {
                url,feemap,
                shade:false,
                search:{name:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                editor:{title:'',show:false,saveloading:false,btnText:'',info:{name:"",spbm:"",type:"", value :""}},
            }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            updateClick(row){
                let vm = this;
                vm.editor.show = true;
                vm.editor.title = "编辑信息";
                vm.editor.btnText = "保存";
                vm.isadd = false;
                vm.editor.info.name = row.name;
                vm.editor.info.spbm = row.spbm;
                vm.editor.info.type = row.rate !== 0?'rate':'fee';
                vm.editor.info.value = row.rate !== 0?row.rate:row.fee;
                vm.editor.info.id = row.id;
            },
            delClick(row){
                let vm = this;
                let url = vm.url.del;
                let deldata = {id:row.id};
                utils.fetch(url,{method:'POST',body:deldata}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }

                    }
                })
            },
            addClick(){
                let vm = this;
                vm.editor.show = true;
                vm.editor.title = "添加信息";
                vm.editor.btnText = "添加";
                vm.isadd = true;
                vm.editor.saveloading = false;
                vm.editor.info={name:"",spbm:"",type:"",value:""};
            },
            editSubmit(){
                let vm = this;
                let url = vm.isadd?vm.url.add:vm.url.update;
                let info = vm.editor.info;
                if(info.name===''){
                    vm.$message({ showClose:true, message:'费用名称不能为空',type:'error' }); return
                }
                if(info.spbm===''){
                    vm.$message({ showClose:true, message:'商品编码不能为空',type:'error' }); return
                }
                if(!info.value){
                    vm.$message({ showClose:true, message:'税率不能为空或零',type:'error' }); return
                }
                if(info.type!=='rate'&&info.type!=='fee'){
                    vm.$message({ showClose:true, message:'收取方式不能为空或零',type:'error' }); return
                }
                let editData = {
                    name:info.name,
                    spbm:info.spbm,
                    rate:info.type==='rate'?info.value:0,
                    fee:info.type==='fee'?info.value:0,
                }
                if(!vm.isadd){editData.id =info.id}
                vm.editor.saveloading = true;
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editor.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                        vm.editor.saveloading = false;
                    }
                })
            },
            getData:function(){
                var vm = this;
                var url = vm.url.feelists+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var searchmap ={
                    "name":vm.search.name
                }
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(res && res.code === 0 && res.content){
                        vm.tableData = res.content.lists;
                        vm.pagination.total = res.content.total;
                    }else {
                        vm.tableData = [];
                        vm.pagination.total = 0;
                    } 
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {name:''};
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
