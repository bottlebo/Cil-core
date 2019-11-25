const WorkerWrapper = require('./worker');
const BlockWorkerWrapper = require('./blockWorker');

module.exports = (factory) => {
  const {DtoSerializer, Mutex} = factory;
  const Worker = WorkerWrapper(Mutex);
  return {
    Worker,
    BlockWorker: BlockWorkerWrapper(DtoSerializer, Worker)
  }
};