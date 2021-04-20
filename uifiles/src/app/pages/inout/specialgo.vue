<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <!-- <my-select-plate v-model="search.car" size="small" class="cell" width="120px" placeholder="车牌"></my-select-plate> -->
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="index" width="60" align="center"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" width="200"></el-table-column>
                    <el-table-column prop="vendor_name" label="厂商" width="130"></el-table-column>
                    <el-table-column prop="name" label="道闸" width="160"></el-table-column>
                    <el-table-column prop="plate" label="车牌号码" min-width="90"></el-table-column>
                    <el-table-column  label="状态" min-width="90">
                        <template slot-scope="scope">
                             <span>{{isoutmap[scope.row.pre_car.is_out]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="departure_time" label="出场时间"  min-width="120"></el-table-column>
                    <el-table-column label="操作"  min-width="120">
                        <template slot-scope="scope">
                            <el-button @click="showCode(scope.row)" size="small" :disabled=" scope.row.plate == '' || scope.row.plate == null ? true : false">查看二维码</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-dialog title="二维码信息"  :visible.sync="centerDialogVisible" width="30%">
                    <el-form :model="codeInfo" label-width="80px">
                        <el-form-item label="停车场:">
                            <el-input  v-model="codeInfo.station_name" size="small" class="cell widthP100" placeholder="选择时间范围" align="right"></el-input>
                        </el-form-item>
                        <el-form-item label="道闸:" >
                            <el-input v-model="codeInfo.exit" size="small" class="cell widthP100" placeholder="选择时间范围" ></el-input>
                        </el-form-item>
                        <el-form-item label="车牌:" >
                            <el-input v-model="codeInfo.plate" size="small" class="cell widthP100" placeholder="选择时间范围" align="right"></el-input>
                        </el-form-item>
                    </el-form>
                    <span class="widthP100 clearfix text-center">
                        <qrcode :value="'https://app.aparcar.cn/pay/temp?station='+codeInfo.stationId+'&plate=' + encodeURIComponent(codeInfo.plate)+'&qr=1'"></qrcode>
                    </span>
                    <span slot="footer" class="dialog-footer">
                    </span>
                </el-dialog>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data(){
        return{
            isoutmap:{1:'不在场内',0:'在场内'},
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            tableData:[],
            shade:false,
            centerDialogVisible:false,
            search:{station:'',car:""},
            codeInfo:{stationId:'',plate:'',station_name:'',exit:''}
        }
    },
    mounted:function(){
        this.getData();
    },
    methods: {
        getData:function(){
            var vm = this;
            var url = '/inout/appearanceList?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize;
            if(vm.search.station) url += "&station_id="+vm.search.station;
            if(vm.search.car) url += "&plate="+vm.search.car;
            vm.shade = true;
            utils.fetch(url).then(function(json){
                if(json.code==0 && typeof(json.content.list!='undefined')){
                    vm.tableData = json.content.lists;
                    vm.pagination.total= json.content.total;
                    utils.setCache(vm);
                    vm.shade = false;
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            });
        },
        showCode:function(row){
            var vm = this;
            vm.centerDialogVisible = true;
            vm.codeInfo={stationId:row.id,plate:row.plate,station_name:row.station_name,exit:row.name};
            console.log(vm.codeInfo)
        },
        btnSearch:function(){
            var vm = this;
            vm.pagination.page=1,
            vm.getData();
        },
        btnUndo:function(){
            var vm = this;
            vm.search={station:'',car:''};
            vm.getData();
        },
        setPageData:function(pageObj){
            this.pagination = pageObj;
            this.getData();
        },
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
<style>
</style>
