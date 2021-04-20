
<template>
    <div id='box' class="menu-hide">
        <section id="cd-timeline" class="cd-container">
            <div class="cd-timeline-block" v-for='(item,index) in update'>
                <div :class="['cd-timeline-img','bg'+index%3]">
                    <i class="fa fa-refresh"></i>
                </div>
                <div class="cd-timeline-content">
                    <h2>{{item.title}}</h2>
                    <p>{{item.content}}</p>
                    <span class="cd-date">{{item.time}}</span>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import utils from '../../utils/utils.js';
    export default {
        data:function(){
            return {
                update:[{
                    time:'2018-05-2',
                    title:'开发',
                    content:'缓存和停车场跳转功能'
                },{
                    time:'2018-04-24',
                    title:'开发',
                    content:'车位锁添加价格和运营商的选项'
                },{
                    time:'2018-04-24',
                    title:'开发',
                    content:'1.车位锁共享列表开发；2.优化车位锁列表和授权页面'
                },{
                    time:'2018-04-23',
                    title:'开发',
                    content:'月卡状态修改'
                },{
                    time:'2018-04-19',
                    title:'开发',
                    content:'行驶证，驾驶证信息识别'
                },{
                    time:'2018-04-18',
                    title:'开发',
                    content:'每日待办功能上线{续费申请,下发失败,月卡申请,车场掉线}'
                },{
                    time:'2018-04-18',
                    title:'更新',
                    content:'月卡编辑中新增车位数的修改'
                },{
                    time:'2018-04-10',
                    title:'开发',
                    content:'开发新的月卡导入页面；暂时保留旧版'
                },{
                    time:'2018-04-10',
                    title:'开发',
                    content:'车位锁列表页面添加二维码'
                },{
                    time:'2018-04-08',
                    title:'开发',
                    content:'月卡列表添加车牌换主卡功能'
                },{
                    time:'2018-04-08',
                    title:'更新',
                    content:'开发换车牌列表功能 changeplate'
                },{
                    time:'2018-04-04',
                    title:'更新',
                    content:'重构优惠券商家列表页面；fixed:添加弹窗时，填入手机号颜色问题;查找商户组件优化'
                },{
                    time:'2018-04-03',
                    title:'更新',
                    content:'开发智能客服UI,沟通相应需求'
                },{
                    time:'2018-04-03',
                    title:'更新',
                    content:'申请换规则页面，点同意后，先删除后下发'
                },{
                    time:'2018-04-03',
                    title:'更新',
                    content:'管理员列表页面，添加二维码：token和client参数'
                },{
                    time:'2018-03-30',
                    title:'更新',
                    content:'消息推送添加支付宝alipay的判断'
                },{
                    time:'2018-03-30',
                    title:'更新',
                    content:'停车场增加天眼查看'
                },{
                    time:'2018-03-30',
                    title:'更新',
                    content:'设置管理页重新加入设备类型接口及搜索条件'
                },{
                    time:'2018-03-30',
                    title:'更新',
                    content:'重构停车场进度页面'
                },{
                    time:'2018-03-30',
                    title:'更新',
                    content:'优化车场、车牌搜索组件'
                },{
                    time:'2018-03-30',
                    title:'更新',
                    content:'修改日报订单el-date-picker'
                }]
            }
        },
        computed:{

        },
        methods:{


        },
        beforeRouteEnter:function(to, from, next){
            next(function(vm){

            });
        },
    }
</script>
