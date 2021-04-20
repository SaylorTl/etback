<template>
    <div id='box' class="menu-hide">
        <div class="worker pre-appearance-config">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <my-select-merchant v-model="search.merchant_id" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
                    <el-select v-model="search.status" class="cell widthX150" size="small" placeholder="状态">
                        <el-option v-for="(item,index) in configStatus" :value="item.value" :label="item.label" :key="index"></el-option>
                    </el-select>
                    <el-button size="small" @click="getData"><i class="fa fa-search"></i>查找</el-button>
                    <el-button size="small" @click="reset"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="dataLoading" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column prop="id" label="ID" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="90"></el-table-column>
                    <el-table-column prop="merchant_name" label="商家" min-width="100"></el-table-column>
                    <el-table-column  label="识别时间" min-width="100">
                         <template slot-scope="scope">
                            <div>{{(new Date(scope.row.end).getTime() - new Date(scope.row.begin).getTime())/1000}}秒</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="扫描结果" min-width="100">
                         <template slot-scope="scope">
                            <div>{{scope.row.result}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" min-width="100">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.status === 1?'success':'danger'">{{scope.row.status === 1?'成功':'失败'}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="creationtime" label="扫小票时间" min-width="100"></el-table-column>
                    <el-table-column label="操作" min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="showImg(scope.row)" plain size="mini"><i class="fa fa-image"></i>图片</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
        </div>
        <preview-img  v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import previewImg from '../../component/previewImg/index.vue';
export default {
    name: 'receiptInfo',
    components: {
        "preview-img":previewImg
    },
    props: {},
    data() {
        return {
            search: {
                station_id: '',
                merchant_id: '',
                status: ''
            },
            images:{show:false,lists:[]},
            configStatus: [
                {
                    label: '开启',
                    value: 1
                },
                {
                    label: '关闭',
                    value: 0
                }
            ],
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            dataLoading: false,
            tableData: [],
        }
    },
    computed: {
    },
    beforeCreate() {
    },
    created() {
    },
    beforeMount() {
    },
    mounted() {
    },
    beforeUpdate() {
    },
    updated() {
    },
    beforeDestroy() {
    },
    destroyed() {
    },
    watch: {
    },
    directives: {
    },
    methods: {
        reset() {
            this.search = {
                station_id: '',
                merchant_id: '',
                status: ''
            }
            this.getData();
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData() {
            let vm = this;
            let url = `/couponreceipt/scanhistory?page=${vm.pagination.page}&pagesize=${vm.pagination.pagesize}`;
            let searchParam = { ...vm.search };
            let querystr = utils.setQueryString(searchParam);
            url += querystr ? '&' + querystr : '';
            vm.dataLoading = true;
            utils.fetch(url).then(res => {
                if (!!res.content && !!res.content.lists && res.content.lists.length > 0) {
                    vm.tableData = res.content.lists;
                    vm.pagination.total = typeof res != "undefined" && res.code == 0 ? res.content.total : 0;
                    utils.setCache(vm);
                } else {
                    vm.tableData = [];
                    vm.$message({ showClose: true, message: res.message, type: 'error' });
                }
                vm.dataLoading = false;
            })
        },
        transferTicket(info,flag){
            let result = [];
            let oArr = info.split("；");
            oArr.map(item => {
                let key = item.split("：")[0];
                let value = item.split("：")[1];
                let obj = {};
                obj[key] = value;
                result.push(obj);
            })
            let keys =  result.filter(item => {
                return item[flag]
            });
            return keys[0][flag];
        },
        showImg(rowData){
            let imgArr = [];
            if(!!rowData.img_path){
                imgArr.push({href:rowData.img_path,title:''});
                this.images = {show:true,lists:imgArr};
            }
        },
        imgClose:function(){
            this.images = {show:false,lists:[]};
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            utils.getTingYunScript();
            let data = utils.getCache();
            let obj = data == "" ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    },
}
</script>
