<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.colourlife_mobile" size="small" class="cell widthX150"  placeholder="彩之云手机号"></el-input>
                    <el-date-picker v-model="search.datetimerange" size="small" type="datetimerange" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="widthX300" value-format="yyyy-MM-dd"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   border fit style="width:100%">
                    <el-table-column prop="id" label="id" width="70"></el-table-column>
                    <el-table-column  label="保单后六位" min-width="200" prop="insure_lasst_sex">
                    </el-table-column>
                    <el-table-column prop="insure_mobile" label="投保手机号" min-width="100"></el-table-column>
                    <el-table-column prop='oa_number' label="oa账号" min-width="160">
                    </el-table-column>
                    <el-table-column prop='name' label="姓名" min-width="120">
                    </el-table-column>
                    <el-table-column prop='colourlife_mobile' label="彩之云手机号" min-width="120">
                    </el-table-column>
                    <el-table-column prop='create_at' label="创建时间" min-width="100">
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
                insure_lasst_sex: '',
                insure_mobile:'',
                oa_number:'',
                name: '',
                colourlife_mobile: '',
                create_at : '',
                shade:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{mobile:'',datetimerange:''},
                editor:{}
            }
        },
        methods:{
            setPageData:function(pageObj){
                this.pagination = pageObj;
                this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {name:'',mobile:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },

            getData:function(){

                var vm = this;
                var url = "/insurance/insuranceMealTkList?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                let searchmap=Object.assign({},searchs);
                if(vm.search.datetimerange && vm.search.datetimerange.length ===2){
                    let [begin,end] = vm.search.datetimerange;
                    if( begin == end ){
                        vm.$message({ showClose:true, message:'开始时间和结束时间不能一样', type:'error' }); return ;
                    }
                    searchmap.begin_time = begin;
                    searchmap.end_time = end;
                }else{
                    searchmap.begin_time = '';
                    searchmap.end_time = '';
                }
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    vm.shade = false;
                });
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.getData();
            });
        },
    }

</script>
