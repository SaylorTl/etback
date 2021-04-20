
<template>

    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.oa"  size="small" class="cell widthX100"  placeholder="oa账号"></el-input>
                    <el-input v-model="search.phone"  size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column prop="id" label="ID" width="60"></el-table-column>
                    <el-table-column prop="oa" label="OA账号" width="120"></el-table-column>
                    <el-table-column prop="mobile" label="手机号" width="90"></el-table-column>
                    <el-table-column prop="fullname" label="全名" width="100"></el-table-column>
                    <el-table-column  prop="dept_name"  label="大区事业部:" min-width="180"></el-table-column>
                    <el-table-column label="操作" width="120">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-pencil-square-o"></i>编辑部门</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="userform" label-width="120px">
                    <el-form-item label="事业部:">
                        <el-input type="textarea" v-model="departmentStr" :rows="2" @focus="showTree('department')" readonly placeholder="请选择事业部"></el-input>
                        <my-tree-department :show="department.show" v-model="department.value" @clear="clearTree('department')" @close="closeTree('department')"  :level="2"></my-tree-department>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="submitUser" type="primary" size="small">提交</el-button>
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
            return {
                shade:false,
                updateVisible:false,
                updateTitle:'',
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{oa:'',phone:''},
                userform:{id:0},
                department:{show:false,value:[]},
            }
        },
        computed:{
            departmentStr:function(){
                var data = this.departmentUnique();
                return this.concatResult(data,'name')
            },
            departmentVal:function(){
                var data = this.departmentUnique();
                return this.concatResult(data,'value')
            },

        },

        methods:{
            concatResult:function(data,val){
                var str = ""; for(var i in data) str += (str == "" ? "" : ",") + data[i][val];
                return str;
            },
            showTree:function(val){
                this.closeAllTree();
                this[val].show = true;
            },
            closeTree:function(val){
                this[val].show = false;
            },
            clearTree:function(val){
                this[val].value = '';
            },
            closeAllTree:function(){
                this.department.show = false;
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            getData:function(){
                var vm = this;
                var useridArray=[];
                var url = "/user/deptLists?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                if(this.search.oa) url += "&oa=" + this.search.oa;
                if(this.search.phone) url += "&phone=" + this.search.phone;
                vm.shade = true;
                utils.fetch(url).then((json)=>{
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0) ? json.content.lists : [];
                    vm.pagination.total = (typeof(json) != 'undefined' && json.code == 0) ? json.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                })
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {oa:'',phone:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            updateClick:function(row){
                var vm = this;
                this.updateVisible = true;
                this.updateTitle = row.fullname + "的管理范围修改";
                this.department = {show:false,value:[]};
                this.userform.id = row.id;
                if(row.dept){
                    this.getRowDepartment(row.dept).then(function(data){
                        if(typeof(data) != 'undefined') vm.department.value = data;
                    });
                }
            },
            submitUser:function(){
                var vm = this;
                var url = "/user/deptUpdate";
                var data={user_id:vm.userform.id,dept:vm.departmentVal};
                utils.fetch(url,{ method:'post',body:data }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.getData();
                            vm.updateVisible = false;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' });
                        }
                    }
                });
            },
            getRowDepartment:function(str){
                return utils.fetch("/department/lists?dep_ids="+str).then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        var data = [];
                        if(json.content){
                            data = json.content.map(function(k){
                                return {value:k.id,name:k.name,level:k.level,pid:k.parent};
                            });
                        }
                        return data;
                    }
                });
            },

            departmentUnique:function(){
                var data = [];
                var lists = this.department.value;
                var level0 = []; var level1 = []; var temp = [];
                if(lists.length > 0){
                    for(var i in lists){
                        if(lists[i].level == 0){
                            data.push({value:lists[i].value,name:lists[i].name});
                            level0.push(lists[i].value);
                            temp.push(lists[i].value);
                        }else if(lists[i].level == 1){
                            if(typeof(lists[i].pid) != 'undefined' && utils.in_array(lists[i].pid,level0) == false){
                                data.push({value:lists[i].value,name:lists[i].name});
                                level1.push(lists[i].value);
                            }
                            if(typeof(lists[i].pid) != 'undefined' && utils.in_array(lists[i].pid,temp)){
                                temp.push(lists[i].value);
                            }
                        }else if(lists[i].level == 2){
                            if(typeof(lists[i].pid) != 'undefined' && utils.in_array(lists[i].pid,level1) == false && utils.in_array(lists[i].pid,temp) == false){
                                data.push({value:lists[i].value,name:lists[i].name});
                            }
                        }
                    }
                }
                return data;
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
