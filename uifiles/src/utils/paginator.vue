<template>
     <div class="pagination">
        <el-pagination v-if='pagination.showTotal'
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[20,50,100]"
            :page-size="pagination.pagesize"
            :total="pagination.total"
            layout="total,sizes,prev,pager,next,jumper">
        </el-pagination>
        <el-pagination v-else
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[20,50,100]"
            :page-size="pagination.pagesize"
            layout="sizes,prev,pager,next,jumper">
        </el-pagination>
    </div>
</template>

<script>
    export default {
        props:['pagination'],
        data:function(){
            return {};
        },
        created:function(){},
        mounted:function(){},
        methods:{
            handleSizeChange:function(val){
                this.pagination.page = 1;
                this.pagination.pagesize = val;
                this.emitChange(this.pagination);
            },
            handleCurrentChange:function(val) {
                this.pagination.page = val;
                this.emitChange(this.pagination);
            },
            emitChange:function(obj){
                this.$emit('change',obj);
            }
        }
    }
</script>
