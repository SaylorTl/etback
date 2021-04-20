
<template>
    <div id='box' class="menu-hide">
        <div class="testForm">
            <el-form ref="kvlists" label-width="100px" class="demo-dynamic">
            <el-form-item label="厂商">
                <el-select v-model="vendor" placeholder="请选择厂商" class="widthX250" v-loading='vendorloading' >
                    <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="路径(path)">
                <el-input v-model="path"  class='m_input input_val'></el-input>
            </el-form-item>
            <el-form-item label="命令(cmd)">
                <el-input v-model="cmd"  class='m_input input_val'></el-input>
            </el-form-item>
            <el-form-item v-for="(kv, index) in kvs" :label="'键值对' + (index+1)" :key="index">
                <el-input v-model="kv.key" class='cell m_input input_key'></el-input>
                <el-input v-model="kv.val" class='cell m_input input_val'></el-input>
                <el-button v-if='index==0' @click.prevent="addkv">新增键值对</el-button>
                <el-button v-if='index!=0' @click.prevent="removeKv(kv)">删除</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('kvlists')" :loading='saveloading'>提交</el-button>
            </el-form-item>
        </el-form>
    </div>
        <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show" width='80%'>
            <el-form :model="remoteInfo.info" label-width="100px">
                <el-form-item label="请求结果:">
                    <span>{{remoteInfo.info.result||''}}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                path:'',
                cmd:'',
                vendor: '',
                kvs: [{key: '',val:''}],
                vendorData:[],
                vendorloading:false,
                saveloading:false,
                remoteInfo:{title:'',show:false,info:{}},
            }
        },


        methods:{
            submitForm:function() {
                var vm = this,obj={};
                var url = '/vendorapi/send';
                if(vm.vendor ===''){
                     vm.$message({ showClose:true, message:'请选择厂商', type:'error' }); return;
                }
                if(!vm.path||!vm.cmd){
                     vm.$message({ showClose:true, message:'path或cmd不能为空', type:'error' }); return;
                }
                var data={
                    vendor_id:vm.vendor,
                    cmd:vm.cmd,
                    path:vm.path
                  };
                vm.kvs.forEach(function(item){
                    obj[item.key] = item.val
                })
                data.kv= obj;
                vm.saveloading=true;
                data = JSON.stringify(data);
                utils.fetch(url,{method:'post',body:data}).then(function(json){
                    vm.saveloading=false;
                    if(json.code == 0){
                        vm.remoteInfo = {show:true,title:json.content.title};
                        vm.remoteInfo.info = (json.content.info == false || json.content.info =='')?{url:'',params:'',result:''}:json.content.info;
                    }else{
                        vm.$message({ showClose:true, message:json.message, type:'error' });
                    }
                });


            },

            removeKv:function(item) {
                var index = this.kvs.indexOf(item)
                if (index !== -1) {
                  this.kvs.splice(index, 1)
                }
            },
            addkv:function() {
                this.kvs.push({key: '',val:''});
            },
            getVendors:function(){
                var vm = this;
                var url = '/vendor/getDatas';
                vm.vendorloading=true;
                utils.fetch(url).then(function(res){
                    vm.vendorData = (typeof(res) != 'undefined' && res.code == 0) ?res.content :[];
                    vm.vendorloading=false;
                });
            },

        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                vm.getVendors();
                utils.getTingYunScript();
            });
        },
    }

</script>
<style scoped>
    .m_input{float: left; margin: 0 10px 0 0;}
    .input_key { width: 100px;}
    .input_val { width: 250px;}
    .testForm{width: 800px;margin: 30px auto;}
</style>
