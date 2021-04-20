<template>
    <div id='box' class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station @input="selectStation" v-model="search.station_id" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
                    <el-select v-model="search.entrance_id" placeholder="进出口" size="small" class="widthX120" clearable>
                        <el-option v-for="k in outin" :key="k.id" :label="k.entrance_name" :value="k.id">{{k.entrance_name}}</el-option>
                    </el-select>
                    <el-select  @change ='setType' v-model="search.type" placeholder="设备类型" size="small" class="widthX120" clearable>
                        <el-option v-for="k in eviceTypes" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                    </el-select>
                    <el-select v-model="search.vendor" placeholder="厂家" size="small" class="widthX120" clearable>
                        <el-option v-for="k in vendorData" :key="k.id" :label="k.name" :value="k.id">{{k.name}}</el-option>
                    </el-select>
                    <el-select v-model="search.name" placeholder="设备型号" size="small" class="widthX120" clearable>
                        <el-option v-for="k in venderName" :key="k.name" :label="k.name" :value="k.name">{{k.name}}</el-option>
                    </el-select>

                    <el-button @click="btnSearch" size="small"><i class="fa fa-search"></i>查找</el-button>
                    
                </div>
                <div class="right">
                    <el-button @click="btnUndo" size="small"><i class="fa fa-undo"></i>重置</el-button>
                    <el-button @click="exportV2" size="small"><i class="fa fa-undo"></i>导出</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit>
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
                    <el-table-column prop="entrance_name" label="进出口" min-width="80"></el-table-column>
                    <el-table-column prop="type_name" label="设备类型" min-width="80"></el-table-column>
                    <el-table-column prop="vendor_name" label="厂家" min-width="80"></el-table-column>
                    <el-table-column prop="name" label="设备型号" min-width="130"></el-table-column>
                    <el-table-column prop="creationtime" label="添加时间" min-width="130"></el-table-column>
                    <el-table-column prop="modifytime" label="修改时间" min-width="130"></el-table-column>
                    
                    <el-table-column label="操作" width="80">
                        <template slot-scope="props">
                            <el-button @click="imgshow(props.$index,props.row)" size="mini"><i class="fa fa-picture-o"></i>照片</el-button>
                        </template>
                    </el-table-column>
                   
                </el-table>
            </div>
            <preview-img  v-if="images.show" @close="imgClose" :imgList="images.lists"></preview-img>
            <my-paginator @change='setPageData($event)' :pagination='pagination'></my-paginator>
        </div>
    </div>
</template>
<script>
import utils from '../../../utils/utils.js';
import previewImg from '../../component/previewImg/index.vue';
import OSS from 'cos-js-sdk-v5';
export default {
    data: function() {
        return {
            search: { 
                new: '新设备列表',  // 传参: 新设备列表/设备详情列表，不传:旧设备列表
                station_id: '', // 车场id
                entrance_id: '',  // 出入口id
                type: '', // 设备类型id
                vendor: '',  // 厂商id
                name: '', // 设备型号
            },
            outin: [], // 根据停车场id查询的出入口
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },  // 分页
            vendorData: [],  // 所有厂家
            tableData: [], // 设备详情列表
            eviceTypes: [], // 所有设备类型列表
            venderName: [], // 所有设备型号
            shade: false, // table加载loading
            images:{show:false,lists:[]},
        }
    },
    components: {
        "preview-img":previewImg
    },
    created () {
        utils.cosFileInit();  
    },
    methods: {
        // 先选设备类型，再根据设备类型查有哪些型号
        setType (num) {
            console.log('根据设备类型查有哪些型号', num)
            // if (toString.call(num) === "[object Number]") {
                this.getModels(num)
            // }
            
        },
        imgshow(index,row) {
            var vm = this;
            console.log(index, row)
            let ext = row.extra;
            if(!!ext){
                ext = JSON.parse(ext);
                ext.map(item => {
                    utils.getCosImageURL(item.key,(info) => {
                        this.images.lists.push({href:info.url});
                        if(this.images.lists.length == ext.length){
                            this.images.show = true;
                        }
                    })
                })
            }
            // const cos = new OSS();
            // cos.getObjectUrl({
            //     Bucket: 'hjp-test-1257614477',
            //     Region: 'ap-guangzhou',
            //     Key: [],
            //     // Expires: 7200,
            //     // Sign: true,
            // }, function(err, data) {
            //     // fn(data.Url || '', filename)
            //     console.log(err, data)
            // });
            //vm.images = {show:true,lists:[]};
            // utils.fetch('/inout/images?type=out&station_id='+row.station_id+'&id='+row.id+'&date='+row.created_at.substr(0,7)).then(function(json){
            //     if(typeof(json) != 'undefined' && json.code == 0 && json.content.length > 0){
            //         //vm.images.lists = json.content
            //         vm.images = {show:true,lists:json.content};
            //     }else{
            //         vm.images.show = false;
            //         vm.$message({ showClose:true, message:'没有图片', type:'error' });
            //     }
            // });
        },
        imgClose:function(){
            this.images = {show:false,lists:[]};
        },
        getVendorData: function () {
            var vm = this;
            var url = "/device/vendors";
            return utils.fetch(url).then(function (res) {
                vm.vendorData = (typeof res != "undefined") && res.code == 0 ? res.content : [];
            });
        },
        // 设备详情导出 /device/exportV2
        exportV2 () {
            var vm = this;
            let url = `/device/exportV2`;
            // vm.btnLoading = true;
            let search = utils.dealRouteParams(vm);
            let { ...searchs } = search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? '?' + querystr : '';
            // let station_id = this['search']['station_id'] || '', 
            //     entrance_id= this['search']['entrance_id'] || '',
            //     type = this['search']['type'] || '',
            //     vendor = this['search']['vendor'] || '',
            //     name = this['search']['name'] || '';
            // let params = '?new="新设备列表"&';
            // if (station_id) { params= `${params}station_id=${station_id}&`}
            // if (entrance_id) { params= `${params}entrance_id=${entrance_id}&`}
            // if (type) { params= `${params}type=${type}&`}
            // if (vendor) { params= `${params}vendor=${vendor}&`}
            // if (name) { params= `${params}name=${name}`}
            
            console.log(url)
            utils.rpc.loadfile(url).then(function(res) {
                // vm.btnLoading = false;
                if(res.code != 0 ){
                    vm.$message({ message: res.message, type:'error' }); return ;
                }
            })
        },
        getDeviceTypes () {
            const url = '/device/types?type=new';
            const vm = this;
            utils.fetch(url).then(function(res) {
                if (typeof res != "undefined" && res.code == 0) {
                    vm.eviceTypes = res.content;
                    console.log(res.content)
                } else {
                    vm.eviceTypes = [];
                }
                utils.setCache(vm);
            })
        },
        selectStation (num) {
            console.log(num)
            if (toString.call(num) === "[object Number]") {
                this.getEntranceLists(num)
            }
        },
        // 根据停车场id查询出入口   联动input组件
        getEntranceLists (num) {
            var vm = this;
            let params = `?page=1&pagesize=999&station_id=${num}`;
            var url = `/station/entranceLists${params}`;
            utils.fetch(url).then(function(res) {
                if (typeof res != "undefined" && res.code == 0) {
                    vm.outin = res.content.lists;
                } else {
                    vm.outin = []
                }
            })
        },
        // 设备型号列表
        getModels (num) {
            const url = `/device/models?type=${num}`;
            const vm = this;
            vm.search.name = "";
            utils.fetch(url).then((res) => {
                if (typeof res != "undefined" && res.code == 0) {
                    vm.venderName = res.content || [];
                    console.log('设备型号列表', res)
                } else {
                    vm.venderName = [];
                }
            })
        },
        getData: function() {
            var vm = this;
            var url = '/device/listsV2?page=' + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
            if (this.vendorData.length === 0) {
              this.getVendorData()
            }
            if (this.eviceTypes.length === 0) {
                this.getDeviceTypes()
            }
            let search = utils.dealRouteParams(vm);
            
            let { ...searchs } = search;
            var querystr = utils.setQueryString(searchs);
            url += querystr ? '&' + querystr : '';
            console.log('url', url);
            vm.shade = true;
            utils.fetch(url).then(function(res) {
                // vm.tableData = (typeof(res) != 'undefined' && res.code == 0) ? res.content.lists : [];
                // vm.pagination.total = res.content.total;
                if (typeof res != "undefined" && res.code == 0) {
                    vm.tableData = res.content.lists;
                    vm.pagination.total = res.content.total;
                } else {
                    vm.tableData = [];
                    vm.pagination.total = 0;
                }
                utils.setCache(vm);
                vm.shade = false
            });
        },
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.eviceTypes = [];
            this.venderName = [];
            this.outin = [];
            this.search = {new: '新设备列表'};
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            // utils.getTingYunScript();
            // var hasParams = utils.hasRouteParams(vm.$route.params);
            // if(hasParams){vm.getData();return};
            // var data = utils.getCache();
            // var obj = data == '' ? {} : JSON.parse(data);
            // if (obj.tableData && obj.tableData.length > 0) {
            //     utils.getCacheItem(vm, obj);
            // } else {
            //     vm.getData();
            // }
            vm.getData();
        });
    },
}
</script>
