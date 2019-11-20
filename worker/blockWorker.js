module.exports = (Converter, Worker) => {

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
      const data = Converter.toBlockDto(block, blockInfo);
      await this._dump(data);
    }
  }
}