<template>
    <div class="ui-count-table table">
        <el-table :data="tableData" border fit>
            <el-table-column type="expand">
                <template slot-scope="props">
                    <el-form label-position="left" inline class="demo-table-expand" label-width="130px">
                        <el-form-item label="公司/大区/事业部:"><span>{{ props.row.company_name + '/' + props.row.area_name + '/' + props.row.dept_name }}</span></el-form-item>
                        <el-form-item label="易停区域:"><span>{{ props.row.domain_name }}</span></el-form-item>
                        <el-form-item label="添加人:"><span>{{ props.row.created_by_fullname }}</span></el-form-item>
                        <el-form-item label="添加时间:"><span>{{ props.row.created_at }}</span></el-form-item>
                        <el-form-item label="城市:"><span>{{ props.row.city_name }}</span></el-form-item>
                        <el-form-item label="修改人:"><span>{{ props.row.updated_by_fullname }}</span></el-form-item>
                        <el-form-item label="修改时间:"><span>{{ props.row.updated_at }}</span></el-form-item>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column prop="station_name" label="停车场" width="120"></el-table-column>
            <el-table-column prop="cost" label="成本" width="120"></el-table-column>
            <el-table-column prop="type_name" label="类型" width="120"></el-table-column>
            <el-table-column prop="categories_name" label="类别" width="120"></el-table-column>
            <el-table-column prop="time" label="发生时间" width="120"></el-table-column>
            <el-table-column prop="extra" label="说明" min-width="120"></el-table-column>

        </el-table>
    </div>
</template>
<script>
export default {
    name: "count-table",
    props: ["tableData"]
};
</script>
<style lang="scss">
    .ui-count-table{
        margin-top:20px;
        .el-table{
            font-size:12px;
            thead tr {
                background: #F5F7FA!important;
                th.is-leaf{
                    background:#F5F7FA;
                }
            }
        }
    }
</style>