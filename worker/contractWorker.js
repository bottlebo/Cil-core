module.exports = (DtoSerializer, Worker) => {

  return class ContractWorker extends Worker {
    constructor(options) {
      super(options, 'contracts');

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