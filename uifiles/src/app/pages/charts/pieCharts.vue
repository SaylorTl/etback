<template>
  <div :id="id" class="pie-charts">
    pieCharts
  </div>
</template>
<script>
import echarts from "echarts"

export default {
  name: "pieCharts",
  props: ['id','data','title'],
  data:function(){
    return {

    }
  },
  mounted:function(){
    this.chartRender();
  },
  methods: {
    chartRender:function(){
      var that = this;
      var myChart = echarts.init(document.getElementById(that.id));
      var option = {
        title: {
          text: that.title,
          x:'center',
          top: 10
        },
        visualMap: {
            show: false,
            min: 80,
            max: 600,
            inRange: {
                colorLightness: [0, 1]
            }
        },
        color: ['#dcf1d3','#87c7e9','#d5b4fa','#dcf1d3'],
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // toolbox: {
        //     show : true,
        //     feature : {
        //         mark : {show: true},
        //         dataView : {show: true, readOnly: false},
        //         magicType : {
        //             show: true,
        //             type: ['pie', 'funnel']
        //         },
        //         restore : {show: true},
        //         saveAsImage : {show: true}
        //     }
        // },
        calculable : true,
        series : [
            {
                name: that.title,
                type: 'pie',
                radius: '55%',
                data: that.data,
                roseType: 'angle',
                label: {
                    normal: {
                        textStyle: {
                            color: 'rgba(0, 0, 0, 0.7)'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: 'rgba(0, 0, 0, 0.3)'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgba(134,200,232,0.8)',
                        shadowBlur: 200,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
          ]
        };

        myChart.setOption(option);
    },
  }

}
</script>
