<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <my-select-plate v-model.trim="search.car" size="small" class="cell widthX120"  placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.total" size="small" class="cell widthX100"  clearable placeholder="统计总数">
                        <el-option  v-for="item in cfg.times" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="area_name" label="大区"  min-width="120"></el-table-column> 
                    <el-table-column label="事业部"  min-width="120">
                        <template slot-scope="scope">{{scope.row.dept_name+'事业部'}}</template>
                    </el-table-column> 
                    <el-table-column prop="station_name" label="停车场"  min-width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌"  min-width="120"></el-table-column>
                    <el-table-column prop="total" label="更改次数"  min-width="90"></el-table-column>
                    <el-table-column label="操作"  min-width="90">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('换车牌统计详情')" @click="showDetail(scope.row)"  plain size="mini"><i class="fa fa-credit-card"></i>详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
           <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :visible.sync="platedetail.show" :title='platedetail.title' width='50%'>
                 <el-table v-loading="platedetail.shade" element-loading-text="拼命加载中" :data="platedetail.detailData" border fit style="width:100%">
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="new_plate" label="新车牌"  min-width="100"></el-table-column> 
                    <el-table-column prop="old_plate" label="旧车牌"  min-width="100"></el-table-column> 
                    <el-table-column prop="user_name" label="操作人"  min-width="100"></el-table-column> 
                    <el-table-column prop="createtime" label="更改时间"  min-width="120"></el-table-column>
                </el-table> 
                <my-paginator @change='setPageData_detail($event)' :pagination='detailpagination'></my-paginator>
            </el-dialog>
           
        </div>
    </div>
</template>
<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            const config={
                times:[{value: '3',label: '>=3'}, {value: '5',label: '>=5'}, {value: '7',label: '>=7'}, {value: '10',label: '>=10'}, {value: '20',label: '>=20'}],
                url:{
                    detaillists:'/changeplate/lists', //换车牌列表
                    show:'/changeplate/show',
                    statisticsLists:'/changeplate/statisticsLists' //更换车牌统计
                }
            };  
            return {
                cfg:config,
                search:{dept:'',station:'',car:'',total:''},
                shade:false,
                updateVisible:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                detailpagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                platedetail:{show:false,title:'',shade:false,detailData:[],row:''}
             }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            setPageData_detail:function(pageObj){
              this.detailpagination = pageObj;
              this.getDetail(this.platedetail.row);
            },
            btnUndo:function(){
                this.search = {dept:'',station:'',car:'',total:''};
                this.pagination.page=1;
                this.pagination.pagesize=20;
                this.getData();
            },

            showDetail(row){
                var vm = this;
                vm.platedetail.show=true;
                vm.platedetail.title='换车牌统计详情';
                vm.getDetail(row);
            },
            getDetail(row){
                var vm = this;
                var url = vm.cfg.url.detaillists+"?page="+vm.detailpagination.page+"&pagesize="+vm.detailpagination.pagesize+"&car_id="+row.car+"&station_id="+row.station;
                vm.platedetail.row = row;
                vm.platedetail.shade = true;
                utils.fetch(url).then(function(res){
                    vm.platedetail.detailData = (typeof(res) != 'undefined'&&res.code == 0)?res.content.lists:[];
                    vm.detailpagination.total = (typeof(res) != 'undefined'&&res.code == 0)?res.content.total:0;
                    vm.platedetail.shade = false;
                })
            },
            getData(){
                var vm = this;
                var url = vm.cfg.url.statisticsLists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var vms=vm.search;
                var smap={"station_id":vms.station,
                        "car_id":vms.car,
                        "dept_ids":vms.dept,      
                        "total":vms.total,      
                       };
                var querystr = utils.setQueryString(smap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined'&&res.code == 0)?res.content.lists:[];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                })
            },
            authCheck:function(tag){
                return utils.authCheck(this,tag);
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

