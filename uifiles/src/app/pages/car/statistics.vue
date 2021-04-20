<template>

  <div id='box' class="menu-hide">

      <div class="worker car">
          <div class='condition box-width clearfix'>
              <div class="left">
                  <my-linkage-dept v-model="search.dept" :hideDefault='true'></my-linkage-dept>
                  <my-select-station v-model.trim="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                  <el-date-picker v-model="search.date" value-format="yyyy-MM-dd" size='small' type="daterange" placeholder="选择日期范围"></el-date-picker>
                  <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                  <el-button @click="btnUndo"  size="small"><i class="fa fa-undo"></i>重置</el-button>
              </div>
              <div class="right">
                  <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
              </div>
          </div>
          <div class='table box-width'>
              <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border style="width:100%">
                  <el-table-column type='index' width="80"></el-table-column>
                  <!-- <el-table-column prop="id" label="id" width="80"></el-table-column> -->
                  <el-table-column prop="station_name" label="停车场" width="140"></el-table-column>
                  <el-table-column label="大区/事业部"  min-width="150">
                      <template slot-scope="scope">
                          <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                      </template>
                  </el-table-column>
                  <el-table-column prop="lock_count" label="有效锁车次数" width="120"></el-table-column>
                  <el-table-column prop="out_count" label="出场总数" width="130"></el-table-column>
                  <el-table-column label="比例" width="100">
                    <template slot-scope="scope">
                          <span>{{scope.row.lock_count}}/{{scope.row.out_count}}</span>
                      </template>
                  </el-table-column>
                  <el-table-column prop="lock_rate" label="锁车率" width="100"></el-table-column>
                   <el-table-column prop="begin_time" label="开始时间" min-width="120"></el-table-column>
                  <el-table-column prop="end_time" label="结束时间" min-width="120"></el-table-column>
              </el-table>
          </div>
          <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
      </div>
  </div>

</template>

<script>
    import store from '../../store/store.js';
    import utils from '../../../utils/utils.js';
    export default {
      data:function(){
        return {
          shade:false,
          search:{station:'',date:'',dept:''},
          pagination:{page:1,pagesize:20,total:0,showTotal:true},
          tableData:[],
        }
      },
      methods:{
        setPageData:function(pageObj){
          this.pagination = pageObj;
          this.getData();
        },
        getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.station) dat += "&station_id="+this.search.station;
                if(this.search.dept ) dat += "&dept_ids="+this.search.dept;
                if(this.search.date && this.search.date[0] != null && this.search.date[1] != null){
                    var begin = this.search.date[0];
                    var end = this.search.date[1];
                    dat += "&begintime="+begin+"&endtime="+end;
                }
                var url = '/car/statistics?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    vm.shade = false
                });
            },

        btnSearch:function(){
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo:function(){
            this.search = {station:'',date:'',dept:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
    },
      beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                    vm.getData();
            });
        },
    }



</script>
