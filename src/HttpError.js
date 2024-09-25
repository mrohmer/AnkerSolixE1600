class HttpError extends Error {
  /** @type {number} */
  statusCode;
  /** @type {string} */
  url;

  /** @type {boolean} */
  get isAuthError() {
    return [401, 403].includes(this.statusCode);
  }

  /**
   * @param {number} statusCode
   * @param {string} url
   * @param {string} message
   */
  constructor(statusCode, url, message) {
    super(message);
    this.statusCode = statusCode;
    this.url = url;
  }
}


module.exports = HttpError;
