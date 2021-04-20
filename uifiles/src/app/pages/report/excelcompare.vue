
<template>
    <div id='box' class="mainbox">
        <div class='worker'>
            <div class="excel_form">
                <el-form label-width="140px">
                    <el-form-item  label="excel上传-A:">
                        <div class="certloader">
                            <input type='file' ref='excelA' @change="fileload('excelA')"/>
                            <i class="el-icon-plus avatar-uploader-icon"></i>
                        </div>
                        <span v-if='!file_a.name'>只能上传excel</span>
                        <span v-if='file_a.name' class="green">{{file_a.name}}</span>
                    </el-form-item>
                    <el-form-item  label="对比列-A:">
                        <el-input v-model="name_a" placeholder="对比列(格式为:'A,B,C'以英文逗号分隔的字母)"></el-input>
                    </el-form-item>
                    <el-form-item  label="excel上传-B:">
                        <div class="certloader">
                            <input type='file' ref='excelB' @change="fileload('excelB')"/>
                            <i class="el-icon-plus avatar-uploader-icon"></i>
                        </div>
                        <span v-if='!file_b.name'>只能上传excel</span>
                        <span v-if='file_b.name' class="green">{{file_b.name}}</span>
                    </el-form-item>
                    <el-form-item  label="对比列-B:" >
                        <el-input v-model="name_b" placeholder="对比列(格式为:'A,B,C'以英文逗号分隔的字母)"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="editSubmit" type="primary" :loading='submitloading' size="small">提交</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="excel_table">
                 <div class="tr">
                    <span v-if='batch&&shade' class="mr10 blue">正在返回对比数据,请稍候</span>
                    <el-button @click="getTableData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                 </div>
                 <el-table v-loading="shade" element-loading-text="拼命加载中"  :data="tableData" border fit style="width:100%">
                    <el-table-column prop="batch" label="批次号" min-width="90"></el-table-column>
                    <el-table-column prop="oa" label="操作人" min-width="70"></el-table-column>
                    <el-table-column label="类型" min-width="70">
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.type=='diff'),'green':(scope.row.type=='same')}">{{cfg.type[scope.row.type]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="创建时间" min-width="140"></el-table-column>
                    <el-table-column label="操作" min-width="70">
                        <template slot-scope="scope">
                            <el-button @click="download(scope.row)" plain size="mini">下载</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script>
    import utils from '../../../utils/utils.js';
    let config = window.etback.config;
    export default {
         data:function(){
            let header = {};
            header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
            header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
            header['Access-Token'] = window.localStorage.getItem('access_token');
            let cfg={
                url:{
                    upload:'/excelcompare/upload', //args:file1,file2,keys1,keys2
                    getfile:'/excelcompare/getFile', //args:page pagesize batch
                },
                type:{'same':'相同数据','diff':'不同数据'},
                header
            }
            return {
                config,
                cfg,
                name_a:'',
                name_b:'',
                batch:'',
                file_a:{name:'',file:''},
                file_b:{name:'',file:''},
                tableData:[],
                submitloading:false,
                shade:false,//可以用来标记是否已经返回了对比数据
            }
        },
        created:function(){
            
        },
        methods:{
            editSubmit(){
                let vm = this;
                let url = vm.cfg.url.upload;
                if(vm.name_a===''|| vm.name_b===''){
                    vm.$message({ showClose:true, message:'请输入要对比的列', type:'error' }); return ;
                }
                if(vm.file_a.file===''|| vm.file_b.file===''){
                    vm.$message({ showClose:true, message:'请上传excel文件', type:'error' }); return ;
                }
                var formData = new FormData();
                formData.append('file1',vm.file_a.file);
                formData.append('file2',vm.file_b.file);
                formData.append('keys1',vm.name_a);
                formData.append('keys2',vm.name_b);
                vm.submitloading = true;
                utils.fetch(url,{ method:'POST',body:formData,headers:{}}).then(function(res){
                    if(typeof(res) != 'undefined'){
                        if(res.code == 0){
                            vm.batch = res.content.batch;
                            vm.$message({ showClose:true, message:'获取批次号成功', type:'success' });
                        }else{
                            vm.$message({ showClose:true, message:res.message, type:'error' });
                        }
                        vm.submitloading = false;
                    }
                }).then(()=>{
                    vm.getTableData();
                })
            },
            getTableData(){
                let vm = this;
                if(!vm.batch){
                    vm.$message({ showClose:true, message:'批次号为空', type:'error' });return
                }
                let url = vm.cfg.url.getfile+'?page=1&pagesize=50&batch='+vm.batch;
                vm.shade = true;
                utils.fetch(url).then(res=>{
                    if(res && res.code ===0){
                        vm.tableData = res.content.lists;
                        vm.$message({ showClose:true, message:'获取对比数据成功', type:'success' });
                    }else{
                        vm.$message({ showClose:true, message:res.message, type:'error' });
                    }
                    vm.shade = false;
                })
            },
            fileload:function(type){
                var vm = this;
                let _file  = vm.$refs[type];
                var files= _file.files;
                let name = type==='excelA'?'file_a':'file_b';
                vm[name].file=_file.files[0];
                vm[name].name=_file.files[0].name;
                _file.value = null;
            },
            
            download(row){
                window.open(row.url)
            },
            
        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){});
        },
    }

</script>
