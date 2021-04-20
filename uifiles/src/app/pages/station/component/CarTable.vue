<template>
    <div class="ui-cartable table">
        <el-table :data="tableData" style="width: 100%">
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column label="进场车辆" min-width="150">
                <el-table-column prop="in_rank_plate" label="车牌号" min-width="100"></el-table-column>
                <el-table-column prop="in_rank_num" label="次数" min-width="50"></el-table-column>
            </el-table-column>
            <el-table-column label="出场车辆" min-width="150">
                <el-table-column prop="out_rank_plate" label="车牌号" min-width="100"></el-table-column>
                <el-table-column prop="out_rank_num" label="次数" min-width="50"></el-table-column>
            </el-table-column>
            <el-table-column label="优惠券使用车辆" min-width="150">
                <el-table-column prop="c_use_rank_plate" label="车牌号" min-width="100"></el-table-column>
                <el-table-column prop="c_use_rank_num" label="次数" min-width="50"></el-table-column>
            </el-table-column>
            <el-table-column label="异常开闸车辆" min-width="150">
                <el-table-column prop="exception_rank_plate" label="车牌号" min-width="100"></el-table-column>
                <el-table-column prop="exception_rank_num" label="出场次数" min-width="50"></el-table-column>
            </el-table-column>
            <el-table-column label="无牌车" min-width="150">
                <el-table-column prop="unlicense_rank_mobile" label="手机号" min-width="100"></el-table-column>
                <el-table-column prop="unlicense_rank_in_num" label="进场次数" min-width="100"></el-table-column>
                <el-table-column prop="unlicense_rank_out_num" label="出场次数" min-width="50"></el-table-column>
            </el-table-column>
            <el-table-column label="发券商户" min-width="150">
                <el-table-column prop="c_assign_rank_plate" label="车牌号" min-width="100"></el-table-column>
                <el-table-column prop="c_assign_rank_num" label="次数" min-width="50"></el-table-column>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
    name: "car-table",
    props: ["topten"],
    data() {
        return {
            tableData:[]
        };
    },
    mounted() {
        this.initData();
    },
    watch:{
        topten(val){
            if(val){
                this.initData();
            }
        }
    },
    methods: {
        initData(){
            this.tableData = [];
            if (Object.keys(this.topten).length > 0) {
                for(let i = 0; i < 10;i++){
                    let temp = {};
                    this.topten.in_rank = this.topten.in_rank.length > 0 && this.topten.in_rank.sort((a,b) => b.num - a.num);
                    this.topten.out_rank = this.topten.out_rank.length > 0 && this.topten.out_rank.sort((a,b) => b.num - a.num);
                    this.topten.exception_rank = this.topten.exception_rank.length > 0 && this.topten.exception_rank.sort((a,b) => b.num - a.num);
                    this.topten.c_use_rank = this.topten.c_use_rank.length > 0 && this.topten.c_use_rank.sort((a,b) => b.num - a.num);
                    this.topten.c_assign_rank = this.topten.c_assign_rank.length > 0 && this.topten.c_assign_rank.sort((a,b) => b.num - a.num);
                    this.topten.unlicense_rank = this.topten.unlicense_rank.length > 0 && this.topten.unlicense_rank.sort((a,b) => b.out_num - a.out_num);
                    temp.in_rank_plate = (this.topten.in_rank[i] && this.topten.in_rank[i].plate) || '--';
                    temp.in_rank_num = (this.topten.in_rank[i] && this.topten.in_rank[i].num) || '--';
                    temp.in_rank_car = (this.topten.in_rank[i] && this.topten.in_rank[i].car) || '--';
                    temp.out_rank_plate = (this.topten.out_rank[i] && this.topten.out_rank[i].plate) || '--';
                    temp.out_rank_num = (this.topten.out_rank[i] && this.topten.out_rank[i].num) || '--';
                    temp.out_rank_car = (this.topten.out_rank[i] && this.topten.out_rank[i].car) || '--';
                    temp.exception_rank_plate = (this.topten.exception_rank[i] && this.topten.exception_rank[i].plate) || '--';
                    temp.exception_rank_num = (this.topten.exception_rank[i] && this.topten.exception_rank[i].num) || '--';
                    temp.exception_rank_car = (this.topten.exception_rank[i] && this.topten.exception_rank[i].car) || '--';
                    temp.c_use_rank_plate = (this.topten.c_use_rank[i] && this.topten.c_use_rank[i].plate) || '--';
                    temp.c_use_rank_num = (this.topten.c_use_rank[i] && this.topten.c_use_rank[i].num) || '--';
                    temp.c_assign_rank_plate = (this.topten.c_assign_rank[i] && this.topten.c_assign_rank[i].plate) || '--';
                    temp.c_assign_rank_num = (this.topten.c_assign_rank[i] && this.topten.c_assign_rank[i].num) || '--';
                    temp.unlicense_rank_in_num = (this.topten.unlicense_rank[i] && this.topten.unlicense_rank[i].in_num) || '--';
                    temp.unlicense_rank_out_num = (this.topten.unlicense_rank[i] && this.topten.unlicense_rank[i].out_num) || '--';
                    temp.unlicense_rank_mobile = (this.topten.unlicense_rank[i] && this.topten.unlicense_rank[i].mobile) || '--';
                    this.tableData.push(temp);
                    
                }
            } else {
                this.tableData = [];
            }
            this.$forceUpdate();
        }
        
    },
};
</script>

<style lang="scss" scoped>
.ui-cartable {
    margin-top: 20px;
    .el-table {
        font-size: 12px;
    }
}
</style>