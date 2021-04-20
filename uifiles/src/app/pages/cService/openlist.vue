<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-input v-model="search.plate" size="small" class="cell widthX120" placeholder="车牌"></el-input>
                    <el-select v-model="search.reason" size="small" class="cell widthX100" clearable placeholder="原因">
                        <el-option v-for="(v,k) in cfg.reason" :label="v" :value="k" :key='k'></el-option>
                    </el-select>
                    <el-select v-model="search.status" size="small" class="cell widthX100" clearable placeholder="状态">
                        <el-option v-for="(v,k) in cfg.status" :label="v" :value="k" :key='k'></el-option>
                    </el-select>
                    <el-select v-model="search.type" size="small" class="cell widthX100" clearable placeholder="方向">
                        <el-option v-for="(v,k) in cfg.type" :label="v" :value="k" :key='k'></el-option>
                    </el-select>
                    <el-button @click="btnMore" size="small"><i :class="['fa',search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选</el-button>
                    <el-button @click="getData()" size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
                <div class="right">
                    <el-button @click="getData()" size="small"><i class="fa fa-refresh"></i>刷新</el-button>
                </div>
            </div>
            <div v-show="search_more" class='condition-more clearfix box-width'>
                <el-select v-model="search.source" size="small" class="cell widthX100" clearable placeholder="来源">
                    <el-option v-for="(v,k) in cfg.source" :label="v" :value="k" :key='k'></el-option>
                </el-select>
                <el-date-picker v-model="search.datetimerange" size="small" type="datetimerange" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="widthX350" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%">
                     <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form label-position="left" inline class="demo-table-expand">
                                <el-form-item label="操作人手机:"><span>{{ props.row.phone }}</span></el-form-item>
                                <!-- <el-form-item label="状态:"><span>{{cfg.status[props.row.status]}}</span></el-form-item>
                                <el-form-item label="原因:"><span>{{cfg.reason[props.row.reason]}}</span></el-form-item> -->
                                <el-form-item label="备注:"><span>{{ props.row.remark }}</span></el-form-item>
                                <el-form-item label="用户名:"><span>{{ props.row.username }}</span></el-form-item>
                                <el-form-item label="用户手机:"><span>{{ props.row.mobile }}</span></el-form-item>
                                <el-form-item label="创建时间:"><span>{{ props.row.creationtime }}</span></el-form-item>
                                <el-form-item label="修改时间:"><span>{{ props.row.modifytime }}</span></el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="#" min-width="40"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="110"></el-table-column>
                     <el-table-column prop="plate" label="车牌" min-width="90"></el-table-column>
                    <el-table-column label="方向" width="90">
                        <template slot-scope="scope">{{cfg.type[scope.row.type]}}</template>
                    </el-table-column>
                     <el-table-column label="状态" min-width="90">
                         <template slot-scope="scope">{{cfg.status[scope.row.status]}}</template>
                     </el-table-column>
                    <el-table-column prop="device_name" label="设备名称" min-width="80"></el-table-column>
                    <el-table-column label="来源" width="90">
                        <template slot-scope="scope">{{cfg.source[scope.row.source]}}</template>
                    </el-table-column>
                    <el-table-column label="原因" min-width="140">
                         <template slot-scope="scope">{{cfg.reason[scope.row.reason]}}</template>
                     </el-table-column>
                    <el-table-column label="操作" min-width="120">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.img_url.length>0" @click="imgshow(scope.row)" plain size="mini">查看图片</el-button>
                           <!--  <el-button v-if="scope.row.reason ==='recover'&&scope.row.status==='N'" @click="updateClick(scope.row)" plain size="mini">编辑</el-button> -->
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator v-if="tableData.length!=0" @change='setPageData($event)' :pagination='pagination'></my-paginator>
            <preview-img v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <el-dialog :title="updateTitle" :visible.sync="updateVisible">
                <el-form :model="editInfo" label-width="120px">
                    <el-form-item label="当前状态:">
                        <el-radio-group v-model="editInfo.status">
                            <el-radio :label="'Y'">已处理</el-radio>
                            <el-radio :label="'N'">未处理</el-radio>
                        </el-radio-group>
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
import utils from '../../../utils/utils.js';
import previewImg from "../../component/previewImg/index.vue";
export default {
    data: function() {
        let cfg = {
            reason: { 'position_occup': '月卡共享车位被占临停进场', 'overdue': '月卡过期', 'temp': '普通临停进场', 'recover': '后续追缴', 'specail_car': '特殊车辆', 'specail_user': '特殊人员', 'no_motor': ' 非机动车', 'month': '月卡用户', 'temp_free': '临停免费', 'temp_ispaid': '临停已支付' },
            type: { 'in': '进场', 'out': '出场' },
            status: { 'Y': '已处理', 'N': '未处理' },
            source: { 'assistant': '车场助手', 'custom': '客服', 'month': '紧急开闸','ep_butler':'EP车管家' }
        };
        return {
            cfg,
            shade: false,
            updateVisible: false,
            search_more: false,
            updateTitle: '',
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            search: { station_id: '', plate: '', reason: '', status: '', type: '', source: '',  datetimerange: ''},
            tableData: [],
            editInfo: { status: '' },
            images: { show: false, lists: [] },
        }
    },
    components: {
        "preview-img": previewImg
    },
    methods: {
        imgshow(row) {
            var lists = [];
            if(row.img_url&&row.img_url.length===0){
                this.images = { show: true, lists:[] };
                return
            }
            try {
                row.img_url.forEach(function(url, idx) {
                    if (url) {
                        lists.push({ title: "进出场图片" + (idx + 1), href: url });
                    }
                });
            } catch (e) {
                console.log("取图片出错了");
            }
            this.images = { show: true, lists };
        },
        imgClose() {
            this.images = { show: false, lists: [] };
        },
        btnMore: function() {
            this.search_more = !this.search_more;
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            const { page, pagesize } = this.pagination;
            this.getData(page, pagesize);
        },
        updateClick: function(row) {
            var vm = this;
            vm.updateVisible = true;
            vm.updateTitle = "编辑开闸信息";
            vm.editInfo = { status: row.status, id: row.id };
        },

        editSubmit: function() {
            var vm = this;
            let editData = {status:vm.editInfo.status,recover_id:vm.editInfo.id}
            let url = `/recover/update`;
            utils.fetch(url,{method:'POST',body:editData}).then((res)=>{
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.updateVisible = false;
                        vm.getData();
                    } else {
                        vm.$message({ showClose: true, message: res.message, type: 'error' });
                    }
                }
            })
        },
        btnUndo: function() {
            this.search = { station_id: '', plate: '', reason: '', status: '', type: '', source: '',  datetimerange: ''};
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        getData: function(page=1, pagesize=20) {
            var vm = this;
            var url = "/recover/lists?page=" + page + "&pagesize=" + pagesize;
            if (vm.search.datetimerange && vm.search.datetimerange.length===2) {
                let [begin, end] = vm.search.datetimerange;
                if (begin == end) {
                    vm.$message({ showClose: true, message: '开始时间和结束时间不能一样', type: 'error' });
                    return;
                }
                vm.search.begin_time = begin;
                vm.search.end_time = end;
            }else{
                vm.search.begin_time ='';
                vm.search.end_time = '';
            }
            let searchStr = utils.setQueryString({ ...vm.search });
            url += searchStr ? '&' + searchStr : '';
            vm.shade = true;
            utils.fetch(url).then((res)=>{
                if (typeof(res) != 'undefined') {
                    if (res.code == 0) {
                        vm.tableData = res.content.lists;
                        vm.pagination.total = (typeof(res) != 'undefined' && res.code == 0) ? res.content.total : 0;
                        utils.setCache(vm);
                    }
                }
                vm.shade = false;
            })
        },
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
<style>
.el-form-item {
    margin-bottom: 12px;
}
</style>
