<template>

    <div id='box' class="menu-hide">
        <div class="worker car">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell widthX120" placeholder="车牌"></my-select-plate>
                    <el-select v-model="search.type" size="small" class="cell widthX100"  placeholder="类型" clearable>
                        <el-option v-for="(v,k) in typeMap" :key="k" :label="v" :value="k"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" class="cell btn-cell" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" class="cell btn-cell" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" class="cell btn-cell" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index"  width="40"></el-table-column>
                    <el-table-column prop="name" label="停车场"  width="120"></el-table-column>
                    <el-table-column prop="vendor" label="设备商"  min-width="90"></el-table-column>
                    <el-table-column prop="plate" label="车牌"  min-width="90"></el-table-column>
                    <el-table-column prop="online" label="线上金额"  width="150"></el-table-column>
                    <el-table-column prop="local" label="本地金额"  width="150"></el-table-column>
                    <el-table-column prop="timein" label="进场时间"  width="150"></el-table-column>
                    <el-table-column prop="timeout" label="出场时间"  width="150"></el-table-column>
                    <el-table-column prop="staytime" label="停留时间"  width="150"></el-table-column>
                    <el-table-column  label="收费方式"  width="150">
                        <template slot-scope="scope">
                            <span>{{typeMap[scope.row.type ]}}</span>
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
                search:{station:'',type:'',car_id:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                typeMap:{'rate':'按时收费','duration':'按梯次收费','times':'按次收费','period':'按时段收费'},
            };
        },
        computed:{
            isShowTable:function(){
              return this.authData.length != 0; //有一个空白的数据
            }
        },
        methods:{
            getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.station) dat += "&station="+this.search.station;
                if(this.search.type) dat += "&type="+this.search.type;
                if(this.search.car_id) dat += "&car_id="+this.search.car_id;
                var url = '/times/contrast?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.pagination.total = json.content.total||[];
                            vm.tableData = json.content.lists||0;
                            utils.setCache(vm);
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                    vm.shade = false;
                });
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {station:'',type:'',car_id:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
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
