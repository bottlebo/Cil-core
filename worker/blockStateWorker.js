module.exports = (Worker) => {

  return class BlockStateWorker extends Worker {
    constructor(options) {
      super(options, 'blockstate');

      this.options = {
        ...options
      };
    }
    async dump(hash, state) {
      const data = {hash, state};
      await this._dumpObj(data);
    }
  }
}