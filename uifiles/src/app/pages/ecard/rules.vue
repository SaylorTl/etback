
<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.name"  size="small" class="cell widthX150"  placeholder="一卡通名称"></el-input>
                    <el-select size="small" v-model="search.status" placeholder="请选择">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
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
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="name" label="一卡通名称" min-width="100"></el-table-column>
                    <el-table-column label="一卡通区域" min-width="520">
                        <template slot-scope="scope">
                            <span>{{ setStationName(scope.row.station_name)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="80">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini">编辑</el-button>
                            <el-button :disabled='(scope.row.status==0)' @click="delClick(scope.row)" plain size="mini">删除</el-button>
                            <el-button :disabled='!(scope.row.status==0)' @click="delClick(scope.row)" plain size="mini">恢复</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
             <el-dialog :title="ecardInfo.title" :visible.sync="ecardInfo.show">
                <el-form label-width="120px">
                    <el-form-item  label="一卡通名称:">
                        <el-input v-model="ecardInfo.name" placeholder="请输入一卡通名称"></el-input>
                    </el-form-item>
                    <el-form-item label="区域:">
                        <el-input type="textarea" v-model="stationStr" :rows="2" @focus="showTree" readonly placeholder="车场列表"></el-input>
                        <my-tree-department :show="stations.show" v-model="stations.data" @clear="clearTree" @close="closeTree" :level="3"></my-tree-department>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitRule" type="primary" size="small" :loading='ecardInfo.loading'>提交</el-button>
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
            return {
                tableData: [],
                shade:false,
                search:{name:'',status:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                ecardInfo:{show:false,title:'',isadd:false,loading:false,name:'',id:''},
                options: [{value: 1,label: '正常状态'},{value: 0,label: '已删除'}],
                stations:{show:false,data:[]},
            }
        },
        computed:{
            stationStr(){
                return this.setStationVal('name')
            },
            stationIds(){
                return this.setStationVal('value')
            }
        },
        methods:{
            setStationVal(type){
                let sData = this.stations.data;
                let stationLists = sData.filter(item => item.level === 3); //id带前缀
                if( type === 'value'){
                    let ids = stationLists.map(item=>{
                        return (item.value+'').replace(utils.config.ID_PREFIX,'')-0 //id去前缀
                    });
                    return ids.join(',');
                }else{
                    return stationLists.map(item=>item[type]).join(',');
                }
            },
            showTree(){
                this.stations.show = true;
            },
            closeTree(){
                this.stations.show = false;
            },
            clearTree(){
                this.stations.data = [];
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            setStationName:function(array){
               return  array.map(item=>item.name).join(',')
            },
            addClick:function(){
                this.ecardInfo={show:true,title:"添加一卡通信息",isadd:true,loading:false,name:'',id:''};
                this.stations.data =[];
            },
            updateClick:function(row){
                var vm = this;
                vm.ecardInfo = {show:true,title:"编辑一卡通信息",name:row.name,id:row.id,isadd:false,loading:false,};
                let row_stations = row.station_name;
                //编辑时的对象数组是[{name:'',id:''}]  添加时是[{name:'',value:'',level:''}]
                vm.stations.data = row_stations.map(item=>{
                    return {name:item.name,value:utils.config.ID_PREFIX+item.id - 0,level:3}
                })
            },
            submitRule:function(){
                var vm = this;
                var url =vm.ecardInfo.isadd ? '/roaming/rule_add':'/roaming/rule_update';
                if(vm.ecardInfo.name === ''){
                    vm.$message({ showClose:true, message:'一卡通名称不能为空', type:'error' }); return;
                }
                if(vm.stationIds=== ''){
                    vm.$message({ showClose:true, message:'一卡通区域不能为空', type:'error' }); return;
                }
                var postData = {
                    rule_name:vm.ecardInfo.name,
                    station_ids:vm.stationIds
                };
                if(!vm.ecardInfo.isadd){
                    postData.rule_id=vm.ecardInfo.id;
                }
                vm.ecardInfo.loading = true;
                utils.fetch(url,{method:'POST',body:postData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.ecardInfo.show=false;
                            vm.ecardInfo.loading = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            btnUndo:function(){
                this.search = {name:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData:function(){
                var vm = this;
                var listsArray=[];
                var url = "/roaming/rule_lists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(vm.search.name) url += "&rule_name="+vm.search.name;
                if(this.search.status===0) url += "&status=0";
                if(this.search.status===1) url += "&status=1";
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                })
            },
            delClick:function(row){
                var vm = this;
                var action = row.status ==0?'恢复':'删除';
                var str = '您确定要'+action+':'+row.name+'的信息吗?';
			    this.$msgbox({ title:'提示', message:str,
					showCancelButton:true,
					confirmButtonText:'确定',
			        cancelButtonText:'取消',
					type:'warning',
			        beforeClose:function(action, instance, done){
			            if(action === 'confirm'){
			            	instance.confirmButtonLoading = true;
			            	instance.confirmButtonText = '正在删除...';
							vm.del_rule(row);
							instance.confirmButtonLoading = false;
							done();
			            } else {
			            	done();
			            }
			        }
				});
            },
            del_rule:function(row){
                var vm = this;
                var postData = {
                    rule_id:row.id,
                    status:(row.status==0)?1:0
                };
                utils.fetch('/roaming/rule_delete',{method:'POST',body:postData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            row.status = (row.status==0)?1:0;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
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
