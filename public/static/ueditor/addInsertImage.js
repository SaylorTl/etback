;
var timer_regist = setInterval(function() {
    if (UE.registerUI) {
        clearInterval(timer_regist);
        regUI();
    }
}, 200)
function regUI() {
    //setTimeout(function(){
    UE.registerUI('imgInsert', function(editor, uiName) {
        var vm = window.vm || '';
        //创建一个button
        var btn = new UE.ui.Button({
            //按钮的名字
            name: uiName,
            //提示
            title: '图片上传',
            //添加额外样式，指定icon图标，这里默认使用一个重复的icon
            cssRules: 'background-position: -380px 0px', //-726px -77px; 多图
            //点击时执行的命令
            onclick: function() {
                if (vm.uploadDialog) {
                    vm.uploadDialog();
                } else {
                    console.log('vm instance is not found')
                }
            }
        });
        //当点到编辑内容上时，按钮要做的状态反射
        editor.addListener('selectionchange', function() {
            var state = editor.queryCommandState(uiName);
            if (state == -1) {
                btn.setDisabled(true);
                btn.setChecked(false);
            } else {
                btn.setDisabled(false);
                btn.setChecked(state);
            }
        });
        //因为你是添加button,所以需要返回这个button
        return btn;
    })
    //},1000)
}
