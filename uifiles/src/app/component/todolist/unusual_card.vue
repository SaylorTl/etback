<template>
  <div>
    <div class="header">
      <span>
        当前有
        <span class="total">{{ total }}</span>条本地异常记录,请尽快处理！
      </span>
      <span>
        <!-- <el-date-picker v-model="beginTime" type="date" placeholder="选择开始日期" value-format="yyyy-MM-dd"></el-date-picker>
        <el-date-picker v-model="endTime" type="date" placeholder="选择结束日期" value-format="yyyy-MM-dd"></el-date-picker>
        <el-button @click="handleSearch" size="small">
          <i class="el-icon-search icon-font"></i>搜索
        </el-button>-->
        <el-button @click="exportTabel" size="small">
          <i class="el-icon-upload icon-font"></i>导出
        </el-button>
      </span>
    </div>
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="station_name" label="停车场"></el-table-column>
      <el-table-column prop="plate" label="车牌"></el-table-column>
      <el-table-column prop="vd_begin_time" label="本地开始时间"></el-table-column>
      <el-table-column prop="vd_end_time" label="本地结束时间"></el-table-column>
      <el-table-column prop="vd_rule_name" label="本地月卡规则"></el-table-column>
      <el-table-column prop="et_begin_time" label="EP开始时间"></el-table-column>
      <el-table-column prop="et_end_time" label="EP结束时间"></el-table-column>
      <el-table-column prop="et_rule_name" label="EP月卡规则"></el-table-column>
      <el-table-column prop="remark" label="异常原因"></el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[10,20,50,100]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      class="pagination"
    ></el-pagination>
  </div>
</template>

<script>
import utils from "../../../utils/utils.js";
export default {
  name: "UnusualCard",
  data() {
    return {
      tableData: [],
      page: 1,
      pagesize: 20,
      total: 0,
      loading: false,
      beginTime: "",
      endTime: ""
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    handleSizeChange(val) {
      this.pagesize = val;
      this.handleSearch();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.handleSearch();
    },
    getTableData() {
      this.loading = true;
      this.handleDate();
      let url = `/abnormalcontract/lists?page=${this.page}&pagesize=${this.pagesize}`;
      if (this.beginTime) {
        url = `${url}&creation_begin_time=${this.beginTime}`;
      }
      if (this.endTime) {
        url = `${url}&creation_end_time=${this.endTime}`;
      }
      utils.fetch(url).then(res => {
        this.loading = false;
        if (res && res.code === 0 && typeof res.content === "object") {
          this.tableData = res.content.lists || [];
          this.total = res.content.total;
        } else {
          this.tableData = [];
          this.total = 0;
        }
      });
    },
    exportTabel() {
      this.handleDate();
      this.$confirm(`确认导出当天的异常月卡信息吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let url = `/abnormalcontract/export`;
          if (this.beginTime) {
            url = `${url}&creation_begin_time=${this.beginTime}`;
          }
          if (this.endTime) {
            url = `${url}&creation_end_time=${this.endTime}`;
          }

          utils.fetch(url).then(res => {
            if (res && res.code === 0) {
              this.$message({
                message: res.message,
                type: "success"
              });
            } else {
              this.$message.error("导出失败");
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消导出"
          });
        });
    },
    handleSearch() {
      this.getTableData();
    },
    handleDate() {
      let today = Date.now(),
        beginTime = "",
        endTime = "";
      if (this.beginTime) {
        beginTime = Date.parse(this.beginTime);
        if (beginTime > today) {
          this.beginTime = "";
        }
      }
      if (this.endTime) {
        endTime = Date.parse(this.endTime);
        if (endTime > today) {
          this.endTime = "";
        }
      }

      if (this.beginTime && this.endTime && beginTime > endTime) {
        this.beginTime = this.endTime;
      }
    }
  }
};
</script>

<style scoped>
.pagination {
  text-align: center;
}
.header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  font-size: 14px;
}
.total {
  color: red;
}
.icon-font {
  font-size: 16px;
}
</style>