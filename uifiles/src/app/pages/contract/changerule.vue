
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate>
                     <el-input v-model.trim="search.fullname" size="small" class="cell widthX100"  placeholder="上传人"></el-input>
                     <el-input v-model.trim="search.agree_name" size="small" class="cell widthX100"  placeholder="审核人"></el-input>
                    <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态" clearable>
                            <el-option
                              v-for="(val,key) in statusMap" :key="key" :label="val" :value="key">
                            </el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <!-- <my-linkage-dept v-model="search.dept" :hideDefault='true'></my-linkage-dept> -->
                <el-date-picker v-model="search.begin_time" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.end_time" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%" show-summary :summary-method="getSummaries">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.motifytime }}</span></el-form-item>
                                <el-form-item v-if='props.row.status!=0' label="审核人:"><span>{{ props.row.agree_name }}</span></el-form-item>
                                <el-form-item v-if='props.row.status==2' label="拒绝理由:"><span>{{ props.row.refuse }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场"  min-width="120">
                    </el-table-column>
                    <el-table-column prop='plate' label="车牌"  min-width="80">
                    </el-table-column>
                    
                    <el-table-column label="旧规则/价格" min-width="80">
                        <template slot-scope="props">
                             {{props.row.old_rule_name}} / {{props.row.old_money}}
                        </template>
                    </el-table-column>
                     <el-table-column label="新规则/价格" min-width="80">
                        <template slot-scope="props">
                             {{props.row.new_rule_name}} / {{props.row.new_money}}
                        </template>
                    </el-table-column> 
                    <el-table-column prop="user_name" label="上传人" min-width="65"></el-table-column>
                    <el-table-column label="状态"  width="80">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status==2),'green':(scope.row.status==1)}">{{statusMap[scope.row.status]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作"  min-width="140">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('同意月卡换规则申请') && scope.row.status==0"  @click="agreeSend(scope.row)" plain size="mini">同意</el-button>
                            <el-button v-if="authCheck('拒绝月卡换规则申请') && scope.row.status==0"  @click="refuseSend(scope.row)" plain size="mini">拒绝</el-button>
                            <el-button @click="imgshow(scope.row)" plain size="mini">查看凭证</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists>
            <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show" width='80%'>
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        <span>{{remoteInfo.info.result||''}}</span>
                    </el-form-item>
                </el-form>
            </el-dialog>
             <!-- 拒绝或者同意操作 S -->
            <el-dialog :title="operateRule.title" width='40%' custom-class="minwidth" :visible.sync="operateRule.show">
                <el-form label-width="100px">
                    <el-form-item label="拒绝理由:" v-if='!operateRule.action'>
                        <el-input v-model="operateRule.refuse" type="textarea" placeholder="拒绝理由">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="更改有效期:" v-if='operateRule.action'>
                        <el-radio v-model="operateRule.valid" label="Y">是</el-radio>
                        <el-radio v-model="operateRule.valid" label="N">否</el-radio>
                    </el-form-item>
                      <el-form-item label="" v-if='!operateRule.action'>
                         <el-checkbox v-model="operateRule.dim" label="1" border>凭证模糊</el-checkbox>
                         <el-checkbox v-model="operateRule.inconformity" label="2" border>凭证不符</el-checkbox>
                         <el-checkbox v-model="operateRule.repeated" label="3" border>重复上传</el-checkbox>
                         <el-checkbox v-model="operateRule.time" label="4" border>时间不符</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitNewRule" type="primary" size="small" :loading='operateRule.submit'>确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 拒绝或者同意操作 E -->
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            var urls={agree:'/changerule/agree',
                    refuse:'/changerule/refuse',
                    lists:'/changerule/lists',
                    add:'/changerule/add'};
            return {
                api:urls,
                shade:false,
                search_more:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{station_id:'',car_id:'',status:'',begin_time:'',end_time:'',fullname:'',new_rule:'', old_rule:'',agree_name:''},
                tableData:[],
                operateRule:{title:'',show:false,refuse:'',valid:'',action:true,row:'',submit:false,dim:'',inconformity:'',repeated:'',time:''},
                remoteInfo:{title:'',show:false,info:{}},
                images:{show:false,lists:[]},
                statusMap:{'0':'待审核','1':'已同意','2':'已拒绝'},
                summariesData:'',
             }
        },
        methods:{
            authCheck:function(str){
                return utils.authCheck(this,str)
            },
            submitNewRule:function(){
                var vm = this,url='',data;
                let operateRule=vm.operateRule;
                let {refuse}=operateRule;
                let tmp='';
                if(operateRule.dim){tmp+='凭证模糊、'}
                if(operateRule.inconformity){tmp+='凭证不符、'}
                if(operateRule.repeated){tmp+='重复上传、'}
                if(operateRule.time){tmp+='时间不符、'}
                refuse=tmp+refuse;
                if(operateRule.action){
                    url = vm.api.agree;
                    data = {change_date:operateRule.valid,id:operateRule.row.id}
                }else{
                    url = vm.api.refuse;
                    if(refuse ==''){
                        vm.$message({ showClose:true, message:'拒绝理由不能为空', type:'error' }); return;
                    }
                    data = {refuse,id:operateRule.row.id};
                }
                operateRule.submit = true;
                utils.fetch(url,{method:'post',body:data}).then(function(res){
                   if(typeof(res) != 'undefined'){
                        operateRule.submit = false;
                        if(res.code == 0){
                            operateRule.show=false;
                            vm.getData();
                            window.sessionStorage.clear();
                            if(operateRule.action){//同意后要执行先删除后下发操作
                                vm.delCmd(operateRule.row)
                            }
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });  
                        }
                        
                    }
                })
            },
            sendCmd:function(row){
                var vm = this;
                 utils.fetch("/contract/commond?cmd=add&station_id="+row.station+"&car_id="+row.car+"&rule_id="+row.new_rule).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.remoteInfo = {show:true,title:json.content.title};
                            vm.remoteInfo.info = (json.content.info == false || json.content.info =='')?{url:'',params:'',result:''}:json.content.info;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                })
            },
            delCmd:function(row){
                var vm = this;
                var url = '/contract/delcard?station_id='+row.station+'&car_id='+row.car+'&rule_id='+row.new_rule;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.sendCmd(row);
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            saveRowInfo:function(row){
                var vm = this;
                vm.operateRule.show=true;
                vm.operateRule.row = {id:row.id,new_rule:row.new_rule,station:row.station,car:row.car};
            },
            agreeSend:function(row){
                var vm = this;
                vm.saveRowInfo(row);
                vm.operateRule.title='同意操作';
                vm.operateRule.action=true;
                vm.operateRule.valid='N';
                
                
            },
            refuseSend:function(row){
                var vm = this;
                vm.operateRule={title:'拒绝操作',show:true,refuse:'',valid:'',action:false,row:'',submit:false,dim:'',inconformity:'',repeated:'',time:''}
                vm.saveRowInfo(row);
            },
            getSummaries:function(param){
                var result = [];
                var olddata = this.summariesData.old_money;
                var newdata = this.summariesData.new_money;
                var oldP = olddata&&olddata.toFixed(2); 
                var newP = newdata&&newdata.toFixed(2);  
                result[0] = "合计";
                result[3] = '旧规则总价:'+oldP; 
                result[4] = '新规则总价:'+newP; 
                result[7] = '申请次数:'+this.summariesData.count; 
                return result;
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            ruleSend:function(index,row){
                var vm = this;
                var editData = {
                    rule_id: row.id
                };
                utils.fetch('/rule/send',{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.remoteInfo = {show:true,title:res.content.title,info:res.content.info};
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
             
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            btnUndo:function(){
                this.search = {station_id:'',car_id:'',status:'',begin_time:'',end_time:'',fullname:'',new_rule:'', old_rule:'',agree_name:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = vm.api.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                let searchmap = searchs;
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'&&res.code == 0){
                        vm.tableData = res.content.lists;
                        if(res.content.census ){
                            vm.summariesData =res.content.census[0];
                        }
                        vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                        utils.setCache(vm);
                        vm.flag = true;
                    }else{
                        vm.tableData = [];
                    }
                    vm.shade = false;
                })
            },

            imgshow:function(row){
                var lists = [];
                try{
                    row.img_urls.forEach(function(url,idx){
                        if(url){lists.push({title:'换规则凭证'+(idx+1),href:url})}
                    })
                }catch(e){
                    console.log(e+'取当前凭证出错了');
                }
                this.images = {show:true,lists:lists};
            },
            imgClose:function(){
                this.images = {show:false,lists:[]};
            },
        },
        created() {
            this.getData()
        },
    }

</script>
