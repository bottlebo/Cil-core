module.exports = (DtoSerializer, Worker) => {

  return class BlockWorker extends Worker {
    constructor(options) {
      super(options);

      this.options = {
        ...options
      };
      this.path = 'blocks.dump'
    }
    async dump(block, blockInfo) {
      //...
      const data = DtoSerializer.toBlockDto(block, blockInfo);
      await this._dump(data);
    }
  }
}