
<template>
    <div id='box' class="menu-hide">
        <div class='worker vendor'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="search.tabletime" size="small" class="cel widthX120" type="month" placeholder="选择月" value-format="yyyyMM"></el-date-picker>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-select v-model="search.channel" size="small" class="cell widthX100"  placeholder="推送渠道" clearable>
                        <el-option v-for="(val,key) in cfg.channels" :key="val" :label="key" :value="val">{{key}}</el-option>
                    </el-select>
                    <el-input v-model.trim="search.source" size="small" class="cell widthX120"  placeholder="来源"></el-input>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="importClick('case')" size="small"><i class="fa fa-arrow-down"></i>CASE导入</el-button>
                    <el-button @click="importClick('msg')" size="small"><i class="fa fa-arrow-down"></i>消息推送导入</el-button>
                    <el-button @click="importClick('sms')" size="small"><i class="fa fa-arrow-down"></i>短信推送导入</el-button>
                    <el-button @click="addPush" size="small"><i class="fa fa-plus"></i>添加推送</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.begin_time" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.end_time" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="推送结果:">
                        <span>{{ scope.row.result }}</span>
                      </el-form-item>
                      <el-form-item label="消息跳转路径:">
                        <span>{{ scope.row.url }}</span>
                      </el-form-item>
                      <el-form-item label="推送内容:">
                        <span class="wb">{{ scope.row.content }}</span>
                      </el-form-item>
                    </el-form>
                  </template>
                </el-table-column>
                    <el-table-column prop="title" label="推送标题" min-width="110"></el-table-column>
                    <el-table-column prop="mobile" label="手机号" width="120"></el-table-column> 
                    <el-table-column label="推送渠道" width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.tablechannels[scope.row.channel]}}</span>
                        </template>
                    </el-table-column> 
                    <el-table-column label="用户类型" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.tabletype[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="source_name" label="来源名称" min-width="110"></el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="100"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="addPushMsg.title"  :visible.sync="addPushMsg.show">
                <el-form :model="formdata" label-width="160px" > 
                    <el-form-item label="消息标题">
                        <el-input v-model="formdata.title"></el-input>
                    </el-form-item>
                    <el-form-item label="来源（标识）">
                        <el-input v-model="formdata.source"></el-input>
                    </el-form-item>
                    <el-form-item label="推送消息类型">
                        <el-select v-model="formdata.type" placeholder="请选择推送消息类型"  @change='selectType'>
                            <el-option v-for="(val,key) in cfg.type" :key="key" :label="val" :value="key"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="群id" v-show='groupshow'>
                        <el-checkbox-group  v-model="formdata.group_ids">
                            <el-checkbox v-for="list in grouplistsdata"  :value='list.id' :label="list.id" :key="list.id">{{list.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="手机号" v-show='!groupshow'>
                        <el-input v-model="formdata.mobile"></el-input>
                    </el-form-item> 
                    <el-form-item label="推送渠道">
                        <el-checkbox-group  v-model="formdata.channel">
                            <el-checkbox v-for="(val,key) in cfg.channels"  :value='val' :label="val" :key="val" @change = 'checkhandlers'>{{key}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <template v-if='show_newczy_params'>
                        <el-form-item label="新版彩之云模板ID">
                            <el-input v-model="formdata.czy_template_id" placeholder='新版彩之云模板ID'></el-input>
                        </el-form-item>
                        <el-form-item label="新版彩之云模板">
                            <el-input v-model="formdata.new_czy_params" placeholder='新版彩之云模板参数'></el-input>
                        </el-form-item>
                    </template>
                    <template v-if='show_sms_params'>
                        <el-form-item label="短信参数">
                            <el-input v-model="formdata.sms_params" placeholder='短信参数:如{"code":"6666","minute":"1"}'></el-input>
                        </el-form-item>
                        <el-form-item label="短信模板">
                            <el-select v-model="formdata.template_id" size="small" placeholder="短信模板"  v-loading='loadsmslists'>
                                <el-option
                                  v-for="item in allSmsListsdata" :key="item.id" :label="item.name" :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </template>
                    <template v-if='show_wx_params'>
                        <el-form-item label="微信路径">
                            <el-input v-model="formdata.wx_url" placeholder='path'></el-input>
                        </el-form-item>
                        <el-form-item label="微信模板">
                            <el-input v-model="formdata.wx_params" placeholder='{"first":{"value":"月卡即将过期。","color":"#333"},"keyword1":{"value":"粤B*","color":""},"keyword2":{"value":"车场","color":""},"keyword3":{"value":"2018-03-21","color":""},"remark":{"value":"尽快缴费","color":""}}'></el-input>
                        </el-form-item>
                        <el-form-item label="微信模板类型">
                            <el-input v-model="formdata.wx_template_type"></el-input>
                        </el-form-item>
                    </template>
                    <template v-if='show_ali_params'>
                        <el-form-item label="支付宝路径">
                            <el-input v-model="formdata.ali_url" placeholder='path'></el-input>
                        </el-form-item>
                        <el-form-item label="支付宝模板">
                            <el-input v-model="formdata.ali_params" placeholder='{"first":{"value":"月卡即将过期。","color":"#333"},"keyword1":{"value":"粤B*","color":""},"keyword2":{"value":"车场","color":""},"keyword3":{"value":"2018-03-21","color":""},"remark":{"value":"尽快缴费","color":""}}'></el-input>
                        </el-form-item>
                        <el-form-item label="支付宝模板类型">
                            <el-input v-model="formdata.ali_template_type"></el-input>
                        </el-form-item>
                    </template>
                    <el-form-item label="跳转路径(彩管家渠道)">
                        <el-input v-model="formdata.cgj_url" placeholder="彩管家渠道时最好填上相应路径"></el-input>
                    </el-form-item>
                    <el-form-item label="跳转路径(彩之云渠道)">
                        <el-input v-model="formdata.czy_url" placeholder="彩之云渠道时最好填上相应路径"></el-input>
                    </el-form-item>
                    <el-form-item label="推送内容">
                        <el-input type="textarea" placeholder="请输入内容" v-model="formdata.content"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm" :loading='saveloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
             <el-dialog :title="importer.title" :visible.sync="importer.show" width='80%'>
                <el-upload drag :action="upload_url" :headers="cfg.header" :limit="1" :on-exceed="exceedHandle" :on-success="importSuccess" :on-error='importError' :file-list="fileList" auto-upload class='tc'>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
                </el-upload>
                <div v-loading="importshade">
                    <template v-if='importType==="case"'>
                        <el-table v-if="importData.length>0" :data="importData" border height="350" style="width:100%">
                        <el-table-column prop="A" label="标题" width="100"></el-table-column>
                        <el-table-column prop="B" label="任务详情" min-width="80"></el-table-column>
                        <el-table-column prop="C" label="优先级" min-width="90"></el-table-column>
                        <el-table-column prop="D" label="发起人" min-width="60"></el-table-column>
                        <el-table-column prop="E" label="关注人" min-width="60"></el-table-column>
                        <el-table-column prop="F" label="执行人" min-width="60"></el-table-column>
                        <el-table-column prop="G" label="任务截止时间" min-width="60"></el-table-column>
                        <el-table-column prop="tip" label="错误提示" min-width="140"></el-table-column>
                        </el-table>
                    </template>
                    <template v-else-if='importType==="sms"'>
                        <el-table v-if="importData.length>0" :data="importData" border height="350" style="width:100%">
                        <el-table-column prop="A" label="短信模板ID" width="100"></el-table-column>
                        <el-table-column prop="B" label="标题" min-width="80"></el-table-column>
                        <el-table-column prop="C" label="手机号" min-width="90"></el-table-column>
                        <el-table-column prop="D" label="来源" min-width="60"></el-table-column>
                        <el-table-column prop="E" label="短信模板参数" min-width="60"></el-table-column>
                        <el-table-column prop="tip" label="错误提示" min-width="140"></el-table-column>
                        </el-table>
                    </template>
                    <template v-else>
                        <el-table v-if="importData.length>0" :data="importData" border height="350" style="width:100%">
                        <el-table-column prop="A" label="标题" min-width="80"></el-table-column>
                        <el-table-column prop="B" label="发送渠道" min-width="90"></el-table-column>
                        <el-table-column prop="C" label="手机号" min-width="120"></el-table-column>
                        <el-table-column prop="D" label="来源" min-width="160"></el-table-column>
                        <el-table-column prop="E" label="消息内容" min-width="160"></el-table-column>
                        <el-table-column prop="F" label="彩之云跳转路径" min-width="160"></el-table-column>
                        <el-table-column prop="G" label="彩管家跳转路径" min-width="160"></el-table-column>
                        <el-table-column prop="H" label="短信模板ID" min-width="160"></el-table-column>
                        <el-table-column prop="I" label="短信模板参数" min-width="260"></el-table-column>
                        <el-table-column prop="J" label="微信参数" min-width="160"></el-table-column>
                        <el-table-column prop="K" label="微信跳转路径" min-width="160"></el-table-column>
                        <el-table-column prop="L" label="微信模板类型" min-width="160"></el-table-column>
                        <el-table-column prop="M" label="新版彩之云模板ID" min-width="160"></el-table-column>
                        <el-table-column prop="N" label="新版彩之云模板参数" min-width="260"></el-table-column>
                        <el-table-column prop="tip" label="错误提示" min-width="160"></el-table-column>
                        </el-table>
                    </template>
                </div>
                <div v-show='successFlag' class="tc green">导入成功</div>
            </el-dialog>
        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    let config = window.etback.config;
    export default {
        data:function(){
            let header = {};
            header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
            header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
            header['Access-Token'] = window.localStorage.getItem('access_token');
            var config = {
                tabletype:{oa:"oa",client:"用户"},
                tablechannels: {czy: "双乾", czy_detail: "双乾详情", cgj: "彩管家", sms: "短信", wechat: "微信",alipay:"支付宝"},
                type:{singleUser:"单个消息推送", group:"群推送"},
                channels:{"双乾":'czy',"双乾详情":'czy_detail',"彩管家":'cgj',"短信":'sms',"微信":'wechat',"支付宝":'alipay',"新版彩之云":'new_czy'},
                importmap:{'case':'CASE导入','sms':'短信推送导入','msg':'消息推送导入'},
                url:{
                    lists:'/pushmessage/lists',
                    upload:{'sms':'/import/pushSms','case':'/import/case','msg':'/import/push_msg'},
                },
                header
            };
            return {
                cfg:config,
                shade:false,
                search_more:false,
                search:{tabletime:'',mobile:'',channel:'',source:'',begin_time:'',end_time:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                addPushMsg:{title:'添加推送消息',show:false},
                saveloading:false,
                show_sms_params:false,
                show_wx_params:false,
                show_ali_params:false,
                show_newczy_params:false,
                loadsmslists:false,
                grouplistsdata:[],
                allSmsListsdata:[],
                importshade:false,
                successFlag:false,
                importer:{title:'',show:false,data:[]},
                upload_url:'',
                importData:[],
                fileList:[],
                importType:'',
                formdata:{cgj_url:'',channel:[],sms_params:'',template_id:3,wx_url:'',wx_params:'',wx_template_type:'', czy_template_id:'',new_czy_params:'', ali_url:'',ali_params:'',ali_template_type:'',content:'',czy_url:'',group_ids:[],mobile:'',source:'etc',title:'',type:'singleUser'},
            }
        },
        computed:{
            groupshow:function(){
                return !(this.formdata.type === 'singleUser');
            }
        },
        methods:{
            importSuccess(res, file, fileList){
                let vm = this;
                if(res&&res.code===0){
                    if(res.content.length>0){
                         vm.importData = res.content;
                    }else{
                        vm.successFlag = true;
                        vm.importData = [];
                    }
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                } 
             },
            importError(err, file, fileList){
                this.$message({ showClose:true, message:err||'upload error', type:'error' });
            },
            importClick(type){
                let vm = this;
                vm.importType = type;
                vm.importer.title=vm.cfg.importmap[type];
                vm.importer.show = true;
                vm.importshade = false;
                vm.successFlag = false;
                vm.fileList = [];
                vm.importData = [];
                vm.upload_url = config.host+vm.cfg.url.upload[vm.importType]
            },
            exceedHandle(){
                this.$message({ showClose:true, message:'单次只能传一个文件', type:'error' });
            },
            addPush:function(){
                this.addPushMsg.show = true;
                this.show_sms_params = false;
                this.show_wx_params = false;
                this.show_ali_params = false;
                this.show_newczy_params = false;
                this.formdata={cgj_url:'',channel:[],sms_params:'',template_id:'',wx_url:'',wx_params:'',wx_template_type:'contract_expired',czy_template_id:'',new_czy_params:'', ali_url:'',ali_params:'',ali_template_type:'contract_expired',content:'',czy_url:'',group_ids:[],mobile:'',source:'etc',title:'',type:'singleUser'}
            },
            submitForm:function() {
                var vm = this;
                var url = '/pushmessage/pushMsg';
                var form = vm.formdata;
                var map = {title:"消息标题",source:"来源（标识）",type:"推送消息类型",channel:"推送渠道"};
                for(var i in map){
                    if((i==='channel' && form[i].length<1) || form[i]===''){
                        vm.$message({ showClose:true, message:map[i]+'不能为空', type:'error' }); return;
                    }
                }
                if(form.type === 'singleUser'){
                    if(form.mobile===''){
                        vm.$message({ showClose:true, message:'手机号不能为空', type:'error'}); return;
                    }
                }else{
                    if(form.group_ids.length===0){
                        vm.$message({ showClose:true, message:'群id不能为空', type:'error'}); return;
                    }
                }
                if(this.show_sms_params){
                    if(form.sms_params===''||form.template_id===''){
                        vm.$message({ showClose:true, message:'短信参数和模板不能为空', type:'error'}); return;
                    }
                }
                if(this.show_wx_params){
                    if(form.wx_url===''||form.wx_params===''||form.wx_template_type===''){
                        vm.$message({ showClose:true, message:'微信路径和模板，类型不能为空', type:'error'}); return;
                    }
                }
                if(this.show_ali_params){
                    if(form.ali_url===''||form.ali_params===''||form.ali_template_type===''){
                        vm.$message({ showClose:true, message:'支付宝路径和模板，类型不能为空', type:'error'}); return;
                    }
                }
                if(this.show_newczy_params){
                    if(form.czy_template_id===''||form.new_czy_params===''){
                        vm.$message({ showClose:true, message:'新版彩之云模板ID和新版彩之云模板参数不能为空', type:'error'}); return;
                    }
                }
                let {channel,group_ids,...others} = vm.formdata;
                let obj = {
                    channel :channel.join(','),
                    group_ids:group_ids.join(',')
                };
                let data =Object.assign({},others,obj);
                vm.saveloading=true;
                utils.fetch(url,{method:'post',body:data}).then(function(json){
                    vm.saveloading=false;
                    if(json.code == 0){
                        vm.$message({ showClose:true, message:json.message, type:'success' });
                        vm.addPushMsg.show = false;
                        vm.getData()
                    }else{
                        vm.$message({ showClose:true, message:json.message, type:'error' });
                    }
                });
            },
            selectType:function(){
                if(this.formdata.type=='group'){
                    this.getGroupList();
                }
            },
            checkhandlers(){
                var vm = this;
                var map = {'sms':"show_sms_params",'wechat':"show_wx_params",'alipay':"show_ali_params",'new_czy':"show_newczy_params"}
                var marArr = ['sms','wechat','alipay','new_czy'];
                marArr.forEach(item=>{
                    if(vm.formdata.channel.indexOf(item)>-1){
                        vm[map[item]] = true;
                        if(item === 'sms'){
                            vm.getAllsmslists();
                        }
                    }else{
                        vm[map[item]] = false;
                    }
                })
            },
            getAllsmslists(){
                var vm = this;
                var data = window.localStorage.getItem('smstemplatelist');
                var  url  = '/pushmessage/smsLists?page=1&pagesize=1000';
                if(data){
                    vm.allSmsListsdata = JSON.parse(data);
                }else{
                    vm.loadsmslists = true
                    utils.fetch(url).then(function(json){
                        if(json&&json.code ==0){
                            vm.allSmsListsdata = json.content;
                            vm.loadsmslists = false;
                            window.localStorage.setItem('smstemplatelist',JSON.stringify(json.content))
                        }
                    }); 
                }
            },
            getGroupList:function(){
                var vm = this;
                var url = '/pushmessage/groupLists?page=1&pagesize=1000';
                utils.fetch(url).then(function(json){
                    if(json&&json.code ==0){vm.grouplistsdata = json.content;}
                });
            },
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.lists+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}  = vm.search;
                var querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
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
                this.search_more = false;
                this.search = {tabletime:'',mobile:'',channel:'',source:'',begin_time:'',end_time:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more ;
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
<style scoped>
    .el-checkbox{margin-left: 10px;}
    .el-checkbox+.el-checkbox{margin-left: 10px;}
</style>
