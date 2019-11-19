const WorkerWrapper = require('./worker');
const BlockWorkerWrapper = require('./blockWorker');

module.exports = (factory) => {
  const {Constants, Crypto, Block, Transaction, Inventory, ArrayOfHashes, Mutex} = factory;
  const Worker = WorkerWrapper(Mutex);
  return {
    Worker,
    BlockWorker: BlockWorkerWrapper(Transaction, Worker)
  }
};