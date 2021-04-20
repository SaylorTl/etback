<template>
  <div class="rank-charts-box" style="padding: 14px;">
    <span class="rank-charts-title">{{this.title}}</span>
    <hr>
    <el-row class="rank-table-title">
      <el-col class="rank-name" :span="(data.index? (index==0 ? 6 : 18/(xLen.length - 1) ) : 18/xLen.length)" :key="index" v-for="(title,index) in data.xAlias">
        {{title}}
      </el-col>
    </el-row>
    <el-row  v-for="(dataY,index) in data.yAlias"  :key="index" class="mt5">
      <el-col v-if="data.index" :span="6">
        <span class="rank-item">{{index+1}}</span>
      </el-col>
      <el-col class="rank-text" :span="data.index?18/(xLen.length - 1):24/xLen.length" v-for="(title,index) in dataY"  :key="index">
        {{title}}
      </el-col>
    </el-row>
  </div>
</template>
<script>

export default {
  name: "pieCharts",
  props: ['id','data','title'],
  data:function(){
    return {
      xLen: this.data.xAlias
    }
  },
  mounted:function(){
    // this.chartRender();
  },
  methods: {

  }

}
</script>
<style media="screen">
.rank-charts-box hr{
  border: none;
  border-top: 1px solid #f1f1f1;
}
.rank-item{
  background: #29e;
  color: #fff;
  display: inline-block;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  border-radius: 50%;
}
.rank-name{
  color: #555;
}
.rank-text{
  color: #777;
}
</style>
