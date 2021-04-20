
<template>
    <div id='box' class="menu-hide">
        <div class='worker log'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept type='2' v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-select v-model="search.step" size="small" class="cell widthX100"  placeholder="状态">
                        <el-option label="日报" value="day"></el-option>
                        <el-option label="财务月报" value="Fmonth"></el-option>
                        <el-option label="自然月报" value="Nmonth"></el-option>
                    </el-select>
                    <el-date-picker v-model="search.begintime" size="small" :type="search.step == 'Fmonth' || search.step == 'Nmonth' ? 'month' : 'date'" placeholder="报表开始时间"></el-date-picker>
                    <el-date-picker v-model="search.endtime" size="small" :type="search.step == 'Fmonth' || search.step == 'Nmonth' ? 'month' : 'date'" placeholder="报表结束时间"></el-date-picker>
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
                    <el-table-column label="时间类型" width="70">
                        <template slot-scope="scope">
                            <span v-if="scope.row.step == 'day'">日报</span>
                            <span v-else-if="scope.row.step == 'Fmonth'">财务月报</span>
                            <span v-else-if="scope.row.source == 'Nmonth'">自然月报</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="文件类型" width="90">
                        <template slot-scope="scope">
                            <span v-if="isAreaFile(scope.row.file)">大区文件</span>
                            <span v-if="isDeptFile(scope.row.file)">事业部文件</span>
                            <span v-if="isStationFile(scope.row.file)">停车场文件</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="order_time" label="报表时间" width="90"></el-table-column>
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
            }
        },
        created:function(){
            this.getData();
        },
        methods:{
            setPageData:function(pageObj){
                this.pagination = pageObj;
                this.getData();
            },
            getData:function(){
                var vm = this;
                if(typeof(vm.$route.params.search) != "undefined"){
                    vm.search.station = vm.$route.params.search.station;
                    vm.search.step = vm.$route.params.search.step;
                    if(vm.$route.params.search.begintime) vm.search.begintime = vm.$route.params.search.begintime;
                    if(vm.$route.params.search.endtime) vm.search.endtime = vm.$route.params.search.endtime;
                }
                var url = '/export/order?step='+vm.search.step+'&page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if( vm.search.station != '' ) url += "&station_id=" + vm.search.station;
                if( vm.search.dept != '' && typeof(vm.search.dept.company) == 'number' && vm.search.dept.area == '' ) url += "&company_id=" + vm.search.dept.company;
                if( vm.search.dept != '' && vm.search.dept.area != '' && vm.search.dept.department == '' ) url += "&area_id=" + vm.search.dept.area;
                if( vm.search.dept != '' && vm.search.dept.department != '' ) url += "&dept_id=" + vm.search.dept.department;
                if( vm.search.begintime) url += "&begin_time=" + vm.tabletimeParse(vm.search.begintime, vm.search.step == 'day' ? 'day' :'month');
                if( vm.search.endtime) url += "&end_time=" + vm.tabletimeParse(vm.search.endtime, vm.search.step == 'day' ? 'day' :'month');
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
                        step:'day',
                        begintime:'',
                        endtime:'',
                    };
                this.pagination.page=1;
                this.pagination.pagesize=20;
                this.getData();
            },
            isAreaFile:function(file){
                return /(.*\/)*(a_\d+).csv$/.test(file);
            },
            isDeptFile:function(file){
                return /(.*\/)*(d_\d+).csv$/.test(file);
            },
            isStationFile:function(file){
                return /(.*\/)*(s_\d+).csv$/.test(file);
            },
            download:function(row){
                var a = document.createElement('a');
                var reg = row.file.match(/^\/public(\/[^.]+.csv$)/);
                a.href = "http://core.business.aparcar.cn:8081" + reg[1];
                a.click();
                document.removeChild(a);
            },
            tabletimeParse:function(time,type){
                if( typeof(time) == 'string') time = new Date(time);
                var y = time.getFullYear();
                var m = time.getMonth() + 1;
                var d = time.getDate()
                m = m > 9 ? m : "0"+m;
                d = d > 9 ? d : "0"+d;

                var str = '';
                if(type == 'day'){
                    str = y.toString() +'-'+ m +'-'+ d;
                }else if(type == 'month'){
                    str = y.toString() +'-'+ m;
                }
                return str;
            },
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
