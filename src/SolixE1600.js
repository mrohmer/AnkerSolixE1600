const SolixApi = require("./SolixAPI.js");
const Emitter = require('./Emitter');

/**
 * The SolixE1600 class.
 * @class
 * @extends Emitter
 */
class SolixE1600 extends Emitter {
  /**
   * Initializes a new instance of the constructor function.
   *
   * @param {Object} config - The configuration object for the constructor.
   * @param {string} config.country - The country code. (optional)
   * @param {string} config.username - The username. (mandatory)
   * @param {string} config.password - The password. (mandatory)
   * @param {Object} config.logger - The logger object. (optional)
   * @param {Object} config.loginCredentials - The login credentials. (optional)
   * @throws {Error} Throws an error if username is not provided.
   * @throws {Error} Throws an error if password is not provided.
   */
  constructor(config) {
    super(['couldNotGetCredentials', 'authFailed']);
    if (!config?.country) {
      config.country = 'DE';
    }
    if (!config?.username && !config.loginCredentials) {
      throw new Error("No username provided");
    }
    if (!config?.password && !config.loginCredentials) {
      throw new Error("No password provided");
    }
    this.config = config;
    this.api = new SolixApi(config);
  }

  async #getLoginCredentials() {
    if (this.config.loginCredentials) {
      return this.config.loginCredentials;
    }

    const loginResponse = await this.api.login();
    console.log('LoginResponse', loginResponse);
    if (loginResponse.code === 100053) {
      this.emit('couldNotGetCredentials', loginResponse);
      throw new Error(loginResponse.msg);
    }

    if (!loginResponse.data) {
      this.emit('couldNotGetCredentials', loginResponse);
      throw new Error('Unable to retrieve auth_token during API login');
    }

    return loginResponse.data;
  }

  #getApiSession() {
    if (this.apiSession) {
      return this.apiSession;
    }

    try {
      return this.api.withLogin(this.config.loginCredentials);
    } catch (e) {
      this.emit('authFailed', e);
      console.error(e);
      delete this.config.loginCredentials;
      throw new Error("Login failed");
    }
  }

  /**
   * Initializes the instance
   *
   * @return {Promise<void>}
   */
  async init() {
    this.config.loginCredentials = await this.#getLoginCredentials();
    this.apiSession = this.#getApiSession();
  }

  /**
   * Retrieves the site ID for a given site.
   *
   * @param {string|number} siteId - The site ID or name.
   * @return {Promise<string>} The site ID.
   */
  async #getSiteId(siteId) {
    await this.init();

    const sites = await this.getSites();
    if (!sites?.length) {
      return undefined;
    }

    if (typeof siteId == 'string') {
      const hasSiteId = sites?.some(s => s.site_id === siteId);

      if (!hasSiteId) {
        throw new Error(`could not find site with id ${siteId}`)
      }

      return siteId;
    }

    return sites[0].site_id;
  }

  /**
   * Retrieves the session configuration.
   *
   * @return {Object} The session configuration.
   */
  getSessionConfiguration() {
    return this.config;
  }

  /**
   * Retrieves the list of sites.
   *
   * @return {Promise<Site[]>} The list of sites.
   */
  async getSites() {
    await this.init();
    const sites = await this.apiSession.getSiteList();
    return sites.data?.site_list;
  }

  /**
   * Retrieves the schedule for the specified site.
   * sample: `{"ranges":[{"id":0,"start_time":"00:00","end_time":"01:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]},{"id":0,"start_time":"01:00","end_time":"02:00","turn_on":true,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":350,"number":1}]},{"id":0,"start_time":"02:00","end_time":"24:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]}],"min_load":150,"max_load":800,"step":50}`
   *
   * @param {string} siteId - The site identifier or site index. If not provided, the first site is used.
   * @return {Promise<any>} - The schedule data.
   */
  async getSchedule(siteId = undefined) {
    await this.init();
    const device = {
      siteId: siteId ?? await this.#getSiteId(siteId),
      paramType: "4"
    }

    const deviceParams = await this.apiSession.getSiteDeviceParam(device);
    return deviceParams.data.param_data;
  }


  /**
   * Retrieves the scen info for the specified site.
   * *
   * @param {string} siteId - The site identifier or site index. If not provided, the first site is used.
   * @return {Promise<ScenInfo>} - The schedule data.
   */
  async getScenInfo(siteId = undefined) {
    await this.init();
    const deviceParams = await this.apiSession.scenInfo(siteId ?? await this.#getSiteId(siteId));
    return deviceParams.data;
  }

  /**
   * Sets the schedule for a specific site.
   * sample: `{"ranges":[{"id":0,"start_time":"00:00","end_time":"01:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]},{"id":0,"start_time":"01:00","end_time":"02:00","turn_on":true,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":350,"number":1}]},{"id":0,"start_time":"02:00","end_time":"24:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]}],"min_load":150,"max_load":800,"step":50}`
   *
   * @param {Object} schedule - The schedule to set.
   * @param {string} siteId - The site for which the schedule should be set. If not provided, the first site is used.
   * @return {Promise<any>} - A promise that resolves with the response from setting the schedule.
   */
  async setSchedule(schedule, siteId = undefined) {
    await this.init();
    const deviceN = {
      siteId: siteId ?? await this.#getSiteId(siteId),
      paramType: "4",
      cmd: 17,
      paramData: schedule
    }
    return this.apiSession.setSiteDeviceParam(deviceN);
  }
}

module.exports = SolixE1600;
