
<template>
    <div id='box' class="menu-hide">
        <div class='worker log'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept type='2' v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-date-picker v-model="search.begintime" size="small" type="date" placeholder="报表开始时间"></el-date-picker>
                    <el-date-picker v-model="search.endtime" size="small" type="date" placeholder="报表结束时间"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column label="大区/事业部/停车场" min-width="350">
                        <template slot-scope="scope">
                            <span v-if="scope.row.dept_name != ''  && scope.row.station_name == ''"> {{ scope.row.area_name + '/' +  scope.row.dept_name}} </span>
                            <span v-else-if="scope.row.station_name != ''">{{ scope.row.area_name + '/' +  scope.row.dept_name + '/' + scope.row.station_name}}</span>
                            <span v-else-if="scope.row.dept_name == ''">{{ scope.row.area_name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="user_name" label="导出用户" width="90"></el-table-column>
                    <el-table-column prop="creationtime" label="报表创建时间" width="130"></el-table-column>
                    <el-table-column prop="download" label="下载次数" width="70"></el-table-column>
                    <el-table-column prop="status" label="状态" width="90">
                        <template slot-scope="scope">
                            <span v-if="scope.row.status == 'FINISHED'">成功</span>
                            <span v-if="scope.row.status == 'ERROR'" class="blue">失败</span>
                            <span v-if="scope.row.status == 'RUNING'" class="green" >运行中...</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="begin_exc" label="执行时间" width="140"></el-table-column>
                    <el-table-column prop="end_exc" label="结束时间" width="140"></el-table-column>
                    <el-table-column label="操作" width="70">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.status != 'RUNING'" @click="download(scope.row)" plain size="mini">下载</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>

</template>

<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                search:{dept:'',station:'',step:'day',begintime:'',endtime:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                deptObj:{},

            }
        },
        created:function(){
            var vm = this
            vm.getData();
        },
        methods:{
            setPageData:function(pageObj){
                this.pagination = pageObj;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var routeSearch = vm.$route.params.search;
                if(typeof(routeSearch) != "undefined"){
                    vm.search.station = routeSearch.station;
                    vm.search.step = routeSearch.step;
                    if(routeSearch.begintime) vm.search.begintime = utils.timeParse(routeSearch.begintime,'-',false);
                    if(routeSearch.endtime) vm.search.endtime = 
                        utils.timeParse(routeSearch.endtime,'-',false);
                }
                if(typeof(vm.$route.params.station_id) != "undefined"){
                    vm.search.station = vm.$route.params.station_id
                }
                var url = '/export/constract?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if( vm.search.station != '' ) url += "&station_id=" + vm.search.station;
                if( vm.search.dept != '' && vm.search.dept.area == '' && vm.search.dept.department == '' ) url += "&company_id=" + vm.search.dept;
                if( vm.search.dept != '' && vm.search.dept.area != '' && vm.search.dept.department == '' ) url += "&area_id=" + vm.search.dept.area;
                if( vm.search.dept != '' && vm.search.dept.area != '' && vm.search.dept.department != '' ) url += "&dept_id=" + vm.search.dept.department;
                if( vm.search.begintime) url += "&begin_time=" + utils.timeParse(vm.search.begintime,'-',false);
                if( vm.search.endtime) url += "&end_time=" + utils.timeParse(vm.search.endtime,'-',false);
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        vm.pagination.total = json.content.total;
                        vm.tableData = json.content.lists;
                        utils.setCache(vm);
                    }
                    vm.shade = false;
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {dept:'',station:'',step:'day',begintime:'',endtime:''};
                this.$route.params.search = {
                        area:'',
                        company:'',
                        department:'',
                        station:'',
                        step:'',
                        begintime:'',
                        endtime:'',
                    };
                this.pagination.page=1;
                this.pagination.pagesize=20;
                this.getData();
            },
            download:function(row){
                var reg = row.file.match(/^\/public(\/[^.]+.csv$)/);
                window.location.href = "http://core.business.aparcar.cn:8081" + reg[1];
                utils.fetch('/export/updateDownload?id='+row.id+'&func=constract').then(function(json){
                }).then(function(json){

                })
            }
        },
        beforeRouteEnter:function(to, from, next){
               next(function(vm){
                utils.getTingYunScript();
                    if(typeof(vm.$route.params.search) != "undefined"){
                    var deptObj = {company:vm.$route.params.search.company,area:vm.$route.params.search.area,department:vm.$route.params.search.department}
                    vm.search.dept = '--'+ JSON.stringify(deptObj);
                    }
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
