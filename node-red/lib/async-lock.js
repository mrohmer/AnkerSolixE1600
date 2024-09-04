class AsyncLock {
  constructor () {
    this.release = () => {}
    this.promise = Promise.resolve();
  }

  async acquire () {
    if (this.promise) {
      await this.promise;
    }
    this.promise = new Promise(resolve => this.release = resolve)
  }
}

module.exports = AsyncLock;
