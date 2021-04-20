<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-input v-model.trim="search.identifier" size="small" class="cell widthX150"  placeholder="资料编码"></el-input>
                    <el-input v-model.trim="search.datum_name" size="small" class="cell widthX150"  placeholder="资料名称"></el-input>
                    <el-select size="small" v-model="search.status" clearable placeholder="状态" class="widthX100" >
                        <el-option v-for="(k,v) in cfg.status" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-select size="small" v-model="search.type" clearable placeholder="资料类型" class="widthX120" >
                        <el-option v-for="(k,v) in cfg.type" :key="v" :label="k" :value="v">
                        </el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <my-linkage-dept v-model="search.dept"></my-linkage-dept>
                 <my-select-station v-model.trim="search.station_id" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
                <el-date-picker v-model="search.begin_time" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
                <el-date-picker v-model="search.end_time" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>

            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="大区/事业部:"><span>{{props.row.area_name+'/'+props.row.dept_name}}</span></el-form-item>
                                <template v-if="props.row.type === 'coupon'">
                                     <el-form-item label="购买方式:"><span>{{ props.row.buy_type }}</span></el-form-item>
                                     <el-form-item label="优惠方式:"><span>{{ props.row.coupon_type }}</span></el-form-item>
                                     <el-form-item label="数量限制:"><span>{{ props.row.num_limit }}</span></el-form-item>
                                </template>
                                 <template v-if="props.row.type === 'property'">
                                    <el-form-item label="分成模式:"><span>{{ shareModelList[props.row.share_model] || ''}}</span></el-form-item>
                                    <el-form-item label="分成比例:"><span>{{ props.row.share_model_limit }}</span></el-form-item>
                                </template>
                                <template v-if="props.row.type !== 'property' && props.row.type !== 'coupon'">
                                    <el-form-item label="金额:"><span>{{ props.row.amount }}</span></el-form-item>
                                    <el-form-item label="基数:"><span>{{ props.row.base }}</span></el-form-item>
                                    <el-form-item label="商户月卡数:"><span>{{ props.row.cards }}</span></el-form-item>
                                    <el-form-item label="甲方:"><span>{{props.row.party_a}}</span></el-form-item>
                                    <el-form-item label="乙方:"><span>{{props.row.party_b}}</span></el-form-item>
                                    <el-form-item label="丙方:"><span>{{props.row.party_c}}</span></el-form-item>
                                    <el-form-item label="设备套数:"><span>{{props.row.sets}}</span></el-form-item>
                                </template>
                                <el-form-item label="开始时间:"><span>{{props.row.start_time}}</span></el-form-item>
                                <el-form-item label="结束时间:"><span>{{ props.row.end_time }}</span></el-form-item>
                                <el-form-item label="有效时间:"><span>{{props.row.useful_time}}年</span></el-form-item>
                                <el-form-item label="备注:"><span>{{props.row.remark}}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50"></el-table-column>
                    <el-table-column prop="identifier" label="资料编码" min-width="90"></el-table-column>
                    <el-table-column prop="name" label="资料名称" min-width="100"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="100"></el-table-column>
                    <el-table-column label="资料状态" min-width="70">
                        <template slot-scope="scope">
                            <span>{{cfg.status[scope.row.status]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="资料类型" min-width="80">
                        <template slot-scope="scope">
                            <span>{{cfg.type[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="110"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="110"></el-table-column>
                    <el-table-column prop="uploader" label="上传人" min-width="70"></el-table-column>
                    <el-table-column label="操作" min-width="140">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>修改</el-button>
                            <a :href="scope.row.file" target="_blank">
                                <el-button plain size="mini"><i class="fa fa-credit-card"></i>预览</el-button>
                            </a>
                           <!--  <el-button @click="downClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>api下载</el-button>
                            <a :href="scope.row.file" download>a连接下载</a>
                             -->
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editInfo.title" :visible.sync="editInfo.show">
                <el-form :model="editInfo.info" label-width="120px" :rules="rules"  ref="infoForm">
                    <el-form-item  label="资料类型:">
                        <el-select size="small" v-model="editInfo.info.type" clearable placeholder="请选择">
                            <el-option v-for="(v,k) in cfg.type" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item  label="资料名称:" prop="datum_name">
                        <el-input v-model="editInfo.info.datum_name" size="small"></el-input>
                    </el-form-item>
                    <el-form-item v-for="(item, idx) in stationArr" :label="'停车场' + (idx+1)" :key="idx">
                        <my-select-station v-model.trim="item.id" size="small" placeholder="停车场" width='80%' class='inline-block'></my-select-station>
                        <el-button v-if='idx==0' icon="el-icon-plus" size="small"  type="success" @click.prevent="addItem">新增车场</el-button>
                        <el-button v-if='idx!=0' icon="el-icon-delete" size="small"  type="danger" @click.prevent="removeItem(idx)">删除车场</el-button>
                    </el-form-item>
                    <el-form-item  label="(租金)金额:" prop="amount" v-if='!(editInfo.info.type==="coupon" || editInfo.info.type==="property")'>
                        <el-input v-model="editInfo.info.amount" size="small"></el-input>
                    </el-form-item>
                    <el-form-item  label="商户月卡数:" v-if='editInfo.info.type=="merchant"'>
                        <el-input v-model="editInfo.info.cards" size="small"></el-input>
                    </el-form-item>
                    <template v-if='editInfo.info.type=="EP"'>
                        <el-form-item  label="设备套数:" prop="sets">
                            <el-input v-model="editInfo.info.sets" size="small"></el-input>
                        </el-form-item>
                        <el-form-item  label="基数:" prop="base">
                            <el-input v-model="editInfo.info.base" size="small"></el-input>
                        </el-form-item>
                    </template>
                    <template v-if='editInfo.info.type=="coupon"'>
                        <el-form-item  label="购买方式:" prop="buy_type">
                            <el-input v-model="editInfo.info.buy_type" size="small"></el-input>
                        </el-form-item>
                        <el-form-item  label="优惠方式:" prop="coupon_type">
                            <el-input v-model="editInfo.info.coupon_type" size="small"></el-input>
                        </el-form-item>
                        <el-form-item  label="数量限制:" prop="num_limit">
                            <el-input v-model="editInfo.info.num_limit" size="small"></el-input>
                        </el-form-item>
                    </template>
                    <template v-if='editInfo.info.type=="property"'>
                        <el-form-item  label="分成模式:">
                            <el-select v-model="editInfo.info.share_model" size="small">
                                <el-option v-for="(v,k) in shareModelList" :label="v" :value="k" :key="v"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item  label="分成比例:" prop="share_model_limit">
                            <el-input v-model="editInfo.info.share_model_limit" size="small"></el-input>
                        </el-form-item>
                    </template>
                    <template v-if='editInfo.info.type=="EP" || editInfo.info.type=="property"'>
                        <el-form-item  label="甲方:" prop="party_a">
                            <el-input v-model="editInfo.info.party_a" size="small"></el-input>
                        </el-form-item>
                        <el-form-item  label="乙方:" prop="party_b">
                            <el-input v-model="editInfo.info.party_b" size="small"></el-input>
                        </el-form-item>
                        <el-form-item  label="丙方:" prop="party_c">
                            <el-input v-model="editInfo.info.party_c" size="small"></el-input>
                        </el-form-item>
                    </template>
                    <el-form-item  label="资料编码:" prop="identifier">
                        <el-input v-model="editInfo.info.identifier" size="small"></el-input>
                    </el-form-item>
                    <el-form-item  label="资料上传:" v-if="isadd">
                        <el-upload :action="actionurl" :headers="cfg.header" :file-list="fileList" :on-success='importSuccess' :on-error='importError' :before-remove='removeFile'>
                          <el-button size="small" type="primary">点击上传</el-button><span>只能上传PDF资料且小于10M</span>
                        </el-upload>
                    </el-form-item>
                    <el-form-item  label="状态:">
                        <el-select size="small" v-model="editInfo.info.status" clearable placeholder="请选择">
                            <el-option v-for="(v,k) in cfg.status" :key="k" :label="v" :value="k">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item  label="资料上传人:" prop="uploader">
                        <el-input v-model="editInfo.info.uploader" size="small"></el-input>
                    </el-form-item>
                    <el-form-item  label="有效期时间:"  prop="useful_time">
                        <el-input placeholder="有效期单位:年" v-model="editInfo.info.useful_time" size="small"></el-input>
                    </el-form-item>
                    <el-form-item  label="有效期开始时间:" >
                        <el-date-picker v-model="editInfo.info.start_time" size="small"  type="date" placeholder="选择日期" class="widthP100" value-format="yyyy-MM-dd">
                         </el-date-picker>
                    </el-form-item>
                    <el-form-item  label="有效期结束时间:" >
                        <el-date-picker v-model="editInfo.info.end_time" size="small"  type="date" placeholder="选择日期" class="widthP100" value-format="yyyy-MM-dd">
                         </el-date-picker>
                    </el-form-item>
                    <el-form-item  label="备注说明:" prop="remark">
                        <el-input type="textarea" v-model="editInfo.info.remark" size="small"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small" :loading='editInfo.saveloading'>保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    let config = window.etback.config;
    export default {
        data:function(){
            let header = {};
            header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
            header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
            header['Access-Token'] = window.localStorage.getItem('access_token');
            let cfg={
                url:{
                    list:'/paper/lists',
                    update:'/paper/update',
                    add:'/paper/add',
                    import:'/paper/uploadFile', //args:file
                    down:'/paper/download',
                    perview:'/paper/show',
                },
                type:{
                    'EP':'易停合同',
                    'merchant':'商户合同',
                    'check':'验收单',
                    'property': '物业分成协议',
                    'coupon':'优惠券合同'
                },
                status:{'valid':'生效','overdue':'过期','renew':'续签','abolish':'废除'},
                header
            }
            let rules = this.getRules();
            return {
                config,
                cfg,
                actionurl:config.host+cfg.url.import,
                shade:false,
                search_more:false,
                isadd:true,
                editInfo:{show:false,title:'',saveloading:false,info:{amount:'',base:'',cards:'',datum_name:'',end_time:'',file:'',identifier:'',party_a:'',party_b:'',party_c:'',remark:'',sets:'',start_time:'',station_id:'',status:'',type:'',uploader:'',useful_time:'',buy_type:'',coupon_type:'',num_limit:'',share_model:'',share_model_limit:''}},
                search:{datum_name:'',begin_time:'',end_time:'', dept:'',identifier:'',station_id:'',status:'',type:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                fileList:[],
                stationArr:[{id:''}],
                rules,
                shareModelList: {
                    B:'比例',
                    S:'特殊',
                    F:'固定',
                    U:'未知'
                }
            }
        },
        methods:{
            addItem(){
                this.stationArr.push({id:''});
            },
            removeItem(idx){
                this.stationArr.splice(idx,1)
            },
            importSuccess(res, file, fileList){
                let vm = this;
                if(typeof(res) != 'undefined'){
                    if(res.code === 0){
                        vm.editInfo.info.file = res.content.file;
                        vm.$message({ showClose:true, message:res.message, type:'success' });
                    }else{
                        vm.fileList = [];
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                }
            },
            importError(err, file, fileList){
                this.$message({ showClose:true, message:'PDF文件过大!', type:'error' });
            },
            removeFile (file, fileList) {
                let len = fileList.length
                if (len <= 1) {
                    this.editInfo.info.file = '';
                } else {
                    const remainFileList = fileList.filter(i => i.uid !== file.uid);
                    const res = remainFileList[remainFileList.length-1]['response'];
                    if(res.code === 0){
                        this.editInfo.info.file = res.content.file;
                    } 
                }    
            },
            viewClick(row){   //暂时用不上
                let vm = this;
                let url = `${vm.cfg.url.perview}?datum_id=${row.id}`;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0 && res.content){
                            let file = res.content.file; //file路径已经通过lists返回
                            window.open(file)
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }

                    }
                })
            },
            downClick(row){
                let vm = this;
                let url = `${vm.config.host}${vm.cfg.url.down}?datum_id=${row.id}`;
                let header = vm.cfg.header;
                fetch(url,{method:'GET',header}).then(res=>{
                   return res.json();
                }).then(data=>{

                })
                //window.location=row.file;
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            updateClick(row){
                let vm = this;
                vm.isadd = false;
                vm.fileList = [];
                let {id:datum_id,name:datum_name,station:station_id,area_name,dept_name,station_name,creationtime,modifytime,...obj} = row;
                let info = {datum_id,datum_name,station_id,...obj};
                vm.stationArr = (info.station_id+'').split(',').map(item=>{
                    return {id:parseInt(item)}
                });
                vm.editInfo={show:true,title:'修改信息',saveloading:false,info};
            },
            addClick:function(){
                var vm = this;
                vm.isadd = true;
                vm.fileList = [];
                vm.stationArr = [{id:''}];
                vm.editInfo={show:true,title:'添加信息',saveloading:false,info:{}};
            },
            editSubmit:function(){
                var vm = this;
                var editData=vm.editInfo.info;
                var url = vm.isadd?vm.cfg.url.add:vm.cfg.url.update;
                let valimap={"datum_name":"资料名称","end_time":"有效期结束时间","file":"上传的pdf资料","identifier":"资料编码","start_time":"有效期开始时间","status":"状态","type":"资料类型","uploader":"资料上传人","useful_time":"有效期时间"};
                if(editData.type === 'coupon') {
                    valimap['buy_type'] = '购买方式';
                    valimap['coupon_type'] = '优惠方式';
                    valimap['num_limit'] = '数量限制';
                }
                for(let i in valimap){
                    if(editData[i]==='' || typeof editData[i] === 'undefined' || editData[i] === null){
                        vm.$message({ showClose:true, message:valimap[i]+'不能为空',type:'error'});return;
                    }
                }

                let filterEmptyId = vm.stationArr.filter(item=>item.id!=='');

                if(filterEmptyId.length === 0){
                     vm.$message({ showClose:true, message:'车场不能为空',type:'error'});return;
                }
                
                let stationIDArr =  filterEmptyId.map(item=>item.id);

                if(stationIDArr.length > 1 && this.checkRepeat(stationIDArr)){
                     vm.$message({ showClose:true, message:'车场不能重复',type:'error'});return;
                }

                editData.station_id = stationIDArr.join(',');
                // let etime = editData.end_time.replace(/-/g,'')-0;
                // let stime = editData.start_time.replace(/-/g,'')-0;
                // if(etime-stime<0){
                //     vm.$message({ showClose:true, message:'结束时间不能在开始时间之前',type:'error'});return;
                // }
                this.$refs['infoForm'].validate(valid => {
                    if(valid){
                        vm.editInfo.saveloading = true;
                        utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                            if(typeof(res) != 'undefined'){
                                if(res.code == 0){
                                    vm.editInfo.show = false;
                                    vm.getData();
                                }else{
                                    vm.$message({ showClose:true, message:res.message, type:'error' });
                                }
                                    vm.editInfo.saveloading = false;
                            }
                        })
                    }
                }) 
                
            },
            getData:function(){
                var vm = this;
                var url = vm.cfg.url.list+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var {...searchs} = vm.search;
                var querystr = utils.setQueryString(searchs);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    vm.shade = false;
                    utils.setCache(vm);
                });
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {datum_name:'',begin_time:'',end_time:'', dept:'',
                identifier:'',station_id:'',status:'',type:''};
                this.search_more = false;
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            btnMore:function(){
                this.search_more = !this.search_more;
            },
            checkLength (rule, value, callback) {
                if (rule['field'] !== 'remark' && value && value.length > 50) {
                    callback(new Error(' '));
                    this.getMessage('default', '长度在 50 个字符 之内');
                }else if (rule['field'] === 'remark' && value && value.length > 500) {
                    callback(new Error(' '));
                    this.getMessage('default', '长度在 500 个字符 之内');
                }  else {
                    callback();
                }
            },
            checkNumber (rule, value, callback) {
                if (value && !utils.validator.isNumber.test(value)) {
                    callback(new Error(' '));
                    this.getMessage(rule['field'], '必须为 数字');
                } else {
                    if (parseFloat(value) < 0) {
                        callback(new Error(' '));
                        return this.getMessage(rule['field'], '不能为负数');
                    }else if (parseFloat(value) == 0 && rule['field'] === 'num_limit'){
                        callback(new Error(' '));
                        return this.getMessage(rule['field'], '不能为0');
                    }
                    callback();
                }
            },
            checkOtherInput(rule, value, callback){
                if (value && utils.validator.isNumber.test(value)) {
                    callback(new Error(' '));
                    this.getMessage(rule['field'], '不能全是数字');
                } else {
                    if (utils.validator.isAllPunctuation.test(value)) {
                        callback(new Error(' '));
                        return this.getMessage(rule['field'], '不能全是标点符号');
                    }
                    callback();
                }
            },
            checkRepeat (arr) {
                if(arr && arr.length){
                    let set = new Set(arr);
                    return !(set.size === arr.length);
                }
                return false
            },
            getRules () {
                let rulesArr = ['datum_name','amount','cards','sets','base',
                            'party_a','party_b','party_c','buy_type','coupon_type',
                            'num_limit','share_model_limit','identifier','uploader','remark'];

                let rules = {}
                
                rulesArr.forEach(item => {
                    rules[item] = [{validator: this.checkLength, trigger: ['blur']}]
                    if (item === 'num_limit') {
                        rules[item].push({validator: this.checkNumber, trigger: ['blur']})
                    } else if (item === 'buy_type' || item === 'coupon_type') {
                        rules[item].push({validator: this.checkOtherInput, trigger: ['blur']})
                    }
                })
                rules['useful_time'] = [{validator: this.checkNumber, trigger: ['blur']}]

                return rules
            },
            getMessage (field, message) {
                const fieldObj = {
                    useful_time: '有效期时间',
                    num_limit: '数量限制',
                    identifier: '资料编码',
                    buy_type: '购买方式',
                    coupon_type: '优惠方式',
                    default: ''
                }
                this.$message({ showClose:true, message:`${fieldObj[field]}${message}`, type:'error' });
            }
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
