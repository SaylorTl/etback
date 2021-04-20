<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.mobile" size="small" class="cell widthX150"  placeholder="手机号"></el-input>
                    <el-select v-model="search.status" placeholder="状态" size="small" class="widthX120"  clearable>
                        <el-option v-for="(val,key) in statusmap" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-select v-model="search.type" placeholder="代扣类型" size="small" class="widthX120"  clearable>
                        <el-option v-for="(val,key) in typemap" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <!-- <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button> -->
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span></el-form-item>
                                <!-- <el-form-item label="停车场:"><span>{{ scope.row.station_name }}</span></el-form-item> -->
                                <el-form-item label="创建时间:"><span>{{ scope.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ scope.row.modifytime }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="100"></el-table-column>
                    <el-table-column prop="amount" label="代扣金额" min-width="100"></el-table-column>
                    <el-table-column label="代扣类型" min-width="120">
                        <template slot-scope="scope">{{typemap[scope.row.type]}}</template>
                    </el-table-column>
                    <el-table-column label="授权人" min-width="140">
                          <template slot-scope="scope">{{scope.row.user_name}}/{{scope.row.user_phone}}</template>
                    </el-table-column>
                    <el-table-column label="被授权用户" min-width="140">
                        <template slot-scope="scope">{{scope.row.user_auth_name}}/{{scope.row.user_auth_phone}}</template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="80">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status=='N'),'green':(scope.row.status=='Y')}">{{statusmap[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini" ><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form label-width="120px">
                    <el-form-item label="金额:">
                        <el-input v-model="editor.info.amount" size="small" placeholder="金额"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号:">
                        <el-input v-model="editor.info.mobile" size="small" placeholder="授权手机号"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="停车场:">
                        <my-select-station v-model.trim="editor.info.station_id" size="small" class="cell" width="100%" placeholder="停车场"></my-select-station>
                    </el-form-item> -->
                    <el-form-item label="授权状态:">
                        <el-radio-group v-model="editor.info.status">
                            <el-radio v-for="(val,key) in statusmap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="代扣类型:">
                        <el-radio-group v-model="editor.info.type">
                            <el-radio v-for="(val,key) in typemap" :key="key" :label="key">{{val}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.btnloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>

        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data:function(){
        let cfg = {
            url:{
                list:'/balance/authLists',
                add:'/balance/authAdd',
                update:'/balance/authUpdate',
            }
        }
        return{
            cfg,
            source:utils.config.payMethod,
            statusmap:{"Y":"启用" ,"N":"禁用"},
            typemap:{"all":"全额" ,"ration":"定额"},
            search:{status:'',mobile:'',type:''},
            shade:false,
            isadd:false,
            tableData:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            editor:{title:'',show:false,btnloading:false,info:{car_id:'',station_id:'',mobile:'',amount:'',type:''}},
        }
    },
    methods: {
        updateClick(row){
            let vm = this;
            vm.editor.title='编辑';
            vm.editor.show = true;
            vm.editor.btnloading= false;
            let {type,status,amount,id,user_auth_phone:mobile} = row;
            vm.editor.info ={type,status,amount,id,mobile};
        },
        editSubmit(){
            let vm = this;
            let info = vm.editor.info;
            let url = vm.cfg.url.update;
            vm.editor.btnloading = true
            utils.fetch(url,{method:'post',body:info}).then(function(res){
                if(typeof(res) != 'undefined'){
                    if(res.code == 0) {
                        vm.editor.btnloading= false;
                        vm.editor.show = false;
                        vm.getData();
                    }else{
                        vm.$message({showClose:true, message:res.message, type:'error' });
                    }
                }
            })
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
            this.search = {status:'',mobile:'',type:''};
            this.pagination.page=1;
            this.pagination.pagesize=20;
            this.getData();
        },
        getData:function(){
            var vm = this;
            vm.shade=true;
            var url = vm.cfg.url.list+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
            let {...searchs}=vm.search;
            let searchQueryString=searchs;
            var querystr = utils.setQueryString(searchQueryString);
            var connect = url.indexOf('?')>0?'&':'?';
            url+=querystr?connect+querystr:'';
            utils.fetch(url).then(function(res){
                vm.shade=false;
                if(res.code==0 && res.content!== undefined){
                    vm.tableData = res.content.lists||[];
                    vm.pagination.total = res.content.total || 0;
                    utils.setCache(vm);
                }else{
                    vm.$message({ showClose:true, message:res.message, type:'error' });
                }
            })
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
