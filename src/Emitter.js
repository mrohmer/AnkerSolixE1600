const EventEmitter = require('events');

class Emitter extends EventEmitter {
  /** @type {string[]} */
  #eventNames;

  /** @type {Map<string|symbol, ((...args: any[]) => void)[]>} */
  #listeners = new Map();
  /** @type {number|undefined} */
  #maxListeners = undefined;

  /** @type {console|Object} */
  #logger;

  /**
   * @param {string[]} eventNames
   * @param {console|Object|undefined} logger
   */
  constructor(eventNames, logger) {
    super();
    this.#eventNames = eventNames;
    this.#logger = logger ?? console;
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  addListener(eventName, listener) {
    const listeners = this.#listeners.get(eventName) ?? [];
    this.#listeners.set(eventName, [
      ...listeners,
      listener,
    ]);
    return this;
  }

  /**
   * @param {string} eventName
   * @param {...any[]} args
   * @return {boolean}
   */
  emit(eventName, ...args) {
    const listeners = this.listeners(eventName);

    listeners?.forEach(listener => {
      try {
        listener(...args);
      } catch (e) {
        this.#logger?.error?.(e);
      }
    });

    return listeners?.length > 0;
  }

  /**
   * @return {string[]}
   */
  eventNames() {
    return this.#eventNames ?? []
  }

  /**
   * @return {number}
   */
  getMaxListeners() {
    return this.#maxListeners ?? Emitter.defaultMaxListeners ?? Infinity;
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {number}
   */
  listenerCount(eventName, listener) {
    if (listener) {
      return this.listeners(eventName)?.reduce((count, l) => count + +(l === listener || l.original === listener), 0) ?? 0;
    }
    return this.listeners(eventName)?.length ?? 0;
  }

  /**
   * @param {string} eventName
   * @return {(function(...[*]): void)[]|*[]}
   */
  listeners(eventName) {
    return this.#listeners.get(eventName) ?? [];
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  on(eventName, listener) {
    return this.addListener(eventName, listener);
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  once(eventName, listener) {
    const wrapped = (...args) => {
      try {
        listener(...args);
      } finally {
        this.removeListener(eventName, wrapped);
      }
    }
    return this.addListener(eventName, wrapped);
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  prependListener(eventName, listener) {
    const listeners = this.#listeners.get(eventName) ?? [];
    this.#listeners.set(eventName, [
      listener,
      ...listeners,
    ]);
    return this;
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  prependOnceListener(eventName, listener) {
    const wrapped = (...args) => {
      try {
        listener(...args);
      } finally {
        this.removeListener(eventName, wrapped);
      }
    }
    wrapped.original = listener;
    return this.prependListener(eventName, wrapped);
  }

  /**
   * @param {string} eventName
   * @return {(function(...[*]): void)[]|*[]}
   */
  rawListeners(eventName) {
    return this.listeners(eventName);
  }

  /**
   * @param {string} eventName
   * @return {Emitter}
   */
  removeAllListeners(eventName) {
    this.#listeners.delete(eventName);
    return this;
  }

  /**
   * @param {string} eventName
   * @param listener
   * @return {Emitter}
   */
  removeListener(eventName, listener) {
    const listeners = this.#listeners.get(eventName) ?? [];
    if (!listeners.length) {
      return this;
    }

    const newListeners = listeners.filter(l => l !== listener && l.original !== listener);

    if (!newListeners.length) {
      this.#listeners.delete(eventName);
    } else {
      this.#listeners.set(eventName, newListeners);
    }

    return this;
  }

  /**
   * @param {number} n
   * @return {Emitter}
   */
  setMaxListeners(n) {
    this.#maxListeners = n;
    return this;
  }
}

module.exports = Emitter;
