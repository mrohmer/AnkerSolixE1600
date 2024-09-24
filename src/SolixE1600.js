const SolixApi = require("./SolixAPI.js");
const Emitter = require('./Emitter');
const HttpError = require("./HttpError");

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
    super(['couldNotGetCredentials', 'authFailed', 'initialized'], config?.logger);
    if (!config?.country) {
      config.country = 'DE';
    }
    if (!config?.username) {
      throw new Error("No username provided");
    }
    if (!config?.password) {
      throw new Error("No password provided");
    }
    this.config = config;
    this.api = new SolixApi(config);
  }

  async #getLoginCredentials() {
    if (
      this.config.loginCredentials &&
      this.config.loginCredentials?.token_expires_at &&
      this.config.loginCredentials.token_expires_at > (+new Date() / 1000)
    ) {
      return {token: this.config.loginCredentials, fetched: false};
    }

    this.config.loginCredentials = undefined;

    const loginResponse = await this.api.login();
    this.config.logger?.debug?.('LoginResponse', loginResponse);
    if (loginResponse.code === 100053) {
      this.emit('couldNotGetCredentials', loginResponse);
      throw new Error(loginResponse.msg);
    }

    if (!loginResponse.data) {
      this.emit('couldNotGetCredentials', loginResponse);
      throw new Error('Unable to retrieve auth_token during API login');
    }

    return {token: loginResponse.data, fetched: true};
  }

  #getApiSession() {
    if (this.apiSession) {
      return {session: this.apiSession, fetched: false}
    }

    try {
      return {session: this.api.withLogin(this.config.loginCredentials), fetched: true};
    } catch (e) {
      this.clearCredentials();
      this.emit('authFailed', e);
      this.config.logger?.error?.('authFailed', loginResponse);
      throw new Error("Login failed");
    }
  }

  /**
   * Initializes the instance
   *
   * @return {Promise<void>}
   */
  async init() {
    const {token, fetched: tokenFetched} = await this.#getLoginCredentials();
    this.config.loginCredentials = token;
    const {session, fetched: sessionFetched} = this.#getApiSession();
    this.apiSession = session;

    if (tokenFetched || sessionFetched) {
      this.emit('initialized', this.getSessionConfiguration());
    }
  }

  /**
   * Retrieves the site ID for a given site.
   *
   * @param {string|number} siteId - The site ID or name.
   * @return {Promise<string>} The site ID.
   */
  async #getSiteId(siteId) {
    const sites = await this.#internalGetSites();
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

  clearCredentials() {
    this.config.loginCredentials = undefined;
    this.apiSession = undefined;
  }

  async #internalGetSites() {
    const sites = await this.apiSession.getSiteList();
    return sites.data?.site_list;
  }

  /**
   * Retrieves the list of sites.
   *
   * @return {Promise<Site[]>} The list of sites.
   */
  getSites() {
    return this.#wrap(async () => {
      await this.init();
      return this.#internalGetSites();
    });
  }

  /**
   * Retrieves the schedule for the specified site.
   * sample: `{"ranges":[{"id":0,"start_time":"00:00","end_time":"01:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]},{"id":0,"start_time":"01:00","end_time":"02:00","turn_on":true,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":350,"number":1}]},{"id":0,"start_time":"02:00","end_time":"24:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]}],"min_load":150,"max_load":800,"step":50}`
   *
   * @param {string} siteId - The site identifier or site index. If not provided, the first site is used.
   * @return {Promise<any>} - The schedule data.
   */
  getSchedule(siteId = undefined) {
    return this.#wrap(async () => {
      await this.init();
      const device = {
        siteId: siteId ?? await this.#getSiteId(siteId),
        paramType: "4"
      }

      const deviceParams = await this.apiSession.getSiteDeviceParam(device);
      return deviceParams?.data?.param_data;
    })
  }


  /**
   * Retrieves the scen info for the specified site.
   * *
   * @param {string} siteId - The site identifier or site index. If not provided, the first site is used.
   * @return {Promise<ScenInfo>} - The schedule data.
   */
  getScenInfo(siteId = undefined) {
    return this.#wrap(async () => {
      await this.init();
      const deviceParams = await this.apiSession.scenInfo(siteId ?? await this.#getSiteId(siteId));
      return deviceParams.data;
    });
  }

  /**
   * Sets the schedule for a specific site.
   * sample: `{"ranges":[{"id":0,"start_time":"00:00","end_time":"01:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]},{"id":0,"start_time":"01:00","end_time":"02:00","turn_on":true,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":350,"number":1}]},{"id":0,"start_time":"02:00","end_time":"24:00","turn_on":false,"appliance_loads":[{"id":0,"name":"Benutzerdefiniert","power":200,"number":1}]}],"min_load":150,"max_load":800,"step":50}`
   *
   * @param {Object} schedule - The schedule to set.
   * @param {string} siteId - The site for which the schedule should be set. If not provided, the first site is used.
   * @return {Promise<any>} - A promise that resolves with the response from setting the schedule.
   */
  setSchedule(schedule, siteId = undefined) {
    return this.#wrap(async () => {
      await this.init();
      const deviceN = {
        siteId: siteId ?? await this.#getSiteId(siteId),
        paramType: "4",
        cmd: 17,
        paramData: schedule
      }
      return this.apiSession.setSiteDeviceParam(deviceN);
    });
  }

  /**
   * @param {string} siteId
   * @return {Promise<HomeLoadChartResponse>}
   */
  getHomeLoadChart(siteId = undefined) {
    return this.#wrap(async () => {
      await this.init();
      const device = {
        siteId: siteId ?? await this.#getSiteId(siteId),
      }
      const result = await this.apiSession.getHomeLoadChart(device);

      return result?.data;
    });
  }

  /**
   * @template T
   * @param {function(): Promise<T>} fn
   * @return {Promise<T>}
   */
  async #wrap(fn) {
    try {
      return await fn();
    } catch (e) {
      console.log(e);
      if (e instanceof HttpError && [401, 403].includes(e.statusCode)) {
        this.clearCredentials();
        this.emit('authFailed', e);
      }
      this.config.logger?.error?.(e);
      throw e;
    }

  }
}

module.exports = SolixE1600;
