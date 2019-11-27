module.exports = (DtoSerializer, Worker) => {

  return class BlockStateWorker extends Worker {
    constructor(options) {
      super(options, 'blockstate');

      this.options = {
        ...options
      };
    }
    async dump(hash, state) {
      //...
      const data = JSON.stringify({hash, state});
      await this._dump(data);
    }
  }
}