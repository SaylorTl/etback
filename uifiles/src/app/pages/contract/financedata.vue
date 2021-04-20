<template>
    <div id='box' class="menu-hide" >
        <div class='worker inlists finance'>
              <div class='mainbox'>
              
                  <div :style="{ width:'1200px','height':'0px'}">
                    <div :style="{height:'30px',width:'800px'}" class="left search_header">
                    <el-input v-model="searchAll.dept.name"  size="small" class="cell widthX150 mr5" @focus="dailogSelectDeptShowUp" trigger-on-focus=false suffix-icon="el-icon-more" placeholder="请选择所属事业部"></el-input>
                    <my-select-department v-if="deptloadingUp" @change="dailogSelectDeptChangUp" @close="dailogSelectDeptCloseUp" :style="{left:'0px'}"></my-select-department>
                    <my-select-station v-model.trim="searchAll.station" size="small" class="cell widthX150 mr5"   placeholder="停车场"></my-select-station>
                    <el-date-picker v-model="searchAll.month" placeholder="选择年份" size="small" class="cell widthX150 mr5"  type='year' v-if='monthShow'></el-date-picker>
                    <el-date-picker v-model="searchAll.month" placeholder="选择月份" size="small" class="cell widthX150 mr5"  type='month' v-if='!monthShow'></el-date-picker>
                    <el-button @click="btnSearchUp" size="small" ><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="reset" size="small"><i class="fa fa-search"></i>重置</el-button>
                    </div>
                    <div class='right'>
                        <el-button @click="change" size="small">{{monthShow?'切换当月增收页':'切换收入详情页'}}</el-button>
                        <el-button @click="contractImport" size="small"><i class="fa fa-arrow-down"></i>导入</el-button>
                    </div>
                    <div :style="{display:'table-cell',width:'1200px',textAlign:'center'}" v-show="messagetip" >
                      暂无数据
                    </div>
                  </div>
                
              <div class="" :style="{marginTop: '0px', width: '100%', marginLeft: 'auto', marginRight: 'auto'}">
                <h2 :style="{ color:'#3F3F3F', margin:monthShow ? '5px':'5px 5px 5px 5px'}">{{monthShow?'收入详情页':'当月增收信息'}}</h2>
                <el-table :data="yearCome"  border  style="width: 100%" show-summary
                    height="620" v-show="!monthShow" v-loading='monthLoading' :style="{'marginTop':monthShow ?'auto':'0'}">
                    <el-table-column prop="year" label="年份"></el-table-column>
                    <el-table-column prop="month" label="月份"></el-table-column>
                    <el-table-column prop="dept_name" :label="'事业部'"></el-table-column>
                    <el-table-column prop="station_name" :label="'停车场'"></el-table-column>
                    <el-table-column prop="start_pay_time" :label="'开始支付时间'"></el-table-column>
                    <el-table-column prop="monthbase" :label="'基数'"></el-table-column>
                    <el-table-column prop="dept_name" :label="'事业部'"></el-table-column>
                    <el-table-column prop="increasing" :label="'当月增收'"></el-table-column>
                    <el-table-column prop="amount" :label="'当月总收入'"></el-table-column>
                    <el-table-column fixed="right" label="操作">
                        <template slot-scope="scope">
                            <el-button @click="handleClick(scope.row)" type="text" size="small">修改</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-dialog :visible.sync="updateVisible" width='40%' >
                    <el-form :model="editInfo" >
                        <el-form-item  label="事业部:" label-width="80px" >
                            <el-input v-model="editInfo.dept"  placeholder="事业部" :disabled ='plateFlag' class="cell input_inner"></el-input>
                        </el-form-item>
                        <el-form-item  label="停车场:" label-width="80px" >
                            <el-input v-model="editInfo.station"  placeholder="停车场" :disabled ='plateFlag' class="cell input_inner"></el-input>
                        </el-form-item>
                        <el-form-item  label="基数:" label-width="80px">
                            <el-input v-model="editInfo.monthbase" size="small" class="cell input_inner" trigger-on-focus=false placeholder="基数"></el-input>
                        </el-form-item>
                        <el-form-item  label="总收入:" label-width="80px">
                            <el-input v-model="editInfo.amount" size="small" class="cell input_inner" trigger-on-focus=false placeholder="总收入"></el-input>
                        </el-form-item>
                        <el-form-item label-width="120px">
                            <el-button @click="addSubmit" type="primary" size="small">提交</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
                <el-table :data="yearCome"
                  style="width: 100%"
                  show-summary
                  height='620'
                  border v-show="monthShow" v-loading='monthLoading'>
                    <el-table-column  prop="year"
                    :width="80"
                    label="年份" ></el-table-column>
                    <el-table-column  prop="dept_name"
                    :width="120"
                    :label="'事业部'"></el-table-column>
                    <el-table-column  prop="station_name"
                    :width="130"
                    :label="'停车场'"></el-table-column>
                    <el-table-column prop="start_pay_time"
                    :width="140"
                    :label="'开始支付时间'"></el-table-column>
                    <el-table-column prop="last_year_income"
                    :width="140"
                    :label="'车场去年总收入'"></el-table-column>
                    <el-table-column prop="grandtotal"
                    :width="100"
                    :label="'累计增收'"></el-table-column>
                    <el-table-column prop="realincome"
                    :width="100"
                    :label="'兜底增收'"></el-table-column>
                    <el-table-column   prop="monthbase"
                    :width="100"
                    :label="'每月基数'"></el-table-column>
                     <el-table-column   prop="total"
                    :width="110"
                    :label="'合计收入'"></el-table-column>
                     <el-table-column  prop="total1"
                    :width="100"
                    :label="'1月'"></el-table-column>
                    <el-table-column  prop="total2"
                    :width="100"
                    :label="'2月'"></el-table-column>
                    <el-table-column  prop="total3"
                    :width="100"
                    :label="'3月'"></el-table-column>
                    <el-table-column  prop="total4"
                    :width="100"
                    :label="'4月'"></el-table-column>
                    <el-table-column  prop="total5"
                    :width="100"
                    :label="'5月'"></el-table-column>
                    <el-table-column  prop="total6"
                    :width="100"
                    :label="'6月'"></el-table-column>
                    <el-table-column  prop="total7"
                    :width="100"
                    :label="'7月'"></el-table-column>
                    <el-table-column  prop="total8"
                    :width="100"
                    :label="'8月'"></el-table-column>
                    <el-table-column  prop="total9"
                    :width="100"
                    :label="'9月'"></el-table-column>
                    <el-table-column  prop="total10"
                    :width="100"
                    :label="'10月'"></el-table-column>
                    <el-table-column  prop="total11"
                    :width="100"
                    :label="'11月'"></el-table-column>
                    <el-table-column  prop="total12"
                    :width="100"
                    :label="'12月'"></el-table-column>
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
                lists:[],
                searchAll:{station:'11',month:'2017-1',dept:{name:"深圳事业部",type:"department",value:2},},
                deptloadingUp:false,
                messagetip:false,
                monthbase:[],
                increasing:[],
                amount:[],
                yearCome:[],
                monthShow:true,
                monthLoading:false,
                stationHeight:false,
                updateVisible:false,
                plateFlag:true,
                editInfo:{amount:'',monthbase:"" ,dept:'',station:''}
            }
        },
        methods:{
            addSubmit:function(){
                var vm = this,data;
                var edit = vm.editInfo;
                var url = "/finance/update"
                var  data = {
                    amount:edit.amount,
                    monthbase : edit.monthbase,
                    year:(vm.tabletimeParse(vm.searchAll.month)).slice(0,4),
                    month:vm.tabletimeParse(vm.searchAll.month).slice(-2),
                    station_id:vm.searchAll.station
                }
                utils.fetch(url,{ method:'post',body:data }).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.updateVisible=false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                });
            },
            handleClick:function(row) {
                var vm = this;
                vm.updateVisible = true
                vm.editInfo={amount:row.amount,monthbase:row.monthbase,dept:row.dept_name,station:row.station_name};
            },
            change:function(){
                var vm = this;
                vm.monthShow=!vm.monthShow;
                vm.getData();
            },
            //封装请求方法；
            ifPkg:function(url,flag,oValue,nValue){
                nValue ? url += flag + nValue : url += flag + oValue
                return url;
            },
            btnSearchUp:function(){
                this.getData();
            },
            getData:function(){
                var vm = this;
                vm.monthLoading = true;
                var url
                if(!vm.monthShow){
                    url = '/finance/monthreport?page=1&pagesize=9999';
                    if(vm.searchAll.month) url+='&time='+vm.tabletimeParse(vm.searchAll.month);
                }else{
                    url = '/finance/annualreport?page=1&pagesize=9999';
                    if(vm.searchAll.month) url+='&year='+(vm.tabletimeParse(vm.searchAll.month)).slice(0,4);
                }
                if(vm.searchAll.station) { url+='&station_id='+vm.searchAll.station }
                if(vm.searchAll.dept.value) url+='&dept_ids='+vm.searchAll.dept.value
                utils.fetch(url).then(function(res){
                        if( 0 == res.code ){
                            if(!vm.monthShow){
                                vm.yearCome = res.content.lists;
                                for(var index = 0; index < vm.yearCome.length;index++){
                                    vm.yearCome[index]['month']+="月"
                                }
                                vm.monthLoading = false;
                            }else{
                                if(res.content==''){
                                    vm.$message({ showClose:true, message:res.message, type:'error' });
                                    vm.monthLoading = false;
                                }else{
                                    vm.monthLoading = false;

                                    vm.yearCome = res.content.lists;
                                    for(var num = 0; num < vm.yearCome.length; num++){
                                        for(var ind in vm.yearCome[num].amountData){
                                                vm.yearCome[num]['total'+ind] = vm.yearCome[num].amountData[ind]
                                        }
                                    }
                                }
                            }
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                            vm.monthLoading = false;
                        }
                    })
            },
             //导入按钮跳转
            contractImport:function(){
            this.$router.push({path:'/contract/difference'});
            },
            dailogSelectDeptChangUp:function(obj){
                this.searchAll.dept = obj;
                this.dailogSelectDeptCloseUp();
            },
            dailogSelectDeptCloseUp:function(){
                this.deptloadingUp = false;
            },
            dailogSelectDeptShowUp:function(){
                this.deptloadingUp = this.deptloadingUp ? false : true;
            },
            tabletimeParse:function(time){
                if( typeof(time) == 'string') time = new Date(time);
                var y = time.getFullYear();
                var m = time.getMonth() + 1;
                m = m > 9 ? m : "0"+m;
                return y.toString() +'-'+ m;
            },
            reset:function(){
                this.searchAll.station = '';
            }
         },
            beforeMount:function(){
                // this.charts();
                this.getData();
            }
}
</script>
<style>
.echart_wrap{
    height: 400px;
    width: 1200px;
    margin-top: 55px;
    display: flex;
    flex-flow: nowrap row;
}
.echart_wrap>div{
    height: 380px;
    width: 50%;
}
.search_header{
    display: flex;
    justify-content: end;
    align-items: baseline;
}
.search_Bottom{
    display: flex;
    justify-content: end;
    align-items: baseline;
    position: relative;
}
</style>
