
<template>

    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station" size="small" class="cell widthX150" placeholder="停车场" ></my-select-station>
                    <el-input v-model.trim="search.mobile"  size="small" class="cell widthX120" placeholder="手机号"></el-input>
                    <el-input v-model.trim="search.qrcode"  size="small" class="cell widthX150" placeholder="集团编码"></el-input>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addRecord" size="small"><i class="fa fa-plus"></i>添加</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit >
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="username" label="用户" min-width="60"></el-table-column>
                    <el-table-column prop="mobile" label="手机号" min-width="90"></el-table-column>
                    <el-table-column prop="building_name" label="楼栋" min-width="80"></el-table-column>
                    <el-table-column prop="unit_name" label="单元" min-width="80"></el-table-column>
                    <el-table-column prop="floor" label="楼层" min-width="50"></el-table-column>
                    <el-table-column prop="area" label="面积" min-width="100"></el-table-column>
                    <el-table-column prop="qrcode" label="集团内部编码" min-width="100"></el-table-column>
                    <el-table-column prop="visible" label="车位编码" min-width="80"></el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button @click="editRecord(scope.row)" plain size="mini"><i class="fa fa-credit-card"></i>编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="record" label-width="120px">
                    <el-form-item  label="停车场:">
                        <my-select-station v-model="record.station_id" size="small" class="cell" width='100%' placeholder="停车场" style='top:0'></my-select-station>
                    </el-form-item>
                    <el-form-item label="手机号:">
                        <el-input v-model="record.mobile" size="small" placeholder="手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="楼栋:">
                        <el-input v-model="record.building" size="small" placeholder="楼栋"></el-input>
                    </el-form-item>
                    <el-form-item label="单元:">
                        <el-input v-model="record.unit" size="small" placeholder="单元"></el-input>
                    </el-form-item>
                    <el-form-item label="楼层:">
                        <el-input v-model="record.floor" size="small" placeholder="楼层(只能是数字)" type='number'></el-input>
                    </el-form-item>
                    <el-form-item label="面积:">
                        <el-input v-model="record.area" size="small" placeholder="面积"></el-input>
                    </el-form-item>
                    <el-form-item label="集团内部编码:">
                        <el-input v-model="record.qrcode" size="small" placeholder="集团内部编码"  ></el-input>
                    </el-form-item>
                    <el-form-item label="车位编码:">
                        <el-input v-model="record.visible" size="small" placeholder="车位编码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" size="small">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>

        </div>
    </div>

</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                search:{station:'',mobile:'',qrcode:''},
                pagination:{page:1,pagesize:20,total:0,showTotal:true},
                tableData:[],
                shade:false,
                updateVisible:false,
                updateTitle:'',
                isadd:'',
                record:{station_id:'',mobile:'',building:'',unit :'',floor:'',area :'',qrcode:'',visible :''},
                carport_id:'',
            }
        },
        methods:{
            addRecord:function(){
                var vm = this;
                vm.updateVisible = true;
                vm.isadd = true;
                vm.updateTitle = "添加车位信息";
                vm.record={station_id:'',mobile:'',building:'',unit :'',floor:'',area :'',qrcode:'',visible :''}
            },
            editRecord:function(row){
                var vm = this;
                vm.updateVisible = true;
                vm.isadd = false;
                vm.updateTitle = "编辑车位信息";
                vm.record={station_id:row.station,mobile:row.mobile,building:row.building,unit :row.unit,floor:row.floor,area :row.area,qrcode:row.qrcode,visible :row.visible};
                vm.carport_id = row.id
            },
            editSubmit:function(){
                var vm = this;
                var mustFillMap={station_id:'停车场',mobile:'手机号',building:'楼栋',unit:'单元',floor:'楼层',area:'面积',qrcode:'集团内部编码',visible:'车位编码'};
                for(var i in mustFillMap){
                    if(vm.record[i]===''){
                         vm.$message({ showClose:true, message:mustFillMap[i]+'不能为空', type:'error' });
                         return;
                    }
                };
                var url = vm.isadd?'/carport/add':'/carport/update';
                var postData = {
                    station_id:vm.record.station_id,
                    mobile:vm.record.mobile,
                    building:vm.record.building,
                    unit:vm.record.unit,
                    floor:vm.record.floor,
                    area:vm.record.area,
                    qrcode:vm.record.qrcode,
                    visible:vm.record.visible,
                };
                if(!vm.isadd){postData.carport_id = vm.carport_id}
                utils.fetch(url,{method:'POST',body:postData}).then(function(res){
                    console.log(res);
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.updateVisible = false;
                            vm.$message({ showClose:true, message:res.message, type:'success' });
                            vm.getData();
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                    }
                })
            },
            getData:function(){
                var vm = this;
                var dat = "";
                if(this.search.station) dat += "&station_id="+this.search.station;
                if(this.search.mobile) dat += "&mobile="+this.search.mobile;
                if(this.search.qrcode) dat += "&qrcode="+this.search.qrcode;
                var url = '/carport/lists?page='+vm.pagination.page+"&pagesize="+vm.pagination.pagesize+dat;
                vm.shade = true;
                utils.fetch(url).then(function(res){
                    vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                    vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                    vm.shade = false
                });
            },
            setPageData:function(pageObj){
              this.pagination = pageObj;
              this.getData();
            },
            btnSearch:function(){
                this.pagination.page = 1;
                this.getData();
            },
            btnUndo:function(){
                this.search = {station:'',mobile:'',qrcode:''};
                this.pagination.page = 1;
                this.pagination.pagesize = 20;
                this.getData();
            },

        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){
                utils.getTingYunScript();
                vm.getData();
            });
        },
    }

</script>

