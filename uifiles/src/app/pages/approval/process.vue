
<template>
    <div id="box"  class="menu-hide">
        <div class="worker station">
             <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.name" size="small" class="cell widthX100"  placeholder="审批名称"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                </div>
             </div>
            <div class='table box-width'>
               <el-table :data="tableData" border style="width: 100%" v-loading="shade">
                   <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="附件列表:">
                                    <template v-if='props.row.file.length>0'>
                                        <a :href="item" target="_blank" v-for='(item,index) in props.row.file' :key="index">
                                            <el-button plain icon="el-icon-document" size='mini'>附件{{index+1}}</el-button>
                                        </a>
                                    </template>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="#" prop='id' min-width='65'></el-table-column>
                    <el-table-column label="审批名称" prop='name' min-width="100"></el-table-column>
                    <el-table-column label="审批人"  min-width='150'>
                        <template slot-scope ='scope'>
                            <span>{{scope.row.flow_name.join('--')}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="执行人" prop='executor_name' min-width='65'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='65'></el-table-column>
                    <el-table-column label="创建时间" prop='creationtime' min-width='120'></el-table-column>
                    <!-- <el-table-column label="修改时间" prop='modifytime' min-width='120'></el-table-column> -->
                    <el-table-column label="备注" prop='remark' min-width='140'></el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="delClick(scope.row)" plain size="mini"><i class="fa fa-trash-o"></i>删除</el-button>
                            <el-button @click="statusClick(scope.row)" plain size="mini"><i class="fa fa-pencil"></i>修改状态</el-button>
                        </template>
                    </el-table-column>
              </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px" >
                    <el-form-item  label="审批名称:">
                        <el-input v-model="editor.info.name"  placeholder="审批名称" size="small" ></el-input>
                    </el-form-item>
                    <el-form-item  label="添加审批人:">
                    <el-select v-model="oa_users.oavalue" size="small"  placeholder="添加审批人,请根据OA账号或者私有账号查找" filterable remote clearable :remote-method="getExaminer" v-loading='oa_users.loading1' @change ='setOa'>
                        <el-option v-for="item in oa_users.data" :key="item.id" :value="item.id" :label="item.oa||item.username"></el-option>
                    </el-select>
                    </el-form-item>
                    <template v-if='examiners.length>0'>
                        <el-form-item label="审批人列表:">
                            <div class="examiner_lists">
                                <ul>
                                    <li v-for='(item, index) in examiners' :key="index">
                                        <span class="exam_title">{{cfg.degs[index+1]+'审批人:'}}</span>
                                        <span class="exam_name">
                                            {{(item.type==='1'?item.oa:item.username)}}
                                            <em>{{"("+(item.type==='1'?'OA':'私有账号')+")"}}</em>
                                            {{" —— "+(item.fullname||'未知')}}
                                        </span>
                                        <i class="el-icon-circle-close-outline" @click.prevent="removeItem(index)"></i>
                                    </li>
                                </ul>
                            </div>
                        </el-form-item>
                    </template>
                    <el-form-item label="执行人:">
                        <el-select v-model="editor.info.executor" size="small" placeholder="添加执行人,请根据OA账号或者私有账号查找" filterable remote clearable :remote-method="getExecutor" v-loading='oa_users.loading2' @change ='setExecutor'>
                            <el-option v-for="item in oa_users.data" :key="item.id" :value="item.id" :label="item.oa||item.username"></el-option>
                        </el-select>
                        <span class="blue" v-if='executorObj.fullname'>
                            {{"("+(executorObj.type==='1'?'OA':'私有账号')+")"}}
                            {{" —— "+(executorObj.fullname||'未知')}}
                        </span>
                    </el-form-item>
                    <el-form-item label="附件:">
                        <my-upload @change='setUploadFiles' :fileLimit='cfg.file_num' :uploadUrl="cfg.url.upload" v-model='fileslist_me'></my-upload>
                    </el-form-item>
                    <el-form-item  label="状态:">
                        <el-select v-model="editor.info.status" size="small"  placeholder="状态">
                            <el-option v-for='(val,key) in cfg.status' :label='val' :key='key' :value='key'/>
                        </el-select>
                    </el-form-item>
                   <el-form-item  label="备注说明:">
                        <el-input type="textarea" v-model="editor.info.remark" size="small"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" class='mr40' :loading="editor.saveloading">提交</el-button>
                        <el-button @click="resetForm" size="small">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import store from '../../store/store.js';
import utils from '../../../utils/utils.js';
export default  {
    data:function() {
        let cfg={
                num:5,//审批人数量
                file_num:5,//上传附件数量
                url:{
                    list:'/workexamine/flowlists',
                    getoa:'/user/lists', // keyword
                    upload:'/workexamine/uploadfile', // file []
                    add:'/workexamine/flowadd', 
                    del:'/workexamine/flowdelete', 
                    update:'/workexamine/flowupdate', 
                },
                status:{'0':'禁用','1':'启用'},
                degs:{1:'一级',2:'二级',3:'三级',4:'四级',5:'五级'},
            }
        return {
            cfg,
            shade:false,
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            editor:{title:'新建审批流程',show:false,saveloading:false,info:{name:'',examiner:'',executor:'',file:'',status:'1',remark:''}},
            search:{executor:'',name:''},
            tableData:[],
            examiners:[], //审批人
            executorObj:{type:'1',fullname:''}, //执行人
            oa_users:{data:[],loading1:false,loading2:false,oavalue:''}, // oa 账号请求的数据
            fileslist_me:{data:[],names:[]} //表单附件
        }
    },
    watch:{},
    mounted(){},
    methods:{
        setUploadFiles(obj){
            this.fileslist_me = obj;
        },
        statusClick(row){
            let vm = this;
            var url = vm.cfg.url.update;
            let newStatus = row.status===1?0:1;
            let data = {id:row.id,status:newStatus}
            let confirmstr= `当前审批流程的状态为<span class='red'>${vm.cfg.status[row.status]}</span>,需要修改为<span class='red'>${vm.cfg.status[newStatus]}</span>吗`;
            vm.$confirm(confirmstr, `提示`, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                dangerouslyUseHTMLString: true,
                type: 'warning'})
            .then((action) => {
               if(action=='confirm'){
                utils.fetch(url,{ method:'POST',body:data}).then(function(res){
                    if(typeof(res) != 'undefined' && res.code===0){
                        vm.$message({ showClose:true, message:'修改成功', type:'success'})
                        vm.getData();
                    }else{
                        vm.$message({ showClose:true, message:'修改失败', type:'error'})
                    }
                })
               }
            }).catch(() => {
              vm.$message({type: 'warning',message: '已取消修改操作'});          
            });
        },
        delClick(row){
            let vm = this;
            var url = vm.cfg.url.del;
            let data = {id:row.id}
            vm.$confirm('确认要删除这条审批流程纪录？', '提示', {confirmButtonText: '确定',
                cancelButtonText: '取消',type: 'warning'})
            .then((action) => {
               if(action=='confirm'){
                utils.fetch(url,{ method:'POST',body:data}).then(function(res){
                    if(typeof(res) != 'undefined' && res.code===0){
                        vm.$message({ showClose:true, message:'删除成功', type:'success'})
                        vm.getData();
                    }else{
                        vm.$message({ showClose:true, message:'删除失败', type:'error'})
                    }
                })
               }
            }).catch(() => {
              vm.$message({type: 'warning',message: '已取消删除操作'});          
            });
        },
        
        removeItem(index) {
            if (index !== -1) {
              this.examiners.splice(index, 1)
            }
        },
        
        getExaminer(query){this.getOaList(query,1)},
        getExecutor(query){this.getOaList(query,2)},
        getOaList(query,idx){
            let vm = this;
            let url = `${vm.cfg.url.getoa}?page=1&pagesize=100&keyword=${query}`;
            vm.oa_users.data = [];
            if(query!==''){
                vm.oa_users['loading'+idx] = true;
                utils.fetch(url).then(res=>{
                    if(res.code===0&&res.content){
                        vm.oa_users.data = res.content.lists||[];
                    }
                    vm.oa_users['loading'+idx] = false;
                })
            }else{
                 vm.oa_users.data = [];
            }
        },
        addItem(val) {
            let vm = this;
            let obj = vm.oa_users.data.filter(item=>item.id === val)
            if(vm.examiners.length<vm.cfg.num){
                vm.examiners.push(obj[0]); 
            }else{
                vm.$message({ showClose:true, message:`审批人不超过${vm.cfg.num}个`, type:'info' });
            }
        },
        setOa(val){
            let vm = this;
            if(val==='')return;
            vm.addItem(val);
            vm.oa_users={data:[],loading:false,oavalue:''};
        },
        setExecutor(val){
            let vm = this;
            if(!val){vm.executorObj = {type:'1',fullname:''};return;}
            let obj = vm.oa_users.data.filter(item=>item.id === val);
            vm.executorObj = obj.length>0? obj[0] : {type:'1',fullname:''};
        },
        editSubmit(){
            let vm = this;
            let url = vm.cfg.url.add;
            let data = vm.editor.info;
            if(!data.name){vm.$message({ showClose:true, message:'审批名称必填', type:'error' });return;}
            if(vm.examiners.length===0){vm.$message({ showClose:true, message:'审批人必填', type:'error' });return;}
            data.examiner = vm.examiners.map(item=>item.id).join(',');//审批人
            data.file = vm.fileslist_me.data ? vm.fileslist_me.data.join(','):'';//附件
            vm.editor.saveloading = true;
            utils.fetch(url,{method:'POST',body:data}).then(function(res){
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
        addClick(){
            this.editor.title = '新建审批流程';
            this.editor.show = true
        },
        resetForm(){
            this.editor={
                title:'新建审批流程',show:true,saveloading:false,
                info:{name:'',examiner:'',executor:'',file:'',status:'1',remark:''}
            }
            this.examiners = [];
            this.fileslist_me='';
        },
        setPageData:function(pageObj){
          this.pagination = pageObj;
          this.getData();
        },
        getData:function(){
            var vm = this;
            var url = vm.cfg.url.list+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
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
        //重置按钮
        btnUndo:function(){
            this.search={};
            this.pagination.page = 1;
            this.getData();
        },
        //查找
        btnSearch:function(){
            this.pagination.page = 1;
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
    }
}
</script>
