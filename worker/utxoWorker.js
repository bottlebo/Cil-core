module.exports = (DtoSerializer, Worker) => {

  return class UtxoWorker extends Worker {
    constructor(options) {
      const _file = 'utxos.dump'
      const _timerName = 'utxo_timer';

      super(options, _file, _timerName);

      this.options = {
        ...options
      };
    }
    async dump(arrUtxos) {
      //...
      const data = arrUtxos.map(utxo => DtoSerializer.toUtxoDto(utxo));
      await this._dumpArray(data);
    }
  }
}