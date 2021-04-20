import util from '../../utils/utils.js';
// const cache_key = 'tab_bar_vue_cahce';
const cache_key = 'tab_bar_vue_cahce_' + window.localStorage.getItem('access_token');

export default {
    state: {
        lists: [],
        tips: { show: false },
    },
    mutations: {
        bar_open(state, obj) {
            var oldBar = window.sessionStorage[cache_key] ? eval('(' + window.sessionStorage[cache_key] + ')') : [];
            var has = false;
            for (var i in oldBar) {
                if (oldBar[i].name == obj.name) {
                    has = true;
                    oldBar[i].active = true;
                    oldBar[i].status = '';
                } else {
                    oldBar[i].active = false;
                    oldBar[i].status = '';
                }
            }
            if (has == true) {
                state.lists = oldBar;
            } else {
                if (oldBar.length == 0) {
                    var bar = [];
                    bar.push({ name: '欢迎', path: '/welcome', active: false, status: '' });
                    if (obj.path != '/welcome') bar.push({ name: obj.name, path: obj.fullPath, active: true, status: '' });
                    state.lists = bar;
                } else {
                    oldBar.push({ name: obj.name, path: obj.fullPath, active: true, status: '' });
                    state.lists = oldBar;
                }
            }
            window.sessionStorage[cache_key] = JSON.stringify(state.lists);
            document.title = "停车场管理后台 - " + obj.name;
        },
        bar_active(state, path) {
            var bar = state.lists.concat();
            for (var i in bar) {
                bar[i].active = false;
                if (bar[i].path == path) {
                    bar[i].active = true;
                    document.title = "停车场管理后台 - " + bar[i].name;
                }
            }
            state.lists = bar;
        },
        bar_close_me(state, path) {
            var bar = state.lists.concat();
            var tmp = [];
            for (var i in bar) {
                if (bar[i].path == path) continue;
                tmp.push(bar[i]);
            }
            window.sessionStorage[cache_key] = JSON.stringify(tmp);
            state.lists = tmp;
        },
        bar_close_all(state) {
            var tmp = [];
            window.sessionStorage[cache_key] = JSON.stringify(tmp);
            state.lists = tmp;
        },
        bar_close_other(state, path) {
            var bar = state.lists.concat();
            var tmp = [];
            for (var i in bar) {
                if (bar[i].path == '/welcome') tmp.push(bar[i]);
                if (bar[i].path == path) {
                    bar[i].active = true;
                    tmp.push(bar[i]);
                }
            }
            window.sessionStorage[cache_key] = JSON.stringify(tmp);
            state.lists = tmp;
        },
        bar_tips(state, obj) {
            state.tips = obj;
        }
    },

}