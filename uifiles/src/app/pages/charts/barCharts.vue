<template>
  <div :id="id" class="pie-charts">
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
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            title: {
                left: 'center',
                text: that.title,
                top: 10
            },
            color: ['#87c7e9','#dcf1d3','#d5b4fa',],
            legend: {
                data: ['固定车', '临时车'],
                top: 30
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            yAxis:  {
                type: 'value'
            },
            xAxis: {
                type: 'category',
                data: ['周一','周二','周三','周四','周五','周六','周日']
            },
            series: [
                {
                    name: '固定车',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    data: [320, 302, 301, 334, 390, 330, 320]
                },
                {
                    name: '临时车',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    data: [120, 132, 101, 134, 90, 230, 210]
                }
            ]
        };

        myChart.setOption(option);
    },
  }

}
</script>
