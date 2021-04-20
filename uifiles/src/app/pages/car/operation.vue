<template>

  <div id='box' class="menu-hide">

      <div class="worker car">
          <div class='condition box-width clearfix'>
              <div class="left">
                  <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                  <my-select-station v-model.trim="search.station" size="small" class="cell widthX150" width="155px" placeholder="停车场"></my-select-station>
                  <my-select-plate v-model.trim="search.car" size="small" class="cell widthX120" placeholder="车牌"></my-select-plate>
                  <el-input v-model.trim="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                  <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                  <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                  <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
              </div>
              <div class="right">
                  <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
              </div>
          </div>
          <div v-show="search_more" class='condition-more clearfix box-width'>
              <el-date-picker v-model="search.begintime" type="datetime" size="small" placeholder="开始时间"></el-date-picker>
              <el-date-picker v-model="search.endtime" type="datetime" size="small" placeholder="结束时间"></el-date-picker>
          </div>
          <div class='table box-width'>
              <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border style="width:100%">
                  <!-- <el-table-column type='index' width="80"></el-table-column> -->
                  <el-table-column prop="id" label="id" width="70"></el-table-column>
                  <el-table-column prop="station_name" label="停车场" width="140"></el-table-column>
                  <el-table-column label="大区/事业部" width="120">
                      <template slot-scope="scope">
                          <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                      </template>
                  </el-table-column>
                  <el-table-column prop="plate" label="车牌" width="95"></el-table-column>
                  <el-table-column prop="user_name" label="车主" width="100"></el-table-column>
                  <el-table-column prop="user_phone" label="手机号" width="110"></el-table-column>
                  <el-table-column prop="operation" label="操作" width="80">
                    <template slot-scope='scope'>{{scope.row.operation == 'unlock'?'解锁':'锁车'}}</template>
                  </el-table-column>
                  <el-table-column label="操作结果" width="100">
                    <template slot-scope="scope">{{scope.row.response=='Y'?'成功':'失败'}}</template>
                  </el-table-column>
                  <el-table-column prop="code" label="下发结果" width="100"></el-table-column>
                  <el-table-column prop="creationtime" label="操作时间" ></el-table-column>
                  <el-table-column prop="modifytime" label="修改时间"  ></el-table-column>
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
          search_more:false,
          search:{station:'',car:'',phone:'',date:'',dept:''},
          pagination:{page:1,pagesize:20,total:0,showTotal:true},
          tableData:[],
        }
      },
      methods:{
        setPageData:function(pageObj){
          this.pagination = pageObj;
          this.getData();
        },
        btnMore:function(){
          this.search_more = this.search_more ? false : true;
        },
        getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.station) dat += "&station_id="+this.search.station;
                if(this.search.car) dat += "&car_id="+this.search.car;
                if(this.search.phone) dat += "&phone="+this.search.phone;
                if(this.search.dept ) dat += "&dept_ids="+this.search.dept;
                if(this.search.begintime && this.search.begintime != null){
                    var begin = utils.timeParse(this.search.begintime);
                    dat += "&begintime="+begin;
                }
                if(this.search.endtime && this.search.endtime != null) {
                    var end = utils.timeParse(this.search.endtime);
                    dat += "&endtime=" + end;
                }
                var url = '/car/operation?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false
                });
            },

        btnSearch:function(){
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo:function(){
            this.search = {name:'',phone:'',dept:'',date:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
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
