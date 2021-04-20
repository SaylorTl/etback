export default {
    isInteger: /^\d+$/,
    isPositiveInteger: /^([1-9]\d*|[0]{1,1})$/,
    isMoney: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
    isMoneyMinus: /(^[-1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
    isEmpty: /^\s*$/,
    isMobile: /^(13|14|15|16|17|18|19)[0-9]{9}$/,
    isLetter: /^[a-zA-Z]+$/,
    isNumAndLetterAndUnderline: /^[a-zA-Z][0-9a-zA-Z_]{0,}$/,
    isCommon: /^[0-9a-zA-Z\u4e00-\u9fa5]+$/,
    isNumberLetterAndHorizontal: /^[0-9a-zA-Z-]+$/,
    isNumberAndLetter: /^[0-9a-zA-Z]+$/,
    isAllPunctuation: /^[`~!@#$^&*()=|{}':;',\[\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]+$/,
    isNumber: /^-?[0-9]\d*$/
};