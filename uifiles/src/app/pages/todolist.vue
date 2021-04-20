<template>
    <div id='box' class="menu-hide">
        <div class='mainbox'>
            <el-collapse class='mt10' v-model="activeNames" @change="handleChange">
                <el-collapse-item title="本地异常月卡" name="7">
                    <unusual-card class="todo_con"></unusual-card>
                </el-collapse-item>
                <el-collapse-item title="续费申请" name="1">
                    <div class="todo_con">
                        <p class="todo_con_text">
                             当前有  <span class="red">{{count.renew}}</span> 条续费申请的记录，请尽快处理！
                        </p>
                        <p class="todo_con_btn">
                            <el-button @click="handle4tab1" plain size="small">查看当前待办</el-button>
                        </p>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="下发失败" name="2">
                    <div class="todo_con">
                        <p class="todo_con_text">
                             当前有  <span class="red">{{count.payment}}</span> 条下发失败的记录，请尽快处理！
                        </p>
                        <p class="todo_con_btn">
                             <el-button @click="handle4tab2" plain size="small">查看当前待办</el-button>
                        </p>
                       
                    </div>
                </el-collapse-item>
                <el-collapse-item title="月卡申请" name="3">
                    <div class="todo_con">
                        <p class="todo_con_text">
                             当前有  <span class="red">{{count.apply}}</span> 条月卡申请的记录，请尽快处理！
                        </p>
                        <p class="todo_con_btn">
                            <el-button @click="handle4tab3" plain size="small">查看当前待办</el-button>
                        </p>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="车场掉线" name="4">
                    <div class="todo_con">
                        <p class="todo_con_text">
                             当前有 <span class="red">{{count.station}}</span> 条车场掉线的记录，请尽快处理！
                        </p>
                        <p class="todo_con_btn">
                            <el-button @click="handle4tab4" plain size="small">查看当前待办</el-button>
                        </p>
                    </div>
                </el-collapse-item>
                <el-collapse-item name="5">
                    <template slot="title">
                        我的下载 <span class="yellow">导出文件有效期为72小时(以"结束时间"为起点),过后将会被清除</span>
                    </template>
                    <div class="text-right"><el-button @click="refreshDownloadList" plain size="mini">下载列表刷新</el-button></div>
                     <el-table  :data="tableData" border fit max-height='550' v-loading="downloadshade">
                        <el-table-column label="数据类型" min-width="120">
                            <template slot-scope="scope">
                                <span>{{datamap[scope.row.data_type]}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" min-width="120">
                            <template slot-scope="scope">
                                <span :class="{'red':(scope.row.status=='3'),'green':(scope.row.status=='2'),'yellow':(scope.row.status=='1'),}">{{statusmap[scope.row.status]}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="begin_exc" label="开始时间" min-width="120"></el-table-column>
                        <el-table-column prop="end_exc" label="结束时间" min-width="120"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button :disabled='scope.row.file==="" || scope.row.status!="2"' @click="downClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>下载</el-button>
                            </template>
                        </el-table-column>
                </el-table>
                </el-collapse-item>
                <el-collapse-item title="异常月卡车辆信息" name="6">
                    <div class="todo_con">
                        <p class="todo_con_text">
                             当前有 <span class="red">{{count.vehicle}}</span> 异常月卡车辆信息的记录，请尽快处理！
                        </p>
                        <p class="todo_con_btn">
                            <el-button @click="handle4tab6" plain size="small">查看当前待办</el-button>
                        </p>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>
<script>
    import utils from '../../utils/utils.js';
    import UnusualCard from '../component/todolist/unusual_card'
    export default {
        data:function(){
            var config = {
                url:{
                    getDeptids:'/user/deptShow',
                    todoCount:'/user/todoCount',
                    downlist:'/export/customExportList',
                }
            };
            return {
                cfg:config,
                activeName:'1',
                user_id:'',
                dept_ids:'',
                activeNames:['1','2','3','4','5','6','7'],
                count:{renew:0,payment:0,apply:0,station:0,vehicle:0},
                tableData:[],
                downloadshade:false,
                datamap:{'order':'交易订单','coupon':'优惠券','basic_operation':'基础运营报表','coupon_summary':'优惠券使用汇总报表','contract_income_summary':'月卡收入汇总报表','temp_income':'临停收入','contract_account':'月卡台账','contract_account_detail':'月卡台账明细','station_cost':'车场运营成本','order_apply':'续费订单','summary_list':'日报订单','qqk_record':'亲情卡使用列表','abn_contract':'异常月卡'},
                statusmap:{'1':'运行中','2':'成功','3':'失败','4':'等待导出'}
            }
        },
        components:{
            UnusualCard,
        },
        methods:{
            refreshDownloadList(){
                this.getDownload();
            },
            downClick(row){window.location.href = row.file},
            handleChange(val) {
                console.log(val);
            },
            handle4tab1(){
                let params = {dept:this.dept_ids,status:'0'};
                let r = {name:'续费申请',path:'/examine/renew_lists',params};
                this.$router.push(r);
            },
            handle4tab2(){
                let params = {dept:this.dept_ids,download:'N',status: 'paid'};
                let r = {name:'交易订单',path:'/order/payment',params};
                this.$router.push(r);
            },
            handle4tab3(){
                let params = {dept:this.dept_ids,state:'0'};
                let r = {name:'月卡申请',path:'/examine/apply_lists',params};
                this.$router.push(r);
            },
            handle4tab4(){
                let params = {dept:this.dept_ids,online:'0',status:'active'};
                let r = {name:'停车场',path:'/station',params};
                this.$router.push(r);
            },
            handle4tab6(){
                let params = {dept:this.dept_ids,status:'1'}; 
                let r = {name:'月卡车异常消息',path:'/contract/unexpected',params};
                this.$router.push(r);
            },
            getDeptidsByUserid(){
                let vm = this;
                let url = vm.cfg.url.getDeptids;
                utils.fetch(url).then(function(res){
                    if(res&&res.code===0){
                        vm.dept_ids = res.content.dept||'';
                        vm.getCounts(vm.dept_ids)
                    }
                });
            },
            getCounts(ids){
                let vm = this;
                let url = vm.cfg.url.todoCount;
                if(typeof ids === 'undefined'){return}
                url+='?dept='+ids;
                if(ids===''){return}
                utils.fetch(url).then(function(res){
                    if(res&&res.code===0){
                        let con = res.content;
                        vm.count={
                            renew:con.contract_renew_count||0,
                            payment:con.order_payment_download_count||0,
                            apply:con.contract_apply_count||0,
                            station:con.station_offline_count||0,
                            vehicle:con.vehicle_error_count||0
                        }
                    }
                });
            },
            getDownload(){
                let vm = this;
                let url = vm.cfg.url.downlist;
                vm.downloadshade = true;
                utils.fetch(url).then(function(res){
                    vm.downloadshade = false;
                    if(res&&res.code===0){
                         vm.tableData = res.content|| [];
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                }); 
            },
        },
        mounted(){
            this.getDeptidsByUserid();
            this.getDownload();
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
            });
        },
    }
</script>
