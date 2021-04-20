<template>
    <div id="box" class="welcome">

        <div class='condition box-width clearfix'>
            <div class="left">
                <my-linkage-dept v-model="search.dept" type='2' v-loading='isLoading'></my-linkage-dept>
                 <my-select-station v-model="search.station" size="small" class="wel_station widthX120" placeholder="停车场" @select='select_station' v-loading='isLoading'></my-select-station>
                 <el-select v-model="search.date_type" size="small" class="cell widthX100"  clearable placeholder="周期">
                    <el-option  v-for="(v,k) in timeType" :key="k" :label="v" :value="k">
                    </el-option>
                </el-select>
                <el-date-picker v-model="search.datetime" size="small" type="date" placeholder="时间筛选(天/周)" class="widthX120" value-format="yyyy-MM-dd" :picker-options="pickerOpts"></el-date-picker>
                <el-date-picker v-model="search.month_date" size="small" type="month" placeholder="时间筛选(月)" class="widthX120" value-format="yyyyMM"></el-date-picker>
                <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
            </div>
            <div class="right">
                <el-button @click="_fire" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
            </div>
        </div>
        <div class="station_history" v-show='history_block'>
        	<ul>
        		<li>常用车场:</li>
        		<li v-for='(item,i) in station_history' :key="i">
        			<span @click = 'stationClick(item.id)'>{{item.name}}、</span>
        		</li>
        		<li>……</li>
        	</ul>
        </div>
        <!-- <div class="msgTips">
          <i class="fa fa-commenting"></i>
          <i class="fa fa-chevron-down"></i>
          <i class="fa fa-chevron-up"></i>
          当前车场开闸异常
        </div> -->
        <div class="newwrap" v-show='dataShow'>
        <section class='income_1'>
                <h3>临停收入 &amp; 月卡收入</h3>
                <div class="incomeBlock">
                    <ul>
                         <li>
                             <i class="fa fa-send-o"></i>
                             <span class="title">临停收入</span>
                             <span class='total'>共 <em class="num_font"
                             v-animate='parseInt(allData.charge.czy_temp)+parseInt(allData.charge.wechat_temp)+parseInt(allData.charge.ipos_temp)+parseInt(allData.charge.cash_temp)'></em> 元</span>
                         </li>
                         <li>
                             <i class="fa fa-credit-card"></i>
                             <span class="title">月卡收入</span>
                             <span class='total'>共 <em class="num_font" v-animate='parseInt(allData.charge.czy_month)+parseInt(allData.charge.wechat_month)+parseInt(allData.charge.ipos_month)+parseInt(allData.charge.cash_month)'></em> 元</span>
                         </li>
                    </ul>
                </div>
                <div class="more">
                    <router-link to='/order/payment'>
                        <i class="fa fa-angle-double-right"></i>
                    </router-link>
                </div>
            </section>
            <section class='income_1'>
                <h3>各来源收费统计</h3>
                <div class="incomeBlock">
                    <ul>
                         <li>
                             <i class="fa fa-wechat"></i>
                             <span class="title">微信收入</span>
                             <span class='total'>共 <em class="num_font" v-animate='parseInt(allData.charge.wechat_month)+parseInt(allData.charge.wechat_temp)'></em> 元</span>
                         </li>
                         <li>
                             <i class="fa fa-rss"></i>
                             <span class="title">iPos收入</span>
                             <span class='total'>共 <em class="num_font" v-animate='parseInt(allData.charge.ipos_month)+parseInt(allData.charge.ipos_temp)'></em> 元</span>
                         </li>
                         <li>
                             <i class="fa fa-mobile"></i>
                             <span class="title">APP收入</span>
                             <span class='total'>共 <em class="num_font" v-animate='parseInt(allData.charge.czy_month)+parseInt(allData.charge.czy_temp)'></em> 元</span>
                         </li>
                         <li>
                             <i class="fa fa-money"></i>
                             <span class="title">现金收入</span>
                             <span class='total'>共 <em class="num_font" v-animate='allData.charge.cash_temp'></em> 元</span>
                         </li>
                    </ul>
                </div>
                <div class="more">
                    <router-link to='/order/payment'>
                        <i class="fa fa-angle-double-right"></i>
                    </router-link>
                </div>
            </section>
            <section  class='today_inout'>
                <h3> 进场开闸总数 &amp;  出场开闸总数 </h3>
                <div class='inoutBlock inoutBlockAll'>
                    <ul>
                        <li>
                          <div class='num num_font color_8' v-animate='parseInt(allData.flow.arrival)'></div>
                            <div  class="numlist">
                               <dl>
                                   <dt>进场开闸总数</dt>
                                   <dd>
                                       <span class="record">{{parseInt(allData.flow.arrival)}} </span>
                                   </dd>
                               </dl>
                            </div>
                            <div class="more">
                                <router-link to='/inout/inlists'>
                                    <i class="fa fa-angle-double-right"></i>
                                </router-link>
                            </div>
                        </li>
                        <li>
                            <div class='num num_font color_7' v-animate='parseInt(allData.flow.departure)'>></div>
                            <div class="numlist">
                               <dl>
                                   <dt>出场开闸总数</dt>
                                   <dd>
                                       <span class="record">{{parseInt(allData.flow.departure)}}</span>
                                   </dd>
                               </dl>
                            </div>
                            <div class="more">
                                <router-link to='/inout/outlists'>
                                    <i class="fa fa-angle-double-right"></i>
                                </router-link>
                            </div>
                        </li>

                    </ul>
                </div>

            </section>
            <section  class='today_inout'>
                <h3>今日<span class="inlist">出场</span>异常</h3>
                <div class='inoutBlock'>
                    <ul>
                        <li>
                            <div class='num num_font color_3' v-animate='parseInt(allData.flow.exceptionOut)+parseInt(allData.flow.exceptionSystemOut)'></div>
                            <div  class="numlist">
                               <dl>
                                   <dt>异常总量</dt>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor3"><i class="fa fa-flash"></i></span>
                                       <span class="des">异常</span>
                                       <span class="record">{{parseInt(allData.flow.exceptionOut)+parseInt(allData.flow.exceptionSystemOut)}}</span>
                                   </dd>
                                   <!-- <dd>
                                       <span class="dd_icon icon_bgcolor2"><i class="fa fa-flag"></i></span>
                                       <span class="des">状态</span>
                                       <span class="record"> </span>
                                   </dd> -->
                               </dl>
                            </div>
                        </li>
                        <li>
                            <div class='num num_font color_1'>
                              {{setPercent(allData.flow.exceptionOut,allData.flow.departure)}}
                            </div>
                            <div class="numlist">
                               <dl>
                                   <dt>摇控器异常</dt>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor1"><i class="fa fa-exclamation"></i></span>
                                       <span class="des">异常</span>
                                       <span class="record">{{allData.flow.exceptionOut}}</span>
                                   </dd>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor2"><i class="fa fa-flag"></i></span>
                                       <span class="des">状态</span>
                                       <span class="record">{{setInOutStatus(allData.flow.exceptionOut,allData.flow.departure)}}</span>
                                   </dd>
                               </dl>
                            </div>
                        </li>
                        <li>
                            <div class='num num_font color_2'>
                              {{setPercent(allData.flow.exceptionSystemOut,allData.flow.departure)}}
                            </div>
                            <div  class="numlist">
                               <dl>
                                   <dt>系统异常</dt>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor1"><i class="fa fa-exclamation"></i></span>
                                       <span class="des">异常</span>
                                       <span class="record">{{allData.flow.exceptionSystemOut}}</span>
                                   </dd>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor2"><i class="fa fa-flag"></i></span>
                                       <span class="des">状态</span>
                                       <span class="record">{{setInOutStatus(allData.flow.exceptionSystemOut,allData.flow.departure)}}</span>
                                   </dd>
                               </dl>
                            </div>
                        </li>

                    </ul>
                </div>
                <div class="more">
                    <router-link to='/inout/exception'>
                        <i class="fa fa-angle-double-right"></i>
                    </router-link>
                </div>
            </section>
            <section  class='today_inout'>
                <h3>今日<span class='outlist'>进场</span>异常</h3>
                <div class='inoutBlock'>
                    <ul>
                        <li>
                            <div class='num num_font color_6' v-animate='parseInt(allData.flow.exceptionIn)+parseInt(allData.flow.exceptionSystemIn)'></div>
                            <div  class="numlist">
                               <dl>
                                   <dt>异常总量</dt>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor3"><i class="fa fa-flash"></i></span>
                                       <span class="des">异常</span>
                                       <span class="record">{{parseInt(allData.flow.exceptionIn)+parseInt(allData.flow.exceptionSystemIn)}}</span>
                                   </dd>
                                   <!-- <dd>
                                       <span class="dd_icon icon_bgcolor2"><i class="fa fa-flag"></i></span>
                                       <span class="des">状态</span>
                                       <span class="record">{{allData.flow.arrival}}</span>
                                   </dd> -->
                               </dl>
                            </div>
                        </li>
                        <li>
                            <div class='num num_font color_4 '>
                              {{setPercent(allData.flow.exceptionIn,allData.flow.arrival)}}
                            </div>
                            <div class="numlist">
                               <dl>
                                   <dt>摇控器异常</dt>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor1"><i class="fa fa-exclamation"></i></span>
                                       <span class="des">异常</span>
                                       <span class="record">{{allData.flow.exceptionIn}}</span>
                                   </dd>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor2"><i class="fa fa-flag"></i></span>
                                       <span class="des">状态</span>
                                       <span class="record">{{setInOutStatus(allData.flow.exceptionIn,allData.flow.arrival)}}</span>
                                   </dd>
                               </dl>
                            </div>
                        </li>
                        <li>
                            <div class='num num_font color_5'>
                              {{setPercent(allData.flow.exceptionSystemIn,allData.flow.arrival)}}
                            </div>
                            <div  class="numlist">
                               <dl>
                                   <dt>系统异常</dt>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor1"><i class="fa fa-exclamation"></i></span>
                                       <span class="des">异常</span>
                                       <span class="record">{{allData.flow.exceptionSystemIn}}</span>
                                   </dd>
                                   <dd>
                                       <span class="dd_icon icon_bgcolor2"><i class="fa fa-flag"></i></span>
                                       <span class="des">状态</span>
                                       <span class="record">{{setInOutStatus(allData.flow.exceptionSystemIn,allData.flow.arrival)}}</span>
                                   </dd>
                               </dl>
                            </div>
                        </li>

                    </ul>
                </div>
                <div class="more">
                    <router-link to='/inout/exception'>
                        <i class="fa fa-angle-double-right"></i>
                    </router-link>
                </div>
            </section>
            <section  class='income_3'>
                <h3>临停 &amp; 月卡</h3>
                <div  class="legend">
                    <ul>
                        <li ref = 'legend_temp'></li>
                        <li ref = 'legend_month'></li>
                    </ul>
                </div>
            </section>
            <section  class='income_2'>
                <h3>现金 &amp; APP</h3>
                <div class="legend">
                    <ul>
                        <li ref = 'legend_cash'></li>
                        <li ref = 'legend_app'></li>
                    </ul>
                </div>
            </section>
            <section class="today_contract">
                <h3>实时用户数</h3>
                <div class="new_addcontrack">
                    <ul>
                        <li>
                            <i class="fa fa-commenting-o"></i>
                            <div class="new_info">
                                <h4>活跃用户数</h4>
                                <p class='total'>共 <em class="num_font">{{allData.user.active}}</em> 人</p>
                            </div>
                        </li>
                        <li>
                            <i class="fa fa-user-plus"></i>
                            <div class="new_info">
                                <h4>新增用户数</h4>
                                <p class='total'>共 <em class="num_font">{{allData.user.register}}</em> 人</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
            <section class="today_contract">
                <h3>今日月卡数</h3>
                <div class="new_addcontrack">
                    <ul>
                        <li>
                            <i class="fa fa-refresh"></i>
                            <div class="new_info">
                                <h4>今日月卡新增</h4>
                                <p class='total'>共 <em class="num_font">{{allData.month.monthAdd}}</em> 次</p>
                            </div>
                        </li>
                        <li>
                            <i class="fa fa-check-square-o"></i>
                            <div class="new_info">
                                <h4>今日月卡申请</h4>
                                <p class='total'>共 <em class="num_font">{{allData.month.monthAgree}}</em> 次</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
            <section class="today_mount">
                <h3>进场车辆数 &amp;  出场车辆数</h3>
                <div class="new_addcontrack">
                    <ul>
                        <li>
                            <i class="fa fa-sign-in"></i>
                            <div class="new_info">
                                <h4>进场车辆数</h4>
                                <p class='total'>共 <em class="num_font">{{allData.flow.carIn}}</em> 次</p>
                            </div>
                        </li>
                        <li>
                            <i class="fa fa-sign-out"></i>
                            <div class="new_info">
                                <h4>出场车辆数</h4>
                                <p class='total'>共 <em class="num_font">{{allData.flow.carOut}}</em> 次</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
            <section class="today_mount" v-show='trafficShow'>
                <h3>停车难度指数</h3>
                <div class="incomeBlock">
                    <ul>
                        <li>
                             <i class="fa fa-bar-chart-o"></i>
                             <span class="title">停车难度指数</span>
                             <span class='total'> <em class="num_font">{{allData.traffic}}</em> </span>
                         </li>
                         <li>
                             <i class="fa fa-yen"></i>
                             <span class="title">当前车场收入(年)</span>
                             <span class='total'> <em class="num_font">{{allData.total}}</em> 元</span>
                         </li>
                    </ul>
                </div>
            </section>
        </div>
        <div v-show='!dataShow' class='nodata'> SORRY!查询不到信息！</div>
    </div>
</template>
<script>
import echarts from "echarts"
import utils from '../../utils/utils.js';
export default {
    data: function() {
        return {
          timeType:{day:'天',week:'周',month:'月'},
    			search:{station:'',dept:'',date_type:'',datetime:'',month_date:''},
    			station_history:[],
          pickerOpts:{
            disabledDate(time) {return time.getTime() > new Date().getTime();},
          },
    			history_block:false,
    			selected:'',
    			dataShow:true,
          trafficShow:false,
    			allData:{
            traffic:0,
    				flow:{arrival:0,departure:0,exceptionIn:0,exceptionOut:0,exceptionSystemIn:0,exceptionSystemOut:0,carOut:0,carIn:0},
    				charge:{ipos_month:0,ipos_temp:0,czy_month:0,czy_temp:0,wechat_month:0,wechat_temp:0,cash_temp:0,cash_month:0},
    				month:{monthAgree:0,monthAdd:0},
            user:{register:0,active:0},
            total:''
    			},
          legendData:{app:[],cash:[],ipos:[],date:[],month:[],temp:[]},
          isLoading:false,
          isFirstEnter:true,
        }
    },
    mounted: function() {

    },

    directives: {
      animate: {
        update:function(el, binding){
                var animatingNumber = function(options) {
                    this.element = options.element;
                    this.startNum = options.from;
                    this.endNum = options.to;
                    this.duration = options.duration || 2000;
                    this.timer = null;
                };
                animatingNumber.prototype = {
                    start: function() {
                        var _this = this;
                        _this.animate();
                    },
                    stop: function() {
                        if (this.timer) {
                            clearTimeout(this.timer);
                            this.timer = null;
                        }
                    },
                    animate: function() {
                        var _this = this;
                        var curNum = _this.startNum;
                        var range = _this.endNum - _this.startNum;
                        if(!range){_this.element.innerText = _this.endNum;return}
                        var timerStep = Math.abs(Math.floor(_this.duration / range));
                        timerStep = timerStep > 20 ? timerStep : 20;
                        var numStep = (range / _this.duration) * timerStep;

                        _this.stop();
                        (function animate() {
                            _this.timer = setTimeout(function() {
                                curNum = Math.ceil(curNum + numStep);
                                if ((_this.endNum > _this.startNum && curNum >= _this.endNum) || (_this.endNum < _this.startNum && curNum <= _this.endNum)) {
                                    curNum = _this.endNum;
                                }
                                _this.element.innerText = curNum;
                                animate();
                                if (curNum >= _this.endNum) {
                                    _this.stop();
                                }
                            }, timerStep);
                        })();
                    },
                };
                animatingNumber.create = function(options) {
                    return new animatingNumber(options);
                };
                var opt = {
                    element: el,
                    from: 0,
                    to: binding.value,
                    duration: 500
                }
                //console.log(binding.value+":"+binding.oldValue);
                animatingNumber.create(opt).start();
            }
        }
    },
    methods: {
      setPercent:function(n1,n2){
        if(n1===0 || n2 === 0){return 0}
          var point = (n1/n2).toFixed(4);
          var str = Number(point*100).toFixed(1);
          str+="%";
          return str;
      },
      //设置三个状态：正常，警告，严重警告
      setInOutStatus:function(n1,n2){
        var vm =this;
        if(n1===0 || n2 === 0){return '正常'}
        var point = (n1/n2).toFixed(4);
        var str = Number(point*100).toFixed(1);
        var notice =  str > 3?(str > 20?'严重警告':'警告'):'正常';
        return notice;
      },
      resetInitData:function(){
        this.allData = {
            traffic:0,
            flow:{arrival:0,departure:0,exceptionIn:0,exceptionOut:0,exceptionSystemIn:0,exceptionSystemOut:0,carOut:0,carIn:0},
            charge:{ipos_month:0,ipos_temp:0,czy_month:0,czy_temp:0,wechat_month:0,wechat_temp:0,cash_temp:0,cash_month:0},
            month:{monthAgree:0,monthAdd:0},
            user:{register:0,active:0},
            total:0,
          };
        this.legendData = {app:[],cash:[],ipos:[],date:[],month:[],temp:[]};
      },
        getLegend:function(){
            var vm = this;
            var obj = vm.legendData;
            var sort={'cash':'现金','app':'APP','temp':'临停','month':'月卡'};
            var textMap = {};
            var dataMap={};
            for(var i in sort){
                if(i == 'cash'){
                  textMap[i]={text:sort[i]+'应收',subtext:'近期'+sort[i]+'应收'};
                }else{
                  textMap[i]={text:sort[i]+'收入',subtext:'近期'+sort[i]+'收入'};
                }
                dataMap[i]=obj[i];
            }
            var getOpt = function(type){
                var option = {
                        color:['#3398DB'],
                        backgroundColor:'#ffffff',
                        title: {
                            padding:10,
                            text: textMap[type].text,
                            textStyle:{fontSize:14,color:'#878787'},
                            subtext: textMap[type].subtext,
                            left:'center',
                            subtextStyle:{fontSize:12}
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
                            },
                            backgroundColor:'none',
                            textStyle:{color:'#333'}
                        },
                        grid: {left: '6%',right: '12%',bottom: '8%',containLabel: true,},
                        yAxis : [{type : 'value',name:'收入情况'}],
                        // x轴
                        xAxis: {
                            data: obj.date,
                            axisTick: {alignWithLabel: true},
                            name:'最近时间段'
                        },
                        // 数据
                        series: [{
                            name: '收入',
                            type: 'bar',
                            barWidth: '60%',
                            data: dataMap[type],
                            markLine: {
                                data: [
                                    {type: 'average', name: '平均值'}
                                ]
                            }
                        }]
                    };
                return option;
            }
            for(var j in sort){
                if(this.$refs['legend_'+j]){
                    var legend = echarts.init(this.$refs['legend_'+j]);
                    legend.setOption(getOpt(j));
                }
                
            }
        },
    	stationClick:function(id){
        this.search={station:'',dept:'',date_type:'',datetime:'',month_date:''};
    		this.search.station = id;
            this.btnSearch();
    	},
    	select_station:function(f) {
        	this.selected=f;
        },

        getData:function() {
        	 var vm = this;
            var url = '/statistics/flow?type=all';
            if(typeof vm.search.dept ==='object'){
                vm.search.dept = vm.search.dept.department || vm.search.dept.area || vm.search.dept.company;
            }
            //vm.search.dept === 0 是指公司ID为0的情况
            if(vm.search.dept === 0 || vm.search.dept) url += "&dept_ids="+vm.search.dept;
            if(vm.search.station) {
              url += "&station_id="+vm.search.station;
            };
            if(vm.search.date_type) {
              url += "&date_type="+vm.search.date_type;
            };
            if(vm.search.datetime) {
              url += "&datetime="+vm.search.datetime;
            };
            if(vm.search.month_date) {
            	url += "&month_date="+ vm.search.month_date;
            };
            vm.dataShow = true;
            vm.trafficShow = false;
            vm.resetInitData();
            //第一次进来，dept 或者 station没值 就loading
            if(vm.isFirstEnter && (!vm.search.station || (!vm.search.dept&&vm.search.dept!==0))){
                vm.isLoading = true;
            }
            return utils.fetch(url).then(function(res) {
                if(typeof(res) != 'undefined'){
                	if(res.code ==0){
                        for(var n in vm.allData.flow){
                           vm.allData.flow[n] =  res.content.total[n]
                        }
                        for(var k in vm.allData.charge){
                           vm.allData.charge[k] =  res.content.total[k]
                        }
                        let total_all = res.content.total;
                        vm.legendData = total_all.income;
                        vm.allData.user.register = total_all.register_user_num;
                        vm.allData.user.active = total_all.active_user_num;
                        vm.getLegend(); //生成统计图
                		    vm.allData.month.monthAgree = total_all.monthAgree;
                		    vm.allData.month.monthAdd = total_all.monthAdd;
                        if(res.content.type == 'station'){
                            vm.trafficShow = true;
                        }
                        // 搜索框里停车场没值的情况
                        if(res.content.type == 'station'&&!vm.search.station&&res.content.id){ //
                            vm.search.station = res.content.id;
                        }else if(vm.isFirstEnter){ // 搜索框里联动没值的情况
                            var result = res.content;
                            var resObj = {};
                            resObj.company = parseInt(result.group)<0?'':parseInt(result.group);
                            resObj.area = parseInt(result.region)<0?'':parseInt(result.region);
                            resObj.department = parseInt(result.dept)<0?'':parseInt(result.dept);
                            vm.search.dept = '--'+ JSON.stringify(resObj);
                        }
                        vm.isFirstEnter=false;
                	}else{
                		vm.dataShow = false;
                	}
                  vm.isLoading = false;
                }
            })
        },
        getIndex:function() {
        	var vm = this;
        	var idx ;
            var url = '/station/traffic?time=1';
            if(vm.search.station) {
            	url += "&station_id="+vm.search.station;
            };
            if(vm.search.dept ) url += "&dept_ids="+vm.search.dept;
            utils.fetch(url).then(function(res) {
                 if(typeof(res) != 'undefined'){
                	if(res.code ==0){
                        if(!!res.content.traffic.info){
                            idx = res.content.traffic.info[0].traffic;
                        }
                		vm.allData.traffic  = !idx? 0 : idx + '%' ;

                	}
                }
            })
        },
        getRealTotal:function() {
            var vm = this;
            let year = new Date().getFullYear();
            var url = `/finance/annualreport?year=${year}`;
            if(vm.search.station) {
              url += "&station_id="+vm.search.station;
            }else{
                return
            };
            //if(vm.search.dept ) url += "&dept_ids="+vm.search.dept;
            utils.fetch(url).then(function(res) {
                 if(typeof(res) != 'undefined'){
                  if(res.code ==0 &&res.content!==''&& res.content.length>0){
                    vm.allData.total = res.content[0].total;
                  }else{
                    vm.allData.total = 0;
                  }
                }
            })
        },
        _fire:function(){
        	this.getData();
          this.getIndex();
          this.getRealTotal();
        },
        btnSearch:function(){
        	this.setHistoryData(7);
          this._fire();
        },
        btnUndo:function(){
            this.search={station:'',dept:''};
            this.resetInitData();
            //this._fire();
        },
        setHistoryData:function(n){
        	var vm = this;
        	var arr = vm.station_history;
        	if(!vm.selected) return;//not from select; from history click
        	if(arr.length>0){
        		var index = arr.findIndex(function(item){
        			return item.id === vm.selected.id;
        		})
        		if(index<0){
        			arr.unshift(vm.selected);
        		}
        	}else{
        		arr.push(vm.selected);
        		vm.history_block = true;
        	}
        	if(arr.length>n){
        		arr = arr.slice(0,n)
        	}
        	vm.station_history = arr;
        	vm.DataInls('set');
        },
        DataInls:function(method){
        	var vm = this;
        	var key = 'history_station_search';
        	if('set'==method){
        		window.localStorage.setItem(key,JSON.stringify(vm.station_history));
        	}
        	if('get'==method){
        		var data = window.localStorage.getItem(key);
        		return JSON.parse(data);
        	}
        },
    },
    beforeRouteEnter:function(to, from, next){
        next(function(vm){
            utils.getTingYunScript();
            var data = vm.DataInls('get');
            vm._fire();
            vm.station_history = data?data:[];
            vm.history_block = !!(vm.station_history.length>0 );
        });
    },
}
</script>
