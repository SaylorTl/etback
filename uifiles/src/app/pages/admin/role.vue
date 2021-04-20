
<template>

    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left"></div>
                <div class="right">
                <el-button @click="push2Group" size="small"><i class="fa fa-plus"></i>推送群</el-button>
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="序号" min-width="80"></el-table-column>
                    <el-table-column prop="name" label="角色名称" min-width="100"></el-table-column>
                    <el-table-column prop="memo" label="备注" min-width="100"></el-table-column>
                    <el-table-column label="操作" fixed="right"  width="240">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                            <el-button @click="deleteClick(scope.$index,scope.row)" plain size="mini"><i class="fa fa-trash-o"></i>删除</el-button>
                            <el-button @click="privilegeClick(scope.$index,scope.row)" plain size="mini"><i class="fa fa-key"></i>权限</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <el-dialog title="角色" :visible.sync="dialogRoleVisible">
                <el-form :model="roleform" label-width="120px">
                    <el-form-item label="名称:">
                        <el-input v-model="roleform.name" placeholder="请输入OA账号"></el-input>
                    </el-form-item>
                    <el-form-item label="备注信息:">
                        <el-input type="textarea" :rows="3" placeholder="请输入备注信息（长度300）" v-model="roleform.memo"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitRole" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :title="privilegesTitle" :visible.sync="privilegesVisible">
                <el-form :model="privileges">
                    <div v-for="(k,i) in privileges" :key="i">
                        <div class="paddingSplit">
                            <el-checkbox v-if="k.collect_id" v-model="privileges[k.collect_id].ischecked" :indeterminate="privileges[k.collect_id].indeterminate" @change="checkAllPriv($event,k.key_id,k.collect_id)" class="mb5">全选({{k.collect_name}})</el-checkbox>
                            <el-checkbox-group v-model="privileges[k.collect_id].checked">
                                <el-checkbox v-for="t in k.lists" :label="t.tag_id" :key="t.tag_id" @change="checkPriv($event,t.group_id,t.tag_id)">{{t.tag_name}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </div>
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
                shade:false,
                dialogRoleVisible:false,
                privilegesVisible:false,
                privilegesTitle:'',
                pagination:{page:1,pagesize:20},
                tableData:[],
                search:{},
                roleform:{id:0,name:'',memo:''},
                privileges:[],
            }
        },
        methods:{
            push2Group:function(){
                var vm = this;
                var url = '/pushmessage/add';
                utils.fetch(url,{ method:'post' }).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.$message({ showClose:true, message:res.message, type:'success' });
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getData:function(){
                var vm = this;
                vm.shade = true;
                utils.fetch("/role/lists").then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content : [];
                    vm.shade = false
                });
            },
            addClick:function(){
                this.roleform = {id:0,name:'',memo:''};
                this.dialogRoleVisible = true;
            },
            privilegeClick:function(index,row){
                var vm = this;
                this.privilegesTitle = row.name+" 权限设置";
                this.getPriv(row.key_id).then(function(obj){
                    if(typeof(obj) != 'undefined'){
                        vm.privileges = obj;
                        vm.privilegesVisible = true;
                    }
                });
            },
            updateClick:function(index,row){
                this.roleform = {id:row.id,name:row.name,memo:row.memo};
                this.dialogRoleVisible = true;
            },
            deleteClick:function(index,row){
                var vm = this;
				this.$msgbox({ title:'提示', message:'您确定要删除 “' + row.name + '”',
					showCancelButton:true,
					confirmButtonText:'确定',
			        cancelButtonText:'取消',
					type:'warning',
			        beforeClose:function(action, instance, done){
			            if(action === 'confirm'){
			            	instance.confirmButtonLoading = true;
			            	instance.confirmButtonText = '正在删除...';
							vm.del_role(index,row);
							instance.confirmButtonLoading = false;
							done();
			            } else {
			            	done();
			            }
			        }
				});
            },
            del_role:function(index,row){
                var vm = this;
                utils.fetch("/role/delete?id="+row.id).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            submitRole:function(){
                var vm = this; var url = ""; var dat = "name="+vm.roleform.name+"&memo="+vm.roleform.memo;
                if(vm.roleform.id == 0){
                    url = "/role/add";
                }else{
                    url = "/role/update?id="+vm.roleform.id;
                }
                if(vm.roleform.name == ''){
                    this.$message({ showClose:true, message:'角色名称不能为空', type:'error' }); return ;
                }
                utils.fetch(url,{ method:'post',body:dat }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                            vm.dialogRoleVisible = false;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            checkAllPriv:function(checked,key_id,collect_id){
                var vm = this;
                var value = checked ? 1 : 0;
                var url = "/privileges/valuestationcollect?group_id="+key_id+"&collect="+collect_id+"&value="+value;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getPriv(key_id).then(function(obj){
                                if(typeof(obj) != 'undefined') vm.privileges = obj;
                            });
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            checkPriv:function(checked,group_id,tag_id){
                var vm = this;
                var value = checked ? 1 : 0;
                var url = "/privileges/value?tag_id="+tag_id+"&group_id="+group_id+"&value="+value;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getPriv(group_id).then(function(obj){
                                if(typeof(obj) != 'undefined') vm.privileges = obj;
                            });
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            getPriv: function(key_id) {
                return utils.fetch("/privileges/station?key_id=" + key_id).then(function(json) {
                    if (typeof(json) != 'undefined' && json.code == 0) {
                        var data = {};
                        for (var i in json.content) {
                            var t = json.content[i];
                            var collect = t.tag_collect_id;
                            if (typeof(data[collect]) == 'undefined') {
                                data[collect] = { key_id: key_id, collect_id: collect, collect_name: t.tag_collect_name, indeterminate: false, ischecked: false, lists: [], checked: [] };
                            }
                            data[collect].lists.push({ group_id: t.group_id, tag_id: t.tag_id, tag_name: t.tag_name });
                            if (parseInt(t.value) == 1) data[collect].checked.push(t.tag_id);
                            data[collect].ischecked = data[collect].checked.length == data[collect].lists.length;
                            data[collect].indeterminate = data[collect].checked.length > 0 && data[collect].checked.length < data[collect].lists.length;
                        }
                        return data;
                    }
                });
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                vm.getData();
            });
        },
    }

</script>
