
<template>
    <div id="box"  class="menu-hide">
        <div class="worker station">
             <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.title" size="small" class="cell widthX150"  placeholder="审批主题"></el-input>
                    <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态" clearable>
                        <el-option v-for="(v,k) in cfg.status" :label="v" :value="k" :key='k'></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                </div>
             </div>
            <div class='table box-width'>
               <el-table :data="tableData" border style="width: 100%" v-loading="shade">
                    <el-table-column label="#" prop='id' min-width='65'></el-table-column>
                    <el-table-column label="主题" prop='title' min-width="100"></el-table-column>
                    <el-table-column label="发起人" prop='originator_name' min-width="100"></el-table-column>
                    <el-table-column label="审批人"  min-width='150'>
                        <template slot-scope ='scope'>
                            <span>{{scope.row.flow_name.join('--')}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="审批节点" prop='towhere' min-width='65'></el-table-column>
                    <el-table-column label="状态" prop='status_name' min-width='65'></el-table-column>
                    <el-table-column label="发起时间" prop='launch_time' min-width='120'></el-table-column>
                    <!-- <el-table-column label="修改时间" prop='modifytime' min-width='120'></el-table-column> -->
                    <!-- <el-table-column label="备注" prop='remark' min-width='140'></el-table-column> -->
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="createClick(scope.row)" plain size="mini"><i class="fa fa-send-o"></i>发布</el-button>
                            <el-button @click="showClick(scope.row)" plain size="mini"><i class="fa fa-file-o"></i>查阅</el-button>
                        </template>
                    </el-table-column>
              </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px" >
                    <el-form-item  label="主题:">
                        <el-input v-model="editor.info.title"  placeholder="主题" size="small" ></el-input>
                    </el-form-item>
                    <el-form-item label="流程:">
                        <el-select v-model="editor.info.fid" size="small"  placeholder="流程" filterable remote clearable>
                            <el-option v-for="item in processData" :key="item.id" :value="item.id" :label="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="附件:">
                        <my-upload @change='setUploadFiles' :fileLimit='cfg.file_num' :uploadUrl="cfg.url.upload" v-model='fileslist_me'></my-upload>
                    </el-form-item>
                   <el-form-item  label="内容:">
                        <el-input type="textarea" v-model="editor.info.content" size="small"></el-input>
                        <!-- <ueditor :id="ue" :config="uconfig" v-model="editor.info.content"></ueditor> -->
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" class='mr40' :loading="editor.saveloading">提交</el-button>
                        <el-button @click="resetForm" size="small">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="showdetail.title" :visible.sync="showdetail.show">
                 <table class="examed_show">
                        <tr>
                            <td class="item_td">主题:</td>
                            <td class="detail_td">{{showdetail.info.title}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">状态:</td>
                            <td class="detail_td">{{showdetail.info.status_name}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">发布人:</td>
                            <td class="detail_td">{{showdetail.info.originator_name}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">发布时间:</td>
                            <td class="detail_td">{{showdetail.info.launch_time}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">审批人:</td>
                            <td class="detail_td">{{showdetail.info.flow_name.join('--')}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">当前审批人:</td>
                            <td class="detail_td">{{showdetail.info.flow_name[showdetail.info.towhere]}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">内容:</td>
                            <td class="detail_td">{{showdetail.info.content}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">附件:</td>
                            <td class="detail_td">
                                <template v-if='showdetail.info.file.length>0'>
                                    <a :href="k" target="_blank" v-for='(k,idx) in showdetail.info.file' :key="idx">
                                        <el-button plain icon="el-icon-document" size='mini'>附件{{idx+1}}</el-button>
                                    </a>
                                </template>
                            </td>
                        </tr>
                    </table>
            </el-dialog>
            <el-dialog :visible.sync="imginsertTest" title='图片上传' width='40%'>
                <el-upload class="tc" :action="upload_url" :show-file-list="false" :before-upload="beforeupload" ref='uploadobj'>
                  <img v-if="imageBlob" :src="imageBlob" class="wechat_loadimg">
                  <i v-else class="el-icon-plus avatar-uploader-icon fontsize50"></i>
                </el-upload>
                <el-button @click="loadClick" type="primary" size="small">上传</el-button>
            </el-dialog>
        </div>
    </div>
</template>
<script>
let config = window.etback.config;
import utils from '../../../utils/utils.js';
export default  {
    data:function() {
        let cfg={
                file_num:10,//上传附件数量
                url:{
                    list:'/workexamine/launchlists',
                    getprocess:'/workexamine/flowlists', // keyword
                    upload:'/workexamine/uploadfile', // file []
                    launch:'/workexamine/launch', 
                    create:'/workexamine/create', 
                },
                status:{'0':'未发起','1':'审批中','2':'通过','3':'拒绝'},
            }
        return {
            cfg,
            ue:'ueditor',
            uconfig:{initialFrameWidth: 550,
                    initialFrameHeight: 350},
            shade:false,
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            editor:{title:'新建审批',show:false,saveloading:false,info:{title:'',fid:'',content:'',file:''}},
            showdetail:{title:'详细信息',show:false,info:{title:'',status_name:'',originator_name:'',launch_time:'',flow_name:[],towhere:'',content:'',file:[]}},
            search:{status:'',title:''},
            // <p><img src="http://eparking.b0.upaiyun.com/uploadfile/workexamine/2018/09/13/fa86a22d48b398adbf746f8656cd528e.jpg" width="134" height="113"/>test</p><p>hahah</p>
            tableData:[],
            processData:[],
            oa_users:{data:[],loading1:false,loading2:false,oavalue:''}, // oa 账号请求的数据
            imginsertTest:false,
            imageFile:'',
            imageBlob:'',
            upload_url:'',
            fileslist_me:{data:[],names:[]} ,
        }
    },
    watch:{},
    mounted(){window.vm = this;
            this.upload_url=config.host+this.cfg.url.upload;},
    methods:{
        setUploadFiles(obj){
            this.fileslist_me = obj;
        },
        showClick(row){
            this.showdetail.show = true;
            let {content,creationtime,examiner,file,flow_name,handle_status,handle_time,launch_time,modifytime,originator,originator_name,status,status_name,title,towhere} = row;
            this.showdetail.info  =  {content,creationtime,examiner,file,flow_name,handle_status,handle_time,launch_time,modifytime,originator,originator_name,status,status_name,title,towhere}
        },
        loadClick(){ 
            var vm = this;
            var url = vm.cfg.url.upload;
            var formData = new FormData();
            formData.append('file',vm.imageFile);
            utils.fetch(url,{ method:'POST',body:formData,headers:{}}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0){
                        vm.imageUrl =  res.content[0];
                        vm.resetContent();
                        vm.imginsertTest = false;
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                }
            })
        },
        resetContent(){
            let vm = this;
            vm.editor.info.content += `<p><img src="${vm.imageUrl}"></p>`;
        },
        uploadDialog(){
            let vm = this;
            vm.imginsertTest = true
            vm.imageBlob = '';
        },
        beforeupload(file){
            this.imageBlob = URL.createObjectURL(file);
            this.imageFile = file;
        },
        getProcessData:function(){
            var vm = this;
            var url = vm.cfg.url.getprocess+'?page=1&pagesize=1000';
            utils.fetch(url).then(function(res){
                vm.processData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
            });
        },
        createClick(row){
            let vm = this;
            var url = vm.cfg.url.create;
            let data = {id:row.id}
            vm.$confirm('确认要发布吗？', '提示', {confirmButtonText: '确定',
                cancelButtonText: '取消',type: 'warning'})
            .then((action) => {
               if(action=='confirm'){
                utils.fetch(url,{ method:'POST',body:data}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code===0){
                            vm.$message({ showClose:true, message:'发布成功', type:'success'})
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message||'发布失败', type:'error'})
                        }
                    }
                })
               }
            }).catch(() => {
              vm.$message({type: 'warning',message: '已取消发布'});          
            });
        },
        editSubmit(){
            let vm = this;
            let url = vm.cfg.url.launch;
            let data = vm.editor.info;
            if(!data.title){vm.$message({ showClose:true, message:'审批主题必填', type:'error' });return;}
            if(!data.fid){vm.$message({ showClose:true, message:'审批流程必填', type:'error' });return;}
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
            this.editor.title = '新建审批';
            this.editor.show = true
        },
        resetForm(){
            this.editor={
                title:'新建审批',show:true,saveloading:false,
                info:{title:'',fid:'',content:'',file:''}
            }
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
            this.search={status:'',title:''};
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
            vm.getProcessData();
            utils.getEditorScript();
        });
    },
    beforeRouteLeave:function(to, from, next){
        utils.removeEditorScript();
        next();
    },
}
</script>
