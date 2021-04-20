<template>
    <div id="box" class="menu-hide">
        <div class="worker station">
            <div class='condition clearfix box-width'>
                <div class="left">
                    <el-select v-model="download_type" placeholder="请选择文件类型" class="cell widthX150">
                        <el-option v-for="(k,index) in typeOption" :key="index" :label="k" :value="index"></el-option>
                    </el-select>
                    <el-date-picker v-model="date" value-format="yyyy-MM-dd" type="date" :picker-options="{disabledDate:function(t) {return t.getTime() >  pickTime();}}" placeholder="选择日期" class="widthX150"></el-date-picker>
                    <el-button @click="down" class="ml10">下载</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import utils from '../../../utils/utils.js';
export default {
    created() {
    },
    data: function () {
        return {
            typeOption: { czy_order: '彩之云交易订单', czy_summary: '彩之云日报订单', czy_coupon: '彩之云优惠券订单', shuangqian: '双乾', wechat: '微信' },
            date: '',
            download_type: 'shuangqian'
        }
    },
    methods: {
        pickTime: function () {
            let date = new Date();
            return new Date(date.setDate(date.getDate() - 1));
        },
        down: function () {
            let vm = this;
            if (!vm.date) { vm.$message({ showClose: true, message: '请选择日期！' }); return; }
            let url = '/accountexport/download' + '?date=' + vm.date + '&download_type=' + vm.download_type;
            let filename = vm.date + vm.typeOption[vm.download_type] + '对账.zip';
            let fileload = (json) => {
                if (json &&json.code!=0 &&json.message) { vm.$message({ showClose: true, message: json.message }); }
            }
            utils.rpc.loadfile(url, null, filename, fileload);
        },
    }
}
</script>
<style scoped>
.condition {
    border-bottom: solid 1px #ccc;
}
</style>
