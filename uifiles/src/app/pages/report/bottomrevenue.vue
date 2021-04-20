<template>
    <div id="box" class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept" type='2'></my-linkage-dept>
                    <my-select-station v-model.trim="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.year" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    <el-input v-model="search.main" placeholder="主体" size="small" class="cell widthX150"></el-input>
                    <el-select v-model="search.match" size="small" class="cell widthX120"  placeholder="筛选未匹配数据" clearable>
                         <el-option label="未匹配" value="mismatch"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-upload 
                        class="upload-demo"
                        :action="upload_url"
                        :headers="header"
                        :on-success="uploadSuccess"
                        :on-error="uploadErr"
                        multiple
                        >
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data='tableData'  border fit max-height='550' style="width:100%;" :row-class-name="toggleColor" >
                    <el-table-column label="大区/事业部" fixed width="280">
                         <template slot-scope="scope">
                             {{scope.row.area_name+'/'+scope.row.dept_name}}
                         </template>
                    </el-table-column>
                    <el-table-column prop="station_name" fixed label="停车场" width="140"></el-table-column>
                    <el-table-column prop="main" label="主体" width="140"></el-table-column>
                    <el-table-column prop="EAS" label="EAS编码" width="120"></el-table-column>
                    <el-table-column prop="start_pay_time" label="起付款日期" width="120"></el-table-column>
                    <el-table-column prop="last_year_income" label="上年年度总收入" width="120"></el-table-column>
                    <el-table-column prop="increase_income" label="累计增收" width="120"></el-table-column>
                    <el-table-column prop="80_increase_settl" label="兜底增收合计" width="150"></el-table-column>   
                    <el-table-column prop="20_increase_settl" label="项目增收合计" width="150" v-if="authCheck('项目增收')"></el-table-column>                                     
                    <el-table-column prop="month_base" label="年度月度基数" width="140"></el-table-column>
                    <el-table-column prop="divide_remark" label="分成备注" width="140"></el-table-column>
                    <el-table-column prop="propert_ratios" label="物业分成比例" width="90"></el-table-column>
                    <el-table-column prop="reformnum" label="改造套数" width="90"></el-table-column>
                    <el-table-column prop="month_num" label="核算月份数" width="90"></el-table-column>
                    <el-table-column prop="income_total" label="1-12月收入合计" width="120"></el-table-column>                    
                    <el-table-column prop="M1" label="1月" width="70"></el-table-column>
                    <el-table-column prop="M2" label="2月" width="70"></el-table-column>
                    <el-table-column prop="M3" label="3月" width="70"></el-table-column>
                    <el-table-column prop="M4" label="4月" width="70"></el-table-column>
                    <el-table-column prop="M5" label="5月" width="70"></el-table-column>
                    <el-table-column prop="M6" label="6月" width="70"></el-table-column>
                    <el-table-column prop="M7" label="7月" width="70"></el-table-column>
                    <el-table-column prop="M8" label="8月" width="70"></el-table-column>
                    <el-table-column prop="M9" label="9月" width="70"></el-table-column>
                    <el-table-column prop="M10" label="10月" width="70"></el-table-column>
                    <el-table-column prop="M11" label="11月" width="70"></el-table-column>
                    <el-table-column prop="M12" label="12月" width="70"></el-table-column>
                    <el-table-column prop="operation" label="运维费" width="90"></el-table-column>
                    <el-table-column prop="platform" label="平台费" width="90"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" @click="btnEdit(scope.index,scope.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-table border fit style="width:100%;" :data="lastData" v-show="tableData.length>1">
                    <el-table-column label="总数" width="90"></el-table-column>
                    <el-table-column prop="80_increase_settl_sum" label="兜底增收合计" width="180" ></el-table-column>  
                    <el-table-column prop="20_increase_settl" label="项目增收合计" v-if="authCheck('项目增收')" width="180"></el-table-column>                    
                    <el-table-column prop="increase_income_sum" label="增收合计" width="100"></el-table-column>                                      
                    <el-table-column prop="M1_sum" label="1月" width="100"></el-table-column>
                    <el-table-column prop="M2_sum" label="2月" width="100"></el-table-column>
                    <el-table-column prop="M3_sum" label="3月" width="100"></el-table-column>
                    <el-table-column prop="M4_sum" label="4月" width="100"></el-table-column>
                    <el-table-column prop="M5_sum" label="5月" width="100"></el-table-column>
                    <el-table-column prop="M6_sum" label="6月" width="100"></el-table-column>
                    <el-table-column prop="M7_sum" label="7月" width="100"></el-table-column>
                    <el-table-column prop="M8_sum" label="8月" width="100"></el-table-column>
                    <el-table-column prop="M9_sum" label="9月" width="100"></el-table-column>
                    <el-table-column prop="M10_sum" label="10月" width="100"></el-table-column>
                    <el-table-column prop="M11_sum" label="11月" width="100"></el-table-column>
                    <el-table-column prop="M12_sum" label="12月" width="100"></el-table-column>
                    <el-table-column prop="operation_sum" label="运营费" width="100"></el-table-column>
                    <el-table-column prop="platform_sum" label="平台费" width="100"></el-table-column>
                </el-table>
            </div>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item label="大区/事业部:">
                        <my-linkage-dept v-model="editInfo.dept"></my-linkage-dept>
                    </el-form-item>
                    <el-form-item  label="停车场:">
                        <my-select-station v-model.trim="editInfo.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    </el-form-item>
                    <el-form-item  label="年份:">
                       <el-input v-model.trim="editInfo.year" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item  label="上年年度总收入:"> 
                        <el-input v-model.trim="editInfo.last_year_income" size="small" class="cell widthX120"  placeholder="上年年度总收入"></el-input>
                    </el-form-item>
                    <el-form-item  label="年度月度基数:">
                        <el-input v-model.trim="editInfo.month_base" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item  label="1-12月收入统计:"> 
                        <el-input v-model.trim="editInfo.income_total" size="small" class="cell widthX120"  placeholder="上年年度总收入"></el-input>
                    </el-form-item>
                    <el-form-item  label="1-12月增收合计:">
                        <el-input v-model.trim="editInfo.increase_income" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="物业分成比例:">
                        <el-input v-model.trim="editInfo.propert_ratios" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="改造套数:">
                        <el-input v-model.trim="editInfo.reformnum" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="核算月份数:">
                        <el-input v-model.trim="editInfo.month_num" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="1月:">
                        <el-input v-model.trim="editInfo.M1" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="2月:">
                        <el-input v-model.trim="editInfo.M2" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="3月:">
                        <el-input v-model.trim="editInfo.M3" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="4月:">
                        <el-input v-model.trim="editInfo.M4" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="5月:">
                        <el-input v-model.trim="editInfo.M5" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item  label="6月:">
                        <el-input v-model.trim="editInfo.M6" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="7月:">
                        <el-input v-model.trim="editInfo.M7" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="8月:">
                        <el-input v-model.trim="editInfo.M8" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="9月:">
                        <el-input v-model.trim="editInfo.M9" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="10月:">
                        <el-input v-model.trim="editInfo.M10" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="11月:">
                        <el-input v-model.trim="editInfo.M11" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="12月:">
                        <el-input v-model.trim="editInfo.M12" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="运维费:">
                        <el-input v-model.trim="editInfo.operation" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item label="平台费:">
                        <el-input v-model.trim="editInfo.platform" size="small" class="cell widthX120"  placeholder="年份"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" @click="btnSubmit">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
let config = window.etback.config;
import utils from '../../../utils/utils.js';
export default {
    data() {
        var header = {};
        header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        header['Access-Token'] = window.localStorage.getItem('access_token');
        return {
            header,
            search:{dept:'',station:'',year:2017,main:'',match:''},
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            upload_url:config.host+'/finance/settlement',
            shade:false,
            btnshade:false,
            tableData:[],
            lastData:[],
            color:false,
            updateTitle:'修改数据',
            updateVisible:false,
            id:'',//点击时获取的ID
            editInfo:{}
        };
    },
    methods: {
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData:function(){
            var vm = this;
            vm.shade = true;
            let url = `/finance/settlementlists?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
            let {year,station:station_id,main,match:filter} = vm.search;
            var data = utils.setQueryString({year,station_id,main,filter});
            if(data){url+=`&${data}`};
            if (vm.search.dept && JSON.stringify(vm.search.dept) !='{}'){
                let deptStr = utils.setDeptQuery(vm.search.dept);
                    url += deptStr ? `&${deptStr}`: '';
            }
            utils.fetch(url).then(function(res){
                if(res.code == 0 && typeof(res.content.lists)!='undefined'){
                    vm.shade = false;
                    vm.tableData = res.content.lists
                    vm.pagination.total = res.content.total;
                }else{
                    vm.shade = false;
                    vm.tableData = [];
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        getLastData:function(){
            var vm = this;
            vm.lastData = [];
            let url = `/finance/settlementsum?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
            let {year,station:station_id,main,match:filter} = vm.search;
            var data = utils.setQueryString({year,station_id,main,filter});
            if(data){url+=`&${data}`};
            if (vm.search.dept && JSON.stringify(vm.search.dept) !='{}'){
                let deptStr = utils.setDeptQuery(vm.search.dept);
                    url += deptStr ? `&${deptStr}`: '';
            }
            utils.fetch(url).then(function(res){
                if(res.code == 0 && res.content.lists.length!=0){
                    vm.lastData.push(res.content.lists) 
                }else{
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        btnEdit:function(index,row){
            var vm= this;
            vm.updateVisible=true;
            vm.editInfo = row;
            vm.id = row.id;
        },   
        btnSubmit:function(){
            var vm = this;
            vm.editInfo['id'] =vm.id;
            var data = vm.editInfo;
            utils.fetch('/finance/settlementupdate',{method:'post',body:data}).then(function(res){
                if(res.code==0){
                    vm.updateVisible = false;
                    vm.getData();
                }else{
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        toggleColor:function({row, rowIndex}){
            if(rowIndex%2==0){
                return 'green'
            }else{
                return 'blue'
            }
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
            this.getLastData();
        },
        btnUndo: function() {
            this.search = {dept:'',station:'',year:'',main:'',match:''};
            this.getLastData();
            this.getData();
        },
        checkfile:function(response, file, fileList){
            var vm = this;
            vm.getData();
        },
        authCheck: function(tag){
            return utils.authCheck(this,tag);
        },
        uploadSuccess:function(res, file, fileList){
            console.log(res,file,fileList)
            this.$message({ message:res.message, type:'success' }); 
        },
        uploadErr:function(res, file, fileList){
            console.log(res,file,fileList)
            this.$message({ message:res, type:'error' }); 
        }
    },
    mounted:function(){
        var vm = this;
        vm.getData();
        vm.getLastData();
    }
}
</script>
<style scoped>
    .green{
        color:green;
    }
    .blue{
        color:#E6A23C;
    }
</style>

