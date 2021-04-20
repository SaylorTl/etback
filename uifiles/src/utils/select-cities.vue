
<template>

    <div class="my-select my-select-cities">
        <ul class="nav clearfix">
            <li v-for="item in nav" :class="{active:item.active}" @click="switchto(item.key)">{{item.name}}</li>
            <li @click="close">X</li>
        </ul>
        <ul v-if="loading?false:true" class="content clearfix">
            <li v-for="item in content" @click="selected(item)">
                <a :title="item.name">{{item.alias}}</a>
            </li>
        </ul>
        <div v-if="loading" class="loading"><i class="fa fa-spinner fa-spin"></i></div>
    </div>

</template>

<script>
    import utils from './utils.js';
    export default {
        props: ['hot','dept'],
        data:function(){
            return {
                loading:true,
                nav:[],
                content:[],
            };
        },
        beforeMount:function(){
            var dept = this.getDept();
            var nav = new Array();
            if(this.hot){
                nav.push({key:'hot',name:'热点城市',active:false});
                this.getHotCity();
            }
            if(dept >= 1) nav.push({key:'province',name:'省',active:false});
            if(dept >= 2) nav.push({key:'city',name:'市',active:false});
            if(dept >= 3) nav.push({key:'region',name:'区县',active:false});
            nav[0].active = true;
            this.nav = nav;
        },
        methods:{
            getDept:function(){
                var dept = typeof(this.dept) != 'undefined' ? parseInt(this.dept) : 3;
                if(dept > 2) dept = 2;  //禁用区县选择
                return dept;
            },
            selected:function(obj){
                var dept = this.getDept();
                var url = "";
                var area = "city";
                if(obj.type == 'country'){
                    console.log("selected "+obj.type+" -- "+obj.value+" -- "+obj.alias);
                    area = 'province';
                    url = "/city/province";
                }
                if(obj.type == 'province'){
                    console.log("selected "+obj.type+" -- "+obj.value+" -- "+obj.alias);
                    if(dept < 2){
                        this.$emit('change',obj); return ;
                    }
                    url = "/city/province?id="+obj.value;
                }
                if(obj.type == 'city'){
                    console.log("selected "+obj.type+" -- "+obj.value+" -- "+obj.alias);
                    if(dept < 3){
                        this.$emit('change',obj); return ;
                    }
                    area = 'region';
                    url = "/city/province?id="+obj.value;
                }
                if(obj.type == 'region'){
                    console.log("selected "+obj.type+" -- "+obj.value+" -- "+obj.alias); return ;
                }
                this.switchNav(area);
                this.getItems(url,area);
            },
            getItems:function(url,area){
                var vm = this;
                vm.loading = true;
                utils.fetch(url).then(function(json){
                    if(typeof(json) != 'undefined' && json.code == 0){
                        vm.content = json.content.map(function(obj){
                            return {type:area,name:obj.name,alias:obj.alias,value:obj.value}
                        });
                    }
                    vm.loading = false;
                });
            },
            getHotCity:function(){
                this.getItems("/city/hot",'city');
            },
            switchNav:function(key){
                for(var i in this.nav){
                    this.nav[i].active = false;
                    if(this.nav[i].key == key) this.nav[i].active = true;
                }
            },
            switchto:function(key){
                if(key == 'hot'){
                    this.switchNav(key);
                    this.getHotCity();
                }else if(key == 'province'){
                    this.selected({type:'country'});
                }
            },
            close:function(){
                this.$emit('close');
            }
        }
    }

</script>
