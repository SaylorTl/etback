<template>
    <div ref="select_station" class="select-staion" :style="{ width: width }">
        <div class="val-input" @click="valInputClick" :style="{ width: width }" :class="{ empty: value3 ? false : true, disabled: disabled ? true : false }">
            <span @click.stop="clear">
                <i class="fa fa-times-circle"></i>
            </span>
            {{ value3 ? value3 : placeholder }}
        </div>
        <div class="search-pop" :class="{ hide: pophide }" :style="{ width: width, marginTop: '2px' }">
            <el-input id="inputBox" class="search-input" v-model.trim="value2" @input="inputChange" size="small" placeholder="请输入关键字"></el-input>
            <ul :class="{ hide: options.length ? false : true }">
                <li v-for="item in options" @click="select(item)" :key="item.id">
                    <span>{{ item.name }}</span>
                </li>
            </ul>
            <div class="msg" :class="{ hide: options.length }">
                <p>没有搜索结果</p>
                <el-button size="medium" @click="addPlate" v-show="showBtn">添加新车牌</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import utils from "./utils.js";
export default {
    props: ["value", "size", "width", "placeholder", "disabled", "addnewplate", "isFocus"],
    data: function() {
        return {
            value2: "",
            value3: "",
            pophide: true,
            options: [],
            showBtn: false,
            platelengthlimit: 2
        };
    },
    watch: {
        value: function(val) {
            if (this.isFocus && !val) {
                this.valInputClick();
            }
            this.init();
        },
        value2: function(val) {
            if (val == "") this.options = [];
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
                        vm.value2 = data.plate;
                        vm.value3 = data.plate;
                    }
                });
            } else {
                this.value2 = "";
                this.value3 = "";
            }
        },
        clear: function() {
            if (!this.disabled) {
                this.value3 = "";
                this.$emit("input", "");
            }
        },
        valInputClick: function() {
            var vm = this;
            if (typeof vm.disabled == "undefined" || vm.disabled != true) {
                if (this.pophide) {
                    this.value2 = "";
                    this.options = [];

                    let listenerFunction = e => {
                        console.log("e", e);
                        if (!!vm.$refs.select_station) {
                            if (vm.pophide == false && vm.$refs.select_station.contains(e.target) == false) {
                                vm.pophide = true;
                                this.$root.$el.removeEventListener("click", listenerFunction);
                            }
                        }
                    };
                    this.$root.$el.addEventListener("click", listenerFunction);
                }
                this.pophide = false;
                this.doFocus();
                this.hidebtn();
            }
        },
        doFocus() {
            this.$nextTick(function() {
                document.getElementById("inputBox").focus();
            });
        },
        inputChange: utils._throttle(function() {
            var vm = this;
            if (this.value2 && this.value2.length > vm.platelengthlimit) {
                this.getStation(this.value2, "keyword").then(function(json) {
                    vm.options = [];
                    if (json != "" && Array.isArray(json)) {
                        vm.options = json.map(function(k) {
                            return { id: k.id, name: k.plate };
                        });
                        if (vm.options.length == 1) {
                            vm.select(vm.options[0]);
                        }
                    } else {
                        vm.addnewplate && (vm.showBtn = true);
                    }
                });
            } else {
                this.hidebtn();
                this.options = [];
            }
        }, 1000),
        hidebtn: function() {
            this.addnewplate && (this.showBtn = false);
        },
        addPlate: function() {
            this.$emit("addOne");
        },
        select: function(obj) {
            this.value3 = obj.name;
            this.$emit("input", obj.id);
            this.$emit("select", { name: obj.name, value: obj.id });
            this.pophide = true;
        },
        getStation: function(key, type) {
            var url = "";
            if (type == "id") {
                url = "/car/show?car_id=" + key;
            } else if (type == "keyword") {
                url = "/car/lists?plate=" + key + "&page=1&pagesize=1000";
            }
            return utils.fetch(url).then(function(json) {
                if (typeof json != "undefined" && json.code == 0) {
                    return json.content;
                }
            });
        }
    }
};
</script>
