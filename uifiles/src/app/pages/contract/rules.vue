
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.name" size="small" class="cell widthX120"  placeholder="规则名称"></el-input>
                    <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态">
                        <el-option label="激活" value="Y"></el-option>
                        <el-option label="禁止" value="N"></el-option>
                    </el-select>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
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
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="关联设备:">
                                    <span class="ml10 mr10" v-for="k in props.row.device_info" :key="k.device_id">{{k.device_name}} ({{k.device_code}})</span>
                                </el-form-item>
                                <el-form-item label="缴费渠道:">
                                <span v-for="(k,i) in props.row.paymethod" :key="i"> {{payKindMap[k]}} </span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="规则ID" min-width="70"></el-table-column>
                    <el-table-column prop="status" label="状态" width="60">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status == 'Y'" class="green" >激活</span>
                            <span v-else-if="scope.row.status == 'N'" class="red" >禁止</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="120"></el-table-column>
                    <el-table-column prop="name" label="规则名称" min-width="90"></el-table-column>
                    <el-table-column prop="deadline" label="截止时间" min-width="90"></el-table-column>
                    <el-table-column  label="类型" width="60">
                        <template slot-scope="scope" v-cloak>{{getType(scope.row.payunit,payunitMap)}}</template>
                    </el-table-column>
                    <el-table-column label="车型" width="70">
                        <template slot-scope="scope" v-cloak>{{getType(scope.row.model,ruleModels)}}</template>
                    </el-table-column>
                    <el-table-column prop="N1" label="N1" min-width="65"></el-table-column>
                    <el-table-column prop="N2" label="N2" width="55"></el-table-column>
                    <el-table-column prop="N3" label="N3" width="55"></el-table-column>
                    <el-table-column prop="N4" label="N4" width="55"></el-table-column>
                    <el-table-column prop="N5" label="N5" width="55"></el-table-column>
                    <el-table-column prop="N6" label="N6" width="55"></el-table-column>
                    <el-table-column prop="N7" label="N7" width="55"></el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini">编辑</el-button>
                            <el-button  @click="ruleSend(scope.$index,scope.row)" plain size="mini" :disabled="scope.row.disableStatus">下发
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px" :disabled="isCantEditInfo">
                    <el-form-item  label="名称:">
                        <el-input v-model="editInfo.name" placeholder="名称"></el-input>
                    </el-form-item>
                    <el-form-item  label="停车场:"  v-show='dialogStation'>
                        <my-select-station v-model="editInfo.station" size="small" class="cell" width='100%' placeholder="停车场" @select='getDeviceByStationId'></my-select-station>
                    </el-form-item>
                    <el-form-item  label="类型:" >
                    <el-radio-group v-model="editInfo.type" disabled>
                        <el-radio v-for='(i,index) in ruleType'  :label='i.key' :key="i.key" v-if='index<2'>{{i.value}}</el-radio>
                    </el-radio-group>
                    </el-form-item>
                    <el-form-item  label="车型:" >
                    <el-radio-group v-model="editInfo.model">
                        <el-radio v-for='i in ruleModels'  :label='i.key' :key="i.key" >{{i.value}}</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item  label="设备:" v-loading="deviceshade">
                        <el-checkbox-group  v-model="editInfo.checkedDevices" >
                            <el-checkbox v-for="item in currentStationDevices" :label="item.id" :key="item.id">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="规则类型:" >
                        <el-select v-model="editInfo.payunit" size="small" placeholder="规则">
                            <el-option v-for="item in payunitMap" :key="item.key"  :value="item.key" :label="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="缴费渠道:" >
                        <el-checkbox-group  v-model="editInfo.paymethod" >
                            <el-checkbox v-for="(v,k) in payKindMap" :label="k" :key="k">{{v}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="最小缴费数:" >
                        <el-input v-model="editInfo.paymin" placeholder="最小缴费数:只能输入数字"></el-input>
                    </el-form-item>
                     <el-form-item label="最大缴费数:" >
                        <el-input v-model="editInfo.paymax" placeholder="最大缴费数:只能输入数字"></el-input>
                    </el-form-item>
                    <el-form-item label="缴费截止时间:" >
                           <el-date-picker v-model="editInfo.deadline" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="价格N1:" >
                        <el-input v-model="editInfo.N1" placeholder="价格N1:只能输入数字" ></el-input>
                    </el-form-item>
                    <!--<el-form-item  label="价格N2:">
                        <el-input v-model="editInfo.N2" placeholder="价格N2:只能输入数字"></el-input>
                    </el-form-item>
                    <el-form-item  label="价格N3:">
                        <el-input v-model="editInfo.N3" placeholder="价格N3:只能输入数字"></el-input>
                    </el-form-item>
                    <el-form-item  label="价格N4:">
                        <el-input v-model="editInfo.N4" placeholder="价格N4:只能输入数字"></el-input>
                    </el-form-item>
                    <el-form-item  label="价格N5:">
                        <el-input v-model="editInfo.N5" placeholder="价格N5:只能输入数字"></el-input>
                    </el-form-item>
                    <el-form-item  label="价格N6:">
                        <el-input v-model="editInfo.N6" placeholder="价格N6:只能输入数字"></el-input>
                    </el-form-item>
                    <el-form-item  label="价格N7:">
                        <el-input v-model="editInfo.N7" placeholder="价格N7:只能输入数字"></el-input>
                    </el-form-item>-->
                    <el-form-item  label="当前状态:" >
                    <el-radio-group v-model="editInfo.status">
                        <el-radio :label="'Y'">激活</el-radio>
                        <el-radio :label="'N'">禁止</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show" width='80%'>
                <el-form :model="remoteInfo.info" label-width="100px">     
                    <el-form-item label="请求结果:">
                        <span>{{remoteInfo.info.result||''}}</span>
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
            return {
                isCantEditInfo: false,
                payKindMap:{'APP':'线上缴费','iPos':'iPos','manual':'现金','TCB':'停车宝','CWB':'车位宝','EFT':'E费通'},
                shade:false,
                deviceshade:false,
                dialogStation:false,
                loadVendor:false,
                updateVisible:false,
                disableStatus:false,
                saveloading:false,
                remoteInfo:{title:'',show:false,info:{}},
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{station:'',status:'',name:''},
                method_ids:["APP","iPos","manual","TCB","CWB","EFT"],
                tableData:[],
                editInfo:{deadline:'',name:'',type:'',model:'',payunit:'',paymin:'',paymax:'',paymethod:[],N1:'',N2:'',N3:'',N4:'',N5:'',N6:'',N7:'',status:'',checkedDevices:[]},
                currentStationDevices:[],
                ruleModels:[],
                ruleType:[],
                payunitMap:[],
                action:'',
                //payunitMap:[{value:'年卡',key:'Y'},{value:'月卡',key:'M'},{value:'日卡',key:'D'},{value:'季卡',key:'S'},{value:'次卡',key:'T'},],

             }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            
            getDeviceByStationId:function(obj){
                var vm= this;
                vm.getDeviceData(obj.id);
                vm.editInfo.station_id = obj.id
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
            getType:function(type,data){
                 if(Array.isArray(data) && data.length>0){
                    return (data.find(function(item){return item.key == type})).value;
                }
            },
            updateClick:function(index,row){
                this.isCantEditInfo = false
                if (row.type === 'temp') {
                    this.isCantEditInfo = true
                }
                var vm = this;
                vm.action = 'edit';
                vm.updateVisible = true;
                vm.dialogStation = false;
                vm.updateTitle = "编辑月卡规则信息";
                vm.editInfo={deadline:row.deadline,name:row.name,type:row.type,status:row.status,model:row.model,payunit:row.payunit,paymin:row.paymin,paymax:row.paymax,paymethod:[],N1:row.N1,N2:row.N2,N3:row.N3,N4:row.N4,N5:row.N5,N6:row.N5,N7:row.N7,id:row.id,station_id:row.station,checkedDevices:[]};
                vm.editInfo.paymethod = row.paymethod;
                vm.getDeviceData(row.station)
                .then(function(){
                     vm.editInfo.checkedDevices = row.device_info.map(function(k){return k.device_id})
                })
            },
            addClick:function(){
                var vm = this;
                vm.updateVisible = true;
                vm.dialogStation = true;
                vm.updateTitle = "添加月卡规则信息";
                vm.editInfo={deadline:'',name:'',type:'month',model:'small',payunit:'M',paymin:1,paymax:12,N1:0,N2:0,N3:0,N4:0,N5:0,N6:0,N7:0,status:'Y',checkedDevices:[],paymethod:vm.method_ids,station_id:'',device_ids:''};
                vm.action = 'add';
                vm.currentStationDevices =[];
            },
            editSubmit:function(){
                var vm = this;
                var msgMap = {'N2':'价格N2','N3':'价格N3','N4':'价格N4','N5':'价格N5','N6':'价格N6','N7':'价格N7'};
                if(vm.editInfo.name == ''){
                    vm.$message({ showClose:true, message:'名称不能为空', type:'error' }); return;
                }
                if(vm.editInfo.station_id == ''){
                    vm.$message({ showClose:true, message:'停车场不能为空', type:'error' }); return;
                }
                if(vm.editInfo.N1 === '' ){
                    vm.$message({ showClose:true, message:'价格N1不能为空', type:'error' }); return;
                }
                if(vm.editInfo.paymethod.length ==0 ){
                    vm.$message({ showClose:true, message:'缴费渠道不能为空', type:'error' }); return;
                }
                for(var i in msgMap){
                    if(vm.editInfo[i] === ''){
                        vm.$message({ showClose:true, message:msgMap[i]+'不能为空', type:'error' }); return;
                    }
                }
                var url = "/rule/add";
                vm.editInfo.deadline=vm.editInfo.deadline||'';
                let {N1,N2,N3,N4,N5,N6,N7,name,type,status,model,station_id,payunit,paymin,paymax,deadline} =vm.editInfo;
                var editData = {
                    N1,N2,N3,N4,N5,N6,N7,name,type,status,model,station_id,payunit,paymin,paymax,deadline,
                    device_ids:vm.editInfo.checkedDevices.join(','),
                    paymethod:vm.editInfo.paymethod.join(','),
                };

                if(vm.action == 'edit'){
                    url = "/rule/update";
                    editData.rule_id = vm.editInfo.id
                }
                vm.saveloading = true;
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                        vm.saveloading = false;
                        if(res && res.code == 0){
                            vm.updateVisible = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                })

            },
            btnUndo:function(){
                this.search = {status:'Y',station:'',name:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = "/rule/lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var params = vm.$route.params;
                if(params.station_id!== undefined){vm.search.station = params.station_id}
                if(this.search.status) url += "&status=" + this.search.status;
                if(this.search.station) url += "&station_id=" + this.search.station;
                if(this.search.name) url += "&name=" + this.search.name;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'&&res.code == 0){
                        vm.tableData = res.content.lists;
                        vm.ruleType = res.content.types;
                        vm.ruleModels = res.content.models;
                        vm.payunitMap = res.content.payunit;
                        vm.pagination.total = res.content.total || 0;
                        utils.setCache(vm,['payunitMap','ruleType','ruleModels']);
                    }else{
                        vm.ruleType = [];
                        vm.ruleModels = [];
                        vm.tableData = [];
                    }
                    vm.shade = false;
                })
            },
            getDeviceData:function(id){
                var vm = this;
                vm.deviceshade = true;
                return utils.fetch("/device/getDatas?station_id="+id).then(function(res){
                    vm.currentStationDevices = typeof(res) != 'undefined'&&res.code == 0 ? res.content : [];
                    vm.deviceshade = false;
                })
            },
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                var hasParams = utils.hasRouteParams(vm.$route.params);
                if(hasParams){vm.getData();return};
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

<style>

    .el-form-item{
        margin-bottom: 12px;
    }
    .el-checkbox{
        margin-left: 10px;
    }
    .el-checkbox+.el-checkbox{
        margin-left: 10px;
    }
</style>
