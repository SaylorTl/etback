const config = {
    statusMap: {
        plan: "计划中",
        building: "建设中",
        ready: "ready",
        active: "运营中",
        canceled: "已退场"
    },
    payMethod: {
        'WECHAT': "彩之云微信",
        'WX_AGUA': "阿瓜微信",
        'ZXWECHAT': "智轩微信",
        'ETALI': "ET支付宝",
        'EPALIPAY': "懿轩支付宝1",
        'EPWECHAT': "懿轩微信",
        'CZY': "彩之云",
        'CZYv1': "E费通",
        'EPOS': "iPOS",
        'TCB': "停车宝",
        'CWB': "车位宝",
        'ICBCPAY': '工行',
        'UNKNOWN': '未知',
        'EPBUTLER': '车场助手小程序',
        'DEDUCTION': '全额抵扣',
        'ETPOS': "易停POS",
        'EPMINIAPPS': "微信小程序",
        'UNIONPAY': "银联",
        'ZXALIPAY': "懿轩支付宝2",
        'CAIHUI_MINIAPPS': '彩惠小程序',
        'WXSCAN': '微信扫码枪',
        'WXIPOSQR': 'IPOS懿轩微信扫码',
        'HELIPAY_ZXWECHAT': '合利宝智轩微信',
        'HELIPAY_EPWECHAT': '合利宝懿轩微信'
    },
    payStatus: {
        'created': "已创建,未支付",
        'paid': "已支付",
        'canceled': "已取消,未支付",
        'closed': "已关闭,未支付",
        'invalid': "无效",
        'return': "退款"

    },
    ID_PREFIX: '701702', //tree组件中需要修改停车场ID 必须是数字
    _click_count: {
        'index': '首页',
        'wechat_czy': '彩生活微信',
        'wechat_ep': '懿轩微信',
        'wechat_zx': '智轩微信',
        'browser': '浏览器',
        'czy': '彩之云APP',
        'zfb': '支付宝',
        'pay_after': '支付结果显示页',
        'pay_qrcode': '通用扫码页',
        'pay_qrcode_s': '停车场专用扫码页',
        'pay_qrcode_d': '道闸专用扫码页',
        's_qr_adv': '车场专用扫码页广告点击量',
        'd_qr_adv': '道闸专用扫码页广告点击量',
        'qr_adv': '通用扫码页广告点击量',
        'adv_pay_after': '支付结果显示页广告点击量',
        'adv_index_bottom': '首页下面的广告点击量',
        'adv_washCoupon': '9.9元洗车券抢购活动',
        'etc-0807': '建行ETC活动'
    },
    mimeType: {
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'png': 'image/png',
    },
    stationProperty: [{
            value: '室内',
            key: 'indoor'
        },
        {
            value: '露天',
            key: 'openAir'
        },
        {
            value: '商业',
            key: 'bussiness'
        },
        {
            value: '住宅',
            key: 'residence'
        },
        {
            value: '写字楼',
            key: 'officeBuilding'
        },
        {
            value: '酒店',
            key: 'hotel'
        },
        {
            value: '公共场所',
            key: 'publicPlace'
        }
    ]
}
export default config