<!-- /station.vue -->
<template>
    <div class="remark-container">
        <div ref="remark" class="remark-list" v-loading="remarkInfo.loading" v-if="remarkInfo.data.length >0">
            <div >
                <div class="remark-item" v-for="(item,index) in remarkInfo.data" :key="index">
                    <div class="remark-item-date">
                        <div class="remark-item-icon">
                            <i class="fa fa-calendar"></i>
                        </div>
                        <div class="remark-item-date-cont">{{item.createTime}}</div>
                    </div>
                    <div class="remark-item-content">
                        <div class="remark-item-content-main">
                            <div><span>操作人：</span><span>{{!!item.lists?item.lists.username:''}}</span></div>
                            <div><span>备注说明：</span><span>{{!!item.lists?item.lists.remark:''}}</span></div>
                            <div v-if="!!item.lists &&  Array.isArray(item.lists.uploads) && item.lists.uploads.length > 0"><span>附件：</span>
                                <div v-for="(item,index) in item.lists.uploads" :key="index">
                                    <a :href="item.url" target="_blank">{{item.name}}</a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <my-paginator v-if="remarkInfo.data.length > 0" @change='setRemarkPageData($event)' :pagination='remarkPagination'></my-paginator>
        <div class="remark-form">
            <el-form ref="remarkForm" :model="remarkInfo.form" :rules="remarkInfo.remarkRules" >
                <el-form-item label="备注说明:" prop="content">
                    <el-input type="textarea" v-model="remarkInfo.form.content" :rows="4" placeholder="请输入备注说明"></el-input>
                </el-form-item>
                <el-form-item label="附件:">
                    <my-upload v-if="remarkShow" @change='setUploadFiles' :fileLimit='remarkInfo.fileNum' fieldFlag="img" :fileType='remarkInfo.fileType' singleSize='5M' :uploadUrl="remarkInfo.uploadUrl" v-model='remarkInfo.files'></my-upload>
                </el-form-item>
                <el-form-item style="text-align:right">
                    <el-button @click="cancel">取消</el-button>
                    <el-button type="primary" @click="submit" v-loading="remarkInfo.saveLoading">提交</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import utils from "../../utils/utils.js";
export default {
  name: "station-remark",
  components: {},
  props: ["stationInfo"],
  data() {
    return {
      remarkPagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
      remarkInfo: {
        loading: false,
        fileNum: 3,
        fileType: ["jpg", "png", "pdf"],
        uploadUrl: "/station/apply_upload",
        files: {data:[],names:[]},
        form: {
          content: "",
        },
        saveLoading:false,
        data: [],
        fileList:[],
      },
      remarkShow:true
    };
  },
  beforeCreate() {},
  created() {
    console.log("station:",this.stationInfo);
    this.getRemarkData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  watch: {},
  directives: {},
  methods: {
    setUploadFiles(obj) {
      this.fileList = obj.data;
    },
    submit() {
      let params = {
          station_id:this.stationInfo.id,
          title:'增加备注',
          remark:this.remarkInfo.form.content,
          uploads:JSON.stringify(this.fileList)
      }
      if(!this.remarkInfo.form.content){
          this.$message({
              showClose: true,
              message: '请输入备注说明',
              type: "error"
            });
            return
      }
      this.remarkInfo.saveLoading = true;
      this.remarkShow = false;
      utils.fetch("/station/station_remark",{method:'post',body:params}).then(res => {
        if(res.code === 0){
           this.getRemarkData();
           this.remarkInfo.form.content = "";
           this.fileList = [];
           this.remarkInfo.files = '';
        //    this.$refs["remark"].scrollTop = 0;
        //    this.$emit("needScroll");
           this.remarkShow = true;
        }else{
            this.$message({
              showClose: true,
              message: res.message,
              type: "error"
            });
        }
        this.remarkInfo.saveLoading = false;
      });
    },
    cancel() {
      this.$refs["remarkForm"].resetFields();
    },
    setRemarkPageData: function(pageObj) {
      this.remarkPagination = pageObj;
      this.getRemarkData();
    },
    getRemarkData() {
      this.remarkInfo.loading = true;
      let url =
        "/station/remark_operate_history?station_id=" +
        this.stationInfo.id +
        "&page=" +
        this.remarkPagination.page +
        "&pagesize=" +
        this.remarkPagination.pagesize;
      utils.fetch(url).then(res => {
        this.remarkInfo.data =
          typeof res != "undefined" && res.code == 0 && res.content != ""
            ? res.content.data
            : [];

        this.remarkPagination.total =
          (typeof res != "undefined" && res.code == 0) ? res.content.total : 0;
        this.remarkInfo.loading = false;

      });
    }
  }
};
</script>
<style scoped>
.remark-list {
  position: relative;
  height: 440px;
  overflow: auto;
}
.remark-item {
  position: relative;
  width: 100%;
  min-height: 100px;
  overflow: hidden;
  padding-bottom: 10px;
}
.remark-item::before {
    position: absolute;
    display: block;
    width: 4px;
    height: 100%;
    background: #ddd;
    left: 85px;
    content: "";
    top: 0px;
}
.remark-item .remark-item-date {
  width: 120px;
  position: absolute;
  top: 20px;
  height: 48px;
  border: 1px solid #ddd;
  background: #1c84c6;
  color: #fff;
}
.remark-item:nth-child(2n) .remark-item-date {
  background: #23c6c8;
}
.remark-item:nth-child(3n) .remark-item-date {
  background: #1ab394;
}
.remark-item:nth-child(4n) .remark-item-date {
  background: #f8ac59;
}
.remark-item-icon {
  position: absolute;
  width: 30px;
  line-height: 46px;
  border-radius: 0 20px 20px 0;
  height: 46px;
  border-top: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  margin-left: -8px;
  padding-left: 10px;
  top: 0px;
}
.remark-item-date-cont {
  position: absolute;
  left: 30px;
  top: 6px;
}
.remark-item-content {
  height: 100%;
  margin-left: 150px;
  border-radius: 5px;
  position: relative;
  padding: 10px;
  background: #eee;
}
.remark-item-content::before {
  position: absolute;
  content: "";
  width: 20px;
  height: 20px;
  display: block;
  top: 50px;
  left: -40px;
  margin-top: -20px;
  border-bottom: 20px solid transparent;
  border-top: 10px solid transparent;
  border-left: 20px solid transparent;
  border-right: 20px solid #eee;
}
.remark-item-content-main {
  height: 100%;
  background: #fff;
  padding: 10px;
}
</style>
