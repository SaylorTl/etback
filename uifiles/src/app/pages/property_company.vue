<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.name" size="small" class="cell widthX150" placeholder="公司名称"></el-input>
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                    <el-button @click="findMe" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="resetMe" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportMe" size="small"><i class="el-icon-download"></i>导出</el-button>
                    <el-button @click="addMe" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="refresh" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="dataLoading" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="开户行信息:">
                                    <ul v-if="!!props.row.bank_account && !!props.row.bank_account.length > 0">
                                        <li v-for="(item,index) in props.row.bank_account" :key="index">
                                            <div>
                                                <span>开户银行：</span><span>{{item.bank}}</span><span style="padding-left:15px;">银行账号：</span><span>{{item.account}}</span><span style="padding-left:15px;">账户说明：</span><span>{{item.purpose}}</span>
                                            </div>
                                        </li>
                                    </ul>
                                    <span v-if="!props.row.bank_account">无</span>
                                </el-form-item>

                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID" width="50"></el-table-column>
                    <el-table-column prop="name" label="公司名称" min-width="90"></el-table-column>
                    <el-table-column prop="abb_name" label="公司别名" min-width="100"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="160"></el-table-column>
                    <el-table-column prop="station_num" label="停车场个数" width="100"></el-table-column>
                    <el-table-column prop="linkman" label="联系人" min-width="110"></el-table-column>
                    <el-table-column prop="mobile" label="联系电话" min-width="110"></el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="editMe(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                            <el-button @click="deleteMe(scope.row)" plain size="mini"><i class="fa fa-trash-o"></i>删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="propertyInfo.title" :visible.sync="propertyInfo.isShow" :close-on-click-modal="false" :close-on-press-escape="false">
                <el-form ref="propertyForm" :model="propertyInfo.form" label-width="120px">
                    <el-form-item label="公司名称:">
                        <el-input v-model.trim="propertyInfo.form.name" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="公司简称:">
                        <el-input v-model.trim="propertyInfo.form.abb_name" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="停车场:">
                        <div>
                            <el-input type="textarea" v-model.trim="stationStr" :rows="2" @focus="showTree('stations')" readonly placeholder="请添加停车场"></el-input>
                            <my-tree-department :show="propertyInfo.stations.show" v-model="propertyInfo.stations.value" @clear="clearTree('stations')" @close="closeTree('stations')" :level="3"></my-tree-department>
                        </div>
                    </el-form-item>
                    <el-form-item label="联系人:">
                        <el-input v-model.trim="propertyInfo.form.linkman" size="small"></el-input>
                    </el-form-item>

                    <el-form-item label="电话:">
                        <el-input v-model.trim="propertyInfo.form.mobile" size="small"></el-input>
                    </el-form-item>
                    <div v-for="(item,index) in accountInfo" :key="index">
                        <el-form-item label="开户行:">
                            <el-input v-model.trim="accountInfo[index].bank" size="small"></el-input>
                        </el-form-item>

                        <el-form-item label="银行账号:">
                            <el-input v-model.trim="accountInfo[index].account" size="small"></el-input>
                        </el-form-item>

                        <el-form-item label="账户用途:">
                            <el-input v-model.trim="accountInfo[index].purpose" type="textarea" :rows="2" size="small"></el-input>
                        </el-form-item>
                    </div>
                    <el-form-item style="text-align:center;">
                        <el-button type="warning" size="small" style="width:48%;" icon="el-icon-plus" @click="addAccount" :disabled="accountDisabled">增加开户行</el-button>
                        <el-button type="warning" size="small" style="width:48%;" icon="el-icon-minus" @click="deleteAccount" :disabled="accountInfo.length === 1">删除开户行</el-button>
                    </el-form-item>
                    <el-form-item style="text-align:right;">
                        <el-button @click="submit" type="primary" size="small" :loading='propertyInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>

<script>
import utils from "../../utils/utils.js";
import moment from 'moment';
export default {
  name: "property_company",
  data() {
    return {
      accountInfo: [],
      tableData: [],
      dataLoading: false,
      pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
      search: {
        name: "",
        station: ""
      },
      propertyInfo: {
        title: "",
        isShow: false,
        saveloading: false,
        stations: { show: false, value: [] },
        form: {
          name: "",
          abb_name: "",
          station_id: "",
          linkman: "",
          mobile: "",
          bank_account: ""
        }
      },
      bank: "",
      account: "",
      purpose: "",
      nowData: {}
    };
  },
  created() {
    let item = {
      bank: "",
      account: "",
      purpose: ""
    };
    this.accountInfo.push(item);
  },
  computed: {
    stationStr() {
      let data = this.stationUnique();
      let StionIds = data.map(item => {
        return item.value.toString().substring(6);
      });
      this.propertyInfo.form.station_id = StionIds.join(",");
      return this.concatResult(data, "name");
    },
    accountDisabled() {
      return !this.accountInfo.every(item => {
        return !!item.bank && !!item.account && !!item.purpose;
      });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      utils.getTingYunScript();
      let data = utils.getCache();
      let obj = data == "" ? {} : JSON.parse(data);
      if (obj.tableData && obj.tableData.length > 0) {
        utils.getCacheItem(vm, obj);
      } else {
        vm.getData();
      }
    });
  },
  methods: {
    showTree(val) {
      this.closeAllTree();
      this.propertyInfo[val].show = true;
    },
    closeTree(val) {
      this.propertyInfo[val].show = false;
    },
    clearTree(val) {
      this.propertyInfo[val].value = "";
    },
    closeAllTree() {
      this.propertyInfo.stations.show = false;
    },

    concatResult: function(data, val) {
      return data.map(i => i[val]).join(",");
    },
    stationUnique() {
      let data = [];
      let lists = this.propertyInfo.stations.value;
      if (lists.length > 0) {
        for (let i in lists) {
          if (lists[i].level == 3) {
            data.push({ value: lists[i].value, name: lists[i].name });
          }
        }
      }
      return data;
    },
    findMe() {
      this.pagination.page = 1;
      this.getData();
    },
    resetMe() {
      this.search = { name: "", station: "" };
      this.getData();
    },
    editMe(itemData) {
      if(itemData){
      this.nowData = itemData;
      this.propertyInfo.form = itemData;
      this.accountInfo = itemData.bank_account;
      this.propertyInfo.stations = {show: false, value: []};
      if (itemData.station_id) {
        this.getRowStation(itemData.station_id).then(data => {
          if (typeof data != "undefined") {
            this.propertyInfo.stations.value = data.map(item => {
              return {
                name: item.name,
                value: utils.config.ID_PREFIX + item.value - 0,
                level: item.level
              };
            }); //加前缀，编辑时勾选状态
          }
        });
      }
      this.propertyInfo.form.id = itemData.id;
      this.propertyInfo.title = "物业公司修改";
      this.propertyInfo.isShow = true;
      }
    },
    deleteMe(itemData) {
      this.$msgbox({
        title: "提示",
        message: "您确定要删除 “" + itemData.name + "”物业公司吗？",
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "正在删除...";
            utils
              .fetch("/property/delete", { method: "post",body:{id:itemData.id} })
              .then((json) =>{
                if (typeof json != "undefined") {
                  if (json.code == 0) {
                    this.getData();
                  } else {
                    this.$message({
                      showClose: true,
                      message: json.message,
                      type: "error"
                    });
                  }
                }
              });
            instance.confirmButtonLoading = false;
            done();
          } else {
            done();
          }
        }
      });
    },
    addMe() {
      this.propertyInfo.title = "物业公司添加";
      this.propertyInfo.form = {
                    name: "",
          abb_name: "",
          station_id: "",
          linkman: "",
          mobile: "",
          bank_account: ""
                };
      this.accountInfo = [{bank: "",
      account: "",
      purpose: ""}];
      this.propertyInfo.stations.value = [];
      this.propertyInfo.isShow = true;
      this.nowData = {};
    },
    exportMe(){
        var that = this;
        var obj ={
          page: 1,
          pagesize: 9999,
          name: that.search.name,
          station_id: that.search.station
        }
        var param = utils.setQueryString(obj)
        var filename = moment().format('YYYYMMDD') + '物业公司表.xls';
        utils.rpc.loadfile('/property/export?'+ param, null, filename).then(function(data){

        })
    },
    addAccount() {
      this.accountInfo.push({
        bank: "",
        account: "",
        purpose: ""
      });
    },
    deleteAccount() {
      if (this.accountInfo.length > 1) {
        this.accountInfo.pop();
      } else {
      }
    },
    refresh() {
      this.getData();
    },
    setPageData: function(pageObj) {
      this.pagination = pageObj;
      this.getData();
    },
    getData() {
      let vm = this;
      let url =
        "/property/lists?page=" +
        vm.pagination.page +
        "&pagesize=" +
        vm.pagination.pagesize;
      let { station: station_id, name: name, ...others } = vm.search;
      let searchmap = { station_id, name, ...others };
      let querystr = utils.setQueryString(searchmap);
      url += querystr ? "&" + querystr : "";
      vm.dataLoading = true;
      utils.fetch(url).then(json => {
        vm.tableData =
          typeof json != "undefined" && json.code == 0
            ? json.content.lists
            : [];
        vm.pagination.total =
          typeof json != "undefined" && json.code == 0 ? json.content.total : 0;
        utils.setCache(vm);
        vm.dataLoading = false;
      });
    },
    submit() {
      let formatAccount = this.accountInfo.filter(item => {
        return !!item.bank && !!item.account && !!item.purpose;
      });
      this.propertyInfo.form.bank_account = JSON.stringify(formatAccount);
      let url = "/property/";
      if (!!this.nowData.id) {
        url += "update";
      } else {
        url += "add";
      }
      if (!this.checkForm()) {
        return;
      } else {
        this.propertyInfo.saveloading = true;
        utils
          .fetch(url, {
            method: "post",
            body: this.propertyInfo.form
          })
          .then(json => {
            this.propertyInfo.saveloading = false;
            if (typeof json != "undefined") {
              if (json.code == 0) {
                this.getData();


                this.propertyInfo.isShow = false;
              } else {
                this.$message({
                  showClose: true,
                  message: json.message,
                  type: "error"
                });

              }

            }
          }).catch(err => {
              this.$message({
                  showClose: true,
                  message: '请求错误',
                  type: "error"
                });
          })
      }
    },
    getRowStation: function(str) {
      return utils
        .fetch("/station/lists?station_ids=" + str + "&page=0&pagesize=0")
        .then(function(json) {
          if (typeof json != "undefined" && json.code == 0) {
            var data = [];
            if (json.content) {
              data = json.content.lists.map(function(k) {
                return { value: k.id, name: k.name, level: 3 };
              });
            }
            return data;
          }
        });
    },
    checkForm() {
      let formatAccount = this.accountInfo.filter(item => {
        return !!item.bank && !!item.account && !!item.purpose;
      });
      if (!this.propertyInfo.form.name) {
        this.$message({
          showClose: true,
          message: "请输入物业公司名称",
          type: "error"
        });
        return false;
      }else if (!this.propertyInfo.form.linkman) {
        this.$message({
          showClose: true,
          message: "请输入联系人",
          type: "error"
        });
        return false;
      } else if (!this.propertyInfo.form.mobile) {
        this.$message({
          showClose: true,
          message: "请输入联系电话",
          type: "error"
        });
        return false;
      } else if (formatAccount.length === 0) {
        this.$message({
          showClose: true,
          message: "请至少关联一个开户行",
          type: "error"
        });
        return false;
      } else if (
        !/^1[3,5,7,8]{1}[0-9]{1}[0-9]{8}$/.test(this.propertyInfo.form.mobile)
      ) {
        this.$message({
          showClose: true,
          message: "联系电话格式有误",
          type: "error"
        });
        return false;
      } else {
        return true;
      }
    }
  }
};
</script>
