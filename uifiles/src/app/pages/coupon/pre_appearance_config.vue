<template>
    <div id='box' class="menu-hide">
        <div class="worker pre-appearance-config">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-select v-model="search.status" placeholder="预出场状态" size="small">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-select v-model="search.type" placeholder="优惠券类型" size="small">
                        <el-option v-for="item in kindOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-button @click="findMe" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="resetMe" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addMe" size="small"><i class="fa fa-plus"></i>添加</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="dataLoading" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column prop="id" label="ID" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="90"></el-table-column>
                    <el-table-column  label="类型" min-width="100">
                        <template slot-scope="scope">
                            <span>{{ scope.row.status === 1?transferData(kindOptions,scope.row.type):'-- --' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column  label="优惠券叠加" min-width="100">
                        <template slot-scope="scope">
                            <span>{{ transferData(superposeOptions,scope.row.superpose)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="预出场状态" min-width="160">
                        <template slot-scope="scope">
                            <span>{{ transferData(statusOptions,scope.row.status) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="editMe(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
            <el-dialog :title="rowInfo.title" :visible.sync="rowInfo.isShow" :close-on-click-modal="false" :close-on-press-escape="false">
                <el-form ref="editForm" :model="rowInfo.form" label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model="rowInfo.form.station_id" size="small" class="cell" placeholder="停车场"></my-select-station>
                    </el-form-item>
                    <el-form-item label="预出场状态:">
                        <el-radio-group v-model="rowInfo.form.status">
                            <el-radio :label='1'>开启</el-radio>
                            <el-radio :label='0'>禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="配置:" v-if="rowInfo.form.status === 1">
                        <el-checkbox-group v-model="rowInfo.form.type">
                            <el-checkbox true-label='fixed' label='仅定额券'></el-checkbox>
                            <el-checkbox true-label='unfixed' label='仅放行券'></el-checkbox>
                            <el-checkbox true-label='both' label='两者'></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="是否叠加用券:" v-if="rowInfo.form.status === 1 && (rowInfo.form.type === 'fixed' || rowInfo.form.type === 'both')">
                        <el-radio-group v-model="rowInfo.form.superpose">
                            <el-radio :label='1'>是</el-radio>
                            <el-radio :label='0'>否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item style="text-align:right;">
                        <el-button @click="submit" type="primary" size="small" :loading='rowInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    name:'pre-appearance-config',
    components:{},
    props:{},
    data(){
        let statusOptions = [{label:'启用',value:1},{label:'禁用',value:0}];
        let superposeOptions = [{label:'叠加',value:1},{label:'不叠加',value:0}];
        let kindOptions = [{label:'仅定额券',value:'fixed'},{label:'仅放行券',value:'unfixed'},{label:'所有',value:'both'}];
        return {
            search:{
                station_id:'',
                status:'',
                type:'',
                superpose:''
            },
            statusOptions:statusOptions,
            kindOptions:kindOptions,
            superposeOptions:superposeOptions,
            dataLoading:false,
            tableData:[],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            rowInfo:{title:'',isShow:false,saveloading:false,form:{station_id:'',status:1,type:'unfixed',superpose:0}},
            nowData:{}
        }
    },
    beforeCreate() {},
    created() {},
    beforeMount() {},
    mounted() {},
    beforeUpdate () {},
    updated() {},
    beforeDestroy () {},
    destroyed () {},
    watch:{},
    directives:{},
    methods: {
        findMe(){
            this.pagination.page = 1;
            this.getData();
        },
        resetMe(){
            this.search = {station_id:'',status:'',type:'',superpose:''};
            this.getData();
        },
        setPageData(obj){
            this.pagination = obj;
            this.getData();
        },
        addMe(){
            this.rowInfo.title = "增加预出场配置";
            this.rowInfo.form = {station_id:'',status:1,type:'unfixed',superpose:0};
            this.nowData = {};
            this.rowInfo.isShow = true;
        },
        editMe(rowData){
            if(!!rowData){
                this.rowInfo.title = "修改预出场配置";
                let {id,station_id,status,type,superpose} = rowData;
                this.nowData = {id,station_id,status,type,superpose};
                this.rowInfo.form = {id,station_id,status,type,superpose};
                this.rowInfo.isShow = true;
            }
        },
        submit(){
            if (!this.checkForm()) {
                return;
            } else {
                let url = "/couponpreout/";
                if (!!this.nowData.id) {
                    url += "update";
                } else {
                    url += "add";
                }
                this.rowInfo.saveloading = true;
                utils
                .fetch(url, {
                    method: "post",
                    body: this.rowInfo.form
                })
                .then(json => {
                    this.rowInfo.saveloading = false;
                    if(!!json && json.code === 0) {
                        this.getData();
                        this.rowInfo.saveloading = false;
                        this.rowInfo.isShow = false;    
                    }else {
                        this.$message({
                            showClose: true,
                            message: json.message,
                            type: "error"
                        });
                        this.rowInfo.saveloading = false;
                    }
                }).catch(err => {
                    this.$message({
                        showClose: true,
                        message: err,
                        type: "error"
                    });
                    this.rowInfo.saveloading = false;
                })
            }
        },
        getData() {
            let vm = this;
            let url = `/couponpreout/lists?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
            let {station_id, status, ...others } = vm.search;
            let searchmap = { station_id, status, ...others };
            let querystr = utils.setQueryString(searchmap);
            url += querystr ? "&" + querystr : "";
            vm.dataLoading = true;
            utils.fetch(url).then(json => {
                vm.tableData =
                typeof json != "undefined" && json.code == 0
                    ? json.content.lists
                    : [];
                vm.pagination.total =
                typeof json != "undefined" && json.code == 0 ? json.content.total : 0;
                utils.setCache(vm);
                vm.dataLoading = false;
            });
        },
        transferData(sourceData,columnData){
            let oArr = sourceData.filter(item => {
                return item.value === columnData
            });
            
            if(oArr.length > 0){
                return oArr[0].label;
            }else{
                return '';
            }    
        },
        checkForm() {
            if (!this.rowInfo.form.station_id) {
                this.$message({
                    showClose: true,
                    message: "请选择的停车场",
                    type: "error"
                });
                return false;
            }else {
                return true;
            }
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            utils.getTingYunScript();
            let data = utils.getCache();
            let obj = data == "" ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });    
    },
}
</script>
