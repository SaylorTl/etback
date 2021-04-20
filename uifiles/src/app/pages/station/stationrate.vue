<template id="">
    <div id='box' class="menu-hide balance stationrate">
        <div class='worker station'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <el-input v-model="search.eas_name" size="small" class="cell widthX120"  placeholder="eas名称"></el-input>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"  placeholder="项目OA名称"></my-select-station>
                    <el-input v-model="search.region" size="small" class="cell widthX120"  placeholder="所属区域"></el-input>
                    <el-select size="small" clearable v-model="search.status" placeholder="状态" class="widthX100">
                        <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button size="small" @click="handleExport"><i class="fa fa-cloud-download"></i>导出</el-button>
                    <el-button size="small" @click="handleAdd"><i class="fa fa-plus"></i>添加</el-button>
                </div>
            </div>
            <div class="table box-width">
                <el-table :summary-method="getSummaries" show-summary  :data="tableData" :border="true" v-loading="loading">
                    <el-table-column fixed type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="项目联系人:">{{ props.row.contacts }}</el-form-item>
                                <el-form-item label="电话:">{{ props.row.phone }}</el-form-item>
                                <el-form-item label="车场明细(进):">{{ props.row.enter_detail }}</el-form-item>
                                <el-form-item label="车场明细(出):">{{ props.row.out_detail }}</el-form-item>
                                <el-form-item label="通知勘察时间:">{{ props.row.survey_time }}</el-form-item>
                                <el-form-item label="发货时间:">{{ props.row.send_time }}</el-form-item>
                                <el-form-item label="项目备注:">{{ props.row.remark }}</el-form-item>
                                <el-form-item label="厂家:">{{ props.row.vendor_name }}</el-form-item>
                                <el-form-item label="上线时间:">{{ props.row.online_time }}</el-form-item>
                                <el-form-item label="撤场时间:">{{ props.row.withdraw_time }}</el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="大区事业部" width="120" prop="area_name">
                    </el-table-column>
                    <el-table-column label="事业部" width="100" prop="dept_name"></el-table-column>
                    <el-table-column label="新eas名称" width="118" prop="eas_name"></el-table-column>
                    <el-table-column label="项目OA名称" width="118" prop="station_name"></el-table-column>
                    <el-table-column label="状态" width="115" prop="status_name"></el-table-column>
                    <el-table-column label="所属区域" width="80" prop="region"></el-table-column>
                    <el-table-column label="套数" width="60" prop="suit"></el-table-column>
                    <el-table-column label="规定完工时间" width="103" prop="plan_finish_time"></el-table-column>
                    <el-table-column label="实际完工时间" width="103" prop="actual_finish_time"></el-table-column>
                    <el-table-column label="权限是否回收" width="103" prop="is_recycle"></el-table-column>
                    <el-table-column label="成本" width="100" prop="stationcost_sum"></el-table-column>
                    <el-table-column label="操作" width="130">
                        <template slot-scope="scope">
                            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"><i class="fa fa-credit-card"></i>编辑</el-button>
                            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)"><i class="el-icon-delete"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="编辑车场进度" :visible.sync="editDialog" @close="dialogClose">
                <el-form ref="editStationRate" :rules="formRules" :model="form" label-width="120px">
                    <el-form-item label="公司" prop="company">
                        <el-select v-model="form.company" placeholder="请选择公司" @change="changeCompany" class="widthP100" >
                            <el-option v-for="item in companyObj" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="大区事业部" prop="area">
                        <el-select v-model="form.area" placeholder="请选择大区" @change="changeArea" class="widthP100" >
                            <el-option v-for="item in deptObj" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="事业部" prop="dept">
                        <el-select v-model="form.dept" placeholder="请选择大区" @change="changeDept" class="widthP100" >
                            <el-option v-for="item in sdeptObj" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="项目OA名称" prop="station">
                        <!-- <el-input v-model="form.station" auto-complete="off"></el-input> -->
                        <!-- <el-input style="display:none" v-model="form.station" auto-complete="off"></el-input> -->
                        <my-select-station v-model="form.station"   class="cell widthP100"></my-select-station>
                    </el-form-item>
                    <el-form-item label="新eas名称" prop="eas_name">
                        <el-input v-model="form.eas_name" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="项目联系人">
                        <el-input v-model="form.contacts" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="电话">
                        <el-input v-model="form.phone" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                        <el-select v-model="form.status" placeholder="请选择" class="widthP100" >
                            <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="车场明细(进)">
                        <el-input v-model="form.enter_detail"  auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="车场明细(出)">
                        <el-input v-model="form.out_detail"  auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="套数">
                        <el-input v-model="form.suit"  auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="所属区域">
                        <el-input v-model="form.region" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="通知勘察时间">
                        <el-date-picker v-model="form.survey_time" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="发货时间">
                        <el-date-picker v-model="form.send_time" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="规定完工时间">
                        <el-date-picker v-model="form.plan_finish_time" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="实际完工时间">
                        <el-date-picker v-model="form.actual_finish_time" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="上线时间">
                        <el-date-picker v-model="form.online_time" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="撤场时间">
                        <el-date-picker v-model="form.withdraw_time" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="厂家">
                        <el-select v-model="form.vendor" placeholder="请选择" class="widthP100" >
                            <el-option v-for="item in vendorList" :key="item.value" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="项目备注">
                        <el-input v-model="form.remark" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="权限是否回收">
                        <el-input v-model="form.is_recycle"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script type="text/javascript">
  import utils from '../../../utils/utils.js';
  import moment from 'moment';
  let config = window.etback.config;
  export default {
    data: function(){
      return {
        search:{dept:'',station_id:'',eas_name:'',status:'',region:''},
        pagination:{page:1,pagesize:20,total:0,showTotal:true},
        editDialog: false,
        form: {},
        currentPage: 1,
        tableData: [],
        tableDataTal:{},
        loading: false,
        subType: '',//配置按钮
        companyObj: [],
        deptObj: [],
        sdeptObj: [],
        vendorList: [],
        formRules: {
          area: [{ required: true, message: '请输入大区', trigger: 'blur'}],
          dept: [{ required: true, message: '请输入事业部', trigger: 'blur'}],
          station: [{ required: false,message: '请输入项目OA名称'}],
          eas_name: [{required: true, message: '请输入新eas名称', trigger: 'blur'}],
          status: [{required: true, message: '请输入状态', trigger: 'blur'}],
        },
        status: [
                  // {value: 'testRun',label: '已完工-试运行'},
                  {value: 'retreat',label: '已撤场'},
                  {value: 'construction',label: '已发货-施工中'},
                  {value: 'project',label: '已立项-方案确认中'},
                  {value: 'cassidy',label: '已立项-勘察中'},
                  {value: 'debugging',label: '已完工-调试中'},
                  {value: 'online',label: '已完工-已上线'},
                  {value: 'delay',label: '暂缓'},
                  // {value: 'waitline',label: '已完工-待上线'},
                  // {value: 'offline',label: '已完工-未上线'},
                  // {value: 'into',label: '施工中-已进场'}
                ]
      }
    },
    mounted: function(){
      var vm = this;
      this.getDept();
      this.getVendor();
      this.getCompany();
    },
    methods: {
      //合计列
      getSummaries(param) {
            const { columns } = param;
            let sums = [];
            columns.forEach((column, index) => {
                if (index === 0) { sums[index] = '总计'; return; }
                if (this.tableDataTal && this.tableDataTal[column.property]) {
                    sums[index] = this.tableDataTal[column.property];
                } else {
                    sums[index] = '';
                }
            });
            return sums;
      },
      getData: function(){
        var that = this;
        var url = "/schedule/lists?page="+that.pagination.page+"&pagesize="+that.pagination.pagesize;
        that.loading = true;
        let {...others} = that.search;
        var querystr = utils.setQueryString(others);
        url+=querystr?'&'+querystr:'';
        utils.fetch(url).then(function(data){
          if(data.code == 0){
            if(data.content){
              that.tableDataTal=data.content.sum;
              that.tableData = data.content.lists||[];
              that.pagination.total = data.content.total;
              utils.setCache(that);
            }else {
              that.tableData = [];
              that.pagination.total = 0;
            }
          }
          that.loading = false;
        })
      },

      // 添加数据
      handleAdd: function(){
        this.subType = 'add';
        this.form = {};
        if(this.$refs.editStationRate){
          this.$refs.editStationRate.resetFields();
        }
        this.editDialog = true;
      },
      // 编辑窗
      handleEdit: function(index, row){
        let timeFormat = function(time){return time.replace(/\//g,'-')}
        this.subType = 'update';
        if(this.$refs.editStationRate){
          this.$refs.editStationRate.resetFields();
        }
        let {company,id,area,dept,station,eas_name,contacts,phone,status,suit,enter_detail
          ,out_detail,region,remark,is_recycle,vendor} = row;
        this.form = {
          company,id,area,dept,station,eas_name,contacts,phone,status,suit,enter_detail
          ,out_detail,region,remark,is_recycle,vendor,
          actual_finish_time: timeFormat(row.actual_finish_time),
          plan_finish_time: timeFormat(row.plan_finish_time),
          send_time: timeFormat(row.send_time),
          survey_time: timeFormat(row.survey_time),
          online_time: timeFormat(row.online_time),
          withdraw_time :timeFormat(row.withdraw_time),
        }
        this.editDialog = true;
        this.getDept();
        this.getArea();
      },
      // 删除数据
      handleDelete: function(index, row){
        var that = this;
        utils.fetch('/schedule/delete',{method: 'POST',body:{id: row.id}}).then(function(data){
          if(data.code == 0){
            that.getData();
          }
        })
      },
      // 提交编辑修改
      editSubmit: function(){
        var that = this;
        var param = Object.assign({},this.form);
        for(var key in this.formRules){
          if(!param[key]){
            this.$message.error(this.formRules[key][0].message);
            return false;
          }
        }
        utils.fetch('/schedule/'+this.subType, {method: 'POST',body: param }).then(function(data){
          if(data.code == 0){
            that.editDialog = false;
            that.getData();
          }else {
            that.$message.error(data.message);
          }
        })
      },
      // 查找按钮
      btnSearch:function(){
          this.pagination.page = 1;
          this.getData();
      },
      // 重置按钮
      btnUndo: function(){
        this.pagination.page = 1;
        this.search={dept:'',station_id:'',eas_name:'',status:'',region:''};
        this.getData();
      },
      setPageData:function(pageObj){
        this.pagination = pageObj;
        this.getData();
      },
      getCompany: function(){
        var that = this;
        utils.fetch('/department/lists?level=0').then(function(data){
          if(data.code == 0){
            that.companyObj = data.content;
          }
        })
      },
      getDept: function(){
        var that = this;
        utils.fetch('/department/lists?level=1&pid='+that.form.company).then(function(data){
          if(data.code == 0){
            that.deptObj = data.content;
          }
        })
      },
      getArea: function(){
        var that = this;
        var pid = this.form.area || '';
        if(pid){
          utils.fetch('/department/lists?level=2&pid=' + pid ).then(function(data){
              if(data.code == 0){
                that.sdeptObj = data.content;
              }
          })
        }
      },
      getVendor: function(){
        var that = this;
        utils.fetch('/vendor/getDatas').then(function(data) {
          if(data.code == 0){
            that.vendorList = data.content;
          }
        })
      },
      changeCompany: function(){
        this.form.area = '';
        this.form.dept = '';
        this.deptObj = [];
        this.sdeptObj = [];
        this.getDept();
      },
      changeDept: function(){
        this.form = JSON.parse( JSON.stringify(this.form) );
      },
      // 获取事业部下拉列表数据
      changeArea: function(){
        this.form.dept = '';
        this.sdeptObj = [];
        this.getArea();
      },
      dialogClose: function(){
        this.form = {};
      },
      // 停车场进度导出
      handleExport: function(){
        var that = this;
        var obj ={
          page: 1,
          pagesize: 9999,
          dept: that.search.dept,
          station_id: that.search.station_id
        }
        var param = utils.setQueryString(obj)
        var filename = moment().format('YYYYMMDD') + '停车场改造进度表.xls';
        utils.rpc.loadfile('/schedule/export?'+ param, null, filename).then(function(data){
          //that.$message({  message: data.message });
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
<style media="screen">
.stationrate .el-dialog .select-staion .val-input{
  width: 100%;
  height: 36px;
  line-height: 36px;
}
.stationrate .el-date-editor.el-input{
  width: 100%;
}
.stationrate .el-form-item{
  margin-bottom: 22px;
}
.stationrate .el-table .cell{
  padding-left: 15px;
  padding-right: 10px;
}
</style>
