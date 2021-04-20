<template>
	<div>
		<el-select v-model="build_id" :disabled="!station_id" filterable clearable placeholder="楼栋名称" size="small" class="cell widthX100">
			<el-option v-for="item in buildLists" :key="item.build_id" :label="item.build_name" :value="item.build_id"> </el-option>
		</el-select>
		<el-select v-model="unitname" v-show="build_id" :disabled="!station_id" filterable clearable placeholder="单元名称" size="small" class="cell widthX100">
			<el-option v-for="(item, index) in unitnameLists" :key="index" :label="item" :value="item"> </el-option>
		</el-select>
		<el-select v-model="floor" v-show="unitname" :disabled="!station_id" filterable clearable placeholder="楼层" size="small" class="cell widthX100">
			<el-option v-for="(item, index) in floorLists" :key="index" :label="item" :value="item"> </el-option>
		</el-select>
		<el-autocomplete v-model="room_name" :fetch-suggestions="querySearch" clearable placeholder="房号" size="small" class="cell widthX100"></el-autocomplete>
	</div>
</template>

<script>
import utils from "../../../utils/utils";
export default {
	name: "BuildSearch",
	props: {
		station_id: {
			type: [String, Number],
			default: ""
		}
	},
	data() {
		return {
			build_id: "",
			unitname: "",
			floor: "",
			room_name: "",
			floorLists: [],
			buildMap: new Map(), //用于存储当前停车场所有的楼栋信息,
			currentFloorMap: new Map() //用于存储当前楼栋所有楼层信息
		};
	},
	computed: {
		buildLists() {
			return [...this.buildMap.values()];
		},
		unitnameLists() {
			const el = this.buildMap.get(this.build_id);
			if (typeof el === "undefined") {
				return [];
			}
			return [...el.unitname.keys()];
		},
		roomLists() {
			const el = this.currentFloorMap.get(this.floor);
			if (typeof el === "undefined") {
				return [];
			}
			return [...el.room.values()];
		}
	},
	methods: {
		getBuildLists() {
			if (!this.station_id) {
				return;
			}
			utils
				.fetchNew("et_admin.etstation.room.building", {
					station_id: this.station_id
				})
				.then(res => {
					if (res.code === 0 && res.content) {
						const buildLists = Array.isArray(res.content.lists) ? res.content.lists : [];
						this.buildMap = buildLists.reduce((accumulator, currentValue) => {
							let el = accumulator.get(currentValue.build_id);
							if (typeof el === "undefined") {
								//不存在就初始化一个
								accumulator.set(currentValue.build_id, {
									build_id: currentValue.build_id,
									build_name: currentValue.build_name,
									unitname: new Map([[currentValue.unitname, {}]])
								});
							} else {
								if (!el.unitname.has(currentValue.unitname)) {
									el.unitname.set(currentValue.unitname, {});
								}
							}

							return accumulator;
						}, new Map());
					} else {
						console.log("res:", res);
					}
				});
		},
		getRoomLists() {
			if (!(this.build_id && this.unitname)) {
				return;
			}
			utils
				.fetchNew("et_admin.etstation.room.units", {
					building_id: this.build_id,
					unitname: this.unitname
				})
				.then(res => {
					if (res.code === 0 && res.content) {
						const roomLists = Array.isArray(res.content.lists) ? res.content.lists : [];

						this.currentFloorMap = roomLists.reduce((accumulator, currentValue) => {
							let el = accumulator.get(currentValue.floor);

							if (typeof el === "undefined") {
								accumulator.set(currentValue.floor, {
									room: new Map([[currentValue.room_id, { room_name: currentValue.room_name }]])
								});
							} else {
								if (!el.room.has(currentValue.room_id)) {
									el.room.set(currentValue.room_id, {
										room_name: currentValue.room_name
									});
								}
							}

							return accumulator;
						}, new Map());

						this.floorLists = [...this.currentFloorMap.keys()];
					} else {
						console.log("res:", res);
					}
				});
		},
		querySearch(queryString, cb) {
			const lists = this.roomLists.map(item => {
				return { value: item.room_name };
			});
			let result = queryString ? lists.filter(this.createFilter(queryString)) : lists;
			return cb(result);
		},
		createFilter(queryString) {
			return item => {
				return item.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0;
			};
		}
	},
	watch: {
		station_id: {
			handler(newVal, oldVal) {
				if (newVal === "") {
					this.buildMap = new Map();
					this.build_id = "";
				} else {
					if (newVal !== oldVal) {
						this.buildMap = new Map();
						this.build_id = "";
						this.getBuildLists();
					}
				}
			},
			immediate: true
		},
		build_id: {
			handler(newVal, oldVal) {
				if (newVal === "") {
					this.unitname = "";
				} else {
					if (newVal !== oldVal) {
						this.unitname = "";
					}
				}
			}
		},
		unitname: {
			handler(newVal, oldVal) {
				if (newVal === "") {
					this.floor = "";
				} else {
					if (newVal !== oldVal) {
						this.floor = "";
						this.getRoomLists();
					}
				}
			}
		}
	}
};
</script>
