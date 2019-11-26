module.exports = (DtoSerializer, Worker) => {

  return class ContractWorker extends Worker {
    constructor(options) {
      const _file = 'contracts.dump';
      const _timerName = 'contract_timer';
      super(options, _file, _timerName);

      this.options = {
        ...options
      };
    }
    async dump(arrContract) {
      //...
      const data = arrContract.map(objContract => DtoSerializer.toContractDto(objContract));
      await this._dumpArray(data);
    }
  }
}