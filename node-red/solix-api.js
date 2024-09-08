module.exports = function (RED) {
  function SolixApiNode(config) {
    const SolixE1600 = require('../src/SolixE1600.js');
    const AsyncLock = require('./lib/async-lock');
    RED.nodes.createNode(this, config);

    this.name = config.name;
    this.username = config.username;
    this.password = config.password;
    this.country = config.country;

    const sessionKey = `solixSessionFor${config.username}`;
    const sessionConfig = this.context().global.get(sessionKey);

    if (
      sessionConfig?.loginCredentials?.token_expires_at
      && sessionConfig.loginCredentials.token_expires_at > (+new Date() / 1000)
      && ['username', 'password', 'country'].every(k => sessionConfig[k] === config[k])
    ) {
      config.loginCredentials = sessionConfig.loginCredentials;
    }

    this.lock = new AsyncLock()
    this.mysolix = new SolixE1600({
      ...config,
      logger: this
    });

    const storeSessionConfig = () => this.context().global.set(sessionKey, this.mysolix.getSessionConfiguration());

    this.init = async () => {
      try {
        await this.lock.acquire();
        await this.mysolix.init()
        storeSessionConfig();
      } catch (e) {
        this.error(e);
        throw e;
      } finally {
        this.lock.release();
      }
    }
  }

  RED.nodes.registerType("SolixApi", SolixApiNode);
}
