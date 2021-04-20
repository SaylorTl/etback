<template>
    <div id='box'
         class="menu-hide ipos-receipt">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <my-select-station v-model="search.station_id"
                                       size="small"
                                       class="cell widthX200"
                                       placeholder="停车场"></my-select-station>
                    <my-select-plate v-model="search.car_id"
                                     size="small"
                                     class="cell widthX120"
                                     placeholder="车牌号"></my-select-plate>
                    <el-input v-model="search.tnum"
                              size="small"
                              clearable
                              class="cell widthX300"
                              placeholder="订单号"></el-input>
                    <el-select v-model="search.status"
                               clearable
                               placeholder="状态"
                               class="widthX120"
                               size="small">
                        <el-option v-for="(v,k) in statusmap"
                                   :key="k"
                                   :label="v"
                                   :value="k">{{v}}</el-option>
                    </el-select>
                    <el-button @click="btnSearch"
                               size="small"><i class="fa fa-search"></i>查找</el-button>
                    <el-button @click="btnUndo"
                               size="small"><i class="fa fa-undo"></i>重置</el-button>
                </div>
            </div>
            <div class='table box-width'>
                <el-table v-loading="shade"
                          element-loading-text="拼命加载中"
                          :data="tableData"
                          border
                          fit>
                    <el-table-column type="index"
                                     label="#"
                                     width="50"></el-table-column>
                    <el-table-column prop="station_name"
                                     label="停车场"
                                     min-width="120"></el-table-column>
                    <el-table-column prop="plate"
                                     label="车牌号"
                                     min-width="120"></el-table-column>
                    <el-table-column prop="tnum"
                                     label="订单号"
                                     min-width="150"></el-table-column>
                    <el-table-column prop="creationtime"
                                     label="创建时间"
                                     min-width="120"></el-table-column>
                    <el-table-column label="状态"
                                     min-width="120">
                        <template slot-scope="props">
                            <div>{{statusmap[props.row.status + '']}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作"
                                     min-width="120">
                        <template slot-scope="props">
                            <el-button size="mini"
                                       plain
                                       v-if="props.row.status+'' !== '-1'"
                                       @click="download(props.row)"><i class="fa fa-download"></i>下载PDF</el-button>
                            <el-button size="mini"
                                       plain
                                       v-else
                                       @click="create(props.row)"><i class="fa fa-pencil-square-o"></i>开收据</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <my-paginator @change='setPageData($event)'
                          :pagination='pagination'></my-paginator>
        </div>
    </div>

</template>

<script>
import utils from "../../../utils/utils.js";
let config = window.etback.config;
export default {
    name: "iposReceipt",
    data: function() {
        return {
            statusmap: {
                "-1": "失败",
                "0": "生成中",
                "1": "成功",
                "2": "作废",
                "3": "已换发票"
            },
            shade: false,
            search: { station_id: "", car_id: "", tnum: "", status: "" },
            province: "",
            day: "",
            begin_time: "",
            end_time: "",
            pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
            tableData: []
        };
    },
    methods: {
        setPageData: function(pageObj) {
            this.pagination = pageObj;
            this.getData();
        },
        getData: function() {
            var vm = this;
            let url = `/receipt/lists?`;
            let params = {
                ...vm.search,
                page: vm.pagination.page,
                pagesize: vm.pagination.pagesize
            };
            url += utils.setQueryString(params);
            vm.shade = true;
            utils.fetch(url).then(res => {
                if (!!res) {
                    if (
                        res.code === 0 &&
                        !!res.content &&
                        !!res.content.lists &&
                        Array.isArray(res.content.lists)
                    ) {
                        vm.tableData = res.content.lists;
                        vm.pagination.total = res.content.total;
                        utils.setCache(vm);
                    } else {
                        vm.tableData = [];
                        vm.pagination.total = 0;
                        vm.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                    vm.shade = false;
                }
            });
        },
        btnSearch: function() {
            this.pagination.page = 1;
            this.getData();
        },
        btnUndo: function() {
            this.search = { station_id: "", car_id: "", tnum: "", status: "" };
            this.pagination.page = 1;
            this.pagination.pagesize = 20;
            this.getData();
        },
        download(item) {
            if (!!item.img_url) {
                this.getDownLoadURL(item.img_url);
            } else {
                let url = `/receipt/receiptApply`;
                let params = {
                    tnum: item.tnum,
                    type: "show"
                };
                utils
                    .fetch(url, {
                        method: "POST",
                        body: utils.setQueryString(params)
                    })
                    .then(res => {
                        if (
                            res.code === 0 &&
                            !!res.content &&
                            !!res.content.ep_img_url
                        ) {
                            this.getDownLoadURL(res.content.ep_img_url);
                        } else {
                            this.$message({
                                showClose: true,
                                message: res.message,
                                type: "error"
                            });
                        }
                    });
            }
        },
        getDownLoadURL(url) {
            let reqURL = `/receipt/getUrl`;
            let params = {
                url
            };
            utils
                .fetch(reqURL, {
                    method: "POST",
                    body: utils.setQueryString(params)
                })
                .then(res => {
                    if (!!res && !!res.content) {
                        let openNewWindow  = window.open(res.content,'_blank');
                        if (!openNewWindow || openNewWindow.closed || typeof openNewWindow.closed === 'undefined') {
                            var h = this.$createElement;
                            this.$msgbox({
                                title: '提示',
                                message: h('p', null, [
                                   h('span', null, '当前跳转已被拦截，请'),
                                    h('a',  {attrs: {
                                        'href': res.content,
                                        'target':"_blank",
                                        'class':'red'
                                        }}, '点击此处'),
                                    h('span', null, '下载文件')
                                ])
                            }).catch(e=>{console.log(e)})
                        }
                    }
                });
        },
        create(item) {
            let url = `/receipt/receiptApply`;
            let params = {
                tnum: item.tnum,
                type: "create"
            };
            utils
                .fetch(url, {
                    method: "POST",
                    body: utils.setQueryString(params)
                })
                .then(res => {
                    console.log("收据信息：", res);
                    if (res.code === 0) {
                        setTimeout(() => {
                            this.getData();
                        }, 2000);
                    } else {
                        this.$message({
                            showClose: true,
                            message: res.message,
                            type: "error"
                        });
                    }
                });
        }
    },
    beforeRouteEnter: function(to, from, next) {
        next(function(vm) {
            utils.getTingYunScript();
            let data = utils.getCache();
            let obj = data == "" ? {} : JSON.parse(data);
            if (obj.tableData && obj.tableData.length > 0) {
                utils.getCacheItem(vm, obj);
            } else {
                vm.getData();
            }
        });
    }
};
</script>
