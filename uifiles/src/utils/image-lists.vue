
<template>
    <div class="image-lists" v-on:mousedown.prevent="" v-on:mouseup.prevent="" v-on:mousemove.prevent="">
        <div v-if="loading==false && total>0" class="close" @click="close"><i class="el-icon-close"></i></div>
        <div v-if="loading==false && total>0" class="images">
            <img class="img" ref="img" :src="image.href" @blur="imgBlur" :style="image.style" > <!--@wheel="scaleMe"-->
            <div class="title" :style="{bottom:titleBottom+'px'}">{{image.title}}</div>
            <div class="btn" :style="{bottom:btnBottom+'px'}">
                <div class="wrap">
                    <i v-if="total>1" class="fa fa-chevron-left" @click="previous"></i>
                    <i v-if="total>1" class="fa fa-chevron-right" @click="next"></i>
                    <i class="fa fa-undo" @click="rotate"></i>
                    <i class="el-icon-plus" @click="addSize"></i>
                    <i class="el-icon-minus" @click="reduceSize"></i>
                </div>
            </div>
        </div>
        <i v-if="loading" class="loading fa fa-spinner fa-spin" :style="{lineHeight:viewHeight+'px',fontSize:'40px'}"></i>
        <div v-if="error" class="error" :style="{lineHeight:viewHeight+'px'}">图片加载失败</div>
    </div>
</template>

<script>
import store from "../app/store/store.js";
import utils from "./utils.js";
export default {
  props: {
    images: {
      required: true
    }, 
    currentPreview: {
      default: 0
    }
  },
  data: function() {
    return {
      data: [],
      image: { title: "", href: "", style: {} },
      titleBottom: 0,
      btnBottom: 0,
      current: this.currentPreview,
      total: 0,
      timer: false,
      loading: true,
      error: false,
      rotateDeg: 0,
      size: 1,
      canDrag: false,
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      style: null
    };
  },
  watch: {
    viewWidth: function(val) {
      var vm = this;
      if (vm.timer == false) {
        vm.timer = true;
        setTimeout(function() {
          vm.show(vm.current);
          vm.timer = false;
        }, 400);
      }
    },
    viewHeight: function(val) {
      var vm = this;
      if (vm.timer == false) {
        vm.timer = true;
        setTimeout(function() {
          vm.show(vm.current);
          vm.timer = false;
        }, 400);
      }
    },
    images: function(val) {
      const vm = this;
      this.data = val.map(function(k) {
        return {
          loaded: false,
          title: k.title,
          href: k.href,
          naturalWidth: 0,
          naturalHeight: 0
        };
      });
      this.total = this.images.length;
      if (this.total > 0) this.show(vm.current);
    }
  },
  mounted: function() {
    this.data = this.images.map(function(k) {
      return {
        loaded: false,
        title: k.title,
        href: k.href,
        naturalWidth: 0,
        naturalHeight: 0
      };
    });
    this.total = this.images.length;
    if (this.total > 0) this.show(this.current);
  },
  computed: {
    viewWidth: function() {
      return this.$store.state.global.WindowViewSize.width; //页面可视区域大小
    },
    viewHeight: function() {
      return this.$store.state.global.WindowViewSize.height; //页面可视区域大小
    }
  },
  methods: {
    previous: function() {
      this.reRotate();
      if (this.current == 0 && this.total > 1) {
        this.show(this.total - 1);
      } else if (this.current > 0 && this.total > 1) {
        this.show(this.current - 1);
      }
    },
    next: function() {
      this.reRotate();
      if (this.current == this.total - 1 && this.total > 1) {
        this.show(0);
      } else if (this.current < this.total - 1 && this.total > 1) {
        this.show(this.current + 1);
      }
    },
    close: function() {
      this.$emit("close");
    },
    rotate: function() {
      this.rotateDeg -= 90;
      this.tranRender();
    },
    tranRender: function() {
      this.$refs.img.style.transform =
        "rotate(" + this.rotateDeg + "deg) scale(" + this.size + ")";
    },
    reRotate: function() {
      this.rotateDeg = 0;
      this.size = 1;
      this.tranRender();
    },
    addSize: function() {
      this.size *= 1.5;
      this.tranRender();
    },
    reduceSize: function() {
      this.size *= 2 / 3;
      this.tranRender();
    },
    show: function(index) {
      var vm = this;
      this.current = index;
      this.error = false;
      if (vm.data[index].loaded) {
        this.initImage(index);
      } else {
        vm.loading = true;
        var obj = new Image();
        obj.src = this.data[index].href;
        obj.onload = function() {
          vm.data[index].loaded = true;
          vm.data[index].naturalWidth = this.naturalWidth;
          vm.data[index].naturalHeight = this.naturalHeight;
          if (vm.current == index) {
            vm.loading = false;
            vm.initImage(index);
          }
        };
        obj.onerror = function() {
          if (vm.current == index) {
            vm.loading = false;
            vm.error = true;
          }
        };
      }
    },
    getImageSize: function(index) {
      var naturalWidth = this.data[index].naturalWidth;
      var naturalHeight = this.data[index].naturalHeight;
      var aspectRatio = naturalWidth / naturalHeight;
      var width = this.viewWidth;
      var height = this.viewHeight;

      if (height * aspectRatio > width) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }

      var width = Math.min(width * 0.9, naturalWidth);
      var height = Math.min(height * 0.9, naturalHeight);

      var img = {
        naturalWidth: this.data[index].naturalWidth, //图片原始宽度
        naturalHeight: this.data[index].naturalHeight, //图片原始高度
        width: width,
        height: height,
        aspectRatio: aspectRatio, //宽高比
        ratio: width / naturalWidth, //缩放比
        left: (this.viewWidth - width) / 2,
        top: (this.viewHeight - height - 75) / 2
      };
      return img;
    },
    initImage: function(index) {
    
      var pic = this.getImageSize(index);
      this.image.title = this.data[index].title;
      this.image.href = this.data[index].href;
      this.image.style = {
        width: pic.width + "px",
        height: pic.height + "px",
        top: pic.top + "px",
        left: pic.left + "px"
      };
      this.btnBottom = pic.top;
      this.titleBottom = pic.top + 45;
    },
    imgBlur: function() {
      this.close();
      console.log("blur");
    },
    // scaleMe(e) {
    //   let vm = this;
    //   //兼容性写法，该函数也是网上别人写的，不过找不到出处了，蛮好的，所有我也没有必要修改了
    //   //判断鼠标滚轮滚动方向
    //   if (window.addEventListener) {
    //     //FF,火狐浏览器会识别该方法
    //     window.addEventListener("DOMMouseScroll", vm.wheel, false);
    //   }
    //   window.onmousewheel = document.onmousewheel = vm.wheel;
    // },
    // wheel(event) {
    //   event = event || window.event;
    //   var delta = 0;
    //   if (!event) event = window.event;
    //   if (event.wheelDelta) {
    //     //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
    //     delta = event.wheelDelta / 120;
    //     if (window.opera) delta = -delta; //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
    //   } else if (event.detail) {
    //     //FF浏览器使用的是detail,其值为“正负3”
    //     delta = -event.detail / 3;
    //   }
    //   if (delta > 0) {
    //     this.bigScale();
    //   } else {
    //     this.smallScale();
    //   }
    // },
    // smallScale() {
    //   let oImg = this.$refs["img"];
    //   //获取图片原始宽度
    //   let oWidth = oImg.width;
    //   //获取图片原始高度
    //   let oHeight = oImg.height;
    //   //获取浏览器宽度
    //   let bWidth = this.getViewPortWidth() - 160;
    //   //获取浏览器高度
    //   let bHeight = this.getViewPortHeight() - 160;

    //   //获取当前图片的缩放率
    //   let currentScale = 1,
    //     currWidth,
    //     currHeight;
    //   if (
    //     document.defaultView.getComputedStyle(oImg, null).transform !== "none"
    //   ) {
    //     currentScale = parseFloat(
    //       document.defaultView
    //         .getComputedStyle(oImg, null)
    //         .transform.substring(7)
    //         .split(",")[0]
    //     );
    //     currWidth = currentScale * oWidth;
    //     currHeight = currentScale * oHeight;
    //   }
    //   oImg.style.transform = "scale(" + parseFloat(currentScale - 0.2) + ")";
    //   if (oWidth > 150) {
    //     if (currWidth < 150) {
    //       oImg.style.transform =
    //         "scale(" +
    //         parseFloat(
    //           currentScale + currentScale * ((150 - currWidth) / 150)
    //         ) +
    //         ")";
    //     }
    //   } else {
    //     if (currentScale < 1) {
    //       oImg.style.transform = "scale(1)";
    //     }
    //   }
    // },
    // bigScale() {
    //   let oImg = this.$refs["img"];
    //   //获取图片原始宽度
    //   let oWidth = oImg.width;
    //   //获取图片原始高度
    //   let oHeight = oImg.height;
    //   //获取浏览器宽度
    //   let bWidth = this.getViewPortWidth() - 160;
    //   //获取浏览器高度
    //   let bHeight = this.getViewPortHeight() - 160;

    //   if (oWidth > bWidth) {
    //     oImg.style.width = bWidth;
    //     oImg.style.height = parseInt((bWidth * oHeight) / oWidth);
    //     return;
    //   } else if (oHeight > bHeight) {
    //     oImg.style.height = bHeight;
    //     oImg.style.height = parseInt((oWidth * bHeight) / oHeight);
    //     return;
    //   }

    //   //获取当前图片的缩放率
    //   let currentScale = 1,
    //     currWidth,
    //     currHeight;
    //   if (
    //     document.defaultView.getComputedStyle(oImg, null).transform !== "none"
    //   ) {
    //     currentScale = parseFloat(
    //       document.defaultView
    //         .getComputedStyle(oImg, null)
    //         .transform.substring(7)
    //         .split(",")[0]
    //     );
    //     currWidth = currentScale * oWidth;
    //     currHeight = currentScale * oHeight;
    //   }
    //   oImg.style.transform = "scale(" + parseFloat(currentScale + 0.2) + ")";
    //   if (oWidth > oHeight) {
    //     if (currWidth >= bWidth) {
    //       oImg.style.transform =
    //         "scale(" +
    //         parseFloat(
    //           currentScale - currentScale * ((currWidth - bWidth) / bWidth)
    //         ) +
    //         ")";
    //     }
    //   } else {
    //     if (currHeight >= bHeight) {
    //       oImg.style.transform =
    //         "scale(" +
    //         parseFloat(
    //           currentScale - currentScale * ((currHeight - bHeight) / bHeight)
    //         ) +
    //         ")";
    //     }
    //   }
    // },
    // 获取浏览器窗口的可视区域的宽度
    getViewPortWidth() {
      return document.documentElement.clientWidth || document.body.clientWidth;
    },
    // 获取浏览器窗口的可视区域的高度
    getViewPortHeight() {
      return (
        document.documentElement.clientHeight || document.body.clientHeight
      );
    },
  }
};
</script>
