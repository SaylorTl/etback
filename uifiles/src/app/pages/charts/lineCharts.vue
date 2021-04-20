<template>
  <div :id="id" class="line-charts">
  </div>
</template>
<script>
import echarts from "echarts"

export default {
  name: "pieCharts",
  props: ['id','data','title','color'],
  data:function(){
    return {

    }
  },
  mounted:function(){
    this.chartRender();
  },
  watch: {
    data:function(curVal,oldVal){
      this.chartRender();
    }
  },
  methods: {
    chartRender:function(){
      if(this.data.length <1 ) return;
      var that = this;
      var myChart = echarts.init(document.getElementById(that.id));

      // var base = +new Date(1968, 9, 3);
      // var oneDay = 24 * 3600 * 1000;
      //
      // var date = [];
      //
      // var data = [Math.random() * 300];
      //
      // for (var i = 1; i < 100; i++) {
      //     var now = new Date(base += oneDay);
      //     date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
      //     data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
      // }

      var date = [],data = [];
      for(var i = 0; i< this.data.length; i++){
        data.push( Number(this.data[i].income) );
        date.push( this.data[i].daytime );
      }


      var option = {
          tooltip: {
              trigger: 'axis',
              position: function (pt) {
                  return [pt[0], '10%'];
              }
          },
          title: {
              left: 'center',
              text: that.title,
              top: 10
          },
          color: ['#d5b4fa','#87c7e9','#dcf1d3'],
          xAxis: {
              type: 'category',
              boundaryGap: false,
              data: date
          },
          yAxis: {
              // type: 'value',
              // boundaryGap: [0, '100%'],
              // axisLabel: {
              //     formatter: '{value/1000}'
              // }
              // position:'left'
              // show: false
              offset: -20
          },
          series: [
              {
                  name:that.name,
                  type:'line',
                  smooth:true,
                  symbol: 'none',
                  sampling: 'average',
                  itemStyle: {
                      normal: {
                          color: '#d5b4fa'
                      }
                  },
                  data: data,
                  areaStyle: {
                    normal: {
                        color: '#d5b4fa'
                    }
                  },
              },
          ]
      };
      myChart.setOption(option);
    },
  }

}
</script>
