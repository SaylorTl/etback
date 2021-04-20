<template>
	<div id="box" class="menu-hide">
		<div class="worker station">
			<div class="condition clearfix box-width">
				<div class="left">
					<my-select-station v-model.trim="search.station_id" size="small" class="cell" width="150px" placeholder="停车场"></my-select-station>
					<my-select-plate v-model="search.car_id" size="small" class="cell" width="120px" placeholder="车牌号"></my-select-plate>
					<el-input v-model="search.mobile" size="small" class="cell widthX150" placeholder="手机号"></el-input>
					<el-input v-model="search.tnum" size="small" class="cell" :style="{ width: '240px' }" placeholder="订单号"></el-input>
					<el-button @click="btnMore" size="small"> <i :class="['fa', search_more ? 'fa-chevron-up' : 'fa-chevron-down']"></i>更多筛选 </el-button>
					<el-button @click="btnSearch" size="small"> <i class="fa fa-search"></i>查找 </el-button>
					<el-button @click="btnUndo" size="small"> <i class="fa fa-undo"></i>重置 </el-button>
				</div>
				<div class="right">
					<el-button @click="exportFile" size="small"> <i class="fa fa-download"></i>导出 </el-button>
					<!-- <el-button @click="getData" size="small">
           				 <i class="fa fa-refresh"></i>刷新
                    </el-button>-->
				</div>
			</div>
			<div v-show="search_more" class="condition-more clearfix box-width">
				<my-linkage-dept v-model="search.dept_id"></my-linkage-dept>
				<el-select v-model="search.type" size="small" class="cell widthX150" placeholder="类型" clearable>
					<el-option v-for="(v, k) in searchType" :label="v.label" :value="v.value" :key="k"></el-option>
				</el-select>
				<el-date-picker v-model="search.begin_time" size="small" type="datetime" placeholder="开始时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
				<el-date-picker v-model="search.end_time" size="small" type="datetime" placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
			</div>
			<div class="table box-width">
				<el-table v-loading="shade" element-loading-text="拼命加载中" :data="tableData" border fit style="width:100%" show-summary :summary-method="getSummaries">
					<el-table-column type="expand">
						<template slot-scope="props">
							<el-form label-position="right" inline class="demo-table-expand">
								<el-form-item label="大区/事业部:">
									<span>{{ props.row.area_name }}/{{ props.row.dept_name }}</span>
								</el-form-item>
								<el-form-item label="用户:">
									<span>{{ props.row.username }}/{{ props.row.mobile }}</span>
								</el-form-item>
								<el-form-item label="订单号:">
									<span>{{ props.row.tnum }}</span>
								</el-form-item>
							</el-form>
						</template>
					</el-table-column>
					<el-table-column prop="id" label="id" width="60"></el-table-column>
					<el-table-column prop="station_name" label="停车场" min-width="130"></el-table-column>
					<el-table-column prop="plate" label="车牌" min-width="90"></el-table-column>
					<el-table-column prop="arrival" label="进场时间" min-width="90"></el-table-column>
					<el-table-column prop="departure" label="出场时间" min-width="90"></el-table-column>
					<el-table-column prop="rec_amount" label="应收金额" min-width="90"></el-table-column>
					<el-table-column prop="coupon_amount" label="优惠金额" min-width="90"></el-table-column>
					<el-table-column prop="real_amount" label="实收金额" min-width="90"></el-table-column>
					<el-table-column prop="paytime" label="使用时间" min-width="90"></el-table-column>
				</el-table>
			</div>
			<my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
		</div>
		<el-dialog title="导出成功" :visible.sync="goDialog.show" width="30%">
			<p>{{ goDialog.msg }}</p>
			<div class="tc">
				<el-button type="primary" @click="goTodolist">前往待办</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
let config = window.etback.config;
import utils from "../../../utils/utils.js";
export default {
	components: {},
	data: function() {
		return {
			cfg: config,
			url: {
				get_lists: "/qqkrecord/lists"
			},
			searchType: [{ value: "paytime", label: "使用时间" }, { value: "arrival", label: "进场时间" }, { value: "departure", label: "出场时间" }],
			search: {
				station_id: "",
				car_id: "",
				mobile: "",
				tnum: "",
				dept_id: "",
				begin_time: "",
				end_time: "",
				type: "paytime"
			},
			shade: false,
			search_more: false,
			tableData: [],
			summariesData: null,
			pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
			goDialog: { show: false, msg: "" }
		};
	},
	methods: {
		setPageData: function(pageObj) {
			this.pagination = pageObj;
			this.getData();
		},
		btnSearch: function() {
			this.pagination.page = 1;
			this.getData();
		},
		btnUndo: function() {
			this.search = {
				station_id: "",
				car_id: "",
				mobile: "",
				tnum: "",
				dept_id: "",
				begin_time: "",
				end_time: "",
				type: "paytime"
			};
			this.pagination.page = 1;
			this.pagination.pagesize = 20;
			this.getData();
		},
		btnMore: function() {
			this.search_more = !this.search_more;
		},
		getData: function() {
			var vm = this;
			vm.shade = true;
			var url = this.url.get_lists + "?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
			let { ...searchs } = vm.search;
			let searchQueryString = searchs;
			var querystr = utils.setQueryString(searchQueryString);
			var connect = url.indexOf("?") > 0 ? "&" : "?";
			url += querystr ? connect + querystr : "";
			console.log(url);
			vm.tableData = [];
			vm.summariesData = null;
			utils.fetch(url).then(function(res) {
				if (res.code === 0 && res.content !== undefined) {
					vm.tableData = res.content.lists || [];
					vm.pagination.total = res.content.total || 0;
					//总计数据
					let { total_coupon_amount, total_real_amount, total_rec_amount } = res.content;
					vm.summariesData = {
						total_coupon_amount,
						total_real_amount,
						total_rec_amount
					};
					utils.setCache(vm, "summariesData");
				} else {
					vm.pagination.total = 0;
					vm.$message({
						showClose: true,
						message:'没有数据',
						type: "error"
					});
				}
				vm.shade = false;
			});
		},
		getSummaries(params) {
			let result = [];
			if (params.data.length > 0 && this.summariesData) {
				let { total_coupon_amount, total_real_amount, total_rec_amount } = this.summariesData;
				result[0] = "合计";
				result[6] = total_rec_amount ? Number(total_rec_amount).toFixed(2) : 0;
				result[7] = total_coupon_amount ? Number(total_coupon_amount).toFixed(2) : 0;
				result[8] = total_real_amount ? Number(total_real_amount).toFixed(2) : 0;
			}
			return result;
		},
		exportFile: function() {
			var vm = this;
			if (vm.tableData && vm.tableData.length === 0) {
				vm.$message({
					showClose: true,
					message: "无数据,不可导出",
					type: "error"
				});
				return false;
			}
			let url = "/qqkrecord/export?";
			let { dept_id, ...searchmap } = this.search;
			var querystr = utils.setQueryString(searchmap);
			url += querystr ? "&" + querystr : "";
			let deptStr = utils.setDeptQuery(dept_id);
			url += deptStr ? "&" + deptStr : "";
			console.log(url);

			utils.fetch(url).then(function(res) {
				if (res.code === 0) {
					vm.goDialog.show = true;
					vm.goDialog.msg = res.message;
				} else {
					vm.$message({
						showClose: true,
						message: res.message,
						type: "error"
					});
				}
			});
		},
		goTodolist() {
			this.goDialog.show = false
			this.$router.push({ path: "/todolist" });
		}
	},
	created() {
		this.getData();
	}
};
</script>
