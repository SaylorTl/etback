<template>
    <div ref="select_merchant" class="select-staion" :style="{ width: width }">
        <div class="val-input" @click="valInputClick" :style="{ width: width }" :class="{ empty: value3 ? false : true, disabled: disabled ? true : false }">
            <span @click.stop="clear"><i class="fa fa-times-circle"></i></span>{{ value3 ? value3 : placeholder }}
        </div>
        <div class="search-pop" :class="{ hide: pophide }" :style="{ width: width, marginTop: '2px' }">
            <el-input class="search-input" v-model.trim="value2" v-focus="focusBinding" @input="inputChange" size="small" placeholder="请输入关键字" multiple></el-input>
            <ul :class="{ hide: options.length ? false : true }">
                <li v-for="item in options" @click="select(item)" :key="item.id">
                    <span>{{ item.name }}</span>
                </li>
            </ul>
            <div class="msg" :class="{ hide: options.length }">没有搜索结果</div>
        </div>
    </div>
</template>

<script>
import utils from "./utils.js";
export default {
    props: ["value", "size", "width", "placeholder", "disabled", "allProperty"],
    data: function() {
        return {
            options: [],
            value2: "",
            value3: "",
            focusBinding: false,
            pophide: true
        };
    },
    watch: {
        value: function() {
            this.init();
        },
        value2: function(val) {
            if (val == "") this.options = [];
        }
    },
    directives: {
        focus: {
            componentUpdated: function(el, binding) {
                if (binding.value == true) el.children[0].focus();
            }
        }
    },
    beforeMount: function() {
        this.init();
    },
    methods: {
        init: function() {
            if (this.value) {
                var vm = this;
                this.getStation(this.value, "id").then(function(data) {
                    if (typeof data != "undefined") {
                        vm.value2 = data[0].name;
                        vm.value3 = data[0].name;
                    }
                });
            } else {
                this.value2 = "";
                this.value3 = "";
            }
        },
        clear: function() {
            this.pophide = true;
            this.value3 = "";
            this.$emit("input", "");
            this.$emit("change", {});
        },
        valInputClick: function(e) {
            var vm = this;
            if (typeof vm.disabled == "undefined" || vm.disabled != true) {
                if (this.pophide) {
                    this.value2 = "";
                    this.options = [];
                    this.$root.$el.addEventListener("click", function(e) {
                        if (!!vm.$refs.select_merchant) {
                            if (vm.pophide == false && vm.$refs.select_merchant.contains(e.target) == false) {
                                vm.pophide = true;
                            }
                        }
                    });
                }
                this.pophide = false;
                this.focusBinding = true;
            }
        },
        inputChange: function() {
            var vm = this;
            if (this.value2) {
                var vm = this;
                var pattern = /\<|\>|\'|\"|\&|\%|\*|\$|\#|\!|\@|\￥/g;
                var newVal = this.value2.replace(pattern, "");
                if (newVal) {
                    this.getStation(this.value2, "keyword").then(function(json) {
                        if (vm.allProperty === "all") {
                            vm.options = json ? json : [];
                        } else {
                            vm.options = json
                                ? json.map(function(k) {
                                      return { id: k.id, name: k.name, type: k.coupontype };
                                  })
                                : [];
                        }
                    });
                }
            } else {
                this.options = [];
            }
        },
        select: function(obj) {
            this.value3 = obj.name;
            this.$emit("input", obj.id);
            this.$emit("change", obj);
            this.$emit("select", this.allProperty === "all" ? obj : { name: obj.name, value: obj.id, type: obj.type });
            this.pophide = true;
        },
        getStation: function(key, type) {
            var url = "";
            var typemap = { id: "id", keyword: "name" };
            url = `/coupon/merchant_lists?page=1&pagesize=500&${typemap[type]}=${key}`;
            return utils.fetch(url, { method: "GET" }).then(function(json) {
                if (typeof json != "undefined" && json.code == 0) {
                    return json.content.lists;
                }
            });
        }
    }
};
</script>
