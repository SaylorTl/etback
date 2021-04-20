
<template>
    <div id='box' class="menu-hide"  ><!-- v-loading.fullscreen.lock="fullscreenLoading"  -->
        <div class='worker inlists computer'>
              <div class='mainbox'>
                  <div class=".computer-top">
                    <div class="heightX60" >
                    <!-- <el-input v-model="dept.name"  size="small" class="cell" class="widthX150"  @focus="dailogSelectDeptShow" trigger-on-focus=false suffix-icon="el-icon-more" placeholder="请选择所属事业部"></el-input>
                    <my-select-department v-if="deptloading" @change="dailogSelectDeptChang" @close="dailogSelectDeptClose" :style="{left:'0px'}"></my-select-department>
                   -->
                    <my-linkage-dept v-model="dept" ></my-linkage-dept>
                    <el-date-picker v-model="tableTime" size="small" class="cell"  width='150px' type="month" placeholder="选择月"></el-date-picker>
                    </div>
                    <div ref="echarts1" class="computer-top-charts" v-show="datatip"></div>
                    <div class="computer-top-nodata" v-show="messagetip" >
                      暂无数据
                    </div>
                  </div>
              <div class="computer-content"  v-show="datatip">
                <el-table :data="lists" style="width: 100%" height="500">
                  <el-table-column prop="station" label="停车场"></el-table-column>
                  <el-table-column prop="firstamount" :label="day[0]+'月月收入'"></el-table-column>
                  <el-table-column prop="secamount" :label="day[1]+'月月收入'"></el-table-column>
                  <el-table-column prop="thirdamount" :label="day[2]+'月月收入'"></el-table-column>
                </el-table>
              </div>
              </div>
          </div>
        </div>
</template>
<script>
    import echarts from "echarts";
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                tableTime:'2017-10',
                dept:2,
                lists:[],
                deptloading:false,
                fullscreenLoading: true,
                day:[],
                messagetip:false,
                datatip:false
            }

        },
        watch:{
            dept:function(){
                this.chart1();
            },
            tableTime:function(){
                this.chart1();
            }
        },
        methods:{
            chart1:function(){
                var vm = this;
                var url = "/report/deptcharts?page=1&pagesize=9999";
                if( vm.dept) url+="&dept="+vm.dept;
                if( vm.tableTime ) url+="&month="+ vm.tabletimeParse( vm.tableTime );
                utils.fetch(url).then(function(res){
                    if( res.code ==0 ){
                        if( !res.content ){
                            return;
                        }
                       var content = res.content;

                       var series1 = [];
                       var series2 = [];
                       var series3 = [];
                       var day = [];
                       var xAxis = [];
                       var lists = [];
                       for( var i in content ){
                        if( i%3==0 ){
                          var data1 = content[i]['total'];
                          var month1 = content[i]['month'];
                          series1.push( data1 );
                        }else if( i%3==1 ){
                          var data2 = content[i]['total'];
                          var month2 = content[i]['month'];
                          series2.push( data2 );
                        }else if( i%3==2){
                          var data3 = content[i]['total'];
                          var month3 = content[i]['month'];
                          series3.push( data3 );
                          xAxis.push( content[i]['station'] );
                        }
                       }
                      day.push( month1,month2,month3 );
                      if( series1 ){
                        for( var i in series1 ){
                            lists.push(
                             {'station':xAxis[i],
                             'firstamount':series1[i],
                             'secamount' :series2[i],
                             'thirdamount':series3[i],
                             });
                        }
                      }
                      vm.lists = lists;
                      vm.day = day;
                      vm.fullscreenLoading = false;
                      vm.datatip = true;
                      vm.messagetip = false;
                var option = {
                title : {
                    text: '停车场月收入对比',
                },
                tooltip : {
                    trigger: 'axis'
                },
                legend: {
                    data:[]
                },
                dataZoom:{show:true,realtime:true,start:40,end:60,bottom:'0'},
                grid: {
                        left: '2%',
                        right: '3%',
                        containLabel: true
                    },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        data : xAxis
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {name:month1+'月',type:'bar',data:series1,},
                    {name:month2+'月',type:'bar',data:series2,},
                    {name:month3+'月',type:'bar',data:series3,}
                ]
            };
             var myChart = echarts.init(vm.$refs.echarts1);
             var legend = {data:[month1+'月',month2+'月',month3+'月']};
                     option.legend = legend;
                    myChart.setOption(option);
                }else{
                 vm.messagetip = true;
                 vm.datatip = false;

                }
            });
       },
        dailogSelectDeptChang:function(obj){
                this.dept = obj;
                this.dailogSelectDeptClose();
            },
        dailogSelectDeptClose:function(){
                this.deptloading = false;
            },
        dailogSelectDeptShow:function(){
                this.deptloading = this.deptloading ? false : true;
            },
        tabletimeParse:function(time){
            if( typeof(time) == 'string') time = new Date(time);
            var y = time.getFullYear();
            var m = time.getMonth() + 1;
            m = m > 9 ? m : "0"+m;
            return y.toString() +'-'+ m;
        },
        openFullScreen:function() {
            this.fullscreenLoading = true;
            setTimeout(function(){
                    this.fullscreenLoading = false;
            }, 2000);
        }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.chart1();
            });
        },
    }

</script>
