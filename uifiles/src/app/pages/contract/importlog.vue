<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-date-picker v-model="search.begin_time" size="small" class="cell" type="date" placeholder="开始时间" value-format="yyyy-MM-dd"></el-date-picker>
                    <el-date-picker v-model="search.end_time" size="small" class="cell" type="date" placeholder="结束时间" value-format="yyyy-MM-dd"></el-date-picker>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo"  size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <div class="result_info">
                                <section>
                                    <div class="process_info">
                                        <ul>
                                            <li>总共 {{props.row.total_row}} 条;</li>
                                            <li>已处理 {{props.row.count_row}} 条;</li>
                                            <li>已入库 {{props.row.save_row}} 条;</li>
                                            <li>成功 <span class="green">{{props.row.success_row}}</span> 条;</li>
                                        </ul>
                                    </div>
                                </section>
                                <el-collapse accordion>
                                    <el-collapse-item>
                                        <template slot="title">
                                            检测信息  <i class="header-icon el-icon-warning red" v-if='props.row.check_msg.length>0'></i>
                                        </template>
                                        <div v-if='props.row.all_check'>
                                            <ul class="upload_msglist">
                                                <li v-for='(item,index) in props.row.all_check_msg' :key="index">{{item}}</li>
                                            </ul>
                                        </div>
                                        <div v-else>
                                            <ul class="upload_msglist">
                                                <li v-for='(item,index) in props.row.check_msg'  :key="index"><span v-if="item.row!='all'">第 {{item.row}} 行：</span>{{item.msg}}</li>
                                            </ul>
                                        </div>
                                        <div v-if='props.row.check_msg.length==0' class="gray tc">
                                            <span>暂无信息</span>
                                        </div>
                                    </el-collapse-item>
                                    <el-collapse-item>
                                        <template slot="title">
                                            入库信息  <i class="header-icon el-icon-warning red" v-if='props.row.save_msg.length>0'>共有 {{props.row.save_msg.length}} 条异常</i>
                                        </template>
                                        <ul class="upload_msglist" v-if='props.row.save_msg.length>0'>
                                            <li v-for='(item,index) in props.row.save_msg' :key="index">第 {{item.row}} 行：{{item.msg}}</li>
                                        </ul>
                                        <div v-else class="gray tc">
                                            <span>暂无信息</span>
                                        </div>
                                    </el-collapse-item>
                                    <el-collapse-item>
                                        <template slot="title">
                                            下发信息  <i class="header-icon el-icon-warning red" v-if='props.row.issue_msg.length>0'> 共有 {{props.row.issue_msg.length}} 条异常</i>
                                        </template>
                                        <ul class="upload_msglist" v-if='props.row.issue_msg.length>0'>
                                            <li v-for='(item,index) in props.row.issue_msg' :key="index">第 {{item.row}} 行：{{item.msg}}</li>
                                        </ul>
                                        <div v-else class="gray tc">
                                            <span>暂无信息</span>
                                        </div>
                                    </el-collapse-item>
                                </el-collapse>
                                <!-- <div class="gray tc m-t-10">导入的提示信息需手动清除，清除信息不会停止处理已导入的月卡</div> -->
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="55"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="170"></el-table-column>
                    <el-table-column prop="creationtime" label="导入时间" min-width="150"></el-table-column>
                    <el-table-column prop="user_name" label="操作人" min-width="120"></el-table-column>
                    <el-table-column prop="status" label="状态" min-width="100">
                        <template slot-scope="scope">
                            {{statusOption[scope.row.status]}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                        <template slot-scope="scope">
                            <el-button @click="down(scope.$index,scope.row)" plain size="mini">下载</el-button>
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
            return{
                search:{station_id:'',begin_time:'',end_time:''},
                tableData:[],
                pagination:{page:1,pagesize:20,showTotal:false},
                shade:false,
                statusOption:{running:'正在处理',end:'处理完成',error:'出错',success:'成功'}
            }
        },
        methods:{
            down:function(index,row){
                document.location.href = row.file;
            },
            getData:function(){
                var vm = this;
                vm.shade = true;
                vm.tableData=[];
                let url='/import/lists?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize;
                var querystr = utils.setQueryString(vm.search);
                url+=querystr?'&'+querystr:'';
                utils.fetch(url).then(function(json){ 
                  vm.shade = false;
                  if(json&&json.content&&Array.isArray(json.content.lists)){
                    vm.tableData=json.content.lists;
                    utils.setCache(vm);
                 //   console.log('已写缓存',vm)
                  }
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
                this.search = {station_id:'',begin_time:'',end_time:''};
                this.getData();
            },
        },
        mounted(){
            
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
    .el-upload-list{
        width: 50%;
        margin:0 auto;
    }
</style>
