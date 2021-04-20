
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-select v-model="search.type" size="small" class="cell widthX100"  placeholder="类型">
                        <el-option label="一口价" value="Y"></el-option>
                        <el-option label="百分比" value="P"></el-option>
                        <el-option label="固定优惠" value="C"></el-option>
                    </el-select>
                    <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态">
                        <el-option label="已启用" value="working"></el-option>
                        <el-option label="已禁用" value="locked"></el-option>
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
                                <el-form-item label="优惠说明:">
                                    <span class="ml10 mr10">{{props.row.memo}}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场"  min-width="120"></el-table-column>
                    <el-table-column prop="rule_name" label="规则名称"  min-width="120"></el-table-column>
                    <el-table-column prop="rule_N1" label="月卡金额"  min-width="85">
                    </el-table-column>
                    <el-table-column label="优惠类型"  width="90">
                         <template slot-scope="scope">
                            <span v-if="scope.row.type == 'Y'">一口价</span>
                            <span v-else-if="scope.row.type == 'P'">百分比</span>
                            <span v-else-if="scope.row.type == 'C'">固定优惠</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="rate" label="优惠金额" min-width="75">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type !== 'P'">{{scope.row.rate}}</span>
                            <span v-else>{{(scope.row.rate*100).toFixed(2) > 100 ? `100%` : `${(scope.row.rate*100).toFixed(2)}%`}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="term" label="缴纳月数"  min-width="65"></el-table-column>
                    <el-table-column prop="num" label="限购次数"  min-width="65"></el-table-column>
                    <el-table-column label="状态"  min-width="65">
                         <template slot-scope="scope">
                            <span v-if="scope.row.status == 'working'">已启用</span>
                            <span v-else-if="scope.row.status == 'locked'" style="color:grey;font-style:italic">已禁止</span>
                         </template>
                    </el-table-column>
                    <el-table-column prop="sale_begin" label="购买开始时间"  min-width="125"></el-table-column>
                    <el-table-column prop="sale_end" label="购买结束时间"  min-width="125"></el-table-column>
                    <el-table-column prop="term_begin" label="优惠开始时间"  min-width="125"></el-table-column>
                    <el-table-column label="操作"  min-width="50">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini" class="ml0">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo">
                    <el-form-item  label="停车场:" label-width="120px"  v-show='dialogStation'>
                        <my-select-station v-model="editInfo.station" size="small" class="cell" width='100%' placeholder="停车场" :disabled="editInfo.id!=0" @select='SelectUpdateStation'></my-select-station>
                    </el-form-item>
                    <el-form-item label="月卡规则:" label-width="120px">
                        <el-select v-model="editInfo.rule" size="small" class="widthP100" placeholder="规则">
                            <el-option v-for="item in editInfo.rules" :key="item.id" :value="item.id" :label="item.name">
                                <span class="left">{{item.name}}</span>
                                <span class="ruleN1">¥:{{item.N1}}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item  label="活动类型:" label-width="120px" >
                    <el-radio-group v-model="editInfo.type">
                        <el-radio :label="'Y'">一口价</el-radio>
                        <el-radio :label="'P'">百分比</el-radio>
                        <el-radio :label="'C'">固定优惠</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item  label="活动状态:" label-width="120px" >
                    <el-radio-group v-model="editInfo.status">
                        <el-radio :label="'working'">启用</el-radio>
                        <el-radio :label="'locked'">禁用</el-radio>
                    </el-radio-group>
                    </el-form-item>
                    <el-form-item  label="活动金额:" label-width="120px" v-if='editInfo.type==="Y"'>
                        <el-input v-model="editInfo.rate" placeholder="请输入活动金额" type='number' min="0"></el-input>
                    </el-form-item>
                    <el-form-item  label="活动金额:" label-width="120px" v-if='editInfo.type==="C"'>
                        <el-input v-model="editInfo.rate" placeholder="每个月固定优惠的金额" type='number' min="0"></el-input>
                    </el-form-item>
                    <el-form-item  label="活动金额:" label-width="120px" v-if='editInfo.type==="P"'>
                        <el-input v-model="editInfo.rate" placeholder="请输入小数百分比;如‘5%’就输入‘0.05’"></el-input>
                    </el-form-item>
                    <el-form-item  label="缴纳月数:" label-width="120px" >
                        <el-input v-model="editInfo.term" placeholder="连续缴纳月数" type='number' min="1" max="24" step="1"></el-input>
                    </el-form-item>
                    <el-form-item  label="次数:" label-width="120px" >
                        <el-input v-model="editInfo.num" placeholder="每月限购次数" type='number'  min="0" ></el-input>
                    </el-form-item>
                    <el-form-item label="优惠开始时间:" label-width="120px">
                        <el-date-picker v-model="editInfo.term_begin"  size="small" type="date" class="widthP100" placeholder="选择购买开始时间" value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="购买开始时间:" label-width="120px">
                        <el-date-picker v-model="editInfo.sale_begin" size="small" type="date" class="widthP100" placeholder="选择购买开始时间"  value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="购买结束时间:" label-width="120px">
                        <el-date-picker v-model="editInfo.sale_end" size="small" type="date" class="widthP100" placeholder="选择购买结束时间"  value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item  label="优惠说明:" label-width="120px" >
                        <el-input v-model="editInfo.memo" placeholder="例如:从2018年1月1日开始，连续缴纳12个月以上的,月卡17每月" type='textarea'></el-input>
                    </el-form-item>
                    <el-form-item label-width="120px">
                        <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
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
                shade:false,
                dialogStation:false,
                loadVendor:false,
                updateVisible:false,
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{station:'',type:'',status:''},
                tableData:[{station:'',rule:'',sale_begin:'',sale_end:'',type:'',rate:'',term:'',term_begin:'',memo:'',station_name:'',rule_name:'',rule_N1:'',status:''}],
                editInfo:{id:0,station:'',rule:'',rules:[],sale_begin:'',sale_end:'',memo:'',term:'',term_begin:'',type:'',status:''},
                action:'',
                flag:false
             }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
           SelectUpdateStation:function(obj){
                var vm = this;
                if(this.editInfo.id == 0){
                    utils.getRulesByStationID(vm.editInfo.station).then(function(arr){
                        vm.editInfo.rules = arr;
                    })
                }
            },

            updateClick:function(index,row){
                var vm = this;
                vm.action = 'edit';
                vm.updateVisible = true;
                vm.dialogStation = true;
                vm.updateTitle = "编辑月卡活动信息";
                vm.editInfo={id:row.id,station:row.station,rule:row.rule,sale_begin:row.sale_begin,sale_end:row.sale_end,type:row.type,rate:row.rate,term:row.term,num:row.num,term_begin:row.term_begin,memo:row.memo,rules:row.rules,status:row.status};
                utils.getRulesByStationID(row.station).then(function(arr){
                        vm.editInfo.rules =  arr;
                })
            },
            addClick:function(){
                var vm = this;
                vm.updateVisible = true;
                vm.dialogStation = true;
                vm.updateTitle = "添加月卡活动信息";
                vm.editInfo={id:'0',station:'',rule:'',rules:[],sale_begin:'',sale_end:'',type:'Y',rate:'',term:'',num:'',term_begin:'',memo:'',status:'working'};
                vm.action = 'add';
            },
            editSubmit:function(){
                var vm = this;
                if(vm.editInfo.station == ''){
                    vm.$message({ showClose:true, message:'停车场不能为空', type:'error' }); return;
                }
                if(vm.editInfo.rule == ''){
                    vm.$message({ showClose:true, message:'规则不能为空', type:'error' }); return;
                }
                if(vm.editInfo.rate == '' || vm.editInfo.rate < 0 ){
                    vm.$message({
                        showClose:true,message:'活动金额不能为空且不能为负数',type:'error'
                    });return;
                }
                if(vm.editInfo.term === '' || vm.editInfo.term < 1 || vm.editInfo.term>24  || !/^[1-9]\d*$/.test(vm.editInfo.term)){
                  vm.$message({
                    showClose:true,message:'缴纳月数不能为空且只能为1-24之间的正整数',type:'error'
                  });return;
                }
                if(vm.editInfo.sale_begin !== null && vm.editInfo.sale_end !== null && vm.editInfo.term_begin !== null ){
                    var begin = utils.timeParse( vm.editInfo.sale_begin,'-',false );
                    var end = utils.timeParse( vm.editInfo.sale_end,'-',false );
                    var term_begin = utils.timeParse( vm.editInfo.term_begin,'-',false );
                    if( begin > end ){
                        vm.$message({
                        showClose:true,message:'开始时间不能大于结束时间',type:'error'
                        });return;
                    }
                }else{
                    vm.$message({
                    showClose:true,message:'时间必添',type:'error'
                  });return;
                }
                if(vm.editInfo.memo === ''){
                    vm.$message({
                        showClose:true,message:'优惠说明不能为空',type:'error'
                    });return;
                }
                var url = "/sale/add";
                var editData = {
                    station:vm.editInfo.station,
                    rule:vm.editInfo.rule,
                    begin_time:utils.timeParse(vm.editInfo.sale_begin,'-',false),
                    end_time:utils.timeParse(vm.editInfo.sale_end,'-',false),
                    type:vm.editInfo.type,
                    status:vm.editInfo.status,
                    rate:vm.editInfo.rate,
                    term:vm.editInfo.term,
                    num:vm.editInfo.num||0,
                    time:utils.timeParse(vm.editInfo.term_begin,'-',false),
                    memo:vm.editInfo.memo
                };

                if(vm.action == 'edit'){
                    url = "/sale/update";
                    editData.sale_id = vm.editInfo.id
                }
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
            btnUndo:function(){
                this.search = {status:'',station:'',type:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = "/sale/saleLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(vm.search.type) url += "&type=" + vm.search.type;
                if(vm.search.station) url += "&station_id=" + vm.search.station;
                if(vm.search.status) url +="&status=" + vm.search.status;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'&&res.code == 0){
                        vm.tableData = res.content.result;
                        vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.num : 0;
                        utils.setCache(vm);
                        vm.flag = true;
                    }else{

                        vm.tableData = [];
                    }
                    vm.shade = false;
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
