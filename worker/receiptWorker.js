module.exports = (DtoSerializer, Worker) => {

  return class ReceiptWorker extends Worker {
    constructor(options) {
      const _file = 'receipts.dump';
      const _timerName = 'receipt_timer';
      super(options, _file, _timerName);

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