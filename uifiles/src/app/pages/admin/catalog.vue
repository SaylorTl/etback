
<template>

    <div id='box' class="menu-hide catalog">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model="search.name" size="small" class="cell widthX150"  placeholder="名称"></el-input>
                    <el-input v-model="search.path" size="small" class="cell widthX150"  placeholder="路径"></el-input>
                    <el-select v-model="search.title" filterable clearable size="small" class="cell widthX100" placeholder="分组">
                        <el-option v-for="k in collect.lists" :key="k.id" :label="k.title" :value="k.id"></el-option>
                    </el-select>
                    <el-select v-model="search.type" filterable clearable size="small" class="cell widthX100" placeholder="类型">
                        <el-option label="前端路由" value="1"></el-option>
                        <el-option label="后端接口" value="2"></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="collectClick" size="small"><i class="fa fa-users"></i>分组</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column label="图标" width="40">
                        <template slot-scope="scope">
                            <i :class="scope.row.icon"></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="名称" width="120"></el-table-column>
                    <el-table-column prop="path" label="路径" width="220"></el-table-column>
                    <el-table-column prop="title" label="分组" width="60"></el-table-column>
                    <el-table-column prop="type" label="类型" width="65">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type == '1'" class="green">前端路由</span>
                            <span v-if="scope.row.type == '2'">后端接口</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="是否显示" width="60">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.type == '1' && scope.row.is_display == '1'" type="primary">是</el-tag>
                            <el-tag v-if="scope.row.type == '1' && scope.row.is_display == '0'" type="success">否</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="top" label="默认顶部" width="65">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.type == '1' && scope.row.is_display == '1' && scope.row.top == '1'" type="primary">是</el-tag>
                            <el-tag v-if="scope.row.type == '1' && scope.row.is_display == '1' && scope.row.top == '0'" type="success">否</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="排序" width="40">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type == '1' && scope.row.is_display == '1'">{{scope.row.order}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="top" label="忽略检测" width="65">
                        <template slot-scope="scope">
                            <span v-if="scope.row.skip_check == '1'" class="red">是</span>
                            <span v-if="scope.row.skip_check == '0'">否</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="tag_names" label="关联权限"></el-table-column>
                    <el-table-column label="操作" fixed="right" width="170">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.$index,scope.row)" plain type="success" size="mini"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                            <el-button @click="delClick(scope.$index,scope.row)" plain type="danger" size="mini"><i class="fa fa-trash-o"></i>删除</el-button>
                            <el-button @click="authClick(scope.$index,scope.row)" plain type="danger" size="mini"><i class="fa fa-key"></i>权限</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="edit.title" :visible.sync="edit.show">
                <el-form :model="edit.info" label-width="120px">
                    <el-form-item label="名称:">
                        <el-input v-model="edit.info.name" size="small" placeholder="请输入名称"></el-input>
                    </el-form-item>
                    <el-form-item label="路径:">
                        <el-input v-model="edit.info.path" size="small" placeholder="请输入路径"></el-input>
                    </el-form-item>
                    <el-form-item label="分组:">
                        <el-select v-model="edit.info.title" filterable clearable size="small" class="cell widthX100" placeholder="分组">
                            <el-option v-for="k in collect.lists" :key="k.id" :label="k.title" :value="k.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-select v-model="edit.info.type" size="small" class="cell widthX100" placeholder="状态">
                            <el-option label="前端路由" value="1"></el-option>
                            <el-option label="后端接口" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="忽略检测:">
                        <el-switch v-model="edit.info.skip_check" size="small" on-text="是" off-text="否"></el-switch>
                    </el-form-item>
                    <el-form-item v-if="edit.info.type == '1'" label="是否显示:">
                        <el-switch v-model="edit.info.is_display" size="small" on-text="是" off-text="否"></el-switch>
                    </el-form-item>
                    <template v-if="edit.info.type == '1' && edit.info.is_display == '1'">
                        <el-form-item label="默认顶部:">
                            <el-switch v-model="edit.info.top" size="small" on-text="是" off-text="否"></el-switch>
                        </el-form-item>
                        <el-form-item label="图标:">
                            <el-input v-model="edit.info.icon" size="small" placeholder="请输入图标样式"></el-input>
                        </el-form-item>
                        <el-form-item label="排序:">
                            <el-input-number v-model="edit.info.order" size="small" :min="0"></el-input-number>
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button @click="submitOk" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog :visible.sync="collect.show">
                <el-tag v-for="k in collect.lists" :key="k.id" type="success" :closable="true" :close-transition="false" @close="collectdelete(k.id)" class="ma5">{{k.title}}</el-tag>
                <el-input v-if="collect.input" v-model="collect.value" ref="saveTagInput" size="mini" @keyup.enter.native="collectAdd" @blur="collectAdd" class="catalog-input"></el-input>
                <el-button v-else size="small" @click="showCollectInput" class="catalog-btn">+ 新分组</el-button>
            </el-dialog>
            <el-dialog :title="auth.title" :visible.sync="auth.show" @close="closePriv">
                <el-form :model="auth.privileges">
                    <div v-for="(k,index) in auth.privileges" :key="index">
                        <div class="catalog-form">
                            <el-checkbox v-if="k.collect_id" v-model="auth.privileges[k.collect_id].ischecked" :indeterminate="auth.privileges[k.collect_id].indeterminate" @change="checkAllPriv($event,k.collect_id)" class="mb5">全选({{k.collect_name}})</el-checkbox>
                            <el-checkbox-group v-model="auth.privileges[k.collect_id].checked" >
                                <el-checkbox v-for="t in k.lists" :label="t.tag_id" :key="t.tag_id" @change="checkPriv($event,t.tag_id)" >{{t.tag_name}}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </div>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>

<script>
import utils from "../../../utils/utils.js";
export default {
  data: function() {
    return {
      shade: false,
      pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
      tableData: [],
      search: { name: "", path: "", title: "", type: "" },
      edit: {
        show: false,
        title: "",
        info: {
          name: "",
          path: "",
          title: "",
          icon: "",
          type: "",
          is_display: "",
          top: "",
          skip_check: "",
          order: ""
        }
      },
      collect: { show: false, input: false, value: "", lists: [] },
      auth: { show: false, title: "", id: "", tags: [], privileges: {} },
    };
  },
  created () {
      
  },
  methods: {
    getData: function() {
      var vm = this;
      var dat = "";
      if (this.search.name) dat += "&name=" + this.search.name;
      if (this.search.path) dat += "&path=" + this.search.path;
      if (this.search.title) dat += "&title_id=" + this.search.title;
      if (this.search.type) dat += "&type=" + this.search.type;
      var url =
        "/catalog/lists?page=" +
        vm.pagination.page +
        "&pagesize=" +
        vm.pagination.pagesize +
        dat;
      vm.shade = true;
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
    setPageData: function(pageObj) {
      this.pagination = pageObj;
      this.getData();
    },
    btnSearch: function() {
      this.pagination.page = 1;
      this.getData();
    },
    btnUndo: function() {
      this.search = { name: "", path: "", title: "", type: "" };
      this.getData();
    },
    addClick: function() {
      this.edit = {
        show: true,
        id: 0,
        title: "添加栏目",
        info: {
          name: "",
          path: "",
          title: "",
          icon: "",
          type: "",
          is_display: "",
          top: "",
          skip_check: "",
          order: ""
        }
      };
    },
    updateClick: function(index, row) {
      this.edit = {
        show: true,
        id: row.id,
        title: "栏目编辑",
        info: {
          name: row.name,
          path: row.path,
          title: row.title_id,
          icon: row.icon,
          type: row.type,
          is_display: "",
          top: "",
          skip_check: "",
          order: row.order
        }
      };
      this.edit.info.is_display = !!(parseInt(row.is_display) == 1);
      this.edit.info.top = !!(parseInt(row.top) == 1);
      this.edit.info.skip_check = !!(parseInt(row.skip_check) == 1);
    },
    delClick: function(index, row) {
      var vm = this;
      this.$msgbox({
        title: "提示",
        message: "您确定要删除 “" + row.name + "” (" + row.path + ")",
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        beforeClose: function(action, instance, done) {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "正在删除...";
            vm.delOk(index, row);
            instance.confirmButtonLoading = false;
            done();
          } else {
            done();
          }
        }
      });
    },
    delOk: function(index, row) {
      var vm = this;
      utils.fetch("/catalog/del?id=" + row.id).then(function(json) {
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
    submitOk: function() {
      var vm = this;
      var url = "";
      var info = vm.edit.info;
      var dat =
        "name=" +
        info.name +
        "&path=" +
        info.path +
        "&title_id=" +
        info.title +
        "&icon=" +
        info.icon +
        "&order=" +
        info.order;
      dat +=
        "&type=" +
        info.type +
        "&is_display=" +
        (info.is_display ? 1 : 0) +
        "&skip_check=" +
        (info.skip_check ? 1 : 0) +
        "&top=" +
        (info.top ? 1 : 0);
      if (this.edit.id) {
        url = "/catalog/update";
        dat += "&id=" + this.edit.id;
      } else {
        url = "/catalog/add";
      }
      utils.fetch(url, { method: "post", body: dat }).then(function(json) {
        if (typeof json != "undefined") {
          if (json.code == 0) {
            vm.getData();
            vm.edit.show = false;
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
    collectClick: function() {
      this.collect.show = true;
    },
    collectAdd: function() {
      var vm = this;
      if (this.collect.value != "") {
        utils
          .fetch("/catalog/titleadd", {
            method: "post",
            body: "name=" + vm.collect.value
          })
          .then(function(json) {
            if (typeof json != "undefined") {
              if (json.code == 0) {
                vm.getCollects();
              } else {
                vm.$message({
                  showClose: true,
                  message: json.message,
                  type: "error"
                });
              }
            }
            vm.collect.input = false;
            vm.collect.value = "";
          });
      } else {
        vm.collect.input = false;
        vm.collect.value = "";
      }
    },
    collectdelete: function(id) {
      var vm = this;
      utils.fetch("/catalog/titledel?id=" + id).then(function(json) {
        if (typeof json != "undefined") {
          if (json.code == 0) {
            vm.getCollects();
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
    showCollectInput: function() {
      this.collect.input = true;
      this.$nextTick(function() {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    getCollects: function() {
      var vm = this;
      utils.fetch("/catalog/titlelists").then(function(json) {
        if (typeof json != "undefined" && json.code == 0) {
          vm.collect.lists = json.content;
          return true;
        }
        return false;
      });
    },
    authClick: function(index, row) {  
      
      
      var vm = this;
      var tag = [];
      var tmp = row.tags.split(",");
      var name = row.name + "(" + row.path + ") 权限设置";
      if (row.tags) {
        for (var i in tmp) {
          tag.push(parseInt(tmp[i]));
        }
      }
      this.auth = {
        show: false,
        title: name,
        id: row.id,
        tags: tag,
        privileges: {}
      };
      
      vm.getPriv(tag).then((obj) => {
        if (typeof obj != "undefined") vm.auth.privileges = obj;
        vm.auth.show = true;
        
      });

    },
    closePriv: function() {

      this.getData();
    },
    checkAllPriv: function(checked, collect_id) {
      if (collect_id) {
        var box = this.auth.privileges[collect_id];
        var tags = [];
        if (box.lists.length > 0) {
          if (checked) {
            tags = this.auth.tags.concat();
            for (var i in box.lists) {
              if (this.auth.tags.indexOf(box.lists[i].tag_id) == -1)
                tags.push(box.lists[i].tag_id);
            }
          } else {
            var del = [];
            for (var i in box.lists) {
              if (this.auth.tags.indexOf(box.lists[i].tag_id) > -1)
                del.push(box.lists[i].tag_id);
            }
            tags = this.auth.tags.filter(function(k) {
              return del.indexOf(k) == -1 ? true : false;
            });
          }
          this.updatePriv(tags);
        }
      }
    },
    checkPriv: function(checked, tag_id) {
      if (tag_id) {
        var tags = [];
        if (checked) {
          tags = this.auth.tags.concat();
          if (this.auth.tags.indexOf(tag_id) == -1) tags.push(tag_id);
        } else {
          if (this.auth.tags.indexOf(tag_id) > -1) {
            for (var i in this.auth.tags) {
              if (this.auth.tags[i] != tag_id) tags.push(this.auth.tags[i]);
            }
          }
          
        }
        
        
        this.updatePriv(tags);
      }
    },
    updatePriv: function(tags) {
      var vm = this;
      utils
        .fetch("/catalog/update", {
          method: "POST",
          body: "id=" + vm.auth.id + "&tags=" + tags.join(",")
        })
        .then(function(json) {
          if (typeof json != "undefined") {
            if (json.code == 0) return true;
            vm.$message({ showClose: true, message: msg, type: "error" });
            return false;
          }
        })
        .then(function(result) {
          if (result) {
            vm.getPriv(tags).then(function(data) {
              if (typeof data != "undefined") {
                vm.auth.privileges = data;
                vm.auth.tags = tags;
              }
            });
          }
        });
    },
    getPriv: function(tags) {
      return utils.fetch("/privileges/lists").then(function(json) {
        if (typeof json != "undefined" && json.code == 0) {
          var data = {};
          for (var i in json.content) {
            var t = json.content[i];
            var collect = t.collect;
            if (typeof data[collect] == "undefined") {
              data[collect] = {
                collect_id: collect,
                collect_name: t.collect_name,
                indeterminate: false,
                ischecked: false,
                lists: [],
                checked: []
              };
            }
            data[collect].lists.push({
              tag_id: t.tag_id,
              tag_name: t.tag_name
            });
            if (utils.in_array(t.tag_id, tags))
              data[collect].checked.push(t.tag_id);
            data[collect].ischecked =
              data[collect].checked.length == data[collect].lists.length;
            data[collect].indeterminate =
              data[collect].checked.length > 0 &&
              data[collect].checked.length < data[collect].lists.length;
          }
          return data;
        }
      });
    },
  },
  watch:{
      
  },
  beforeRouteEnter: function(to, from, next) {
    next(function(vm) {
      vm.getCollects();
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
