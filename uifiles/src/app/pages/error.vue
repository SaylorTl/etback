
<template>

    <div id='box'>
        <div class="error-text">{{error.message}}</div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        computed:{
            error:function(){
                return this.$store.state.global.error ? this.$store.state.global.error : '该页面不存在';
            }
        },
        mounted:function(){

        },
        beforeRouteEnter:function(to, from, next){
            next();
        },
    }

</script>
