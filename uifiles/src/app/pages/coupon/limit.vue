<template>
  <div id='box' class="menu-hide">
        <div class="worker limit">
           <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-merchant v-model.trim="search.name" size="small" class="cell widthX170"  placeholder="商家名称"></my-select-merchant>
                    <el-input v-model.trim="search.phone" size="small" class="cell widthX120"  placeholder="手机号"></el-input>
                    <el-select v-model="search.limit_type" clearable  placeholder="限制类型" class="cell  widthX120" size="small" filterable>
                        <el-option v-for="(item,index) in limitOption" :key="index" :label="item" :value="index">
                        </el-option>
                    </el-select>
                    <el-button size="small" @click="getList"><i class="fa fa-search"></i>查找</el-button>
                    <el-button size="small" @click="btnUndo"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button v-if="authCheck('优惠劵限制增加')" size="small" @click="openEdit">增加限制</el-button>
                </div>
            </div>
             <div class='table box-width'>
                <el-table v-loading="loading" element-loading-text="拼命加载中" :data="limitList" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column property="merchant_name" label="商家名称"></el-table-column>
                    <el-table-column property="type_name" label="优惠劵名称"></el-table-column>
                    <el-table-column label="限制类型">
                        <template slot-scope="scope">
                            {{limitOption[scope.row.limit_type]}}
                        </template>
                    </el-table-column>
                    <el-table-column label="时间周期">
                        <template slot-scope="scope">
                            {{timeType[scope.row.time_span]}}
                        </template>
                    </el-table-column>
                    <el-table-column label="数量/金额">
                        <template slot-scope="scope">
                            {{upWhole(scope.row.limit_num)}}
                        </template>
                    </el-table-column>
                    <el-table-column property="used_num" label="已使用"></el-table-column>
                     <el-table-column label="操作" v-if="authCheck('优惠劵限制编辑')&&authCheck('优惠劵限制删除')">
                        <template slot-scope="scope">
                            <el-button v-if="authCheck('优惠劵限制编辑')" size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button v-if="authCheck('优惠劵限制删除')" size="mini" type="danger" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
             </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog title="优惠劵限制" :visible.sync="dialogTableVisible">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="商家名称">
                        <my-select-merchant allProperty='all' @select="merchantSelect" v-model.trim="form.merchant_name" size="small" class="cell" width="100%" placeholder="商家名称"></my-select-merchant>
                    </el-form-item>
                    <el-form-item label="限制类型">
                        <el-select v-model="form.limit_type" @change="getCouponList" placeholder="请选择限制类型">
                            <el-option v-for='(v,k) in limitType' :label="v" :value="k" :key='v'></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="优惠劵">
                        <el-select v-model="form.type_name" placeholder="请选择优惠劵" :disabled='type_name_disabled'>
                            <el-option :key="key" v-for="(item,key) in typeNameList" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="时间周期">
                        <el-select v-model="form.time_span" placeholder="请选择时间周期">
                            <el-option label="日" value="day"></el-option>
                            <el-option label="周" value="week"></el-option>
                            <el-option label="月" value="month"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="limit_type_disabled?'金额':'数量'">
                        <el-input type="number" @blur="numBlur('form')" v-model="form.limit_num" :placeholder="limit_type_disabled?'请输入金额':'请输入张数'" min = '0'></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="click" @click="submit" type="primary">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog title="优惠劵限制" :visible.sync="editVisible">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="商家名称">
                        <el-input :disabled="true" v-model="editForm.merchant_name"></el-input>
                    </el-form-item>
                    <el-form-item label="限制类型">
                        <el-input :disabled="true" v-model="limitOption[editForm.limit_type]"></el-input>
                    </el-form-item>
                    <el-form-item label="优惠劵">
                       <el-input :disabled="true" v-model="editForm.type_name"></el-input>
                    </el-form-item>
                    <el-form-item label="时间周期">
                        <el-select v-model="editForm.time_span" placeholder="请选择时间周期">
                            <el-option label="日" value="day"></el-option>
                            <el-option label="周" value="week"></el-option>
                            <el-option label="月" value="month"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="editForm.coupon_type_kind=='3'?'金额':'数量'">
                        <el-input type="number" @blur="numBlur('editForm')" :placeholder="editForm.coupon_type_kind=='3'?'请输入金额':'请输入张数'"  v-model="editForm.limit_num" min = '0'></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :disabled="editclick" @click="editSubmit" type="primary">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
  </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function(){
        return {
            loading: false,
            click:false,
            editclick:false,
            search:{},
            tableData_search: [],
            dialogTableVisible: false,
            editVisible: false,
            limit_type_disabled: false,
            type_name_disabled: false,
            limitList:[],
            pagination:{page:1,pagesize:20,total:0,showTotal:true},
            timeType:{
                'week': '周',
                'month': '月',
                'day': '日'
            },
            limitOption:{auto: '自动领券限制',buy: '购买限制',assign: '发放限制',notsure: '总额限制'},
            limitType:{},
            typeNameList: [],
            formmerchant:{},
            form:{limit_num:0,limit_type:''},
            editForm:{}
        }
    },
    mounted:function(){
        this.getList();
    },
    methods: {
        upWhole(v){
            return utils.upWhole(v);
        },
        openEdit: function(){
            this.dialogTableVisible = true;
            this.form = {limit_num:0,limit_type:''};
            this.limit_type_disabled = false;
            this.type_name_disabled = false;
        },
        getList: function(){
            var that = this;
            var param = utils.setQueryString({
                page: this.pagination.page,
                pagesize: this.pagination.pagesize,
                phone: this.search.phone,
                merchant: this.search.name,
                limit_type:this.search.limit_type
            })
            utils.fetch('/couponlimit/lists?'+param).then(function(data){
                if(0 == data.code){
                    that.limitList = data.content.lists;
                    that.pagination.total = data.content.total;
                }
            })
        },
        handleEdit: function(index,item){
            this.editVisible = true;
            this.editForm =  item;
        },
        handleDel: function(index,item){
            let that = this;
            let param = utils.setQueryString({
                id: item.id
            })
            this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                utils.fetch('/couponlimit/delete',{method: 'POST',body: param}).then(function(data){
                    if(0 === data.code){
                        that.getList();
                        that.$notify({
                            title: '成功',
                            message: data.message,
                            type: 'success'
                        });
                        that.getList();
                    }else{
                        that.$notify({
                            title: '失败',
                            message: data.message
                        });
                    }               
                })
            })
            
        },
        btnSearch: function(){

        },
        btnUndo: function(){
            this.search = {};
            this.pagination = {page:1,pagesize:20,total:0,showTotal:true};
            this.getList();
        },
        numBlur: function (type) {
            let v = this[type].limit_num;
            v = String(v);
            v = v.split('.');
            if (v[1] && v[1].length > 2) {
                v[1] = v[1].substring(0, 2);
                v = v[0] + '.' + v[1];
                v = Number(v);
                this[type].limit_num = v;
            }
        },
        setPageData:function(pageObj){
            this.pagination = pageObj;
            this.getList();
        },
        merchantSelect: function(obj){
            let vm = this;
            vm.formmerchant=obj;
            console.log('formmerchant',vm.formmerchant)
            vm.form.merchant_id = obj.id;
            let coupontype = obj.coupontype;
            vm.setFormValue(coupontype);
        },
        getSpecifyKind(){
            let vm = this;
            let url = '/coupon/couType_lists?page=1&pagesize=1&kind=3'
            utils.fetch(url).then(res=>{
                if(res.code===0){
                    vm.typeNameList = res.content.lists.map(i=>{return {value:i.id,label:i.coupon_type}});
                    vm.form.type_name = vm.typeNameList[0].value || '';
                }
             })
        },
        setFormValue(coupontype){
            let vm = this;
            if(coupontype===1){
                vm.limitType={'auto': '自动领券限制','notsure': '总额限制'};
                vm.limit_type_disabled = true;
                vm.type_name_disabled = true;
                vm.getSpecifyKind();
            }else{
                vm.limitType={'auto': '自动领券限制','buy': '购买限制','assign': '发放限制',};
                vm.form.type_name = '';
                vm.typeNameList = [];
                vm.limit_type_disabled = false;
                vm.type_name_disabled = false;
                vm.getCouponList()
            }
             vm.form.limit_type = 'auto';
        },
        getCouponList: function(){
            var that = this;
            if(that.formmerchant.coupontype=='1'){ return ;}//放行券商家，选择限制类型时不需要刷新优惠券
            this.form.type_name = "";
            this.form = JSON.parse( JSON.stringify(this.form) );
            var param = utils.setQueryString({
                merchant_id: this.form.merchant_id,
                page: 1,
                pagesize: 100
            })
            console.log('merchant_id',this.form.merchant_id)
            if(!this.form.merchant_id){console.log('merchant_id undefined');return}
            if("buy" === this.form.limit_type){
                utils.fetch('/coupon/buycreate_lists?'+param).then(function(data){
                    if(data && data.content && data.content.lists){
                      var arr = [];
                        for(var key in data.content.lists){
                            arr.push({
                                'value':data.content.lists[key].id,
                                'label':data.content.lists[key].type_name + '  (购买价格' +data.content.lists[key].amount + '元/张)'
                            })
                        }
                        that.typeNameList = arr;
                    }
                })
            }else {
                 utils.fetch('/coupon/merchant_couType?'+param).then(function(data){
                    if(data && data.content){
                        var arr = [];
                        for(var key in data.content){
                            arr.push({
                                'value':data.content[key].id,
                                'label':data.content[key].coupon_type
                            })
                        }
                        that.typeNameList = arr;
                    }
                })
            }
        },
        submit: function(){
            var that = this;
            if(that.click){return ;}
            if(that.limit_type_disabled){
                if(!(utils.validator.isMoney.test(that.form.limit_num))){
                    that.$message({ message: '金额格式不对', type: 'error' });return;
                }
            }else{
                if(!(utils.validator.isPositiveInteger.test(that.form.limit_num))){
                that.$message({ message: '数量只能输入正整数', type: 'error' });return;
                }
            }
            let form=this.form;
            var param = utils.setQueryString({
                merchant: form.merchant_id,
                create_id: form.type_name,
                limit_type: form.limit_type,
                time_span: form.time_span,
                limit_num: form.limit_num,
            })
             that.click=true;
            utils.fetch('/couponlimit/add',{method:'POST',body:param}).then(function(data){
                 that.click=false;
                if(0 === data.code){
                    that.$notify({
                        title: '成功',
                        message: data.message,
                        type: 'success'
                    });
                    that.getList();
                    that.dialogTableVisible = false;
                }else{
                    that.$notify.error({
                        title: '错误',
                        message: data.message
                    });
                }
            })
        },
        editSubmit: function(){
            var that = this;
            if(that.editclick){return ;}
            if(that.editForm.coupon_type_kind=='3'){
                if(!(utils.validator.isMoney.test(that.editForm.limit_num))){
                    that.$message({ message: '金额格式不对', type: 'error' });return;
                }
            }else{
                if(!(utils.validator.isPositiveInteger.test(that.editForm.limit_num))){
                that.$message({ message: '数量只能输入正整数', type: 'error' });return;
                }
            }
            var param = utils.setQueryString({
                id: this.editForm.id,
                merchant: this.editForm.merchant,
                create_id: this.editForm.create_id,
                limit_type: this.editForm.limit_type,
                time_span: this.editForm.time_span,
                limit_num: this.editForm.limit_num
            })
            that.editclick=true;
            utils.fetch('/couponlimit/update',{method:'POST',body:param}).then(function(data){
                that.editclick=false;
                if(0 === data.code){
                    that.$notify({
                        title: '成功',
                        message: data.message,
                        type: 'success'
                    });
                    that.getList();
                    that.editVisible = false;
                }else{
                    that.$notify.error({
                        title: '错误',
                        message: data.message
                    });
                }
            })
        },
        authCheck: function(tag){
            return utils.authCheck(this,tag);
        }
    }
}    
</script>
<style>
.limit .el-form-item{
    margin-bottom: 15px;
}
.limit .el-form-item .el-select{
    width: 100%;
}
.limit .el-form-item .select-staion .val-input{
    height: 40px;
    line-height: 40px;
}
</style>

