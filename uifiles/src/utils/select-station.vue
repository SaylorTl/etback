<template>
    <div ref="select_station" class="select-staion" :style="{width:width}">
        <div class="val-input" @click="valInputClick" :style="{width:width,display: 'flex', overflow: 'hidden'}" :class="{empty:value3?false:true,disabled:disabled?true:false}">
        <span  @click.stop='clear'><i class="fa fa-times-circle"></i></span>
        {{value3 ? value3 : placeholder}}</div>
        <div class="search-pop" :class="{hide:pophide}" :style="{width:width,marginTop:'2px'}">
            <el-input class="search-input" v-model.trim="value2" v-focus="focusBinding" @input="inputChange" size="small" placeholder="请输入关键字"></el-input>
            <ul :class="{hide:options.length ? false : true}">
                <li v-for="item in options" @click="select(item)" :key="item.id"><span>{{item.name}}</span></li>
            </ul>
            <div class="msg" :class="{hide:options.length}" v-loading='station_loading'>没有搜索结果</div>
        </div>
    </div>
</template>

<script>
    import utils from './utils.js';
    export default {
        //getRules根据车场id,获取当前车场的规则列表
        props: ['value','size','width','placeholder','disabled','getRules'],
        data:function(){
            return {
                station_loading:false,
                value2:'',
                value3:'',
                focusBinding:false,
                pophide:true,
                options:[],
            };
        },
        watch:{
            value:function(){
                this.init();
            },
            value2:function(val){
                // this.inputChange();
                if(val == '') this.options = [];
            }
        },
        directives:{
            focus:{
                componentUpdated:function(el, binding){
                    if(binding.value == true) el.children[0].focus();
                }
            }
        },
        beforeMount:function(){
            this.init();
        },
        methods:{
            init:function(){
                if(this.value){
                    var vm = this;
                    this.getStation(this.value,'id').then(function(data){
                        if(typeof(data) != 'undefined'){
                            vm.value2 = data.name;
                            vm.value3 = data.name;
                            //车场有值的情况下，emit select事件获取name(特指不需要手动emit select的场景；如收入统计下载文件名中)
                            vm.$emit('select',{name:data.name,id:data.id,type:data.type});
                        }
                    });
                }else{
                    this.value2 = "";
                    this.value3 = "";
                }
            },
            clear:function(){
                if(!this.disabled){
                    this.value3 = "";
                    this.$emit('input','');
                    this.$emit('select','');
                }
            },
            valInputClick:function(e){
                var vm = this;
                if(typeof(vm.disabled) == 'undefined' || vm.disabled != true){
                    if(this.pophide){
                        this.value2 = "";
                        this.options = [];
                        this.$root.$el.addEventListener('click',function(e){
                            if(vm.pophide == false && vm.$refs.select_station.contains(e.target) == false){
                                vm.pophide = true;
                            }
                        });
                    }
                    this.pophide = false;
                    this.focusBinding = true;
                }
            },
            inputChange:utils._throttle(function(){
                var vm = this;
                var pattern =  /[`!@#$%^&*_\+=<>?:"{}|,\/;'\\[\]！@#￥%……&*——\-+={}|《》？：“”【】、；‘’，。、]/gim;
                var newVal = this.value2.replace(pattern,'');
                vm.value2 = newVal;
                if(newVal){
                    vm.station_loading = true;
                    this.getStation(newVal,'keyword').then(function(json){
                        vm.options = (json!=''&&json.lists.length!=0)?json.lists.map(function(k){
                            return {id:k.id,name:k.name,type:k.type};
                        }):[];
                        vm.station_loading = false;
                    });
                } else {
                    this.options = [];
                }
            },600,{leading:false}),
            select:function(obj){
                this.value3 = obj.name;
                this.$emit('input', obj.id);
                this.$emit('select',{name:obj.name,id:obj.id,type:obj.type});
                if(this.getRules){
                    this.$emit('showRules',obj.id);
                }
                this.pophide = true;
            },
            getStation:function(key,type){
                var url = "";
                if(type == 'id'){
                    url = '/station/show?station_id='+key;
                }else if(type == 'keyword'){
                    url = '/station/lists?keyword='+key+'&page=1&pagesize=500';
                }
                return utils.fetch(url,{ method:'GET' }).then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        return json.content;
                    }
                });
            }
        }
    }

</script>
