<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                    <my-select-station v-model.trim="search.station" size="small" class="cell" width="154px" placeholder="停车场"></my-select-station>
                    <el-input v-model.trim="search.plate" size="small" class="cell widthX120"  placeholder="车牌"></el-input>

                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addApplication" size="small"><i class="fa fa-plus"></i>添加续费申请</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-input v-model.trim="search.user_name" size="small" class="cell widthX120"  placeholder="上传人"></el-input>
                <el-select v-model="search.kind" size="small" class="cell widthX100"  placeholder="类型">
                    <el-option v-for="(val,key) in cfg.paykind" :key="key" :label="val" :value="key">
                    </el-option>
                </el-select>
                <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态">
                    <el-option v-for="(val,key) in cfg.statusMap" :key="key" :label="val" :value="key">
                    </el-option>
                </el-select>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="月卡规则:"><span>{{ props.row.rule_name }}</span></el-form-item>
                                <el-form-item label="月卡价格:"><span>{{ props.row.rule_price }}</span></el-form-item>
                                <el-form-item v-if="props.row.state==2" label="拒绝理由:"><span>{{ props.row.detail }}</span></el-form-item>
                                <el-form-item label="旧时间段:">
                                    <span>{{props.row.old_begintime}} - {{props.row.old_endtime}}</span>
                                </el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.create_time }}</span></el-form-item>
                                <el-form-item label="新时间段:"><span v-if="props.row.status==1 || props.row.status==0">{{props.row.new_begintime}} - {{props.row.new_endtime}}</span>
                                </el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modify_time }}</span></el-form-item>
                                <el-form-item label="审批人:"><span>{{ props.row.admin }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="45"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="180"></el-table-column>
                    <el-table-column label="大区/事业部" min-width="220">
                        <template slot-scope="scope">
                            <span>{{scope.row.area_name}}/{{scope.row.dept_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="plate" label="车牌" min-width="110"></el-table-column>
                    <el-table-column prop="amount" label="金额" min-width="110"></el-table-column>
                    <el-table-column label="类型" width="60">
                        <template slot-scope="scope">
                            <span>{{cfg.paykind[scope.row.kind]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="68">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status==2),'green':(scope.row.status==1)}">{{cfg.statusMap[scope.row.status]||'未知'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="user_name" label="上传人" width="110"></el-table-column>
                    <el-table-column label="操作" min-width="160">
                        <template slot-scope="scope">
                            <el-button @click="imgshow(scope.row)" plain size="mini"><i class="fa fa-picture-o"></i>凭证</el-button>
                            <el-button v-if="authCheck('同意月卡续费申请') && scope.row.status==0" @click="agreeClick(scope.row)" plain type="success" size="mini"><i class="fa fa-check"></i>同意</el-button>
                            <el-button v-if="authCheck('拒绝月卡续费申请') && scope.row.status==0" @click="refuseClick(scope.row)" plain type="danger" size="mini"><i class="fa fa-times"></i>拒绝</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <!-- <my-image-lists v-if="images.show" @close="imgClose" :images="images.lists"></my-image-lists> -->
            <!-- 月卡续费申请 S -->
            <el-dialog :title="renew.title" :visible.sync="renew.show">
                <el-form ref="ruleForm" label-width="120px">
                    <el-form-item label="车牌:">
                        <my-select-plate v-model.trim="renew.info.car_id" size="small" width="100%" placeholder="请输入车牌" @select='getContractData'></my-select-plate>
                    </el-form-item>
                    <el-form-item label="停车场:">
                        <el-select v-model="renew.info.station_id" placeholder="请输入停车场" class="widthP100" v-loading='renew.loadstation' @change='getRuleData'>
                            <el-option v-for="k in station_lists" :key="k.id" :label="k.station_name" :value="k.station">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="收费规则:">
                        <el-select v-model="renew.info.rule_id" size="small" placeholder="收费规则" v-loading='renew.loadrule' @change='getCost' clearable>
                            <el-option v-for="item in rules" :key="item.rule" :label="item.rule_name" :value="item.rule"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="到期时间:">
                        <el-input v-model="renew.info.begin" size="small" placeholder="到期时间" :disabled='true'></el-input>
                    </el-form-item>
                    <el-form-item label="到期计算方式:">
                        <el-radio-group v-model="renew.info.method" @change='getCost'>
                            <el-radio :label="0">自然月</el-radio>
                            <el-radio :label="1">跨月</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="续费月数:" v-if='renew.ruletype!=="Y"'>
                        <el-select v-model="renew.info.months" size="small" placeholder="续费月数" @change='getCost'>
                            <el-option v-for='item in cfg.months' :label="item+'个月'" :value="item" :key="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="续费年数:" v-if='renew.ruletype==="Y"'>
                        <el-select v-model="renew.info.months" size="small" placeholder="续费年数" @change='getCost'>
                            <el-option label="1年" value="1"></el-option>
                            <el-option label="2年" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="应付费用:">
                        <el-input v-model="renew.info.amount" size="small" placeholder="月卡金额" :disabled='true'></el-input>
                    </el-form-item>
                    <el-form-item label="付款方式:">
                        <el-select v-model="renew.info.kind" size="small" placeholder="付款方式">
                            <el-option v-for="(val,key) in cfg.paykind" :key="key" :label="val" :value="key">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="续费时间:">
                        <el-input v-model="renew.info.end" size="small" placeholder="续费时间" :disabled='true'></el-input>
                    </el-form-item>
                    <el-form-item label="上传凭证:">
                        <div class="certloader" v-if='filesList.length<cfg.uploadLimit'>
                            <input type='file' ref='img' multiple="multiple" @change="fileload" />
                            <i class="el-icon-plus avatar-uploader-icon"></i>
                        </div>
                        <p class="img_tip">图片不能大于500K,图片格式为:jpg,png,最多只能上传{{cfg.uploadLimit}}张图片</p>
                        <div class="imgPrew">
                            <ul v-if="filesList.length>0">
                                <li v-for="(item,index) in filesList" :key="index">
                                    <span><i class="fa fa-close" @click="delImg(index)"></i></span>
                                    <img :src="item" class="avatar">
                                </li>
                            </ul>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="renewSubmit" type="primary" size="small" :loading='renewSubmitBtnLoading' :disabled='imgIsBig'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <!-- 月卡续费申请 E -->
            <el-dialog :title="remoteInfo.title" :visible.sync="remoteInfo.show" width='80%'>
                <el-form :model="remoteInfo.info" label-width="100px">
                    <el-form-item label="请求结果:">
                        <span>{{remoteInfo.info.result||''}}</span>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>


<script>
import utils from "../../../utils/utils.js";
import previewImg from "../../component/previewImg/index.vue";
import compress from "../../../utils/compress.js";
export default {
  data: function() {
    var config = {
      uploadLimit: 3,
      months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      paykind: {
        "1": "现金",
        "2": "刷卡",
        "3": "代扣",
        "4": "支票",
        "5": "转账",
        "7": "其它"
      },
      statusMap: { "0": "待审核", "1": "已同意", "2": "已拒绝" },
      ruleKind: { Y: "年卡", M: "月卡", D: "日卡", S: "季卡", T: "次卡" }
    };
    return {
      cfg: config,
      shade: false,
      search_more: false,
      renewSubmitBtnLoading: false,
      station_lists: [],
      rules: [],
      search: {
        station: "",
        plate: "",
        status: "",
        kind: "",
        dept: "",
        user_name: ""
      },
      pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
      tableData: [],
      filesList: [],
      postImg: [],
      imgIsBig: false,
      images: { show: false, lists: [] },
      renew: {
        show: false,
        loadstation: false,
        loadrule: false,
        ruletype: "M",
        title: "",
        info: {
          car_id: "",
          station_id: "",
          amount: "",
          rule_id: "",
          months: "1",
          kind: "1",
          method: 0,
          begin: "",
          end: "",
          image: "",
          img: ""
        }
      },
      remoteInfo: { title: "", show: false, info: {} }
    };
  },
  components: {
    "preview-img": previewImg
  },
  methods: {
    btnMore: function() {
      this.search_more = !this.search_more;
    },
    fileload: function() {
        console.log("compress",compress);
      let vm = this;
      let limit = vm.cfg.uploadLimit;
      let files = vm.$refs.img.files;
      let len = (vm.filesList.length + files.length) > limit ? (limit - vm.filesList.length): files.length;
      const SIZE = 1000 * 500;
      if (files.length > limit) {
        // vm.imgIsBig = true;
        vm.$message({
          showClose: true,
          message: "图片数量超出限制，超出部分会被删除！",
          type: "error"
        });
        vm.dealUpload(files,SIZE,len);
      } else {
        vm.dealUpload(files,SIZE,len);
        vm.imgIsBig = false;
      }
      vm.$refs.img.value = null;
    },
    dealUpload(files,SIZE,len){
        let vm = this;
        for (let i = 0; i < len; i++) {
          // vm.filesList.push(url);
          if (files[i].size > SIZE) {
            compress.compress(
              { file: files[i], options: { minisize: 200, quality: 0.2 } },
              function(url, blob) {
                vm.postImg.push(blob);
                vm.filesList.push(url);
              }
            );
          } else {
            var url = "";
            if (window.createObjectURL != undefined) {
              url = window.createObjectURL(files[i]);
            } else if (window.URL != undefined) {
              // IE
              url = window.URL.createObjectURL(files[i]);
            } else if (window.webkitURL != undefined) {
              url = window.webkitURL.createObjectURL(files[i]);
            }
            vm.postImg.push(files[i]);
            vm.filesList.push(url);
          }
        }
    },
    delImg: function(index) {
      let vm = this;
      this.filesList.splice(index, 1);
      this.postImg.splice(index, 1);
    //   vm.checkSize4postImg(vm.postImg);
    },
    checkSize4postImg(array) {
      const SIZE = 1000 * 500;
      let vm = this;
      let isBig = array.every(item => item.size < SIZE);
      if (!isBig) {
        // vm.imgIsBig = true;
        // vm.$message({ showClose:true, message:'图片不能超过500K', type:'error' });
      } else {
        // vm.imgIsBig = false;
      }
    },
    getContractData() {
      //输入车牌取车场
      var vm = this;
      let url = `/contract/lists?page=0&pagesize=0&car_id=${
        vm.renew.info.car_id
      }&status=working,created`;
      vm.renew.loadstation = true;
      vm.station_lists = [];
      vm.renew.info.station_id = "";
      vm.rules = [];
      utils.fetch(url).then(function(res) {
        vm.renew.loadstation = false;
        if (typeof res != "undefined") {
          if (res.code == 0) {
            let array = res.content.lists;
            if (array.length > 0) {
              vm.station_lists = vm.filterArr(array);
            } else {
              vm.station_lists = [];
            }
          } else {
            vm.$message({
              showClose: true,
              message: res.message,
              type: "error"
            });
          }
        }
      });
    },
    getRuleData() {
      //输入车场 取规则
      var vm = this;
      let url = `/contract/lists?page=0&pagesize=0&station_id=${
        vm.renew.info.station_id
      }&car_id=${vm.renew.info.car_id}&status=working,created`;
      vm.renew.loadrule = true;
      vm.rules = [];
      vm.renew.info.rule_id = "";
      utils.fetch(url).then(function(res) {
        vm.renew.loadrule = false;
        if (res && res.code == 0) {
          vm.rules = res.content.lists || [];
        }
      });
    },
    filterArr: function(arr) {
      //去重
      var len = arr.length;
      var uniqueArr = [];
      for (var i = 0; i < len; i++) {
        if (uniqueArr.findIndex(item => item.station == arr[i].station) < 0) {
          uniqueArr.push(arr[i]);
        }
      }
      return uniqueArr;
    },
    getCost: function() {
      var vm = this;
      var url = "/examine/renewCost";
      vm.resetItem();
      //判断选中规则是什么类型：如‘年卡’，‘月卡’等；
      vm.renew.ruletype = vm.renew.info.rule_id
        ? vm.getRuletype(vm.renew.info.rule_id)
        : "M";
      if (vm.renew.info.car_id && vm.renew.info.station_id) {
        var data = {
          car_id: vm.renew.info.car_id,
          station_id: vm.renew.info.station_id,
          costType: vm.renew.info.method
        };
        if (vm.renew.info.rule_id) {
          data.rule_id = vm.renew.info.rule_id;
        }
        if (vm.renew.info.months) {
          data.months = vm.renew.info.months;
        }
        utils.fetch(url, { method: "POST", body: data }).then(function(res) {
          if (typeof res != "undefined") {
            if (res.code == 0) {
              vm.renew.info.end = res.content.cost.end;
              vm.renew.info.begin = res.content.cost.begin;
              vm.renew.info.amount = res.content.cost.total;
            } else {
              vm.$message({
                showClose: true,
                message: res.message,
                type: "error"
              });
            }
          }
        });
      }
    },
    getRuletype(id) {
      return this.rules.find(item => item.rule === id).rule_payunit;
    },
    resetItem: function() {
      var vm = this,
        renew = vm.renew;
      renew.end = "";
      renew.begin = "";
      renew.amount = "";
      renew.rule_id = "";
      renew.ruletype = "M";
    },
    addApplication: function() {
      var vm = this;
      vm.renew.show = true;
      vm.filesList = [];
      vm.postImg = [];
      vm.renew.title = "添加续费申请";
      vm.renewSubmitBtnLoading = false;
      // vm.imgIsBig = false;
      if (vm.$refs["ruleForm"]) {
        vm.$refs["ruleForm"].$el.reset();
      }
      vm.renew.info = {
        car_id: "",
        station_id: "",
        amount: "",
        rule_id: "",
        months: "1",
        kind: "1",
        method: 0,
        begin: "",
        end: "",
        image: "",
        img: ""
      };
    },
    renewSubmit: function() {
      var vm = this;
      var url = "/examine/renewApply";
      var valiMap = {
        car_id: "车牌号",
        station_id: "停车场",
        rule_id: "收费规则"
      };
      for (var i in valiMap) {
        if (!vm.renew.info[i]) {
          vm.$message({
            showClose: true,
            message: valiMap[i] + "不能为空",
            type: "error"
          });
          return;
        }
      }
      if (vm.postImg.length == 0 && vm.$refs.img.files.length == 0) {
        vm.$message({ showClose: true, message: "请上传凭证", type: "error" });
        return;
      }
      var postdata = vm.renew.info;
      postdata.begin = vm._timeAdd1s(postdata.begin);
      var formData = new FormData();
      var pi = vm.postImg,
        len = pi.length;
      for (var i in postdata) {
        if (i == "img") {
          for (var k = 0; k < len; k++) {
            formData.append("img[]", pi[k]);
          }
        } else {
          formData.append(i, postdata[i]);
        }
      }
      vm.renewSubmitBtnLoading = true;
      utils
        .fetch(url, { method: "POST", body: formData, headers: {} })
        .then(function(res) {
          if (typeof res != "undefined") {
            vm.renewSubmitBtnLoading = false;
            if (res.code == 0) {
              vm.renew.show = false;
              vm.getData();
            } else {
              vm.$message({
                showClose: true,
                message: res.message,
                type: "error"
              });
            }
          }
        });
    },
    _timeAdd1s(time) {
      if (time.indexOf("23:59:59") > -1) {
        var MS = new Date(time).getTime(); //毫秒数
        var newMS = new Date().setTime(MS + 1000);
        return utils.timeParse(new Date(newMS), "-", true);
      } else {
        return time;
      }
    },
    setPageData: function(pageObj) {
      this.pagination = pageObj;
      this.getData();
    },
    getData: function() {
      var vm = this;
      var status = vm.$route.params.status;
      var dept = vm.$route.params.dept;
      if (typeof status != "undefined" && vm.search.status == "") {
        vm.search.status = status;
      }
      if (dept && vm.search.dept == "") {
        vm.search.dept = dept;
      }
      vm.shade = true;
      var url =
        "/examine/renewlists?page=" +
        vm.pagination.page +
        "&pagesize=" +
        vm.pagination.pagesize;
      if (vm.search.station) url += "&station_id=" + vm.search.station;
      if (vm.search.plate) url += "&plate=" + vm.search.plate;
      if (vm.search.status != "") url += "&status=" + vm.search.status;
      if (vm.search.kind) url += "&kind=" + vm.search.kind;
      if (vm.search.dept) url += "&dept_ids=" + vm.search.dept;
      if (vm.search.user_name) url += "&user_name=" + vm.search.user_name;
      utils.fetch(url).then(function(json) {
        vm.tableData =
          typeof json != "undefined" && json.code == 0
            ? json.content.lists
            : [];
        vm.pagination.total =
          typeof json != "undefined" && json.code == 0 ? json.content.total : 0;
        utils.setCache(vm);
        vm.shade = false;
      });
    },
    btnSearch: function() {
      this.pagination.page = 1;
      this.getData();
    },
    btnUndo: function() {
      this.search = {
        station: "",
        plate: "",
        status: "",
        kind: "",
        dept: "",
        user_name: ""
      };
      this.pagination.page = 1;
      this.pagination.pagesize = 20;
      let params = this.$route.params;
      for (let i in params) {
        params[i] = "";
      }
      this.getData();
    },
    imgshow: function(row) {
      var lists = [];
      try {
        row.img_urls.forEach(function(url, idx) {
          if (url) {
            lists.push({ title: "续费凭证" + (idx + 1), href: url });
          }
        });
      } catch (e) {
        console.log(e + "取当前凭证出错了");
      }
      this.images = { show: true, lists: lists };
    },
    imgClose: function() {
      this.images = { show: false, lists: [] };
    },
    agreeClick: function(row) {
            var vm = this;
            var str = '您确定要同意这条申请吗?确认车牌号为:'+row.plate+';车场为:'+row.station_name;
            this.$msgbox({
                title: '提示',
                message: str,
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                beforeClose: function(action, instance, done) {
                    if (action === 'confirm') {
                        vm.agree(row)
                        done();
                    } else {
                        done();
                    }
                }
            }).catch(e=>{console.log(e)});
        },
    agree: function(row) {
      var vm = this;
      utils
        .fetch("/examine/renewagree", { method: "POST", body: "id=" + row.id })
        .then(function(json) {
          if (typeof json != "undefined") {
            if (json.code == 0) {
              vm.getData();
              //成功后下发
              vm.sendCmd(row);
            } else {
              vm.$message({
                showClose: true,
                message: json.message,
                type: "error"
              });
            }
          }
        });
    },
    sendCmd: function(row) {
      var vm = this;
      utils
        .fetch(
          "/contract/commond?cmd=add&station_id=" +
            row.station +
            "&car_id=" +
            row.car +
            "&rule_id=" +
            row.rule
        )
        .then(function(json) {
          if (typeof json != "undefined") {
            if (json.code == 0) {
              vm.remoteInfo = { show: true, title: json.content.title };
              vm.remoteInfo.info =
                json.content.info == false || json.content.info == ""
                  ? { url: "", params: "", result: "" }
                  : json.content.info;
            } else {
              vm.$message({
                showClose: true,
                message: json.message,
                type: "error"
              });
            }
          }
        });
    },
    refuseClick: function(row) {
      var vm = this;
      this.$prompt("请输入拒绝理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(
        function(obj) {
          utils
            .fetch("/examine/renewrefuse", {
              method: "POST",
              body: "id=" + row.id + "&refuse=" + obj.value
            })
            .then(function(json) {
              if (typeof json != "undefined") {
                if (json.code == 0) {
                  vm.getData();
                } else {
                  vm.$message({
                    showClose: true,
                    message: json.message,
                    type: "error"
                  });
                 }
              }
             });
         },
        function(obj) {
          console.log(obj);
        }
      );
    },
    authCheck: function(tag) {
      return utils.authCheck(this, tag);
     }

  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
      utils.getTingYunScript();
      var hasParams = utils.hasRouteParams(vm.$route.params);
      if (hasParams) {
        vm.getData();
        return;
      }
      var data = utils.getCache();
      var obj = data == "" ? {} : JSON.parse(data);
      if (obj.tableData && obj.tableData.length > 0) {
        utils.getCacheItem(vm, obj);
      } else {
        vm.getData();
      }
    });
  }
};
 </script>
 <style scoped>
    .el-form-item{
        margin-bottom: 12px;
    }

.el-form-item {
  margin-bottom: 12px;
}
 </style>

