module.exports = (Worker) => {

  return class DeleteUtxoWorker extends Worker {
    constructor(options) {
      super(options, 'deleteutxo');

      this.options = {
        ...options
      };
    }
    async dump(arrHash) {
      //...
      const data = arrHash.map(hash => ({hash}));
      await this._dumpArray(data);
    }
  }
}