module.exports = (DtoSerializer, Worker) => {

  return class BlockWorker extends Worker {
    constructor(options) {
      const _file = 'blocks.dump';
      const _timerName = 'block_timer';
      super(options, _file, _timerName);

      this.options = {
        ...options
      };
    }
    async dump(block, blockInfo) {
      //...
      const data = DtoSerializer.toBlockDto(block, blockInfo);
      await this._dump(data);
    }
  }
}