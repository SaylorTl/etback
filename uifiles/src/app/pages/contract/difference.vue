
<template>
    <div id='box' class="menu-hide">
        <div class="worker station mainbox">
            <div class='condition clearfix box-width difference'>
                <div >
                    <el-steps :space="100" :active="active" finish-status="success" >
                        <el-step title="上传文件" class="_ml10"></el-step>
                        <el-step title="格式校验"></el-step>
                        <el-step title="报表入库"></el-step>
                    </el-steps>
                    <div class="step-result">
                        <el-upload v-if="isuploaded==false && active==0" drag :action="upload_url" :headers="headers" class="difference-uploader"  :data="{'upload2sheet':upload2sheet}" :multiple="false" :on-success="uploaded">
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em>,只能上传excel文件</div>
                        </el-upload>
                    <div class="selectRadio">
                        <el-radio v-model="upload2sheet" :label='false'>上传一张表格</el-radio>
                        <el-radio v-model="upload2sheet" :label="true">上传两张表格</el-radio>
                    </div>
                        <div v-if="isuploaded" class="excel-content">
                            <div class="info clearfix mt5">
                                <div class="left loadDetail">
                                    <span>车场ID:{{file.id}}</span>
                                    <span>文件名:{{file.name}}</span>
                                    <span>大小:{{file.size}}B</span>
                                    <span>共{{sheet.lists.length - 1}}条记录</span>
                                    <span>忽略0条</span>
                                </div>
                                <div class="right">
                                    <el-button @click="next" size="small" class="mt5"  v-show ='nextShow'>下一步</el-button>
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
                        <div v-if="isuploaded" class="excel-content mt10">
                            <div class="left">
                                    <span class="difference-filename">文件名:{{nextfile.name}}</span>
                            </div>
                            <div class='table box-width'>
                                <el-table max-height="570" v-loading="loading.shade" :element-loading-text="loading.msg" :data="secondData" border fit style="width:100%">
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
                upload_url: config.host + "/finance/upload",
                headers:header,
                isuploaded:false,
                loading:{shade:false,msg:''},
                file:{},
                sheet:{},
                tableData:[],
                secondData:[],
                continue:true,
                nextShow:true,
                upload2sheet:false,
                nextfile:{}
            };
        },
        methods:{
            next:function(){
                if( this.sheet.lists.length > 2000){
                    this.$message({ showClose:true, message:"超过2000条记录", type:'error' });
                } else if (this.continue == false){
                    this.$message({ showClose:true, message:"格式不正确", type:'error' });
                }else{
                    //if(this.active >= 6) this.active = 0;
                    if(this.active == 1 && this.continue) this.check();
                    // if(this.active == 2 && this.continue) this.relation();
                    if(this.active == 2 && this.continue) this.save();
                    // if(this.active == 4 && this.continue) this.mainorvice();
                    // if(this.active == 5 && this.continue) this.send();
                }
            },
            uploaded:function(response, file, fileList){
                console.log(response, file, fileList)
                if(file.status == 'success'){
                    if(file.response.code == 0){
                        this.sheet = file.response.content;
                        this.file = {id:this.sheet.id,name:file.name,size:file.size,percentage:file.percentage};
                        this.nextfile = {name:response.content.sheet2name};
                        this.tableData = this.sheet.lists
                        this.secondData = this.sheet.sheet2
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
                vm.secondData = [];
                utils.fetch('/finance/check',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},credentials:"include" }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            var res1 = json.content.sheet1;
                            var res2 = json.content.sheet2;
                            for(var i in vm.sheet.lists){
                                vm.tableData[i] = vm.sheet.lists[i]//.concat();
                                vm.tableData[i]['result'] = res1[i];
                                if(res1[i].status == false) vm.continue = false;
                            }
                            for(var index in vm.sheet.sheet2){
                                vm.secondData[index] = vm.sheet.sheet2[index]//.concat();
                                vm.secondData[index]['result'] = res2[index];
                                if(res2[index].status == false) vm.continue = false;
                            }
                            vm.active = 2;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                    }
                    vm.loading.shade = false;
                });
            },
            save:function(){
                var vm = this;
                vm.loading = {shade:true,msg:'报表入库中......'};
                vm.tableData = [];
                vm.secondData = [];
                utils.fetch('/finance/save',{ method:'POST',body:JSON.stringify(this.sheet),headers:{'Content-Type':'application/json'},timeout:180000 }).then(function(json){
                    if(typeof(json) != 'undefined'){
                        if(json.code == 0){
                            for(var i in json.content.sheet2){
                                var f = json.content.sheet2[i];
                                vm.secondData[i] = vm.sheet.sheet2[i];
                                vm.secondData[i]['result'] = {status:f.status,msg:f.type + ' ' + f.msg};
                                if(json.content.sheet2[i].status == false) vm.continue = false;
                            }
                            for(var index in json.content.sheet1){
                                var t = json.content.sheet1[index];
                                vm.tableData[index] = vm.sheet.lists[index];
                                vm.tableData[index]['result'] = {status:t.status,msg:t.type + ' ' + t.msg};
                                if(json.content.sheet1[index].status == false) vm.continue = false;
                            }
                            vm.active = 4;
                            vm.nextShow = false;
                        }else{
                            vm.$message({ showClose:true, message:json.message, type:'error' })
                        }
                        vm.loading.shade = false;
                    }
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
                vm.nextShow = true;
            }
        },
        beforeRouteEnter:function(to, from, next){
            next(function(){
                utils.getTingYunScript();
            });
        },
    }

</script>

