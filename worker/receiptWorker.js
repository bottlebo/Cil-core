module.exports = (DtoSerializer, Worker, Block, Transaction) => {

  return class ReceiptWorker extends Worker {
    constructor(options) {
      super(options, 'receipts');

      this.options = {
        ...options
      };
    }

    async dump(arrReceipts) {
      let data = arrReceipts.map(obj => DtoSerializer.toReceiptDto(obj));
      data = data.filter(r => r);
      if (data.length) {
        for (let record of data) {
          if (record.status) record.AddrTxSigner = await this._getContractSignerForTx(record.from);
        }
        await this._dumpObjectArray(data);
      }
    }

    async _getContractSignerForTx(txHash) {
      const block = await this.options.storage.findBlockByTxHash(txHash);
      if(block) {
        const objFoundTx = block.txns.find(objTx => (new Transaction(objTx)).getHash() === txHash);
        return objFoundTx ? (new Transaction(objFoundTx)).getTxSignerAddress() : undefined;
      } else {
        return undefined;
      }
    }
  };
};