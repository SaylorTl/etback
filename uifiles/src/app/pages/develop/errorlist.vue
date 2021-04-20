<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.appid"  size="small" class="cell widthX120"  placeholder="appid"></el-input>
                    <el-input v-model="search.code"  size="small" class="cell widthX120"  placeholder="code"></el-input>
                    <el-input v-model="search.flag"  size="small" class="cell widthX120"  placeholder="flag"></el-input>
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
                    <el-table-column prop="appid" label="appid" width="120">
                    </el-table-column>
                    <el-table-column prop="code" label="code" min-width="80"></el-table-column>
                    <el-table-column prop="flag" label="flag" min-width="120"></el-table-column>
                    <el-table-column prop="message" label="message" min-width="220"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                            <el-button @click="delClick(scope.row)" plain size="mini" type="danger"><i class="fa fa-trash-o"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item label="appid:">
                        <el-input v-model="editor.info.appid" size="small" placeholder="appid"></el-input>
                    </el-form-item>
                    <el-form-item label="flag:">
                        <el-input v-model="editor.info.flag" size="small" placeholder="flag"></el-input>
                    </el-form-item>
                    <el-form-item label="code:">
                        <el-input v-model="editor.info.code" size="small" placeholder="code是四位数字构成"></el-input>
                    </el-form-item>
                    <el-form-item label="message:">
                        <el-input v-model="editor.info.message" size="small" placeholder="message" type="textarea"></el-input>
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
    export default {
        data:function(){
            let url={   
                lists:'/mistake/lists', 
                del:'/mistake/delete',
                add:'/mistake/add',
                update:'/mistake/update',
            }
            return {
                url,
                shade:false,
                isadd:true,
                search:{appid:'',code:'',flag:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                editor:{title:'',show:false,saveloading:false,btnText:'',info:{appid:"",flag:"", code :"", message:''}},
                tableData:[],
                
            }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            delClick:function(row){
                var vm = this;
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
            updateClick:function(row){
                var vm = this;
                vm.editor.show = true;
                vm.editor.title = "编辑";
                vm.editor.btnText = "保存";
                vm.isadd = false;
                let {id,appid,flag,code,message} = row;
                vm.editor.info={id,appid,flag,code,message};
                console.log(vm.editor.info)
            },
            addClick:function(){
                var vm = this;
                vm.editor.show = true;
                vm.editor.title = "添加信息";
                vm.editor.btnText = "添加";
                vm.isadd = true;
                vm.editor.saveloading = false;
                vm.editor.info={appid:"",flag:"", code :"", message:''};
                
            },
            editSubmit:function(){
                var vm = this;
                var url = vm.isadd?vm.url.add:vm.url.update;
                let info = vm.editor.info;
                if(!info.appid||!info.flag||!info.code||!info.message){
                    this.$message({ showClose:true, message:'表单值不能为空',type:'error' }); return
                }
                vm.editor.saveloading = true;
                let editData = Object.assign({},vm.editor.info);
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
                var url = vm.url.lists+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var searchmap ={
                    "appid":vm.search.appid,
                    "code":vm.search.code,
                    "flag":vm.search.flag
                }
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.tableData = res.content.lists || [];
                            vm.pagination.total = res.content.total || 0;
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
            btnUndo:function(){
                this.search = {appid:"",flag:"", code :"", message:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },

        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.getData();
            });
        },
    }

</script>

