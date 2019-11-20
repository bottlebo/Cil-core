const WorkerWrapper = require('./worker');
const BlockWorkerWrapper = require('./blockWorker');

module.exports = (factory) => {
  const {Converter, Mutex} = factory;
  const Worker = WorkerWrapper(Mutex);
  return {
    Worker,
    BlockWorker: BlockWorkerWrapper(Converter, Worker)
  }
};