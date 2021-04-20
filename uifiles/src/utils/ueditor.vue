<template>
  <div>
    <script :id="id" name="content" type="text/plain"></script>
  </div>
</template>
<script>
  export default {
    name: 'UE',
    props: ['value','config','id'],
    data () {
      return {
        editor: null
      }
    },
    watch:{
        value:function(){
          //切换每个图文场景
          if(this.getUEContent()!==this.value){ 
            this.setUEcontent(); //单独设置会让光标停在最前面
          }
        }
    },
    mounted() {
      const _this = this;
      this.editor = UE.getEditor(_this.id, _this.config); 
      this.editor.addListener("ready", function () {
        _this.$emit('ready', _this.editor)
        _this.editor.setContent(_this.value); // 确保UE加载完成后，放入内容。
        _this.editor.addListener('contentChange', () => {
            _this.$emit('input', _this.editor.getContent())
          })
      });
    },
    methods: {
      setUEcontent(){
        this.editor.setContent(this.value)
      },
      getUEContent() { // 获取内容方法
        return this.editor.getContent()
      }
    },
    destroyed() {
      this.editor.destroy();
    }
  }
</script>