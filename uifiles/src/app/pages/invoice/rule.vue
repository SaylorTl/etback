<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150"   placeholder="停车场"></my-select-station>
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
                    <el-table-column prop="station_name" label="停车场" width="280"></el-table-column>
                    <el-table-column prop="nsrmc" label="纳税人" min-width="260"></el-table-column>
                    <el-table-column prop="expire" label="有效期(天)(0为永久有效)" min-width="140"></el-table-column>
                    <!-- <el-table-column label="规则" min-width="180">
                        <template slot-scope="scope">{{JSON.stringify(scope.row.fee_construct)}} </template>
                    </el-table-column> -->
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button @click="updateClick(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show" width='50%'>
                <el-form :model="editor.info" label-width="120px">
                    <el-form-item label="停车场:">
                        <my-select-station v-model="editor.info.station" size="small" class="cell widthP100" width="100%" placeholder="停车场" @input='getRulesArr' :disabled='!isadd'></my-select-station>
                    </el-form-item>
                    <el-form-item label="纳税人:">
                        <el-select  size="small" v-model="editor.info.nsr_id" placeholder="纳税人" v-loading="gloading.payer" filterable clearable class="widthP100">
                                <el-option v-for="i in nsrArr" :key="i.id" :label="i.nsrmc" :value="i.id">
                                </el-option>
                            </el-select>
                    </el-form-item>
                    <el-form-item label="开票有效期:">
                        <el-input v-model="editor.info.expire" size="small" placeholder="开票有效期(不填或0都为永久有效,单位为天)"></el-input>
                    </el-form-item>
                    <el-form-item label="启用日期:">
                        <el-date-picker v-model="editor.info.since" size="small" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="启用日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="月卡规则:">
                        <div v-for='(item, index) in feeInfoArr' :key="index">
                            <el-select class="widthX200" clearable size="small" v-model="item.rule_id" placeholder="规则名称" v-loading="gloading.rule">
                                <el-option v-for="i in stationRulesArr" :key="i.id" :label="i.name" :value="i.id">
                                    <span class="left">{{i.name}}</span>
                                    <span class="ruleN1">¥:{{i.N1}}</span>
                                </el-option>
                            </el-select>
                            <el-button v-if='index==0' size="small" @click.prevent="addItem" icon = 'el-icon-plus'>增加规则</el-button>
                            <el-button v-if='index!=0' size="small" @click.prevent="removeItem(index,feeInfoArr)" icon = 'el-icon-minus'>删除规则</el-button>
                            <div v-for='(fee, idx) in item.fee_ids' class="pl100" :key="idx">
                                <el-select class="widthX200"  size="small" clearable v-model="item.fee_ids[idx]" placeholder="费用名称" v-loading="gloading.rate">
                                    <el-option v-for="i in rateArr" :key="i.id" :label="i.name" :value="i.id">
                                    </el-option>
                                </el-select>
                                <el-button v-if='idx==0' size="mini" @click.prevent="addFeeItem(item.fee_ids)" icon = 'el-icon-plus' circle ></el-button>
                                <el-button v-if='idx!=0' size="mini" @click.prevent="removeItem(idx,item.fee_ids)" icon = 'el-icon-minus' circle ></el-button>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="临停规则:">
                        <div v-for='(item, index) in tmpInfoArr' :key="index">
                            <el-input v-model="item.tmp_id"  size="small" class="cell widthX200"  :disabled='true' :notClear='true'></el-input>
                            <div v-for='(fee, idx) in item.fee_ids' class="pl100" :key="idx">
                                <el-select class="widthX120"  size="small" clearable v-model="item.fee_ids[idx]" placeholder="费用名称">
                                    <el-option v-for="i in rateArr" :key="i.id" :label="i.name" :value="i.id">
                                    </el-option>
                                </el-select>
                                <el-button v-if='idx === 0' size="mini" @click.prevent="addFeeItem(item.fee_ids)" icon = 'el-icon-plus' circle ></el-button>
                                <el-button v-if='idx !== 0' size="mini" @click.prevent="removeItem(idx,item.fee_ids)" icon = 'el-icon-minus' circle ></el-button>
                            </div>
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
            let url = {
                lists:'/invoice/listsStation',
                update:'/invoice/updateStation',
                add:'/invoice/addStation',
                payerlists:'/invoice/listsTaxpayer',
                rate:'/invoice/listsFee',
            }
            return {
                url,
                shade:false,
                isadd:false,
                gloading:{rule:false,rate:false,payer:false},
                search:{station:''},
                nsrArr:[],
                rateArr:[],
                stationRulesArr:[],
                feeInfoArr:[],
                tmpInfoArr:[],
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                editor:{title:'',show:false,saveloading:false,btnText:'',info:{station:"",nsr_id:"", expire:"",since:'', fee_construct:{}}
                },
            }
        },
        methods:{
            addFeeItem(obj){
                obj.push(' ');
            },
            addItem(tmp='tmp'){ //暂时不用添加多个临停
                if(tmp == 'tmp'){
                    this.tmpInfoArr.push({tmp_id:'',fee_ids:[' ']});
                }else{
                    this.feeInfoArr.push({rule_id:'',fee_ids:[' ']});
                }
            },
            removeItem(index,obj){
                if (index !== -1) {
                    obj.splice(index, 1)
                } 
            },
            setPageData(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            updateClick(row){
                let vm = this;
                vm.editor.show = true;
                vm.editor.title = "编辑信息";
                vm.editor.btnText = "保存";
                vm.isadd = false;
                vm.editor.saveloading = false;//可加可不加   
                vm.getNsrArr();
                vm.getRulesArr(row.station);
                vm.getPayRateArr();
                //解析字段fee_construct
                let arrObj = vm.analyseFeeInfo(row.fee_construct);
                vm.feeInfoArr = arrObj.rule_array;
                vm.tmpInfoArr = arrObj.temp_array;
                vm.editor.info={id:row.id,station:row.station,nsr_id:row.nsr_id,expire:row.expire,fee_construct:'',since:row.since};
            },

            addClick(){
                let vm = this;
                vm.editor.show = true;
                vm.editor.title = "添加信息";
                vm.editor.btnText = "添加";
                vm.isadd = true;
                vm.editor.saveloading = false;
                vm.getNsrArr();
                vm.getPayRateArr();
                vm.editor.info={station:"",nsr_id:"", expire:'', fee_construct:''};
                vm.feeInfoArr = [{rule_id:'',fee_ids:['']}];
                vm.tmpInfoArr = [{tmp_id:'tmp',fee_ids:['']}];
            },
            editSubmit(){
                let vm = this;
                let url = vm.isadd?vm.url.add:vm.url.update;
                let info = vm.editor.info;
                if(info.station===''){
                    vm.$message({ showClose:true, message:'停车场不能为空',type:'error' }); return
                }
                if(info.nsr_id===''){
                    vm.$message({ showClose:true, message:'纳税人不能为空或零',type:'error' }); return
                }
                
                let fee_construct = JSON.stringify(vm.setFeeContruct());
                let editData = {
                    station:info.station,
                    nsr_id:info.nsr_id,
                    expire:info.expire,
                    since:info.since,
                    fee_construct,
                }

                if(!vm.isadd){editData.id = info.id}
                vm.editor.saveloading = true;
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
            getData(){
                var vm = this;
                var url = vm.url.lists+'?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize;
                var searchmap ={
                    "station":vm.search.station,
                }
                var querystr = utils.setQueryString(searchmap);
                url+=querystr?'&'+querystr:'';
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    utils.setCache(vm);
                    vm.shade = false
                });
            },
            btnSearch(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo(){
                this.search = {station:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },
            setFeeContruct(){
                let vm = this;
                let obj = {};
                let fee = vm.feeInfoArr;
                fee.forEach(item=>{
                    obj[item.rule_id] = new Set(item.fee_ids)
                })
                let tmp = vm.tmpInfoArr;
                tmp.forEach(item=>{
                    obj[item.tmp_id] = new Set(item.fee_ids)
                })
                return Object.assign({},obj);
            },
            analyseFeeInfo(obj){
                let rule_array = [];
                let temp_array = [];
                for(let i in obj){
                    if(i==='tmp'){
                        temp_array.push({tmp_id:i,fee_ids:obj[i].map(item=>item===''?item:item-0)})
                    }else{
                        rule_array.push({rule_id:i-0,fee_ids:obj[i].map(item=>item-0)})
                    }
                }
                if(temp_array.length==0){temp_array.push({tmp_id:'tmp',fee_ids:['']})}
                return {rule_array,temp_array};
            },
            getPayRateArr(ids=''){  //查询费用 集合
                let vm = this;
                let url = vm.url.rate+'?page=1&pagesize=1000&ids='+ids;
                vm.gloading.rate = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.content.lists){
                            vm.rateArr = res.content.lists;
                            vm.gloading.rate = false;
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getRulesArr(id) { //查询规则 集合
                let vm = this;
                if (id) {
                    vm.gloading.rule = true;
                    utils.getRulesByStationID(id).then((res) => {
                        vm.stationRulesArr = res;
                        vm.gloading.rule = false;
                        if(vm.isadd){vm.feeInfoArr = [{ rule_id: '', fee_ids: [''] }]};
                    });
                }
            },
            getNsrArr(){    //查询纳税人 集合 
                let vm = this;
                let url = vm.url.payerlists+'?page=1&pagesize=1000';
                vm.gloading.payer = true;
                utils.fetch(url).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.nsrArr = res.content.lists || [];
                            vm.gloading.payer = false;

                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                });
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

