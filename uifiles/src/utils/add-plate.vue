<template>
    <el-dialog :title="editInfo.title" width='40%' :visible.sync="myShowPop">
        <el-form>
            <el-form-item label="车牌号:" label-width="100px">
                <el-input v-model="editInfo.info.plate" size="small" placeholder="新的车牌号" >
                </el-input>
            </el-form-item>
             <el-form-item label="手机号:" label-width="100px">
                <el-input v-model="editInfo.info.phone" size="small" placeholder="手机号"></el-input>
            </el-form-item>
            <el-form-item label-width="100px">
                <el-button @click="saveNewPlate" type="primary" size="small">确认</el-button>
            </el-form-item>
        </el-form>
    </el-dialog> 
</template>

<script>
    import utils from './utils.js';
    export default {
        props: ['showpop'],
        data:function(){
            return {
                myShowPop:this.showpop,
                editInfo:{title:'添加新车牌',info:{plate:'',phone:''}},
                addUrl:"/car/add",
            };
        },
        watch: {
             showpop(val) {
                this.myShowPop = val; 
             },
             //emit the event for itself  
             myShowPop(val){
                this.$emit("addCb",val); 
             }
        },
        methods:{
             saveNewPlate:function(){
                var vm = this;
                if(vm.editInfo.info.phone == ''){
                    vm.$message({ showClose:true, message:'手机号不能为空', type:'error' }); return ;
                }
                if(vm.editInfo.info.plate == ''){
                    vm.$message({ showClose:true, message:'车牌号不能为空', type:'error' }); return ;
                }
                var editData={
                    plate : vm.editInfo.info.plate,
                    phone : vm.editInfo.info.phone,
                };
                utils.fetch(vm.addUrl,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editInfo.info={plate:'',phone:''}
                            vm.$message({ showClose:true, message:'车牌添加成功', type:'success' });
                            vm.$emit('addCb',false) //broadcast  for parent
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
             }
        }
    }

</script>
