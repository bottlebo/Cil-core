module.exports = (Worker) => {

  return class RemoveBlockWorker extends Worker {
    constructor(options) {
      super(options, 'removeblock');

      this.options = {
        ...options
      };
    }
    async dump(hash) {
      //...
      const data = {hash};
      await this._dump(data);
    }
  }
}