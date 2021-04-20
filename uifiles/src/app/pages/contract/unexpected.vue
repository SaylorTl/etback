<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <my-select-plate v-model.trim="search.car_id" size="small" class="cell widthX120"  placeholder="车牌"></my-select-plate>
                    <el-select class="widthX100"  size="small" v-model="search.status"  placeholder="状态">
                        <el-option v-for="(v,k) in cfg.map.status" :key="k" :label="v" :value="k">
                        </el-option>
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
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name+'/'+props.row.dept_name}}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{props.row.creationtime}}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{props.row.modifytime}}</span></el-form-item>
                                <el-form-item label="异常信息:"><span>{{props.row.error_msg}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="station_name" label="停车场"  min-width="120"></el-table-column>
                    <el-table-column prop="brand" label="品牌"  min-width="90"></el-table-column>
                    <el-table-column prop="model" label="车型"  min-width="90"></el-table-column>
                    <el-table-column prop="plate" label="车牌"  min-width="80"></el-table-column>
                    <el-table-column prop="serial" label="系列"  min-width="90"></el-table-column>
                    <el-table-column prop="colour" label="颜色"  min-width="50"></el-table-column>
                    <el-table-column prop="error_colour" label="异常颜色"  min-width="60"></el-table-column>
                    <el-table-column prop="error_model" label="异常车型"  min-width="90"></el-table-column>
                    <el-table-column prop="error_plate" label="异常车牌"  min-width="90"></el-table-column>
                    <el-table-column prop="status" label="状态"  min-width="60">
                        <template slot-scope="scope">
                        <span  :class="{'red':(scope.row.status=='1'),'green':(scope.row.status=='0')}">{{cfg.map.status[scope.row.status]}}</span> 
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button size="mini" @click="imgshow(scope.row)">车图</el-button>
                            <el-button size="mini" @click="dealClick(scope.row)" v-if="scope.row.status=='1'">处理</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
           <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
           <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists>
        </div>
    </div>
</template>
<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            let cfg = {
                url:{
                    lists:'/car/vehicleLists',
                    update:'/car/vehicleUpdate',
                },
                map:{
                    status:{'1':'未处理','0':'已处理'}
                }
            }
            return {
                cfg,
                shade:false,
                updateVisible:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{dept:'',station_id:'',car_id:'',status:''},
                tableData:[],
                images:{show:false,lists:[]},
             }
        },
        methods:{
            imgshow:function(row){
                var lists = [];
                lists.push({title:'车辆图片',href:row.image_url});
                this.images = {show:true,lists};
            },
            imgClose:function(){
                this.images = {show:false,lists:[]};
            },
            dealClick(row){
                let vm = this;
                var url = vm.cfg.url.update;
                let data = {id:row.id}
                vm.$confirm('确认处理此月卡车异常消息？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then((action) => {
                   if(action=='confirm'){
                    utils.fetch(url,{ method:'POST',body:data}).then(function(res){
                        if(typeof(res) != 'undefined'){
                            if(res.code===0){
                                vm.$message({ showClose:true, message:'处理成功', type:'success'})
                                vm.getData();
                            }
                        }
                    })
                   }
                }).catch(() => {
                  vm.$message({
                    type: 'warning',
                    message: '已取消处理'
                  });          
                });
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnUndo:function(){
                this.search = {dept:'',station_id:'',car_id:'',status:''};
                this.pagination.page=1;
                this.pagination.pagesize=20;
                let params = this.$route.params;
                for(let i in params){params[i]=''};
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var status_p = vm.$route.params.status;
                var dept_p = vm.$route.params.dept;
                if(status_p && vm.search.status== ''){vm.search.status = status_p}
                if(dept_p && vm.search.dept== ''){vm.search.dept = dept_p}
                var querystr = utils.setQueryString(vm.search);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
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
