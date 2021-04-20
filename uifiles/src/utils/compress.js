

var createObjectURL = function(blob){
    var url = "";
    if (window.createObjectURL != undefined) {
        url = window.createObjectURL(blob)
    } else if (window.URL != undefined) {  // IE
        url = window.URL.createObjectURL(blob)
    } else if (window.webkitURL != undefined) {
        url = window.webkitURL.createObjectURL(blob)
    }
    return url;
}


var canvasDataURL = function(url,options,callback){
    var img = new Image();
    img.src = url;
    img.onload = function(){
        var that = this;
        // 默认按比例压缩
        var w = that.width, h = that.height, scale = w / h;

        //设置画布大小
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // 创建属性节点
        var anw = document.createAttribute("width"); anw.nodeValue = w; canvas.setAttributeNode(anw);
        var anh = document.createAttribute("height"); anh.nodeValue = h; canvas.setAttributeNode(anh);
        
        ctx.drawImage(that, 0, 0, w, h);

        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL('image/jpeg', options.quality);

        //将base64字符串 转化成 Blob
        var arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1];

        var bstr = atob(arr[1]);  //转换就靠这个函数 atob

        var len = bstr.length;
        var u8arr = new Uint8Array(len);
        while( len-- ){
            u8arr[len] = bstr.charCodeAt(len);
        }
        var bl = new Blob([u8arr], {type:mime});

        callback(createObjectURL(bl),bl);
    }
}

/*
    obj 示例 {file:f,options:{minisize:200,quality:0.2}}
        file 可以使用 document.imggetElementById("file").files[0] 获取到
        minisize 表示图片大小低于该值的 不做压缩处理 （单位 K）  默认值为 200K
        quality 表示压缩比例,数字越小 表示压缩后的图片越小   默认值 0.7

    callback(url,blob);  回调函数格式:  url为blob图片地址，blob存储的是图片内容

    callback函数中的参数url可以用来做图片预览，blob是用来封装成FormData后传给后端接口的 如下示例:

    img.compress({file:f,options:{minisize:200,quality:0.2}}, function(url,blob){
        var form = new FormData();
        form.append("file", blob, "file_123.jpg");  //将该 form post给后端接口
    })
*/
var compressImg = function(obj,callback){
    //options 处理
    if(typeof(obj.options) == 'undefined') obj.options = {minisize:200,quality:0.7};
    if(typeof(obj.options.minisize) == 'undefined' ) obj.options.minisize = 200;

    if(typeof(obj.options.quality) == 'undefined' ) obj.options.quality = 0.7;
    if( obj.options.quality > 1 || obj.options.quality < 0 ) obj.options.quality = 0.7;

    // if(obj.file.size/1024 <= obj.options.minisize )

    var ready = new FileReader();
    ready.readAsDataURL(obj.file);
    ready.onload = function(){
        canvasDataURL(this.result,obj.options,callback);
    }
}

export default {
    compress:compressImg
};