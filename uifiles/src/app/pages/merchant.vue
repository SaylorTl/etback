
<template>

    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept" ></my-linkage-dept>
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.merchant_name" size="small" class="cell widthX120"  placeholder="商户名"></el-input>
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
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name}}/{{props.row.dept_name}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="name" label="商户名" min-width="80"></el-table-column>
                    <el-table-column prop="address" label="地址" min-width="120"></el-table-column>
                    <el-table-column prop="mobile" label="手机号" min-width="120"></el-table-column>
                    <el-table-column prop="alias" label="商户别名" min-width="120"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="110"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="110"></el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改</el-button>
                             
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show">
                <el-form :model="editInfo.info" label-width="120px">
                    <el-form-item  label="商户名称:">
                        <el-input v-model="editInfo.info.merchant_name" size='small'> </el-input>
                    </el-form-item>
                    <el-form-item  label="商户别名:">
                        <el-input v-model="editInfo.info.alias" size='small'></el-input>
                    </el-form-item>
                    <el-form-item  label="商户地址:">
                        <el-input v-model="editInfo.info.address" size='small'></el-input>
                    </el-form-item>
                    <el-form-item  label="商户手机:">
                        <el-input v-model="editInfo.info.mobile" size='small'></el-input>
                    </el-form-item>
                    <el-form-item  label="停车场:">
                        <my-select-station v-model.trim="editInfo.info.station_id" size="small" placeholder="停车场" class="widthP100"></my-select-station>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editInfo.saveloading'>保存</el-button>
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
            let cfg={
                url:{
                    list:'/Merchant/lists',
                    update:'/merchant/update',
                    add:'/merchant/add',
                },
            }
            return {
                cfg,
                shade:false,
                isadd:true,
                editInfo:{show:false,title:'',saveloading:false,info:{merchant_name:'',alias:'',address:'',mobile:'',station_id:''}},
                search:{mobile:'',dept:'',station_id:'',merchant_name:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
            }
        },
        methods:{
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            updateClick(row){
                let vm = this;
                vm.isadd = false;
                let {name:merchant_name,alias,address,mobile,station:station_id,id:merchant_id} = row;
                vm.editInfo={show:true,title:'修改信息',saveloading:false,info:{merchant_id,merchant_name,alias,address,mobile,station_id}};
            },
            addClick:function(){
                var vm = this;
                vm.isadd = true;
                vm.editInfo={show:true,title:'添加信息',saveloading:false,info:{merchant_name:'',alias:'',address:'',mobile:'',station_id:''}};
            },
            editSubmit:function(){
                var vm = this;
                var editData=vm.editInfo.info;
                var url = vm.isadd?vm.cfg.url.add:vm.cfg.url.update;
                if(!editData.merchant_name){
                   vm.$message({ showClose:true, message:'商户名不能为空',type:'error'}); return; 
                }
                if(!editData.address){
                   vm.$message({ showClose:true, message:'商户地址不能为空',type:'error'}); return; 
                }
                if(!editData.mobile){
                   vm.$message({ showClose:true, message:'商户手机不能为空',type:'error'}); return; 
                }
                if(!editData.station_id){
                   vm.$message({ showClose:true, message:'停车场不能为空',type:'error'}); return; 
                }
                vm.editInfo.saveloading = true;
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editInfo.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                         vm.editInfo.saveloading = false;
                    }
                })
            },
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.list+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
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
                this.search = {mobile:'',dept:'',station_id:'',merchant_name:''};
                this.search_more = false;
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
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

