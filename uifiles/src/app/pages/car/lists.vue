<template>

    <div id='box' class="menu-hide">
        <div class="worker car">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-plate v-model="search.car" size="small" class="cell widthX120" width='120px' placeholder="车牌"></my-select-plate>
                    <el-input v-model="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
               <!--  <el-button @click="goAuthorizePage" size="small"><i class="fa fa-user-circle"></i>授权管理页</el-button> -->
                    <el-button @click="goVirtualCarlist" size="small"><i class="fa fa-skyatlas"></i>虚拟车辆</el-button>
                    <el-button @click="goCarStatistics" size="small"><i class="fa fa-user-circle"></i>车辆锁车率统计</el-button>
                    <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="添加时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                                <el-form-item label="颜色:"><span>{{getColor(props.row.colour)}}</span></el-form-item>
                                <el-form-item label="型号:"><span>{{ props.row.model }}</span></el-form-item>
                                <el-form-item label="机架号:"><span>{{ props.row.fdjid }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column type="index"  width="40"></el-table-column>
                    <el-table-column prop="id" label="车牌ID"  width="120"></el-table-column>
                    <el-table-column prop="plate" label="车牌"  min-width="90"></el-table-column>
                    <el-table-column prop="user_name" label="车主"  min-width="90"></el-table-column>
                    <el-table-column prop="user_phone" label="手机号"  width="150"></el-table-column>
                    <el-table-column label="操作" fixed="right"  width="240">
                        <template slot-scope="scope">
                            <el-button plain size="mini" @click="updateClick(scope.$index,scope.row)"><i class="fa fa-pencil-square-o"></i>编辑</el-button>
                            <el-button plain size="mini" @click="openAuthorize(scope.$index,scope.row)"><i class="fa fa-pencil-square-o"></i>授权记录</el-button>

                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>

             <!-- 车辆授权弹窗 -->
           <el-dialog :title="authPopWin.title" :visible.sync="authPopWin.show">
                <div class='table'>
                    <el-table v-loading="authPopWin.authshade" element-loading-text="拼命加载中" :data="authPopWin.authData" border fit style="width:100%">
                        <el-table-column prop="id" label="id" width="70"></el-table-column>
                        <el-table-column prop="client_from_name" label="授权人" min-width="80"></el-table-column>
                        <el-table-column prop="client_from_phone" label="授权人手机" min-width="120"></el-table-column>
                        <el-table-column prop="client_to_name" label="被授权人" min-width="80"></el-table-column>
                        <el-table-column prop="client_to_phone" label="被授权人手机" min-width="120"></el-table-column>
                        <!-- <el-table-column label="操作" width="90">
                            <template slot-scope="scope">
                                <span>{{scope.row.status ===0?"授权":"取消授权"}}</span>
                            </template>
                        </el-table-column> -->
                        <!-- <el-table-column prop="creationtime" label="授权时间" width="160"></el-table-column> -->
                    </el-table>
                </div>
            </el-dialog>
             <!-- 车辆编辑弹窗 -->
           <el-dialog :title="editPopWin.title" :visible.sync="editPopWin.show">
                 <el-form :model="editPopWin.info">
                    <el-form-item label="车牌:" label-width="130px">
                        <el-input v-model="editPopWin.info.plate"  placeholder="请输入车牌" :disabled ='plateFlag'></el-input>
                    </el-form-item>
                    <el-form-item label="型号:" label-width="130px">
                        <el-select v-model="editPopWin.info.model"  class="widthP100" placeholder="型号">
                            <el-option v-for="item in models" :key="item.id" :value="item.id" :label="item.name">{{item.name}}
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="机架号:" label-width="130px">
                        <el-input v-model="editPopWin.info.fdjid"  placeholder="机架号"></el-input>
                    </el-form-item>
                    <el-form-item label="车身颜色:" label-width="130px">
                        <el-select v-model="editPopWin.info.color" class="widthP100" placeholder="车身颜色">
                            <el-option v-for="item in car_colors" :key="item.id" :value="item.id" :label="item.name">
                                {{item.name}}
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="车主手机:" label-width="130px">
                        <el-input v-model="editPopWin.info.phone"  placeholder="车主手机"></el-input>
                    </el-form-item>
                    <el-form-item label-width="130px">
                        <el-button @click="updateSubmit" type="primary" size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>

</template>

<script>
    import utils from '../../../utils/utils.js';
    export default {
        data:function(){
            return {
                shade:false,
                search:{car:'',phone:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:false},
                tableData:[],
                authPopWin:{title:'',show:false,authshade:false,authData:[{id:'',authorizer:'',authorized:'',operate:'',time:''}]},
                editPopWin:{title:'',show:false,info:{plate:'',model:'',fdjid:'',color:'',phone:'',car_id:''}},
                plateFlag:false,
                action:'',
                models:[{name:'型号1',id:1},{name:'型号2',id:2}],
                car_colors:[{color:'unknow',id:0,name:'未知'},{color:'red',id:1,name:'红'},
                            {color:'orange',id:2,name:'橙'},{color:'yellow',id:3,name:'黄'},
                            {color:'green',id:4,name:'绿'},{color:'navy',id:5,name:'青'},
                            {color:'blue',id:6,name:'蓝'},{color:'purple',id:7,name:'紫'},
                            {color:'gray',id:8,name:'灰'},{color:'brown',id:9,name:'棕'},
                            {color:'pink',id:10,name:'粉'},{color:'black',id:11,name:'黑'},
                            {color:'silver',id:12,name:'银'},{color:'white',id:13,name:'白'}],
            };
        },
        computed:{
            isShowTable:function(){
              return this.authData.length != 0; //有一个空白的数据
            }
        },
        methods:{
            addClick:function(){
                var vm = this;
                vm.plateFlag=false;
                vm.action = 'add';
                vm.editPopWin = {title:'添加车辆信息',show:true,info:{plate:'',model:'',fdjid:'',color:'',phone:''}}
            },
            getColor:function(val){
               return this.car_colors.find(function(item){return item.id === val}).name;
            },
            updateClick:function(index,row){
                var vm = this;
                vm.editPopWin.title= '编辑车辆信息'
                vm.editPopWin.show = true;
                vm.plateFlag = true;
                vm.action = 'edit';
                vm.editPopWin.info.plate = row.plate;
                vm.editPopWin.info.car_id = row.id;
                vm.editPopWin.info.model = row.model;
                vm.editPopWin.info.fdjid = row.fdjid;
                vm.editPopWin.info.color = row.colour;
                vm.editPopWin.info.phone = row.user_phone;
            },
            updateSubmit:function(){
                var vm = this;
                var url;
                if(vm.editPopWin.info.phone == ''){
                    vm.$message({ showClose:true, message:'手机号不能为空', type:'error' }); return ;
                }
                if(vm.editPopWin.info.plate == ''){
                    vm.$message({ showClose:true, message:'车牌号不能为空', type:'error' }); return ;
                }
                var editData={
                    plate : vm.editPopWin.info.plate,
                    color : vm.editPopWin.info.color,
                    phone : vm.editPopWin.info.phone,
                    model : vm.editPopWin.info.model,
                    fdjid : vm.editPopWin.info.fdjid
                };
                url = vm.action === 'add'?'/car/add':'/car/update';
                if(vm.action === 'edit'){editData.car_id =  vm.editPopWin.info.car_id};
                utils.fetch(url,{method:'POST',body:editData}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.editPopWin.show = false;
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            openAuthorize:function(index,row){
                var vm = this;
                var url = '/authorize/show?';
              vm.authPopWin.title = '车辆授权记录';
              vm.authPopWin.show=true;
              if(row.id) url+='car_id='+row.id;
                url+='&enabled=Y';
                url+='&user_from_phone='+row.user_phone;
              vm.authPopWin.authshade=true;
              utils.fetch(url).then(function(res){
                vm.authPopWin.authData = (typeof(res) != 'undefined' && res.code == 0 && res.content !='') ? res.content : [];
                (vm.authPopWin.authData.length!=0)&&(vm.authPopWin.authData.map(function(item){item.owner = row.user_name}))
                vm.authPopWin.authshade = false
                });
            },
            goVirtualCarlist:function(){
              var r = { path:'/car/virtual'};
              this.$router.push(r);
            },
            goCarStatistics:function(){
              var r = { path:'/car/statistics'};
              this.$router.push(r);
            },
            goAuthorizePage:function(){
              var r = { path:'/car/authorize'};
              this.$router.push(r);
            },
            getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.car) dat += "&car_id="+this.search.car;
                if(this.search.phone) dat += "&user_phone="+this.search.phone;
                var url = '/car/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(json){
                    vm.tableData = (typeof(json) != 'undefined' && json.code == 0 && json.content !='') ? json.content : [];
                    utils.setCache(vm);
                    vm.shade = false;
                });
            },
            setPageData(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {car:'',phone:''};
                this.getData();
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
