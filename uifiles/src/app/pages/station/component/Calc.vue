<template>
    <div class="ui-calc">
        <div class="ui-calc-caption">月卡</div>
        <div class="ui-calc-table">
            <div class="ui-calc-table-row header">
                <div class="ui-calc-table-column">月卡车位数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">发行比（%）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">月卡最高金额（元）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">月数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">月卡总收入（元）</div>
            </div>
            <div class="ui-calc-table-row">
                <div class="ui-calc-table-column">
                    <el-input v-model="calc1.num1" placeholder="月卡车位数" size="small" type="text" v-onlynumber="{ min: 0, precision: 0 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc1.num2" placeholder="发行比" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc1.num3" placeholder="月卡最高金额" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc1.num4" placeholder="月数" size="small" type="text" v-onlynumber="{ min: 0, precision: 0 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">=</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result1" placeholder="月卡总收入" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
            </div>
        </div>
        <div class="ui-calc-caption">临停</div>
        <div class="ui-calc-table">
            <div class="ui-calc-table-row header">
                <div class="ui-calc-table-column">临停车位数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">周转率（%）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">临停封顶金额（元）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">月数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">临停总收入（元）</div>
            </div>
            <div class="ui-calc-table-row">
                <div class="ui-calc-table-column">
                    <el-input v-model="calc2.num1" placeholder="临停车位数" size="small" type="text" v-onlynumber="{ min: 0, precision: 0 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc2.num2" placeholder="周转率" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc2.num3" placeholder="临停封顶金额" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc2.num4" placeholder="月数" size="small" type="text" v-onlynumber="{ min: 0, precision: 0 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">=</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result2" placeholder="临停总收入" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
            </div>
        </div>
        <div class="ui-calc-caption">运维维护成本/年</div>
        <div class="ui-calc-table" style="width:60%;">
            <div class="ui-calc-table-row header">
                <div class="ui-calc-table-column">运维维护成本（元）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">月数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">总维护成本（元）</div>
            </div>
            <div class="ui-calc-table-row">
                <div class="ui-calc-table-column">
                    <el-input v-model="calc3.num1" placeholder="运维维护成本" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc3.num2" placeholder="月数" size="small" type="text" v-onlynumber="{ min: 0, precision: 0 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">=</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result3" placeholder="总维护成本" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
            </div>
        </div>
        <div class="ui-calc-caption">运营维护成本/年</div>
        <div class="ui-calc-table" style="width:80%;">
            <div class="ui-calc-table-row header">
                <div class="ui-calc-table-column">固定岗位数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">固定岗工资（元/月）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">月数（个）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">运营维护成本（元）</div>
            </div>
            <div class="ui-calc-table-row">
                <div class="ui-calc-table-column">
                    <el-input v-model="calc4.num1" placeholder="固定岗位数" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc4.num2" placeholder="固定岗工资" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">*</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="calc4.num3" placeholder="月数" size="small" type="text" v-onlynumber="{ min: 0, precision: 0 }" clearable @change="showKey"></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">=</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result4" placeholder="运营维护成本" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
            </div>
        </div>
        <div class="ui-calc-caption">总收入</div>
        <div class="ui-calc-table">
            <div class="ui-calc-table-row header">
                <div class="ui-calc-table-column">月卡总收入（元</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">临停总收入（元）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">运维维护成本（年）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">运营维护成本（元）</div>
                <div class="ui-calc-table-column"></div>
                <div class="ui-calc-table-column">总收入（元）</div>
            </div>
            <div class="ui-calc-table-row">
                <div class="ui-calc-table-column">
                    <el-input v-model="result1" placeholder="月卡总收入" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" @change="showKey" readonly></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">+</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result2" placeholder="临停总收入" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">-</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result3" placeholder="运维维护成本" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">-</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result4" placeholder="运营维护成本" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" clearable @change="showKey" readonly></el-input>
                </div>
                <div class="ui-calc-table-column padding-5">=</div>
                <div class="ui-calc-table-column">
                    <el-input v-model="result5" placeholder="总收入" size="small" type="text" v-onlynumber="{ min: 0, precision: 2 }" readonly></el-input>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import utils from '../../../../utils/utils.js';
export default {
    name: "calc",
    data() {
        return {
            calc1: {
                num1: '',
                num2: '',
                num3: '',
                num4: ''
            },
            result1: '',
            calc2: {
                num1: '',
                num2: '',
                num3: '',
                num4: ''
            },
            result2: '',
            calc3: {
                num1: '',
                num2: ''
            },
            result3: '',
            calc4: {
                num1: '',
                num2: '',
                num3: ''
            },
            result4: '',
            result5: '',
        };
    },
    methods: {
        showKey() {
            let calc1Flag = Object.values(this.calc1).every(item => item > 0);
            let calc2Flag = Object.values(this.calc2).every(item => item > 0);
            let calc3Flag = Object.values(this.calc3).every(item => item > 0);
            let calc4Flag = Object.values(this.calc4).every(item => item > 0);
            if(calc1Flag){
                let {num1,num2,num3,num4} = this.calc1;
                this.result1 = utils.accMul(num1*utils.accDiv(num2,100)*num3,num4).toFixed(2);
            }else{
                this.result1 = '';
            } 
            if(calc1Flag){
                let {num1,num2,num3,num4} = this.calc2;
                this.result2 = utils.accMul(num1*utils.accDiv(num2,100)*num3,num4).toFixed(2);
            }else{
                this.result2 = '';
            }
            if(calc3Flag){
                let {num1,num2} = this.calc3;
                this.result3 = utils.accMul(num1,num2).toFixed(2);
            }else{
                this.result3 = '';
            }
            if(calc4Flag){
                let {num1,num2,num3} = this.calc4;
                this.result4 = utils.accMul(num1*num2,num3);
            }else{
                this.result4 = '';
            }
            let {result1,result2,result3,result4} = this;
            if(result1 > 0 && result2 > 0 && result3 > 0 && result4){
                this.result5 = utils.accDel(utils.accDel(utils.accAdd(result1,result2),result3),result4).toFixed(2);
            }else{
                this.result5 = '';
            }
        }
    },
    directives: {
        onlynumber: {
            inserted: function(el, vDir, vNode) {
                // vDir.value 有指令的参数
                let content;
                // 设置输入框的值,触发input事件,改变v-model绑定的值
                const setVal = val => {
                    if (vNode.componentInstance) {
                        // 如果是自定义组件就触发自定义组件的input事件
                        vNode.componentInstance.$emit("input", val);
                        vNode.componentInstance.$emit("change", val);
                    } else {
                        // 如果是原生组件就触发原生组件的input事件
                        el.value = val;
                        el.dispatchEvent(new Event("input"));
                        e.dispatchEvent(new Event("change"));
                    }
                };
                // 按键按下=>只允许输入 数字/小数点/减号
                el.addEventListener("keypress", event => {
                    const e = event || window.event;
                    const inputKey = String.fromCharCode(
                        typeof e.charCode === "number" ? e.charCode : e.keyCode
                    );
                    const reg = /\d|\.|-/;
                    content = e.target.value;
                    // 定义方法,阻止输入
                    function preventInput() {
                        if (e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    }
                    if (!reg.test(inputKey) && !e.ctrlKey) {
                        preventInput();
                    } else if (content.indexOf(".") > 0 && inputKey === ".") {
                        // 已有小数点,再次输入小数点
                        preventInput();
                    }
                });
                // 按键弹起=>并限制最大最小
                el.addEventListener("keyup", event => {
                    const e = event || window.event;
                    content = parseFloat(e.target.value);
                    if (!content) {
                        content = 0;
                    }
                    let arg_max = "";
                    let arg_min = "";
                    if (vDir.value) {
                        arg_max = parseFloat(vDir.value.max);
                        arg_min = parseFloat(vDir.value.min);
                    }
                    if (arg_max !== undefined && content > arg_max) {
                        setVal(arg_max);
                        content = arg_max;
                    }
                    if (arg_min !== undefined && content < arg_min) {
                        setVal(arg_min);
                        content = arg_min;
                    }
                });
                // 失去焦点=>保留指定位小数
                el.addEventListener('focusout', event => { // 此处会在 el-input 的 @change 后执行
                    const e = event || window.event
                    content = parseFloat(e.target.value)
                    if (!content) {
                        content = 0
                    }
                    let arg_precision = 0// 默认保留至整数
                    if (vDir.value.precision) {
                        arg_precision = parseFloat(vDir.value.precision)
                    }
                    e.target.value = content.toFixed(arg_precision)
                    setVal(e.target.value)
                // -- callback写法1
                // vNode.data.model.callback = ()=>{
                //     e.target.value = content.toFixed(arg_precision)
                // }
                // vNode.data.model.callback();
                // -- callback 写法2
                // vNode.data.model.callback(
                //     e.target.value = content.toFixed(arg_precision)
                // )
                })
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.ui-calc {
    margin-top: 10px;
    width: 100%;
    &-caption {
        font-size:14px;
        font-weight:600;
        margin-top:20px;
    }
    &-table {
        display: table;
        border-collapse: collapse;
        width: 100%;
        text-align: center;
        &-row {
            display: table-row;
            line-height: 40px;
            &.header {
                color: #333;
                background: #f5f7fa;
            }
        }
        &-column {
            display: table-cell;
            border: 1px solid #ddd;
            vertical-align: bottom;
            &.padding-5 {
                padding: 0 5px;
            }
        }
    }
}
</style>
<style lang="scss">
.ui-calc-table-column {
    .el-input__inner {
        border: 0;
    }
}
</style>