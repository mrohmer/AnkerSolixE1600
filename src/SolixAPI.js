const {createCipheriv, createECDH, createHash} = require("crypto");
const HttpError = require("./HttpError");
const {pad} = require("./utils/pad-nbr");
const {normalizeDate} = require("./utils/normalize-date");

/**
 * @typedef {Object} Options
 * @property {string} username
 * @property {string} password
 * @property {string} country
 * @property {any} [logger]
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} ab
 * @property {{ public_key: string }} client_secret_info
 * @property {number} enc
 * @property {string} email
 * @property {string} password
 * @property {number} time_zone
 * @property {string} transaction
 * @property {string} [verify_code]
 * @property {string} [captcha_id]
 * @property {string} [answer]
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {number} code
 * @property {string} msg
 * @property {any} data
 */

/**
 * @typedef {Object} BaseResponse
 * @property {number} code
 * @property {string} msg
 * @property {any} [data]
 * @property {any} [outline]
 * @property {string} trace_id
 */

/**
 * @typedef {BaseResponse & SuccessResponse} ResultResponse
 */

/**
 * @typedef {Object} LoginResultResponse
 * @property {string} user_id
 * @property {string} email
 * @property {string} nick_name
 * @property {string} auth_token
 * @property {number} token_expires_at
 * @property {string} avatar
 * @property {string} [invitation_code]
 * @property {string} [inviter_code]
 * @property {string} [verify_code_url]
 * @property {string} mac_addr
 * @property {string} domain
 * @property {string} ab_code
 * @property {string} geo_key
 * @property {number} privilege
 * @property {string} phone
 * @property {string} phone_code
 * @property {{ public_key: string } | null} server_secret_info
 * @property {Array<{ param_type: number, param_value: string }> | null} params
 * @property {Array<TrustDevice> | null} trust_list
 * @property {number} token_id
 * @property {{ step: number, info: string }} fa_info
 * @property {string} country_code
 */

/**
 * @typedef {Object} DeviceData
 * @property {string} device_sn
 * @property {string} product_code
 * @property {string} bt_ble_id
 * @property {string} bt_ble_mac
 * @property {string} device_name
 * @property {string} alias_name
 * @property {string} img_url
 * @property {number} link_time
 * @property {boolean} wifi_online
 * @property {string} wifi_name
 * @property {string[]} relate_type
 * @property {boolean} charge
 * @property {number} bws_surplus
 * @property {string} device_sw_version
 */

/**
 * @typedef {Object} DeviceDataResponse
 * @property {DeviceData[]} data
 */

/**
 * @typedef {Object} UserMqttInfo
 * @property {string} user_id
 * @property {string} app_name
 * @property {string} thing_name
 * @property {string} certificate_id
 * @property {string} certificate_pem
 * @property {string} private_key
 * @property {string} public_key
 * @property {string} endpoint_addr
 * @property {string} aws_root_ca1_pem
 * @property {string} origin
 * @property {string} pkcs12
 */

/**
 * @typedef {Object} Site
 * @property {string} site_id
 * @property {string} site_name
 * @property {string} site_img
 * @property {number[]} device_type_list
 */

/**
 * @typedef {Object} SiteHomepageResponse
 * @property {Site[]} site_list
 * @property {any[]} solar_list
 * @property {any[]} pps_list
 * @property {Solarbank[]} solarbank_list
 */

/**
 * @typedef {Object} SiteListResponse
 * @property {Site[]} site_list
 */

/**
 * @typedef {Object} Solarbank
 * @property {string} device_pn
 * @property {string} device_sn
 * @property {string} device_name
 * @property {string} device_img
 * @property {`${number}`} battery_power
 * @property {string} bind_site_status
 * @property {`${number}`} charging_power
 * @property {string} power_unit
 * @property {`${number}`} charging_status
 * @property {`${number}`} status
 * @property {`${number}`} wireless_type
 * @property {`${number}`} main_version
 * @property {`${number}`} photovoltaic_power
 * @property {`${number}`} output_power
 */

/**
 * @typedef {Object} ScenInfo
 * @property {{ home_name: string, home_img: string, charging_power: `${number}`, power_unit: string }} home_info
 * @property {any[]} solar_list
 * @property {{ pps_list: any[], total_charging_power: `${number}`, power_unit: string, total_battery_power: `${number}`, updated_time: string, pps_status: number }} pps_info
 * @property {Array<{ type: `${number}`, total: `${number}`, unit: string }>} statistics
 * @property {`${number}`} topology_type
 * @property {{ solarbank_list: Solarbank[], total_charging_power: `${number}`, power_unit: string, charging_status: `${number}`, total_battery_power: `${number}`, updated_time: string, total_photovoltaic_power: `${number}`, total_output_power: `${number}` }} solarbank_info
 * @property {string} retain_load
 * @property {string} updated_time
 * @property {number} power_site_type
 */

/**
 * @typedef {Object} EnergyAnalysis
 * @property {Array<{ time: `${number}:${number}`, value: `${number}` }>} power
 * @property {null} charge_trend
 * @property {any[]} charge_level
 * @property {string} power_unit
 * @property {`${number}`} charge_total
 * @property {string} charge_unit
 * @property {`${number}`} discharge_total
 * @property {string} discharge_unit
 * @property {`${number}`} charging_pre
 * @property {`${number}`} electricity_pre
 * @property {`${number}`} others_pre
 * @property {Array<{ type: `${number}`, total: `${number}`, unit: string }>} statistics
 */

/**
 * @typedef {Object} LoadData
 * @property {string} time
 * @property {number} load
 */

/**
 * @typedef {Object} HomeLoadChartResponse
 * @property {LoadData[]} data
 */

/**
 * @typedef {Object} SolarInfo
 * @property {string} brand_id
 * @property {string} solar_brand
 * @property {string} solar_model
 * @property {string} solar_sn
 * @property {string} solar_model_name
 */

/**
 * @typedef {Object} CompatibleProcess
 * @property {number} ota_complete_status
 * @property {number} process_skip_type
 * @property {SolarInfo} solar_info
 */

/**
 * @typedef {Object} CutoffData
 * @property {number} id
 * @property {number} is_selected
 * @property {number} output_cutoff_data
 * @property {number} lowpower_input_data
 * @property {number} input_cutoff_data
 */

/**
 * @typedef {Object} Cutoff
 * @property {CutoffData[]} power_cutoff_data
 */

/**
 * @typedef {Object} SitePrice
 * @property {string} site_id
 * @property {number} price
 * @property {number} site_co2
 * @property {string} site_price_unit
 */


/**
 * @typedef {Object} DeviceFitting
 * @property {string} device_sn
 * @property {string} product_code
 * @property {string} device_name
 * @property {string} alias_name
 * @property {string} img_url
 * @property {string} bt_ble_id
 * @property {string} bt_ble_mac
 * @property {number} link_time
 */
/**
 * @typedef {Object} DeviceFittings
 * @property {DeviceFitting[]} data
 */

/**
 * @typedef {Object} OtaInfo
 * @property {number} ota_status
 * @property {string} current_verion
 * @property {number} timestamp
 * @property {number} version_type
 */

/**
 * @typedef {Object} OtaUpdate
 * @property {boolean} is_ota_update
 * @property {boolean} need_retry
 * @property {number} retry_interval
 * @property {any} device_list
 */

/**
 * @typedef {Object} TrustDevice
 * @property {string} open_udid
 * @property {string} phone_model
 * @property {number} is_current_device
 */

/**
 * @typedef {Object} ApplianceLoad
 * @property {number} id
 * @property {string} name
 * @property {number} power
 * @property {number} number
 */

/**
 * @typedef {Object} Range
 * @property {number} id
 * @property {string} start_time
 * @property {string} end_time
 * @property {boolean} turn_on
 * @property {ApplianceLoad[]} appliance_loads
 */

/**
 * @typedef {Object} LoadConfiguration
 * @property {Range[]} ranges
 * @property {number} min_load
 * @property {number} max_load
 * @property {number} step
 */

/**
 * @typedef {Function} AuthenticatedFetch
 * @description A function that performs an authenticated fetch request.
 * @template T
 * @param {string} endpoint - The API endpoint to send the request to.
 * @param {Object} [data={}] - Optional data object containing key-value pairs to include in the request.
 * @returns {Promise<ResultResponse<T>>} A promise that resolves with the API response data.
 */

/**
 * @enum {string}
 */
const ParamType = {
    LoadConfiguration: "4",
};

/**
 * @typedef {Object} SiteDeviceParamResponse
 * @property {LoadConfiguration} param_data
 */

class SolixApi {
    SERVER_PUBLIC_KEY = "04c5c00c4f8d1197cc7c3167c52bf7acb054d722f0ef08dcd7e0883236e0d72a3868d9750cb47fa4619248f3d83f0f662671dadc6e2d31c2f41db0161651c7c076";

    /**
     * @param {Options} options
     */
    constructor({username, password, country, logger}) {
        this.username = username;
        this.password = password;
        this.logger = logger || console;
        this.country = country.toUpperCase();
        this.timezone = this.getTimezoneGMTString();
        this.ecdh = createECDH("prime256v1");
        this.ecdh.generateKeys();
    }

    /**
     * @param {string} s
     * @returns {string}
     */
    md5(s) {
        return createHash("md5").update(Buffer.from(s)).digest("hex");
    }

    /**
     * @returns {string}
     */
    getTimezoneGMTString() {
        const tzo = -new Date().getTimezoneOffset();
        const dif = tzo >= 0 ? "+" : "-";
        return `GMT${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`;
    }

    /**
     * @param {string} data
     * @param {Buffer} key
     * @returns {string}
     */
    encryptAPIData(data, key) {
        const cipher = createCipheriv("aes-256-cbc", key, key.slice(0, 16));
        return cipher.update(data, "utf8", "base64") + cipher.final("base64");
    }

    /**
     * @template T
     * @param {string} endpoint
     * @param {Object} data
     * @param {Object} [headers]
     * @returns {Promise<T>}
     */
    async fetch(endpoint, data, headers = {}) {
        this.logger?.debug?.('fetch', endpoint, JSON.stringify(data));
        const url = new URL(endpoint, "https://ankerpower-api-eu.anker.com").href;

        const response = await fetch(url, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
            headers: {
                "Content-Type": "application/json",
                Country: this.country,
                Timezone: this.timezone,
                "Model-Type": "DESKTOP",
                "App-Name": "anker_power",
                "Os-Type": "android",
                ...headers,
            },
        });

        if (response.status < 200 || response.status >= 400) {
            throw new HttpError(response.status, url, await response.text());
        }

        return response.json();
    }

    /**
     * @param {LoginResultResponse} login
     * @returns {Object}
     */
    withLogin(login) {
        const headers = {"X-Auth-Token": login.auth_token, gtoken: this.md5(login.user_id)};

        /** @type AuthenticatedFetch */
        const authFetch = (endpoint, data = {}) =>
            this.fetch(endpoint, data, headers);


        const app = new SolixAppApi(authFetch);
        const powerServices = new SolixPowerServicesApi(authFetch);
        const chargingPvSvc = new SolixChargingPvSvcApi(authFetch);

        return {
            powerServices,
            app,
            chargingPvSvc,
            /**
             * @deprecated use powerServices.getRelateAndBindDevices
             * @returns {Promise<ResultResponse<DeviceDataResponse>>}
             */
            getRelateAndBindDevices: () => powerServices.getRelateAndBindDevices(),
            /**
             * @deprecated use powerServices.getUserDevices
             * @returns {Promise<ResultResponse<UserMqttInfo>>}
             */
            getUserMqttInfo: () => app.getUserMqttInfo(),
            /**
             * @deprecated use powerServices.siteHomepage
             * @returns {Promise<ResultResponse<SiteHomepageResponse>>}
             */
            siteHomepage: () => powerServices.siteHomepage(),
            /**
             * @deprecated use powerServices.getSiteList
             * @returns {Promise<ResultResponse<SiteListResponse>>}
             */
            getSiteList: () => powerServices.getSiteList(),
            /**
             * @deprecated use powerServices.getSiteDetail
             * @param {{ siteId: string, deviceSn?: string }} params
             * @returns {Promise<ResultResponse<HomeLoadChartResponse>>}
             */
            getHomeLoadChart: ({siteId, ...params}) => powerServices.getHomeLoadChart(siteId, params),
            /**
             * @deprecated use powerServices.scenInfo
             * @param {string} siteId
             * @returns {Promise<ResultResponse<ScenInfo>>}
             */
            scenInfo: (siteId) => powerServices.scenInfo(siteId),
            /**
             * @deprecated use powerServices.energyAnalysis
             * @param {{ siteId: string, deviceSn: string, type: string, startTime?: Date, endTime?: Date, deviceType?: string }} params
             * @returns {Promise<ResultResponse<EnergyAnalysis>>}
             */
            energyAnalysis: ({
                                 siteId,
                                 ...params
                             }) => powerServices.energyAnalysis(siteId, params),
            /**
             * @param {{ paramType: ParamType | string, siteId: string }} params
             * @returns {Promise<ResultResponse<SiteDeviceParamResponse>>}
             */
            getSiteDeviceParam: async ({siteId, ...params}) => powerServices.getSiteDeviceParam(siteId, params),
            /**
             * @deprecated use powerServices.setSiteDeviceParam
             * @param {{ paramType: ParamType | string, siteId: string, cmd?: number, paramData: any }} params
             * @returns {Promise<ResultResponse<any>>}
             */
            setSiteDeviceParam: ({siteId, ...params}) => powerServices.setSiteDeviceParam(siteId, params),
            statisticsPv: ({siteId, ...params}) => chargingPvSvc.statisticsPv(),
            getPvTotalStatistics: ({siteId, ...params}) => chargingPvSvc.getPvTotalStatistics(),
        };
    }

    /**
     * @returns {Promise<LoginResultResponse>}
     */
    async login() {
        const data = /** @type {LoginRequest} */ ({
            ab: this.country,
            client_secret_info: {
                public_key: this.ecdh.getPublicKey("hex"),
            },
            enc: 0,
            email: this.username,
            password: this.encryptAPIData(this.password, this.ecdh.computeSecret(Buffer.from(this.SERVER_PUBLIC_KEY, "hex"))),
            time_zone: new Date().getTimezoneOffset() !== 0 ? -new Date().getTimezoneOffset() * 60 * 1000 : 0,
            transaction: `${new Date().getTime()}`,
        });

        return this.fetch("/passport/login", data);
    }
}

class SolixAppApi {
    /** @type {AuthenticatedFetch} */
    #authFetch;

    /**
     * @param {AuthenticatedFetch} authFetch
     */
    constructor(authFetch) {
        this.#authFetch = authFetch
    }

    /**
     * @returns {Promise<ResultResponse<UserMqttInfo>>}
     */
    getUserMqttInfo() {
        return this.#authFetch("app/devicemanage/get_user_mqtt_info")
    }
}

class SolixPowerServicesApi {
    /** @type {AuthenticatedFetch} */
    #authFetch;

    /**
     * @param {AuthenticatedFetch} authFetch
     */
    constructor(authFetch) {
        this.#authFetch = authFetch
    }


    /**
     * @returns {Promise<ResultResponse<DeviceDataResponse>>}
     */
    getRelateAndBindDevices() {
        return this.#authFetch("/power_service/v1/app/get_relate_and_bind_devices");
    }

    getUserDevices() {
        return this.#authFetch("/power_service/v1/site/list_user_devices");
    }

    getChargingDevices() {
        return this.#authFetch("/power_service/v1/site/get_charging_device");
    }

    getAutoUpgrade() {
        return this.#authFetch("/power_service/v1/app/get_auto_upgrade");
    }

    setAutoUpgrade(params) {
        return this.#authFetch("/power_service/v1/app/set_auto_upgrade", params);
    }

    getDeviceLoad() {
        return this.#authFetch("/power_service/v1/app/device/get_device_home_load");
    }

    setDeviceLoad(params) {
        return this.#authFetch("/power_service/v1/app/device/set_device_home_load", params);
    }

    getOtaBatch(deviceSnList) {
        return this.#authFetch("app/ota/batch/check_update", {device_list: deviceSnList});
    }

    /**
     * Get the solar ota info that is configured for a solarbank
     *
     * @param {string} solarbankSn
     * @return {Promise<ResultResponse<OtaInfo>>}
     */
    getOtaInfo(solarbankSn) {
        return this.#authFetch("/power_service/v1/app/compatible/get_ota_info", {
            solar_bank_sn: solarbankSn,
            solar_sn: ""
        });
    }

    /**
     * Get the solar ota update info that is configured for a solarbank
     *
     * @param {string} solarbankSn
     * @return {Promise<ResultResponse<OtaUpdate>>}
     */
    getOtaUpdate(solarbankSn) {
        return this.#authFetch("/power_service/v1/app/compatible/get_ota_update", {
            device_sn: solarbankSn,
            insert_sn: ""
        });
    }

    /**
     * Get the solar info that is configured for a solarbank
     *
     * @param {string} solarbankSn
     * @return {Promise<ResultResponse<SolarInfo>>}
     */
    solarInfo(solarbankSn) {
        return this.#authFetch("/power_service/v1/app/compatible/get_compatible_solar_info", {solarbank_sn: solarbankSn});
    }

    /**
     * Get the solar info and OTA processing info for a solarbank.
     *
     * @param {string} siteId
     * @param {string} deviceSn
     * @return {Promise<ResultResponse<Cutoff>>}
     */
    getCutoff(siteId, deviceSn) {
        return this.#authFetch("/power_service/v1/app/compatible/get_power_cutoff", {
            site_id: siteId,
            device_sn: deviceSn
        });
    }

    setCutoff(params) {
        return this.#authFetch("/power_service/v1/app/compatible/set_power_cutoff", params);
    }

    /**
     * Get the solar info and OTA processing info for a solarbank.
     *
     * @param {string} solarbankSn
     * @return {Promise<ResultResponse<CompatibleProcess>>}
     */
    compatibleProcess(solarbankSn) {
        return this.#authFetch("/power_service/v1/app/compatible/get_compatible_process", {solarbank_sn: solarbankSn});
    }

    /**
     * @param {string} siteId
     * @param {string} deviceSn
     * @return {Promise<ResultResponse<T>>}
     */
    getDeviceFittings(siteId, deviceSn) {
        return this.#authFetch("/power_service/v1/app/get_relate_device_fittings", {
            site_id: siteId,
            device_sn: deviceSn
        });
    }

    getUpgradeRecord() {
        return this.#authFetch("/power_service/v1/app/get_upgrade_record");
    }

    checkUpgradeRecord(params) {
        return this.#authFetch("/power_service/v1/app/check_upgrade_record", params);
    }

    getMessageUnread() {
        return this.#authFetch("/power_service/v1/get_message_unread");
    }

    getMessage(params) {
        return this.#authFetch("/power_service/v1/get_message", params);
    }

    getProductCategories() {
        return this.#authFetch("/power_service/v1/product_categories");
    }

    getProductAccessories() {
        return this.#authFetch("/power_service/v1/product_accessories");
    }

    getDeviceAttributes() {
        return this.#authFetch("/power_service/v1/app/device/get_device_attrs");
    }

    getConfig() {
        return this.#authFetch("/power_service/v1/app/get_config");
    }

    getInstallation() {
        return this.#authFetch("/power_service/v1/app/compatible/get_installation");
    }

    setInstallation(params) {
        return this.#authFetch("/power_service/v1/app/compatible/set_installation", params);
    }

    getThirdPlatforms() {
        return this.#authFetch("/power_service/v1/app/third/platform/list");
    }

    getTokenByUserId(userId) {
        return this.#authFetch("/power_service/v1/app/get_token_by_userid", {user_id: userId});
    }

    getShellyStatus(params) {
        return this.#authFetch("/power_service/v1/app/get_user_op_shelly_status", params);
    }

    /**
     * @returns {Promise<ResultResponse<SiteHomepageResponse>>}
     */
    siteHomepage() {
        return this.#authFetch("/power_service/v1/site/get_site_homepage");
    }

    getWifiInfoList(siteId) {
        return this.#authFetch("/power_service/v1/site/get_wifi_info_list", {site_id: siteId});
    }

    /**
     * @param {string} siteId
     * @return {Promise<ResultResponse<SitePrice>>}
     */
    getSitePrice(siteId) {
        return this.#authFetch("/power_service/v1/site/get_site_price", {site_id: siteId});
    }

    updateSitePrice(siteId, params) {
        return this.#authFetch("/power_service/v1/site/update_site_price", {
            ...params,
            site_id: siteId
        });
    }

    /**
     * @returns {Promise<ResultResponse<SiteListResponse>>}
     */
    getSiteList() {
        return this.#authFetch("/power_service/v1/site/get_site_list");
    }

    getSiteDetail(siteId) {
        return this.#authFetch("/power_service/v1/site/get_site_detail", {site_id: siteId});
    }

    getSiteRules(siteId) {
        return this.#authFetch("/power_service/v1/site/get_site_rules", {site_id: siteId});
    }

    /**
     * @param {string} siteId
     * @param {{ deviceSn?: string }} [params]
     * @returns {Promise<ResultResponse<HomeLoadChartResponse>>}
     */
    getHomeLoadChart(siteId, {deviceSn} = {}) {
        return this.#authFetch("/power_service/v1/site/get_home_load_chart", {
            site_id: siteId,
            device_sn: deviceSn
        });
    }

    /**
     * @param {string} siteId
     * @returns {Promise<ResultResponse<ScenInfo>>}
     */
    scenInfo(siteId) {
        return this.#authFetch("/power_service/v1/site/get_scen_info", {site_id: siteId});
    }

    /**
     * @param {string} siteId
     * @param {{ deviceSn: string, type: string, startTime: Date|string, endTime?: Date|string, deviceType?: string }} params
     * @returns {Promise<ResultResponse<EnergyAnalysis>>}
     */
    energyAnalysis(siteId, {
        deviceSn,
        type,
        startTime,
        endTime,
        deviceType = "solar_production"
    } = {}) {
        const startDate = normalizeDate(startTime);
        const endDate = normalizeDate(endTime);
        const startTimeString = startDate ? `${startDate.getUTCFullYear()}-${pad(startDate.getUTCMonth() + 1)}-${pad(startDate.getUTCDate())}` : "";
        const endTimeString = endDate ? `${endDate.getUTCFullYear()}-${pad(endDate.getUTCMonth() + 1)}-${pad(endDate.getUTCDate())}` : "";
        const data = {
            site_id: siteId,
            device_sn: deviceSn,
            type,
            start_time: startTimeString,
            device_type: deviceType,
            end_time: endTimeString,
        };
        return this.#authFetch("/power_service/v1/site/energy_analysis", data);
    }

    /**
     * @param {string} siteId
     * @param {{ paramType: ParamType | string }} params
     * @returns {Promise<ResultResponse<SiteDeviceParamResponse>>}
     */
    async getSiteDeviceParam(siteId, {paramType}) {
        const data = {site_id: siteId, param_type: paramType};
        const response = await this.#authFetch("/power_service/v1/site/get_site_device_param", data);
        if (response.data) {
            switch (paramType) {
                case ParamType.LoadConfiguration:
                    return {...response, data: {param_data: JSON.parse(response?.data?.param_data)}};
                default:
                    return response;
            }
        }
        return response;
    }

    /**
     * @param {string} siteId
     * @param {{ paramType: ParamType | string, cmd?: number, paramData: any }} params
     * @returns {Promise<ResultResponse<any>>}
     */
    setSiteDeviceParam(siteId, {paramType, cmd = 17, paramData}) {
        let data = {site_id: siteId, param_type: paramType, cmd, param_data: paramData};
        if (paramType === ParamType.LoadConfiguration) {
            data = {...data, param_data: JSON.stringify(paramData)};
        }
        return this.#authFetch("/power_service/v1/site/set_site_device_param", data);
    }
}

class SolixChargingPvSvcApi {
    /** @type {AuthenticatedFetch} */
    #authFetch;

    /**
     * @param {AuthenticatedFetch} authFetch
     */
    constructor(authFetch) {
        this.#authFetch = authFetch
    }


    /**
     @param {string} deviceSn
     * @returns {Promise<ResultResponse<any>>}
     */
    statisticsPv(deviceSn) {
        return this.#authFetch("/charging_pv_svc/statisticsPv", {
            sn: deviceSn,
            type: 'day',
            start: '2025-12-10'
        });
    }

    /**
     @param {string} deviceSn
     * @returns {Promise<ResultResponse<any>>}
     */
    getPvTotalStatistics(deviceSn) {
        return this.#authFetch("/charging_pv_svc/getPvTotalStatistics", {
            sn: deviceSn,
        });
    }

}

SolixApi.App = SolixAppApi;
SolixApi.PowerServices = SolixPowerServicesApi;
SolixApi.ChargingPvSvc = SolixChargingPvSvcApi;

module.exports = SolixApi;
