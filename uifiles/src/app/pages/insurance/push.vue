<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-date-picker v-model="search.vcienddate_begin" size="small" type="datetime" placeholder="商业险开始时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                    <el-date-picker v-model="search.vcienddate_end" size="small" type="datetime" placeholder="商业险结束时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                    <el-date-picker v-model="search.tcienddate_begin" size="small" type="datetime" placeholder="交强险开始时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                    <el-date-picker v-model="search.tcienddate_end" size="small" type="datetime" placeholder="交强险结束时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="importFile" size="small"><i class="fa fa-refresh"></i>导入</el-button>
                    <el-button @click="exportFile" size="small"><i class="fa fa-refresh"></i>导出</el-button>
                    <el-button @click="getData" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-input v-model.trim="search.licenseno" size="small" class="cell widthX95" placeholder="车牌"></el-input>
                <el-date-picker v-model="search.paytime_begin" size="small" type="datetime" placeholder="支付开始时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                <el-date-picker v-model="search.paytime_end" size="small" type="datetime" placeholder="支付结束时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                <el-date-picker v-model="search.clicktime_begin" size="small" type="datetime" placeholder="点击开始时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
                <el-date-picker v-model="search.clicktime_end" size="small" type="datetime" placeholder="点击结束时间" value-format="yyyy-MM-dd HH:mm:ss" style='width:150px;'></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" ref="multipleTable" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55"> </el-table-column>
                    <el-table-column prop="id" label="id" width="70"></el-table-column>
                    <!--   <el-table-column  label="用户/手机号" min-width="200">
                    <template slot-scope="scope">{{scope.row.name}}/{{scope.row.mobile}}</template>
                    </el-table-column> -->
                    <el-table-column prop="licenseno" label="车牌" min-width="100"></el-table-column>
                    <el-table-column prop='tcipremium' label="交强险" min-width="120">
                    </el-table-column>
                    <el-table-column prop='tcienddate' label="交强险到期时间" min-width="160">
                    </el-table-column>
                    <el-table-column prop='vcipremium' label="商业险" min-width="120">
                    </el-table-column>
                    <el-table-column prop='vcienddate' label="商业险到期时间" min-width="160">
                    </el-table-column>
                    <el-table-column prop='paytime' label="支付时间" min-width="140">
                    </el-table-column>
                    <el-table-column prop='clicktime' label="点击时间" min-width="140">
                    </el-table-column>
                    <!--  <el-table-column label="操作" fixed="right"  width="100">
                        <template slot-scope="scope">
                           <el-button @click='updateClick(scope.row)' plain size="mini">编辑</el-button> 
                        </template>
                    </el-table-column> -->
                </el-table>
                <div style="margin-top: 20px">
                   <!--  <el-button size="small" @click="toggleSelection([tableData3[1], tableData3[2]])">切换第二、第三行的选中状态</el-button> -->
                    <el-button size="small" v-if='deleteBtnShow' @click="deleteRow">删除</el-button>
                    <el-button size="small" @click="toggleSelection()">取消选择</el-button>
                </div>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <!-- 导入 S-->
            <el-dialog :title="importer.title" :visible.sync="importer.show" width='60%'>
                <el-upload drag :action="upload_url" :headers="cfg.header" :limit="1" :on-exceed="exceedHandle" :on-success="importSuccess" :on-error='importError' :file-list="fileList" auto-upload class='tc' accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
                </el-upload>
                <!-- <div v-loading="importshade">
                    <el-table v-if="importData.length>0" :data="importData" border height="350" style="width:100%">
                        <el-table-column prop="A" label="车牌" width="100"></el-table-column>
                        <el-table-column prop="B" label="商业险止期" min-width="80"></el-table-column>
                        <el-table-column prop="C" label="商业险保费" min-width="90"></el-table-column>
                        <el-table-column prop="D" label="交强险止期" min-width="60"></el-table-column>
                        <el-table-column prop="E" label="交强险保费" min-width="60"></el-table-column>
                    </el-table>
                </div> -->
                <div v-show='successFlag' class="tc green">导入成功</div>
            </el-dialog>
            <!-- 导入 E-->
            <!--  <el-dialog :title="editor.title"  :visible.sync="editor.show">
                <el-form label-width="120px" :model="editor.info">
                    <el-form-item label="交强险">
                        <el-input v-model="editor.info.strong_premium" size="small" placeholder="交强险"></el-input>
                    </el-form-item>
                    <el-form-item label="商业险">
                        <el-input v-model="editor.info.busi_premium" size="small" placeholder="商业险"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm" :loading='editor.btnloading'>提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog> -->
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
let config = window.etback.config;
export default {
    data: function() {
        let header = {};
        header['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Content-Type, Access-Token';
        header['Access-Control-Request-Method'] = 'POST, GET, PUT, DELETE, OPTIONS';
        header['Access-Token'] = window.localStorage.getItem('access_token');
        let cfg = {
            header,
            url: {
                lists: '/insurance/adv201902Lists',
                delete: '/insurance/adv201902Delete',
                add: '/insurance/adv201902Add',
                import: '/insurance/adv201902Import',
                export: '/insurance/adv201902Export',
            },
        }
        return {
            cfg,
            importer: { title: '人保车险活动导入', show: false },
            upload_url: '',
            //importshade:false,
            successFlag: false,
            deleteBtnShow: false,
            // importData:[],
            fileList: [],
            multipleSelection: [],
            shade: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: [],
            search_more: false,
            search: { vcienddate_begin: '', vcienddate_end: '', tcienddate_begin: '', tcienddate_end: '', paytime_begin: '', paytime_end: '', clicktime_begin: '', clicktime_end: '', licenseno: '' },
            editor: { title: '', show: false, info: { strong_premium: '', busi_premium: '', tax: '' }, btnloading: false },
            rowIds: ''
        }
    },
    methods: {
        deleteRow() {
            var vm = this;
            var url = vm.cfg.url.delete;
            let data = { ids: vm.rowIds };
            utils.fetch(url, { method: 'POST', body: data }).then(function(res) {
                if(typeof(res) != 'undefined'){
                    if (res.code == 0) {
                        vm.deleteBtnShow = false;
                        vm.getData()
                        vm.$message({ showClose: true, message: res.message, type: 'success' });
                    } else {
                        vm.deleteBtnShow = true;
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        toggleSelection(rows) {
            if (rows) {
                rows.forEach(row => {
                    this.$refs.multipleTable.toggleRowSelection(row);
                });
            } else {
                this.$refs.multipleTable.clearSelection();
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val;
            if (this.multipleSelection.length > 0) {
                this.deleteBtnShow = true;
                this.rowIds = this.multipleSelection.map(item => { return item.id }).join(',');
                console.log(this.rowIds);
            } else {
                this.deleteBtnShow = false;
            }
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        importFile() {
            this.importer.show = true;
            // this.importshade = false;
            this.successFlag = false;
            // this.importData = [];
            this.upload_url = config.host + this.cfg.url.import;
        },
        importSuccess(res, file, fileList) {
            let vm = this;
            if (res && res.code === 0) {
                vm.successFlag = true;
                vm.getData()
            } else {
                vm.successFlag = false;
                vm.$message({ showClose: true, message: res.message, type: 'error' });
            }
        },
        importError(err, file, fileList) {
            this.$message({ showClose: true, message: err || 'upload error', type: 'error' });
        },
        exceedHandle() {
            this.$message({ showClose: true, message: '单次只能传一个文件', type: 'error' });
        },
        exportFile() {
            var vm = this;
            var url = vm.cfg.url.export;
            var querystr = utils.setQueryString({ ...vm.search });
            url += querystr ? '?' + querystr : '';
            window.location.href = config.host + url;
            // utils.fetch(url).then(function(res){
            //     if(res.code===0){
            //         vm.$message({ showClose:true, message:res.message, type:'success' });
            //     }else{
            //         vm.$message({ showClose:true, message:res.message, type:'error' });
            //     }
            // });
        },
        // updateClick(row){
        //     let {strong_premium,busi_premium,tax,id} = row;
        //     this.editor={
        //         title:'车险修改',
        //         show:true,
        //         info:{strong_premium,busi_premium,tax,id},
        //         btnloading:false
        //     };
        // },
        // submitForm(){
        //     let vm = this;
        //     let url = vm.cfg.url.update;
        //     let data = vm.editor.info;
        //     utils.fetch(url,{method:'POST',body:data}).then(function(res){
        //         if(res.code === 0){
        //             vm.$message({ showClose:true, message:res.message, type:'success' });
        //             vm.editor.show = false;
        //             vm.getData();
        //         }else if(res.code === 1003){
        //             vm.$message({ showClose:true, message:res.message, type:'error' });
        //             vm.editor.show = false;
        //         }else{
        //             vm.$message({ showClose:true, message:res.message, type:'error' });
        //         }
        //     })
        // },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { name: '', mobile: '' };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        getData: function() {
            var vm = this;
            var url = vm.cfg.url.lists + "?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            let { ...searchs } = vm.search;
            let searchmap = Object.assign({}, searchs);
            var querystr = utils.setQueryString(searchmap);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                utils.setCache(vm);
                vm.shade = false;
            });
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            var data = utils.getCache();
            var obj = data == '' ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    },
}
</script>