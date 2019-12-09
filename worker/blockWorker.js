module.exports = (DtoSerializer, Worker) => {

  return class BlockWorker extends Worker {
    constructor(options) {
      super(options, 'blocks');

      this.options = {
        ...options
      };
    }
    async dump(block, blockInfo) {
      const data = DtoSerializer.toBlockDto(block, blockInfo);
      await this._dumpObj(data);
    }
  }
}