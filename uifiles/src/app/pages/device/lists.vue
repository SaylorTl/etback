
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                	<my-select-station v-model="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-input v-model="search.vendor"  size="small" class="cell widthX120"  placeholder="厂商"></el-input>
                    <el-input v-model="search.extcode"  size="small" class="cell widthX120"  placeholder="厂商编码"></el-input>
                    <el-select v-model="search.type" size="small" class="cell widthX100"  clearable placeholder="类型">
                        <el-option v-for="k in types"
                            :key="k.id" :label="k.name" :value="k.id">
                        </el-option>
                    </el-select>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="#" min-width="40"></el-table-column>
                    <el-table-column prop="status" label="状态" min-width="60">
                    	<template slot-scope="scope">{{scope.row.status == 'Y'?'激活':'禁止'}}</template>
                    </el-table-column>
                    <el-table-column prop="name" label="设备名称" min-width="90"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="110"></el-table-column>
                    <el-table-column  label="类型" width="90">
                    	<template slot-scope="scope">{{deviceTypeMap[scope.row.type]}}</template>
                    </el-table-column>
                    <el-table-column prop="direction" label="方向" width="60">
                    	<template slot-scope="scope">{{scope.row.type==1?(scope.row.direction=='in'?'进口':'出口'):scope.row.direction}}</template>
                    </el-table-column>
                    <el-table-column prop="vendor_name" label="厂商" min-width="80"></el-table-column>
                    <el-table-column prop="robot_name" label="机器人" min-width="80"></el-table-column>
                    <el-table-column prop="extcode" label="厂商编码" min-width="120"></el-table-column>
                    <el-table-column prop="creationtime" label="分配时间" min-width="150"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="150"></el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button @click='playYsLive(scope.row.hls)' plain size="mini" v-if="scope.row.type===7 && authCheck('天眼查看')">播放</el-button>
                            <el-button @click="playCarmera(scope.row)" plain size="mini" v-if="scope.row.type===5 && authCheck('天眼查看')">播放</el-button>
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini">编辑</el-button>
                            <el-button  @click="switcherOperate(scope.$index,scope.row)" v-if="scope.row.type===1 || scope.row.type===2" plain size="mini" :disabled="scope.row.disableStatus">{{btnText[scope.row.type]}}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item  label="设备名称:" >
                        <el-input v-model="editInfo.name" size="small" placeholder="名称"></el-input>
                    </el-form-item>
                    <el-form-item  label="停车场:">
                        <my-select-station v-model="editInfo.station" size="small" class="cell" width="100%" placeholder="停车场" style='top:0'></my-select-station>
                        <!-- <el-input v-model="editInfo.station" placeholder="名称"></el-input> -->
                    </el-form-item>
                    <el-form-item  label="厂商:">
                         <el-select v-model="editInfo.vendor" size="small" placeholder="厂商"  class="widthP100" v-loading='loadVendor'>
                        <el-option  v-for="k in vendorData"
                        :key="k.id" :label="k.name" :value="k.id">
                        </el-option>
                    </el-select>
                    </el-form-item>
                    <el-form-item  label="厂商编码:">
                        <el-input v-model.trim="editInfo.extcode" size="small" placeholder="厂商编码"></el-input>
                    </el-form-item>
                    <el-form-item  label="类型:">
                            <el-select v-model="editInfo.type"  size="small" placeholder="类型"  class="widthP100">
                            <el-option  v-for="k in types"
                            :key="k.id" :label="k.name" :value="k.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item  label="机器人:">
                        <el-select v-model="editInfo.robot_id" size="small" placeholder="机器人" clearable  class="widthP100">
                            <el-option  v-for="(k,index) in robotData"
                            :key="index" :label="k.name" :value="k.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item  label="方向:">
                        <el-radio-group v-model="editInfo.direction">
                             <el-radio v-for="(v,k,index) in cfgdirection" :label="k" :key='index'>{{ v }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                     <el-form-item  label="主出入口:" >
                        <el-radio-group v-model="editInfo.is_main_exit">
                             <el-radio v-for="(v,k,index) in mainExit" :label="k" :key='index'>{{ v }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item  label="当前状态:">
                        <el-radio-group v-model="editInfo.status">
                             <el-radio v-for="(v,k,index) in cfgstatus" :label="k" :key='index'>{{ v }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show">
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                         {{remoteInfo.info.result||''}}
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="player.title" :visible.sync="player.show" @close='closePlayer'>
                 <hls-player :src='player.src'></hls-player>
            </el-dialog>

            <el-dialog  width='50%' :title="video.title"  @open="open"  :visible.sync="video.show"  >
                <el-form label-width="180px" label-height="80px" v-if="video.show">
                    <video id="myPlayer"  class="widthP100" controls playsInline webkit-playsinline autoplay v-if="video.show">
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
                btnText:{'1':'开闸','2':'显示'},
                mainExit:{'Y':'是','N':'否'},
                cfgstatus:{'Y':'激活','N':'禁止'},
                cfgdirection:{'in':'进口','out':'出口'},
                shade:false,
                loadVendor:false,
                updateVisible:false,
                //dialogStation:false,
                deviceTypeMap:{},
                disableStatus:false,
				remoteInfo:{title:'',cmd:'',show:false,info:{}},
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                search:{vendor:'',vendor_id:'',extcode:'',station:'',type:''},
                //deviceType:[],
                types:[],
                tableData:[],
                robotData:[],
                editInfo:{name:'',vendor:'',extcode:'',type:'',robot_id:0,direction:'',status:'',disableStatus:false,station:'',is_main_exit:''},
                vendorData:[],
                player:{title:'',show:false,src:''},
                video:{title:'',show:false,btnloading:false,src:'',rtmp:''},
             }
        },
        methods:{
            open : function(){
                this.playFormVisible = true
                this.$nextTick(() => new EZUIPlayer('myPlayer'))
            },

            playYsLive: function(src,rtmp){
                this.video={
                    title:'直播',
                    show:true,
                    src:src,
                };
            },

            closePlayer:function(){
                this.player.src='';
            },
            playCarmera:function(row){
              var url = "/haikang2/mag/hls/"+row.extcode+"/0/live.m3u8";
              this.player={title:'直播中……',show:true,src:url}
              console.log(url)
            },

            authCheck:function(tag){
                return utils.authCheck(this,tag);
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
        	switcherOperate:function(index,row){
        		var vm = this;
        		var editData = {
        			device_id: row.id,
					cmd:'open'
        		};
        		utils.fetch('/device/open_close',{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                        	vm.remoteInfo = {show:true,title:res.content.title,info:res.content.info};
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
         	},

        	setDisable:function(array){
        		array.forEach(function(item){
        			if(item.status =='N'){
        				item.disableStatus = true;
        			}
        		})
        	},
            updateClick:function(index,row){
                console.info('执行编辑');
                var vm = this;
                vm.plateDisable=true;
                vm.updateVisible = true;
                vm.updateTitle = "编辑设备信息";
                let {name,vendor,extcode,type,robot:robot_id,direction,status,id,station,is_main_exit} = row;
                robot_id = parseInt(robot_id);
                robot_id = robot_id || 0;
                console.info('robot_id:',robot_id);
                vm.editInfo={name,vendor,extcode,type:type.toString(),robot_id,direction,status,id,station,is_main_exit};
            },
            addClick:function(){
                var vm = this;
                vm.updateVisible = true;
                vm.plateDisable=false;
                vm.updateTitle = "添加设备信息";
                vm.editInfo={name:'',vendor:0,extcode:'',type:'1',robot_id:'',direction:'in',status:'Y',station:'',is_main_exit:'Y'};
            },
            editSubmit:function(){
                var vm = this;
                var msgMap = {'name':'设备名称','station':'停车场','extcode':'厂商编码'};
                for(var i in msgMap){
                	if(!vm.editInfo[i]){
                	vm.$message({ showClose:true, message:msgMap[i]+'不能为空', type:'error' }); return;
                	}
                }
                var editData=Object.assign({},vm.editInfo)
                var url = '/device/add';
                if( vm.editInfo.id){
                    editData.device_id = vm.editInfo.id
                    url = '/device/update';
                }
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.updateVisible = false;
                             vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })

            },
            btnUndo:function(){
                this.search = {vendor:'',extcode:'',station:'',type:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.$route.params.station_id='';
                this.$route.params.type='';
                this.getData();
            },
            getData:function(){
                var vm = this;
                var url = "/device/lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var params = vm.$route.params;
                vm.search.station = params.station_id || vm.search.station;
                vm.search.type = params.type || vm.search.type;
                if(vm.search.vendor&&vm.vendorData.length!=0){
            		vm.vendorData.forEach(function(item){
                		if(item.name == vm.search.vendor){
                			vm.search.vendor_id = item.id;
                			return
                		}
                	})
                	url += vm.search.vendor_id?("&vendor_id=" + vm.search.vendor_id):'';
                	vm.search.vendor_id ='';
                };
                if(this.search.extcode) url += "&extcode=" + this.search.extcode;
                if(this.search.station) url += "&station_id=" + this.search.station;
                if(this.search.type) url += "&type=" + this.search.type;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                	if(typeof(res) != 'undefined'){
                		if(res.code == 0){
                			vm.tableData = res.content.lists;
                            vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                            vm.types = res.content.types;
                            vm.types.forEach(function(item){
                                vm.deviceTypeMap[item.id]=item.name
                            })
                			vm.setDisable(vm.tableData);
                            utils.setCache(vm,['types','deviceTypeMap']);
                		}
                	}
                    vm.shade = false;
                })
            },
            getVendorData:function(){
                var vm = this;
                var url = '/vendor/getDatas';
                return utils.fetch(url).then(function(res){
                    vm.vendorData = (typeof(res) != 'undefined' && res.code == 0) ? res.content : [];
                });
            },
            getRobotList(){
                var vm = this;
                var url = "/device/robotLists?page=1&pagesize=10000";
                utils.fetch(url).then((res)=>{
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0 && res.content){
                            vm.robotData = res.content.lists ||[];
                        }
                    }
                })
            },
            // getDeviceType:function(){
            //     var vm = this;
            //     var url = '/device/type?page=1&pagesize=1000';
            //     return utils.fetch(url).then(function(res){
            //         vm.deviceType = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
            //         vm.deviceType.forEach(function(item){
            //             vm.deviceTypeMap[item.id]=item.name
            //         })
            //     });
            // },

        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                //vm.getDeviceType();
                vm.getVendorData();
                vm.getRobotList();
                var hasParams = utils.hasRouteParams(vm.$route.params);
                if(hasParams){vm.getData();return};
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
	.el-form-item{
		margin-bottom: 6px;
	}
</style>
