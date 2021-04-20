<template>
    <div class='myLinkage'>
        <el-select v-model="data.company" clearable size="small" placeholder="公司" @clear='clearHandler(0)' @change='changeHandler($event,0)' v-loading='companyloading'>
            <el-option v-for="item in company" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-select v-model="data.area" clearable size="small" placeholder="大区" @clear='clearHandler(1)' @change='changeHandler($event,1)'  v-loading='arealoading' >
            <el-option v-for="item in area" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-select v-model="data.department" clearable size="small" placeholder="事业部" v-loading='departmentloading' @clear='clearHandler(2)' @change='changeHandler($event,2)'>
            <el-option v-for="item in department" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
    </div>
</template>
<script>
    import utils from './utils.js';
    export default {
        props: ['value','hideDefault','type'],
        data(){
            return {
                data:{
                    company:'',
                    area:'',
                    department:'',
                },
                level:'',
                clear:false,
                company:[],
                area:[],
                department:[],
                companyloading:false,
                arealoading:false,
                departmentloading:false,
                map:{'0':'company','1':'area','2':'department'},
                dept:'',
                reverse:true,
                reverseDate:{},
            };
        },
        watch:{
            value:function(){
                var vm = this,str='';
                if(vm.value===''){
                    vm.data.company = '';
                    this.changeHandler('',0);
                    //表单组件的 change 事件现在仅响应用户交互,故手动调用
                }
                //reverse data
                if(typeof vm.value == 'string'&&vm.value.indexOf('--')>-1){
                    str = vm.value.slice(2);
                    var obj = JSON.parse(str);
                    vm.reverseDate = obj;
                    if(vm.reverseDate.company!==''){
                        vm.data.company = vm.reverseDate.company;
                        //手动调用，公司有名字就得把大区的数组请求过来 
                        this.changeHandler(vm.reverseDate.company,0);
                    }
                }
            },
        },
        created:function(){
            var vm = this;
            vm.getData('',0);
            if(!vm.hideDefault || vm.hideDefault =='undefined'){
            //     setTimeout(function(){
            //         vm.data.company = 0;
            //    },100)
            }
        },
        methods:{
            resetLevelAndData:function(){
                var vm = this;
                vm.setLevelVal(vm.data);
                vm.getNewData(vm.level);
                vm.clearSelectArray(vm.level);
            },
            getNewData:function(level){
                var vm = this;
                if(level===''){
                    vm.data.area='';
                    vm.data.department='';
                }else if(level===0){
                    vm.data.department='';
                }
            },
            setLevelVal:function(obj){
                var vm = this;
                var map={company:'',area:0,department:1};
                for(var i in obj){
                    if(obj[i]===''){
                        vm.level =  map[i];
                        return;
                    }
                }
                return vm.level =  2;
            },
            clearSelectArray:function(level){
                var vm = this;
                if(level ===0){
                    vm.department=[]
                }else if(level ===''){
                    vm.area=[]
                    vm.department=[]
                }
            },
            clearHandler:function(level){
                var vm = this;
                vm.clear=true;
                vm.resetLevelAndData();
                if(vm.type && parseInt(vm.type) == 2 ){
                    if(level==0){
                        vm.data={company:'',area:'',department:''};
                    }else if(level==1){
                        vm.data.area='';
                        vm.data.department='';
                    }
                    else if(level==2){
                        vm.data.department='';
                    }
                        vm.$emit('input',vm.data);
                    }else{
                        vm.$emit('input','');
                    }
            },
            changeHandler:function(val,level){
                var vm = this;
                var n = level+1;
                if(level==2 && !vm.clear){
                    vm.dept = (val==='')?0:val;
                    if( typeof(vm.type) != 'undefined' && parseInt(vm.type) == 2 ){
                        vm.$emit('input',vm.data);
                    }else{
                        vm.$emit('input',vm.dept);
                    }
                    return
                }
                if(val!==''){ //!vm.clear && 
                    vm.getData(val,n);
                }else{
                    vm.clear=false;
                }
                if(vm.data[vm.map[n]]!==''){vm.data[vm.map[n]]=''}
                vm.resetLevelAndData();
                if(vm.level !==''){
                    vm.getDeptValue(vm.data,vm.level)
                }else{
                    vm.$emit('input','');
                };
            },
            getDeptValue:function(obj,level){
                var vm = this;
                var ids = "";
                if(parseInt(level) == 0){
                    ids = obj.company;
                }else if(parseInt(level) == 1){
                    ids = obj.area;
                }else if(parseInt(level) == 2){
                    vm.dept = obj.department;
                    if( typeof(vm.type) != 'undefined' && parseInt(vm.type) == 2 ){
                        vm.$emit('input',vm.data);
                    }else{
                        vm.$emit('input',vm.dept);
                    }
                    return ;
                }
                utils.fetch('/department/sub?dep_ids='+ids).then(function(json){
                    if(json.code == 0){
                        var dept = json.content.map(function(k){
                            return k.id;
                        });
                        vm.dept = dept.join(",");
                        if( typeof(vm.type) != 'undefined' && parseInt(vm.type) == 2 ){
                            vm.$emit('input',vm.data);
                        }else{
                            vm.$emit('input',vm.dept);
                        }
                    }
                });
            },
            getData:function(val,level){
                var vm = this;
                var levelName = vm.map[level];
                var searchStr = (level === 0 )? 0 : level+'&pid='+val;
                var url = '/department/lists?level='+searchStr;
                vm[levelName+'loading'] = true;
                return utils.fetch(url).then(function(json){
                     if(typeof(json) != 'undefined' && json.code == 0){
                            vm[levelName] =  json.content;
                            vm[levelName+'loading'] = false;
                            //处理从接口得到的反传数据
                            if(vm.reverse){
                                if(typeof vm.reverseDate[levelName]!=='undefined'){
                                    vm.data[levelName] = vm.reverseDate[levelName];
                                }
                                if(vm.data.department!==''){
                                    vm.reverse  = false;
                                }
                            }
                        }
                });
            },
        }
    }
</script>
<style type="text/css" scoped>
    .myLinkage{display: inline-block;}
    .myLinkage>div{width: 100px;}
</style>
