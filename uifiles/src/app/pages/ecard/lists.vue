
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.phone"  size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <my-select-plate  v-model="search.plate" size="small" class="cell widthX150" placeholder="车牌"></my-select-plate>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="goEcardlist" size="small"><i class="fa fa-cubes"></i>一卡通区域</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="90"></el-table-column>
                    <el-table-column prop="username" label="车主" min-width="90"></el-table-column>
                    
                    <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
                    <el-table-column prop="station_name" label="缴费停车场" width="150"></el-table-column>
                    <el-table-column prop="time_begin" label="开始时间" min-width="150"></el-table-column>
                    <el-table-column prop="time_end" label="结束时间" min-width="150"></el-table-column>
                    <el-table-column label="一卡通区域" min-width="180">
                        <template slot-scope="scope">
                            <span>{{setRulesName(scope.row.rule_names)}}</span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column prop="creationtime" label="创建时间" min-width="120"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="120"></el-table-column>
                    <el-table-column prop="oa" label="操作人" min-width="90"></el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini">编辑</el-button>
                            <el-button @click="delClick(scope.$index,scope.row)" plain size="mini">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="ecardInfo"  label-width="120px">
                    <el-form-item  label="车牌号:">
                        <my-select-plate v-if="updateAction" v-model="ecardInfo.plate" size="small" class="cell widthP100"  placeholder="车牌" :disabled='plateDisable' @select='getContractData($event)' style='top:0'></my-select-plate>
                        <el-input v-else v-model="ecardInfo.plate" placeholder="请输入车牌号" :disabled='plateDisable'  @blur='getContractData' @change = 'clearContractData'></el-input>
                    </el-form-item>
                    <el-form-item  label="缴费停车场:">
                    <el-select v-model="ecardInfo.station"  placeholder="请选择缴费停车场"  class="widthP100" v-loading='loadstation' >
                        <el-option  v-for="k in ecardInfo.payParking"
                        :key="k.id" :label="k.station_name" :value="k.id">
                        <!-- {{k.station_name}} - {{k.phone}} - {{k.cardName}} - {{k.cardType}} - {{k.price}} -->
                        <div class="option_slot">
                            <div>{{k.station_name}}</div>
                            <div>{{k.type==0?'主卡':'副卡'}}</div>
                            <div>{{k.phone}}</div>
                            <div>{{k.rule_name}}</div>
                        </div>
                        </el-option>
                    </el-select>
                    </el-form-item>
                    <el-form-item label="一卡通区域:">
                        <el-checkbox-group  v-model="ecardInfo.checkedRules" >
                            <el-checkbox v-for="rule in rules" :label="rule.id" :key="rule.id"  @change ='checkrules($event,rule.id)'>{{rule.name}}</el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="ecardSubmit" type="primary" size="small">{{dialog}}</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    // import Mock from 'mockjs';
     export default {
        data:function(){
            return {
                shade:false,
                loadstation:false,
                updateVisible:false,
                dialog:'',
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{plate:'',phone:'',station:''},
                tableData:[],
                dialogTableVisible:false,
                gridData:[],
                ecardInfo:{plate:'',station:'',carid:'',payParking:[],checkedRules: []},
                rules: [],
                checkedRulesById:'',
                action:'',
                plateDisable:false,
                updateAction:true

            }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            setRulesName:function(array){
               return  Array.isArray(array)?array.map(function(item){
                    return item.name
                }).join(','):'';
            },
            updateClick:function(index,row){
                var vm = this;
                vm.action = 'edit';
                vm.dialog = '保存';
                vm.plateDisable=true;
                vm.updateAction=false;
                vm.updateVisible = true;
                vm.updateTitle = "编辑一卡通信息";
                vm.ecardInfo={station:parseInt(row.contract),plate:row.plate,payParking:[],carid:row.car,checkedRules: []};
                vm.getContractData().then(function(value){
                     vm.getRules().then(function(){
                        vm.ecardInfo.checkedRules = row.rule_names.map(function(i){
                            return i.id
                        })
                    })
                })

            },
            addClick:function(){
                var vm = this;
                vm.getRules();
                vm.updateVisible = true;
                vm.updateAction = true;
                vm.plateDisable=false;
                vm.updateTitle = "添加一卡通信息";
                vm.ecardInfo={station:'',plate:'',payParking:[],carid:'',checkedRules: []};
                vm.dialog = '提交';
                vm.action = 'add';

            },
            ecardSubmit:function(){
                var vm = this;
                var action = vm.action == 'edit'? 'edit':'add';
                if(vm.ecardInfo.carid == ''){
                    vm.$message({ showClose:true, message:'车牌号不能为空', type:'error' }); return ;
                }
                if(vm.ecardInfo.station == ''){
                    vm.$message({ showClose:true, message:'缴费停车场不能为空', type:'error' }); return ;
                }
                if(vm.ecardInfo.checkedRules.length == 0){
                    vm.$message({ showClose:true, message:'一卡通区域不能为空', type:'error' }); return ;
                }
                var editData={
                    car_id  : vm.ecardInfo.carid,
                    contract_id :vm.ecardInfo.station,
                    rule_ids  : vm.ecardInfo.checkedRules.join(',')
                };
                var url = '/roaming/add';
                if(action == 'edit') url = '/roaming/update';
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.updateVisible = false;
                             vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })

            },
            clearContractData:function(){
                this.ecardInfo.station= '';
            },
            getContractData:function(e){//输入车牌
                var vm = this;
                var getData=e?{car_id:e.value}:{car_id:parseInt(vm.ecardInfo.carid)}
                vm.loadstation = true;
                return utils.fetch('/contract/getContract',{method:'POST',body:getData}).then(function(res){
                    vm.loadstation = false;
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.ecardInfo.payParking = res.content.lists;
                            vm.ecardInfo.carid=res.content.car_id;
                            return true;
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            checkrules:function(checked,id){
                var vm = this;
                var newArray = vm.ecardInfo.checkedRules.concat();
                if(checked){
                   if(newArray.indexOf(id) == -1) {
                        newArray.push(id)
                   }
                }else{
                   if(newArray.indexOf(id) != -1) {
                        var index= newArray.indexOf(id);
                        newArray.splice(index,1)
                   }
                }
               vm.ecardInfo.checkedRules = newArray;
            },
            goEcardlist:function(){
                var r = { path:'/ecard/rules'};
                this.$router.push(r);
            },

            btnUndo:function(){
                this.search = {plate:'',phone:'',station:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = "/roaming/lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(this.search.plate) url += "&car_id=" + this.search.plate;
                if(this.search.phone) url += "&phone=" + this.search.phone;
                if(this.search.station) url += "&station_id=" + this.search.station;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                     vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                })
            },
            delClick:function(index,row){
                var vm = this;
                var str = '您确定要删除车牌号为:“'+row.plate+'”的信息吗?';
			    this.$msgbox({
                    title:'提示',
                    message:str,
					showCancelButton:true,
					confirmButtonText:'确定',
			        cancelButtonText:'取消',
					type:'warning',
			        beforeClose:function(action, instance, done){
			            if(action === 'confirm'){
			            	instance.confirmButtonLoading = true;
			            	instance.confirmButtonText = '正在删除...';
							vm.del_plate(index,row);
							instance.confirmButtonLoading = false;
							done();
			            } else {
			            	done();
			            }
			        }
				});
            },
            del_plate:function(index,row){
                var vm = this;
                var postData= {
                    car_id:row.car,
                    contract_id:row.contract
                };
                utils.fetch('/roaming/delete',{method:'POST',body:postData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getRules:function(){
                var vm = this;
                return utils.fetch('/roaming/getRules').then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.rules = res.content.lists;
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })

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
<style>
    .option_slot{
        display: flex;
    }
    .option_slot div{
        flex:1;
    }
    .el-checkbox{
        margin-left: 10px;
    }
    .el-checkbox+.el-checkbox{
        margin-left: 10px;
    }
</style>
