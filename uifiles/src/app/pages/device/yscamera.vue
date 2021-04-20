<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.deviceSerial" size="small" class="cell widthX150"  placeholder="设备id"></el-input>

                    <el-select v-model="search.status" placeholder="地址使用状态" size ="small"  class="widthX150">
                        <el-option v-for="(val,key) in hlsArr" :key="key" :label="val" :value="key"></el-option>
                    </el-select>

                    <el-select v-model="search.exception" placeholder="地址异常状态" size ="small"  class="widthX150">
                        <el-option v-for="(val,key) in exceptionArr" :key="key" :label="val" :value="key"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right ml5">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>

                <div class="right">
                    <el-button @click="syncList" size="small"><i class="fa fa-refresh"></i>同步数据</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   show-summary :summary-method="getSummaries" border fit style="width:100%">
                    <el-table-column prop="ys_id" label="id" width="70"></el-table-column>
                    <el-table-column  label="设备id" min-width="170" prop="deviceSerial">
                    </el-table-column>
                    <el-table-column  label="设备名称" min-width="200" prop="deviceName">
                    </el-table-column>
                    <el-table-column prop="channelNo" label="通道号" min-width="120"></el-table-column>
                    <el-table-column  label="地址使用状态" min-width="130">
                        <template slot-scope="scope">
                            {{hlsArr[scope.row.status]}}
                        </template>
                    </el-table-column>

                    <el-table-column  label="地址异常状态" min-width="130">
                        <template slot-scope="scope">
                            {{exceptionArr[scope.row.exception]}}
                        </template>
                    </el-table-column>

                    <el-table-column prop='create_at' label="创建时间" min-width="120">
                    </el-table-column>
                    <el-table-column  label="HLS流畅直播地址" min-width="120">
                        <template slot-scope="scope">
                            <el-button plain size="mini"  @click='videoClick(scope.row.hls,scope.row.rtmp)' min-width="120">播放</el-button>
                        </template>
                    </el-table-column>

                    <el-table-column  label="HLS高清直播地址" min-width="120">
                        <template slot-scope="scope">
                            <el-button plain size="mini" @click='videoClick(scope.row.hlsHd,scope.row.rtmpHd)' min-width="100">播放</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>

            <el-dialog  width='50%' :title="video.title"  @open="open"  :visible.sync="video.show"  >
                <el-form label-width="180px" label-height="80px" v-if="video.show">
                    <video id="myPlayer"  class="widthP100" controls playsInline webkit-playsinline autoplay >
                        <source v-bind:src="video.src"  type="application/x-mpegURL" />
                    </video>
                </el-form>
            </el-dialog>

        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    import ezuikit from '../../../utils/ezuikit.js';

    export default {
        data:function(){
            return {
                hlsArr : {'0':'未使用或直播已关闭','1':'使用中','2':'已过期','3':'直播已暂停'},
                exceptionArr : {'0':'正常','1':'设备不在线','2':'设备开启视频加密','3':'设备删除','4':'失效','5':'未绑定','6':'账户下流量已超出','7':'设备接入限制'},
                ys_id: '',
                deviceSerial:'',
                deviceName:'',
                channelNo:'',
                status: '',
                create_at : '',
                sumData : {total:'',online_count:'',offline_count:''},
                hls:'',
                hlsHd:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{deviceSerial:'',exception:''},
                video:{title:'',show:false,btnloading:false,src:'',rtmp:''},
                shade:false,
            }
        },
        methods:{

            getSummaries:function(param){
                var result = [];
                result[0] = "运营信息";
                result[1] = "设备在线数:"+this.sumData.online_count;
                result[2] = "设备离线数："+this.sumData.offline_count;
                result[3] = "设备在线率："+((this.sumData.online_count/this.sumData.total)*100).toFixed(2)+"%";
                return result;
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
                this.search = {deviceSerial:'',exception:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },

            open : function(){
                this.playFormVisible = true
                this.$nextTick(() => new EZUIPlayer('myPlayer'))
            },

            //关闭弹窗
            closeDialog : function(){
                this.video.show = false;
            },

            videoClick: function(src,rtmp){
                this.video={
                    title:'直播',
                    show:true,
                    src:src,
                    rtmp:rtmp,
                };
            },

            syncList: function(){
                var url = "/yscamera/syncList";
                utils.fetch(url).then(function(res){
                    if(res.code == 0){
                        window.location.href = "/device/yscamera";
                    }
                });

            },

            getData:function(){
                var vm = this;

                var url = "/yscamera/index?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                let searchmap=Object.assign({},searchs);

                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.tableData = res.content.lists;
                            vm.pagination.total = res.content.total;
                            vm.sumData.total = res.content.total;
                            vm.sumData.online_count = res.content.online_count;
                            vm.sumData.offline_count = res.content.offline_count;
                            utils.setCache(vm);
                        }
                    }
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
