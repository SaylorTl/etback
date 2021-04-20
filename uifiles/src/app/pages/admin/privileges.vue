
<template>

    <div id='box' class="menu-hide privileges">
        <div class='menu'>
            <div class='hd'><span><i class="fa fa-chevron-left"></i></span></div>
            <div class='list'>
                <router-link to="/contract/add">添加</router-link>
                <router-link to="/contract/del" class="active">删除</router-link>
            </div>
        </div>
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-select v-model="search.collect" filterable clearable size="small" class="cell widthX100" placeholder="分组">
                        <el-option v-for="k in collects" :key="k.id" :label="k.name" :value="k.id"></el-option>
                    </el-select>
                    <el-button @click="getData" size="small"><i class="fa fa-search"></i>查找</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="collectClick" size="small"><i class="fa fa-users"></i>分组</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column align="center" prop="tag_id" label="序号" min-width="80"></el-table-column>
                    <el-table-column align="center" prop="collect_name" label="分组" min-width="100"></el-table-column>
                    <el-table-column align="center" prop="tag_name" label="名称" min-width="100"></el-table-column>
                    <el-table-column align="center" prop="memo" label="备注" min-width="100"></el-table-column>
                    <el-table-column align="center" label="操作" fixed="right" class-name="table-os-column" width="240">
                        <template slot-scope="scope">
                            <el-button @click="privilege_update(scope.$index,scope.row)" plain size="mini" class="ml0"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                            <el-button @click="delClick(scope.$index,scope.row)" plain size="mini" class="ml0"><i class="fa fa-trash-o"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <el-dialog title="标签" :visible.sync="dialogFormVisible">
                <el-form :model="form">
                    <el-form-item label="标签名称:" label-width="120px">
                        <el-input v-model="form.tag_name" placeholder="请输入内容"></el-input>
                    </el-form-item>
                    <el-form-item label="分组:" label-width="120px">
                        <el-select v-model="form.collect" filterable clearable placeholder="请选择分组">
                            <el-option v-for="k in collects" :key="k.id" :label="k.name" :value="k.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="备注信息:" label-width="120px">
                        <el-input type="textarea" :rows="3" placeholder="请输入备注信息（长度500）" v-model="form.memo"></el-input>
                    </el-form-item>
                    <el-form-item label-width="120px">
                        <el-button @click="submitTag" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :visible.sync="collectVisible">
                <el-tag v-for="k in collects" :key="k.id" type="success" :closable="true" :close-transition="false" @close="collectdelete(k.id)" class="ma5">{{k.name}}</el-tag>
                <el-input v-if="inputCollectVisible" v-model="colletcValue" ref="saveTagInput" size="mini" @keyup.enter.native="collectAdd" @blur="collectAdd" class="privileges-btn"></el-input>
                <el-button v-else size="small" @click="showCollectInput" class="privileges-btn">+ 新分组</el-button>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                dialogFormVisible:false,
                collectVisible:false,
                inputCollectVisible:false,
                pagination:{page:1,pagesize:20},
                tableData:[],
                search:{collect:''},
                form:{tag_id:'',tag_name:'',collect:'',memo:''},
                collects:[],
                colletcValue:''
            }
        },
        methods:{
            getData:function(){
                var vm = this;
                var url = "/privileges/lists";
                if( vm.search.collect ) url += "?collect=" + vm.search.collect;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content : [];
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            addClick:function(){
                this.form = {tag_id:'',tag_name:'',collect:'',memo:''};
                this.dialogFormVisible = true;
            },
            delClick:function(index,row){
                var vm = this;
				this.$msgbox({ title:'提示', message:'您确定要删除 “' + row.tag_name + '”',
					showCancelButton:true,
					confirmButtonText:'确定',
			        cancelButtonText:'取消',
					type:'warning',
			        beforeClose:function(action, instance, done){
			            if(action === 'confirm'){
			            	instance.confirmButtonLoading = true;
			            	instance.confirmButtonText = '正在删除...';
							vm.del_privilege(index,row);
							instance.confirmButtonLoading = false;
							done();
			            } else {
			            	done();
			            }
			        }
				});
            },
            del_privilege:function(index,row){
                var vm = this;
                utils.fetch("/privileges/delete?tag_id="+row.tag_id,{ method:'get' }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            collectClick:function(){
                this.collectVisible = true;
            },
            collectdelete:function(id){
                var vm = this;
                utils.fetch("/privileges/collectdelete?collect_id="+id,{ method:'get' }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getCollects();
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            showCollectInput:function(){
                this.inputCollectVisible = true;
                this.$nextTick(function(){
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            collectAdd:function(){
                var vm = this;
                var dat = "name="+vm.colletcValue+"&type=1";
                if(this.colletcValue != ''){
                    utils.fetch("/privileges/collectadd",{ method:'post',body:dat }).then(function(json){
                        if(typeof(json) != 'undefined'){
                            if(json.code == 0){
                                vm.getCollects();
                            }else{
                                vm.$message({ showClose:true, message:json.message, type:'error' });
                            }
                        }
                        vm.inputCollectVisible = false;
                        vm.colletcValue = '';
                    });
                }else{
                    vm.inputCollectVisible = false;
                    vm.colletcValue = '';
                }
            },
            privilege_update:function(index,row){
                this.form = {tag_id:row.tag_id,tag_name:row.tag_name,collect:row.collect == 0 ?'':row.collect,memo:row.memo};
                this.dialogFormVisible = true;
            },
            submitTag: function() {
                var vm = this;
                var url = "";
                if (vm.form.tag_name === '') {
                    vm.$message({ message: '标签名称不能为空', type: 'error' });
                    return;
                }
                if (vm.form.collect === '') {
                    vm.$message({ message: '分组不能为空', type: 'error' });
                    return;
                }
                var dat = "tag_name=" + vm.form.tag_name + "&collect=" + vm.form.collect + "&memo=" + vm.form.memo;
                if (vm.form.tag_id !== '') {
                    url = "/privileges/update";
                    dat += "&tag_id=" + vm.form.tag_id;
                } else {
                    url = "/privileges/add";
                }
                utils.fetch(url, { method: 'POST', body: dat }).then(function(json) {
                    if (typeof(json) != 'undefined' && json.code == 0) {
                        vm.getData();
                        vm.dialogFormVisible = false;
                    }
                });
            },
            getCollects:function(){
                var vm = this;
                utils.fetch("/privileges/collectlists?type=1").then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        vm.collects = json.content; return true;
                    }
                    return false;
                });
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                vm.getCollects();
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
