<template>
    <div id="box" class="menu-hide">
        <div class='worker inlists'>
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-select v-model="search.status" placeholder="是否启用" size="small">
                        <el-option label="禁用" value="0" selected>
                        </el-option>
                        <el-option label="启用" value="1">
                        </el-option>
                    </el-select>
                    <el-select v-model="search.type" placeholder="广告类型" size="small">
                        <el-option label="文字" value="text" selected>
                        </el-option>
                        <el-option label="图片" value="image">
                        </el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="addAdvert" size="small"><i class="fa fa-plus"></i>添加</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%;">
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="region" label="省"></el-table-column>
                    <el-table-column prop="city" label="城市"></el-table-column>
                    <el-table-column prop="route_name" label="展示页路由"></el-table-column>
                    <el-table-column prop="status_name" label="状态"></el-table-column>
                    <el-table-column prop="type_name" label="广告类型"></el-table-column>
                    <el-table-column prop="title" label="文字广告标题"></el-table-column>
                    <el-table-column prop="remark" label="文字广告内容"></el-table-column>
                    <el-table-column prop="channel_name" label="展示渠道"></el-table-column>
                    <el-table-column prop="jump_url" label="跳转地址"></el-table-column>
                    <el-table-column label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button  @click="editSubmit(scope.row)" plain size="mini">修改</el-button>
                            <el-button  @click="delSubmit(scope.row)" plain size="mini">删除</el-button>
                            <el-button  @click="checkPhoto(scope.row)" plain size="mini">查看图片</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- 添加广告 -->
            <el-dialog title="添加广告信息" :visible.sync="addVisible" size="small">
                    <el-form  :model="addForm" >
                        <el-form-item label="省份:" label-width="120px">
                            <el-input v-model="addForm.region" placeholder="填写省份不需要加'省'字" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="城市:" label-width="120px">
                            <el-input v-model="addForm.city" placeholder="不添默认是全部市" style="width:200px"></el-input>
                        </el-form-item>
                        <el-form-item label="图片地址:" label-width="120px">
                            <el-upload
                                class="upload-demo"
                                :action="upload_url"
                                :headers="header"
                                :on-success="uploadSuccess"
                                :on-error="uploadErr"
                                multiple
                                :file-list="fileList"
                                >
                                <el-button size="small" type="primary">点击上传</el-button>
                            </el-upload>
                        </el-form-item>
                        <el-form-item label="跳转地址:" label-width="120px">
                            <el-input v-model="addForm.jump_url" style="width:200px" placeholder="跳转地址"></el-input>
                        </el-form-item>
                        <el-form-item label="文字广告标签:" label-width="120px">
                            <el-input v-model="addForm.title" style="width:200px"  placeholder="文字广告标签"></el-input>
                        </el-form-item>
                        <el-form-item label="文字广告内容:" label-width="120px">
                            <el-input v-model="addForm.remark" style="width:200px"  placeholder="文字广告内容"></el-input>
                        </el-form-item>
                        <el-form-item label="展示渠道:" label-width="120px">
                            <el-select v-model="addForm.channel" placeholder="展示渠道">
                                <el-option label="彩之云app" value="czyapp">
                                </el-option>
                                <el-option label="彩之云微信" value="czywechat">
                                </el-option>
                                <el-option label="懿轩微信" value="yxwechat">
                                </el-option>
                                <el-option label="智轩微信" value="zxwechat">
                                </el-option>
                                <el-option label="懿轩支付宝" value="yxzfb">
                                </el-option>
                                <el-option label="全部" value="all">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="前端页面路由:" label-width="120px">
                            <el-select v-model="addForm.route" placeholder="页面路由">
                                <el-option label="首页" value="index"></el-option>
                                <el-option label="支付成功页面" value="pay_after"></el-option>
                                <el-option label="通用扫码页面" value="pay_qrcode"></el-option>
                                <el-option label="车场专用扫码页面" value="pay_qrcode_s"></el-option>
                                <el-option label="道闸专用扫码页面" value="pay_qrcode_d"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="状态:" label-width="120px">
                            <el-select v-model="addForm.status" placeholder="是否启用">
                                <el-option label="启用" value="1">
                                </el-option>
                                <el-option label="禁用" value="0">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="类型:" label-width="120px">
                            <el-select v-model="addForm.type" placeholder="广告类型">
                                <el-option label="文字" value="text">
                                </el-option>
                                <el-option label="图片" value="image">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item  label-width="120px">
                            <el-button type="primary" @click="chooseAdd">添加</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
                <!-- 编辑代码 -->
                <el-dialog title="编辑广告信息" :visible.sync="editVisible" size="small">
                    <el-form  :model="editForm" >
                        <el-form-item label="城市:" label-width="120px">
                            <el-input v-model="editForm.region" placeholder="填写省份"   style="width:120px"></el-input>
                            <el-input v-model="editForm.city" placeholder="填写城市名称" style="width:120px"></el-input>
                        </el-form-item>
                        <el-form-item label="图片地址:" label-width="120px">
                            <el-upload
                                class="upload-demo"
                                :action="upload_url"
                                :headers="header"
                                :on-success="uploadSuccess"
                                :on-error="uploadErr"
                                multiple
                                :file-list="fileList"
                                >
                                <el-button size="small" type="primary">点击上传</el-button>
                            </el-upload>
                        </el-form-item>
                        <el-form-item label="跳转地址:" label-width="120px">
                            <el-input v-model="editForm.jump_url" style="width:200px" placeholder="跳转地址"></el-input>
                        </el-form-item>
                        <el-form-item label="文字广告标签:" label-width="120px">
                            <el-input v-model="editForm.title" style="width:200px"  placeholder="文字广告标签"></el-input>
                        </el-form-item>
                        <el-form-item label="文字广告内容:" label-width="120px">
                            <el-input v-model="editForm.remark" style="width:200px"  placeholder="文字广告内容"></el-input>
                        </el-form-item>
                        <el-form-item label="展示渠道:" label-width="120px">
                            <el-select v-model="editForm.channel" placeholder="展示渠道">
                                <el-option label="彩之云app" value="czyapp">
                                </el-option>
                                <el-option label="彩之云微信" value="czywechat">
                                </el-option>
                                <el-option label="懿轩微信" value="yxwechat">
                                </el-option>
                                <el-option label="智轩微信" value="zxwechat">
                                </el-option>
                                <el-option label="懿轩支付宝" value="yxzfb">
                                </el-option>
                                <el-option label="全部" value="all">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="前端页面路由:" label-width="120px">
                            <el-select v-model="editForm.route" placeholder="页面路由">
                                <el-option label="首页" value="index"></el-option>
                                <el-option label="支付成功页面" value="pay_after"></el-option>
                                <el-option label="通用扫码页面" value="pay_qrcode"></el-option>
                                <el-option label="车场专用扫码页面" value="pay_qrcode_s"></el-option>
                                <el-option label="道闸专用扫码页面" value="pay_qrcode_d"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="状态:" label-width="120px">
                            <el-select v-model="editForm.status_name" placeholder="是否启用">
                                <el-option label="启用" value="1">
                                </el-option>
                                <el-option label="禁用" value="0">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="类型:" label-width="120px">
                            <el-select v-model="editForm.type" placeholder="广告类型">
                                <el-option label="文字" value="text">
                                </el-option>
                                <el-option label="图片" value="image">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item  label-width="120px">
                            <el-button type="primary" @click="chooseEdit">提交</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
                <!-- 展示图片 -->
                <el-dialog title="展示图片" :visible.sync="dialogVisible" size="small" >
                    <div class="block">
                        <el-carousel trigger="click" height="550px">
                            <el-carousel-item v-for="(item,index) in imageList" :key="index">
                                <img :src="item" style="width: 100%;display:block"/>
                            </el-carousel-item>
                        </el-carousel>
                    </div>
                </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
let config = window.etback.config;
export default {
    data() {
        var header = {};
        header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        header['Access-Token'] = window.localStorage.getItem('access_token');
        return {
            header,
            upload_url:config.host+'/tadvert/uploadImg',
            tableData:[],
            shade:false,
            addVisible:false,
            search:{type:'',status:""},
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            addForm:{title:'',region:'',city:'',channel:'',image_url:'',jump_url:'',remark:'',route:'',status:"",type:''},
            editForm:{title:'',region:'',city:'',channel:'',image_url:'',jump_url:'',remark:'',route:'',status:"",type:''},
            fileList:[],
            imageList:[],
            editVisible:false,
            dialogVisible:false
        }
    },
    methods: {
        getData:function(){
            var vm = this;
            var data = utils.setQueryString({
                status:vm.search.status,
                type:vm.search.type,
            });
            utils.fetch('/tadvert/lists?page='+vm.pagination.page+'&pagesize='+vm.pagination.pagesize+"&"+data).then(function(res){
                if(res.code == 0 && typeof(res.content)!='undefined'){
                    vm.shade = false;
                    vm.tableData = res.content.lists
                    vm.pagination.total = res.content.total;
                }else{
                    vm.shade = false;
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        addAdvert:function(){
            var vm = this;
            vm.addForm = {};
            vm.fileList = [];
            vm.addVisible = true;
        },
        chooseAdd:function(){
            var vm = this;
            var data = vm.addForm;
            if(vm.fileList.length>0){
                vm.addForm.image_url = vm.fileList[0].url
            }
            // for(var i in vm.addForm){
            //     if(vm.addForm[i]==""){
            //         vm.$message({ message:i+"不能为空", type:'error' }); return ;
            //     }
            // }
            utils.fetch('/tadvert/add',{method:'post',body:data}).then(function(res){
                if(res.code==0){
                    vm.addVisible = false;
                    vm.$message({ message:"添加成功", type:'success' });
                    vm.getData();
                }else{
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        delSubmit:function(row){
            var vm = this;
            var id = {id:row.id};
            this.$confirm('此操作将永久删除该信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
                }).then(() => {
                    utils.fetch('/tadvert/delete',{method:'post',body:id}).then(function(res){
                        if(res.code == 0) {
                            vm.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                            vm.getData();
                        }else{
                            vm.$message({
                                type: 'error',
                                message: res.message
                            });
                        }
                    })
                }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        checkPhoto:function(row){
            var vm = this;
            vm.imageList = [];
            vm.imageList.push(row.image_url)
            vm.dialogVisible=true;
        },
        strToDate: function (str) {
            var arr = [];
            arr[0] = str.substr(0, 4);
            arr[1] = str.substr(4, 2);
            arr[2] = str.substr(6, 2);
            arr[3]= str.substr(8, 2);
            arr[4] = str.substr(10, 2);
            arr[5]= str.substr(12, 2);
            arr.forEach(function(item,index){
                if(arr[index]===''){
                    arr[index]="00"
                }
            })
            return arr[0] + "-" + arr[1] + "-" + arr[2] + " " + arr[3] + ":" + arr[4] + ":" + arr[5];
        },
        editSubmit:function(row){
            var vm = this;
            vm.editVisible = true;
            vm.editForm = row;
        },
        chooseEdit:function(){
            var vm = this;
            if(typeof Number(vm.editForm.status_name)=='number'){
                vm.editForm.status = vm.editForm.status_name == '启用' ? 1 : 0;
            }
            var data = vm.editForm;
            utils.fetch('/tadvert/update',{method:'post',body:data}).then(function(res){
                if(res.code==0){
                    vm.editVisible = false;
                    vm.$message({ message:"编辑成功", type:'success' });
                    vm.getData();
                }else{
                    vm.$message({ message:res.message, type:'error' }); return ;
                }
            })
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = {};
            this.getData();
        },
        setPageData:function(pageObj){
            this.pagination = pageObj;
            this.getData();
        },
        uploadSuccess:function(res, file, fileList){
            console.log(res,file,fileList);
            var obj = {};
            obj.name = fileList[0].name;
            obj.url = fileList[0].response.content[0];
            this.fileList.push(obj)
            this.$message({ message:res.message, type:'success' });
        },
        uploadErr:function(res, file, fileList){
            console.log(res,file,fileList)
            this.$message({ message:res, type:'error' });
        }
    },
    mounted:function(){
        var vm = this;
        vm.getData();
    }
}
</script>
<style scoped>

</style>
