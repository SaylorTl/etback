<template>
    <div id="box" class="menu-hide">
            <div class="worker station">
                <div class='condition clearfix box-width'>
                    <div class="left">
                        <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                        <my-select-station v-model.trim="search.station" size="small" class="cell widthX150"   placeholder="停车场" clearable></my-select-station>
                        <el-input v-model.trim="search.mobile" size="small" class="cell widthX150"  placeholder="手机号"></el-input>
                        <el-select v-model="search.status" placeholder="选择状态" size="small"  class="widthX120">
                            <el-option  label="未审批" value="refused"></el-option>
                            <el-option  label="已通过" value="agreed"></el-option>
                            <el-option  label="已取消" value="canceled"></el-option>
                            <el-option  label="已完成" value="completed"></el-option>
                            <el-option  label="已创建" value="created"></el-option>
                        </el-select>
                        <el-select v-model="search.stages" placeholder="选择阶段" size="small"  class="widthX120">
                            <el-option  label="勘测" value="survey"></el-option>
                            <el-option  label="发货" value="delivery"></el-option>
                            <el-option  label="施工" value="construction"></el-option>
                            <el-option  label="完工" value="check"></el-option>
                        </el-select>
                            <el-button class="cell btn-cell" size="small" @click="btnSearch"><i class="fa fa-search"></i>查找</el-button>
                            <el-button class="cell btn-cell lastCell" size="small" @click="btnUndo"><i class="fa fa-undo"></i>重置</el-button>
                    </div>
                    <div class="right">
                        <el-button size="small" @click="addClick" >添加项目</el-button>
                    </div>
                </div>
                <!--商家表格信息-->
                    <div class='table box-width'>
                       <div class='table box-width'>
                        <el-table :data="tableData" border style="width: 100%" v-loading="shade" element-loading-text="拼命加载中" row-key="id" :expand-row-keys="expands" @expand-change="rowClick">
                             <el-table-column type="expand">
                                <template slot-scope="props">
                                <el-tabs type="border-card"  v-model="activeStage" @tab-click="invoke(props.row)">
                                    <el-tab-pane v-for="(item,index) in stageList" :key="index" :label="item" :name="item">
                                        <el-button @click="addpeo(props.row,props.row.id,props.row.approval,props.row.name)" type="plian" size="small">添加负责人
                                        </el-button>
                                        <el-button @click="open(props.row,2)" type="plian" size="small" :disabled="activeStage!=props.row.newstages">同意申请
                                        </el-button>
                                        <el-button @click="open(props.row,3)" type="plian" size="small" :disabled="activeStage!=props.row.newstages">拒绝申请
                                        </el-button>
                                        <div class="widthX150 mtb5"></div>
                                        <el-table style="width: 100%" :data="stagesData" v-loading="innershade">
                                            <el-table-column property="id" label="id" align="center" width="60"></el-table-column>
                                            <el-table-column property="username" label="项目负责人" align="center" width="120"></el-table-column>
                                            <el-table-column property="" label="项目地址" align="center" width="120"></el-table-column>
                                            <el-table-column property="mobile" label="负责人手机号" align="center" width="90"></el-table-column>
                                            <el-table-column property="creattime" label="上传时间" align="center" width="130"></el-table-column>
                                            <el-table-column property="alStatus" label="状态" align="center" width="100"></el-table-column>
                                            <el-table-column property="described" label="项目描述" align="center" width="130"></el-table-column>
                                            <el-table-column property="agreetime" label="审批时间" align="center" width="130"></el-table-column>
                                            <el-table-column label="操作" align="center" width="90">
                                                <template slot-scope="slots">
                                                    <el-button @click="changeClick(slots.row)" type="plian" size="small">图片
                                                    </el-button>
                                                </template>
                                        </el-table-column>
                                         </el-table>
                                     </el-tab-pane>
                                    </el-tabs>
                                </template>
                            </el-table-column>
                            <el-table-column label="#" width="60" type="index">
                            </el-table-column>
                            <el-table-column label="项目名称" min-width="135" align="center">
                                 <template slot-scope="scope">
                                    <span v-if="scope.row.is_read == 'N'" style="color:red">{{scope.row.name}}</span>
                                    <span v-if="scope.row.is_read == 'Y'">{{scope.row.name}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="创建时间" required width="140" prop="creattime" align="center">
                            </el-table-column>
                            <el-table-column label="现阶段" width="100" prop="newstages">
                            </el-table-column>
                            <el-table-column label="状态" required width="80" prop="newstatus" align="center">
                            </el-table-column>
                            <el-table-column label="阶段负责人/手机号" width="180" align="center">
                                <template slot-scope="scope">
                                    <span>{{scope.row.username+"/"+scope.row.mobile}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="阶段联系人/手机号" width="180" align="center">
                                <template slot-scope="scope">
                                    <span>{{scope.row.contact_name+"/"+scope.row.contact_mobile}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="项目地址" prop="pro_address" width="180" align="center">
                            </el-table-column>
                            <el-table-column label="上传时间" required width="140" prop="modifytime" align="center">
                            </el-table-column>
                            <el-table-column label="审批人手机号" prop="approval" align="center"  width="110">
                            </el-table-column>
                            <el-table-column label="审批时间" required width="150" prop="agreetime" align="center">
                            </el-table-column>
                            <el-table-column label="操作" width="90">
                                <template slot-scope="scope">
                                    <el-button  @click="editSubmit(scope.row)" plain size="mini">编辑</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                       </div>
                    </div>
                    <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
                    <!-- <div class="pagination">
                        <el-pagination
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page="pagination.page"
                            :page-sizes="[20,50,100]"
                            :page-size="pagination.pagesize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="pagination.total">
                        </el-pagination>
                    </div> -->
                    <el-dialog title="展示图片" :visible.sync="dialogVisible" size="small" :before-close="handleClose">
                    <div class="block">
                        <el-carousel trigger="click" height="550px">
                            <el-carousel-item v-for="(item,index) in fileLists" :key="index">
                                <img :src="item" style="width: 100%;display:block"/>
                            </el-carousel-item>
                        </el-carousel>
                    </div>
                </el-dialog>
                <el-dialog title="添加项目" :visible.sync="addVisible" size="small" :before-close="addClose">
                    <el-form label-width="120px" >
                        <el-form-item label="车场名称:" >
                            <my-select-station v-model.trim="addpjd.station" size="small" class="cell" width="200px" placeholder="停车场"></my-select-station>
                        </el-form-item>
                        <el-form-item  label="审批人手机号:">
                            <el-input v-model.trim="addpjd.approval" size="small" class="cell widthX200"  placeholder="手机号"></el-input>
                        </el-form-item>
                          <el-form-item label="项目地址:" label-width="120px">
                            <el-input type="textarea" :rows="2" placeholder="项目地址" v-model="addpjd.pro_address" size="small" class="widthX300">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="联系人姓名:" label-width="120px">
                            <el-input v-model="addpjd.contact_name" placeholder="联系人姓名" size="small" class="widthX200" ></el-input>
                        </el-form-item>
                        <el-form-item label="联系人手机号:" label-width="120px" >
                            <el-input v-model="addpjd.contact_mobile" placeholder="联系人手机号" size="small" class="widthX200" ></el-input>
                        </el-form-item>
                        <el-form-item  label="" label-width="120px" >
                            <el-button type="primary" @click="pjdAdd">添加</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
                <el-dialog title="编辑项目" :visible.sync="editVisible" size="small" >
                    <el-form label-width="120px" >
                        <el-form-item label="车场名称:" >
                            <my-select-station v-model.trim="editpjd.station" size="small" class="cell" width="200px" placeholder="停车场"></my-select-station>
                            <!-- <el-input v-model.trim="editpjd.station" size="small" class="cell" width="200px" placeholder="停车场"></el-input> -->
                        </el-form-item>
                        <el-form-item  label="审批人手机号:">
                            <el-input v-model.trim="editpjd.approval" size="small" class="cell widthX200"  placeholder="手机号"></el-input>
                        </el-form-item>
                          <el-form-item label="项目地址:" label-width="120px">
                            <el-input type="textarea" :rows="2" placeholder="项目地址" v-model="editpjd.pro_address" size="small" class="widthX300">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="联系人姓名:" label-width="120px">
                            <el-input v-model="editpjd.contact_name" placeholder="联系人姓名" size="small" class="widthX200" ></el-input>
                        </el-form-item>
                        <el-form-item label="联系人手机号:" label-width="120px" >
                            <el-input v-model="editpjd.contact_mobile" placeholder="联系人手机号" size="small" class="widthX200" ></el-input>
                        </el-form-item>
                        <el-form-item  label="" label-width="120px" >
                            <el-button type="primary" @click="pjdEdit">添加</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
                <el-dialog title="选择负责人" :visible.sync="chooseVisible" size="small" :before-close="chooseClose">
                    <el-form >
                        <el-form-item label="选择负责人:" label-width="120px">
                            <el-select v-model="choosePeo.mobile" filterable placeholder="负责人手机号" size="small">
                                <el-option
                                    v-for="item in userLists" :key="item.value" :label="item.mobile" :value="item.mobile">
                                    <span style="float: left">{{ item.mobile }}</span>
                                    <span style="float: left;marginLeft:10px">{{ item.username }}</span>
                                    <img style="float: right; display:block;height:100%;width:auto; " :src="item.avator"/>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="选择负责人:" label-width="120px">
                            <el-button type="primary" @click="chooseAdd">添加</el-button>
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
        return{
            shade:false,
            pagination:{ page: 1, pagesize: 20, total: 0, showTotal: true },
            dialogVisible:false,
            tableData:[],//遍历得到的所有商家信息的数组；
            filename:[],
            search:{dept:'',sation:'',status:'',mobile:'',stages:""},
            addVisible:false,
            addpjd:{station:"",approval:"",contact_name:'',contact_mobile:'',pro_address:''},
            editpjd:{id:'',station_name:'',station:"",approval:"",contact_name:'',contact_mobile:'',pro_address:''},
            userLists:[],//所有负责人的手机号
            chooseVisible:false,
            choosePeo:{id:'',mobile:"", approval:'',name:'',stages:''},
            fileLists:[],
            state1:'',
            stagesLists:[],//所有阶段的列表
            stageList:['勘测',"发货",'施工','完工验收'],//自己选择项目的阶段；
            stagesData:[],
            activeStage:"勘测",
            expands:[],//展开一行的时候其他行关闭
            innershade:false,
            textarea:"",//输入项目地址
            contactPeoMob:"",//联系人电话
            contactPeo:"",//联系人姓名
            editVisible:false
        }
  },
  mounted:function(){
        this.getData();
  },
  methods:{
      setPageData: function (pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        rowClick(row) {
            Array.prototype.remove = function (val) {
                let index = this.indexOf(val);
                if (index > -1) {
                    this.splice(index, 1);
                }
            };
            if (this.expands.indexOf(row.id) < 0) {
                this.expands = []
                this.expands.push(row.id);
            } else {
                this.expands.remove(row.id);
            }
            // utils.fetch("/voucher/lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize).then(function(res){
                
            // })
            var data = {
                id:row.id,
                is_read:'Y'
            }
            utils.fetch('/voucher/edit',{method:'post',body:data}).then(function(res){
            })
            this.activeStage = row.newstages;
            this.invoke(row)
        },
        invoke:function(row){
            var vm = this;
            vm.innershade=true
            vm.stagesData=[];
            var x ;
            switch (vm.activeStage){
                case '勘测':
                    x=0;
                break;
                case '发货':
                    x=1;
                break;
                case '施工':
                    x=2;
                break;
                case '完工验收':
                    x=3;
                break;
            }
            var url = '/voucher/repairList?station='+row.station+'&stages='+x;
            utils.fetch(url).then(function(res){
                vm.innershade = false;
                if(res.code==0 && typeof(res.content.lists)!='undefined' ) {
                    vm.stagesData = res.content.lists;
                    for(var i= 0;i<vm.stagesData.length;i++){
                        if(vm.stagesData[i].status=="working"){
                            vm.stagesData[i]["alStatus"] = "进行中"
                        }else if(vm.stagesData[i].status=="completed"){
                            vm.stagesData[i]["alStatus"] = "已完成"
                        }
                    }
                }else{
                    vm.innershade = false;
                    // vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            });
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = "/voucher/lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            if(vm.search.dept) url += "&dept=" + vm.search.dept;
            if(vm.search.station) url += "&station_id=" + vm.search.station;
            if(vm.search.mobile) url += "&mobile=" + vm.search.mobile;
            if(vm.search.status) url += "&status=" + vm.search.status;
            if(vm.search.stages) url += "&stages=" + vm.search.stages;
            utils.fetch(url).then(function(res){
                if(res.code==0 && typeof(res.content.lists)!='undefined') {
                    vm.shade = false;
                    vm.tableData = res.content.lists;
                    //refused 不通过审批，agreed同意通过，canceled取消，completed项目完成，created项目创建 working 施工中
                    for (var index = 0; index < vm.tableData.length; index++) {
                        if (vm.tableData[index].status == 'created') {
                            vm.tableData[index]['newstatus'] = '已创建'
                        } else if (vm.tableData[index].status == 'refused') {
                            vm.tableData[index]['newstatus'] = '已拒绝'
                        } else if (vm.tableData[index].status == 'agreed') {
                            vm.tableData[index]['newstatus'] = '已通过'
                        } else if (vm.tableData[index].status == 'completed') {
                            vm.tableData[index]['newstatus'] = '已完成'
                        } else if(vm.tableData[index].status == 'cancele'){
                            vm.tableData[index]['newstatus'] = '已取消'
                        } else if(vm.tableData[index].status == 'working'){
                            vm.tableData[index]['newstatus'] = '进行中'
                        }
                        switch (vm.tableData[index].stages){
                            case 'survey':
                                vm.tableData[index]['newstages']="勘测";
                            break;
                            case 'delivery':
                                vm.tableData[index]['newstages']="发货";
                            break;
                                case 'construction':
                                vm.tableData[index]['newstages']="施工" ;
                            break;
                                case 'check':
                                vm.tableData[index]['newstages']="完工验收";
                            break;
                        }
                    }
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                }else{
                    vm.shade=false;
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            });
        },
         //添加项目；
        addClick:function() {
            var vm = this;
            vm.addVisible = true;
            vm.addpjd = { station:"",approval:"",contact_name:'',contact_mobile:'',pro_address:''}
        },
        pjdAdd:function () {
            var vm = this;
            var url = "/voucher/add";
            var data = {
                station:vm.addpjd.station,
                approval:vm.addpjd.approval,
                contact_name:vm.addpjd.contact_name,
                contact_mobile:vm.addpjd.contact_mobile,
                pro_address:vm.addpjd.pro_address,
            }
            utils.fetch(url,{method:"POST",body:data}).then(function (res) {
                if(res.code==0){
                    console.log(res)
                    vm.addVisible =false ;
                    vm.success(res.message);
                    setTimeout(function(){
                        vm.getData();
                    },3000)
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            })
        },
        editSubmit:function(row){
            var vm = this;
            vm.editVisible = true;
            vm.editpjd = {
                id:row.id,
                station:row.station,
                approval:row.approval,
                contact_name:row.contact_name,
                contact_mobile:row.contact_mobile,
                pro_address:row.pro_address
            }
        },
        pjdEdit:function(){
            var vm = this;
            var data = {
                id:vm.editpjd.id,
                station:vm.editpjd.station,
                approval:vm.editpjd.approval,
                contact_name:vm.editpjd.contact_name,
                contact_mobile:vm.editpjd.contact_mobile,
                pro_address:vm.editpjd.pro_address
            };
            utils.fetch('/voucher/edit',{method:'post',body:data}).then(function(res){
                if(res.code == 0){
                    vm.editVisible = false;
                    vm.$message({ showClose:true, message:res.message, type:'success'});
                    vm.getData();
                }else{
                    vm.editVisible = false;
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            })
        },
        btnSearch:function(){
            this.shade=true;
            this.pagination.page=1;
            this.getData();
        },
        btnUndo:function(){
            this.shade=true;
            this.search={dept:'',sation:'',status:'',mobile:''};
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData()
        },
        addClose:function () {
            this.addVisible = false;
        },
        handleClose:function(tag) {
            this.dialogVisible=false;
        },
        //改变页数的时候数据变
        handleSizeChange:function(val){
            this.pagination.page = 1;
            this.pagination.pagesize = val;
            this.getData();
        },
        handleCurrentChange:function(val){
            this.pagination.page = val;
            this.getData();
        },
        changeClick:function(row){
            var vm = this;
            this.dialogVisible=true;
            var fileList = vm.stagesData;
            for(var i = 0;i<fileList.length;i++){
                if(row.id == fileList[i].id){
                    vm.fileLists = fileList[i].filename
                }
            }
        },
        agreen:function(row,num){
            var vm = this;
            var y ='';
            var status = '';
            if(num == 2 ){
                status = 'agreed';
            }else{
                status = 'refused'
            }
            switch (vm.activeStage){
                case '勘测':
                    y="survey";
                break;
                case '发货':
                    y="delivery";
                break;
                    case '施工':
                    y="construction";
                break;
                    case '完工验收':
                    y="check";
                break;
            }
                var url = "/voucher/agreeupdate";
                var data = {
                    id:row.id,//项目ID
                    status:status,//是否同意
                    approval:row.approval,//审批人手机号
                    name:row.name,//项目名称
                    mobile:row.mobile,//负责人手机号
                    stages:y,//阶段
                    creattime:row.creattime,//项目创建时间
                    station:row.station//停车场ID
                };
                utils.fetch(url,{ method:'post',body:data }).then(function (res) {
                    if(res.code==0){
                        vm.getData();
                    }else {
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                })
        },
        //申请成功时的提示；
        success(a) {
            this.$notify.success({
                title: '成功',
                message: a + "," + '等待刷新',
                offset: 40,
                duration: 2000
            })
        },
        addpeo:function (row,id,approval,name) {
            var vm = this;
            var y ='';
            switch (vm.activeStage){
                case '勘测':
                    y="survey";
                break;
                case '发货':
                    y="delivery";
                break;
                    case '施工':
                    y="construction";
                break;
                    case '完工验收':
                    y="check";
                break;
            }
            vm.chooseVisible = true;
            vm.choosePeo = {id:id,mobile:row.mobile,approval:approval,name:name,stages:y}
            var url = '/voucher/userList';
            utils.fetch(url).then(function (res) {
                if(res.code == 0 && typeof(res.content)!=''){
                    vm.userLists = res.content.lists;
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            })
        },
        chooseClose:function () {
            this.chooseVisible = false ;
        },
        chooseAdd:function () {
            var vm = this;
            var url = '/voucher/assignuser';
            var data = vm.choosePeo;
            utils.fetch(url,{method:'post',body:data}).then(function (res) {
                vm.chooseVisible = false;
                if(res.code == 0){
                    vm.success(res.message);
                    setTimeout(function(){
                        vm.getData();
                    },3000)
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            })
        },
        //弹框
        open:function(row,num) {
          var vm = this;
          var message;
          if(num == 2){
              message = "同意"
          }else{
              message = "拒绝"
          }
          this.$confirm("您确定"+message+"该阶段吗", '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
            }).then(() => {
                if(num==2){
                    vm.agreen(row,2)
                }else{
                    vm.agreen(row,3)
                }
            }).catch(() => {
            });
        }
    }
}
</script>
<style scoped>
.el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  };
  .el-carousel__item:nth-child(2n) {
     background-color: #99a9bf;
  };
  .el-carousel__item:nth-child(2n+1) {
     background-color: #d3dce6;
  };
</style>
