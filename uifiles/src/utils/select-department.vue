
<template>

    <div class="my-select my-select-dept">
        <ul class="nav clearfix">
            <li v-for="item in nav" :class="{active:item.active}" @click="switchto(item.key)">{{item.name}}</li>
            <li @click="close">X</li>
        </ul>
        <ul v-if="loading?false:true" class="content clearfix">
            <li v-for="item in content" @click="selected(item)">
                <a :title="item.name">{{item.name}}</a>
            </li>
        </ul>
        <div v-if="loading" class="loading"><i class="fa fa-spinner fa-spin"></i></div>
    </div>

</template>

<script>
    import utils from './utils.js';
    export default {
        data:function(){
            return {
                loading:true,
                nav:[],
                content:[],
            };
        },
        beforeMount:function(){
            var nav = new Array();
            nav.push({key:'company',name:'公司',active:false});
            nav.push({key:'area',name:'大区',active:false});
            nav.push({key:'department',name:'事业部',active:false});
            nav[0].active = true;
            this.nav = nav;
            this.getItems("/department/lists?level=0",'company');
        },
        methods:{
            selected:function(obj){
                var url = "";
                var goto = "";
                if(obj.type == 'top'){
                    goto = 'company';
                    url = "/department/lists?level=0";
                }
                if(obj.type == 'company'){
                    goto = 'area';
                    url = "/department/lists?level=1&pid="+obj.value;
                }
                if(obj.type == 'area'){
                    goto = 'department';
                    url = "/department/lists?level=2&pid="+obj.value;
                }
                if(obj.type == 'department'){
                    this.$emit('change',obj); return ;
                }
                this.switchNav(goto);
                this.getItems(url,goto);
            },
            getItems:function(url,goto){
                var vm = this;
                vm.loading = true;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        vm.content = json.content.map(function(obj){
                            return {type:goto,name:obj.name,value:obj.id};
                        });
                    }
                    vm.loading = false;
                });
            },
            switchNav:function(key){
                for(var i in this.nav){
                    this.nav[i].active = false;
                    if(this.nav[i].key == key) this.nav[i].active = true;
                }
            },
            switchto:function(key){
                if(key == 'company'){
                    this.switchNav(key);
                    this.selected({type:'top'});
                }
            },
            close:function(){
                this.$emit('close');
            }
        }
    }

</script>
