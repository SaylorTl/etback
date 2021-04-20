
<template>
    <div id='box' class="menu-hide">
        <div class='worker inlists computer'>
            <div class='mainbox'>
                  <div class="computer-top">
                    <div class="heightX60">
                    <my-select-station v-model="chartOneStation" size="small" class="cell widthX150 left"  placeholder="停车场" ></my-select-station>
                    <el-date-picker v-model="tableTime" size="small" class="cell"  width='150px' type="month" placeholder="选择月" value-format="yyyy-MM"></el-date-picker>
                    </div>
                    <div v-show="ech1noData" class="computer-top-nodata">暂无数据</div>
                    <div v-show="!ech1noData" ref="echarts1" class="computer-top-charts"></div>
                  </div>
            <div class="computer-content">
                <el-table
                :data="lists"
                border
                class="widthP100 text-center"  >
                <el-table-column
                  prop="day"
                  label="日期"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="CZY_inc"
                  label="双乾实收"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="CZY_rec"
                  label="双乾应收" width="120">
                </el-table-column>
                <el-table-column
                  prop="WECHAT_inc"
                  label="微信实收"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="WECHAT_rec"
                  label="微信应收" width="120">
                </el-table-column>
                <el-table-column
                  prop="APARCAR_inc"
                  label="审批实收"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="APARCAR_rec"
                  label="审批应收" width="120">
                </el-table-column>
                <el-table-column
                  prop="LOCAL_inc"
                  label="本地现金实收"
                  width="122">
                </el-table-column>
                <el-table-column
                  prop="LOCAL_rec"
                  label="本地现金应收" >
                </el-table-column>
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
                chartOneStation:'',
                ech1noData: true,
                lists:[]
            }

        },
        watch:{
            chartOneStation:function(){
                this.chart1();
            },
            tableTime:function(){
                this.chart1();
            }
        },
        methods:{
            chart1:function(){
                var vm = this;
                this.ech1noData=true;
                var url = "/report/stationcharts?page=1&pagesize=9999";
                if( vm.chartOneStation ) url+="&station="+vm.chartOneStation;
                if( vm.tableTime ) url+="&month="+ vm.tableTime;
                utils.fetch(url).then(function(res){
                    if( res.code ==0 ){
                        if( !res.content ){
                            return;
                        }
                 var list = res.content;
                 var lists = [];
                 var month = res.content.month;
                 if(list.APARCAR&&list.APARCAR.length>0){
                    this.ech1noData=false;
                    for(var i in list.APARCAR){
                        lists.push({
                           'day': month+'-'+list.APARCAR[i]['day'] ,
                           'APARCAR_inc': list.APARCAR[i]['APARCAR_inc'],
                           'APARCAR_rec': list.APARCAR[i]['APARCAR_rec'],
                           'CZY_inc': list.CZY[i]['CZY_inc'],
                           'CZY_rec': list.CZY[i]['CZY_rec'],
                           'WECHAT_inc': list.WECHAT[i]['WECHAT_inc'],
                           'WECHAT_rec': list.WECHAT[i]['WECHAT_rec'],
                           'LOCAL_inc': list.LOCAL[i]['LOCAL_inc'],
                           'LOCAL_rec': list.LOCAL[i]['LOCAL_rec'],
                        })
                    }
                    vm.lists=lists;
                 }
                 var day = res['content']['day'] ;
                 var temp_czy = res['content']['CZY'];
                 var temp_wechat = res['content']['WECHAT'];
                 var temp_local = res['content']['LOCAL'];
                 var temp_aparcar = res['content']['APARCAR'];
                 var CZY_rec = [];
                 var CZY_inc = [];
                 var WECHAT_rec = [];
                 var WECHAT_inc = [];
                 var LOCAL_rec = [];
                 var LOCAL_inc = [];
                 var APARCAR_rec = [];
                 var APARCAR_inc = [];
                 for ( var item in temp_czy ){
                    CZY_rec.push( temp_czy[item]['CZY_rec'] );
                    CZY_inc.push( temp_czy[item]['CZY_inc'] );
                 }
                 for ( var item in temp_wechat ){
                    WECHAT_rec.push( temp_wechat[item]['WECHAT_rec'] );
                    WECHAT_inc.push( temp_wechat[item]['WECHAT_inc'] );
                 }
                 for ( var item in temp_local ){
                    LOCAL_rec.push( temp_local[item]['LOCAL_rec'] );
                    LOCAL_inc.push( temp_local[item]['LOCAL_inc'] );
                 }
                 for ( var item in temp_aparcar ){
                    APARCAR_rec.push( temp_aparcar[item]['APARCAR_rec'] );
                    APARCAR_inc.push( temp_aparcar[item]['APARCAR_inc'] );
                 }

                 var chart_name = "停车场";
                 var option = {
                    tooltip : {
                        trigger: 'axis',
                        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    title : {
                            text: '停车场月收入详情',

                        },
                    dataZoom:{show:true,realtime:true,start:30,end:60,bottom:'15%'},
                    legend: {
                        data:['双乾应收','微信应收','本地现金应收','审批应收','双乾实收','微信实收','本地现金实收','审批实收'],
                        bottom: 0
                    },
                    grid: {
                        left: '2%',
                        right: '3%',
                        bottom: '25%',
                        containLabel: true
                    },
                    xAxis : [
                        {
                            type : 'category',
                            data : day
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value'
                        }
                    ],
                    series : [
                        {
                            name:'双乾应收',
                            type:'bar',
                            stack: 'one',
                            data:CZY_rec
                        },
                        {
                            name:'微信应收',
                            type:'bar',
                            stack: 'one',
                            data:WECHAT_rec
                        },
                        {
                            name:'本地现金应收',
                            type:'bar',
                            stack: 'one',
                            data:LOCAL_rec
                        },
                        {
                            name:'审批应收',
                            type:'bar',
                            stack: 'one',
                            data:APARCAR_rec
                        },
                        {
                            name:'双乾实收',
                            type:'bar',
                            stack: 'two',
                            data:CZY_inc,
                        },
                        {
                            name:'微信实收',
                            type:'bar',
                            stack: 'two',
                            data:WECHAT_inc
                        },
                        {
                            name:'本地现金实收',
                            type:'bar',
                            stack: 'two',
                            data:LOCAL_inc
                        },
                        {
                            name:'审批实收',
                            type:'bar',
                            stack: 'two',
                            data:APARCAR_inc
                        },

                    ]
                };
                    var myChart = echarts.init(vm.$refs.echarts1);
                    myChart.setOption(option);
                }
            });
        },

      },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.chart1();
            });
        },
    }

</script>
