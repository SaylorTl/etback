import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import global from './global.js';
import bar from './bar.js';

var store = new Vuex.Store({
    modules: {
        global:global,
        bar:bar,
    }
})

export default store;
