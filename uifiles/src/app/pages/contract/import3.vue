
<template>

    <div id='box' class="menu-hide">
        <div class="worker station contract-old-import">
            <div class='condition clearfix box-width'>
                    <el-steps  class='steps_css' :active="active" finish-status="success" align-center>
                        <el-step title="上传文件"></el-step>
                        <el-step title="格式校验"></el-step>
                        <el-step title="车主关联"></el-step>
                        <el-step title="月卡入库"></el-step>
                        <el-step title="设置主副卡"></el-step>
                        <el-step title="发送厂家"></el-step>  
                    </el-steps>
                    <div class="step-result">
                        <el-upload v-if="isuploaded==false && active==0" drag :action="upload_url" :headers="headers" style="margin:0 auto;width:360px;" :multiple="false" :on-success="uploaded" class='tc'>
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                            <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
                        </el-upload>
                        <div v-if="isuploaded" class="excel-content">
                            <div class="info clearfix mt5" >
                                <div class="left">
                                    <span class="contract-old-import-cell" >车场ID:{{file.id}}</span>
                                    <span class="contract-old-import-cell" >文件名:{{file.name}}</span>
                                    <span class="contract-old-import-cell" >大小:{{file.size}}B</span>
                                    <span class="contract-old-import-cell" >共{{sheet.lists.length - 1}}条记录</span>
                                    <span class="contract-old-import-cell" >忽略0条</span>
                                </div>
                                <div class="right">
                                    <el-button @click="next" size="small" class="mt5" >下一步</el-button>
                                    <el-button @click="reset" size="small" class="mt5" >重置</el-button>
                                </div>
                            </div>
                            <div class='table box-width'>
                                <el-table max-height="570" v-loading="loading.shade" :element-loading-text="loading.msg" :data="tableData" border fit style="width:100%">
                                    <el-table-column type="index" width="70"></el-table-column>
                                    <el-table-column v-if="active>1" label="结果" width="200">
                                        <template slot-scope="scope">
                                            <span v-if="scope.$index > 0 && scope.row.result.status == false" class="red"  >{{scope.row.result.msg}}</span>
                                            <span v-if="scope.$index > 0 && scope.row.result.status == true">{{scope.row.result.msg}}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="A" label="A" width="170"></el-table-column>
                                    <el-table-column prop="B" label="B" width="115"></el-table-column>
                                    <el-table-column prop="C" label="C" width="100"></el-table-column>
                                    <el-table-column prop="D" label="D" width="115"></el-table-column>
                                    <el-table-column prop="E" label="E" width="170"></el-table-column>
                                    <el-table-column prop="F" label="F" width="80"></el-table-column>
                                    <el-table-column prop="G" label="G" width="140"></el-table-column>
                                    <el-table-column prop="H" label="H" width="100"></el-table-column>
                                    <el-table-column prop="I" label="I" width="80"></el-table-column>
                                    <el-table-column prop="J" label="J" width="170"></el-table-column>
                                    <el-table-column prop="K" label="K" width="170"></el-table-column>
                                    <el-table-column prop="L" label="L" width="170"></el-table-column>
                                    <el-table-column prop="M" label="M" width="170"></el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
               
            </div>
        </div>
    </div>

</template>

<script>
    let config = window.etback.config;
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            var header = {};
            header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
            header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
            header['Access-Token'] = window.localStorage.getItem('access_token');
            return {
                active:0,
                upload_url: config.host + "/contract/upload",
                headers:header,
                isuploaded:false,
                loading:{shade:false,msg:''},
                file:{},
                sheet:{},
                tableData:[],
                continue:true,
            };
        },
        methods:{
            next:function(){
                if( this.sheet.lists.length > 2000){
                    this.$message({ showClose:true, message:"超过2000条记录", type:'error' });
                } else if (this.continue == false){
                    this.$message({ showClose:true, message:"格式不正确", type:'error' });
                }else{
                    if(this.active >= 6) this.active = 0;
                    if(this.active == 1 && this.continue) this.check();
                    if(this.active == 2 && this.continue) this.relation();
                    if(this.active == 3 && this.continue) this.save();
                    if(this.active == 4 && this.continue) this.mainorvice();
                    if(this.active == 5 && this.continue) this.send();
                }
            },
            uploaded:function(response, file, fileList){
                if(file.status == 'success'){
                    if(file.response.code == 0){
                        this.sheet = file.response.content;
                        this.file = {id:this.sheet.id,name:file.name,size:file.size,percentage:file.percentage};
                        this.tableData = this.sheet.lists
                        this.active = 1;
                        this.isuploaded = true;
                    }else{
                        this.$message({ showClose:true, message:file.response.message, type:'error' });
                    }
                }
            },
            check:function(){
                var vm = this;
                vm.loading = {shade:true,msg:'格式校验中......'}
                vm.tableData = [];
                utils.fetch('/contract/check',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},credentials:"include" }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            for(var i in vm.sheet.lists){
                                vm.tableData[i] = vm.sheet.lists[i]//.concat();
                                vm.tableData[i]['result'] = json.content[i];
                                if(json.content[i].status == false) vm.continue = false;
                            }
                            vm.active = 2;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                    }
                    vm.loading.shade = false;
                });
            },
            relation:function(){
                var vm = this;
                vm.loading = {shade:true,msg:'车主关联中......'}
                vm.tableData = [];
                utils.fetch('/contract/relation',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},timeout:180000 }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            for(var i in json.content){
                                vm.tableData[i] = vm.sheet.lists[i];
                                vm.tableData[i]['result'] = json.content[i];
                                if(json.content[i].status == false) vm.continue = false;
                            }
                            vm.active = 3;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                    }
                    vm.loading.shade = false;
                });
            },
            save:function(){
                var vm = this;
                vm.loading = {shade:true,msg:'月卡入库中......'};
                vm.tableData = [];
                utils.fetch('/contract/save',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},timeout:180000 }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            for(var i in json.content){
                                var t = json.content[i];
                                vm.tableData[i] = vm.sheet.lists[i];
                                vm.tableData[i]['result'] = {status:t.status,msg:t.type + ' ' + t.msg};
                                if(json.content[i].status == false) vm.continue = false;
                            }
                            vm.active = 4;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                    }
                    vm.loading.shade = false;
                });
            },
            mainorvice:function(){
                var vm = this;
                vm.loading = {shade:true,msg:'正在设置主副卡......'};
                vm.tableData = [];
                utils.fetch('/contract/mainorvice',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},timeout:180000 }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            for(var i in json.content){
                                vm.tableData[i] = vm.sheet.lists[i];
                                vm.tableData[i]['result'] = json.content[i];
                                if(json.content[i].status == false) vm.continue = false;
                            }
                            vm.active = 5;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                    }
                    vm.loading.shade = false;
                });
            },
            send:function(){
                var vm = this;
                vm.loading = {shade:true,msg:'正在发送至厂家......'};
                // vm.tableData = [];
                utils.fetch('/contract/send',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},timeout:180000 }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            vm.active = 0;
                            vm.isuploaded = false;
                            vm.tableData = [];
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                    }
                    vm.loading.shade = false;
                });
            },
            reset:function(){
                var vm = this;
                vm.active = 0;
                vm.tableData = [];
                vm.isuploaded = false;
                vm.sheet = {};
                vm.file = {};
                vm.continue = true;
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(){
                utils.getTingYunScript();
            });
        },
    }

</script>
