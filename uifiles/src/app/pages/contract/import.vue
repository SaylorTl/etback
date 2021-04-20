<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="btn_box">
                    <div class="btn_box_left el-button el-button--small">
                        <a href="https://new.aparcar.cn/template.xlsx">月卡导入模板下载</a>
                    </div>
                    <div class="btn_box_left el-button el-button--small">
                        <router-link tag="li" to="/contract/importlog"><a>月卡导入记录</a></router-link>
                    </div>
                    <div class="btn_box_right">
                        <el-button v-if='refreshBtn' :disabled='true' size="small" type="primary">刷新倒计时{{time}}</el-button>
                        <el-button @click="clearTimer" size="small">自动刷新开关</el-button>
                        <!-- <el-button @click="gotoOldVersion" size="small">回到旧版</el-button> -->
                        <el-button @click="clearHandler" size="small"><i class="fa fa-undo"></i>清除信息</el-button>
                        <el-button @click="getInfoHandler" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                    </div>
                </div>
                <div class="tc importwait">
                    待处理批次: 格式检验<span>{{wait.check}}</span>批,  入库<span>{{wait.save}}</span>批,  下发<span>{{wait.issue}}</span>批
                </div>
                <el-steps align-center :active="active" finish-status="success" class='steps_css'>
                    <el-step title="整表检测"></el-step>
                    <el-step title="行检测"></el-step>
                    <el-step title="入库"></el-step>
                    <el-step title="下发"></el-step>
                </el-steps>
                <el-upload drag :action="upload_url" :headers="headers" :limit="1" :on-exceed="exceedHandle" :on-success="uploaded" auto-upload class='tc' ref='uploadobj'>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传excel文件<span class="red">(暂不支持内场)</span></div>
                </el-upload>
                <div class="result_info">
                    <section>
                        <div class="process_info">
                            <ul>
                                <li>总共 {{rowInfo.total_row}} 条;</li>
                                <li>已处理 {{rowInfo.count_row}} 条;</li>
                                <li>已入库 {{rowInfo.save_row}} 条;</li>
                                <li>成功 <span class="green">{{rowInfo.success_row}}</span> 条;</li>
                            </ul>
                        </div>
                    </section>
                    <el-collapse accordion>
                        <el-collapse-item>
                            <template slot="title">
                                检测信息  <i class="header-icon el-icon-warning red" v-if='check_msg.length>0'></i>
                            </template>
                            <div v-if='all_check'>
                                <ul class="upload_msglist">
                                    <li v-for='(item, index) in all_check_msg' :key="`1-${index}`">{{item}}</li>
                                </ul>
                            </div>
                            <div v-else>
                                <ul class="upload_msglist">
                                    <li v-for='(item, index) in check_msg' :key="`2-${index}`">第 {{item.row}} 行：{{item.msg}}</li>
                                </ul>
                            </div>
                            <div v-if='check_msg.length==0' class="gray tc">
                                <span>暂无信息</span>
                            </div>
                        </el-collapse-item>
                        <el-collapse-item>
                            <template slot="title">
                                入库信息  <i class="header-icon el-icon-warning red" v-if='save_msg.length>0'>共有 {{save_msg.length}} 条异常</i>
                            </template>
                            <ul class="upload_msglist" v-if='save_msg.length>0'>
                                <li v-for='(item, index) in save_msg' :key="`3-${index}`">第 {{item.row}} 行：{{item.msg}}</li>
                            </ul>
                            <div v-else class="gray tc">
                                <span>暂无信息</span>
                            </div>
                        </el-collapse-item>
                        <el-collapse-item>
                            <template slot="title">
                                下发信息  <i class="header-icon el-icon-warning red" v-if='issue_msg.length>0'> 共有 {{issue_msg.length}} 条异常</i>
                            </template>
                            <ul class="upload_msglist" v-if='issue_msg.length>0'>
                                <li v-for='(item, index) in issue_msg' :key="`4-${index}`">第 {{item.row}} 行：{{item.msg}}</li>
                            </ul>
                            <div v-else class="gray tc">
                                <span>暂无信息</span>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                    <div class="gray tc m-t-10">导入的提示信息需手动清除，清除信息不会停止处理已导入的月卡</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            let config={
                url:{
                    upload:'/import/contractimport', //参数：file   上传文件
                    clear:'/import/clearbatch', //参数 user_id=1489   清除提示信息
                    showinfo:'/import/show', //参数 user_id=1489  信息展示
                    wait:'/import/wait' ,
                },
                status:{all_check:0,row_check:1,save:3,issue:4},
            }
            return{
                cfg:config,
                active:0,
                upload_url:'',
                headers:{},
                rowInfo:{total_row:0,success_row:0,count_row:0,save_row:0},
                check_msg:[],
                save_msg:[],
                issue_msg:[],
                user_id:'',
                all_check:false,
                all_check_msg:[],
                time:3,
                timer:null,
                timerFlag:true,
                refreshBtn:false,
                wait:{check:0,save:0,issue:0}
            }
        },
        methods:{
            setTimer(){
                let vm = this;
                this.timer&&clearInterval(this.timer);
                if(vm.refreshBtn){
                    this.timer = setInterval(()=>{
                        if(vm.time==0){
                            vm.time = 3;
                            vm.getInfoHandler();
                        }else{
                            vm.time--;
                        }
                    },1000)
                }
            },
            clearTimer(){
                if(!this.refreshBtn){
                     this.refreshBtn=true;
                     this.timerFlag=false
                }
                if(this.timerFlag){
                    clearInterval(this.timer)
                }else{
                    this.setTimer()
                }
                this.timerFlag=!this.timerFlag;
            },
            clearHandler(){
                let vm = this;
                vm.$refs.uploadobj.clearFiles();
                vm.all_check_msg=[];
                let url = vm.cfg.url.clear+'?user_id='+vm.user_id;
                utils.fetch(url).then(function(res){
                    if(res&&res.code===0){
                        vm.refreshBtn=false
                        vm.getInfoHandler();
                    }
                });
            },
            getInfoHandler(){
                let vm = this;
                let url = vm.cfg.url.showinfo+'?user_id='+vm.user_id;
                utils.fetch(url).then(function(res){
                    if(res&&res.code===0){
                        let con = res.content;
                        vm.setVmdata(con)
                    }
                });
                vm.getWaitData();
            }, 
            getWaitData(){
                let vm = this;
                let url = vm.cfg.url.wait;
                utils.fetch(url).then(function(res){
                    if(res&&res.code===0&&res.content){
                        let con = res.content;
                        vm.wait = con;
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                });
            },
            uploaded(response, file, fileList){
                let vm = this;
                let url = vm.cfg.url.upload;
                let formData = new FormData();
                formData.append('file',file.raw);
                utils.fetch(url,{method:'POST',body:formData,headers:{}}).then(function(res){
                    if(res&&res.code===0){
                        vm.getInfoHandler();
                        vm.refreshBtn=true;
                        vm.setTimer();
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                });
             },
             //set value 
             setVmdata(con){
                let vm = this;
                vm.active =con.process?vm.cfg.status[con.process]:0;
                vm.rowInfo.total_row=con.total_row||0;
                vm.rowInfo.success_row=con.success_row||0;
                vm.rowInfo.count_row=con.count_row||0;
                vm.rowInfo.save_row=con.save_row||0;
                vm.check_msg =  con.check_msg||[];
                vm.split4msg(vm.check_msg);
                vm.save_msg =  con.save_msg||[];
                vm.issue_msg =  con.issue_msg||[];
             },
             //判断是不是全表检测，然后把信息切分
             split4msg(arr){
                let vm = this;
                if(arr.length===1&&arr[0].row==='all'){
                    vm.all_check=true;
                    vm.all_check_msg=arr[0].msg.split(';');
                }else{
                    vm.all_check=false;
                }
             },
            gotoOldVersion(){
                this.$router.push({path: '/contract/import_old', name:'月卡导入旧版'})
            },
            exceedHandle(){
                this.$message({ showClose:true, message:'单次只能传一个文件', type:'error' });
            },
        },
        mounted(){
            this.user_id = localStorage.getItem('user_id');
            this.upload_url=window.etback.config.host+this.cfg.url.upload;
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.getInfoHandler();
                vm.getWaitData();
            });
        },
        beforeRouteLeave (to, from, next) {
            next(function(vm){
                 vm.timer&&clearInterval(vm.timer);
            });
        }
    }
</script>
<style>
    .el-upload-list{
        width: 50%;
        margin:0 auto;
    }
</style>
