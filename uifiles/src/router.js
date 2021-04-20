import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import store from './app/store/store.js';
import utils from './utils/utils.js';
import coupon_auto from './app/pages/coupon/auto.vue';
import coupon_system from './app/pages/coupon/system.vue';
import coupon_systemquota from './app/pages/coupon/system_quota.vue';
import merchant_account from './app/pages/merchant_account.vue';

let config = window.etback.config;

import welcome from './app/pages/welcome2.vue';
import login from './app/pages/login.vue';
import station from './app/pages/station.vue';
import qrentrance from './app/pages/qrentrance.vue';
import weservice from './app/pages/weservice.vue';
import station_rate from './app/pages/station/stationrate.vue'; //车场进度表
import congestionList from './app/pages/station/congestionList.vue'; //拥堵指数
import vendor from './app/pages/vendor.vue';
import vendortest from './app/pages/vendortest.vue';
import deptmanage from './app/pages/deptmanage.vue';
import epdeptmanage from './app/pages/epdeptmanage.vue';
import car_lists from './app/pages/car/lists.vue';
import car_virtual from './app/pages/car/virtualcar.vue';
import car_statistics from './app/pages/car/statistics.vue';
import car_operation from './app/pages/car/operation.vue';
import client from './app/pages/client.vue';
import device_lists from './app/pages/device/lists.vue';
import yscamera from './app/pages/device/yscamera.vue';

import contract_importlog from './app/pages/contract/importlog.vue';
import contract_lists from './app/pages/contract/lists.vue';
import contract_import from './app/pages/contract/import.vue';
import contract_oldimport from './app/pages/contract/import3.vue';
import contract_rules from './app/pages/contract/rules.vue';
import contract_allchangelog from './app/pages/contract/allchangelog.vue';
import contract_unexpected from './app/pages/contract/unexpected.vue';
import contract_changeplate from './app/pages/contract/changeplate.vue';
import difference from './app/pages/contract/difference.vue';
import finance from './app/pages/contract/finance.vue';
import financedata from './app/pages/contract/financedata.vue';
import contract_discount from './app/pages/contract/discount.vue';
import changerule from './app/pages/contract/changerule.vue';
import ecard_lists from './app/pages/ecard/lists.vue';
import ecard_rules from './app/pages/ecard/rules.vue';
import apply_lists from './app/pages/examine/apply.vue';
import apply_lists_new from './app/pages/examine/apply_new.vue';
import renew_lists from './app/pages/examine/renew.vue';
import inlists from './app/pages/inout/inlists.vue';
import ready_inlists from './app/pages/inout/readyinlists.vue';
import outlists from './app/pages/inout/outlists.vue';
import exception from './app/pages/inout/exception.vue';
import specialgo from './app/pages/inout/specialgo.vue';
import order_payment from './app/pages/order/payment.vue';
import order_apply from './app/pages/order/apply.vue';
import order_bank from './app/pages/order/bank.vue';
import order_daily from './app/pages/order/daily.vue';
import order_family_card from './app/pages/order/familyCard.vue';
import order_upload from './app/pages/order/uploadphoto.vue';
import order_advert from './app/pages/order/advert.vue';
import thirdpartorder from './app/pages/order/thirdpartorder.vue';

import report_bill from './app/pages/report/bill.vue';
import month_ledger from './app/pages/report/monthLedger.vue';
import mothly_detail from './app/pages/report/mothlyDetail.vue';
import mothly_income_summary from './app/pages/report/mothlyIncomeSummary.vue'
import coupon_use_summary from './app/pages/report/couponUseSummary.vue'
import temp_income from './app/pages/report/tempIncome.vue'
import report_offline from './app/pages/report/offline.vue';
import report_base from './app/pages/report/base.vue';
import report_computer from './app/pages/report/computer.vue';
import report_income from './app/pages/report/income.vue';
import report_contract from './app/pages/report/contract.vue';
import report_bottom from './app/pages/report/bottomrevenue.vue';
import report_balance from './app/pages/report/balance.vue';
import report_export from './app/pages/report/export.vue';
import reconciliation_down from './app/pages/report/reconciliationdown.vue';
import report_excel from './app/pages/report/excelcompare.vue';
import month_export from './app/pages/report/monthexport.vue';
import formexport from './app/pages/report/formexport.vue';
import offline_export from './app/pages/report/offlineexport.vue';
import abnormal_open from './app/pages/report/abnormalopen.vue';
import tempcontrol from './app/pages/report/tempcontrol.vue';

import offlineDevice from './app/pages/report/offlineDevice.vue';
import offlineDeviceDetail from './app/pages/report/offlineDeviceDetail.vue';

import blacklist from './app/pages/blacklist.vue';
import platelist from './app/pages/platelist.vue';
import carport from './app/pages/carport.vue';
import noplateinlist from './app/pages/noplateinlist.vue';
import user from './app/pages/admin/user.vue';
import privileges from './app/pages/admin/privileges.vue';
import role from './app/pages/admin/role.vue';
import catalog from './app/pages/admin/catalog.vue';
import tradeDetail from './app/pages/coupon/tradeDetail' //积分使用详情-交易详情
import memberRules from './app/pages/coupon/memberRules' //会员积分规则
import coupon_recall from './app/pages/coupon/recall.vue';
import coupon_read from './app/pages/coupon/history.vue';
import coupon_seller from './app/pages/coupon/seller.vue';
import coupon_type from './app/pages/coupon/type.vue';
import coupon_wait from './app/pages/coupon/waiting.vue';
import coupon_batch from './app/pages/coupon/batch.vue';
import coupon_order from './app/pages/coupon/order.vue';
import coupon_authorize from './app/pages/coupon/authorize.vue';
import coupon_limit from './app/pages/coupon/limit.vue';
import lock_device from './app/pages/parkinglock/devicemanage.vue'
import lock_village from './app/pages/parkinglock/villagemanage.vue'
import lock_supply from './app/pages/parkinglock/giveauth.vue'
import lock_freeshare from './app/pages/parkinglock/freeshare.vue'
import lock_Virtualshare from './app/pages/parkinglock/virtualshare.vue'
import lock_ordershare from './app/pages/parkinglock/ordershare.vue'
import lock_Virtualordershare from './app/pages/parkinglock/virtualOrdershare.vue'
import lock_parklockorder from './app/pages/parkinglock/parklockorder.vue';
import charge from './app/pages/charge/index.vue' //收费规则
import charge_contrast from './app/pages/charge/contrast.vue'
import callinfo from './app/pages/callinfo.vue'
import updatelog from './app/pages/updatelog.vue'
import todolist from './app/pages/todolist.vue'
import listsfor4G from './app/pages/listsfor4G.vue'
import todolist_admin from './app/pages/todolist_admin.vue'
import invoice_payer from './app/pages/invoice/payer.vue'
import invoice_record from './app/pages/invoice/record.vue'
import invoice_feelist from './app/pages/invoice/feelist.vue'
import invoice_rule from './app/pages/invoice/rule.vue'
import develop_error from './app/pages/develop/errorlist.vue'
import develop_log from './app/pages/develop/showlog.vue'
import prepaid_paidlist from './app/pages/prepaidcard/paid.vue'
import prepaid_deduct from './app/pages/prepaidcard/deduct.vue'
import prepaid_balance from './app/pages/prepaidcard/balance.vue'
import prepaid_authdeduct from './app/pages/prepaidcard/authdeduct.vue'
import prepaid_stationuser from './app/pages/prepaidcard/stationuser.vue'
import prepaid_supportive from './app/pages/prepaidcard/supportive.vue'
import operationlog from './app/pages/operationlog.vue'
import wechatnews from './app/pages/wechatnews.vue'
import wechatsend from './app/pages/wechatsend.vue'
import insurance_order from './app/pages/insurance/order.vue'
import insurance_lists from './app/pages/insurance/lists.vue'
import insurance_advs from './app/pages/insurance/advs.vue'
import insurance_ad201904 from './app/pages/insurance/ad201904.vue'
import insurance_push from './app/pages/insurance/push.vue'
import insurance_mealticket from './app/pages/insurance/insurance_mealticket.vue'

import washcoupon from './app/pages/washlist/washcoupon.vue'
import washdevices from './app/pages/washlist/devices.vue'
import washnets from './app/pages/washlist/nets.vue'
import washorders from './app/pages/washlist/orders.vue'
import hitcount from './app/pages/hitcount.vue'
import noncontract from './app/pages/inout/noncontract.vue';
import merchant_list from './app/pages/merchant.vue';
import datum_list from './app/pages/datum.vue';
import bankpay from './app/pages/bankpay.vue';
import approval_process from './app/pages/approval/process.vue';
import approval_launch from './app/pages/approval/launch.vue';
import approval_mine from './app/pages/approval/mine.vue';
import error from './app/pages/error.vue';
import property_company from './app/pages/property_company.vue';
import pre_appearance_config from './app/pages/coupon/pre_appearance_config.vue';
import scan_ticket from './app/pages/coupon/scan_ticket.vue';
import receipt_info from './app/pages/coupon/receipt_info.vue';
import cService_index from './app/pages/cService/index.vue';
import cService_server from './app/pages/cService/server.vue';
import cService_control from './app/pages/cService/control.vue';
import cService_case from './app/pages/cService/case.vue';
import cService_openlist from './app/pages/cService/openlist.vue';
import cService_robot from './app/pages/cService/robot.vue';
import cService_outlist from './app/pages/cService/outlist.vue';
import intelligence_order from './app/pages/cService/intelligenceOrder.vue';
//公众号拉新活动
import game_newuser_userList from './app/pages/game/newUser/userList.vue';
import game_newuser_discountLists from './app/pages/game/newUser/discountLists.vue';
import game_newuser_carRegister from './app/pages/game/newUser/carRegister.vue';
import ipos_receipt from './app/pages/invoice/iposreceipt.vue';
// 落闸列表
import handleOpen from './app/pages/wxmanager/handleOpen.vue';
// 出入口管理
import outInManager from './app/pages/outinmanager/outInManager.vue'
// 设备详情列表
import deviceDetails from './app/pages/devicedetails/deviceDetails.vue'

import cost_management from './app/pages/common/cost_management.vue'
//车况快捷查询
import station_overview from './app/pages/common/stationOverview.vue';
//车场概况
import station_analysis from './app/pages/station/stationAnalysis.vue';
var r = [
    { path: "/", redirect: "/welcome" },
    { path: "/welcome", name: "欢迎", component: welcome },
    { path: "/error", name: "错误提示", component: error },
    { path: "/login", name: "登陆", component: login },
    { path: "/station", name: "停车场", component: station },
    { path: "/vendor", name: "供应商", component: vendor },
    { path: "/vendortest", name: "供应商测试", component: vendortest },
    { path: "/deptmanage", name: "区域管理", component: deptmanage },
    { path: "/epdeptmanage", name: "易停区域管理", component: epdeptmanage },
    { path: "/car/lists", name: "车辆", component: car_lists },
    { path: "/car/virtual", name: "虚拟车辆", component: car_virtual },
    { path: "/car/statistics", name: "车辆锁车率统计", component: car_statistics },
    { path: "/car/operation", name: "锁车记录", component: car_operation },
    { path: "/client", name: "会员", component: client },
    { path: "/weservice", name: "推送消息", component: weservice },
    { path: "/device/lists", name: "设备管理", component: device_lists },
    { path: "/device/yscamera", name: "萤石摄像头", component: yscamera },

    { path: '/blacklist', name: '黑白名单', component: blacklist },
    { path: '/platelist', name: '车牌列表', component: platelist },
    { path: '/carport', name: '车位管理', component: carport },
    { path: '/noplateinlist', name: '无牌车进场记录', component: noplateinlist },
    { path: '/ecard/lists', name: '一卡通列表', component: ecard_lists },
    { path: '/ecard/rules', name: '一卡通区域', component: ecard_rules },
    { path: '/contract/lists', name: '月卡', component: contract_lists, meta: { keepAlive: true } },
    { path: '/contract/importlog', name: '月卡导入记录', component: contract_importlog },
    { path: '/contract/import', name: '月卡导入', component: contract_import },
    { path: '/contract/import_old', name: '月卡导入旧版', component: contract_oldimport },
    { path: '/contract/rules', name: '月卡规则', component: contract_rules },
    { path: '/contract/allchangelog', name: '换车牌统计', component: contract_allchangelog },
    { path: '/contract/unexpected', name: '月卡车异常消息', component: contract_unexpected },
    { path: '/contract/changeplate', name: '换车牌列表', component: contract_changeplate },
    { path: '/contract/difference', name: '报表导入', component: difference },
    { path: '/contract/finance', name: '财务报表', component: finance, meta: { keepAlive: true } },
    { path: '/contract/discount', name: '月卡折扣', component: contract_discount },
    { path: '/contract/financedata', name: '财务数据', component: financedata },
    { path: '/contract/changerule', name: '换规则申请', component: changerule, meta: { keepAlive: true } },
    { path: '/inout/inlists', name: '进场记录', component: inlists, meta: { keepAlive: true } },
    { path: '/inout/readyinlists', name: '预约进场', component: ready_inlists },
    { path: '/inout/outlists', name: '出场记录', component: outlists, meta: { keepAlive: true } },
    { path: '/inout/exception', name: '异常开闸', component: exception, meta: { keepAlive: true } },
    { path: '/inout/specialgo', name: '预出场列表', component: specialgo },
    { path: '/report/base', name: '基础运营报表', component: report_base, meta: { keepAlive: true } },
    { path: '/report/bill', name: '收入统计', component: report_bill, meta: { keepAlive: true } },
    { path: '/report/month_ledger', name: '月卡台账', component: month_ledger, meta: { keepAlive: true } },
    { path: '/report/mothly_detail', name: '月卡明细台账', component: mothly_detail, meta: { keepAlive: true } },
    { path: '/report/mothly_income_summary', name: '月卡收入汇总', component: mothly_income_summary, meta: { keepAlive: true } },
    { path: '/report/coupon_use_summary', name: '优惠券使用汇总', component: coupon_use_summary, meta: { keepAlive: true } },
    { path: '/report/temp_income', name: '临停收入', component: temp_income, meta: { keepAlive: true } },

    { path: "/report/offline", name: "车场掉线", component: report_offline },
    { path: "/report/offlineexport", name: "车场掉线导出", component: offline_export, meta: { keepAlive: true } },
    { path: "/report/computer", name: "收入报表", component: report_computer },
    // { path: '/report/income', name:'收入对比', component: report_income },
    { path: "/report/contract", name: "月卡趋势", component: report_contract, meta: { keepAlive: true } },
    { path: "/report/balance", name: "月卡对比", component: report_balance, meta: { keepAlive: true } },
    { path: "/report/export", name: "报表导出", component: report_export },
    { path: "/report/reconciliationdown", name: "每日对账下载", component: reconciliation_down },
    { path: "/report/bottomrevenue", name: "兜底收入", component: report_bottom, meta: { keepAlive: true } },
    { path: "/report/monthexport", name: "月卡导出", component: month_export },
    { path: "/report/formexport", name: "导出", component: formexport },

    { path: '/report/abnormalopen', name: '异常开闸报表', component: abnormal_open },
    { path: '/report/excel', name: 'excel对比', component: report_excel },
    { path: '/report/tempcontrol', name: '管控日报', component: tempcontrol, meta: { keepAlive: true } },
    { path: '/report/offlineDevice', name: '设备掉线统计', component: offlineDevice },
    { path: '/report/offlineDeviceDetail', name: '设备掉线详情', component: offlineDeviceDetail },
    { path: '/examine/apply_lists', name: '月卡申请', component: apply_lists, meta: { keepAlive: true } },
    { path: '/examine/apply_lists_new', name: '月卡申请(新)', component: apply_lists_new, meta: { keepAlive: true } },
    { path: '/examine/renew_lists', name: '续费申请', component: renew_lists },
    { path: '/order/payment', name: '交易订单', component: order_payment, meta: { keepAlive: true } },
    { path: '/order/apply', name: '续费订单', component: order_apply, meta: { keepAlive: true } },
    { path: '/order/bank', name: '银行代扣订单', component: order_bank },
    { path: '/order/daily', name: '日报订单', component: order_daily },
    { path: '/order/familyCard', name: '亲情卡使用列表', component: order_family_card, meta: { keepAlive: true } },
    { path: '/order/uploadphoto', name: '验收查看', component: order_upload },
    { path: '/order/advert', name: '广告', component: order_advert },
    // { path: '/order/propertyfee', name:'物业费订单', component: property_fee},
    { path: "/order/thirdpartorder", name: "第三方订单", component: thirdpartorder },

    { path: "/admin/user", name: "管理员", component: user },
    { path: "/admin/role", name: "角色", component: role },
    { path: "/admin/privileges", name: "权限", component: privileges },
    { path: "/catalog", name: "栏目管理", component: catalog },
    { path: "/coupon/tradeDetail", name: "积分交易详情", component: tradeDetail },
    { path: "/coupon/memberRules", name: "积分会员规则", component: memberRules },
    { path: "/coupon/recall", name: "优惠券撤回列表", component: coupon_recall },
    { path: "/coupon/history", name: "优惠券列表", component: coupon_read },
    { path: "/coupon/type", name: "优惠券类型", component: coupon_type, meta: { keepAlive: true } },
    { path: "/coupon/seller", name: "优惠券商家", component: coupon_seller },
    { path: "/coupon/waiting", name: "优惠券待购买", component: coupon_wait, meta: { keepAlive: true } },
    { path: "/coupon/batch", name: "优惠券批次", component: coupon_batch },
    { path: "/coupon/order", name: "优惠券订单", component: coupon_order },
    { path: "/coupon/limit", name: "优惠劵限制", component: coupon_limit, meta: { keepAlive: true } },
    { path: "/coupon/authorize", name: "商家授权", component: coupon_authorize, meta: { keepAlive: true } },
    { path: "/coupon/auto", name: "自动领券配置", component: coupon_auto },
    { path: "/coupon/system", name: "系统发券配置", component: coupon_system },
    { path: "/coupon/systemquota", name: "系统定额券列表", component: coupon_systemquota },
    { path: "/station/stationrate", name: "停车场进度", component: station_rate },
    { path: "/station/congestionList", name: "拥堵指数", component: congestionList },
    { path: "/parkinglock/devicemanage", name: "车位锁列表", component: lock_device },
    { path: "/parkinglock/villagemanage", name: "车位锁操作记录", component: lock_village },
    { path: "/parkinglock/giveauth", name: "车位锁授权", component: lock_supply },
    { path: "/parkinglock/freeshare", name: "免费共享", component: lock_freeshare },
    { path: "/parkinglock/virtualshare", name: "虚拟预约共享", component: lock_Virtualshare },
    { path: "/parkinglock/ordershare", name: "预约共享", component: lock_ordershare },
    { path: "/parkinglock/virtualordershare", name: "虚拟共享订单", component: lock_Virtualordershare },
    { path: "/parkinglock/parklockorder", name: "车位锁预约共享订单", component: lock_parklockorder },
    { path: "/charge/index", name: "收费规则", component: charge },
    { path: "/charge/contrast", name: "计费比对", component: charge_contrast },
    { path: "/updatelog", name: "功能更新记录", component: updatelog },
    { path: "/todolist", name: "每日待办", component: todolist },
    { path: "/listsfor4G", name: "车场4G列表", component: listsfor4G },
    { path: "/admin/todolist_admin", name: "运营事业部管理", component: todolist_admin },
    { path: "/callinfo", name: "智能客服", component: callinfo },
    { path: "/invoice/payer", name: "纳税人列表", component: invoice_payer },
    { path: "/invoice/record", name: "开票记录", component: invoice_record },
    { path: "/invoice/feelist", name: "发票费用", component: invoice_feelist },
    { path: "/invoice/rule", name: "车场开票规则", component: invoice_rule },
    { path: "/invoice/ElectronicReceipt", name: "电子收据", component: ipos_receipt },

    { path: "/prepaidcard/paid", name: "充值订单", component: prepaid_paidlist },
    { path: "/prepaidcard/deduct", name: "扣款", component: prepaid_deduct },
    { path: "/prepaidcard/balance", name: "储值卡信息", component: prepaid_balance },
    { path: "/prepaidcard/authdeduct", name: "储值卡授权", component: prepaid_authdeduct },
    { path: "/prepaidcard/stationuser", name: "亲情卡用户管理", component: prepaid_stationuser },
    { path: "/prepaidcard/supportive", name: "支持停车场", component: prepaid_supportive },
    { path: "/operationlog", name: "客服操作日志", component: operationlog },
    { path: "/wechatnews", name: "微信图文信息", component: wechatnews },
    { path: "/wechatsend", name: "微信发送纪录", component: wechatsend },
    { path: "/insurance/order", name: "车险订单", component: insurance_order },
    { path: "/insurance/lists", name: "车险列表", component: insurance_lists },
    { path: "/insurance/advs", name: "车险活动", component: insurance_advs },
    { path: "/insurance/ad04", name: "201904车险活动", component: insurance_ad201904 },
    { path: "/insurance/push", name: "车险个性化推送", component: insurance_push },
    { path: "/insurance/mealticket", name: "彩饭票", component: insurance_mealticket },

    { path: "/washcoupon", name: "洗车券列表", component: washcoupon },
    { path: "/wash/devices", name: "洗车设备", component: washdevices },
    { path: "/wash/nets", name: "洗车网点", component: washnets },
    { path: "/wash/orders", name: "洗车订单", component: washorders },
    { path: "/hitcount", name: "浏览统计", component: hitcount },
    { path: "/noncontract", name: "非月卡车进出场", component: noncontract },
    { path: "/merchantlist", name: "商户管理", component: merchant_list },
    { path: "/merchantAccount", name: "商户账户列表", component: merchant_account },
    { path: "/datumlist", name: "资料管理", component: datum_list },
    { path: "/bankpay", name: "无感车场", component: bankpay },
    { path: "/develop/errorlist", name: "错误列表", component: develop_error },
    { path: "/develop/showlog", name: "查看日志", component: develop_log },
    { path: "/approval/process", name: "审批流程", component: approval_process }, //审批流程
    { path: "/approval/launch", name: "新建审批", component: approval_launch }, //新建审批
    { path: "/approval/mine", name: "我的审批", component: approval_mine }, //我的审批
    { path: "/qrentrance", name: "物料下载", component: qrentrance },
    { path: "/property", name: "物业公司管理", component: property_company }, // 物业公司管理
    { path: "/coupon/pre_appearance_config", name: "优惠券预出场配置", component: pre_appearance_config }, // 优惠券预出场配置
    { path: "/coupon/scan_ticket", name: "扫小票领券", component: scan_ticket }, // 扫小票领券
    { path: "/coupon/receipt_info", name: "扫小票记录", component: receipt_info }, // 扫小票记录
    { path: "/handleOpen", name: "落闸列表", component: handleOpen },
    { path: "/outInManager", name: "出入口管理", component: outInManager }, // 出入口管理
    { path: "/deviceDetails", name: "设备详情列表", component: deviceDetails }, // 设备详情列表

    { path: "/cService/index", name: "客服首页", component: cService_index, meta: { keepAlive: true } }, //智能客服 首页
    { path: "/cService/server", name: "新版智能客服", component: cService_server, meta: { keepAlive: true } }, //智能客服 服务页
    { path: "/cService/control", name: "日常管控", component: cService_control, meta: { keepAlive: true } }, //智能客服 日常管控
    { path: "/cService/case", name: "操作日志", component: cService_case }, //智能客服 操作日志
    { path: "/cService/openlist", name: "开闸列表", component: cService_openlist }, //智能客服 开闸列表
    { path: "/cService/robot", name: "机器人列表", component: cService_robot }, //智能客服 机器人列表
    { path: "/cService/outlist", name: "呼出列表", component: cService_outlist }, //智能客服 呼出闲置列表
    { path: "/cService/intelligenceOrder", name: "智能工单", component: intelligence_order, meta: { keepAlive: true } }, //智能工单

    { path: '/game/userList', name: '用户绑定列表', component: game_newuser_userList }, //公众号拉新活动用户绑定列表
    { path: '/game/discountLists', name: '抵扣金列表', component: game_newuser_discountLists }, //公众号拉新活动抵扣金列表
    { path: '/game/carRegister', name: '车辆认证列表', component: game_newuser_carRegister }, //公众号拉新活动用户绑定列表

    { path: '/common/cost_management', name: '运营成本管理', component: cost_management }, //成本管理
    { path: '/common/station_overview', name: '车况快捷查询', component: station_overview, meta: { keepAlive: true } }, //车况快捷查询
    { path: '/station/station_analysis', name: '停车场概况', component: station_analysis, meta: { keepAlive: true } }, //车场概况
];

var router = new VueRouter({ mode: 'history', routes: r });

// router.beforeEach(function(to, from, next){
//     if(to.path != '/login'){
//         utils.rpc.config().then(function(data){
//             if(typeof(data) != 'undefined' && data.code == 0){
//                 var result = data.content;
//                 if(result.islogin){
//                     store.commit('sign_in',{islogin:true,data:result.login,tags:result.tags});    //登录信息
//                     store.commit('catalog',result.catalog_selected);  //顶部栏目
//                     store.commit('header_pop_event',{catalog:result.catalog});       //顶部弹窗的所有栏目
//
//                     //栏目访问权限判断
//                     if(to.path == '/' || to.path == '/welcome' || to.path == '/error'){
//                         store.commit('bar_open',to);
//                         next();
//                     }else{
//                         var hasPath = false;
//                         for(var m in result.catalog){
//                             if(typeof(result.catalog[m].lists) != 'undefined' && result.catalog[m].lists.length > 0){
//                                 for(var n in result.catalog[m].lists){
//                                     if(to.path == result.catalog[m].lists[n].path){
//                                         hasPath = true;
//                                         if( parseInt(result.catalog[m].lists[n].auth) == 1 ){
//                                             store.commit('bar_open',to);
//                                             next();
//                                         }else{
//                                             store.commit('error_page',{message:'您无权访问此页面'});
//                                         }
//                                         break;
//                                     }
//                                 }
//                             }
//                         }
//                         if(hasPath == false) store.commit('error_page',{message:'此页面不存在'});
//                     }
//                 }else{
//                     utils.rpc.logout().then(function(json){
//                         if(typeof(json) != 'undefined' && json.code == 0){
//                             store.commit('sign_out');
//                             next({path:'/login'});
//                         }else{
//                             store.commit('error_page',{message:'退出报错'});  //出错  跳转到错误提示页面
//                         }
//                     });
//                 }
//                 store.commit('endrender');
//             } else if(typeof(data) != 'undefined' && (data.code == 100 || data.code == 101)){
//                 console.log(data.message);
//             }else{
//                 store.commit('error_page',{message:'获取config配置出错'});  //出错  跳转到错误提示页面
//             }
//         });
//     }else{
//         store.commit('endrender');
//         next();
//     }
// })

import oauth from './utils/oauth.js';

router.beforeEach(function(to, from, next) {
    var code = oauth.eting.getUrlCode(to.query);
    oauth.eting.getAccessToken(code).then(function(data) {
        if (data && data.code == 0) {
            var token = "v2web_" + data.content.openid + "_" + data.content.access_token;
            window.localStorage.setItem('access_token', token);
            window.localStorage.setItem('new_access_token', data.content.new_access_token);
            return token;
        } else {
            return window.localStorage.getItem('access_token') ? window.localStorage.getItem('access_token') : false;
        }
    }).then(function(token) {
        oauth.eting.getConfig(token).then(function(result) {
            if (result === false || result.code != 0 || result.content.islogin == false) {
                window.localStorage.setItem('access_token', '');
                window.localStorage.setItem('new_access_token', '');
                window.sessionStorage.clear();
                window.location.href = config.oauthhost + "/member/login?source=web&client_id=G8b875FDhzW0&state=1112324&redirect_uri=" + encodeURIComponent(window.location.protocol + "//" + window.location.host + to.path);
            } else {
                var bd = result.content;
                window.sessionStorage.setItem('catalog', JSON.stringify(bd.catalog)); //所有栏目
                store.commit('sign_in', { islogin: true, data: bd.login, tags: bd.tags }); //登录信息
                store.commit('catalog', bd.catalog_selected); //顶部栏目
                store.commit('header_pop_event', { catalog: bd.catalog }); //顶部弹窗的所有栏目

                //栏目访问权限判断
                if (to.path == '/' || to.path == '/welcome' || to.path == '/error') {
                    store.commit('bar_open', to);
                    next();
                } else {
                    var hasPath = false;
                    for (var m in bd.catalog) {
                        if (typeof(bd.catalog[m].lists) != 'undefined' && bd.catalog[m].lists.length > 0) {
                            for (var n in bd.catalog[m].lists) {
                                if (to.path == bd.catalog[m].lists[n].path) {
                                    hasPath = true;
                                    if (parseInt(bd.catalog[m].lists[n].auth) == 1) {
                                        store.commit('bar_open', to);
                                        next();
                                    } else {
                                        store.commit('error_page', { message: '您无权访问此页面' });
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (hasPath == false) store.commit('error_page', { message: '此页面不存在' });
                }
            }
            store.commit('endrender');
        });
    });
})


export default router;