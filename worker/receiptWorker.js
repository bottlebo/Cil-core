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
          console.log('dumping receipt');
          console.dir(record, {colors: true, depth: null});
          if (record.status) record.AddrTxSigner = await this._getContractSignerForTx(record.from);
        }
        await this._dumpObjectArray(data);
      }
    }

    async _getContractSignerForTx(txHash) {
      console.log(`Searching for signer by "${txHash}"`);
      const block = this.options.storage.findBlockByTxHash(txHash);
      if(block) console.log(`Found block: "${block.getHash()}"`);
      else {
        console.log('Block NOT FOUND!');
      }
      const objFoundTx = block.txns.find(objTx => (new Transaction(objTx)).getTxHash() === txHash);
      console.log(`Tx found: ${objFoundTx}`);
      return objFoundTx ? new Transaction(objFoundTx) : undefined;
    }
  };
};