<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.name" size="small" class="cell widthX120"  placeholder="易停单号"></el-input>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX150"  placeholder="手机号"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   border fit style="width:100%">
                    <el-table-column prop="id" label="id" width="70"></el-table-column>
                    <el-table-column  label="用户/手机号" min-width="200">
                    <template slot-scope="scope">{{scope.row.name}}/{{scope.row.mobile}}</template>
                    </el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="100"></el-table-column>
                    <el-table-column prop='register_code' label="报名码" min-width="160">
                    </el-table-column>
                    <el-table-column prop='strong_premium' label="交强险" min-width="160">
                    </el-table-column>
                    <el-table-column prop='busi_premium' label="商业险" min-width="160">
                    </el-table-column>
                    <el-table-column prop='discount_rate' label="折扣率" min-width="80">
                    </el-table-column>
                    <!-- <el-table-column prop='tax' label="车船税" min-width="180">
                    </el-table-column> -->
                    <el-table-column label="操作" fixed="right"  width="100">
                        <template slot-scope="scope">
                           <el-button @click='updateClick(scope.row)' plain size="mini">编辑</el-button> 
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title"  :visible.sync="editor.show">
                <el-form label-width="120px" :model="editor.info">
                    <el-form-item label="交强险">
                        <el-input v-model="editor.info.strong_premium" size="small" placeholder="交强险"></el-input>
                    </el-form-item>
                    <el-form-item label="商业险">
                        <el-input v-model="editor.info.busi_premium" size="small" placeholder="商业险"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="车船税">
                        <el-input v-model="editor.info.tax" size="small" placeholder="车船税"></el-input>
                    </el-form-item> -->
                    <el-form-item>
                        <el-button type="primary" @click="submitForm" :loading='editor.btnloading'>提交</el-button>
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
                url:{lists:'/insurance/lists',
                update:'/insurance/update'},
            }
            return {
                cfg,
                shade:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{name:'',mobile:''},
                editor:{title:'',show:false,info:{strong_premium:'',busi_premium:'',tax:''},btnloading:false},
            }
        },
        methods:{
            updateClick(row){
                let {strong_premium,busi_premium,tax,id} = row;
                this.editor={
                    title:'车险修改',
                    show:true,
                    info:{strong_premium,busi_premium,tax,id},
                    btnloading:false
                };
            },
            submitForm(){
                let vm = this;
                let url = vm.cfg.url.update;
                let data = vm.editor.info;
                utils.fetch(url,{method:'POST',body:data}).then(function(res){
                    if(res.code === 0){
                        vm.$message({ showClose:true, message:res.message, type:'success' });
                        vm.editor.show = false;
                        vm.getData();
                    }else if(res.code === 1003){
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                        vm.editor.show = false;
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
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
                this.search = {name:'',mobile:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
           
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                let searchmap=Object.assign({},searchs);
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
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
