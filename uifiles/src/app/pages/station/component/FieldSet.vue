<template>
    <section class="ui-fieldset">
        <section class="ui-fieldset-title">{{title}}</section>
        <slot></slot>
    </section>
</template>
<script>
export default {
    name:'field-set',
    props:['title']
}
</script>
<style lang="scss">
    .ui-fieldset{
        margin-top:20px;
        padding:15px;
        border-radius: 5px;
        border:1px solid #ddd;
        &-title{
            line-height: 30px;
            border-bottom:1px solid #ddd;
            font-size:16px;
        }
    }
</style>