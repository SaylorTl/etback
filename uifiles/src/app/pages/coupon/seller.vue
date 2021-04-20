<template>
	<div id="box" class="menu-hide">
		<div class="worker station">
			<div class="condition clearfix box-width">
				<div class="left">
					<my-select-station v-model.trim="search.station" size="small" class="cell widthX150" placeholder="停车场"></my-select-station>
					<my-select-merchant v-model.trim="search.name" size="small" class="cell widthX170" placeholder="商家名称"></my-select-merchant>
					<el-input v-model.trim="search.phone" size="small" class="cell widthX120" placeholder="手机号"></el-input>
					<el-select size="small" v-model="search.coupontype" clearable placeholder="券额类型" class="widthX100">
						<el-option v-for="(k, v) in c_type" :key="v" :label="k" :value="v"> </el-option>
					</el-select>
					<el-button size="small" @click="btnSearch"><i class="fa fa-search"></i>查找</el-button>
					<el-button size="small" @click="btnUndo"><i class="fa fa-undo"></i>重置</el-button>
				</div>
				<div class="right">
					<el-button size="small" @click="addClick">增加商家</el-button>
				</div>
			</div>
			<!--商家表格信息-->
			<div class="table box-width">
				<el-table :data="tableData" border style="width: 100%" v-loading="shade" element-loading-text="拼命加载中">
					<el-table-column type="expand">
						<template slot-scope="props">
							<el-form label-position="left" inline class="demo-table-expand">
								<el-form-item label="地址:"
									><span>{{ props.row.address }}</span></el-form-item
								>
								<el-form-item label="最大面值:"
									><span>{{ props.row.max_amount }} <span class="red">(0表示不限额)</span></span></el-form-item
								>
								<el-form-item label="券额类型:"
									><span>{{ c_type[props.row.coupontype] }}</span></el-form-item
								>
								<el-form-item></el-form-item>
								<el-form-item label="添加人:"
									><span>{{ props.row.add_oa }}</span></el-form-item
								>
								<el-form-item label="添加时间:"
									><span>{{ props.row.creationtime  }}</span></el-form-item
								>
								<el-form-item label="修改人:"
									><span>{{ props.row.modify_oa }}</span></el-form-item
								>
								<el-form-item label="修改时间:"
									><span>{{ props.row.modifytime }}</span></el-form-item
								>
							</el-form>
						</template>
					</el-table-column>
					<el-table-column label="商家ID" min-width="60" prop="id"> </el-table-column>
					<el-table-column label="商家名称" prop="name" min-width="150"> </el-table-column>
					<el-table-column label="手机号" prop="phone" min-width="180"> </el-table-column>
					<!-- <el-table-column label="地址" prop="address" min-width="180">
                    </el-table-column> -->
					<el-table-column label="停车场" prop="station_name" min-width="180"> </el-table-column>
					<el-table-column label="是否限制领取数量" prop="onlyone" min-width="120">
						<template slot-scope="scope">
							<span>{{ scope.row.onlyone == "N" ? "否" : "是" }}</span>
						</template>
					</el-table-column>
					<el-table-column label="发券后多少小时失效" min-width="120">
						<template slot-scope="scope">
							<span>{{ scope.row.countdown == 0 ? "" : scope.row.countdown + "小时" }}</span>
						</template>
					</el-table-column>
					<el-table-column fixed="right" label="操作" min-width="120">
						<template slot-scope="scope">
							<el-button plain @click="changeClick(scope.$index, scope.row)" size="mini">修改</el-button>
							<!-- v-if="authCheck('商家信息修改')" -->
							<el-button plain size="mini" @click="delClick(scope.$index, scope.row)">删除</el-button>
							<!-- v-if="authCheck('商家信息删除')" -->
						</template>
					</el-table-column>
				</el-table>
			</div>
			<my-paginator @change="setPageData($event)" :pagination="pagination"></my-paginator>
			<el-dialog :title="updateTitle" :visible.sync="updateVisible" width="40%">
				<el-form :model="editInfo" label-width="150px">
					<el-form-item label="商家名称:">
						<el-input v-model="editInfo.name" size="small" placeholder="商家名称" style="width:200px"></el-input>
					</el-form-item>
					<el-form-item label="手机号:">
						<el-tag :key="tag" v-for="tag in editInfo.phone" :closable="phoneChageable && true" :close-transition="false" @close="handleClose(tag)">{{ tag }} </el-tag>
						<el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="mini" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm" style="width:200px"> </el-input>
						<el-button v-show="phoneChageable" v-else class="button-new-tag" size="small" @click="showInput">添加手机号</el-button>
						<span v-show="!phoneChageable">(请到优惠劵授权处修改)</span>
					</el-form-item>
					<el-form-item label="地址:">
						<el-input v-model="editInfo.address" ref="sAddress" size="small" placeholder="地址" style="width:200px"></el-input>
					</el-form-item>
					<el-form-item label="停车场:" size="small">
						<my-select-station v-model="editInfo.station" size="small" width="200px" placeholder="停车场" style="width:200px"></my-select-station>
					</el-form-item>
					<el-form-item label="是否限制领取数量:" size="small">
						<el-radio class="radio" v-model="editInfo.radio" label="Y">是</el-radio>
						<el-radio class="radio" v-model="editInfo.radio" label="N">否</el-radio>
					</el-form-item>
					<el-form-item label="券额类型:" size="small">
						<el-radio-group v-model="editInfo.coupontype" :disabled="!isadd">
							<el-radio :label="0">定额券</el-radio>
							<el-radio :label="1">不定额券</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="最大面值:" v-if="editInfo.coupontype === 1">
						<el-input v-model="editInfo.max_amount" size="small" placeholder="默认为0，表示不限制" style="width:200px"></el-input>
					</el-form-item>
					<el-form-item label="领券后失效时间:" size="small"> <el-input v-model="editInfo.hour" ref="sAddress" size="small" placeholder="领券后失效时间" type="number" style="width:200px"></el-input>小时 </el-form-item>
					<el-form-item>
						<el-button @click="addSubmit" type="primary" size="small">提交</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import utils from "../../../utils/utils.js";
export default {
	data: function() {
		return {
			shade: false,
			isadd: true,
			pagination: { page: 1, pagesize: 20, total: 0, showTotal: true },
			updateVisible: false,
			updateTitle: "",
			buyVisible: false,
			editInfo: { address: "", name: "", phone: [], station: "", id: "", hour: "", radio: "N", coupontype: 0, max_amount: 0 },
			search: { station: "", name: "", phone: "", coupontype: "" },
			tableData: [], //遍历得到的所有商家信息的数组；
			tableData_search: [],
			inputVisible: false,
			inputValue: "",
			phoneChageable: true,
			c_type: { 0: "定额券", 1: "不定额券" }
		};
	},
	mounted: function() {},
	methods: {
		getData: function() {
			var vm = this;
			vm.shade = true;
			var url = "/coupon/merchant_lists?page=" + vm.pagination.page + "&pagesize=" + vm.pagination.pagesize;
			if (vm.search.station) url += "&station_id=" + vm.search.station;
			if (vm.search.name) url += "&id=" + vm.search.name;
			if (vm.search.phone) url += "&phone=" + vm.search.phone;
			if (vm.search.coupontype) url += "&coupon_type=" + vm.search.coupontype;
			utils.fetch(url).then(function(res) {
				vm.shade = false;
				if (typeof res != "undefined" && res.code == 0) {
					vm.tableData = res.content.lists || [];
					vm.pagination.total = res.content.total || 0;
					utils.setCache(vm);
				}
			});
		},
		addClick: function() {
			var vm = this;
			vm.phoneChageable = true;
			vm.updateVisible = true;
			vm.updateTitle = "添加商家信息";
			vm.isadd = true;
			vm.editInfo = { address: "", name: "", phone: [], station: "", id: "", radio: "N", coupontype: 0, max_amount: 0 };
		},
		//修改时，用户的详细信息都是显示在网页上的
		changeClick: function(index, row) {
			var vm = this;
			vm.phoneChageable = false;
			vm.updateVisible = true;
			vm.isadd = false;
			vm.updateTitle = "修改商家信息";
			vm.editInfo = { name: row.name, station: row.station, address: row.address, phone: row.phone.split(","), id: row.id, radio: row.onlyone, hour: row.countdown, coupontype: row.coupontype, max_amount: row.max_amount };
		},
		//删除时
		delClick: function(index, row) {
			var vm = this;
			var str = "您确定要删除商家:“" + row.name + "”的信息吗?";
			this.$msgbox({
				title: "提示",
				message: str,
				showCancelButton: true,
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
				beforeClose: function(action, instance, done) {
					if (action === "confirm") {
						instance.confirmButtonLoading = true;
						instance.confirmButtonText = "正在删除...";
						vm.del_plate(index, row);
						instance.confirmButtonLoading = false;
						done();
					} else {
						done();
					}
				}
			});
		},
		del_plate: function(index, row) {
			var vm = this;
			var postData = {
				merchant_id: row.id
			};
			utils.fetch("/coupon/merchant_delete", { method: "post", body: postData }).then(function(res) {
				if (typeof res != "undefined") {
					if (res.code == 0) {
						vm.getData();
					} else {
						vm.$message({ showClose: true, message: res.message, type: "error" });
					}
				}
			});
		},
		//选择停车场
		addSubmit: function() {
			var vm = this;
			var edit = vm.editInfo;
			var a = /^([1-9]\d*|[0]{1,1})$/;
			var url = "";

			if (!a.test(edit.max_amount)) {
				vm.$message({ message: "金额只能输入正整数", type: "error" });
				return;
			}
			if (edit.name == "") {
				vm.$message({ message: "商户名不能为空", type: "error" });
				return;
			}
			if (edit.phone == "") {
				vm.$message({ message: "手机号不能为空", type: "error" });
				return;
			}
			if (edit.station == "") {
				vm.$message({ message: "停车场不能为空", type: "error" });
				return;
			}
			if (edit.address == "") {
				vm.$message({ message: "地址不能为空", type: "error" });
				return;
			}
			var data = {
				address: edit.address,
				phone: edit.phone,
				name: edit.name,
				station_id: edit.station,
				onlyone: edit.radio,
				countdown: edit.hour,
				coupontype: edit.coupontype,
				max_amount: edit.max_amount
			};
			url = edit.id !== "" ? "/coupon/merchant_update" : "/coupon/merchant_add";
			if (edit.id !== "") {
				data.merchant_id = edit.id;
			}
			utils.fetch(url, { method: "post", body: data }).then(function(res) {
				if (typeof res != "undefined") {
					if (res.code == 0) {
						vm.updateVisible = false;
						vm.getData();
					} else {
						vm.$message({ showClose: true, message: res.message, type: "error" });
					}
				}
			});
		},
		btnSearch: function() {
			this.shade = true;
			this.pagination.page = 1;
			this.getData();
		},
		btnUndo: function() {
			this.shade = true;
			this.search = { station: "", name: "", phone: "", coupontype: "" };
			this.pagination.page = 1;
			this.pagination.pagesize = 20;
			this.getData();
		},
		authCheck: function(tag) {
			return utils.authCheck(this, tag);
		},
		setPageData: function(pageObj) {
			this.pagination = pageObj;
			this.getData();
		},
		makeClick: function() {
			this.updateVisible = true;
		},
		//删除手机号
		handleClose: function(tag) {
			this.editInfo.phone.splice(this.editInfo.phone.indexOf(tag), 1);
		},
		showInput: function() {
			this.inputVisible = true;
			this.$nextTick(_ => {
				this.$refs.saveTagInput.$refs.input.focus();
			});
		},
		handleInputConfirm: function() {
			let inputValue = this.inputValue;
			if (inputValue) {
				this.editInfo.phone.push(inputValue);
			}
			this.inputVisible = false;
			this.inputValue = "";
		}
	},
	beforeRouteEnter: function(to, from, next) {
		next(function(vm) {
			utils.getTingYunScript();
			var data = utils.getCache();
			var obj = data == "" ? {} : JSON.parse(data);
			if (obj.tableData && obj.tableData.length > 0) {
				utils.getCacheItem(vm, obj);
			} else {
				vm.getData();
			}
		});
	}
};
</script>
<style lang="scss">
.demo-table-expand > .el-form-item {
	width: 25%;
}
</style>
