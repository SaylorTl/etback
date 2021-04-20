<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.nsrmc"  size="small" class="cell widthX120"  placeholder="纳税人名称"></el-input>
                    <el-input v-model.trim="search.nsrsbh"  size="small" class="cell widthX120"  placeholder="纳税人识别号"></el-input>
                    <el-input v-model.trim="search.appid"  size="small" class="cell widthX120"  placeholder="appid"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="nsrmc" label="纳税人名称" min-width="130">
                    </el-table-column>
                    <el-table-column prop="nsrsbh" label="纳税人识别号" min-width="180"></el-table-column>
                    <el-table-column label="平台" width="90">
                        <template slot-scope='scope'>{{platforms[scope.row.platform]}}</template>
                    </el-table-column>
                    <el-table-column prop="nsrkhyh" label="纳税人开户银行" min-width="180"></el-table-column>
                    <el-table-column prop="kpy" label="开票员" min-width="70">
                    </el-table-column>
                    <el-table-column prop="fhr" label="复核人" min-width="70">
                    </el-table-column>
                    <el-table-column prop="sky" label="收款员" min-width="70">
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item label="纳税平台:">
                        <el-select  v-model="editor.info.platform" size="small" class="widthX300"  placeholder="纳税平台">
                            <el-option v-for="(val,key) in platforms" :key="key" :value="key" :label="val"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="纳税人名称:">
                        <el-select v-if="!isShow" v-model.trim="editor.info.nsrmc" size="small" class="widthX300"  placeholder="纳税人名称" filterable remote :remote-method="getCompanyInfo" v-loading = 'company_loading' @change ='setSbh'>
                            <el-option v-for="item in companyArray" :key="item.nsrsbh" :value="item.nsrmc" :label="item.nsrmc"></el-option>
                        </el-select>
                        <el-input v-if="isShow" v-model="editor.info.nsrmc" size="small" class="widthX300" placeholder="纳税人名称"></el-input>
                        <el-button size="small" @click="isShow = !isShow">{{isShow?'输入筛选':'手动输入'}}</el-button>
                    </el-form-item>
                    <el-form-item label="纳税人识别号:">
                         <el-input v-model="editor.info.nsrsbh" size="small" placeholder="纳税人识别号"></el-input>
                    </el-form-item>
                    <el-form-item label="纳税人开户银行:">
                        <el-input v-model="editor.info.nsrkhyh" size="small" placeholder="纳税人开户银行"></el-input>
                    </el-form-item> 
                    <!-- 平台：航信 -->
                    <template v-if='editor.info.platform==="aisino"'>
                        <el-form-item label="纳税人地址电话:" >
                             <el-input v-model="editor.info.nsrdzdh" size="small" placeholder="纳税人地址电话"></el-input>
                        </el-form-item>
                        <el-form-item label="CA密码:">
                             <el-input v-model="editor.info.camm" size="small" placeholder="CA密码"></el-input>
                        </el-form-item>
                        <el-form-item label="CA证书上传:" v-if='isadd'>
                              <el-upload
                                  :action="config.host+url.uploadca"
                                  :file-list="fileList" 
                                  :before-upload="beforeUpload">
                                  <el-button size="small" type="primary">点击上传</el-button>
                                  <div slot="tip" class="el-upload__tip">只能上传cer文件,文件名格式:'纳税人识别号.cer'</div>
                                </el-upload>
                                <el-upload
                                  :action="config.host+url.uploadca"
                                  :file-list="fileList" 
                                  :before-upload="beforeUpload">
                                  <el-button size="small" type="primary">点击上传</el-button>
                                  <div slot="tip" class="el-upload__tip">只能上传pfx文件,文件名格式:'纳税人识别号.pfx'</div>
                                </el-upload>
                        </el-form-item>
                        <el-form-item label="CA证书:" v-if='!isadd'>
                             <p v-text="caInfo.cer"></p>
                             <p v-text="caInfo.pfx"></p>
                        </el-form-item>
                        <el-form-item label="第三方平台编号:">
                             <el-input v-model="editor.info.dsfptbm" size="small" placeholder="第三方平台编号"></el-input>
                        </el-form-item>
                        <el-form-item label="机器编号:">
                             <el-input v-model="editor.info.jqbh" size="small" placeholder="机器编号"></el-input>
                        </el-form-item>
                        <el-form-item label="注册码:">
                            <el-input v-model="editor.info.appid" size="small" placeholder="appid"></el-input>
                        </el-form-item>
                        <el-form-item label="授权码:" v-if='isadd'>
                            <el-input v-model="editor.info.appsecret" size="small" placeholder="授权码"></el-input>
                        </el-form-item>
                    </template>
                    <!-- 平台：百望 -->
                    <template v-if='editor.info.platform==="baiwang"'>
                        <el-form-item label="注册码:" v-if='isadd'>
                            <el-input v-model="editor.info.appsecret" size="small" placeholder="注册码"></el-input>
                        </el-form-item>
                    </template>
                    <!-- 平台：中税 -->
                    <template v-if='editor.info.platform==="zhongshui"'>
                        <el-form-item label="appid:">
                            <el-input v-model="editor.info.appid" size="small" placeholder="appid"></el-input>
                        </el-form-item>
                        <el-form-item label="appsecret:" v-if='isadd'>
                            <el-input v-model="editor.info.appsecret" size="small" placeholder="appsecret"></el-input>
                        </el-form-item>
                    </template>
                    <el-form-item label="开票员:">
                        <el-input v-model="editor.info.kpy" size="small" placeholder="开票员"></el-input>
                    </el-form-item>
                    <el-form-item label="复核人:">
                        <el-input v-model="editor.info.fhr" size="small" placeholder="复核人"></el-input>
                    </el-form-item>
                    <el-form-item label="收款员:">
                        <el-input v-model="editor.info.sky" size="small" placeholder="收款员"></el-input>
                    </el-form-item>
                    <el-form-item label="税率:">
                        <div v-for='(item, index) in taxrateLists' :key="index">
                            <el-select class="cell widthX200"   size="small" v-model="item.id" placeholder="费用">
                                <el-option v-for="i in rateArr" :key="i.id" :label="i.name" :value="i.id">
                                </el-option>
                            </el-select>
                            <el-input v-model="item.rate" size="small" placeholder="税率" class="widthX120" >
                                <div slot="suffix">%</div>
                            </el-input>
                            <el-button v-if='index==0' size="small" @click.prevent="addItem">新增税率</el-button>
                            <el-button v-if='index!=0' size="small" @click.prevent="removeItem(index)">删除</el-button>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editor.saveloading'>{{editor.btnText}}</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    let config = window.etback.config;
    export default {
        data:function(){
            let platforms = {'zhongshui':'中税','aisino':'航信','baiwang':'百望'};
            let url={   
                rate:'/invoice/listsFee', //批量查询费用
                payerlists:'/invoice/listsTaxpayer',
                add:'/invoice/addTaxpayer',
                update:'/invoice/updateTaxpayer',
                taxget:'/invoice/taxGetList',//查询纳税人信息
                getca:'/invoice/getCa',//查询纳税人CA证书信息
                uploadca:'/invoice/uploadCa'//纳税人CA证书上传
            }
            return {
                config,
                url,
                platforms,
                shade:false,
                isadd:true,
                search:{nsrmc:"",nsrsbh:"", appid :""},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                editor:{title:'',show:false,saveloading:false,btnText:'',info:{platform:"",nsrdzdh:"",nsrmc:"",nsrsbh:"", appid :"",appsecret:"",nsrkhyh:"",camm:"",dsfptbm:"",jqbh:"",kpy:"",fhr:"",sky:"",taxrate:[]}},
                tableData:[],
                rateArr:[],
                companyArray:[],
                taxrateLists:[],
                company_loading:false,
                caInfo:{cer:'',pfx:''},
                fileList:[],
                isShow:false
            }
        },
        methods:{
            beforeUpload(file){
                let vm = this;
                const size = 500;
                const extension = file.name.split('.').pop().toLowerCase() === 'cer';
                const extension2 = file.name.split('.').pop().toLowerCase() === 'pfx';
                const isLt2M = file.size / 1000 < size;
                if (!extension && !extension2 ) {
                    vm.$message({ showClose:true, message:'文件只能是 cer、pfx 格式!', type:'error' });
                    return false;
                }
                if (!isLt2M) {
                    vm.$message({ showClose:true, message:'文件大小不能超过 500K!', type:'error' });
                    return false;
                }
                return extension || extension2 && isLt2M
            },
            getCompanyInfo(query){
                let vm = this;
                let url = `${vm.url.taxget}?key=${query}`;
                vm.company_loading = true;
                utils.fetch(url).then(function(json){
                    if(json&&json.code == 0){
                        vm.companyArray = json.content.lists || [];
                    }
                    vm.company_loading = false;
                });
            },
            setSbh(value){
                if(!value)return;
                let selected = this.companyArray.find(item=>item.nsrmc === value)
                this.editor.info.nsrsbh =  selected.nsrsbh
            },
            removeItem(index) {
                if (index !== -1) {
                  this.taxrateLists.splice(index, 1)
                }
            },
            addItem() {
                this.taxrateLists.push({id: '',rate:''});
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            updateClick:function(row){
                var vm = this;
                vm.getPayRateArr();
                vm.editor.show = true;
                vm.editor.title = "编辑信息";
                vm.editor.btnText = "保存";
                vm.editor.saveloading = false;
                vm.isadd = false;
                let {taxrate,...obj} = row;
                vm.editor.info= Object.assign({},obj);
                vm.taxrateLists = vm.updateSetRateArr(taxrate);
                if(row.platform==="aisino"){
                    vm.getCaInfo(row.nsrsbh);
                }
            },
            updateSetRateArr(taxrate){
                let ratemap = [];
                if(Array.isArray(taxrate) && taxrate.length === 0){
                        ratemap.push({id:'',rate:''});
                }else if(!!taxrate){
                    for(let i in taxrate){
                        if(!!taxrate[i]){
                            ratemap.push({id:i-0,rate:taxrate[i]*100}) 
                        }else{
                            ratemap.push({id:'',rate:''});
                        }
                    }
                }else{
                    ratemap.push({id:'',rate:''});
                }
                return ratemap
            },
            getPayRateArr(){
                let vm = this;
                let url = vm.url.rate+'?page=1&pagesize=1000';
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.content.lists){
                            vm.rateArr = res.content.lists;
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getCaInfo(id){
                let vm = this;
                let url = vm.url.getca+'?nsrsbh='+id;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined' && res.code == 0&& res.content){
                        let {cer,pfx}=res.content;
                        vm.caInfo = {cer,pfx};
                    } 
                });
            },
            addClick:function(){
                var vm = this;
                vm.editor.show = true;
                vm.editor.title = "添加信息";
                vm.editor.btnText = "添加";
                vm.isadd = true;
                vm.editor.saveloading = false;
                vm.editor.info={platform:"zhongshui",nsrdzdh:"",nsrmc:"",nsrsbh:"",nsrkhyh:"",camm:"",dsfptbm:"",jqbh:"",kpy:"",fhr:"",sky:"", appid :"", appsecret:""};
                vm.taxrateLists=[{id:'',rate:''}];
                vm.getPayRateArr();
            },
            editSubmit:function(){
                var vm = this;
                var url = vm.isadd?vm.url.add:vm.url.update;
                let taxrate_obj = {};
                let taxrate_arr=vm.taxrateLists;
                let info = vm.editor.info;
                let taxrate_arr_ids=[];
                if(vm.isadd && !info.appsecret){
                    this.$message({ showClose:true, message:'appsecret不能为空或零',type:'error' }); return
                }
                if(info.platform==="aisino"){
                    if(!info.nsrdzdh){
                        this.$message({ showClose:true, message:'纳税人地址电话不能为空或零',type:'error'}); return
                    }
                    if(!info.camm){
                        this.$message({ showClose:true, message:'CA密码不能为空或零',type:'error'}); return
                    }
                    if(!info.dsfptbm){
                        this.$message({ showClose:true, message:'第三方平台编号不能为空或零',type:'error'}); return
                    }
                    if(!info.jqbh){
                        this.$message({ showClose:true, message:'机器编号不能为空或零',type:'error'}); return
                    }
                }   
                if(!info.nsrmc||!info.nsrsbh||!info.appid){//每个平台都有这三个字段
                    this.$message({ showClose:true, message:'名称、识别号、APPID不能为空或零',type:'error' }); return
                }
                //税率k v 都要有
                let hasval = taxrate_arr.every(item=>item.id&&item.rate)
                if(!hasval){
                    this.$message({ showClose:true, message:'税率键值对不能为空',type:'error' }); 
                return
                }
                //每对税率的K，不能有重复
                taxrate_arr.forEach(item=>{taxrate_arr_ids.push(item.id)})
                let idsSet = new Set(taxrate_arr_ids);
                if(idsSet.size!==taxrate_arr_ids.length){
                     this.$message({ showClose:true, message:'税率键值不能重复',type:'error' }); return
                }
                taxrate_arr.map(item=>taxrate_obj[item.id]=parseFloat(item.rate/100));
                vm.editor.saveloading = true;
                let editData = Object.assign({},vm.editor.info);
                editData.taxrate = JSON.stringify(taxrate_obj);
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editor.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                        vm.editor.saveloading = false;
                    }
                })
            },
            getData:function(){
                var vm = this;
                var url = vm.url.payerlists+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                var querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0&&res.content){
                            vm.tableData = res.content.lists || [];
                            vm.pagination.total = res.content.total || 0;
                            utils.setCache(vm);
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                    vm.shade = false
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {nsrmc:"",nsrsbh:"", appid :""};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.$route.params.station_id='';
                this.getData();
            },

        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                var data = utils.getCache();
                var obj = data == '' ? {} : JSON.parse(data);
                if(obj.tableData && obj.tableData.length > 0){
                    utils.getCacheItem(vm,obj);
                }else{
                    vm.getData();
                }

            });
        },
    }

</script>

