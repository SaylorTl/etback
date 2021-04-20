<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-select v-model="search.status" size="small" class="cell widthX100" placeholder="状态" clearable>
                        <el-option v-for="(v,k) in cfg.status" :label="v" :value="k" :key='k'></el-option>
                    </el-select>
                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click='btnUndo' size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <!-- <el-button @click="addClick" size="small"><i class="fa fa-plus"></i>添加</el-button> -->
                </div>
            </div>
            <div class='table box-width'>
                <el-table :data="tableData" border style="width: 100%" v-loading="shade">
                    <el-table-column label="#" prop='id' min-width='65'></el-table-column>
                    <el-table-column label="主题" prop='theme' min-width="100"></el-table-column>
                    <!-- <el-table-column label="发起人" prop='originator_name' min-width="100"></el-table-column> -->
                    <el-table-column label="审批人" min-width='150'>
                        <template slot-scope='scope'>
                            <span>{{scope.row.flow_name.join('-->')}}</span>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column label="审批节点" prop='towhere' min-width='65'></el-table-column> -->
                    <el-table-column label="状态"  min-width='65'>
                        <template slot-scope="scope">
                            <span :class="{'red':(scope.row.status==2),'green':(scope.row.status==1)}">{{scope.row.status_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="发起时间" prop='launch_time' min-width='120'></el-table-column>
                    <el-table-column label="审批时间" prop='ex_time' min-width='120'></el-table-column>
                    <el-table-column label="摘要" prop='brief' min-width='120'></el-table-column>
                    <!-- <el-table-column label="修改时间" prop='modifytime' min-width='120'></el-table-column> -->
                    <el-table-column label="备注" prop='remark' min-width='140'></el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="detailClick(scope.row)" plain size="mini"><i class="fa fa-send-o"></i>查看</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <el-dialog :title="editor.title" :visible.sync="editor.show">
                <div class="e_progress">审批进度:
                <span v-for='(name,index) in editor.names' :key="index" :class="{'active':index===c_examer.order}">{{name}}</span>
                </div>
                <!-- <el-steps :active="c_examer.order-0+1" align-center>
                  <el-step :title="name"  v-for='(name,index) in editor.names'></el-step>
                </el-steps> -->
                <!-- 审批的内容 -->
                <template>
                    <table class="exam_detail">
                        <tr>
                            <td class="item_td">主题:</td>
                            <td class="detail_td">{{editor.theme}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">内容:</td>
                            <td class="detail_td">{{editor.content}}</td>
                        </tr>
                        <tr>
                            <td class="item_td">附件:</td>
                            <td class="detail_td">
                                <template v-if='editor.files.length>0'>
                                    <a :href="item" target="_blank" v-for='(item,index) in editor.files' :key="index">
                                        <el-button plain icon="el-icon-document" size='mini'>附件{{index+1}}</el-button>
                                    </a>
                                </template>
                            </td>
                        </tr>
                    </table>
                </template>
                <div v-loading="examers_loading">
                    <!-- 审批人的批复 -->
                    <template v-if='examers.length>0'>
                        <div class="examed_lists" v-for="(item,index) in examers" :key="index">
                            <div class="title">{{cfg.degs[index+1]+'审批人:'}}<span>{{item.flow_name[item.order]}}</span></div>
                            <table class="examed_show">
                                <tr>
                                    <td class="item_td">批复意见:</td>
                                    <td class="detail_td"><span :class="{'red':(item.status==2),'green':(item.status==1)}">{{item.status_name}}</span></td>
                                </tr>
                                <tr>
                                    <td class="item_td">备注:</td>
                                    <td class="detail_td">{{item.remark}}</td>
                                </tr>
                                <tr>
                                    <td class="item_td">附件:</td>
                                    <td class="detail_td">
                                        <template v-if='item.file.length>0'>
                                            <a :href="k" target="_blank" v-for='(k,idx) in item.file' :key="idx">
                                                <el-button plain icon="el-icon-document" size='mini'>附件{{idx+1}}</el-button>
                                            </a>
                                        </template>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </template>
                    <!-- 当前审批人的操作 -->
                    <template>
                        <div class="examed_lists">
                            <div class="title active_examer" v-if='c_examer.flow_name[c_examer.order]'>当前审批人: <span>{{c_examer.flow_name[c_examer.order]}}</span></div>
                            <div class="title green" v-else>审批完毕</div>
                            <div class="current_examer" v-if='isMine'>
                                <el-form :model="editor.info" label-width="120px">
                                    <el-form-item label="批复:">
                                        <el-radio-group v-model="editor.info.status" size="small">
                                            <el-radio-button v-for='(v,k) in cfg.agree' :label="k" :key="k">{{v}}</el-radio-button>
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item label="备注:">
                                        <el-input type="textarea" v-model="editor.info.remark" size="small"></el-input>
                                    </el-form-item>
                                    <!-- 上传附件 -->
                                    <el-form-item label="附件:">
                                        <my-upload @change='setUploadFiles' :fileLimit='cfg.file_num' :uploadUrl="cfg.url.upload" v-model='fileslist_me'></my-upload>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button @click="editSubmit" type="primary" size="small" :loading="editor.saveloading">提交批复</el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </div>
                    </template>
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
export default {
    data: function() {
        let cfg = { /*我的审批*/
            url: {
                list: '/workexamine/lists',
                exam: '/workexamine/examine',
                upload: '/workexamine/uploadfile',
            },
            file_num: 5, //上传附件数量
            status: { '0': '未审核', '1': '已通过', '2': '已拒绝'},
            agree: { '1': '同意', '2': '拒绝' },
            degs:{1:'一级',2:'二级',3:'三级',4:'四级',5:'五级'},
        };
        return {
            cfg,
            shade: false,
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            editor: { title: '审批详情', show: false, saveloading: false,content:'',files:[],theme:'',info: { status: '', id: '', remark: ''} },
            search: { status: '', title: '' },
            tableData: [],
            examers: [],
            c_examer:{flow_name: '',order: ''},
            uid:'',
            isMine:false, //当前审批人是不是自己
            examers_loading:false, 
            oa_users: { data: [], loading1: false, loading2: false, oavalue: '' }, // oa 账号请求的数据
            fileslist_me:{data:[],names:[]}  //表单附件

        }
    },
    watch: {},
    mounted() {this.uid = this.$store.state.global.login.data.user_id - 0},
    methods: {
        setUploadFiles(obj){
            this.fileslist_me = obj;
        },
        editSubmit() {
            let vm = this;
            let url = vm.cfg.url.exam;
            let data = vm.editor.info;
            // if (!data.title) { vm.$message({ showClose: true, message: '审批主题必填', type: 'error' }); return; }
            // if (!data.fid) { vm.$message({ showClose: true, message: '审批流程必填', type: 'error' }); return; }
            data.file = vm.fileslist_me.data ? vm.fileslist_me.data.join(','):''; //附件
            vm.editor.saveloading = true;
            utils.fetch(url, { method: 'POST', body: data }).then(function(res) {
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.editor.show = false;
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                    vm.editor.saveloading = false;
                }
            })
        },
        detailClick(row) {
            let names = row.flow_name;
            this.editor = {
                title: '审批详情',
                show: true,
                saveloading: false,
                content:row.content,files:row.launch_file,theme:row.theme,
                names,
                info: { status: '1', id:row.id, remark: ''}
            }
            this.examers = [];
            this.fileslist_me = '';
            this.getExamers(row.launch_id);
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function() {
            var vm = this;
            var url = vm.cfg.url.list + '?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            var { ...searchs } = vm.search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? '&' + querystr : '';
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                vm.shade = false;
                utils.setCache(vm);
            });
        },
        getExamers(id){
            var vm = this;
            var url = vm.cfg.url.list + '?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize+'&launch_id='+id;
            vm.examers_loading = true;
            utils.fetch(url).then(function(res) {
                let lists_arr = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                let len = lists_arr.length; //lists_arr length最小值为1
                vm.examers =  lists_arr.filter(item=>item.status!=0);
                let c_examer_arr = lists_arr.filter(item=>item.status==0);
                vm.c_examer = c_examer_arr.length > 0 ? c_examer_arr[0]:{flow_name: '',order: ''};
                vm.isMine = !!(vm.c_examer.user_id === vm.uid);
                vm.examers_loading = false;
            });
        },
        showExamersHistory(){},
        //重置按钮
        btnUndo: function() {
            this.search = { status: '', title: '' };
            this.pagination.page = 1;
            this.getData();
        },
        //查找
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            vm.getData();
        });
    },

}
</script>