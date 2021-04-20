<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell" width ='150px' placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                    <el-input v-model="search.mobile"  size="small" class="cell widthX150"  placeholder="手机号"></el-input>
                    <el-select v-model="search.status" placeholder="状态" size="small" class="widthX120"  clearable>
                        <el-option v-for="(val,key) in statusmap" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="importClick" size="small"><i class="fa fa-arrow-down"></i>停车场用户导入</el-button>
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                <el-select v-model="search.type" placeholder="类型" size="small" class="widthX120"  clearable>
                        <el-option v-for="(val,key) in typemap" :key="key" :label="val" :value="key"></el-option>
                 </el-select>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部" ><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="60"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="90"></el-table-column>
                    <el-table-column prop="charge_name" label="临停收费类型" min-width="120"></el-table-column>
                    <el-table-column prop="username" label="用户名称" min-width="90"></el-table-column>
                    <el-table-column label="用户" min-width="130">
                        <template slot-scope="scope">
                            <span>{{scope.row.user_name+'/'+scope.row.user_phone}}</span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column label="类型" min-width="60">
                        <template slot-scope="scope">
                            <span>{{typemap[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="60">
                        <template slot-scope="scope">
                            <span :class="{'yellow':(scope.row.status=='N'),'green':(scope.row.status=='Y')}">{{statusmap[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item  label="停车场:" v-if='isadd'>
                        <my-select-station v-model="editor.info.station_id" size="small" class="cell" width="100%" placeholder="停车场"></my-select-station>
                    </el-form-item>
                    <el-form-item  label="车牌:" v-if='isadd'>
                        <my-select-plate v-model="editor.info.car_id" size="small" class="cell" width="100%" placeholder="车牌"></my-select-plate>
                    </el-form-item>
                    <el-form-item label="用户名称:">
                        <el-input v-model="editor.info.username" size="small" placeholder="用户名称"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号:">
                        <el-input v-model="editor.info.mobile" size="small" placeholder="手机号"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="规则:">
                        <el-select v-model="editor.info.rule_id" filterable clearable size="small" class="cell"  placeholder="规则">
                        <el-option v-for="k in rulesData" :key="k.id" :label="k.name" :value="k.id"></el-option>
                    </el-select> 
                    </el-form-item>-->
                    <el-form-item label="状态:">
                        <el-radio-group v-model="editor.info.status">
                            <el-radio v-for="(val,key) in statusmap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="类型:">
                        <el-radio-group v-model="editor.info.type">
                            <el-radio v-for="(val,key) in typemap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="周期类型:">
                        <el-radio-group v-model="editor.info.time_type">
                        <el-radio :label="'1'">24小时</el-radio>
                        <el-radio :label="'0'">24点</el-radio>
                    </el-radio-group>
                    </el-form-item>
                    <el-form-item label="是否重复缴费:">
                        <el-radio-group v-model="editor.info.is_repeat">
                            <el-radio v-for="(val,key) in repeatmap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.saveloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="importer.title" :visible.sync="importer.show" width='80%'>
                <el-upload drag :action="upload_url" :headers="headers" :limit="1" :on-exceed="exceedHandle" :on-success="uploaded" :file-list="fileList" auto-upload class='tc' ref='uploadobj'>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
                </el-upload>
                <div v-loading="importshade">
                    <el-table v-if="importData.length>0" :data="importData" border height="350" style="width:100%">
                    <el-table-column prop="A" label="客户" width="100"></el-table-column>
                    <el-table-column prop="B" label="手机" min-width="80"></el-table-column>
                    <el-table-column prop="C" label="车牌" min-width="90"></el-table-column>
                    <el-table-column prop="D" label="客户类型" min-width="60"></el-table-column>
                    <el-table-column prop="E" label="是否重复缴费" min-width="60"></el-table-column>
                    <el-table-column prop="F" label="周期类型" min-width="60"></el-table-column>
                    <el-table-column prop="tip" label="错误提示" min-width="140"></el-table-column>
                    </el-table>
                </div>
                <div v-show='successFlag' class="tc green">导入成功</div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
let config = window.etback.config;
import utils from '../../../utils/utils.js';
export default {
    components:{
        
    },
    data:function(){
        let config = {
            url:{
                lists:'/balance/parkingUserLists',
                add:'/balance/parkingUserAdd',
                update:'/balance/parkingUserUpdate',
                //getrule:'/balance/tempRules',
                upload:'/import/parkingUser',
            }
        }
        return{
            cfg:config,
            statusmap:{"Y":"启用" ,"N":"禁用"},
            typemap:{"owner":"业主" ,"lessee":"租户"},
            repeatmap:{"Y":"是" ,"N":"否"},
            timemap:{"1":"24小时" ,"0":"24点"},
            search:{station_id:'',car_id:'',mobile:'',status:'',dept:'',type:''},
            shade:false,
            importshade:false,
            isadd:false,
            search_more:false,
            successFlag:false,
            tableData:[],
            importData:[],
            fileList:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            editor:{title:'',show:false,saveloading:false,info:{status:"",mobile:"",type:"", username :"", rule_id :"",time_type:"",is_repeat:""}},
            importer:{title:'',show:false,data:[]},
            upload_url:'',
            headers:{},
        }
    },
    methods: {
        uploaded(response, file, fileList){
            let vm = this;
            let url = vm.cfg.url.upload;
            let formData = new FormData();
            formData.append('file',file.raw);
            vm.importshade = true
            utils.fetch(url,{method:'POST',body:formData,headers:{}}).then(function(res){
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
                vm.importshade = false
            });
         },
        importClick(){
            let vm = this;
            vm.importer.title='停车场用户导入';
            vm.importer.show = true;
            vm.importshade = false;
            vm.successFlag = false;
            vm.fileList = [];
        },
        exceedHandle(){
            this.$message({ showClose:true, message:'单次只能传一个文件', type:'error' });
        },
        editSubmit(){
            let vm = this;
            let info = vm.editor.info;
            if(info.time_type==='' || info.is_repeat===''){
                vm.$message({ showClose:true, message:'是否重复缴费和周期类型不能为空', type:'error' });return;
            }
            let url = vm.isadd?vm.cfg.url.add:vm.cfg.url.update;
            vm.editor.btnloading = true;
            utils.fetch(url,{method:'post',body:info}).then(function(res){
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
        addClick(){
            let vm = this;
            vm.editor.title='添加';
            vm.isadd = true;
            vm.editor.show = true;
            vm.editor.btnloading= false;
            vm.editor.info ={status:"Y",mobile:"",type:"owner", username :"",station_id:'',car_id:'',time_type:"1",is_repeat:"Y"};
        },
        updateClick(row){
            let vm = this;
            vm.editor.title='编辑';
            vm.isadd = false;
            vm.editor.show = true;
            vm.editor.btnloading= false;
            let {type,status,user_phone:mobile,id,username,time_type,is_repeat} = row;
            vm.editor.info ={type,status,mobile,id,username,time_type,is_repeat};
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
            this.search = {station_id:'',car_id:'',mobile:'',status:'',dept:'',type:''};
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
            var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            let {...searchs}=vm.search;
            let searchQueryString=searchs;
            var querystr = utils.setQueryString(searchQueryString);
            var connect = url.indexOf('?')>0?'&':'?';
            url+=querystr?connect+querystr:'';
            vm.tableData=[];
            utils.fetch(url).then(function(res){
                if(res.code==0 && res.content!== undefined){
                    vm.tableData = res.content.lists||[];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
                vm.shade=false;
            })
        },
    },
    mounted(){
        this.upload_url=config.host+this.cfg.url.upload;
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
