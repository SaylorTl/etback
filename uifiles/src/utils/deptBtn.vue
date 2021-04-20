<template>
    <span>
        <el-button @click='handler' size="mini" v-show ='hasParent'>{{type=='modify'?'修改':'删除'}}</el-button>
        <el-dialog :title="handlerdata.title"  :visible.sync="handlerdata.show">
            <el-form ref="kvlists" label-width="120px" class="demo-dynamic">
            <el-form-item label="旧名称">
                <el-input v-model="formdata.oldname" :disabled='true'></el-input>
            </el-form-item>
            <el-form-item label="新名称">
                <el-input v-model="formdata.newname"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm" :loading='saveloading'>提交</el-button>
            </el-form-item>
        </el-form>
        </el-dialog>
    </span>
</template>

<script>
    import utils from './utils.js';
    export default {
        props: ['data','node','type'],
        data:function(){
             return {
                handlerdata:{title:'',show:false},
                formdata:{oldname:'',newname:'',id:'',level:'',parent:''},
                saveloading:false,
                hasParent:true,
                timer:1500,
             }
        },
        mounted:function(){
            if(this.data.level === 0 ){this.hasParent = false}
        },
        methods:{
            handler:function(){
                if(this.type == 'modify'){
                    this.modifyHandler();
                }else{
                    this.delHandler();
                }
            },
            delHandler:function(){
                var vm = this;
                var url = '/department/del';
                var data = {id:this.data.value}
                this.$msgbox({ title:'提示', message:'确定要删除'+vm.data.name+'?',
                    showCancelButton:true,
                    confirmButtonText:'确定',
                    cancelButtonText:'取消',
                    type:'warning',
                    beforeClose:function(action, instance, done){
                        if(action === 'confirm'){
                            utils.fetch(url,{method:'post',body:data}).then(function(json){
                                if(json){
                                    if(json.code == 0){
                                        vm.$message({ showClose:true, message:'删除成功,页面即将刷新', type:'success' });
                                        setInterval(function(){
                                            window.location.reload()
                                        },vm.timer)
                                    }else{
                                        vm.$message({ showClose:true, message:json.message, type:'error' });
                                    }
                                   done(); 
                            }
                            })
                        } else {
                            done();
                        }
                    }
                })
            },
            modifyHandler:function(){
                this.handlerdata.show = true;
                this.handlerdata.title = '修改大区或事业部名字';
                this.formdata.oldname = this.data.name;
                this.formdata.id = this.data.value;
                this.formdata.level = this.data.level;
                this.formdata.parent = this.data.pid;
            },
             submitForm:function(){
                var vm = this;
                var url = '/department/update';
                if(vm.formdata.newname===''){
                    vm.$message({ showClose:true, message:'新名称不能为空', type:'error' })
                    return;
                }
                var data = {
                    parent: vm.formdata.parent,
                    level: vm.formdata.level,
                    name: vm.formdata.newname,
                    id:vm.formdata.id
                }
                vm.saveloading=true;
                utils.fetch(url,{method:'post',body:data}).then(function(json){
                    vm.saveloading=false;
                    if(json.code == 0){
                        vm.$message({ showClose:true, message:json.message+',页面即将刷新', type:'success' });
                        vm.handlerdata.show = false;
                        setInterval(function(){
                            window.location.reload()
                        },vm.timer)
                    }else{
                        vm.$message({ showClose:true, message:json.message, type:'error' });
                    }
                });
             },
        }
    }

</script>
 