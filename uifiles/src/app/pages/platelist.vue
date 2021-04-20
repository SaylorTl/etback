
<template>

    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                    <my-select-plate v-model="search.newplate" size="small" class="cell widthX150"  placeholder="新车牌"></my-select-plate>
                    <my-select-plate v-model="search.oldplate" size="small" class="cell widthX150"  placeholder="旧车牌"></my-select-plate>
                    <el-date-picker v-model="search.begin_time" size="small" type="date" placeholder="开始时间"></el-date-picker>
                    <el-date-picker v-model="search.end_time" size="small" type="date" placeholder="结束时间"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column type='index' width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="140"></el-table-column>
                    <el-table-column label="大区/事业部" width="220">
                        <template slot-scope="scope">
                             {{scope.row.area_name}}/{{scope.row.dept_name}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="createtime" label="创建日期" min-width="130"></el-table-column>
                    <el-table-column prop="new_plate" label="新车牌" min-width="100"></el-table-column>
                    <el-table-column prop="old_plate" label="旧车牌" min-width="100"></el-table-column>
                    <el-table-column prop="rule_name" label="规则名称" min-width="100"></el-table-column>
                    <el-table-column prop="user_name" label="用户" min-width="130"></el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>

        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                search:{station:'',newplate:'',oldplate:'',end_time:'',begin_time:''},
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
                if(this.search.newplate) dat += "&new_car="+this.search.newplate;
                if(this.search.oldplate) dat += "&old_car="+this.search.oldplate;
                if(this.search.begin_time) dat += "&begin_time="+utils.timeParse(this.search.begin_time,'-',false);
                if(this.search.end_time) dat += "&end_time="+utils.timeParse(this.search.end_time,'-',false);
                var url = '/contract/changePlateLists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {station:'',newplate:'',oldplate:'',end_time:'',begin_time:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },

        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                vm.getData();
                utils.getTingYunScript();
            });
        },
    }

</script>
<style>
    .el-form-item{
        margin-bottom: 12px;
    }
</style>
