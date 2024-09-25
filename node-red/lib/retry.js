/**
 * @typedef {(function(e: Error): void)} RetryFn
 */

/**
 * @typedef {Object} Config
 * @property {number|undefined} retries defaults to 2
 * @property {number|undefined} delayMs defaults to 100
 * @property {RetryFn|undefined} onRetry
 */

/**
 * @template T
 * @param {Config|undefined} config
 * @return {function(function(): Promise<T>, RetryFn?): Promise<T>}
 */
const retry = (config = undefined) => async (fn, onRetry = undefined) => {
  const { retries = 2, delayMs = 100 } = config ?? {};
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) {
        throw e;
      }
      onRetry?.(e);
      config?.onRetry?.(e);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = retry;
