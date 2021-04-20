<template>
    <div id="box" fclass="menu-hide">
            <div class="worker station">
                <div class='condition clearfix box-width'>
                    <div class="left">
                        <el-select v-model="type" filterable placeholder="优惠券名称"  size='small'>
                            <el-option :label="item.coupon_type"  v-for="item in selectData"  :key="item.id" :value="item.coupon_type">
                            </el-option>
                        </el-select>
                        <el-button size="small" @click="btnSearch"><i class="fa fa-search"></i>查找</el-button>
                        <el-button size="small" @click="reset"><i class="fa fa-undo"></i>重置</el-button>
                    </div>
                    <div class="right">
                        <el-button size="small" @click="addClick">添加类型</el-button>
                    </div>
                </div>
                <!--优惠券表格信息-->
                <div class='table box-width'>
                    <div class='table box-width'>
                        <el-table :data="tableData" border style="width: 100%">
                            <el-table-column label="#" width="60" type="index">
                            </el-table-column>
                            <el-table-column label="优惠名称" prop="coupon_type">
                            </el-table-column>
                            <el-table-column label="优惠类型">
                                <template slot-scope="scope">
                                     {{cfg.map.kindtype[scope.row.kind]}}
                                </template>
                            </el-table-column>
                            <el-table-column label="优惠方式">
                                <template slot-scope="scope">
                                     {{scope.row.kind==='3'?'':(scope.row.value+cfg.map.time[scope.row.kind])}}
                                </template>
                            </el-table-column>
                            <!-- <el-table-column fixed="right" label="操作" width="100">
                                <template slot-scope="scope">
                                    <el-button type="plain" size="mini" @click="editClick(scope.row)">编辑</el-button>
                                    <el-button type="plain" size="mini" @click="delClick(scope.row)">删除</el-button>
                                </template>
                            </el-table-column> -->
                        </el-table>
                    </div>
                </div>
                <!--添加编辑优惠券-->
            <el-dialog :title="updateTitle" :visible.sync="updateVisible" width='40%'>
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item  label="优惠券名称:">
                        <el-input v-model="editInfo.name"  size="small" placeholder="优惠券类型"></el-input>
                    </el-form-item>
                    <el-form-item  label="优惠券类型:">
                        <el-select v-model="editInfo.kind" placeholder="请选择优惠类型">
                            <el-option v-for="(v,k) in cfg.map.kind" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item  label="优惠方式:">
                        <el-input v-model="editInfo.value" @change="valueChange"  size="small" class="widthP50" placeholder="优惠方式"></el-input>
                        <span>{{parseInt(editInfo.kind) == 2 ? "小时" : "元"}}</span>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="addSubmit" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
                <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
  data:function(){
        let cfg = {
            map:{
                kind:{'1':'金额减免券'},
                kindtype:{'1':'金额减免券','2':'时间减免券','3':'不定额减免券'},
                time:{'1':'元','2':'小时'}
            }
        }
      return{
            cfg,
            updateVisible:false,
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            updateTitle:"",
            editInfo:{name:'',kind:'',value:''},
            tableData:[],
            selectData:[],
            editVisible:false,
            isAddAction:false,
            type:'',
      }
  },
  mounted:function(){
      this.getData();
      this.getData('all');
  },
  methods: {
      //获取数据
      getData:function(type){
          var vm = this;
          var url = "/coupon/couType_lists?page="+vm.pagination.page+"&pagesize="+((type==='all')?99999:vm.pagination.pagesize);
          if(vm.type) url += '&coupon_type='+vm.type
          utils.fetch(url).then(function(res){
            let data = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists :[] ; 
            if(type==='all'){
               vm.selectData = data;
            }else{
              vm.tableData = data;
              vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
            }
              
          })
      },
      valueChange:function(){
       let v=this.editInfo.value;
        v=String(v);
        v=v.split('.');
        if ( v[1] &&v[1].length>2) {
            v[1]=v[1].substring(0,2);
            v=v[0]+'.'+v[1];
            v=Number(v);
            this.editInfo.value=v;
        }
      },
      addClick:function(){
          this.updateVisible=true;
          this.updateTitle = '添加优惠券';
          this.isAddAction = true;
          this.editInfo={name:'',kind:'1',value:''};
      },
      editClick:function(row){
            var vm = this;
            this.updateVisible=true;
            this.updateTitle = '编辑优惠券';
            this.isAddAction = false;
            let {coupon_type:name,kind,value,id} = row;
            vm.editInfo={name,kind,value,id};
        },
      //添加优惠券类型
        addSubmit:function(){
          var vm = this;
          let a = /[0-9.]$/;
          if(vm.editInfo.name==""){
            vm.$message({ message:"优惠券名称不能为空", type:'error' });
            return
          }
          if(vm.editInfo.kind==""){
            vm.$message({ message:"优惠券类型不能为空", type:'error' });
            return
          }
          if(vm.editInfo.value==""){
            vm.$message({ message:"优惠券方式不能为空", type:'error' });
            return
          }
          if (vm.editInfo.kind!='2'&&!(a.test(vm.editInfo.value))) {
                vm.$notify({ message: '金额格式不对', type: 'error' });
                return;
          }

          var data = {
              coupon_type:vm.editInfo.name,
              kind:vm.editInfo.kind,
              value:vm.editInfo.value,
          }
          if(vm.isAddAction){
            data.isAdd = 'add'
          }else{
            data.isAdd = 'update';
            data.id = vm.editInfo.id
          }
          utils.fetch("/coupon/couType_add",{method:'post',body:data}).then(function(res){
              if(typeof(res)!=undefined){
                  if(res.code==0){
                      vm.updateVisible=false;
                      vm.getData();
                  }else{
                       vm.$message({ showClose:true, message:res.message, type:'error' });
                  }
              }
          })
        },
        delClick:function(row){
                    var vm = this;
                    var str = '您确定要删除优惠券名称为:“'+row.coupon_type+'”的信息吗?';
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
                                vm.del_plate(row);
                                instance.confirmButtonLoading = false;
                                done();
                            } else {
                                done();
                            }
                        }
                    });
            },
            del_plate:function(row){
                var vm = this;
                var postData= {
                    id:row.id
                };
                utils.fetch('/coupon/couType_delete',{method:'post',body:postData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            setPageData(pageObj){
              this.pagination = pageObj;
              this.getData();
          },
            //搜索
            btnSearch(){
                var vm = this;
                this.pagination.page=1;
                vm.getData();
            },
            reset(){
                var vm = this;
                vm.type = '';
                vm.getData();
            }
        }
    }
</script>
<style>

</style>
