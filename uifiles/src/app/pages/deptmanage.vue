<template>
    <div id='box' class="menu-hide">
        <div class='condition clearfix box-width'>

                <div class="right">
                    <el-button @click="addhandler" size="small"><i class="fa fa-plus"></i>添加大区或者事业部</el-button>
                </div>
            </div>
        <div class="treelist">
            <el-input placeholder="输入关键字进行过滤" v-model="filterText" class='mb10'></el-input>
            <el-tree :data="alldept"  :props="defaultProps"
            :filter-node-method="filterNode"
            ref="tree2"
            class="filter-tree"
            :expand-on-click-node="false"
            :render-content="renderContent"
            ></el-tree>
        </div>
        <el-dialog :title="addDialog.title"  :visible.sync="addDialog.show">
            <el-form ref="kvlists" label-width="120px" class="demo-dynamic">
            <el-form-item label="添加类型">
                <el-select v-model="formdata.type" placeholder="请选择添加类型" @change='selectType'>
                    <el-option v-for="(val,key) in cfg.type" :key="key" :label="val" :value="key"/>
                </el-select>
            </el-form-item>
            <el-form-item label="公司">
                <el-select v-model="formdata.company" @change='changeHandler($event,0)' placeholder="请选择公司" v-loading='companyloading' >
                    <el-option v-for="company in remoteDate.company" :key="company.id" :label="company.name" :value="company.id"/>
                </el-select>
            </el-form-item>
            <el-form-item label="大区" v-show='!islinkage'>
                <el-input v-model="formdata.area"></el-input>
            </el-form-item>
            <el-form-item label="大区" v-show='islinkage'>
                <el-select v-model="formdata.area" @change='changeHandler($event,1)' placeholder="请选择大区"  v-loading='arealoading'>
                    <el-option v-for="area in remoteDate.area" :key="area.id" :label="area.name" :value="area.id"/>
                </el-select>
            </el-form-item>
            <el-form-item label="事业部" v-show='islinkage'>
                <el-input v-model="formdata.department"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm" :loading='saveloading'>提交</el-button>
            </el-form-item>
        </el-form>
        </el-dialog>


    </div>
</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            var config = {
                type:{adderea:"添加大区", adddept:"添加事业部"},
            };
            return {
                cfg:config,
                islinkage:false,
                saveloading:false,
                companyloading:false,
                arealoading:false,
                remoteDate:{company:[],area:[]},
                formdata:{type:'adderea',company:'',area:'',department:''},
                map:{'0':'company','1':'area','2':'departments'},
                alldept:[],
                addDialog:{title:'添加大区或者事业部',show:false},
                defaultProps: {
                  children: 'children',
                  label: 'name'
                },
                filterText:'',
            }
        },
       watch: {
          filterText:function(val) {
            this.$refs.tree2.filter(val);
          }
        },

        methods:{
            renderContent:function(h, { node, data, store }){
                var vm = this;
                return h('span', {attrs: {
                             'class': 'vnode-class',
                            }}, [
                    h('span',null, node.label),
                    h('span',[
                        h('dept-btn',{attrs: {
                            'data':data,
                            'node':node,
                            'type':'modify'
                            }}),
                        h('dept-btn',{attrs: {
                            'data':data,
                            'node':node,
                            'type':'del'
                            }})
                    ])
                  ])
            },
            filterNode:function(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
            },
            addhandler:function(){
                this.addDialog.show = true;
                this.formdata={type:'adderea',company:'',area:'',department:''};
            },
            handleNodeClick(data) {
                console.log(data)
            },
            selectType:function(val){
                var vm = this;
                this.islinkage = !(val === 'adderea');
                if(vm.formdata.company!==''&&vm.islinkage){
                    this.changeHandler(vm.formdata.company,0)
                }
            },
            submitForm:function() {
                var vm = this;
                var url = '/department/add';
                var errTip = vm.islinkage?(vm.formdata.company ===''|| vm.formdata.area ===''|| vm.formdata.department ===''):(vm.formdata.company ===''|| vm.formdata.area ==='');
                if(errTip){
                    var errStr = vm.islinkage?'公司,大区,事业部不能为空':'公司,大区不能为空';
                    vm.$message({ showClose:true, message:errStr, type:'error' })
                    return;
                }
                var data = {
                    parent: vm.islinkage?vm.formdata.area:vm.formdata.company,
                    level: vm.islinkage?2:1,
                    name: vm.islinkage?vm.formdata.department:vm.formdata.area
                    //编辑 时候多传一个ID 参数
                }
                vm.saveloading=true;
                utils.fetch(url,{method:'post',body:data}).then(function(json){
                    vm.saveloading=false;
                    if(json.code == 0){
                        vm.$message({ showClose:true, message:json.message, type:'success' });
                        vm.addDialog.show = false;
                        vm.getAllList();
                    }else{
                        vm.$message({ showClose:true, message:json.message, type:'error' });
                    }
                });
            },
            changeHandler:function(val,level){
                //选择大区时不需要取数据
                if(level === 1 ) return
                if(this.islinkage){
                    this.getData(val,level+1)
                }
            },
            getData:function(val,level){
                var vm = this;
                var levelName = vm.map[level];
                var searchStr = (level === 0 )? 0 : level+'&pid='+val;
                var url = '/department/lists?level='+searchStr;
                vm[levelName+'loading'] =  true;
                utils.fetch(url).then(function(json){
                     if( json && json.code == 0){
                        vm.remoteDate[levelName] =  json.content;
                        vm[levelName+'loading'] = false;
                    }
                });
            },
            getAllList:function(){
                var vm = this;
                var url = '/department/tree?level=2';
                utils.fetch(url).then(function(json){
                     if( json && json.code == 0){
                       vm.alldept = json.content;
                    }
                });
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                vm.getAllList();
                vm.getData('',0);
                utils.getTingYunScript();
            });
        },
    }

</script>
