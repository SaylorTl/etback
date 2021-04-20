
<template>
    <div v-if="rendering == false && loading == true" id="loading">
        <i class="fa fa-spinner fa-spin"></i>
    </div>
</template>

<script>
    import utils from './utils.js';
    export default {
        computed:{
            rendering:function(){
                return this.$store.state.global.rendering;
            },
            loading:function(){
                return this.$store.state.global.loading;
            },
        }
    }

</script>
