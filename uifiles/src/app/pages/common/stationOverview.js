import utils from '../../../utils/utils';
/**
 * 根据车辆ID获取月卡列表
 * @param {int} car_id 
 */
const getContractList = function(car_id) {
        const url = `/contract/lists?page=1&pagesize=1000&car_id=${car_id}&status=working&is_expired=N`;
        return utils.fetch(url).then(res => {
            if (res.code === 0 && res.content && Array.isArray(res.content.lists) && res.content.lists.length > 0) {
                const result = res.content.lists;
                return result.pop();
            } else {
                return false;
            }
        })
    }
    /**
     * 根据停车场及车辆ID获取月卡申请信息
     * @param {int} station_id 
     * @param {int} car_id 
     */
const getPicByOldContract = function(station_id, car_id) {
        const url = `/examine/applylists?page=1&pagesize=20&station_id=${station_id}&car_id=${car_id}`;
        return utils.fetch(url).then(res => {
            if (res.code === 0 && res.content && Array.isArray(res.content.lists) && res.content.lists.length > 0) {
                const result = res.content.lists;
                return result.pop();
            } else {
                return false;
            }
        })
    }
    /**
     * 获取新月卡申请列表
     * @param {int} old_member_id 
     * @param {int} station_id 
     * @param {int} old_car_id 
     */
const getPicByNewContract = function(old_member_id, station_id, old_car_id) {
        const method = 'et_admin.contract.apply.lists';
        const params = {
            page: 1,
            pagesize: 20,
            apply_status: 'agree',
            old_member_id,
            station_id,
            old_car_id
        }
        return utils.fetchNew(method, params).then(res => {
            if (res.code === 0 && res.content && Array.isArray(res.content.lists) && res.content.lists.length > 0) {
                const result = res.content.lists;
                return result.pop();
            } else {
                return false;
            }
        })
    }
    /**
     * 根据key获取腾讯云图片
     * @param {string} key 
     * @param {string} type 
     */
const getImgURLByKey = function(key, type) {
        const method = 'et_admin.contract.apply.image',
            params = { key };
        let title = '';
        if (type == 'xsz_img') {
            title = '行驶证'
        } else if (type == 'jsz_img') {
            title = '驾驶证'
        }
        return utils.fetchNew(method, params).then(json => {
            if (json.code === 0 && json.content) {
                return { title, href: json.content };
            } else {
                return false;
            }
        })
    }
    /**
     * 根据车牌信息获取OpenID
     * @param {string} plate 
     */
const getOpenIDByPlate = function(plate) {
    const method = 'et_admin.member.carShow';
    return utils.fetchNew(method, { plate }).then(res => {
        if (res.code === 0 && Array.isArray(res.content)) {
            return res.content;
        } else {
            return false;
        }
    })
}
const getStationInfoByStation = function(station_id) {
    const url = `/station/lists?page=1&pagesize=20&station_id=${station_id}`;
    return utils.fetch(url).then(res => {
        if (res.code === 0 && res.content && Array.isArray(res.content.lists) && res.content.lists.length > 0) {
            const result = res.content.lists;
            return result.pop();
        } else {
            return false;
        }
    })
}

const isInStation = function(car_id) {
    const url = `/inout/inlists?page=1&pagesize=20&car_id=${car_id}&ismonth=N`;
    return utils.fetch(url).then(res => {
        if (res.code === 0 && res.content && Array.isArray(res.content)) {
            const result = res.content;
            return result[0];
        } else {
            return false;
        }
    })
}

export {
    getContractList,
    getPicByOldContract,
    getPicByNewContract,
    getImgURLByKey,
    // getOpenIDByPlate,
    getStationInfoByStation,
    isInStation
}