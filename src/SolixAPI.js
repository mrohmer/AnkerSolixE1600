const { createCipheriv, createECDH, createHash } = require("crypto");

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
  constructor({ username, password, country, logger }) {
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
    return `GMT${dif}${this.pad(tzo / 60)}:${this.pad(tzo % 60)}`;
  }

  /**
   * @param {number} num
   * @returns {string}
   */
  pad(num) {
    const norm = Math.floor(Math.abs(num));
    return `${norm < 10 ? "0" : ""}${norm}`;
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
   * @param {string} endpoint
   * @param {Object} data
   * @param {Object} [headers]
   * @returns {Promise<Response>}
   */
  async fetch(endpoint, data, headers = {}) {
    this.logger?.debug?.('fetch', endpoint, JSON.stringify(data));
    const url = new URL(endpoint, "https://ankerpower-api-eu.anker.com").href;

    return fetch(url, {
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
  }

  /**
   * @param {LoginResultResponse} login
   * @returns {Object}
   */
  withLogin(login) {
    const headers = { "X-Auth-Token": login.auth_token, gtoken: this.md5(login.user_id) };

    /**
     * @param {string} endpoint
     * @param {Object} data
     * @returns {Promise<ResultResponse<any>>}
     */
    const authFetch = async (endpoint, data= {}) => {
      const response = await this.fetch(endpoint, data, headers);
      return response.json();
    };

    return {
      /**
       * @returns {Promise<ResultResponse<DeviceDataResponse>>}
       */
      getRelateAndBindDevices: async () => authFetch("/power_service/v1/app/get_relate_and_bind_devices", {}),

      /**
       * @returns {Promise<ResultResponse<UserMqttInfo>>}
       */
      getUserMqttInfo: async () => authFetch("/app/devicemanage/get_user_mqtt_info"),

      /**
       * @returns {Promise<ResultResponse<SiteHomepageResponse>>}
       */
      siteHomepage: async () => authFetch("/power_service/v1/site/get_site_homepage", {}),

      /**
       * @returns {Promise<ResultResponse<SiteListResponse>>}
       */
      getSiteList: async () => authFetch("/power_service/v1/site/get_site_list", {}),

      /**
       * @param {{ siteId: string, deviceSn?: string }} params
       * @returns {Promise<ResultResponse<HomeLoadChartResponse>>}
       */
      getHomeLoadChart: async ({ siteId, deviceSn = "" }) => {
        const data = { site_id: siteId, device_sn: deviceSn };
        return authFetch("/power_service/v1/site/get_home_load_chart", data);
      },

      /**
       * @param {string} siteId
       * @returns {Promise<ResultResponse<ScenInfo>>}
       */
      scenInfo: async (siteId) => {
        const data = { site_id: siteId };
        return authFetch("/power_service/v1/site/get_scen_info", data);
      },

      /**
       * @param {{ siteId: string, deviceSn: string, type: string, startTime?: Date, endTime?: Date, deviceType?: string }} params
       * @returns {Promise<ResultResponse<EnergyAnalysis>>}
       */
      energyAnalysis: async ({ siteId, deviceSn, type, startTime = new Date(), endTime, deviceType = "solar_production" }) => {
        const startTimeString = `${startTime.getUTCFullYear()}-${this.pad(startTime.getUTCMonth())}-${this.pad(startTime.getUTCDate())}`;
        const endTimeString = endTime ? `${endTime.getUTCFullYear()}-${this.pad(endTime.getUTCMonth())}-${this.pad(endTime.getUTCDate())}` : "";
        const data = {
          site_id: siteId,
          device_sn: deviceSn,
          type,
          start_time: startTimeString,
          device_type: deviceType,
          end_time: endTimeString,
        };
        return authFetch("/power_service/v1/site/energy_analysis", data);
      },

      /**
       * @param {{ paramType: ParamType | string, siteId: string }} params
       * @returns {Promise<ResultResponse<SiteDeviceParamResponse>>}
       */
      getSiteDeviceParam: async ({ paramType, siteId }) => {
        const data = { site_id: siteId, param_type: paramType };
        const response = await authFetch("/power_service/v1/site/get_site_device_param", data);
        if (response.data) {
          switch (paramType) {
            case ParamType.LoadConfiguration:
              return { ...response, data: { param_data: JSON.parse(response?.data?.param_data) } };
            default:
              return response;
          }
        }
        return response;
      },

      /**
       * @param {{ paramType: ParamType | string, siteId: string, cmd?: number, paramData: any }} params
       * @returns {Promise<ResultResponse<any>>}
       */
      setSiteDeviceParam: async ({ paramType, siteId, cmd = 17, paramData }) => {
        let data = { site_id: siteId, param_type: paramType, cmd, param_data: paramData };
        if (paramType === ParamType.LoadConfiguration) {
          data = { ...data, param_data: JSON.stringify(paramData) };
        }
        return authFetch("/power_service/v1/site/set_site_device_param", data);
      },
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

    const response = await this.fetch("/passport/login", data);
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(`Login failed (${response.status}): ${await response.text()}`);
    }
  }
}

module.exports = SolixApi;
