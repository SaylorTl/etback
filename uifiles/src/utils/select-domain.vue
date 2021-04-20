<template>
<div :style="'width:'+width">
    <el-select v-model="value2" filterable clearable @clear="clear" @change="change" :size="size" :placeholder="placeholder" :disabled="disabled">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
</div>
</template>

<script>
import utils from "./utils.js";
export default {
  props: ["value", "size","width", "placeholder", "disabled"],
  data: function() {
    return {
      options: [],
      value2: ""
    };
  },
  watch: {
    value: function() {
      if (this.value !== "") {
        this.value2 = this.value;
      } else {
        this.value2 = "";
      }
    },
    value2: function() {
      if (this.value2 === "") {
        this.$emit("input", "");
      }
      this.init();
    }
  },
  beforeMount: function() {
    var vm = this;
    this.getStation("").then(function(data) {
      if (typeof data != "undefined") {
        vm.options = data.map(function(k) {
          return { value: k.id, label: k.name };
        });
        if (vm.value !== "") {
          vm.value2 = vm.value;
        } else {
          vm.value2 = "";
        }
      }
    });
  },
  methods: {
    init: function() {
        var vm = this;
        this.getStation(this.value2).then(function(data) {
            if (typeof(data) != 'undefined' && data.lists) {
                let { name, id} = data.lists[0];
                vm.options = [{ name, id }];
                !!vm.getID  && vm.$emit('input', id); 
                !!vm.getObj && vm.$emit('getObj', {name, id});
            }
        });
    },
    change: function(val) {
      var obj = {};
      for (var i in this.options) {
        if (this.options[i].value === val) obj = this.options[i];
      }
      this.$emit("input", obj.value);
      this.$emit("change", obj);
    },
    clear: function() {
      this.$emit("clear");
    },
    getStation: function(key) {
      let  url = "/domain/lists?name=" + key +"&page=1&pagesize=1000";
      return utils.fetch(url).then(function(json) {
        if (typeof json != "undefined" && json.code == 0) {
          return json.content.lists;
        }
      });
    }
  }
};
</script>

