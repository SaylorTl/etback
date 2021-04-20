<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"  placeholder="停车场" ></my-select-station>
                     <el-input v-model.trim="search.account"  size="small" class="cell widthX120"  placeholder="卡号"></el-input>
                    <el-select class="widthX100"  size="small" v-model="search.type" clearable placeholder="网络类型">
                        <el-option v-for="(v,k) in typeOpt" :key="k" :label="v" :value="k">
                        </el-option>
                    </el-select>
                    <el-select class="widthX100"  size="small" v-model="search.operator" clearable placeholder="运营商">
                        <el-option v-for="(v,k) in mobileOpt" :key="k" :label="v" :value="k">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column  label="大区/事业部" width="180">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="160"></el-table-column>
                    <el-table-column label="类型" width="60">
                        <template slot-scope="scope">
                            <span>{{typeOpt[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="account" label="卡号" width="100"></el-table-column>
                    <el-table-column label="运营商" width="120">
                        <template slot-scope="scope">
                            <span>{{mobileOpt[scope.row.operator]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="supplier" label="供应商" width="100"></el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="120"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="120"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item  label="停车场:">
                        <my-select-station v-model="editor.info.station_id" size="small" class="cell" width='100%' placeholder="停车场" :disabled='!isadd'></my-select-station>
                    </el-form-item>
                    <el-form-item label="卡号:">
                        <el-input v-model="editor.info.account" size="small" placeholder="卡号"></el-input>
                    </el-form-item>
                    <el-form-item label="运营商:">
                        <el-select size="small" v-model="editor.info.operator" placeholder="运营商">
                            <el-option v-for="(v,k) in mobileOpt" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="供应商:">
                        <el-input v-model="editor.info.supplier" size="small" placeholder="可选  福州电信、联想，或者填写其他的"></el-input>
                    </el-form-item>
                    <el-form-item  label="网络类型:">
                    <el-select size="small" v-model="editor.info.type" placeholder="网络类型">
                        <el-option v-for="(v,k) in typeOpt" :key="k" :label="v" :value="k">
                        </el-option>
                    </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.saveloading'>{{editor.btnText}}</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                isadd:true,
                search:{dept:'',station_id:'',account:'', type:'', operator:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                editor:{title:'',show:false,saveloading:false,btnText:'',info:{account:'',operator:'',supplier:'',station_id:'',type:'4G'}},
                tableData:[],
                typeOpt:{'4G': '4G','broadband':'宽带'},
                mobileOpt:{'move': '移动','unicom':'联通','telecom':'电信'}
            }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            updateClick:function(row){
                var vm = this;
                vm.editor.show = true;
                vm.editor.title = "编辑信息";
                vm.editor.btnText = "保存";
                vm.isadd = false;
                vm.editor.info={account:row.account,supplier:row.supplier,operator:row.operator,station_id:row.station,type:row.type,broadband_id:row.id};
            },
            addClick:function(){
                var vm = this;
                vm.editor.show = true;
                vm.editor.title = "添加信息";
                vm.editor.btnText = "添加";
                vm.isadd = true;
                vm.editor.info={account:'',operator:'move',supplier:'',station_id:'',type:'4G'};
            },
            editSubmit:function(){
                var vm = this;
                if(vm.editor.info.account == ''){
                    vm.$message({ showClose:true, message:'卡号不能为空', type:'error' }); return;
                }
                if(vm.editor.info.station_id == ''){
                    vm.$message({ showClose:true, message:'停车场不能为空', type:'error' }); return;
                }
                if( vm.editor.info.supplier == '') return vm.$message({ showClose:true, message:'供应商不能为空', type:'error' });

                vm.editor.saveloading = true;
                var url = vm.isadd?'/broadband/add':'/broadband/update'
                var editData = Object.assign({},vm.editor.info);
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editor.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                        vm.editor.saveloading = false;
                    }
                })
            },
            getData:function(){
                var vm = this;
                var station_id = vm.$route.params.station_id;
                if(station_id && !vm.search.station_id){vm.search.station_id = station_id}
                var url = '/broadband/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var {...searchs} = vm.search;
                var querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {dept:'',station_id:'',account:'', type:'', operator:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.$route.params.station_id='';
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

