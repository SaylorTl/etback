<template>
    <div id='box' class="menu-hide balance stationrate">
        <div class='worker station'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-date-picker
                        v-model="time"
                        type="daterange"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        size="small" value-format="yyyy-MM-dd"
                        :picker-options="pickerOptions2">
                    </el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button size="small" @click="handleExport"><i class="fa fa-cloud-download"></i>导出</el-button>
                </div>
            </div>
            <div  class="table box-width">
                <template>
                    <el-table :data="dataList" stripe :border="true" style="width: 100%" v-loading="loading">
                        <el-table-column prop="company_name" label="公司" width="180"></el-table-column>
                        <el-table-column prop="area_name" label="大区" width="180"></el-table-column>
                        <el-table-column prop="dept_name" label="事业部"></el-table-column>
                        <el-table-column prop="station_name" label="停车场"></el-table-column>
                        <el-table-column prop="vendor_name" label="厂家"></el-table-column>
                        <el-table-column prop="begintime" label="掉线开始时间"></el-table-column>
                        <el-table-column prop="endtime" label="掉线结束时间"></el-table-column>
                    </el-table>
                </template>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from "../../../utils/utils.js";
import moment from "moment";
export default {
  data: function() {
    return {
         search:{dept:'',station_id:'',eas_name:'',s_status:'',region:''},
         pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
         time: [,],
         dataList: [],
         pagination:{page:1,pagesize:20,total:0,showTotal:true},
         loading: false
    };
  },
  methods: {
      getData: function(){
          var that = this;
          
          //测试反馈，用户没有选择日期，进入页面搜索不应该带上当前时间
          //   if(!this.time){
         //       this.time = [new Date(),new Date()];
         //   }
          var param = utils.setQueryString({
              page: this.pagination.page,
              pagesize: this.pagination.pagesize,
              dept: that.search.dept,
              station_id: that.search.station_id,
              begintime: moment(this.time[0]).format('YYYY-MM-DD'),
              endtime: moment(this.time[1]).format('YYYY-MM-DD')
          })
          that.loading = true;
          utils.fetch('/offlinereport/droplists?'+param).then(function(data){
              if(data.code == 0 && data.content.lists){
                  that.dataList = data.content.lists;
                  that.pagination.total = data.content.total;
              }else{
                  that.dataList = [];
                  that.pagination.total = 0;
              }
              that.loading = false;
          })
      },
      btnSearch: function(){
          this.getData();
      },
      btnUndo: function(){
          this.pagination.page = 1;
          this.search={dept:'',station_id:'',eas_name:'',s_status:'',region:''};
          this.time = [];
          this.getData();
      },
     setPageData:function(pageObj){
        this.pagination = pageObj;
        this.getData();
      },
      handleExport: function(){
        var that = this;
        if(!this.time){
            this.time = [new Date(),new Date()];
        }
        var obj ={
            page: 1,
            pagesize: 9999,
            dept: that.search.dept,
            station_id: that.search.station_id,
            begintime: moment(this.time[0]).format('YYYY-MM-DD'),
            endtime: moment(this.time[1]).format('YYYY-MM-DD')
        }
        var param = utils.setQueryString(obj)
        var filename = moment().format('YYYYMMDD') + '车场掉线导出.xls';
        utils.rpc.loadfile('/offlinereport/dropExport?'+ param, null, filename).then(function(data){
        //that.$message({  message: data.message });
        })
      }
  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
      vm.getData();
      utils.getTingYunScript();
    });
  }
};
</script>
<style>

</style>

