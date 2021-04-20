<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"  placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.ParkCode" size="small" class="cell widthX150"  placeholder="编码"></el-input>
                    <el-select size="small" v-model="search.type" clearable placeholder="类型" class="widthX120">
                        <el-option v-for="(k,v) in cfg.type" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="downclick" size="small"><i class="fa fa-cloud-download"></i>下载</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name+'/'+props.row.dept_name}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="ParkCode" label="车场编码" min-width="100"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column label="银行类型" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.type[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.status[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="110"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="110"></el-table-column>
                    <el-table-column label="操作" min-width="140">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show">
                <el-form :model="editInfo.info" label-width="120px">
                    <el-form-item  label="编号:">
                        <el-input v-model="editInfo.info.ParkCode" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="停车场:">
                        <my-select-station v-model="editInfo.info.station_id" size="small" class="cell" width='100%' placeholder="停车场" ></my-select-station>
                    </el-form-item>
                    <el-form-item  label="类型:">
                        <el-select size="small" v-model="editInfo.info.type" clearable placeholder="请选择">
                            <el-option v-for="(v,k) in cfg.type" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                    </el-form-item> 
                    <el-form-item  label="状态:">
                        <el-select size="small" v-model="editInfo.info.status" clearable placeholder="请选择">
                            <el-option v-for="(v,k) in cfg.status" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog title="下载" :visible.sync="download.show">
                <el-form label-width="120px">
                    <el-form-item label="类型:">
                        <el-select size="small" v-model="download.type" disabled clearable placeholder="请选择">
                            <el-option v-for="(v,k) in cfg.type" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                     </el-form-item>
                    <el-form-item label="日期:">
                        <el-date-picker v-model="download.time" size="small" type="date" placeholder="开始时间" value-format="yyyyMMdd" :picker-options="pickopts"></el-date-picker>
                     </el-form-item>
                    <el-form-item>
                        <el-button @click="downbtn" type="primary" size="small">下载</el-button>
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
                    list:'/parkcode/lists',
                    update:'/parkcode/update',
                    add:'/parkcode/add',
                    down:'/parkcode/ftp',//对账文件下载
                },
                type:{ 'bfec': '建设银行', 'cmsb': '民生银行', 'icbc': '工商银行', 'gz_icbc': '贵州工行', 'hb_icbc': '湖北工行' },
                status:{'Y':'启用','N':'禁用'},
            }
            return {
                cfg,
                shade:false,
                isadd:true,
                pickopts:{
                    disabledDate:function(time) {
                        return time.getTime() > new Date().getTime();
                    },
                },
                editInfo:{show:false,title:'',saveloading:false,info:{ParkCode:'',station_id:'',type:''}},
                search:{ParkCode:'', station_id:'',type:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                download:{show:false,type:'',time:''}
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
                vm.fileList = [];
                let {id,ParkCode,station:station_id,type,status} = row;
                let info = {id,ParkCode,station_id,type,status};
                vm.editInfo={show:true,title:'修改信息',saveloading:false,info};
            },
            addClick:function(){
                var vm = this;
                vm.isadd = true;
                vm.editInfo={show:true,title:'添加信息',saveloading:false,info:{status:'Y'}};
            },
            editSubmit:function(){
                var vm = this;
                var editData=vm.editInfo.info;
                var url = vm.isadd?vm.cfg.url.add:vm.cfg.url.update;
                let valimap={"ParkCode":"编码","type":"类型","station_id":"停车场"};
                for(let i in valimap){
                    if(editData[i]===''||typeof editData[i] === 'undefined'){
                        vm.$message({ showClose:true, message:valimap[i]+'不能为空',type:'error'});return;
                    }
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
                    vm.shade = false;
                    utils.setCache(vm);
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {ParkCode:'', station_id:'',type:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            downclick(){
                this.download.show = true;
                this.download.type = 'cmsb';
                this.download.time = '';
            },
            downbtn(){
                let vm = this;
                let url = vm.cfg.url.down;
                let {type,time} = vm.download;
                let data = {type,time};
                var param = utils.setQueryString(data);
                var filename = vm.cfg.type[type]+time + '.xls';
                utils.rpc.loadfile(url, {method:'POST',body:param}, filename).then(function(data){
                })
                vm.download.show = false;
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

