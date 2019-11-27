module.exports = (DtoSerializer, Worker) => {

  return class ReceiptWorker extends Worker {
    constructor(options) {
      super(options, 'receipts');

      this.options = {
        ...options
      };
    }
    async dump(arrReceipts) {
      //...
      let data = arrReceipts.map(obj => DtoSerializer.toReceiptDto(obj));
      data = data.filter(r => r);
      if (data.length) {
        await this._dumpArray(data);
      }
    }
  }
}