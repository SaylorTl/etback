<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.tel" size="small" class="cell widthX150"  placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.holdermobilephone" size="small" class="cell widthX150"  placeholder="投保人电话"></el-input>
                    <el-input v-model.trim="search.insuredmobilephone" size="small" class="cell widthX150"  placeholder="被投保人电话"></el-input>
                     <el-input v-model.trim="search.licenseno" size="small" class="cell widthX150"  placeholder="车牌"></el-input>
                    
                     <el-select v-model="search.status" size="small" class="cell widthX100"  placeholder="状态">
                        <el-option v-for="(k,v) in cfg.status" :label="k" :value="v" :key="v"></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-date-picker v-model="search.creationtime_begin" size="small" type="datetime" placeholder="创建开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.creationtime_end" size="small" type="datetime" placeholder="创建结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData"   border fit style="width:100%">
                    <el-table-column type='index' width="70"></el-table-column>
                    <el-table-column prop="tel" label="电话" min-width="100"></el-table-column>
                    <el-table-column prop='deadline' label="车险到期时间" min-width="120">
                    </el-table-column>
                    <el-table-column prop='status' label="状态" min-width="80">
                        <template slot-scope="scope">{{cfg.status[scope.row.status]}}</template>
                    </el-table-column>
                    <el-table-column prop='awarded' label="是否发过奖品" min-width="80">
                        <template slot-scope="scope">{{cfg.awarded[scope.row.awarded]}}</template>
                    </el-table-column>
                    <el-table-column prop='licenseno' label="车牌" min-width="90">
                    </el-table-column>
                    <el-table-column prop='holdermobilephone' label="投保人电话" min-width="120">
                    </el-table-column>
                    <el-table-column prop='insuredmobilephone' label="被投保人电话" min-width="120">
                    </el-table-column>
                    <el-table-column prop='creationtime' label="创建时间" min-width="120">
                    </el-table-column>
                    <el-table-column label="操作" fixed="right"  min-width="120">
                        <template slot-scope="scope">
                           <el-button v-if='scope.row.status===2&&scope.row.awarded===1' @click='checkClick(scope.row)' plain size="mini">发送奖品</el-button>
                           <el-button @click='detailClick(scope.row)' plain size="mini">查看详情</el-button> 
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title"  :visible.sync="editor.show">
                <p class='awarded_adv_p'>尊敬的EP车主，您的奖品已发放，已获得
                <input type="text" v-model="editor.name" placeholder="">
                赶快去
                <input type="text" v-model="editor.place" placeholder="">
                查看吧，有疑问请咨询
                <input type="text" v-model="editor.mobile" placeholder="">
                </p>
                <p class="tr"><el-button type="primary" round size='mini' @click="submitForm" :loading='editor.btnloading'>提交</el-button></p>
            </el-dialog>
            <el-dialog :title="advdetail.title"  :visible.sync="advdetail.show" width='80%'>
                     <ul class='advs_showdetail'>
                         <li v-for='(v,k) in cfg.detail' :key="k">
                             <span class="label blue">{{v}}:</span>
                             <span class='value' v-if="cfg[k]">{{cfg[k][advsdetails[k]]}}</span>
                             <span :class="['value',{'red':k==='vcipremium'}]" v-else>{{advsdetails[k]}}</span>
                         </li>
                     </ul>
                
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import utils from '../../../utils/utils.js';
    let config = window.etback.config;
      export default {
        data:function(){
            let cfg = {
                url:{
                    lists:'/insurance/bxhLists',
                    update:'/insurance/update',
                    award:'/insurance/bxhAward',
                    export:'/insurance/bxhExport'
                },
                status:{'1':'进行中','2':'已完成'},
                awarded:{'1':'否','2':'是'},
                newcarind:{'Y':'新车','N':'旧车'},
                transferind:{'Y':'是','N':'否'},
                insurancetype:{'10':'单商','12':'交商不含损','13':'交商含损'},
                isImportCar:{'0':'国产车','1':'进口车'},
                vehicleusagetype:{'01':'营运','02':'非营运'},
                isloancar:{'Y':'是','N':'否'}, 
                insureflag:{'1':'新保','2':'续保','3':'转保'},
                detail:{
                        'clientid':'用户id',
                        'tel':'电话',
                        'deadline':'车险到期时间',
                        'status':'状态',
                        'awarded':'是否发过奖品',
                        //'notice':'提示投保中断消息',  
                        'creationtime':'创建时间',
                        'applyno':'订单号',
                        'createdate':'订单创建时间',
                        'updatedate':'订单修改时间',
                        'insurancecode':'保险公司代码',
                        'usercode':'操作员',
                        'username':'操作员名称',
                        'underwritedate':'承保时间',
                        'sumpremium':'总保费',
                        'vcipolicyno':'商业险保单号',
                        'vcistartdate':'商业险起期',
                        'vcienddate':'商业险止期',
                        'vcipremium':'商业险保费',
                        'taxpremium':'车船税',
                        'tcipolicyno':'交强险保单号',
                        'tcistartdate':'交强险起期',
                        'tcienddate':'交强险止期',
                        'tcipremium':'交强险保费',
                        'frameno':'车架号',
                        'licenseno':'车牌号',
                        'modelname':'车辆品牌',
                        'registerdate':'车辆初登日期',
                        'engineno':'发动机号',
                        'carownername':'车主姓名',
                        //'carowneridno':'车主证件号码',
                        'holdername':'投保人姓名',
                        //'holderidno':'投保人证件号码',
                        'holdermobilephone':'投保人手机号',
                        'holdersex':'投保人性别',
                        'insuredname':'被投保人姓名',
                        //'insuredidno':'被投保人证件号码',
                        'insuredmobilephone':'被投保人手机号',
                        'insuredsex':'被投保人性别',
                        'driveareaname':'投保城市',
                        //'kindlist':'车险详情'
                        'newcarind':'是否新车',
                        'transferind':'是否过户车',
                        'insurancetype':'产品组合',
                        'isImportCar':'是否进口车',
                        'carage':'车龄(月)',
                        'actualvalue':'新车购置价',
                        'vehicleusagetype':'营业性质',
                        'vehiclenature':'车辆性质',
                        'vehicletype':'车辆种类',
                        'dangernum':'出险次数',
                        'isloancar':'是否贷款车',
                        'insureflag':'新转续'
                    }
            }
            return {
                cfg,
                shade:false,
                search_more:false,
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                search:{tel:'',holdermobilephone:'',insuredmobilephone:'',licenseno:'',status:'',creationtime_begin:'',creationtime_end:''},
                editor:{title:'',show:false,id:'',name:'',mobile:'',place:'',btnloading:false},
                advdetail:{title:'车险详情',show:false},
                advsdetails:{},
            }
        },
        methods:{
            detailClick(row){
                this.advdetail.show = true;
                this.advsdetails = row;
            },
            checkClick(row){
                this.editor= {title:'发放奖品信息',show:true,id:row.id,name:'',mobile:'',place:'',btnloading:false};
            },
            submitForm(){
                let vm = this;
                let url = this.cfg.url.award;
                let {id,name,mobile,place} = vm.editor;
                if(!name|| !mobile||!place){
                    vm.$message({ showClose:true, message:'name、mobile、place不能为空', type:'error' });return
                }
                let data = {id,name,mobile,place};
                vm.editor.btnloading= true;
                utils.fetch(url,{method:'POST',body:data}).then(function(res){
                    if(res.code ===0){
                        vm.$message({ showClose:true, message:res.message, type:'success' });
                        vm.editor.show = false;
                        vm.editor.btnloading= false;
                        vm.getData()
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                });
            },
            setPageData(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo(){
                this.search = {tel:'',holdermobilephone:'',insuredmobilephone:'',licenseno:'',status:'',creationtime_begin:'',creationtime_end:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            getData(){
                var vm = this;
                var url = vm.cfg.url.lists+"?page="+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                let {...searchs}=vm.search;
                let searchmap=Object.assign({},searchs);
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false;
                });
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            exportFile(){
                var vm = this;
                var url = vm.cfg.url.export;
                var querystr = utils.setQueryString(vm.search);
                var connect = url.indexOf('?')>0?'&':'?';
                url+=querystr?connect+querystr:'';
                window.location.href = config.host + url;
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


