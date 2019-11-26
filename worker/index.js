const WorkerWrapper = require('./worker');
const BlockWorkerWrapper = require('./blockWorker');
const UtxoWorkerWrapper = require('./utxoWorker');
const ContractWorkerWrapper = require('./contractWorker');
const ReceiptWorkerWrapper = require('./receiptWorker');

module.exports = (factory) => {
  const {DtoSerializer, Mutex} = factory;
  const Worker = WorkerWrapper(Mutex);
  return {
    Worker,
    BlockWorker: BlockWorkerWrapper(DtoSerializer, Worker),
    UtxoWorker: UtxoWorkerWrapper(DtoSerializer, Worker),
    ContractWorker: ContractWorkerWrapper(DtoSerializer, Worker),
    ReceiptWorker: ReceiptWorkerWrapper(DtoSerializer, Worker),

  }
};