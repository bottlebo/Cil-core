module.exports = (DtoSerializer, Worker) => {

  return class UtxoWorker extends Worker {
    constructor(options) {
      super(options, 'utxos');

      this.options = {
        ...options
      };
    }
    async dump(arrUtxos) {
      const data = arrUtxos.map(utxo => DtoSerializer.toUtxoDto(utxo));
      await this._dumpObjectArray(data);
    }
  }
}