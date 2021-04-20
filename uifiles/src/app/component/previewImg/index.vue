<template>
    <div class="preview-img-container ">
        <div class="preview-close" @click="close">
            <i class="el-icon-close"></i>
        </div>
        <div class="pre-btn" @click="preMe" v-if="total > 1">
            <i class="el-icon-arrow-left"></i>
        </div>
        <div class="next-btn" @click="nextMe" v-if="total > 1">
            <i class="el-icon-arrow-right"></i>
        </div>
        <div class="bottom-btns">
            <div class="big-btn" @click="bigMe">
                <i class="el-icon-plus"></i>
            </div>
            <div class="small-btn" @click="smallMe">
                <i class="el-icon-minus"></i>
            </div>

            <div class="turn-btn" @click="turnMe">
                <i class="fa fa-undo"></i>
            </div>
        </div>

        <div class="location-center flex">

            <div class="img-container" ref="imgContainer" v-loading="loading">
                <img class="view-img" ref="img" :src="currentImage.url" @mousedown="down" @wheel="scaleMe">
                <!---->
                <div class="view-title">{{currentImage.title}}</div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
  name: "preview-img",
  props: ["imgList"],
  data() {
    return {
      style: {
        rotate: 0,
        scale: 1,
        mLeft: 0, //marginLeft
        mTop: 0 //marginTop
      },
      oX: 0, //鼠标当前X位置
      oY: 0, //鼠标当前Y位置
      loading: true, //图片加载
      currentIndex: 0, //当前图片索引
      currentImage: {
        url: "",
        title: ""
      },
      imgData: [],
      total: 0
    };
  },
  computed: {
    myStyle() {
      return (
        "scale(" + this.style.scale + ") rotate(" + this.style.rotate + "deg)"
      );
    }
  },
  created() {
    //   console.log("pretender:",this.imgList);
  },
  mounted() {
    this.imgData = this.imgList.map(item => {
      return {
        isLoaded: false,
        url: item.href,
        title: item.title
      };
    });

    this.total = this.imgList.length;
    if (this.total > 0) this.showImg(0);
  },
  methods: {
    showImg(index) {
      this.style = {
        rotate: 0,
        scale: 1,
        mLeft: 0, //marginLeft
        mTop: 0 //marginTop
      };
      this.$refs.img.style.transform = this.myStyle;
      let oImg = this.$refs["img"];
      this.currentIndex = index;
      if (this.imgData[index].isLoaded) {
        this.currentImage.url = this.imgData[index].url;
        this.currentImage.title = this.imgData[index].title;
        this.resizeImg(
          this.imgData[index].naturalWidth,
          this.imgData[index].naturalHeight
        );
      } else {
        this.loading = true;
        let img = new Image();
        img.src = this.imgData[index].url;
        img.onload = () => {
          this.imgData[index].isLoaded = true;
          if (this.currentIndex == index) {
            this.loading = false;
            this.currentImage.url = this.imgData[index].url;
            this.currentImage.title = this.imgData[index].title;
            this.imgData[index].naturalWidth = img.width;
            this.imgData[index].naturalHeight = img.height;
            this.resizeImg(img.width, img.height);
          }
        };
        img.onerror = () => {
          this.loading = false;
          this.$refs.imgContainer.innerHTML =
            '<p style="font-size:16px;color:#fff">图片加载失败!</p>';
        };
      }
      // this.currentUrl = this.imgList[index].url;
    },
    resizeImg(width, height) {
      //容器宽度
      let cWidth = this.$refs.imgContainer.offsetWidth;
      //容器高度
      let cHeight = this.$refs.imgContainer.offsetHeight;

      let iRatio = parseFloat(width / height);

      let cRatio = parseFloat(width / height);
      //长方形并且大于容器宽度，以容器宽度为准
      if (width > height && width > cWidth) {
          if(iRatio > cRatio){
            this.$refs.img.style.width = cWidth + "px";
            this.$refs.img.style.height = parseInt(cWidth / iRatio) + "px";
          }else{
              this.$refs.img.style.height = cHeight + "px";
              this.$refs.img.style.width = parseInt(cHeight * iRatio) + "px";
          }
        
      } else if (height > width && height > cHeight) {
        this.$refs.img.style.height = cHeight + "px";
        this.$refs.img.style.width = parseInt(cHeight * iRatio) + "px";
      } else {
        this.$refs.img.style.width = width + "px";
        this.$refs.img.style.height = height + "px";
      }
      this.$refs.img.style.transform = this.myStyle;
    },
    close() {
      if(window.addEventListener){
          window.removeEventListener("DOMMouseScroll",this.wheel,false);
      }
      window.onmousewheel = document.onmousewheel = null;
      this.$emit("close");
    },
    preMe() {
      if (this.currentIndex === 0) {
        this.currentIndex = this.total - 1;
      } else {
        this.currentIndex = this.currentIndex - 1;
      }
      this.showImg(this.currentIndex);
    },
    nextMe() {
      if (this.currentIndex === this.total - 1) {
        this.currentIndex = 0;
      } else {
        this.currentIndex = this.currentIndex + 1;
      }
      this.showImg(this.currentIndex);
    },
    bigMe() {
      this.style.mLeft = 0;
      this.style.mTop = 0;
      this.$refs.img.style.marginLeft = 0;
      this.$refs.img.style.marginTop = 0;
      this.style.scale = this.style.scale + 0.2;
      this.$refs.img.style.transform = this.myStyle;
    },
    smallMe() {
      this.style.mLeft = 0;
      this.style.mTop = 0;
      this.$refs.img.style.marginLeft = 0;
      this.$refs.img.style.marginTop = 0;
      let iWidth = this.$refs.img.width * this.style.scale;
      if (iWidth < 80) {
        return false;
      } else {
        this.style.scale = this.style.scale - 0.2;
        this.$refs.img.style.transform = this.myStyle;
      }
    },
    turnMe() {
      this.style.rotate = this.style.rotate + 90;
      if ((this.style.rotate / 90) % 2 !== 0) {
        this.style.scale = 1;
        this.$refs.img.style.transform = this.myStyle;
      } else {
        this.$refs.img.style.transform = this.myStyle;
      }
    },
    down(e) {
      e.preventDefault();
      //角度转换后，宽高转换
      let iWidth = 0,
        iHeight = 0;
      if ((this.style.rotate / 90) % 2 === 0) {
        iWidth = this.$refs.img.width * this.style.scale;
        iHeight = this.$refs.img.height * this.style.scale;
      } else {
        iHeight = this.$refs.img.width * this.style.scale;
        iWidth = this.$refs.img.height * this.style.scale;
      }

      //容器宽度
      let cWidth = this.$refs.imgContainer.offsetWidth;
      //容器高度
      let cHeight = this.$refs.imgContainer.offsetHeight;
      if (this.style.scale > 1 && (iWidth > cWidth || iHeight > cHeight)) {
        this.$refs.img.style.cursor = "move";
        this.oX = e.clientX;
        this.oY = e.clientY;
        document.onmousemove = ev => {
          //当鼠标点击后，才对document设置mousemove事件
          let x1 = ev.clientX - this.oX;
          let y1 = ev.clientY - this.oY;
          this.oX = ev.clientX;
          this.oY = ev.clientY;
          if (
            iWidth > cWidth &&
            Math.abs(x1 + this.style.mLeft) > iWidth - cWidth
          ) {
            if (x1 + this.style.mLeft < 0) {
              this.$refs.img.style.marginLeft = -(iWidth - cWidth) + "px";
              this.style.mLeft = -(iWidth - cWidth); //记录此时图片的偏移位置
            } else {
              this.$refs.img.style.marginLeft = iWidth - cWidth + "px";
              this.style.mLeft = iWidth - cWidth; //记录此时图片的偏移位置
            }
          } else if (
            iHeight > cHeight &&
            Math.abs(y1 + this.style.mTop) > iHeight - cHeight
          ) {
            if (y1 + this.style.mTop < 0) {
              this.$refs.img.style.marginTop = -(iHeight - cHeight) + "px";
              this.style.mTop = -(iHeight - cHeight);
            } else {
              this.$refs.img.style.marginTop = iHeight - cHeight + "px";
              this.style.mTop = iHeight - cHeight;
            }
            this.$refs.img.style.marginLeft = this.style.mLeft + "px";
          } else {
            if (iWidth > cWidth && iHeight < cHeight) {
              this.$refs.img.style.marginLeft = x1 + this.style.mLeft + "px";
              this.style.mLeft = x1 + this.style.mLeft; //记录此时图片的偏移位置
            } else if (iHeight > cHeight && iWidth < cWidth) {
              this.$refs.img.style.marginTop = y1 + this.style.mTop + "px";

              this.style.mTop = y1 + this.style.mTop;
            } else {
              this.$refs.img.style.marginLeft = x1 + this.style.mLeft + "px";
              this.style.mLeft = x1 + this.style.mLeft; //记录此时图片的偏移位置
              this.$refs.img.style.marginTop = y1 + this.style.mTop + "px";

              this.style.mTop = y1 + this.style.mTop;
            }
          }
        };
        document.onmouseup = function() {
          //鼠标抬起后，就取消document的mousemove事件
          document.onmousemove = null;
        };

        //当图片宽度超出容器宽度后，计算出超出的距离,鼠标移动距离超出这个距离后，以宽度差为准,高度也是
        // if (iWidth > cWidth && iHeight > cHeight) {
        //   let xDistance = parseFloat((iWidth - cWidth) / 2);
        //   let yDistance = parseFloat((iHeight - cHeight) / 2);
        //   if (Math.abs(xLen) > xDistance) {
        //     xLen = xLen < 0 ? -xDistance : xDistance;
        //   }
        //   if (Math.abs(yLen) > yDistance) {
        //     yLen = yLen < 0 ? -yDistance : yDistance;
        //   }
        // } else if (iWidth > cWidth && iHeight < cHeight) {
        //   let xDistance = parseFloat((iWidth - cWidth) / 2);
        //   let yDistance = parseFloat((cHeight - iHeight) / 2);
        //   if (Math.abs(xLen) > xDistance) {
        //     xLen = xLen < 0 ? -xDistance : xDistance;
        //   }
        //   if (Math.abs(yLen) > yDistance) {
        //     yLen = yLen < 0 ? -yDistance : yDistance;
        //   }
        // } else if (iWidth < cWidth && iHeight > cHeight) {
        //   let xDistance = parseFloat((cWidth - iWidth) / 2);
        //   let yDistance = parseFloat((iHeight - cHeight) / 2);
        //   if (Math.abs(xLen) > xDistance) {
        //     xLen = xLen < 0 ? -xDistance : xDistance;
        //   }
        //   if (Math.abs(yLen) > yDistance) {
        //     yLen = yLen < 0 ? -yDistance : yDistance;
        //   }
        // }
      } else {
        return;
      }
    },
    scaleMe(e) {
      let vm = this;
      //兼容性写法，该函数也是网上别人写的，不过找不到出处了，蛮好的，所有我也没有必要修改了
      if (!!this.$refs.img) {
        //判断鼠标滚轮滚动方向
        if (window.addEventListener) {
          //FF,火狐浏览器会识别该方法
          window.addEventListener("DOMMouseScroll", vm.wheel, false);
        }
        window.onmousewheel = document.onmousewheel = vm.wheel;
      }
    },
    wheel(event) {
      event = event || window.event;
      var delta = 0;
      if (!event) event = window.event;
      if (event.wheelDelta) {
        //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta; //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
      } else if (event.detail) {
        //FF浏览器使用的是detail,其值为“正负3”
        delta = -event.detail / 3;
      }
      if (delta > 0) {
        this.bigMe();
      } else {
        this.smallMe();
      }
    }
  }
};
</script>
<style scoped>
.preview-img-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.5);
}
.preview-close {
  position: absolute;
  right: 0;
  top: 0;
  width: 80px;
  height: 80px;
  background: #333;
  border-radius: 0 0px 0 100px;
  font-size: 48px;
  color: #fff;
  cursor: pointer;
}
.preview-close .el-icon-close {
  position: absolute;
  right: 10px;
  top: 10px;
}
.location-center {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.img-container {
  position: relative;
  width: 80%;
  height: 80%;
  /*background: rgb(251, 251, 251, 0.7);*/
  overflow: hidden;
  /* text-align: center;
  vertical-align: middle; */
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-container img {
  margin-top: 0;
  margin-left: 0;
  transform-origin: center;
  /* vertical-align: middle;
  transform-origin: center; */
}
.img-container .view-title {
  position: absolute;
  bottom: 10px;
  font-size: 20px;
  color: #fff;
}
.pre-btn,
.next-btn {
  position: absolute;
  width: 60px;
  height: 60px;
  background: #333;
  text-align: center;
  line-height: 60px;
  border-radius: 60px;
  font-size: 48px;
  color: #fff;
  cursor: pointer;
}
.bottom-btns {
  position: absolute;
  bottom: 10px;
  width: 300px;
  height: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(202, 221, 243, 0.5);
  display: flex;
  align-items: center;
  border-radius: 10px;
}
.small-btn,
.big-btn,
.turn-btn {
  flex: 1;
  margin: 0 30px;
  width: 40px;
  height: 40px;
  background: #333;
  text-align: center;
  line-height: 40px;
  border-radius: 40px;
  font-size: 36px;
  color: #fff;
  cursor: pointer;
}
.pre-btn {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}
.next-btn {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}
/*
.big-btn {
  bottom: 10px;
  left: calc(50% - 120px);
}*/
.big-btn,
.small-btn,
.turn-btn {
  float: left;
  margin: 0 30px;
}
</style>
