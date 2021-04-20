<template>
    <div class="time-input-box">
        <el-input v-model="value" readonly unselectable="on" @focus="inputFocus" size="small"></el-input>
        <span v-show="boxShow" class="tiparrow" :style="offset"></span>
        <div v-show="boxShow" class="up-box" :style="offset2">
            <div v-show="boxShow" class="input-box">
                <div class="row-box flex" v-show="!item.noshow" v-for="(item,index) in list" :key="index">
                    <el-input placeholder="0~24" :disabled="list.length-1!=index" @blur="inputBlur('s',index)" size="mini" v-model="item.s"></el-input>
                    <span>-</span>
                    <el-input placeholder="1~24" :disabled="list.length-1!=index" @blur="inputBlur('e',index)" size="mini" v-model="item.e"></el-input>
                    <!-- <i v-if="list.length-1!=index" @click="delrowTime(index)" class="el-icon-delete danger"></i>
                    <i v-if="list.length-1==index" @click="addrowTime(index)" class="el-icon-circle-plus success"></i> -->
                </div>
            </div>
            <div class="action-box">
                <i @click="setNull" class="el-icon-error info">不限</i>
                <i @click="boxShow=false" class="el-icon-error danger">关闭</i>
                <i @click="sureValue" class="el-icon-success success">确定</i>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        times: {
            default: () => {
                return []
            }
        }
    },
    watch: {
        times: {
            handler: function (s, e) {
                this.init(s)
            },
            immediate: true
        }
    },
    computed: {
        value: function () {
            let firstTime = this.firstTime;
            if (firstTime.s == '' && firstTime.e == '') {
                return '不限'
            } else {
                let time = `${firstTime.s < 10 ? '0' + firstTime.s : firstTime.s}:00 - ${firstTime.e < 10 ? '0' + firstTime.e : firstTime.e}:00`;
                return time;
            }
        }
    },
    data() {
        return {
            boxShow: false,
            haveValue: [],
            offset: {},
            offset2: {},
            list: [{ s: '', e: '' }],
            firstTime: { s: '', e: '' }
        };
    },

    created: function () {

    },
    mounted: function () {
        this.init(this.times);
    },
    methods: {
        init(tmp) {
            this.list = [{ s: '', e: '' }];
            this.firstTime = { s: '', e: '' };
            if (Array.isArray(tmp) && tmp.length > 0) {
                this.list = tmp.map(el => {
                    let item = el.split('-');
                    if (item.length === 2) {
                        return { s: parseInt(item[0].substring(0, 2)), e: parseInt(item[1].substring(0, 3)) }
                    } else {
                        return el;
                    }
                })
                this.firstTime = this.list[0] || { s: '', e: '' };
            }
        },
        setNull() {
            this.firstTime = { s: '', e: '' };
            this.list = [{ s: '', e: '' }];
            this.$emit('input', false);
            this.boxShow = false;
        },
        sureValue() {
            let item = this.list[0] || false;
            if (item && item.s >= 0 && item.e) {
                let firstTime = item;
                let time = `${firstTime.s < 10 ? '0' + firstTime.s : firstTime.s}:00 - ${firstTime.e < 10 ? '0' + firstTime.e : firstTime.e}:00`;
                this.$emit('input', [time]);
                this.firstTime = firstTime;

            } else if (!item.s.toString()) {
                this.$notify({ message: '请输入开始时间', type: 'error' }); return;
            }
            else if (!item.e.toString()) {
                this.$notify({ message: '请输入结束时间', type: 'error' }); return;
            }
            this.boxShow = false;
        },
        haveValueinit() {
            return;//现在先不启用此方法，以后要使用去除本行
            this.haveValue = [];
            this.list.map(el => {
                if (el.e && el.s) {
                    for (let i = el.s; i <= el.e; i++) {
                        this.haveValue[i] = parseInt(i);
                    }
                }
            })
        },
        delrowTime(index) {
            let row = this.list[index];
            for (let i = row.s; i <= row.e; i++) {
                this.haveValue[i] = '';
            }
            //    console.log('this.haveValue', this.haveValue)
            this.list.splice(index, 1, { s: '', e: '', show: false });
        },
        addrowTime(index) {
            let row = this.list[index];
            if (!row.s) { this.$notify({ message: '请输入开始时间', type: 'error' }); return; }
            if (!row.e) { this.$notify({ message: '请输入结束时间', type: 'error' }); return; }
            let tmp = [];
            this.haveValueinit();
            this.list.push({ s: '', e: '', show: true });
        },
        inputBlur(type, index) {
            let list = this.list;
            let sTime, eTime;
            if (list[index].s) { sTime = parseInt(list[index].s); if (Number.isNaN(sTime)) { list[index].s = ''; this.haveValueinit(); return } }
            if (list[index].e) { eTime = parseInt(list[index].e); if (Number.isNaN(eTime)) { list[index].e = ''; this.haveValueinit(); return } }
            if (type === 's') {
                if (sTime === undefined || sTime === '' || sTime > 24 || sTime < 0) { list[index].s = ''; this.haveValueinit(); return }
                if (eTime && sTime >= eTime) {
                    list[index].s = '';
                    this.$notify({ message: '开始时间必须小于结束时间', type: 'error' }); this.haveValueinit(); return;
                }
                // let repeat = list.some(el => { return (el.e == sTime) });
                // let have = this.haveValue.some(i => { return i == sTime });
                // if (have && !repeat) {
                //     list[index].s = '';
                //     this.$notify({ message: '已存在时间段包含' + sTime + '点钟', type: 'error' });
                // }
                // this.haveValueinit();
            } else if (type === 'e') {
                if (eTime === undefined || eTime === '' || eTime > 24 || eTime < 0) { list[index].e = ''; this.haveValueinit(); return }
                if ((sTime || sTime === 0) && eTime <= sTime) {
                    list[index].e = '';
                    this.$notify({ message: '结束时间必须大于开始时间', type: 'error' }); this.haveValueinit(); return;
                }
                if (!(eTime > 0)) {
                    list[index].e = '';
                }
                // let repeat = list.some(el => { return el.s == eTime });
                // let have = this.haveValue.some(i => { return i == eTime });
                // if (have && !repeat) {
                //     list[index].e = '';
                //     this.$notify({ message: '已存在时间段包含' + eTime + '点钟', type: 'error' });
                // }
                // this.haveValueinit();
            }
        },
        inputFocus(e) {
            this.boxShow = true;
            let offset = this.getElementPosition(e.target);//返回当前组件所在屏幕位置
            this.offset = {
                top: offset.top + 40 + "px",
                left: offset.left + 40 + "px",
            }
            this.offset2 = {
                top: offset.top + 45 + "px",
                left: offset.left - 50 + "px",
            }
        },
        // 获取元素 在 网页 中的 坐标
        getElementPosition(ele) {
            var left = 0;
            var top = 0;
            var p = ele;
            while (p !== null) {
                left += p.offsetLeft;
                top += p.offsetTop;
                p = p.offsetParent;   // 遍历相对元素的坐标
            }
            var pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            var pageWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
            return {
                left: left,
                top: top,
                right: pageWidth - left - ele.offsetWidth,
                bottom: pageHeight - top - ele.offsetHeight
            };
        }
    }
}
</script>
<style lang="css">
.time-input-box {
    cursor: pointer;
    position: relative;
}
.time-input-box .tiparrow {
    position: fixed;
    z-index: 101;
    width: 10px;
    height: 10px;
    background-color: #fff;
    transform: rotate(136deg);
}
.time-input-box .action-box {
    position: absolute;
    right: 10px;
    bottom: 5px;
}
.time-input-box .action-box i {
    margin-right: 5px;
}
.time-input-box .up-box {
    position: fixed;
    z-index: 100;
    padding: 10px 7px;
    width: 200px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.time-input-box .input-box {
    min-height: 60px;
    max-height: 1200px;
    padding-bottom: 30px;
}
.time-input-box .row-box {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: space-around;
    margin-top: 5px;
}
.time-input-box .row-box span {
    display: inline-block;
    width: 60px;
}
.time-input-box .row-box i {
    margin-right: 10px;
    margin-left: 15px;
    font-size: 15px;
}
</style>
