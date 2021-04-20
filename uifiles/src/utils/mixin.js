import Vue from "vue";
Vue.mixin({
    data() {
        return {
            keyPressListener: null
        };
    },
    methods: {
        listenKeyEnter(type) {
            if (!this.btnSearch || typeof this.btnSearch !== "function") {
                return false;
            }
            let fun = event => {
                let e = event || window.event;
                if (e.keyCode === 13) {
                    this.btnSearch();
                }
            };
            if (type === "add" && !this.keyPressListener) {
                document.onkeypress = fun;
            }
            if (type === "remove" && this.keyPressListener) {
                document.onkeypress = null;
            }
        }
    },
    mounted() {
        this.btnSearch && typeof this.btnSearch === "function" && this.listenKeyEnter("add");
    },
    deactivated() {
        this.btnSearch && typeof this.btnSearch === "function" && this.listenKeyEnter("remove");
    },
    beforeDestroy() {
        this.btnSearch && typeof this.btnSearch === "function" && this.listenKeyEnter("remove");
    }
});
