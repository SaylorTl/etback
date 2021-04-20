import qrBgUrl from '../img/qrcode_bg.png'
import textBgUrl from '../img/text_bg.png'
import utils from './utils.js'
import smileImg from '../img/smile.png'

const config = window.etback.config
const smileImgUrl = 'http://eparking.aparcar.cn/uploadfile/butler/2019/06/17/eefb42da0534fec3993c8467e399aedc.jpg'
const baseUrl = config.qrcodehost

/**
 * type: 1 展示文字 2 展示二维码 4 显示笑脸 128 测试图片效果
 * '快速出场临停缴费二维码': https://w.aparcar.cn/p/qr/ + device_id
 * '车场通用临停缴费二维码': https://w.aparcar.cn/p/q
 * '车场专用临停缴费二维码': https://w.aparcar.cn/p/q + station_id
 * '无牌车进场专用二维码': https://w.aparcar.cn/p/qr/ + device_id
 * '月卡缴费'： https://w.aparcar.cn/month/month-fee?plate=%E7%B2%A4B12345
 * '临停未缴费': https://w.aparcar.cn/temp/temp-pay?plate=%E7%B2%A4B159RP
 */

const robotBehavior = {
    certificate: {
        show: ['请您出示有效证件', '对准证件识别区', '正前方20厘米处', '谢谢您的配合！'],
        type: 1
    },
    init: {
        show: smileImgUrl,
        type: 4
    },
    // 普通临停进场
    in_temp_pay: {
        say: '欢迎光临，出场请提前扫码缴费',
        show: smileImgUrl,
        type: 4,
        openHandle: {
            say: '欢迎光临，出场请提前扫码缴费',
            show: smileImgUrl,
            type: 4
        }
    },
    // 有效月卡进场
    in_month: {
        say: '欢迎回家',
        show: smileImgUrl,
        type: 4,
        openHandle: {
            say: '欢迎回家',
            show: smileImgUrl,
            type: 4
        }
    },
    // 月卡过期超过3天进场
    in_overdue: {
        say: '请微信扫描屏幕二维码进行月卡缴费',
        show: {
            month: `${baseUrl}/month/month-fee`,
        },
        type: 2,
        openHandle: {
            say: '欢迎光临，出场请提前扫码缴费',
            show: smileImgUrl,
            type: 4
        }
    },
    // 月卡过期3天内进场
    in_overdue_in3days: {
        say: '欢迎回家',
        show: smileImgUrl,
        type: 4,
        openHandle: {
            say: '欢迎回家',
            show: smileImgUrl,
            type: 4
        }
    },
    // 车位被占进场
    in_position_occup: {
        say: '该车场不允许共享车位被占入场',
        show: ['共享车位已满', '在场车辆有'],
        type: 1,
        openHandle: {
            say: '欢迎回家',
            show: ['共享车位已满', '在场车辆有'],
            type: 1
        }
    },
    // 无牌车进场
    in_noplate: {
        say: '您是无牌车，请扫码后开闸进场',
        show: `${baseUrl}/p/qr`,
        isDevice: true,
        type: 2
    },
    // 异常进场
    in_exception: {
        say: '',
        show: smileImgUrl,
        type: 4
    },
    // 禁止进场
    forbidden_in: {
        say: '该车场禁止外来车辆入场',
        show: '禁止临停',
        type: 1
    },
    // 普通临停未缴费出场
    out_temp_pay: {
        say: '请扫码缴费或者出示您的微信付款码对准扫码口',
        show: {
            temp: `${baseUrl}/temp/temp-pay`,
        },
        type: 2
    },
    // 普通临停缴费出场
    out_temp_paid: {
        say: '一路平安',
        show: smileImgUrl,
        type: 4,
        openHandle: {
            say: '一路平安',
            show: smileImgUrl,
            type: 4
        }
    },
    // 有效月卡出场
    out_month: {
        say: '一路平安',
        show: smileImgUrl,
        type: 4,
        openHandle: {
            say: '一路平安',
            show: smileImgUrl,
            type: 4
        }
    },
    // 月卡过期超过3天出场
    out_overdue: {
        say: [
            '请微信扫描屏幕二维码进行月卡缴费',
            '请扫码缴费或者出示您的微信付款码对准扫码口'
        ],
        show: {
            month: `${baseUrl}/month/month-fee`,
            temp: `${baseUrl}/temp/temp-pay`
        },
        isDevice: true,
        type: 2
    },
    // 月卡过期3天内出场
    out_overdue_in3days: {
        say: '一路平安',
        show: smileImgUrl,
        type: 4,
        openHandle: {
            say: '一路平安',
            show: smileImgUrl,
            type: 4
        }
    },
    // 车位被占出场
    out_position_occup: {
        say: '请扫码缴费或者出示您的微信付款码对准扫码口',
        show: `${baseUrl}/p/qr`,
        isDevice: true,
        type: 2
    },
    // 无牌车出场
    out_noplate: {
        say: '您是无牌车，请扫码后开闸出场',
        show: `${baseUrl}/p/qr`,
        isDevice: true,
        type: 2
    },
    // 异常出场
    out_exception: {
        say: '请您出示有效证件，按屏幕显示拍照，谢谢您的配合',
        show: '证件拍照示意图',
        type: 1
    }
    //无入场纪录
}

export default class Robot {
    constructor(type, stationId, deviceId, openHandle = false) {
        this.type = type
        this.stationId = stationId
        this.deviceId = deviceId
        this.openHandle = openHandle
    }

    get say() {
        return this.openHandle ?
            robotBehavior[this.type].openHandle.say :
            robotBehavior[this.type].say
    }

    set _showType(type) {
        this.showType = type
    }

    get _showType() {
        return this.showType
    }

    set _plate(plate) {
        this.plate = plate
    }

    get _plate() {
        return this.plate
    }

    set _shareList(shareList) {
        this.shareList = shareList
    }

    get _shareList() {
        return this.shareList
    }

    /**
     * 根据类型生成缴费二维码
     */
    makeCode() {
        const currentRobot = robotBehavior[this.type]
        let show, isDevice, isStation, codeUrl
        if (this.openHandle) {
            const robotOpenHandle = currentRobot.openHandle
            show = robotOpenHandle.show
            isDevice = robotOpenHandle.isDevice
            isStation = robotOpenHandle.isStation
        } else {
            show = currentRobot.show
            isDevice = currentRobot.isDevice
            isStation = currentRobot.isStation
        }
        if (typeof show === 'object') {
            const plate = encodeURIComponent(this.plate)
            if (this.showType === 'temp') {
                codeUrl = `${show.temp}?plate=${plate}`
            } else {
                codeUrl = `${show.month}?plate=${plate}`
            }
        } else {
            codeUrl = show
        }

        if (isDevice) {
            if (!codeUrl.includes('?')) {
                codeUrl = `${codeUrl}/${this.deviceId}`
            }
        }

        if (isStation) {
            if (!codeUrl.includes('?')) {
                codeUrl = `${codeUrl}/${this.stationId}`
            }
        }

        const div = document.createElement('div')
        const qrcode = new QRCode(div, {
            width: 510,
            height: 510
        })
        qrcode.makeCode(codeUrl)
        const img = Array.from(div.getElementsByTagName('img'))[0]
        return new Promise(resolve => {
            img.onload = () => {
                resolve(img.src)
            }
        })
    }

    /**
     * 融合二维码（文字）和背景图片，生成一张新的图片
     */
    drawImage() {
        let type, show
        if (this.openHandle) {
            type = robotBehavior[this.type].openHandle.type
            show = robotBehavior[this.type].openHandle.show
        } else {
            type = robotBehavior[this.type].type
            show = robotBehavior[this.type].show
        }
        let bgUrl
        if (type === 1) {
            bgUrl = textBgUrl
        } else if (type === 2) {
            bgUrl = qrBgUrl
        } else if (type === 4) {
            return Promise.resolve({
                code: 0,
                content: robotBehavior[this.type].show
            })
        } else if (type === 128) {
            bgUrl = smileImg
        }
        const canvas = document.createElement('canvas')
        canvas.width = 768
        canvas.height = 1024
        const ctx = canvas.getContext('2d')

        //准备图片元素对象
        const qrBg = new Image()
        qrBg.src = bgUrl
        qrBg.width = 768
        qrBg.height = 1024
        qrBg.crossOrigin = 'Anonymous'

        const qrBgPromise = new Promise(resolve => {
            qrBg.onload = () => {
                ctx.drawImage(qrBg, 0, 0, 768, 1024)
                resolve()
            }
        })

        if (type === 1) {
            return qrBgPromise.then(
                () =>
                new Promise(resolve => {
                    const shareList = this.shareList
                    if (Array.isArray(shareList) && Array.isArray(show)) {
                        for (
                            let i = 0, len = shareList.length; i < len; i++
                        ) {
                            if (i >= 5) {
                                show.push('......')
                                return
                            }
                            if (i % 2 === 0) {
                                const current = shareList[i]
                                const next = shareList[i + 1] || ''
                                show.push(`${current} ${next}`)
                            } else {
                                continue
                            }
                        }
                    }
                    ctx.textBaseline = 'middle'
                    ctx.textAlign = 'center'
                    ctx.fillStyle = '#2c8a6d'
                    if (Array.isArray(show)) {
                        const len = show.length
                        const mid = Math.floor(len / 2)
                        show.forEach((v, i) => {
                            ctx.font = this.calcTextSize(v)
                            if (i > mid) {
                                ctx.fillText(
                                    v,
                                    canvas.width / 2,
                                    canvas.height / 2 + (i - mid) * 120
                                )
                            } else {
                                ctx.fillText(
                                    v,
                                    canvas.width / 2,
                                    canvas.height / 2 - (mid - i) * 120
                                )
                            }
                        })
                    } else {
                        ctx.font = this.calcTextSize(show)
                        ctx.fillText(
                            show,
                            canvas.width / 2,
                            canvas.height / 2
                        )
                    }

                    let base64Resource = canvas.toDataURL('image/png')
                    resolve(this.uploadImg(base64Resource))
                })
            )
        } else if (type === 2) {
            return qrBgPromise.then(
                () =>
                new Promise(resolve => {
                    this.makeCode().then(src => {
                        const qrImg = new Image()
                        qrImg.src = src
                        qrImg.width = 510
                        qrImg.height = 510
                        qrImg.crossOrigin = 'Anonymous'
                        qrImg.onload = () => {
                            ctx.drawImage(qrImg, 130, 100, 510, 510)
                            let base64Resource = canvas.toDataURL(
                                'image/png'
                            )
                            resolve(this.uploadImg(base64Resource))
                        }
                    })
                })
            )
        } else if (type === 128) {
            return qrBgPromise.then(
                () =>
                new Promise(resolve => {
                    let base64Resource = canvas.toDataURL('image/png')
                    resolve(this.uploadImg(base64Resource))
                })
            )
        }
    }

    uploadImg(base64_img_url) {
        base64_img_url = encodeURIComponent(base64_img_url);
        return utils
            .fetch('/custom/uploadBase64Image', {
                method: 'POST',
                body: { base64_img_url }
            })
            .then(res => {
                if (typeof res != 'undefined') {
                    return res
                }
            })
    }

    calcTextSize(str) {
        if (str.length < 4) {
            return '160px Helvetica'
        } else if (4 <= str.length <= 8) {
            return '90px Helvetica'
        } else {
            return '60px Helvetica'
        }
    }
}