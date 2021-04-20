<template>
    <div>
        <div class="certloader" v-show='!filesLoading && filesList.names.length<cfg.fileLimit'>
            <input type='file' ref='upFile' @change="fileload" :multiple="cfg.isMultiple" />
            <i class="el-icon-plus avatar-uploader-icon"></i>
        </div>
        <span class='green' v-if='!filesLoading'>上传附件总数不超过{{cfg.fileLimit}}个!允许上传文件类型{{fileType}}</span>
        <span class='loadingCss' v-else v-loading='filesLoading'></span>
        <!-- 附件列表 -->
        <div class="upfile_lists" v-if='filesList.names.length>0'>
            <ul>
                <li v-for='(item,index) in filesList.names' :key="index">
                    <span class='file_name'>{{item}}</span>
                    <i class="el-icon-circle-close-outline" @click.prevent="removeFilesItem(index)"></i>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import utils from "./utils.js";
export default {
  // props: ['value', 'fileLimit','uploadUrl'],
  props: {
    uploadUrl: {
      type: String,
      required: true
    },
    fileLimit: {
      type: Number,
      default: 5
    },
    fileType: {
      type: Array,
      default() {
        return ["jpg", "png"];
      }
    },
    singleSize: {
      type: String,
      default() {
        return "5M";
      }
    },
    fieldFlag: {
      type: String,
      default: "file[]"
    },
    value: [String, Object]
  },
  data: function() {
    let cfg = {
      fileLimit: 5, //上传附件默认数量
      uploadUrl: "", // 使用组件时必传
      isMultiple: true
    };
    return {
      cfg,
      filesLoading: false,
      filesList: { data: [], names: [] } //表单附件
    };
  },
  watch: {
    value() {
      if (this.value === "") {
        this.filesList = { data: [], names: [] };
      }
    }
  },
  created: function() {
    var vm = this;
    vm.cfg.fileLimit = vm.fileLimit || vm.cfg.fileLimit;
    vm.cfg.uploadUrl = vm.uploadUrl;
  },
  methods: {
    errorTip(msg, type) {
      this.$message({ showClose: true, message: msg, type: type || "error" });
    },
    fileload() {
      let vm = this;
      let files = vm.$refs.upFile.files;
      let allowFiles = [];
      this.fileType.map(item => {
        allowFiles.push(utils.config.mimeType[item]);
      });

      let names = Array.from(files).map(item => item.name);
      let fileTypes = Array.from(files).map(item => item.type);
      let fileSizes = Array.from(files).map(item => item.size);
      let o = this.checkFileType(allowFiles, fileTypes);

      if (o) {
        vm.errorTip("上传文件格式有误！");
        return;
      }

      if (vm.checkFileSize(fileSizes)) {
        vm.errorTip("单个文件大小超出 " + this.singleSize + "！");
        return;
      }

      if (vm.checkRepeatFile(names)) {
        vm.errorTip("文件名称重复了！");
        return;
      }
      let len = files.length + vm.filesList.names.length;
      if (len > vm.cfg.fileLimit) {
        vm.errorTip(`上传附件总数不超过${vm.cfg.fileLimit}个`);
        return;
      }
      let url = vm.cfg.uploadUrl;
      if (!url) {
        vm.errorTip("上传url为空！");
        return;
      }
      let type = vm.fieldFlag === "img" ? "img[]" : "file[]";
      let fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append(type, files[i]);
      }

      vm.filesLoading = true;
      utils.fetch(url, { method: "POST", body: fd, headers: {} }).then(res => {
        if (res.code === 0) {
          if (Array.isArray(res.content)) {
            vm.filesList.data = [...vm.filesList.data, ...res.content];
            if (res.content.length === files.length) {
              vm.filesList.names = [...vm.filesList.names, ...names];
            } else {
              console.log(
                "number of loadfiles  not equal response content's length"
              );
            }
            vm.$emit("change", vm.filesList);
          } else {
            vm.$emit("change", res);
          }
        } else {
          vm.$message({ showClose: true, message: res.message, type: "error" });
        }
        vm.filesLoading = false;
      });
    },
    removeFilesItem(index) {
      if (index !== -1) {
        this.filesList.names.splice(index, 1);
        this.filesList.data.splice(index, 1);
        this.$emit("change", this.filesList);
      }
    },
    checkRepeatFile(names) {
      let vm = this;
      return names.some(item => {
        return vm.filesList.names.indexOf(item) > -1;
      });
    },
    checkFileType(allowTypes, fileTypes) {
      return fileTypes.some(item => {
        return !allowTypes.includes(item);
      });
    },
    checkFileSize(fileSizes) {
      return fileSizes.some(item => {
        return parseFloat(item / 1024 / 1024) > parseFloat(this.singleSize);
      });
    }
  }
};
</script>
 