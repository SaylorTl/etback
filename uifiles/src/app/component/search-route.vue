<template>
	<div ref="searchRoute" class="cotainer">
		<transition name="input">
			<div class="search-input" v-show="isShow">
				<el-autocomplete ref="search" v-model="routeName" :fetch-suggestions="querySearchAsync" placeholder="快速搜索栏目" @select="handleSelect" prefix-icon="el-icon-search" :trigger-on-focus="false">
				</el-autocomplete>
			</div>
		</transition>
		<transition name="button">
			<div @click="handleClick" v-show="!isShow"><i class="el-icon-search"></i></div>
		</transition>
	</div>
</template>

<script>
import utils from '../../utils/utils.js';
export default {
	name: 'SearchRoute',
	data() {
		return {
			isShow: false,
			routeName: '',
			catalog: []
		};
	},
	methods: {
		handleClick() {
			this.isShow = !this.isShow;
			setTimeout(() => {
				this.$refs.search.$children[0].focus();
			}, 0);
		},
		querySearchAsync(queryString, cb) {
			const lists = this.catalog;
			let result = queryString ? lists.filter(this.createFilter(queryString)) : lists;
			return cb(result);
		},
		getData() {
			const handleCatalog = arr => {
				//封装数据 成 [{value: '路由名称',path: '路由地址'}]的形式
				let res = [];
				if (!Array.isArray(arr) || !(arr.length > 0)) {
					return res;
				}
				arr.forEach(item => {
					res = res.concat(
						item.lists.filter(i => {
							return i.is_display == '1';
						}).map(i => {
							return { value: i.name, path: i.path };
						})
					);
				});
				return res;
			};
			this.catalog = handleCatalog(JSON.parse(window.sessionStorage.getItem('catalog')));
		},
		createFilter(queryString) {
			return item => {
				return item.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0;
			};
		},
		handleSelect(item) {
			this.$router.push(item.path);
			this.routeName = '';
		}
	},
	created() {
		this.getData();
	},
	mounted() {
		this.$refs.search.$el.querySelector('input').addEventListener('blur', e => {
			this.isShow = !this.isShow;
		});
	}
};
</script>

<style scoped>
.cotainer {
	width: 30px;
}
.search-input >>> .el-input__inner {
	height: 30px;
	width: 150px;
}

/* .input-enter-active,
.input-leave-active {
	transition: all 0.5s ease-in-out;
}
.input-enter,
.input-leave-to
{
	transform: translateX(15px);
	opacity: 0;
}

.button-enter-active,
.button-leave-active
 {
	transition: all 0.5s ease-in-out;
}
.button-enter ,.button-leave-to{
	transform: translateX(-15px);
	opacity: 0;
}
*/
</style>
