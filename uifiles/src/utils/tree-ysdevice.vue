<template>
    <div v-show="show" ref="tree_department" class="my-select" style='border-color:#bfcbd9;padding:0 5px 10px'>
        <div class="tc">
            <el-button @click="submit" size="small">确定</el-button>
            <el-button @click="reset" size="small">清空</el-button>
            <el-button @click="close" size="small">关闭</el-button>
        </div>
        <el-input placeholder="输入关键字进行过滤" v-model="filterText" class='mb10'></el-input>
        <div v-if="loading" class="el-icon-loading"></div>
        <el-tree ref="tree" 
        :data="ysDevice"
        show-checkbox 
        @node-click="nodeclickhandler"
        :props="{label:'name',children:'children'}" 
        node-key="value" 
        :filter-node-method="filterNode"></el-tree>
    </div>
</template>

<script>
    import utils from './utils.js';
    export default {
        //level 0为公司,   1为大区,   2为事业部,   3为停车场   4为设备
        props: ['show','level','value'],
        data:function(){
            return {
                loading:true,
                ysDevice:[],
                filterText:''
            };
        },
        //1.请求数据时先更改station的id避免和公司大区事业部的ID重复
        //2.用keys设置已经选中node
        //3.编辑的时候取行中的station的id要加前缀
        //4.编辑提交的时候去掉station的id前缀
        watch:{
            show(){
                this.show&&Array.isArray(this.value)&&this.setKeys()
            },
            value:function(){
              Array.isArray(this.value)&&this.setKeys()
              this.close();//确定和清空时，关闭当前组件
            },
            filterText:function(val) {
                this.$refs.tree.filter(val);
            },
        },
        created:function(){
            var vm = this;
            this.getDepartment().then(function(data){
                if(typeof(data) != 'undefined') vm.ysDevice = data;
            });
        },
        methods:{
            nodeclickhandler(date,node,self){},
            setKeys(){
                var values = this.value.map(item=>item.value);
                //显示时，给tree赋值；label:'name',children:'children'要一致
                this.$refs.tree.setCheckedKeys(values);
            },
            filterNode:function(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
            },
            submit:function(){
                var obj = this.$refs.tree.getCheckedNodes();
                this.$emit('input', obj);
            },
            reset:function(){
                this.filterText = '';
                this.$refs.tree.setCheckedKeys([]);
                this.$emit('clear');
            },
            close:function(){
                this.$emit('close');
            },
            getDepartment:function(){
                var vm = this;
                return utils.fetch("/yscamera/ysTree").then(function(json){
                    console.log(json);
                    vm.loading = false;
                    if(typeof(json) != 'undefined' && json.code == 0){
                        return vm.resetYsDevice(json.content);
                    }
                });
            },
            resetYsDevice(arr){
                var vm = this;
                if(!Array.isArray(arr)){return}
                arr.forEach(item=>{
                    if(item.children){
                        vm.resetYsDevice(item.children);
                    }else{
                        if(item.level===3){
                            item.value= utils.config.ID_PREFIX + item.value - 0;
                        }
                    }
                })
                return arr;
            }
        }
    }

</script>
