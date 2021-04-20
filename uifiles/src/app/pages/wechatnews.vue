
<template>
    <div id='box' class="menu-hide">
        <div class='worker vendor' v-if='!isEditView'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-select v-model="search.channel" size="small" class="cell widthX100"  placeholder="推送渠道" clearable>
                        <el-option v-for="(val,key) in cfg.channels" :key="val" :label="key" :value="val">{{key}}</el-option>
                    </el-select>
                    <el-input v-model.trim="search.source" size="small" class="cell widthX250"  placeholder="来源"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <div class="imgNews">
                                    <ul>
                                        <li v-for="item in scope.row.articles" :key="item.id">
                                            <el-card :body-style="{ padding: '0px'}" shadow="never">
                                                <img :src="item.local_url">
                                                <div class="title_info">
                                                    <p class="newstitle">{{item.title}}</p>
                                                    <div class="newsedit">
                                                        <span class="author">{{item.author}}</span>
                                                        <el-button type="text" @click='updataClick(scope.row)'>编辑</el-button>
                                                    </div>
                                                </div>
                                            </el-card>
                                        </li>
                                    </ul>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"  width="40"></el-table-column>
                        <el-table-column prop="article_id" label="文章ID"  min-width="110"></el-table-column>
                        <el-table-column prop="create_by" label="创建人"  min-width="180"></el-table-column>
                        <el-table-column prop="is_deleted" label="是否删除"  width="280"></el-table-column>
                        <el-table-column prop="createtime" label="创建时间"  width="140"></el-table-column>
                        <el-table-column prop="modifytime" label="修改时间"  min-width="140"></el-table-column>
                          <el-table-column label="操作" fixed="right"  width="130">
                            <template slot-scope="scope">
                               <el-button @click='updataClick(scope.row)' plain size="mini">修改</el-button> 
                            </template>
                        </el-table-column>
                </el-table> 
                <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            </div>
        </div>
        <!-- 编辑和添加视图 -->
        <div class='mainbox' v-if='isEditView'>
            <el-button @click="switchView" size="small">返回</el-button>
            <div class="picShowList clearfix">
                <h3>图文列表</h3>
                <ul>
                    <li :class="['img_list',{'activeImg':index===activeIndex}]" v-for='(item,index) in news_lists' :key="index" @click.stop='editNews(item,index)'>
                        <i class="el-icon-circle-close-outline" @click.stop='delNews(index)'></i>
                        <img :src="item.local_url" alt="">
                        <p>{{item.title}}</p>
                    </li>
                    <li class="addOne" @click.stop='addNews'>
                        <i class="el-icon-plus" ></i>
                    </li>
                </ul>
            </div>
            <div class="editorBox">
                <h3>图文内容编辑</h3>
                <el-form :model="editorData" label-width="160px"> 
                    <el-form-item label="文章标题">
                        <el-input v-model="editorData.title"></el-input>
                    </el-form-item>
                    <el-form-item label="文章作者">
                        <el-input v-model="editorData.author"></el-input>
                    </el-form-item>
                    <el-form-item label="封面大图">
                        <div class='faceImg' v-if='editorData.local_url'>
                            <img :src="editorData.local_url" alt="" >
                        </div>
                       <el-button plain round size="mini" @click="uploadDialog('0')">上传封面</el-button>
                    </el-form-item>
                    <el-form-item label="是否在文章显示封面图">
                        <el-radio-group v-model="editorData.show_cover_pic">
                            <el-radio :label="1">显示</el-radio>
                            <el-radio :label="0">不显示</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="内容">
                        <!-- <el-input type="textarea" v-model="editorData.content"></el-input> -->
                        <ueditor :id="ue" :config="uconfig" v-model="editorData.content"></ueditor>
                    </el-form-item>
                    <el-form-item label="摘要">
                        <el-input type="textarea" v-model="editorData.digest" placeholder='摘要选填'></el-input>
                    </el-form-item>
                    <el-form-item label="原文链接">
                        <el-input v-model="editorData.content_source_url" placeholder="原文链接选填"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitEditor" :loading='saveloading'>保存图文</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <el-dialog :visible.sync="imginsertTest" title='图片上传' width='40%'>
            <el-upload class="tc" :action="upload_url" :show-file-list="false" :before-upload="beforeupload" ref='uploadobj'>
              <img v-if="imageBlob" :src="imageBlob" class="wechat_loadimg">
              <i v-else class="el-icon-plus avatar-uploader-icon fontsize50"></i>
            </el-upload>
            <el-button @click="loadClick" type="primary" size="small">上传</el-button>
        </el-dialog>
    </div>

</template>

<script>
    let config = window.etback.config;
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            var config = {
                url:{
                    lists:'/wechatnews/newslists',
                    updata:'/wechatnews/updatenews',
                    add:'/wechatnews/addnews',
                    upload:'/wechatnews/upload'
                }
            };
            return {
                cfg:config,
                ue:'ueditor',
                uconfig:{initialFrameWidth: 850,
                    initialFrameHeight: 350},
                shade:false,
                isEditView:false,
                search:{tabletime:'',mobile:'',channel:'',source:'',begin_time:'',end_time:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                saveloading:false,
                imginsertTest:false,
                isadd:false,
                face_img:'',
                activeIndex:0,
                faceUrl:'',
                addFace:false,
                imageUrl:'',
                imageFile:'',
                imageBlob:'',
                upload_url:'',
                active_news_id:'',
                active_is_del:'',
                news_lists:[],
                editorData:{title:'',author:'',local_url:'',content:'',digest:'',content_source_url:'',create_by:'',show_cover_pic:1}
            }
        },
        computed:{

        },
        mounted: function(){
            window.vm = this;
            this.upload_url=config.host+this.cfg.url.upload;
        },
        methods:{
            uploadDialog(type){
                let vm = this;
                vm.imginsertTest = true
                vm.imageBlob = '';
                vm.addFace = !!(type==='0');
            },
            beforeupload(file){
                this.imageBlob = URL.createObjectURL(file);
                this.imageFile = file;
            },
            loadClick(type){ //0 封面，1 编辑器
                var vm = this;
                var url = vm.cfg.url.upload;
                var formData = new FormData();
                formData.append('file',vm.imageFile);
                utils.fetch(url,{ method:'POST',body:formData,headers:{}}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            if(vm.addFace){
                                vm.editorData.local_url =  res.content[0];
                            }else{
                                vm.imageUrl =  res.content[0];
                                vm.resetContent();
                            }
                            vm.imginsertTest = false;
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            resetContent(){
                let vm = this;
                vm.editorData.content += `<p><img src="${vm.imageUrl}"></p>`;
            },
            switchView(){
                this.isEditView = !this.isEditView
            },
            addClick(){
                let vm = this;
                vm.switchView();
                vm.news_lists = [{title:'新建图文',author:'',local_url:'',content:'',digest:'',content_source_url:'',create_by:'',show_cover_pic:1}];
                vm.editorData = vm.news_lists[vm.activeIndex];
                vm.isadd = true;
            },
            updataClick(row){
                this.switchView();
                this.news_lists = row.articles;
                this.isadd = false;
                this.activeIndex = 0;
                this.editorData = row.articles[this.activeIndex];
                this.active_news_id = row.id;
                this.active_is_del = row.is_deleted;
            },
            editNews(obj,index){
                //obj ==== this.news_lists[index]
                this.editorData = obj;
                this.activeIndex = index;
            },
            delNews(index){
                let vm = this;
                //if(len===1){return};//保留一个
                //可能要确认一下？
                vm.news_lists.splice(index, 1);
                let len = vm.news_lists.length;
                if(len>0){
                    vm.activeIndex = len-1;
                    vm.editorData = vm.news_lists[vm.activeIndex];
                }else{//清除完后自完清除表单数据
                    vm.editorData={title:'',author:'',local_url:'',content:'',digest:'',content_source_url:'',create_by:'',show_cover_pic:1};
                }
            },
            addNews(){
                let vm = this;
                let obj = {title:'新建图文',author:'',local_url:'',content:'',digest:'',content_source_url:'',create_by:'',show_cover_pic:1};
                vm.news_lists.push(obj);
                vm.activeIndex = vm.news_lists.length - 1; 
                vm.editorData = vm.news_lists[vm.activeIndex];
            },
            submitEditor(){
                let vm = this;
                let url = vm.isadd?vm.cfg.url.add:vm.cfg.url.updata;
                let obj = {articles:vm.news_lists};
                if(!vm.isadd){
                    obj.news_id= vm.active_news_id;
                    obj.is_deleted = vm.active_is_del; 
                }
                let data =JSON.stringify(obj);
                //console.log(data);
                utils.fetch(url,{method:'POST',body:data}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.switchView();
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists: [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
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
                this.search = {};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
           
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                utils.getEditorScript();
                var data = utils.getCache();
                var obj = data == '' ? {} : JSON.parse(data);
                if(obj.tableData && obj.tableData.length > 0){
                    utils.getCacheItem(vm,obj);
                }else{
                    vm.getData();
                }
            });
        },
        beforeRouteLeave:function(to, from, next){
            utils.removeEditorScript();
            next();
        },
    }
</script>

